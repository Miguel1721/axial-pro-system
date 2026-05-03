const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const { DateTime } = require('luxon');

/**
 * Middleware de Autenticación y Autorización
 * Sistema escalable con JWT, rate limiting y validación de roles
 */

// Configuración de JWT
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex'),
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
};

// Rate limiting por endpoint para prevenir ataques
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 5) => {
  return rateLimit({
    windowMs,
    max,
    message: { success: false, message: 'Demasiados intentos. Intente más tarde.' },
    standardHeaders: true,
    legacyHeaders: false
  });
};

// Rate limiters específicos
const authRateLimit = createRateLimiter(15 * 60 * 1000, 5); // 5 intentos cada 15 min
const apiRateLimit = createRateLimiter(60 * 1000, 100); // 100 requests cada minuto
const sensitiveRateLimit = createRateLimiter(60 * 60 * 1000, 3); // 3 intentos por hora

/**
 * Middleware de autenticación JWT
 * Valida el token y附加用户信息 a req.user
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación no proporcionado'
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_CONFIG.secret);
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        permissions: decoded.permissions || []
      };
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expirado',
          code: 'TOKEN_EXPIRED'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
        code: 'TOKEN_INVALID'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error en autenticación'
    });
  }
};

/**
 * Middleware de autorización por roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para este recurso'
      });
    }

    next();
  };
};

/**
 * Middleware de autorización por permisos específicos
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    if (req.user.role === 'admin') {
      return next();
    }

    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: 'Permiso insuficiente'
      });
    }

    next();
  };
};

/**
 * Middleware de autenticación opcional
 * No falla si no hay token, pero附加用户信息 si existe
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        const decoded = jwt.verify(token, JWT_CONFIG.secret);
        req.user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          permissions: decoded.permissions || []
        };
      } catch (jwtError) {
        // Token inválido pero continuamos sin usuario
        req.user = null;
      }
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

/**
 * Generar tokens de acceso y refresh
 */
const generateTokens = (user) => {
  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    permissions: user.permissions || []
  };

  const accessToken = jwt.sign(tokenPayload, JWT_CONFIG.secret, {
    expiresIn: JWT_CONFIG.expiresIn
  });

  const refreshToken = jwt.sign(
    { id: user.id },
    JWT_CONFIG.secret,
    { expiresIn: JWT_CONFIG.refreshExpiresIn }
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: JWT_CONFIG.expiresIn
  };
};

/**
 * Generar hash seguro para contraseñas
 */
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Verificar contraseña contra hash
 */
const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Generar token de recuperación
 */
const generateRecoveryToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Validar fortaleza de contraseña
 */
const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];

  if (password.length < minLength) {
    errors.push(`Mínimo ${minLength} caracteres`);
  }
  if (!hasUpperCase) {
    errors.push('Debe contener mayúsculas');
  }
  if (!hasLowerCase) {
    errors.push('Debe contener minúsculas');
  }
  if (!hasNumbers) {
    errors.push('Debe contener números');
  }
  if (!hasSpecialChar) {
    errors.push('Debe contener caracteres especiales');
  }

  return {
    valid: errors.length === 0,
    errors,
    strength: errors.length === 0 ? 'strong' :
                errors.length < 3 ? 'medium' : 'weak'
  };
};

/**
 * Sanitizar entrada de usuario para prevenir inyección
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  // Remover caracteres peligrosos
  return input
    .replace(/[<>\"']/g, '')
    .trim();
};

/**
 * Validar email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Middleware para validar IP confiable (para operaciones sensibles)
 */
const requireTrustedIP = (trustedIPs = []) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;

    if (!trustedIPs.includes(clientIP)) {
      return res.status(403).json({
        success: false,
        message: 'Operación no permitida desde esta ubicación'
      });
    }

    next();
  };
};

/**
 * Middleware para registro de seguridad
 */
const securityLogger = (action) => {
  return async (req, res, next) => {
    const originalSend = res.send;

    res.send = function(data) {
      // Registrar intento de acceso
      console.log(`[SECURITY] ${action} - ${req.ip} - ${req.user?.id || 'anonymous'} - ${new Date().toISOString()}`);

      originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Middleware de validación de firma de solicitud
 * Para endpoints críticos que necesitan verificación adicional
 */
const validateSignature = (req, res, next) => {
  const signature = req.headers['x-signature'];
  const timestamp = req.headers['x-timestamp'];
  const body = JSON.stringify(req.body);

  if (!signature || !timestamp) {
    return res.status(401).json({
      success: false,
      message: 'Firma requerida'
    });
  }

  // Verificar que la solicitud no sea antigua (previene replay attacks)
  const requestTime = parseInt(timestamp);
  const currentTime = DateTime.now().toMillis();
  const timeDiff = Math.abs(currentTime - requestTime);

  if (timeDiff > 5 * 60 * 1000) { // 5 minutos
    return res.status(401).json({
      success: false,
      message: 'Solicitud expirada'
    });
  }

  // Verificar firma
  const expectedSignature = crypto
    .createHmac('sha256', JWT_CONFIG.secret)
    .update(`${timestamp}.${body}`)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(401).json({
      success: false,
      message: 'Firma inválida'
    });
  }

  next();
};

/**
 * Middleware de throttling para prevenir fuerza bruta
 */
const throttlingMiddleware = () => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();

    if (!attempts.has(key)) {
      attempts.set(key, { count: 1, resetAt: now + 60000 });
      return next();
    }

    const attempt = attempts.get(key);

    if (now > attempt.resetAt) {
      attempts.set(key, { count: 1, resetAt: now + 60000 });
      return next();
    }

    if (attempt.count >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Demasiados intentos. Intente en 1 minuto.',
        retryAfter: Math.ceil((attempt.resetAt - now) / 1000)
      });
    }

    attempt.count++;
    next();
  };
};

module.exports = {
  authenticate,
  authorize,
  requirePermission,
  optionalAuth,
  generateTokens,
  hashPassword,
  verifyPassword,
  generateRecoveryToken,
  validatePasswordStrength,
  sanitizeInput,
  isValidEmail,
  requireTrustedIP,
  securityLogger,
  validateSignature,
  throttlingMiddleware,
  authRateLimit,
  apiRateLimit,
  sensitiveRateLimit,
  JWT_CONFIG
};