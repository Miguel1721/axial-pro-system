/**
 * INTERFAZ BASE PARA ADAPTADORES DE PAGO
 * Todos los proveedores deben implementar esta interfaz
 */

class BasePaymentAdapter {
  constructor(config) {
    this.config = config;
    this.mode = config.mode || 'sandbox';
    this.apiKey = config.apiKey;
    this.merchantId = config.merchantId;
    this.secretKey = config.secretKey;
  }

  /**
   * Crear orden de pago
   * @param {Object} paymentData - Datos del pago
   * @returns {Promise<Object>} Orden de pago creada
   */
  async createPaymentOrder(paymentData) {
    throw new Error('createPaymentOrder debe ser implementado por el adaptador');
  }

  /**
   * Verificar webhook de la pasarela
   * @param {Object} webhookData - Datos del webhook
   * @returns {Promise<boolean>} Válido o inválido
   */
  async verifyWebhook(webhookData) {
    throw new Error('verifyWebhook debe ser implementado por el adaptador');
  }

  /**
   * Procesar pago (webhook)
   * @param {Object} webhookData - Datos del webhook
   * @returns {Promise<Object>} Transacción procesada
   */
  async processPayment(webhookData) {
    throw new Error('processPayment debe ser implementado por el adaptador');
  }

  /**
   * Consultar estado de transacción
   * @param {string} transactionId - ID de transacción
   * @returns {Promise<Object>} Estado de la transacción
   */
  async getTransactionStatus(transactionId) {
    throw new Error('getTransactionStatus debe ser implementado por el adaptador');
  }

  /**
   * Reembolsar pago
   * @param {string} transactionId - ID de transacción
   * @param {number} amount - Monto a reembolsar (null = total)
   * @returns {Promise<Object>} Reembolso procesado
   */
  async refundPayment(transactionId, amount = null) {
    throw new Error('refundPayment debe ser implementado por el adaptador');
  }

  /**
   * Validar configuración
   * @returns {Promise<boolean>} Configuración válida
   */
  async validateConfig() {
    if (!this.apiKey) {
      throw new Error('API Key es requerida');
    }

    if (!this.merchantId) {
      throw new Error('Merchant ID es requerido');
    }

    return true;
  }

  /**
   * Formatear monto para pasarela
   * @param {number} amount - Monto numérico
   * @returns {number} Monto formateado
   */
  formatAmount(amount) {
    return Math.round(amount * 100) / 100;
  }

  /**
   * Generar URL de retorno
   * @param {string} transactionId - ID de transacción
   * @returns {string} URL de retorno
   */
  getReturnUrl(transactionId) {
    const baseUrl = this.config.returnUrl || 'https://centro-salud.agentesia.cloud';
    return `${baseUrl}/payment/return/${transactionId}`;
  }

  /**
   * Generar URL de cancelación
   * @param {string} transactionId - ID de transacción
   * @returns {string} URL de cancelación
   */
  getCancelUrl(transactionId) {
    const baseUrl = this.config.cancelUrl || 'https://centro-salud.agentesia.cloud';
    return `${baseUrl}/payment/cancel/${transactionId}`;
  }

  /**
   * Generar URL de notificación
   * @param {string} transactionId - ID de transacción
   * @returns {string} URL de webhook
   */
  getWebhookUrl(transactionId) {
    const baseUrl = this.config.webhookUrl || 'https://api.centro-salud.agentesia.cloud';
    return `${baseUrl}/api/payments/webhook/${this.config.provider}/${transactionId}`;
  }
}

module.exports = BasePaymentAdapter;
