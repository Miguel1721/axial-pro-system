/**
 * Servicio de Analytics para Axial Pro Clinic
 * Tracking de métricas de uso, errores y rendimiento
 */

const fs = require('fs').promises;
const path = require('path');

class AnalyticsService {
  constructor() {
    this.dataDir = path.join(__dirname, '..', 'data', 'analytics');
    this.ensureDataDirectory();

    // Métricas en memoria para acceso rápido
    this.metrics = {
      users: {
        total: 0,
        active: 0,
        byRole: {},
        daily: []
      },
      sessions: {
        total: 0,
        averageDuration: 0,
        failed: 0
      },
      performance: {
        avgResponseTime: 0,
        errorRate: 0,
        uptime: 0
      },
      features: {
        usage: {},
        popular: []
      },
      errors: {
        total: 0,
        byType: {},
        recent: []
      }
    };

    // Inicialización
    this.loadStoredMetrics();
  }

  async ensureDataDirectory() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      console.error('Error creating analytics data directory:', error);
    }
  }

  async loadStoredMetrics() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const todayFile = path.join(this.dataDir, `metrics_${today}.json`);

      if (await this.fileExists(todayFile)) {
        const data = await fs.readFile(todayFile, 'utf8');
        const parsedData = JSON.parse(data);
        this.metrics = { ...this.metrics, ...parsedData };
      }
    } catch (error) {
      console.error('Error loading stored metrics:', error);
    }
  }

  async saveMetrics() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const todayFile = path.join(this.dataDir, `metrics_${today}.json`);

      await fs.writeFile(todayFile, JSON.stringify(this.metrics, null, 2));
    } catch (error) {
      console.error('Error saving metrics:', error);
    }
  }

  // Track de usuarios
  trackUser(userId, role, action = 'login') {
    const now = new Date();

    // Métricas generales
    this.metrics.users.total++;
    this.metrics.users.active++;

    // Por rol
    if (!this.metrics.users.byRole[role]) {
      this.metrics.users.byRole[role] = 0;
    }
    this.metrics.users.byRole[role]++;

    // Diarias
    const today = now.toISOString().split('T')[0];
    const todayEntry = this.metrics.users.daily.find(d => d.date === today);
    if (todayEntry) {
      todayEntry.logins++;
      todayEntry.uniqueUsers.add(userId);
    } else {
      this.metrics.users.daily.push({
        date: today,
        logins: 1,
        uniqueUsers: new Set([userId]),
        sessions: []
      });
    }
  }

  // Track de sesiones
  trackSession(userId, duration, success = true) {
    this.metrics.sessions.total++;

    if (success) {
      this.metrics.sessions.averageDuration =
        (this.metrics.sessions.averageDuration + duration) / 2;
    } else {
      this.metrics.sessions.failed++;
    }

    // Actualizar entrada diaria
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = this.metrics.users.daily.find(d => d.date === today);
    if (todayEntry) {
      todayEntry.sessions.push({
        userId,
        duration,
        success,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Track de rendimiento
  trackPerformance(responseTime, success = true) {
    this.metrics.performance.avgResponseTime =
      (this.metrics.performance.avgResponseTime + responseTime) / 2;

    if (!success) {
      this.metrics.performance.errorRate++;
    }

    // Uptime (calculado como porcentaje)
    this.metrics.performance.uptime = this.calculateUptime();
  }

  // Track de funcionalidades
  trackFeatureUsage(feature, userId) {
    if (!this.metrics.features.usage[feature]) {
      this.metrics.features.usage[feature] = 0;
    }
    this.metrics.features.usage[feature]++;

    // Actualizar populares
    const features = Object.entries(this.metrics.features.usage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    this.metrics.features.popular = features;
  }

  // Track de errores
  trackError(error, context = {}) {
    this.metrics.errors.total++;

    const errorType = error.name || error.type || 'Unknown';
    if (!this.metrics.errors.byType[errorType]) {
      this.metrics.errors.byType[errorType] = 0;
    }
    this.metrics.errors.byType[errorType]++;

    // Errores recientes (últimos 100)
    this.metrics.errors.recent.unshift({
      timestamp: new Date().toISOString(),
      error: error.message || error,
      context,
      type: errorType
    });

    if (this.metrics.errors.recent.length > 100) {
      this.metrics.errors.recent = this.metrics.errors.recent.slice(0, 100);
    }
  }

  // Reportes y dashboards
  async getReport(type = 'daily', days = 7) {
    const reports = {
      daily: await this.getDailyReport(days),
      weekly: await this.getWeeklyReport(),
      monthly: await this.getMonthlyReport(),
      features: this.getFeatureReport(),
      errors: this.getErrorReport(),
      performance: this.getPerformanceReport()
    };

    return reports[type] || reports.daily;
  }

  async getDailyReport(days) {
    const reports = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const entry = this.metrics.users.daily.find(d => d.date === dateStr);
      const dailyData = {
        date: dateStr,
        logins: entry?.logins || 0,
        uniqueUsers: entry?.uniqueUsers?.size || 0,
        sessions: entry?.sessions?.length || 0,
        avgSessionDuration: entry?.sessions
          ? entry.sessions.reduce((sum, s) => sum + s.duration, 0) / entry.sessions.length
          : 0,
        errors: this.metrics.errors.recent.filter(e =>
          e.timestamp.startsWith(dateStr)
        ).length
      };

      reports.push(dailyData);
    }

    return reports;
  }

  getFeatureReport() {
    return {
      total: Object.keys(this.metrics.features.usage).length,
      usage: this.metrics.features.usage,
      popular: this.metrics.features.popular,
      leastUsed: Object.entries(this.metrics.features.usage)
        .sort(([,a], [,b]) => a - b)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }))
    };
  }

  getErrorReport() {
    return {
      total: this.metrics.errors.total,
      byType: this.metrics.errors.byType,
      recent: this.metrics.errors.recent.slice(0, 10),
      trend: this.calculateErrorTrend()
    };
  }

  getPerformanceReport() {
    return {
      avgResponseTime: this.metrics.performance.avgResponseTime,
      errorRate: this.metrics.performance.errorRate,
      uptime: this.metrics.performance.uptime,
      weeklyTrend: this.calculatePerformanceTrend()
    };
  }

  // Métricas específicas del sistema médico
  trackMedicalEvent(event, data) {
    switch (event) {
      case 'cita_creada':
        this.trackFeatureUsage('citas', data.medicoId);
        break;
      case 'turno_atendido':
        this.trackFeatureUsage('turnos', data.recepcionistaId);
        break;
      case 'medicamento_recetado':
        this.trackFeatureUsage('recetas', data.medicoId);
        break;
      case 'alerta_stock':
        this.trackFeatureUsage('alertas', data.adminId);
        break;
      case 'video_llamada':
        this.trackFeatureUsage('telemedicina', data.pacienteId);
        break;
    }
  }

  // Helpers
  calculateUptime() {
    // Simulación de cálculo de uptime
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const uptime = Math.min(99.9, 99.5 + Math.random() * 0.4);
    return uptime;
  }

  calculateErrorTrend() {
    const recent = this.metrics.errors.recent.slice(0, 50);
    const older = this.metrics.errors.recent.slice(50, 100);

    const recentRate = recent.length;
    const olderRate = older.length;

    if (olderRate === 0) return 'stable';
    if (recentRate > olderRate * 1.2) return 'increasing';
    if (recentRate < olderRate * 0.8) return 'decreasing';
    return 'stable';
  }

  calculatePerformanceTrend() {
    // Simulación de tendencia de rendimiento
    const baseTime = 200;
    const variation = Math.sin(Date.now() / 86400000) * 50;
    return Math.max(100, baseTime + variation);
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  // Cleanup automático
  async cleanup(daysToKeep = 30) {
    try {
      const files = await fs.readdir(this.dataDir);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysToKeep);

      for (const file of files) {
        if (file.startsWith('metrics_')) {
          const filePath = path.join(this.dataDir, file);
          const stats = await fs.stat(filePath);

          if (stats.mtime < cutoff) {
            await fs.unlink(filePath);
          }
        }
      }
    } catch (error) {
      console.error('Error during analytics cleanup:', error);
    }
  }
}

module.exports = AnalyticsService;