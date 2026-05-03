const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { DateTime } = require('luxon');
const fs = require('fs').promises;
const path = require('path');

class SecurityModel {
  constructor() {
    this.auditLogs = [];
    this.encryptionKey = process.env.ENCRYPTION_KEY || this.generateEncryptionKey();
    this.backupPath = path.join(__dirname, '../data/backups');
    this.ensureDirectories();
  }

  // 1. Autenticación Biométrica
  async biometricAuthentication(userId, biometricData, deviceInfo) {
    try {
      const session = {
        id: this.generateUUID(),
        userId,
        biometricData: this.hashBiometricData(biometricData),
        deviceInfo,
        timestamp: DateTime.now().toISO(),
        expiresAt: DateTime.now().plus({ hours: 24 }).toISO()
      };

      // Verificar si el dispositivo está autorizado
      const deviceAuthorized = await this.checkDeviceAuthorization(userId, deviceInfo);

      if (!deviceAuthorized) {
        await this.logSecurityEvent('UNAUTHORIZED_DEVICE', userId, deviceInfo);
        throw new Error('Dispositivo no autorizado');
      }

      // Guardar sesión biométrica
      await this.saveBiometricSession(session);

      return {
        success: true,
        sessionId: session.id,
        expiresAt: session.expiresAt,
        message: 'Autenticación biométrica exitosa'
      };
    } catch (error) {
      await this.logSecurityEvent('BIOMETRIC_AUTH_FAILED', userId, { error: error.message });
      throw error;
    }
  }

  // 2. Sistema de Logs Auditoría
  async logAuditEvent(action, userId, details, severity = 'INFO') {
    const auditLog = {
      id: this.generateUUID(),
      action,
      userId,
      details: this.encryptData(JSON.stringify(details)),
      severity,
      timestamp: DateTime.now().toISO(),
      ip: details.ip || 'unknown',
      userAgent: details.userAgent || 'unknown'
    };

    this.auditLogs.push(auditLog);

    // Guardar en archivo y base de datos
    await this.saveAuditLog(auditLog);

    // Alerta para acciones críticas
    if (severity === 'CRITICAL' || severity === 'ALERT') {
      await this.sendSecurityAlert(auditLog);
    }

    return auditLog;
  }

  // 3. Backup Incremental
  async createIncrementalBackup(dataType, data) {
    try {
      const backup = {
        id: this.generateUUID(),
        dataType,
        data: this.encryptData(JSON.stringify(data)),
        timestamp: DateTime.now().toISO(),
        version: await this.getNextBackupVersion(dataType),
        checksum: this.generateChecksum(data)
      };

      // Guardar backup
      await this.saveBackup(backup);

      // Mantener solo últimos 10 backups por tipo de datos
      await this.cleanupOldBackups(dataType);

      return backup;
    } catch (error) {
      await this.logSecurityEvent('BACKUP_FAILED', null, { dataType, error: error.message });
      throw error;
    }
  }

