/**
 * Rutas de Deployment API
 * Endpoints para gestión de deployments y zero-downtime deployments
 */

const express = require('express');
const router = express.Router();
const DeploymentService = require('../services/deployment.service');

// Inicializar servicio singleton
const deploymentService = new DeploymentService();

/**
 * @route   GET /api/deployment/deployments
 * @desc    Obtener todos los deployments
 * @access  Private (Admin)
 */
router.get('/deployments', async (req, res) => {
  try {
    const deployments = Array.from(deploymentService.deployments.values());

    res.json({
      success: true,
      data: deployments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/deployment/deployments/:id
 * @desc    Obtener un deployment específico
 * @access  Private (Admin)
 */
router.get('/deployments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deployment = deploymentService.deployments.get(id);

    if (!deployment) {
      return res.status(404).json({
        success: false,
        error: 'Deployment no encontrado'
      });
    }

    res.json({
      success: true,
      data: deployment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/deployment/deployments
 * @desc    Crear nuevo deployment
 * @access  Private (Admin)
 */
router.post('/deployments', async (req, res) => {
  try {
    const deploymentData = req.body;

    // Validar datos requeridos
    const required = ['name', 'version', 'strategy'];
    const missing = required.filter(field => !deploymentData[field]);

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Campos requeridos faltantes: ${missing.join(', ')}`
      });
    }

    // Validar estrategia
    const validStrategies = ['blue-green', 'canary', 'rolling'];
    if (!validStrategies.includes(deploymentData.strategy)) {
      return res.status(400).json({
        success: false,
        error: `Estrategia inválida. Debe ser: ${validStrategies.join(', ')}`
      });
    }

    const deployment = await deploymentService.createDeployment(deploymentData);

    res.json({
      success: true,
      data: deployment,
      message: 'Deployment creado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/deployment/deployments/:id/start
 * @desc    Iniciar deployment
 * @access  Private (Admin)
 */
router.post('/deployments/:id/start', async (req, res) => {
  try {
    const { id } = req.params;

    // Ejecutar deployment en background
    deploymentService.startDeployment(id)
      .then(deployment => {
        console.log(`Deployment ${id} completado exitosamente`);
      })
      .catch(error => {
        console.error(`Deployment ${id} falló:`, error);
      });

    res.json({
      success: true,
      message: 'Deployment iniciado. Consulte el estado con GET /deployments/:id'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/deployment/deployments/:id/rollback
 * @desc    Hacer rollback de deployment
 * @access  Private (Admin)
 */
router.post('/deployments/:id/rollback', async (req, res) => {
  try {
    const { id } = req.params;

    await deploymentService.rollbackDeployment(id);

    res.json({
      success: true,
      message: 'Rollback ejecutado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/deployment/strategies
 * @desc    Obtener estrategias de deployment disponibles
 * @access  Private (Admin)
 */
router.get('/strategies', (req, res) => {
  try {
    const strategies = [
      {
        name: 'blue-green',
        description: 'Despliegue Blue-Green con cambio de tráfico instantáneo',
        advantages: ['Zero downtime', 'Rollback instantáneo', 'Testing completo'],
        disadvantages: ['Requiere doble infraestructura', 'Costo elevado'],
        useCases: ['Actualizaciones críticas', 'Migraciones mayores']
      },
      {
        name: 'canary',
        description: 'Despliegue gradual con tráfico incremental',
        advantages: ['Riesgo controlado', 'Monitoreo real', 'Costo moderado'],
        disadvantages: ['Tiempo de rollout más largo', 'Complejidad de monitoreo'],
        useCases: ['Nuevas features', 'Actualizaciones progresivas']
      },
      {
        name: 'rolling',
        description: 'Despliegue por instancias/replicas',
        advantages: ['Uso eficiente de recursos', 'Zero downtime', 'Fácil automatización'],
        disadvantages: ['Versiones mixtas temporalmente', 'Rollback más lento'],
        useCases: ['Actualizaciones rutinarias', 'Scaling horizontal']
      }
    ];

    res.json({
      success: true,
      data: strategies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/deployment/history
 * @desc    Obtener historial de deployments
 * @access  Private (Admin)
 */
router.get('/history', async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const deployments = Array.from(deploymentService.deployments.values())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: deployments,
      total: deployments.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/deployment/active
 * @desc    Obtener deployment activo actual
 * @access  Private (Admin)
 */
router.get('/active', (req, res) => {
  try {
    const active = deploymentService.activeDeployment;

    if (!active) {
      return res.status(404).json({
        success: false,
        error: 'No hay deployment activo'
      });
    }

    res.json({
      success: true,
      data: active
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/deployment/test-connection
 * @desc    Probar conexión de deployment
 * @access  Private (Admin)
 */
router.post('/test-connection', async (req, res) => {
  try {
    const { environment = 'production' } = req.body;

    // Simular test de conexión
    const testResult = {
      environment,
      status: 'connected',
      latency: Math.floor(Math.random() * 100) + 20,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: testResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/deployment/health
 * @desc    Health check del servicio de deployment
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'deployment',
    status: 'operational',
    activeDeployment: deploymentService.activeDeployment ? deploymentService.activeDeployment.id : null,
    totalDeployments: deploymentService.deployments.size,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
module.exports.deploymentService = deploymentService;