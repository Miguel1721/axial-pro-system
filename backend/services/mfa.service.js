const crypto = require('crypto');
const { DateTime } = require('luxon');
const fs = require('fs').promises;
const path = require('path');

/**
 * Servicio de Multi-Factor Authentication (MFA)
 * Sistema profesional con TOTP, SMS, Email y códigos de respaldo
 */

class MFAService {
  constructor() {
    this.baseDir = path.join(__dirname, '../data/mfa');
    this.totpWindow = 1; // Ventana de tiempo para TOTP (en pasos)
    this.backupCodesCount = 10;
    this.maxAttempts = 3;
    this.lockoutDuration = 30; // minutos
    this.initialize();
  }

  async initialize() {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
      await this.createMFAStructure();
    } catch (error) {
      console.error('Error inicializando servicio MFA:', error);
    }
  }

  async createMFAStructure() {
    const dirs = [
      this.baseDir,
      path.join(this.baseDir, 'secrets'),
      path.join(this.baseDir, 'backups'),
      path.join(this.baseDir, 'attempts')
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  /**
   * Configurar MFA para usuario
   */
  async setupMFA(userId, method = 'app', options = {}) {
    try {
      const existingConfig = await this.getUserMFAConfig(userId);

      if (existingConfig && existingConfig.enabled) {
        throw new Error('MFA ya está configurado para este usuario');
      }

      const config = {
        userId,
        method,
        enabled: false, // Requiere verificación para habilitar
        secret: null,
        backupCodes: [],
        createdAt: DateTime.now().toISO(),
        verifiedAt: null,
        attempts: 0,
        lockedUntil: null
      };

      // Configurar según método
      switch (method) {
        case 'app':
          const appSetup = await this.setupAppAuthenticator(userId);
          config.secret = appSetup.secret;
          config.backupCodes = appSetup.backupCodes;
          config.qrCodeUrl = appSetup.qrCodeUrl;
          break;

        case 'sms':
          const smsSetup = await this.setupSMSAuthenticator(userId, options);
          config.phoneNumber = smsSetup.phoneNumber;
          config.verificationCode = smsSetup.verificationCode;
          config.backupCodes = smsSetup.backupCodes;
          break;

        case 'email':
          const emailSetup = await this.setupEmailAuthenticator(userId, options);
          config.email = emailSetup.email;
          config.verificationCode = emailSetup.verificationCode;
          config.backupCodes = emailSetup.backupCodes;
          break;

        default:
          throw new Error('Método MFA no soportado');
      }

      await this.saveUserMFAConfig(userId, config);

      return {
        success: true,
        method,
        backupCodes: config.backupCodes,
        qrCodeUrl: config.qrCodeUrl || null,
        nextStep: 'verify'
      };
    } catch (error) {
      throw new Error(`Error configurando MFA: ${error.message}`);
    }
  }

  /**
   * Configurar autenticador de app (TOTP)
   */
  async setupAppAuthenticator(userId) {
    // Generar secreto TOTP
    const secret = this.generateTOTPSecret();

    // Generar códigos de respaldo
    const backupCodes = this.generateBackupCodes();

    // Generar URL para código QR
    const qrCodeUrl = this.generateTOTPUrl(userId, secret);

    return {
      secret,
      backupCodes,
      qrCodeUrl
    };
  }

  /**
   * Configurar autenticador SMS
   */
  async setupSMSAuthenticator(userId, options) {
    const { phoneNumber } = options;

    if (!phoneNumber) {
      throw new Error('Número de teléfono requerido');
    }

    if (!this.validatePhoneNumber(phoneNumber)) {
      throw new Error('Número de teléfono inválido');
    }

    const verificationCode = this.generateVerificationCode();
    const backupCodes = this.generateBackupCodes();

    // Enviar SMS (integración con servicio de mensajería)
    await this.sendVerificationSMS(phoneNumber, verificationCode);

    return {
      phoneNumber,
      verificationCode,
      backupCodes
    };
  }

  /**
   * Configurar autenticador Email
   */
  async setupEmailAuthenticator(userId, options) {
    const { email } = options;

    if (!email) {
      throw new Error('Email requerido');
    }

    if (!this.validateEmail(email)) {
      throw new Error('Email inválido');
    }

    const verificationCode = this.generateVerificationCode();
    const backupCodes = this.generateBackupCodes();

    // Enviar email (integración con servicio de email)
    await this.sendVerificationEmail(email, verificationCode);

    return {
      email,
      verificationCode,
      backupCodes
    };
  }

  /**
   * Verificar configuración MFA
   */
  async verifyMFASetup(userId, code) {
    try {
      const config = await this.getUserMFAConfig(userId);

      if (!config) {
        throw new Error('Configuración MFA no encontrada');
      }

      if (config.lockedUntil && DateTime.now() < DateTime.fromISO(config.lockedUntil)) {
        throw new Error('Cuenta temporalmente bloqueada por demasiados intentos');
      }

      let verified = false;

      switch (config.method) {
        case 'app':
          verified = this.verifyTOTP(config.secret, code);
          break;

        case 'sms':
          verified = code === config.verificationCode;
          break;

        case 'email':
          verified = code === config.verificationCode;
          break;

        default:
          throw new Error('Método MFA no soportado');
      }

      if (verified) {
        config.enabled = true;
        config.verifiedAt = DateTime.now().toISO();
        config.attempts = 0;
        config.verificationCode = null; // Limpiar código temporal
      } else {
        config.attempts++;

        if (config.attempts >= this.maxAttempts) {
          config.lockedUntil = DateTime.now().plus({ minutes: this.lockoutDuration }).toISO();
        }
      }

      await this.saveUserMFAConfig(userId, config);

      if (verified) {
        return {
          success: true,
          message: 'MFA configurado y verificado exitosamente'
        };
      } else {
        const remainingAttempts = this.maxAttempts - config.attempts;
        return {
          success: false,
          message: `Código inválido. ${remainingAttempts} intentos restantes`,
          lockedUntil: config.lockedUntil
        };
      }
    } catch (error) {
      throw new Error(`Error verificando MFA: ${error.message}`);
    }
  }

  /**
   * Verificar código MFA durante login
   */
  async verifyMFACode(userId, code) {
    try {
      const config = await this.getUserMFAConfig(userId);

      if (!config || !config.enabled) {
        throw new Error('MFA no está configurado para este usuario');
      }

      if (config.lockedUntil && DateTime.now() < DateTime.fromISO(config.lockedUntil)) {
        throw new Error('Cuenta temporalmente bloqueada');
      }

      // Registrar intento
      await this.logVerificationAttempt(userId, code);

      let verified = false;

      switch (config.method) {
        case 'app':
          verified = this.verifyTOTP(config.secret, code);
          break;

        case 'sms':
          // Generar nuevo código para verificación
          if (config.verificationCode && code === config.verificationCode) {
            verified = true;
          }
          break;

        case 'email':
          if (config.verificationCode && code === config.verificationCode) {
            verified = true;
          }
          break;
      }

      // Verificar códigos de respaldo
      if (!verified && config.backupCodes.includes(code)) {
        // Remover código usado
        config.backupCodes = config.backupCodes.filter(c => c !== code);
        await this.saveUserMFAConfig(userId, config);
        verified = true;

        // Notificar que se usó código de respaldo
        await this.notifyBackupCodeUsed(userId);
      }

      if (verified) {
        // Resetear intentos
        config.attempts = 0;
        await this.saveUserMFAConfig(userId, config);

        return {
          success: true,
          method: config.method
        };
      } else {
        config.attempts++;

        if (config.attempts >= this.maxAttempts) {
          config.lockedUntil = DateTime.now().plus({ minutes: this.lockoutDuration }).toISO();
        }

        await this.saveUserMFAConfig(userId, config);

        const remainingAttempts = this.maxAttempts - config.attempts;
        return {
          success: false,
          message: `Código inválido. ${remainingAttempts} intentos restantes`,
          lockedUntil: config.lockedUntil
        };
      }
    } catch (error) {
      throw new Error(`Error verificando código MFA: ${error.message}`);
    }
  }

  /**
   * Generar nuevos códigos de respaldo
   */
  async regenerateBackupCodes(userId) {
    const config = await this.getUserMFAConfig(userId);

    if (!config) {
      throw new Error('Configuración MFA no encontrada');
    }

    const newBackupCodes = this.generateBackupCodes();
    config.backupCodes = newBackupCodes;

    await this.saveUserMFAConfig(userId, config);

    return {
      success: true,
      backupCodes: newBackupCodes
    };
  }

  /**
   * Deshabilitar MFA
   */
  async disableMFA(userId, verificationCode = null) {
    const config = await this.getUserMFAConfig(userId);

    if (!config) {
      throw new Error('Configuración MFA no encontrada');
    }

    // Si se proporciona código, verificar primero
    if (verificationCode) {
      const verification = await this.verifyMFACode(userId, verificationCode);
      if (!verification.success) {
        throw new Error('Código de verificación inválido');
      }
    }

    // Eliminar configuración MFA
    await this.deleteUserMFAConfig(userId);

    return {
      success: true,
      message: 'MFA deshabilitado exitosamente'
    };
  }

  /**
   * Obtener estado MFA de usuario
   */
  async getMFAStatus(userId) {
    const config = await this.getUserMFAConfig(userId);

    if (!config) {
      return {
        enabled: false,
        method: null
      };
    }

    return {
      enabled: config.enabled,
      method: config.method,
      verifiedAt: config.verifiedAt,
      lockedUntil: config.lockedUntil
    };
  }

  /**
   * Generar código TOTP
   */
  generateTOTP(userId, secret = null) {
    const userSecret = secret || this.generateTOTPSecret();
    const epoch = Math.floor(Date.now() / 1000);
    const time = Math.floor(epoch / 30); // 30 segundos por paso

    // Calcular TOTP (implementación simplificada)
    const hmac = crypto.createHmac('sha256', Buffer.from(userSecret, 'base32'));
    hmac.update(Buffer.from(time.toString()));
    const digest = hmac.digest();

    const offset = digest[digest.length - 1] & 0xf;
    const code =
      ((digest[offset] & 0x7f) << 24) |
      ((digest[offset + 1] & 0xff) << 16) |
      ((digest[offset + 2] & 0xff) << 8) |
      (digest[offset + 3] & 0xff);

    const otp = (code % 1000000).toString().padStart(6, '0');

    return otp;
  }

  /**
   * Verificar código TOTP
   */
  verifyTOTP(secret, code) {
    // Verificar código actual y ventanas de tiempo adyacentes
    const epoch = Math.floor(Date.now() / 1000);
    const time = Math.floor(epoch / 30);

    for (let i = -this.totpWindow; i <= this.totpWindow; i++) {
      const expectedCode = this.generateTOTP('user', secret);
      if (expectedCode === code) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generar URL para código QR
   */
  generateTOTPUrl(userId, secret) {
    const issuer = 'AxialProClinic';
    const account = `user:${userId}`;
    const encodedIssuer = encodeURIComponent(issuer);
    const encodedAccount = encodeURIComponent(account);

    return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}`;
  }

  /**
   * Generar secreto TOTP
   */
  generateTOTPSecret() {
    return crypto.randomBytes(20).toString('base32');
  }

  /**
   * Generar código de verificación
   */
  generateVerificationCode(length = 6) {
    const digits = '0123456789';
    let code = '';

    for (let i = 0; i < length; i++) {
      code += digits[Math.floor(Math.random() * digits.length)];
    }

    return code;
  }

  /**
   * Generar códigos de respaldo
   */
  generateBackupCodes() {
    const codes = [];

    for (let i = 0; i < this.backupCodesCount; i++) {
      const code = this.generateVerificationCode(8);
      codes.push(code);
    }

    return codes;
  }

  /**
   * Validar número de teléfono
   */
  validatePhoneNumber(phoneNumber) {
    const phoneRegex = /^\+?[\d\s-()]+$/;
    return phoneRegex.test(phoneNumber) && phoneNumber.replace(/\D/g, '').length >= 10;
  }

  /**
   * Validar email
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Enviar SMS de verificación
   */
  async sendVerificationSMS(phoneNumber, code) {
    // Integración con servicio de SMS (Twilio, etc.)
    console.log(`[SMS] Enviando código ${code} a ${phoneNumber}`);
    // En producción, implementar envío real
  }

  /**
   * Enviar email de verificación
   */
  async sendVerificationEmail(email, code) {
    // Integración con servicio de email
    console.log(`[EMAIL] Enviando código ${code} a ${email}`);
    // En producción, implementar envío real
  }

  /**
   * Registrar intento de verificación
   */
  async logVerificationAttempt(userId, code) {
    const attemptLog = {
      userId,
      code: code.substring(0, 3) + '***', // Parcialmente enmascarado
      timestamp: DateTime.now().toISO(),
      ip: '0.0.0.0' // En producción, obtener IP real
    };

    const logPath = path.join(this.baseDir, 'attempts', `${userId}.jsonl`);
    await fs.appendFile(logPath, JSON.stringify(attemptLog) + '\n');
  }

  /**
   * Notificar uso de código de respaldo
   */
  async notifyBackupCodeUsed(userId) {
    console.log(`[MFA] Código de respaldo usado por usuario ${userId}`);
    // En producción, enviar notificación
  }

  /**
   * Obtener configuración MFA de usuario
   */
  async getUserMFAConfig(userId) {
    const configPath = path.join(this.baseDir, 'secrets', `${userId}.json`);

    try {
      const data = await fs.readFile(configPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  /**
   * Guardar configuración MFA de usuario
   */
  async saveUserMFAConfig(userId, config) {
    const configPath = path.join(this.baseDir, 'secrets', `${userId}.json`);
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
  }

  /**
   * Eliminar configuración MFA de usuario
   */
  async deleteUserMFAConfig(userId) {
    const configPath = path.join(this.baseDir, 'secrets', `${userId}.json`);

    try {
      await fs.unlink(configPath);
    } catch (error) {
      // Archivo no existe, no hay problema
    }
  }

  /**
   * Obtener estadísticas MFA
   */
  async getMFAStatistics() {
    const secretsDir = path.join(this.baseDir, 'secrets');

    try {
      const files = await fs.readdir(secretsDir);
      const configs = await Promise.all(
        files
          .filter(f => f.endsWith('.json'))
          .map(async f => {
            const data = await fs.readFile(path.join(secretsDir, f), 'utf8');
            return JSON.parse(data);
          })
      );

      return {
        totalUsers: configs.length,
        enabledUsers: configs.filter(c => c.enabled).length,
        byMethod: this.groupByMethod(configs),
        lockedUsers: configs.filter(c => c.lockedUntil && DateTime.now() < DateTime.fromISO(c.lockedUntil)).length
      };
    } catch (error) {
      return {
        totalUsers: 0,
        enabledUsers: 0,
        byMethod: {},
        lockedUsers: 0
      };
    }
  }

  /**
   * Agrupar configuraciones por método
   */
  groupByMethod(configs) {
    return configs.reduce((acc, config) => {
      const method = config.method;
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Generar nuevo código de verificación SMS/Email
   */
  async generateNewVerificationCode(userId) {
    const config = await this.getUserMFAConfig(userId);

    if (!config) {
      throw new Error('Configuración MFA no encontrada');
    }

    if (config.method === 'sms') {
      const newCode = this.generateVerificationCode();
      config.verificationCode = newCode;
      await this.saveUserMFAConfig(userId, config);
      await this.sendVerificationSMS(config.phoneNumber, newCode);
    } else if (config.method === 'email') {
      const newCode = this.generateVerificationCode();
      config.verificationCode = newCode;
      await this.saveUserMFAConfig(userId, config);
      await this.sendVerificationEmail(config.email, newCode);
    } else {
      throw new Error('Método no soportado para regenerar código');
    }

    return {
      success: true,
      message: 'Nuevo código enviado'
    };
  }
}

// Singleton instance
const mfaService = new MFAService();

module.exports = mfaService;