/**
 * Rutas de A/B Testing API
 * Endpoints para experimentos y testing
 */

const express = require('express');
const router = express.Router();
const ABTestingService = require('../services/ab-testing.service');

// Inicializar servicio singleton
const abTestingService = new ABTestingService();

/**
 * @route   GET /api/ab-testing/experiments
 * @desc    Obtener todos los experimentos
 * @access  Private (Admin)
 */
router.get('/experiments', (req, res) => {
  try {
    const experiments = Array.from(abTestingService.experiments.values());

    res.json({
      success: true,
      data: experiments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/ab-testing/experiments/:id
 * @desc    Obtener un experimento específico
 * @access  Private
 */
router.get('/experiments/:id', (req, res) => {
  try {
    const { id } = req.params;
    const experiment = abTestingService.experiments.get(id);

    if (!experiment) {
      return res.status(404).json({
        success: false,
        error: 'Experimento no encontrado'
      });
    }

    res.json({
      success: true,
      data: experiment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ab-testing/experiments
 * @desc    Crear nuevo experimento
 * @access  Private (Admin)
 */
router.post('/experiments', (req, res) => {
  try {
    const experimentData = req.body;

    // Validar datos requeridos
    const required = ['name', 'variantA', 'variantB'];
    const missing = required.filter(field => !experimentData[field]);

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Campos requeridos faltantes: ${missing.join(', ')}`
      });
    }

    const experiment = abTestingService.createExperiment(experimentData);

    res.json({
      success: true,
      data: experiment,
      message: 'Experimento creado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ab-testing/experiments/:id/start
 * @desc    Iniciar experimento
 * @access  Private (Admin)
 */
router.post('/experiments/:id/start', (req, res) => {
  try {
    const { id } = req.params;

    abTestingService.startExperiment(id);

    res.json({
      success: true,
      message: 'Experimento iniciado'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ab-testing/experiments/:id/pause
 * @desc    Pausar experimento
 * @access  Private (Admin)
 */
router.post('/experiments/:id/pause', (req, res) => {
  try {
    const { id } = req.params;

    abTestingService.pauseExperiment(id);

    res.json({
      success: true,
      message: 'Experimento pausado'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ab-testing/experiments/:id/complete
 * @desc    Completar experimento
 * @access  Private (Admin)
 */
router.post('/experiments/:id/complete', (req, res) => {
  try {
    const { id } = req.params;

    abTestingService.completeExperiment(id);

    res.json({
      success: true,
      message: 'Experimento completado'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/ab-testing/experiments/:id/results
 * @desc    Obtener resultados de experimento
 * @access  Private (Admin)
 */
router.get('/experiments/:id/results', (req, res) => {
  try {
    const { id } = req.params;

    const results = abTestingService.calculateResults(id);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/ab-testing/assignment
 * @desc    Obtener variante asignada para usuario
 * @access  Private
 */
router.get('/assignment', (req, res) => {
  try {
    const { userId, experimentId } = req.query;

    if (!userId || !experimentId) {
      return res.status(400).json({
        success: false,
        error: 'userId y experimentId son requeridos'
      });
    }

    const variant = abTestingService.assignVariant(userId, experimentId);

    if (!variant) {
      return res.status(404).json({
        success: false,
        error: 'No hay experimento activo para este usuario'
      });
    }

    res.json({
      success: true,
      data: { variant, experimentId }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ab-testing/track
 * @desc    Track evento/conversión en experimento
 * @access  Private
 */
router.post('/track', (req, res) => {
  try {
    const { userId, experimentId, event, data } = req.body;

    if (!userId || !experimentId || !event) {
      return res.status(400).json({
        success: false,
        error: 'userId, experimentId y event son requeridos'
      });
    }

    const tracked = abTestingService.trackEvent(userId, experimentId, event, data);

    if (!tracked) {
      return res.status(400).json({
        success: false,
        error: 'No se pudo trackear el evento'
      });
    }

    res.json({
      success: true,
      message: 'Evento trackeado'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/ab-testing/predefined
 * @desc    Obtener experimentos predefinidos
 * @access  Private (Admin)
 */
router.get('/predefined', (req, res) => {
  try {
    const predefined = abTestingService.getPredefinedExperiments();

    res.json({
      success: true,
      data: predefined
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/ab-testing/active
 * @desc    Obtener experimento activo para usuario y feature
 * @access  Private
 */
router.get('/active', (req, res) => {
  try {
    const { userId, feature } = req.query;

    if (!userId || !feature) {
      return res.status(400).json({
        success: false,
        error: 'userId y feature son requeridos'
      });
    }

    const experiment = abTestingService.getActiveExperiment(userId, feature);

    res.json({
      success: true,
      data: experiment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/ab-testing/health
 * @desc    Health check del servicio de A/B testing
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'ab-testing',
    status: 'operational',
    experiments: abTestingService.experiments.size,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
module.exports.abTestingService = abTestingService;