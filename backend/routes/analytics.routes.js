/**
 * Rutas de Analytics API
 * Endpoints para tracking, métricas y reportes
 */

const express = require('express');
const router = express.Router();
const AnalyticsService = require('../services/analytics.service');

// Inicializar servicio singleton
const analyticsService = new AnalyticsService();

// Middleware de logging automático
router.use((req, res, next) => {
  // Track automático de cada request
  const startTime = Date.now();

  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const success = res.statusCode < 400;

    analyticsService.trackPerformance(responseTime, success);

    if (req.user) {
      analyticsService.trackFeatureUsage('api_request', req.user.id);
    }
  });

  next();
});

/**
 * @route   POST /api/analytics/track/user
 * @desc    Track evento de usuario
 * @access  Private
 */
router.post('/track/user', (req, res) => {
  try {
    const { userId, role, action } = req.body;

    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        error: 'userId y role son requeridos'
      });
    }

    analyticsService.trackUser(userId, role, action);

    res.json({
      success: true,
      message: 'Evento de usuario trackeado'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/analytics/track/session
 * @desc    Track sesión de usuario
 * @access  Private
 */
router.post('/track/session', (req, res) => {
  try {
    const { userId, duration, success } = req.body;

    if (!userId || duration === undefined) {
      return res.status(400).json({
        success: false,
        error: 'userId y duration son requeridos'
      });
    }

    analyticsService.trackSession(userId, duration, success !== false);

    res.json({
      success: true,
      message: 'Sesión trackeada'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/analytics/track/performance
 * @desc    Track métricas de rendimiento
 * @access  Private
 */
router.post('/track/performance', (req, res) => {
  try {
    const { responseTime, success } = req.body;

    if (responseTime === undefined) {
      return res.status(400).json({
        success: false,
        error: 'responseTime es requerido'
      });
    }

    analyticsService.trackPerformance(responseTime, success !== false);

    res.json({
      success: true,
      message: 'Performance trackeada'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/analytics/track/feature
 * @desc    Track uso de funcionalidad
 * @access  Private
 */
router.post('/track/feature', (req, res) => {
  try {
    const { feature, userId } = req.body;

    if (!feature) {
      return res.status(400).json({
        success: false,
        error: 'feature es requerido'
      });
    }

    analyticsService.trackFeatureUsage(feature, userId);

    res.json({
      success: true,
      message: 'Feature usage trackeado'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/analytics/track/error
 * @desc    Track errores del sistema
 * @access  Private
 */
router.post('/track/error', (req, res) => {
  try {
    const { error, context } = req.body;

    if (!error) {
      return res.status(400).json({
        success: false,
        error: 'error es requerido'
      });
    }

    const errorObj = typeof error === 'string' ? new Error(error) : error;
    analyticsService.trackError(errorObj, context);

    res.json({
      success: true,
      message: 'Error trackeado'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * @route   POST /api/analytics/track/medical-event
 * @desc    Track eventos médicos específicos
 * @access  Private
 */
router.post('/track/medical-event', (req, res) => {
  try {
    const { event, data } = req.body;

    if (!event || !data) {
      return res.status(400).json({
        success: false,
        error: 'event y data son requeridos'
      });
    }

    analyticsService.trackMedicalEvent(event, data);

    res.json({
      success: true,
      message: 'Evento médico trackeado'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/analytics/report/:type
 * @desc    Obtener reportes de analytics
 * @access  Private
 */
router.get('/report/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { days = 7 } = req.query;

    const report = await analyticsService.getReport(type, parseInt(days));

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/analytics/metrics/realtime
 * @desc    Obtener métricas en tiempo real
 * @access  Private
 */
router.get('/metrics/realtime', (req, res) => {
  try {
    const metrics = {
      users: analyticsService.metrics.users,
      sessions: analyticsService.metrics.sessions,
      performance: analyticsService.metrics.performance,
      features: analyticsService.metrics.features,
      errors: analyticsService.metrics.errors,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/analytics/health
 * @desc    Health check del servicio de analytics
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'analytics',
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
module.exports.analyticsService = analyticsService;