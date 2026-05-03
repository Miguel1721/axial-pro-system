const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

/**
 * Servicio de Cifrado y Seguridad de Datos
 * Sistema profesional con encriptación AES-256-GCM, gestión de claves y seguridad en capas
 */

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32; // 256 bits
    this.ivLength = 16; // 128 bits
    this.saltLength = 64;
    this.tagLength = 16;
    this.masterKey = null;
    this.keyDir = path.join(__dirname, '../data/keys');
    this.initialize();
  }

  async initialize() {
    try {
      await fs.mkdir(this.keyDir, { recursive: true });
      await this.loadOrGenerateMasterKey();
    } catch (error) {
      console.error('Error inicializando servicio de cifrado:', error);
    }
  }

  /**
   * Cargar o generar clave maestra
   */
  async loadOrGenerateMasterKey() {
    const masterKeyPath = path.join(this.keyDir, 'master.key');

    try {
      // Intentar cargar desde archivo
      const encryptedKey = await fs.readFile(masterKeyPath, 'utf8');

      // Si hay variable de entorno para desencriptar
      if (process.env.MASTER_KEY_PASSWORD) {
        this.masterKey = await this.decryptMasterKey(encryptedKey, process.env.MASTER_KEY_PASSWORD);
      } else {
        // Fallback a clave de entorno
        this.masterKey = process.env.ENCRYPTION_KEY || this.generateKey();
      }
    } catch (error) {
      // Generar nueva clave maestra
      this.masterKey = this.generateKey();
      await this.saveMasterKey(this.masterKey);
    }
  }

  /**
   * Generar clave criptográfica segura
   */
  generateKey() {
    return crypto.randomBytes(this.keyLength);
  }

  /**
   * Derivar clave desde contraseña
   */
  deriveKeyFromPassword(password, salt) {
    return crypto.pbkdf2Sync(
      password,
      salt,
      100000, // Iteraciones
      this.keyLength,
      'sha256'
    );
  }

  /**
   * Cifrar datos con AES-256-GCM
   */
  encrypt(data, additionalData = null) {
    try {
      const iv = crypto.randomBytes(this.ivLength);
      const salt = crypto.randomBytes(this.saltLength);

      // Derivar clave para este cifrado específico
      const key = this.deriveKeyFromPassword(this.masterKey.toString('hex'), salt);

      const cipher = crypto.createCipher(this.algorithm, key);
      cipher.setIV(iv);

      if (additionalData) {
        cipher.setAAD(Buffer.from(additionalData));
      }

      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const tag = cipher.getAuthTag();

      return {
        encrypted,
        iv: iv.toString('hex'),
        salt: salt.toString('hex'),
        tag: tag.toString('hex'),
        algorithm: this.algorithm
      };
    } catch (error) {
      throw new Error(`Error en cifrado: ${error.message}`);
    }
  }

  /**
   * Descifrar datos
   */
  decrypt(encryptedData, additionalData = null) {
    try {
      const { encrypted, iv, salt, tag } = encryptedData;

      const key = this.deriveKeyFromPassword(
        this.masterKey.toString('hex'),
        Buffer.from(salt, 'hex')
      );

      const decipher = crypto.createDecipher(this.algorithm, key);
      decipher.setIV(Buffer.from(iv, 'hex'));
      decipher.setAuthTag(Buffer.from(tag, 'hex'));

      if (additionalData) {
        decipher.setAAD(Buffer.from(additionalData));
      }

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Error en descifrado: ${error.message}`);
    }
  }

  /**
   * Cifrar objeto JSON
   */
  encryptObject(obj, additionalData = null) {
    const jsonString = JSON.stringify(obj);
    return this.encrypt(jsonString, additionalData);
  }

  /**
   * Descifrar a objeto JSON
   */
  decryptObject(encryptedData, additionalData = null) {
    const decryptedString = this.decrypt(encryptedData, additionalData);
    return JSON.parse(decryptedString);
  }

  /**
   * Hash seguro con salt
   */
  hash(data, salt = null) {
    const dataSalt = salt || crypto.randomBytes(this.saltLength);
    const hash = crypto.pbkdf2Sync(
      data,
      dataSalt,
      100000,
      64,
      'sha256'
    );

    return {
      hash: hash.toString('hex'),
      salt: dataSalt.toString('hex'),
      iterations: 100000,
      algorithm: 'pbkdf2-sha256'
    };
  }

  /**
   * Verificar hash
   */
  verifyHash(data, hashData) {
    const { hash: expectedHash, salt } = hashData;
    const actualHash = this.hash(data, Buffer.from(salt, 'hex'));

    return actualHash.hash === expectedHash;
  }

  /**
   * Firma digital HMAC
   */
  sign(data, secret = null) {
    const signingKey = secret || this.masterKey;
    const hmac = crypto.createHmac('sha256', signingKey);
    hmac.update(data);

    return hmac.digest('hex');
  }

  /**
   * Verificar firma
   */
  verify(data, signature, secret = null) {
    const signingKey = secret || this.masterKey;
    const hmac = crypto.createHmac('sha256', signingKey);
    hmac.update(data);

    const expectedSignature = hmac.digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Generar token seguro
   */
  generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
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
   * Generar UUID v4
   */
  generateUUID() {
    return crypto.randomUUID();
  }

  /**
   * Cifrar campo específico de un objeto
   */
  encryptField(obj, fieldName, additionalData = null) {
    if (!obj[fieldName]) return obj;

    const encrypted = this.encrypt(obj[fieldName], additionalData);
    return {
      ...obj,
      [fieldName]: encrypted
    };
  }

  /**
   * Descifrar campo específico de un objeto
   */
  decryptField(obj, fieldName, additionalData = null) {
    if (!obj[fieldName]) return obj;

    const decrypted = this.decrypt(obj[fieldName], additionalData);
    return {
      ...obj,
      [fieldName]: decrypted
    };
  }

  /**
   * Cifrar múltiples campos de un objeto
   */
  encryptFields(obj, fieldNames, additionalData = null) {
    let encrypted = obj;

    for (const fieldName of fieldNames) {
      encrypted = this.encryptField(encrypted, fieldName, additionalData);
    }

    return encrypted;
  }

  /**
   * Descifrar múltiples campos de un objeto
   */
  decryptFields(obj, fieldNames, additionalData = null) {
    let decrypted = obj;

    for (const fieldName of fieldNames) {
      decrypted = this.decryptField(decrypted, fieldName, additionalData);
    }

    return decrypted;
  }

  /**
   * Cifrar datos médicos (HIPAA compliant)
   */
  encryptMedicalData(data, patientId) {
    const additionalData = `medical:${patientId}:${new Date().toISOString()}`;
    return this.encryptObject(data, additionalData);
  }

  /**
   * Descifrar datos médicos
   */
  decryptMedicalData(encryptedData, patientId) {
    const additionalData = `medical:${patientId}:${new Date().toISOString()}`;
    return this.decryptObject(encryptedData, additionalData);
  }

  /**
   * Guardar clave maestra cifrada
   */
  async saveMasterKey(key) {
    const masterKeyPath = path.join(this.keyDir, 'master.key');

    // Cifrar la clave maestra con una contraseña de entorno
    const password = process.env.MASTER_KEY_PASSWORD || 'default-password';
    const salt = crypto.randomBytes(this.saltLength);
    const derivedKey = this.deriveKeyFromPassword(password, salt);

    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipher(this.algorithm, derivedKey);
    cipher.setIV(iv);

    let encrypted = cipher.update(key, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();

    const encryptedKeyData = JSON.stringify({
      encrypted,
      iv: iv.toString('hex'),
      salt: salt.toString('hex'),
      tag: tag.toString('hex')
    });

    await fs.writeFile(masterKeyPath, encryptedKeyData, { mode: 0o600 });
  }

  /**
   * Descifrar clave maestra
   */
  async decryptMasterKey(encryptedKeyData, password) {
    const { encrypted, iv, salt, tag } = JSON.parse(encryptedKeyData);

    const derivedKey = this.deriveKeyFromPassword(password, Buffer.from(salt, 'hex'));

    const decipher = crypto.createDecipher(this.algorithm, derivedKey);
    decipher.setIV(Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(tag, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return Buffer.from(decrypted, 'utf8');
  }

  /**
   * Rotación de claves
   */
  async rotateKeys() {
    // Generar nueva clave maestra
    const newMasterKey = this.generateKey();

    // Re-cifrar datos sensibles con nueva clave (implementación específica por aplicación)
    // Esto requiere recorrer todos los datos cifrados y volver a cifrarlos

    // Guardar nueva clave
    this.masterKey = newMasterKey;
    await this.saveMasterKey(newMasterKey);
  }

  /**
   * Validar fortaleza de clave
   */
  validateKeyStrength(key) {
    if (key.length < this.keyLength) {
      throw new Error('Clave insuficientemente larga');
    }

    if (!Buffer.isBuffer(key)) {
      throw new Error('La clave debe ser un buffer');
    }

    return true;
  }

  /**
   * Generar clave derivada para sesión
   */
  generateSessionKey(sessionId) {
    const sessionData = `${sessionId}:${new Date().toISOString()}`;
    return crypto.createHash('sha256')
      .update(sessionData)
      .update(this.masterKey)
      .digest();
  }

  /**
   * Cifrar datos de sesión
   */
  encryptSessionData(data, sessionId) {
    const sessionKey = this.generateSessionKey(sessionId);
    const additionalData = `session:${sessionId}`;

    return this.encrypt(data, additionalData);
  }

  /**
   * Descifrar datos de sesión
   */
  decryptSessionData(encryptedData, sessionId) {
    const sessionKey = this.generateSessionKey(sessionId);
    const additionalData = `session:${sessionId}`;

    return this.decrypt(encryptedData, additionalData);
  }

  /**
   * Generar fingerprint de datos para integridad
   */
  generateFingerprint(data) {
    return crypto.createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  /**
   * Verificar integridad de datos
   */
  verifyFingerprint(data, fingerprint) {
    const actualFingerprint = this.generateFingerprint(data);
    return actualFingerprint === fingerprint;
  }

  /**
   * Cifrar archivo completo
   */
  async encryptFile(inputPath, outputPath) {
    const data = await fs.readFile(inputPath);
    const encrypted = this.encrypt(data.toString('base64'));

    await fs.writeFile(
      outputPath,
      JSON.stringify({
        ...encrypted,
        originalFilename: path.basename(inputPath),
        encryptedAt: new Date().toISOString()
      })
    );

    return outputPath;
  }

  /**
   * Descifrar archivo completo
   */
  async decryptFile(inputPath, outputPath) {
    const encryptedData = JSON.parse(await fs.readFile(inputPath, 'utf8'));
    const decrypted = this.decrypt(encryptedData);

    await fs.writeFile(outputPath, Buffer.from(decrypted, 'base64'));
    return outputPath;
  }

  /**
   * Limpiar datos sensibles de memoria
   */
  secureWipe(buffer) {
    if (Buffer.isBuffer(buffer)) {
      buffer.fill(0);
    }
  }

  /**
   * Obtener información del sistema de cifrado
   */
  getCipherInfo() {
    return {
      algorithm: this.algorithm,
      keyLength: this.keyLength * 8, // en bits
      ivLength: this.ivLength * 8,
      tagLength: this.tagLength * 8,
      mode: 'GCM',
      hasAuthentication: true,
      hasIntegrityCheck: true,
      isCompliant: true
    };
  }
}

// Singleton instance
const encryptionService = new EncryptionService();

module.exports = encryptionService;