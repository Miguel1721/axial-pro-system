/**
 * PAYMENT GATEWAY - NÚCLEO DEL SISTEMA
 * Sistema modular de pagos soporta múltiples pasarelas colombianas
 */

class PaymentGateway {
  constructor() {
    this.provider = null;
    this.config = null;
    this.mode = 'simulator'; // simulator, sandbox, production
  }

  /**
   * Inicializar gateway con proveedor específico
   */
  async initialize(providerName, config) {
    try {
      // Cargar adaptador dinámicamente según proveedor
      const ProviderClass = await this.loadProvider(providerName);
      this.provider = new ProviderClass(config);
      this.config = config;
      this.mode = config.mode || 'simulator';

      console.log(`✅ Payment Gateway inicializado: ${providerName} (${this.mode})`);
      return true;
    } catch (error) {
      console.error(`❌ Error inicializando gateway: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cargar adaptador de pasarela específica
   */
  async loadProvider(providerName) {
    const providers = {
      'epayco': () => import('../providers/epayco/EPayCoAdapter.js'),
      'payu': () => import('../providers/payu/PayUAdapter.js'),
      'placetopay': () => import('../providers/placetopay/PlaceToPayAdapter.js'),
      'wompi': () => import('../providers/wompi/WompiAdapter.js'),
      'stripe': () => import('../providers/stripe/StripeAdapter.js'),
      'simulator': () => import('../providers/simulator/SimulatorAdapter.js')
    };

    if (!providers[providerName]) {
      throw new Error(`Provider no soportado: ${providerName}`);
    }

    const module = await providers[providerName]();
    return module.default;
  }

  /**
   * Crear orden de pago
   */
  async createPaymentOrder(paymentData) {
    if (!this.provider) {
      throw new Error('Gateway no inicializado. Llamar a initialize() primero.');
    }

    try {
      const order = await this.provider.createPaymentOrder(paymentData);
      await this.saveTransaction(order);

      return {
        success: true,
        orderId: order.id,
        paymentUrl: order.paymentUrl,
        amount: order.amount,
        currency: order.currency,
        provider: this.config.provider
      };
    } catch (error) {
      console.error('Error creando orden de pago:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Procesar pago (webhook)
   */
  async processPayment(webhookData) {
    if (!this.provider) {
      throw new Error('Gateway no inicializado');
    }

    try {
      // Verificar firma del webhook
      const isValid = await this.provider.verifyWebhook(webhookData);

      if (!isValid) {
        throw new Error('Firma webhook inválida');
      }

      // Actualizar estado de transacción
      const transaction = await this.provider.processPayment(webhookData);

      return {
        success: true,
        transaction: transaction
      };
    } catch (error) {
      console.error('Error procesando pago:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Consultar estado de transacción
   */
  async getTransactionStatus(transactionId) {
    if (!this.provider) {
      throw new Error('Gateway no inicializado');
    }

    try {
      const status = await this.provider.getTransactionStatus(transactionId);
      return status;
    } catch (error) {
      console.error('Error consultando estado:', error);
      throw error;
    }
  }

  /**
   * Reembolsar pago
   */
  async refundPayment(transactionId, amount = null) {
    if (!this.provider) {
      throw new Error('Gateway no inicializado');
    }

    try {
      const refund = await this.provider.refundPayment(transactionId, amount);
      await this.updateTransactionStatus(transactionId, 'refunded');

      return {
        success: true,
        refund: refund
      };
    } catch (error) {
      console.error('Error reembolsando:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Guardar transacción en base de datos
   */
  async saveTransaction(order) {
    // Implementación con base de datos
    console.log('💾 Guardando transacción:', order);
    // await db.transactions.create(order);
    return order;
  }

  /**
   * Actualizar estado de transacción
   */
  async updateTransactionStatus(transactionId, status) {
    console.log(`🔄 Actualizando transacción ${transactionId} a ${status}`);
    // await db.transactions.update(transactionId, { status });
  }
}

module.exports = PaymentGateway;
