const express = require('express');
const router = express.Router();
const auditService = require('../services/audit.service');
const encryptionService = require('../services/encryption.service');
const backupService = require('../services/backup.service');
const mfaService = require('../services/mfa.service');
const complianceService = require('../services/compliance.service');
const {
  authenticate,
  authorize,
  requirePermission,
  authRateLimit,
  apiRateLimit,
  sensitiveRateLimit,
  securityLogger
} = require('../middlewares/auth.middleware');

/**
 * RUTAS DE SEGURIDAD - FASE 6
 * Sistema profesional y escalable de seguridad
 */

// 📋 AUDITORÍA Y LOGS
router.get('/audit/logs', authenticate, requirePermission('audit_read'), async (req, res) => {
  try {
    const {
      action,
      userId,
      severity,
      category,
      startDate,
      endDate,
      limit = 100,
      offset = 0
    } = req.query;

    const result = await auditService.searchEvents({
      action,
      userId,
      severity,
      category,
      startDate,
      endDate,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener logs de auditoría'
    });
  }
});

router.post('/audit/logs', authenticate, requirePermission('audit_write'), async (req, res) => {
  try {
    const { action, details, severity = 'INFO', category = 'GENERAL' } = req.body;
    const userId = req.user.id;

    const event = await auditService.logEvent({
      action,
      userId,
      details,
      severity,
      category,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear log de auditoría'
    });
  }
});

router.get('/audit/stats', authenticate, authorize('admin'), async (req, res) => {
  try {
    const stats = await auditService.getSecurityStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de seguridad'
    });
  }
});

router.post('/audit/compliance-report', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { regulation, startDate, endDate } = req.body;

    const report = await auditService.generateComplianceReport(regulation, startDate, endDate);

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte de cumplimiento'
    });
  }
});

// 🔐 CIFRADO DE DATOS
router.post('/encrypt', authenticate, apiRateLimit, async (req, res) => {
  try {
    const { data, additionalData = null } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'Datos requeridos para cifrar'
      });
    }

    const encrypted = encryptionService.encrypt(JSON.stringify(data), additionalData);

    res.json({
      success: true,
      data: encrypted
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cifrar datos'
    });
  }
});

router.post('/decrypt', authenticate, apiRateLimit, async (req, res) => {
  try {
    const { encrypted, additionalData = null } = req.body;

    if (!encrypted || !encrypted.encrypted) {
      return res.status(400).json({
        success: false,
        message: 'Datos cifrados requeridos'
      });
    }

    const decrypted = encryptionService.decrypt(encrypted, additionalData);
    const data = JSON.parse(decrypted);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al descifrar datos'
    });
  }
});

router.post('/encrypt/medical', authenticate, requirePermission('medical_data_encrypt'), async (req, res) => {
  try {
    const { data, patientId } = req.body;

    if (!data || !patientId) {
      return res.status(400).json({
        success: false,
        message: 'Datos y patientId requeridos'
      });
    }

    const encrypted = encryptionService.encryptMedicalData(data, patientId);

    res.json({
      success: true,
      data: encrypted
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cifrar datos médicos'
    });
  }
});

// 💾 BACKUP SYSTEM
router.post('/backup/create', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { dataType, data, type = 'full', metadata = {} } = req.body;

    if (!dataType || !data) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de datos y contenido requeridos'
      });
    }

    let backup;
    if (type === 'full') {
      backup = await backupService.createFullBackup(dataType, data, metadata);
    } else if (type === 'incremental') {
      const { lastBackupId, changes } = req.body;
      backup = await backupService.createIncrementalBackup(dataType, data, changes, lastBackupId);
    }

    // Registrar evento
    await auditService.logDataEvent('BACKUP', dataType, backup.id, req.user.id);

    res.json({
      success: true,
      data: backup
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear backup'
    });
  }
});

router.get('/backup/list', authenticate, authorize('admin'), async (req, res) => {
  try {
    const statistics = await backupService.getBackupStatistics();

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al listar backups'
    });
  }
});

router.post('/backup/restore/:backupId', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { backupId } = req.params;
    const { targetPath } = req.body;

    const restoredData = await backupService.restoreBackup(backupId, targetPath);

    // Registrar evento
    await auditService.logDataEvent('RESTORE', 'backup', backupId, req.user.id);

    res.json({
      success: true,
      data: restoredData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al restaurar backup'
    });
  }
});

router.post('/backup/verify', authenticate, authorize('admin'), async (req, res) => {
  try {
    const verification = await backupService.verifyAllBackups();

    res.json({
      success: true,
      data: verification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al verificar backups'
    });
  }
});

// 🔑 MULTI-FACTOR AUTHENTICATION (MFA)
router.post('/mfa/setup', authenticate, authRateLimit, async (req, res) => {
  try {
    const { method = 'app', options = {} } = req.body;
    const userId = req.user.id;

    const result = await mfaService.setupMFA(userId, method, options);

    // Registrar evento
    await auditService.logSecurityEvent('MFA_SETUP_INITIATED', {
      userId,
      method
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al configurar MFA'
    });
  }
});

router.post('/mfa/verify', authenticate, authRateLimit, async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Código MFA requerido'
      });
    }

    const result = await mfaService.verifyMFASetup(userId, code);

    if (result.success) {
      await auditService.logSecurityEvent('MFA_SETUP_VERIFIED', { userId });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al verificar MFA'
    });
  }
});

router.post('/mfa/verify-code', authenticate, authRateLimit, async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Código MFA requerido'
      });
    }

    const result = await mfaService.verifyMFACode(userId, code);

    if (result.success) {
      await auditService.logSecurityEvent('MFA_VERIFICATION_SUCCESS', { userId });
    } else {
      await auditService.logSecurityEvent('MFA_VERIFICATION_FAILED', {
        userId,
        message: result.message
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al verificar código MFA'
    });
  }
});

