/**
 * RUTAS DE PAGOS - API ENDPOINTS
 * Sistema modular de pagos para Axial Pro Clinic
 */

const express = require('express');
const router = express.Router();
const PaymentGateway = require('../core/PaymentGateway');
const PaymentConfig = require('../config/payment.config');

// Instancias globales
const gateway = new PaymentGateway();
const config = new PaymentConfig();

// Inicializar gateway con configuración actual
let currentConfig = null;

/**
 * Inicializar gateway al iniciar servidor
 */
async function initializeGateway() {
  try {
    const providerConfig = await config.loadConfig();
    currentConfig = providerConfig;

    await gateway.initialize(providerConfig.name.toLowerCase(), {
      ...providerConfig,
      provider: providerConfig.name.toLowerCase()
    });

    console.log(`✅ Payment Gateway inicializado: ${providerConfig.name}`);
  } catch (error) {
    console.log(`⚠️  Gateway en modo simulador (error: ${error.message})`);
    await gateway.initialize('simulator', { mode: 'demo' });
  }
}

// Inicializar al cargar módulo
initializeGateway();

// ==================== RUTAS PÚBLICAS ====================

/**
 * POST /api/payments/create-order
 * Crear orden de pago
 */
router.post('/create-order', async (req, res) => {
  try {
    const {
      appointmentId,
      patientId,
      doctorId,
      amount,
      currency = 'COP',
      patientName,
      patientEmail,
      patientPhone
    } = req.body;

    // Validaciones
    if (!appointmentId || !patientId || !doctorId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos'
      });
    }

    // Generar ID de orden
    const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Crear orden de pago
    const paymentData = {
      id: orderId,
      appointmentId,
      patientId,
      doctorId,
      amount: parseFloat(amount),
      currency,
      patientName,
      patientEmail,
      patientPhone
    };

    const result = await gateway.createPaymentOrder(paymentData);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error creando orden:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/payments/status/:transactionId
 * Consultar estado de transacción
 */
router.get('/status/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;

    const status = await gateway.getTransactionStatus(transactionId);

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error consultando estado:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/payments/refund/:transactionId
 * Reembolsar pago
 */
router.post('/refund/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { amount } = req.body;

    const result = await gateway.refundPayment(transactionId, amount);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error reembolsando:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== WEBHOOKS ====================

/**
 * POST /api/payments/webhook/:provider
 * Webhook genérico para todos los proveedores
 */
router.post('/webhook/:provider', async (req, res) => {
  try {
    const { provider } = req.params;

    // Verificar que el proveedor esté activo
    if (provider !== currentConfig?.name.toLowerCase()) {
      console.log(`⚠️  Webhook de ${provider} ignorado (proveedor no activo)`);
      return res.json({ received: true, ignored: true });
    }

    // Verificar firma del webhook
    const isValid = await gateway.provider.verifyWebhook({
      headers: req.headers,
      body: req.body
    });

    if (!isValid) {
      console.error(`❌ Firma webhook inválida: ${provider}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid signature'
      });
    }

    // Procesar pago
    const result = await gateway.processPayment({
      headers: req.headers,
      body: req.body
    });

    console.log(`✅ Webhook ${provider} procesado: ${result.transactionId}`);

    // Aquí podrías:
    // - Actualizar base de datos
    // - Enviar email de confirmación
    // - Actualizar estado de cita
    // - etc.

    res.json({ received: true });
  } catch (error) {
    console.error('Error procesando webhook:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== RUTAS DE CONFIGURACIÓN (ADMIN) ====================

/**
 * GET /api/payments/config
 * Obtener configuración actual (para frontend)
 */
router.get('/config', (req, res) => {
  try {
    const frontendConfig = config.getFrontendConfig();

    res.json({
      success: true,
      data: frontendConfig
    });
  } catch (error) {
    console.error('Error obteniendo configuración:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/payments/providers
 * Listar pasarelas disponibles
 */
router.get('/providers', (req, res) => {
  try {
    const providers = config.getAvailableProviders();

    res.json({
      success: true,
      data: providers
    });
  } catch (error) {
    console.error('Error obteniendo proveedores:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/payments/config/change-provider
 * Cambiar proveedor de pagos (ADMIN)
 */
router.post('/config/change-provider', async (req, res) => {
  try {
    const { provider, config: newConfig } = req.body;

    // Validar que el proveedor exista
    const availableProviders = config.getAvailableProviders();
    const exists = availableProviders.some(p => p.id === provider);

    if (!exists) {
      return res.status(400).json({
        success: false,
        error: `Provider ${provider} no existe`
      });
    }

    // Cambiar proveedor
    const result = await config.changeProvider(provider, newConfig);

    // Reinicializar gateway
    await gateway.initialize(provider, {
      ...newConfig,
      provider
    });

    currentConfig = config.getCurrentProvider();

    console.log(`✅ Proveedor cambiado a: ${provider}`);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error cambiando proveedor:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/payments/config/test-connection
 * Probar conexión con proveedor
 */
router.post('/config/test-connection', async (req, res) => {
  try {
    const { provider, config: testConfig } = req.body;

    // Validar configuración
    const result = await config.validateProviderConfig(provider, testConfig);

    res.json({
      success: true,
      data: {
        valid: result,
        message: result ? 'Conexión exitosa' : 'Error en conexión'
      }
    });
  } catch (error) {
    console.error('Error probando conexión:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== RUTAS DE SIMULADOR (TESTING) ====================

/**
 * POST /api/payments/simulator/success
 * Forzar pago exitoso (solo simulador)
 */
router.post('/simulator/success', async (req, res) => {
  try {
    const { transactionId } = req.body;

    if (currentConfig?.name.toLowerCase() !== 'simulator') {
      return res.status(400).json({
        success: false,
        error: 'Esta función solo funciona con el simulador'
      });
    }

    const result = await gateway.provider.simulateSuccessPayment(transactionId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error en simulador:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/payments/simulator/fail
 * Forzar pago fallido (solo simulador)
 */
router.post('/simulator/fail', async (req, res) => {
  try {
    const { transactionId, reason } = req.body;

    if (currentConfig?.name.toLowerCase() !== 'simulator') {
      return res.status(400).json({
        success: false,
        error: 'Esta función solo funciona con el simulador'
      });
    }

    const result = await gateway.provider.simulateFailedPayment(transactionId, reason);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error en simulador:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/payments/simulator/stats
 * Estadísticas del simulador
 */
router.get('/simulator/stats', (req, res) => {
  try {
    if (currentConfig?.name.toLowerCase() !== 'simulator') {
      return res.status(400).json({
        success: false,
        error: 'Esta función solo funciona con el simulador'
      });
    }

    const stats = gateway.provider.getSimulationStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;