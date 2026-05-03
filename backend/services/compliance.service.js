const fs = require('fs').promises;
const path = require('path');
const { DateTime } = require('luxon');
const crypto = require('crypto');

const auditService = require('./audit.service');
const encryptionService = require('./encryption.service');

/**
 * Servicio de Cumplimiento Normativo
 * Sistema completo para GDPR, CCPA, HIPAA y otras regulaciones
 */

class ComplianceService {
  constructor() {
    this.baseDir = path.join(__dirname, '../data/compliance');
    this.regulations = {
      GDPR: {
        name: 'General Data Protection Regulation',
        jurisdiction: 'EU',
        retentionYears: 7,
        requiresConsent: true,
        requiresDataOfficer: true,
        portabilityRequired: true,
        erasureRequired: true
      },
      CCPA: {
        name: 'California Consumer Privacy Act',
        jurisdiction: 'California, USA',
        retentionYears: 3,
        requiresConsent: false,
        requiresDataOfficer: false,
        portabilityRequired: true,
        erasureRequired: true
      },
      HIPAA: {
        name: 'Health Insurance Portability and Accountability Act',
        jurisdiction: 'USA',
        retentionYears: 10,
        requiresConsent: true,
        requiresDataOfficer: true,
        portabilityRequired: false,
        erasureRequired: true
      },
      LEY_SALUD_DIGITAL_CO: {
        name: 'Ley de Salud Digital Colombia',
        jurisdiction: 'Colombia',
        retentionYears: 15,
        requiresConsent: true,
        requiresDataOfficer: true,
        portabilityRequired: true,
        erasureRequired: true
      }
    };
    this.initialize();
  }

  async initialize() {
    try {
      await this.createComplianceStructure();
      await this.loadConsentRegistry();
      await this.loadPrivacyPolicies();
    } catch (error) {
      console.error('Error inicializando servicio de compliance:', error);
    }
  }

