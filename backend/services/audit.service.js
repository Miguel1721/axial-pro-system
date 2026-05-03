const fs = require('fs').promises;
const path = require('path');
const { DateTime } = require('luxon');
const crypto = require('crypto');

/**
 * Servicio de Auditoría y Logging
 * Sistema escalable con rotación de logs, niveles de severidad y almacenamiento distribuido
 */

class AuditService {
  constructor() {
    this.baseDir = path.join(__dirname, '../data/audit');
    this.currentLog = [];
    this.maxLogSize = 1000; // Máximo de eventos en memoria antes de flush
    this.logRotation = true;
    this.retentionDays = 90;
    this.initialize();
  }

  async initialize() {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
      await this.createLogStructure();

      // Cargar logs existentes si hay
      await this.loadExistingLogs();

      // Iniciar flush periódico
      this.startPeriodicFlush();
    } catch (error) {
      console.error('Error inicializando servicio de auditoría:', error);
    }
  }

  async createLogStructure() {
    const dirs = [
      path.join(this.baseDir, 'daily'),
      path.join(this.baseDir, 'alerts'),
      path.join(this.baseDir, 'archive'),
      path.join(this.baseDir, 'compliance')
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  async loadExistingLogs() {
    try {
      const today = DateTime.now().toISODate();
      const logPath = path.join(this.baseDir, 'daily', `${today}.jsonl`);

      const data = await fs.readFile(logPath, 'utf8');
      const lines = data.split('\n').filter(line => line.trim());

      this.currentLog = lines.map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      }).filter(log => log !== null);
    } catch (error) {
      this.currentLog = [];
    }
  }

  startPeriodicFlush() {
    setInterval(() => {
      this.flushToDisk();
    }, 30000); // Flush cada 30 segundos
  }

  /**
   * Registrar evento de auditoría principal
   */
  async logEvent({
    action,
    userId,
    details = {},
    severity = 'INFO',
    category = 'GENERAL',
    ip = null,
    userAgent = null,
    metadata = {}
  }) {
    const event = {
      id: crypto.randomUUID(),
      timestamp: DateTime.now().toISO(),
      action,
      userId: userId || 'anonymous',
      details: this.sanitizeDetails(details),
      severity: this.validateSeverity(severity),
      category: this.validateCategory(category),
      ip: ip || this.getClientIP(),
      userAgent: userAgent || 'unknown',
      metadata,
      sessionId: this.getCurrentSessionId(),
      requestId: crypto.randomUUID()
    };

    this.currentLog.push(event);

    // Si es evento crítico o alerta, notificar inmediatamente
    if (['CRITICAL', 'ALERT'].includes(severity)) {
      await this.handleCriticalEvent(event);
    }

    // Flush inmediato si alcanzamos el tamaño máximo
    if (this.currentLog.length >= this.maxLogSize) {
      await this.flushToDisk();
    }

    return event;
  }

  /**
   * Eventos de seguridad específicos
   */
  async logSecurityEvent(eventType, details, severity = 'ALERT') {
    return await this.logEvent({
      action: `SECURITY_${eventType}`,
      category: 'SECURITY',
      severity,
      details: {
        ...details,
        eventType
      }
    });
  }

  /**
   * Eventos de acceso (login, logout, etc)
   */
  async logAccessEvent(action, userId, success, details = {}) {
    return await this.logEvent({
      action: `AUTH_${action}`,
      category: 'AUTH',
      severity: success ? 'INFO' : 'WARNING',
      userId,
      details: {
        success,
        ...details
      }
    });
  }

  /**
   * Eventos de compliance (GDPR, HIPAA, etc)
   */
  async logComplianceEvent(regulation, action, details) {
    return await this.logEvent({
      action: `COMPLIANCE_${regulation}_${action}`,
      category: 'COMPLIANCE',
      severity: 'CRITICAL',
      details: {
        regulation,
        complianceAction: action,
        ...details
      }
    });
  }

  /**
   * Eventos de datos (acceso, modificación, eliminación)
   */
  async logDataEvent(operation, dataType, recordId, userId, details = {}) {
    return await this.logEvent({
      action: `DATA_${operation}`,
      category: 'DATA',
      severity: operation === 'DELETE' ? 'CRITICAL' : 'INFO',
      userId,
      details: {
        operation,
        dataType,
        recordId,
        ...details
      }
    });
  }

  /**
   * Buscar eventos con filtros avanzados
   */
  async searchEvents(filters = {}) {
    const {
      action,
      userId,
      severity,
      category,
      startDate,
      endDate,
      limit = 100,
      offset = 0
    } = filters;

    let events = this.currentLog;

    if (action) {
      events = events.filter(e => e.action === action);
    }
    if (userId) {
      events = events.filter(e => e.userId === userId);
    }
    if (severity) {
      events = events.filter(e => e.severity === severity);
    }
    if (category) {
      events = events.filter(e => e.category === category);
    }
    if (startDate) {
      events = events.filter(e => e.timestamp >= startDate);
    }
    if (endDate) {
      events = events.filter(e => e.timestamp <= endDate);
    }

    const total = events.length;
    const paginated = events.slice(offset, offset + limit);

    return {
      events: paginated,
      total,
      limit,
      offset
    };
  }

  /**
   * Generar reporte de auditoría para compliance
   */
  async generateComplianceReport(regulation, startDate, endDate) {
    const events = await this.searchEvents({
      category: 'COMPLIANCE',
      startDate,
      endDate,
      limit: 100000
    });

    const report = {
      regulation,
      period: { startDate, endDate },
      summary: {
        totalEvents: events.events.length,
        bySeverity: this.groupBy(events.events, 'severity'),
        byAction: this.groupBy(events.events, 'action'),
        topUsers: this.getTopUsers(events.events, 10)
      },
      violations: events.events.filter(e => e.severity === 'CRITICAL'),
      recommendations: this.generateComplianceRecommendations(events.events),
      generatedAt: DateTime.now().toISO()
    };

    return report;
  }

  /**
   * Estadísticas de seguridad en tiempo real
   */
  async getSecurityStats() {
    const now = DateTime.now();
    const last24h = now.minus({ hours: 24 }).toISO();
    const last1h = now.minus({ hours: 1 }).toISO();

    const recentEvents = this.currentLog.filter(e => e.timestamp >= last24h);

    return {
      totalEvents: this.currentLog.length,
      last24h: {
        total: recentEvents.length,
        critical: recentEvents.filter(e => e.severity === 'CRITICAL').length,
        alerts: recentEvents.filter(e => e.severity === 'ALERT').length,
        warnings: recentEvents.filter(e => e.severity === 'WARNING').length
      },
      last1h: {
        total: this.currentLog.filter(e => e.timestamp >= last1h).length
      },
      activeSessions: this.getActiveSessionsCount(),
      topActions: this.getTopActions(recentEvents, 5),
      riskScore: this.calculateRiskScore(recentEvents)
    };
  }

  /**
   * Manejo de eventos críticos
   */
  async handleCriticalEvent(event) {
    // Guardar en archivo separado para alertas
    await this.saveAlert(event);

    // Enviar notificaciones (integración con sistema de notificaciones)
    await this.sendAlertNotification(event);

    // Crear entry en log de compliance
    await this.saveComplianceLog(event);
  }

  /**
   * Flush a disco
   */
  async flushToDisk() {
    if (this.currentLog.length === 0) return;

    try {
      const today = DateTime.now().toISODate();
      const logPath = path.join(this.baseDir, 'daily', `${today}.jsonl`);

      const lines = this.currentLog.map(event => JSON.stringify(event)).join('\n');
      await fs.appendFile(logPath, lines + '\n');

      // Limpiar memoria después del flush
      this.currentLog = [];
    } catch (error) {
      console.error('Error haciendo flush a disco:', error);
    }
  }

  /**
   * Rotación de logs antigüos
   */
  async rotateOldLogs() {
    const retentionDate = DateTime.now().minus({ days: this.retentionDays });

    try {
      const files = await fs.readdir(path.join(this.baseDir, 'daily'));

      for (const file of files) {
        const match = file.match(/^(\d{4}-\d{2}-\d{2})\.jsonl$/);
        if (match) {
          const fileDate = DateTime.fromISO(match[1]);

          if (fileDate < retentionDate) {
            // Archivar en lugar de eliminar
            await this.archiveLogFile(file, fileDate);
          }
        }
      }
    } catch (error) {
      console.error('Error rotando logs:', error);
    }
  }

  /**
   * Métodos auxiliares
   */
  sanitizeDetails(details) {
    const sanitized = { ...details };

    // Remover información sensible
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'pin'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  validateSeverity(severity) {
    const validSeverities = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL', 'ALERT'];
    return validSeverities.includes(severity) ? severity : 'INFO';
  }

  validateCategory(category) {
    const validCategories = ['GENERAL', 'AUTH', 'SECURITY', 'DATA', 'COMPLIANCE', 'PERFORMANCE'];
    return validCategories.includes(category) ? category : 'GENERAL';
  }

  getClientIP() {
    // En implementación real, esto vendría de la solicitud
    return '0.0.0.0';
  }

  getCurrentSessionId() {
    // En implementación real, esto vendría del middleware de sesión
    return crypto.randomUUID();
  }

  groupBy(events, field) {
    return events.reduce((acc, event) => {
      const key = event[field];
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  getTopUsers(events, limit) {
    const userCounts = this.groupBy(events, 'userId');
    return Object.entries(userCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([userId, count]) => ({ userId, count }));
  }

  getTopActions(events, limit) {
    const actionCounts = this.groupBy(events, 'action');
    return Object.entries(actionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([action, count]) => ({ action, count }));
  }

  calculateRiskScore(events) {
    const weights = {
      CRITICAL: 10,
      ALERT: 7,
      WARNING: 3,
      ERROR: 5,
      INFO: 0.5
    };

    const score = events.reduce((acc, event) => {
      return acc + (weights[event.severity] || 0);
    }, 0);

    return Math.min(100, score / 10); // Normalizado a 0-100
  }

  getActiveSessionsCount() {
    // En implementación real, esto vendría del servicio de sesiones
    return 0;
  }

  generateComplianceRecommendations(events) {
    const recommendations = [];

    const criticalCount = events.filter(e => e.severity === 'CRITICAL').length;
    if (criticalCount > 10) {
      recommendations.push('Considerar revisión de políticas de seguridad debido a alto número de eventos críticos');
    }

    const failedAuthEvents = events.filter(e => e.action.includes('FAILED')).length;
    if (failedAuthEvents > 50) {
      recommendations.push('Implementar bloqueos temporales tras múltiples intentos fallidos');
    }

    return recommendations;
  }

  async saveAlert(event) {
    const alertPath = path.join(this.baseDir, 'alerts', `${event.id}.json`);
    await fs.writeFile(alertPath, JSON.stringify(event, null, 2));
  }

  async sendAlertNotification(event) {
    // Integración con sistema de notificaciones
    console.log('🚨 ALERTA DE SEGURIDAD:', event);
  }

  async saveComplianceLog(event) {
    const compliancePath = path.join(this.baseDir, 'compliance', `${event.id}.json`);
    await fs.writeFile(compliancePath, JSON.stringify(event, null, 2));
  }

  async archiveLogFile(filename, fileDate) {
    const sourcePath = path.join(this.baseDir, 'daily', filename);
    const archiveDir = path.join(this.baseDir, 'archive', fileDate.toFormat('yyyy-MM'));
    const targetPath = path.join(archiveDir, filename);

    await fs.mkdir(archiveDir, { recursive: true });
    await fs.rename(sourcePath, targetPath);
  }
}

// Singleton instance
const auditService = new AuditService();

module.exports = auditService;