router.get('/mfa/status', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const status = await mfaService.getMFAStatus(userId);

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estado MFA'
    });
  }
});

router.post('/mfa/disable', authenticate, sensitiveRateLimit, async (req, res) => {
  try {
    const { verificationCode } = req.body;
    const userId = req.user.id;

    const result = await mfaService.disableMFA(userId, verificationCode);

    // Registrar evento crítico
    await auditService.logSecurityEvent('MFA_DISABLED', {
      userId,
      verified: !!verificationCode
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al deshabilitar MFA'
    });
  }
});

router.post('/mfa/regenerate-codes', authenticate, sensitiveRateLimit, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await mfaService.regenerateBackupCodes(userId);

    // Registrar evento
    await auditService.logSecurityEvent('MFA_BACKUP_CODES_REGENERATED', { userId });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al regenerar códigos de respaldo'
    });
  }
});

router.post('/mfa/new-code', authenticate, authRateLimit, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await mfaService.generateNewVerificationCode(userId);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al generar nuevo código'
    });
  }
});

router.get('/mfa/statistics', authenticate, authorize('admin'), async (req, res) => {
  try {
    const stats = await mfaService.getMFAStatistics();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas MFA'
    });
  }
});

// 📊 CUMPLIMIENTO (GDPR, CCPA, HIPAA)
router.post('/compliance/consents', authenticate, apiRateLimit, async (req, res) => {
  try {
    const consentData = {
      ...req.body,
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    };

    const consent = await complianceService.createConsent(req.user.id, consentData);

    res.json({
      success: true,
      data: consent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear consentimiento'
    });
  }
});

router.get('/compliance/consents', authenticate, async (req, res) => {
  try {
    const { type, active } = req.query;
    const userId = req.user.id;

    // Solo admins pueden ver consentimientos de otros usuarios
    if (req.user.role !== 'admin' && req.query.userId && req.query.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para ver consentimientos de otros usuarios'
      });
    }

    const targetUserId = req.query.userId || userId;
    const consents = await complianceService.getUserConsents(targetUserId, { type, active });

    res.json({
      success: true,
      data: consents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener consentimientos'
    });
  }
});

router.put('/compliance/consents/:consentId', authenticate, apiRateLimit, async (req, res) => {
  try {
    const { consentId } = req.params;
    const updates = req.body;

    const consent = await complianceService.updateConsent(consentId, updates);

    res.json({
      success: true,
      data: consent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar consentimiento'
    });
  }
});

router.delete('/compliance/consents/:consentId', authenticate, sensitiveRateLimit, async (req, res) => {
  try {
    const { consentId } = req.params;
    const { reason } = req.body;

    const consent = await complianceService.revokeConsent(consentId, req.user.id, reason);

    res.json({
      success: true,
      data: consent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al revocar consentimiento'
    });
  }
});

router.post('/compliance/data-access', authenticate, apiRateLimit, async (req, res) => {
  try {
    const userId = req.user.id;

    // Solo usuarios pueden solicitar sus propios datos, o admins
    if (req.user.role !== 'admin' && req.body.userId && req.body.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para solicitar datos de otros usuarios'
      });
    }

    const targetUserId = req.body.userId || userId;
    const result = await complianceService.requestDataAccess(targetUserId, req.body.metadata);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al solicitar acceso a datos'
    });
  }
});

router.post('/compliance/data-portability', authenticate, apiRateLimit, async (req, res) => {
  try {
    const userId = req.user.id;
    const { format = 'JSON' } = req.body;

    const result = await complianceService.requestDataPortability(userId, format);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al solicitar portabilidad de datos'
    });
  }
});

router.delete('/compliance/data/:userId', authenticate, authorize('admin'), sensitiveRateLimit, async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, scope = 'all' } = req.body;

    const result = await complianceService.requestDataErasure(userId, reason, scope);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al solicitar eliminación de datos'
    });
  }
});

router.post('/compliance/privacy-report', authenticate, apiRateLimit, async (req, res) => {
  try {
    const userId = req.user.id;

    const report = await complianceService.generateUserDataReport(userId);

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte de privacidad'
    });
  }
});

router.get('/compliance/score/:regulation', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { regulation } = req.params;

    const score = await complianceService.getComplianceScore(regulation);

    res.json({
      success: true,
      data: score
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener puntuación de cumplimiento'
    });
  }
});

// 🚨 ALERTAS DE SEGURIDAD
router.post('/alerts/security', authenticate, requirePermission('security_alerts'), async (req, res) => {
  try {
    const { eventId, severity, message, details = {} } = req.body;

    await auditService.logSecurityEvent(eventId, {
      ...details,
      message,
      userId: req.user.id
    }, severity);

    res.json({
      success: true,
      message: 'Alerta de seguridad registrada'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al registrar alerta de seguridad'
    });
  }
});

// 📈 DASHBOARD DE SEGURIDAD
router.get('/dashboard/overview', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [auditStats, mfaStats, backupStats] = await Promise.all([
      auditService.getSecurityStats(),
      mfaService.getMFAStatistics(),
      backupService.getBackupStatistics()
    ]);

    const overview = {
      audit: auditStats,
      mfa: mfaStats,
      backup: backupStats,
      compliance: {
        gdpr: await complianceService.getComplianceScore('GDPR'),
        hipaa: await complianceService.getComplianceScore('HIPAA'),
        ccpa: await complianceService.getComplianceScore('CCPA')
      },
      generatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener overview de seguridad'
    });
  }
});

module.exports = router;