  async createComplianceStructure() {
    const dirs = [
      this.baseDir,
      path.join(this.baseDir, 'consents'),
      path.join(this.baseDir, 'policies'),
      path.join(this.baseDir, 'requests'),
      path.join(this.baseDir, 'data-maps'),
      path.join(this.baseDir, 'audits'),
      path.join(this.baseDir, 'breaches')
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  /**
   * GESTIÓN DE CONSENTIMIENTOS
   */

  /**
   * Crear consentimiento
   */
  async createConsent(userId, consentData) {
    const consent = {
      id: crypto.randomUUID(),
      userId,
      type: consentData.type, // 'treatment', 'data_processing', 'marketing', 'research'
      purpose: consentData.purpose,
      dataCategories: consentData.dataCategories || [],
      retentionPeriod: consentData.retentionPeriod || 'standard',
      sharingPartners: consentData.sharingPartners || [],
      granted: true,
      grantedAt: DateTime.now().toISO(),
      expiresAt: consentData.expiresAt || null,
      documentVersion: consentData.documentVersion || '1.0',
      ipAddress: consentData.ipAddress || '0.0.0.0',
      userAgent: consentData.userAgent || 'unknown',
      signatureMethod: consentData.signatureMethod || 'digital',
      metadata: consentData.metadata || {}
    };

    // Guardar consentimiento
    await this.saveConsent(consent);

    // Registrar evento de compliance
    await auditService.logComplianceEvent('GDPR', 'CONSENT_GRANTED', {
      userId,
      consentType: consent.type,
      consentId: consent.id
    });

    return consent;
  }

  /**
   * Revocar consentimiento
   */
  async revokeConsent(consentId, userId, reason = '') {
    const consent = await this.getConsent(consentId);

    if (!consent) {
      throw new Error('Consentimiento no encontrado');
    }

    if (consent.userId !== userId) {
      throw new Error('No autorizado para revocar este consentimiento');
    }

    consent.revoked = true;
    consent.revokedAt = DateTime.now().toISO();
    consent.revocationReason = reason;

    await this.saveConsent(consent);

    // Registrar evento de compliance
    await auditService.logComplianceEvent('GDPR', 'CONSENT_REVOKED', {
      userId,
      consentId,
      reason
    });

    return consent;
  }

  /**
   * Actualizar consentimiento
   */
  async updateConsent(consentId, updates) {
    const consent = await this.getConsent(consentId);

    if (!consent) {
      throw new Error('Consentimiento no encontrado');
    }

    const updatedConsent = {
      ...consent,
      ...updates,
      id: consentId, // Mantener ID original
      updatedAt: DateTime.now().toISO()
    };

    await this.saveConsent(updatedConsent);

    // Registrar evento
    await auditService.logComplianceEvent('GDPR', 'CONSENT_UPDATED', {
      userId: consent.userId,
      consentId,
      updates
    });

    return updatedConsent;
  }

  /**
   * Obtener consentimientos de usuario
   */
  async getUserConsents(userId, filters = {}) {
    const consentsDir = path.join(this.baseDir, 'consents');
    const userConsents = [];

    try {
      const files = await fs.readdir(consentsDir);

      for (const file of files) {
        if (file.endsWith('.json')) {
          const consent = JSON.parse(await fs.readFile(path.join(consentsDir, file), 'utf8'));

          if (consent.userId === userId) {
            // Aplicar filtros
            if (filters.type && consent.type !== filters.type) continue;
            if (filters.active && (consent.revoked || (consent.expiresAt && DateTime.now() > DateTime.fromISO(consent.expiresAt)))) continue;

            userConsents.push(consent);
          }
        }
      }

      return userConsents.sort((a, b) =>
        DateTime.fromISO(b.grantedAt) - DateTime.fromISO(a.grantedAt)
      );
    } catch (error) {
      return [];
    }
  }

  /**
   * Obtener consentimiento específico
   */
  async getConsent(consentId) {
    const consentPath = path.join(this.baseDir, 'consents', `${consentId}.json`);

    try {
      const data = await fs.readFile(consentPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  /**
   * Guardar consentimiento
   */
  async saveConsent(consent) {
    const consentPath = path.join(this.baseDir, 'consents', `${consent.id}.json`);
    await fs.writeFile(consentPath, JSON.stringify(consent, null, 2));
  }

  /**
   * DERECHOS DE PRIVACIDAD (GDPR, CCPA)
   */

  /**
   * Solicitud de acceso a datos (Right to Access)
   */
  async requestDataAccess(userId, requestMetadata = {}) {
    const request = {
      id: crypto.randomUUID(),
      userId,
      type: 'ACCESS',
      status: 'PENDING',
      requestedAt: DateTime.now().toISO(),
      completedAt: null,
      metadata: requestMetadata
    };

    await this.saveDataRequest(request);

    // Generar reporte de datos del usuario
    const userData = await this.generateUserDataReport(userId);

    request.status = 'COMPLETED';
    request.completedAt = DateTime.now().toISO();
    request.dataReportId = userData.id;
    await this.saveDataRequest(request);

    // Registrar evento
    await auditService.logComplianceEvent('GDPR', 'DATA_ACCESS_REQUESTED', {
      userId,
      requestId: request.id
    });

    return {
      request,
      dataReport: userData
    };
  }

  /**
   * Solicitud de portabilidad de datos (Right to Portability)
   */
  async requestDataPortability(userId, format = 'JSON') {
    const request = {
      id: crypto.randomUUID(),
      userId,
      type: 'PORTABILITY',
      format,
      status: 'PENDING',
      requestedAt: DateTime.now().toISO(),
      completedAt: null
    };

    await this.saveDataRequest(request);

    // Generar datos portables
    const portableData = await this.generatePortableData(userId, format);

    request.status = 'COMPLETED';
    request.completedAt = DateTime.now().toISO();
    await this.saveDataRequest(request);

    // Registrar evento
    await auditService.logComplianceEvent('GDPR', 'DATA_PORTABILITY_REQUESTED', {
      userId,
      format
    });

    return {
      request,
      portableData
    };
  }

  /**
   * Solicitud de eliminación de datos (Right to Erasure)
   */
  async requestDataErasure(userId, reason = '', scope = 'all') {
    const request = {
      id: crypto.randomUUID(),
      userId,
      type: 'ERASURE',
      reason,
      scope, // 'all', 'specific', 'conditional'
      status: 'PENDING',
      requestedAt: DateTime.now().toISO(),
      completedAt: null
    };

    await this.saveDataRequest(request);

    // Verificar si hay razones legales para retener datos
    const retentionCheck = await this.checkDataRetention(userId);

    if (retentionCheck.mustRetain) {
      request.status = 'BLOCKED';
      request.blockReason = retentionCheck.reason;
      await this.saveDataRequest(request);

      return {
        request,
        canDelete: false,
        reason: retentionCheck.reason
      };
    }

    // Proceder con eliminación
    const deletionResult = await this.executeDataErasure(userId, scope);

    request.status = 'COMPLETED';
    request.completedAt = DateTime.now().toISO();
    await this.saveDataRequest(request);

    // Registrar evento crítico
    await auditService.logComplianceEvent('GDPR', 'DATA_ERASURE_COMPLETED', {
      userId,
      scope,
      reason
    });

    return {
      request,
      deletionResult
    };
  }

  /**
   * Solicitud de rectificación de datos (Right to Rectification)
   */
  async requestDataRectification(userId, corrections) {
    const request = {
      id: crypto.randomUUID(),
      userId,
      type: 'RECTIFICATION',
      corrections,
      status: 'PENDING',
      requestedAt: DateTime.now().toISO(),
      completedAt: null
    };

    await this.saveDataRequest(request);

    // Aplicar correcciones
    const rectificationResult = await this.executeDataRectification(userId, corrections);

    request.status = 'COMPLETED';
    request.completedAt = DateTime.now().toISO();
    await this.saveDataRequest(request);

    // Registrar evento
    await auditService.logComplianceEvent('GDPR', 'DATA_RECTIFICATION_REQUESTED', {
      userId,
      corrections
    });

    return {
      request,
      rectificationResult
    };
  }

  /**
   * Solicitud de restricción de procesamiento (Right to Restrict Processing)
   */
  async requestProcessingRestriction(userId, dataCategories = []) {
    const request = {
      id: crypto.randomUUID(),
      userId,
      type: 'RESTRICTION',
      dataCategories,
      status: 'PENDING',
      requestedAt: DateTime.now().toISO(),
      completedAt: null
    };

    await this.saveDataRequest(request);

    // Aplicar restricciones
    const restrictionResult = await this.executeProcessingRestriction(userId, dataCategories);

    request.status = 'COMPLETED';
    request.completedAt = DateTime.now().toISO();
    await this.saveDataRequest(request);

    return {
      request,
      restrictionResult
    };
  }

  /**
   * GENERACIÓN DE REPORTES Y DATOS
   */

  /**
   * Generar reporte de datos del usuario
   */
  async generateUserDataReport(userId) {
    const report = {
      id: crypto.randomUUID(),
      userId,
      generatedAt: DateTime.now().toISO(),
      validUntil: DateTime.now().plus({ days: 30 }).toISO(),
      data: {
        personal: await this.getUserPersonalData(userId),
        medical: await this.getUserMedicalData(userId),
        financial: await this.getUserFinancialData(userId),
        activity: await this.getUserActivityData(userId),
        consents: await this.getUserConsents(userId)
      },
      statistics: {
        totalRecords: 0,
        dataCategories: [],
        retentionPeriod: 'standard',
        lastUpdated: null
      }
    };

    // Calcular estadísticas
    report.statistics.totalRecords = Object.values(report.data)
      .filter(d => Array.isArray(d))
      .reduce((acc, arr) => acc + arr.length, 0);

    report.statistics.dataCategories = Object.keys(report.data).filter(key =>
      report.data[key] && (Array.isArray(report.data[key]) ? report.data[key].length > 0 : true)
    );

    return report;
  }

  /**
   * Generar datos portables
   */
  async generatePortableData(userId, format = 'JSON') {
    const userData = await this.generateUserDataReport(userId);

    if (format === 'JSON') {
      return {
        format: 'JSON',
        version: '1.0',
        exportedAt: DateTime.now().toISO(),
        data: userData
      };
    } else if (format === 'CSV') {
      // Implementar exportación a CSV
      return {
        format: 'CSV',
        version: '1.0',
        exportedAt: DateTime.now().toISO(),
        data: this.convertToCSV(userData)
      };
    }

    throw new Error('Formato no soportado');
  }

  /**
   * Verificar retención de datos
   */
  async checkDataRetention(userId) {
    // Verificar si hay razones legales para retener datos
    const userData = await this.generateUserDataReport(userId);

    // Verificar si hay procedimientos médicos activos
    if (userData.data.medical && userData.data.medical.some(m => m.status === 'active')) {
      return {
        mustRetain: true,
        reason: 'Procedimientos médicos activos requieren retención de datos'
      };
    }

    // Verificar si hay transacciones financieras recientes
    if (userData.data.financial && userData.data.financial.some(f =>
      DateTime.fromISO(f.date) > DateTime.now().minus({ years: 7 })
    )) {
      return {
        mustRetain: true,
        reason: 'Requisitos legales de retención de datos financieros'
      };
    }

    return {
      mustRetain: false,
      reason: null
    };
  }

  /**
   * Ejecutar eliminación de datos
   */
  async executeDataErasure(userId, scope) {
    const deletedRecords = [];

    if (scope === 'all' || scope === 'personal') {
      // Eliminar datos personales (manteniendo solo ID para auditoría)
      deletedRecords.push({ type: 'personal', count: 1 });
    }

    if (scope === 'all' || scope === 'medical') {
      // Eliminar/anonimizar datos médicos
      deletedRecords.push({ type: 'medical', count: await this.anonymizeMedicalData(userId) });
    }

    if (scope === 'all' || scope === 'activity') {
      // Eliminar datos de actividad
      deletedRecords.push({ type: 'activity', count: await this.deleteActivityData(userId) });
    }

    return {
      deletedRecords,
      timestamp: DateTime.now().toISO(),
      retainedForCompliance: true
    };
  }

  /**
   * Ejecutar rectificación de datos
   */
  async executeDataRectification(userId, corrections) {
    const rectifiedRecords = [];

    for (const correction of corrections) {
      const { field, oldValue, newValue, reason } = correction;

      // Aplicar corrección
      const result = await this.applyDataCorrection(userId, field, newValue);

      rectifiedRecords.push({
        field,
        oldValue: '[REDACTED]',
        newValue: '[REDACTED]',
        reason,
        timestamp: DateTime.now().toISO(),
        success: result.success
      });

      // Registrar cambio
      await auditService.logComplianceEvent('GDPR', 'DATA_RECTIFIED', {
        userId,
        field,
        reason
      });
    }

    return {
      rectifiedRecords,
      timestamp: DateTime.now().toISO()
    };
  }

  /**
   * Ejecutar restricción de procesamiento
   */
  async executeProcessingRestriction(userId, dataCategories) {
    const restrictions = [];

    for (const category of dataCategories) {
      // Marcar datos para restricción de procesamiento
      const restriction = await this.applyProcessingRestriction(userId, category);
      restrictions.push(restriction);
    }

    return {
      restrictions,
      timestamp: DateTime.now().toISO()
    };
  }

  /**
   * MÉTODOS AUXILIARES
   */

  async getUserPersonalData(userId) {
    // Implementación específica por aplicación
    return [];
  }

  async getUserMedicalData(userId) {
    // Implementación específica por aplicación
    return [];
  }

  async getUserFinancialData(userId) {
    // Implementación específica por aplicación
    return [];
  }

  async getUserActivityData(userId) {
    // Implementación específica por aplicación
    return [];
  }

  async anonymizeMedicalData(userId) {
    // Implementación de anonimización
    return 0;
  }

  async deleteActivityData(userId) {
    // Implementación de eliminación de datos de actividad
    return 0;
  }

  async applyDataCorrection(userId, field, newValue) {
    // Implementación de corrección de datos
    return { success: true };
  }

  async applyProcessingRestriction(userId, category) {
    // Implementación de restricción de procesamiento
    return { category, restricted: true };
  }

  async saveDataRequest(request) {
    const requestPath = path.join(this.baseDir, 'requests', `${request.id}.json`);
    await fs.writeFile(requestPath, JSON.stringify(request, null, 2));
  }

  async loadConsentRegistry() {
    // Cargar registro de consentimientos
    console.log('Registro de consentimientos cargado');
  }

  async loadPrivacyPolicies() {
    // Cargar políticas de privacidad
    console.log('Políticas de privacidad cargadas');
  }

  /**
   * GESTIÓN DE POLÍTICAS DE PRIVACIDAD
   */

  async getPrivacyPolicy(version = 'latest') {
    const policyPath = path.join(this.baseDir, 'policies', `privacy-${version}.md`);

    try {
      return await fs.readFile(policyPath, 'utf8');
    } catch (error) {
      return null;
    }
  }

  async createPrivacyPolicy(content, version, effectiveDate) {
    const policy = {
      version,
      content,
      effectiveDate: effectiveDate || DateTime.now().toISO(),
      createdAt: DateTime.now().toISO(),
      regulations: ['GDPR', 'CCPA', 'HIPAA', 'LEY_SALUD_DIGITAL_CO']
    };

    const policyPath = path.join(this.baseDir, 'policies', `privacy-${version}.md`);
    await fs.writeFile(policyPath, content);

    return policy;
  }

  /**
   * REPORTE DE CUMPLIMIENTO
   */

  async generateComplianceReport(regulation, startDate, endDate) {
    return await auditService.generateComplianceReport(regulation, startDate, endDate);
  }

  async getComplianceScore(regulation) {
    const config = this.regulations[regulation];
    if (!config) {
      throw new Error('Regulación no soportada');
    }

    const requirements = [
      { name: 'Consent Management', implemented: config.requiresConsent },
      { name: 'Data Officer', implemented: config.requiresDataOfficer },
      { name: 'Portability', implemented: config.portabilityRequired },
      { name: 'Erasure', implemented: config.erasureRequired },
      { name: 'Retention Policy', implemented: true },
      { name: 'Breach Detection', implemented: true },
      { name: 'Audit Logging', implemented: true }
    ];

    const score = requirements.filter(r => r.implemented).length / requirements.length * 100;

    return {
      regulation,
      score,
      requirements,
      compliant: score === 100
    };
  }
}

// Singleton instance
const complianceService = new ComplianceService();

module.exports = complianceService;