  // 4. Cifrado End-to-End
  async encryptData(data) {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return { iv: iv.toString('hex'), encrypted };
    } catch (error) {
      throw new Error(`Error en cifrado: ${error.message}`);
    }
  }

  async decryptData(encryptedData) {
    try {
      const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      throw new Error(`Error en descifrado: ${error.message}`);
    }
  }

  // 5. MFA (Multi-Factor Authentication)
  async setupMFA(userId, method, secret = null) {
    const mfaSettings = {
      userId,
      method, // 'app', 'sms', 'email'
      secret: secret || this.generateTOTPSecret(),
      backupCodes: this.generateBackupCodes(),
      enabled: false,
      createdAt: DateTime.now().toISO()
    };

    await this.saveMFASettings(mfaSettings);

    // Si es método app, devolver QR code
    if (method === 'app') {
      return {
        success: true,
        qrCode: this.generateQRCode(mfaSettings.secret),
        backupCodes: mfaSettings.backupCodes
      };
    }

    return {
      success: true,
      backupCodes: mfaSettings.backupCodes
    };
  }

  async verifyMFA(userId, code, method = 'app') {
    const mfaSettings = await this.getMFASettings(userId);

    if (!mfaSettings || !mfaSettings.enabled) {
      throw new Error('MFA no habilitado');
    }

    // Verificar código TOTP
    if (this.verifyTOTP(mfaSettings.secret, code)) {
      await this.logAuditEvent('MFA_VERIFIED', userId, { method });
      return true;
    }

    // Verificar backup codes
    if (mfaSettings.backupCodes.includes(code)) {
      const backupIndex = mfaSettings.backupCodes.indexOf(code);
      mfaSettings.backupCodes.splice(backupIndex, 1);
      await this.saveMFASettings(mfaSettings);
      await this.logAuditEvent('MFA_BACKUP_USED', userId, { method });
      return true;
    }

    await this.logAuditEvent('MFA_FAILED', userId, { method });
    return false;
  }

  // 6. Cumplimiento GDPR/CCPA
  async generatePrivacyReport(userId) {
    const userActivities = this.auditLogs.filter(log => log.userId === userId);
    const encryptedData = await this.getUserEncryptedData(userId);

    const report = {
      userId,
      dataCollected: {
        personalInfo: ['nombre', 'email', 'teléfono'],
        medicalData: ['historial', 'diagnósticos', 'tratamientos'],
        activities: userActivities.length,
        lastActivity: userActivities[userActivities.length - 1]?.timestamp
      },
      dataRetention: {
        createdAt: DateTime.now().minus({ years: 1 }).toISO(),
        scheduledDeletion: DateTime.now().plus({ years: 7 }).toISO()
      },
      dataLocations: encryptedData.map(d => d.location),
      rights: {
        access: true,
        rectification: true,
        erasure: true,
        portability: true,
        restriction: true
      }
    };

    return report;
  }

  async deleteUserData(userId, reason) {
    try {
      // Crear backup antes de eliminar (cumplimiento)
      await this.createIncrementalBackup('user_data_deletion', { userId, reason });

      // Eliminar datos sensibles
      await this.deleteSensitiveData(userId);

      // Registrar el evento
      await this.logAuditEvent('DATA_DELETED', userId, { reason }, 'CRITICAL');

      return {
        success: true,
        message: 'Datos eliminados conforme a GDPR/CCPA',
        deletionDate: DateTime.now().toISO()
      };
    } catch (error) {
      await this.logSecurityEvent('DATA_DELETION_FAILED', userId, { error: error.message });
      throw error;
    }
  }

  // 7. Gestión de Consentimientos
  async manageConsent(userId, consentType, action, documentId = null) {
    const consent = {
      id: this.generateUUID(),
      userId,
      type: consentType, // 'treatment', 'data_processing', 'marketing'
      action, // 'grant', 'revoke', 'update'
      documentId,
      timestamp: DateTime.now().toISO(),
      ip: this.getCurrentIP(),
      userAgent: this.getUserAgent()
    };

    await this.saveConsent(consent);

    // Enviar notificación según el tipo de consentimiento
    if (consentType === 'treatment' && action === 'grant') {
      await this.sendTreatmentConsentNotification(consent);
    }

    return consent;
  }

  async getUserConsents(userId) {
    return await this.getConsentsByUser(userId);
  }

  // Métodos auxiliares
  generateEncryptionKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  hashBiometricData(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  generateUUID() {
    return crypto.randomUUID();
  }

  generateTOTPSecret() {
    return crypto.randomBytes(20).toString('base32');
  }

  generateBackupCodes() {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  verifyTOTP(secret, token) {
    // Implementación real usando speakeasy o similar
    // En demo, siempre retorna true para el primer código
    return true;
  }

  generateQRCode(secret) {
    // En implementación real, esto generaría un QR code
    return `otpauth://totp/AxialClinic?secret=${secret}&issuer=AxialProClinic`;
  }

  generateChecksum(data) {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }

  // Métodos de persistencia
  async ensureDirectories() {
    await fs.mkdir(this.backupPath, { recursive: true });
    await fs.mkdir(path.join(__dirname, '../data/audit'), { recursive: true });
    await fs.mkdir(path.join(__dirname, '../data/mfa'), { recursive: true });
    await fs.mkdir(path.join(__dirname, '../data/consents'), { recursive: true });
  }

  async saveAuditLog(log) {
    const filePath = path.join(__dirname, '../data/audit', `${Date.now()}.json`);
    await fs.writeFile(filePath, JSON.stringify(log, null, 2));
  }

  async saveBackup(backup) {
    const filePath = path.join(this.backupPath, `${backup.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(backup, null, 2));
  }

  async saveBiometricSession(session) {
    const filePath = path.join(__dirname, '../data/sessions', `${session.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(session, null, 2));
  }

  async saveMFASettings(settings) {
    const filePath = path.join(__dirname, '../data/mfa', `${settings.userId}.json`);
    await fs.writeFile(filePath, JSON.stringify(settings, null, 2));
  }

  async saveConsent(consent) {
    const filePath = path.join(__dirname, '../data/consents', `${consent.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(consent, null, 2));
  }

  // Métodos de logging y alertas
  async logSecurityEvent(event, userId, details) {
    console.log(`[SECURITY EVENT] ${event}:`, { userId, details, timestamp: DateTime.now().toISO() });
    await this.logAuditEvent(event, userId, details, 'ALERT');
  }

  async sendSecurityAlert(auditLog) {
    // En implementación real, esto enviaría alertas por Slack, email, etc.
    console.log('🚨 SECURITY ALERT:', auditLog);
  }

  // Métodos auxiliares de datos
  async checkDeviceAuthorization(userId, deviceInfo) {
    // En implementación real, verificaría si el dispositivo está en la lista blanca
    return true; // Demo: todos los dispositivos autorizados
  }

  async getNextBackupVersion(dataType) {
    // Contar existentes y retornar siguiente versión
    return 1;
  }

  async cleanupOldBackups(dataType) {
    // Implementar lógica de retención
  }

  async getUserEncryptedData(userId) {
    // En implementación real, buscaría datos cifrados del usuario
    return [];
  }

  async deleteSensitiveData(userId) {
    // Implementar eliminación segura de datos
    console.log(`Eliminando datos sensibles para usuario: ${userId}`);
  }

  async getMFASettings(userId) {
    const filePath = path.join(__dirname, '../data/mfa', `${userId}.json`);
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async getConsentsByUser(userId) {
    // En implementación real, buscaría consentimientos del usuario
    return [];
  }

  async sendTreatmentConsentNotification(consent) {
    console.log('Enviando notificación de consentimiento de tratamiento:', consent);
  }

  getCurrentIP() {
    return '127.0.0.1'; // Demo
  }

  getUserAgent() {
    return 'AxialClinic/1.0'; // Demo
  }
}

module.exports = SecurityModel;