/**
 * ADAPTADOR EPAYCO - Pasarela de Pagos Colombianos
 * Documentación: https://epayco.co/docs
 */

const BasePaymentAdapter = require('../BasePaymentAdapter');

class EPayCoAdapter extends BasePaymentAdapter {
  constructor(config) {
    super(config);
    this.apiUrl = config.apiUrl;
    if (this.mode === 'production') {
      this.apiUrl = 'https://secure.epayco.co';
    } else {
      this.apiUrl = 'https://api.secure.payco.co';
    }
  }

  /**
   * Crear orden de pago en ePayco
   */
  async createPaymentOrder(paymentData) {
    await this.validateConfig();

    const orderData = {
      // Datos básicos
      transaction_id: paymentData.id,
      amount_in_cents: this.formatAmount(paymentData.amount),
      currency: paymentData.currency || 'COP',

      // Información del comprador
      payer: {
        name: paymentData.patientName,
        email: paymentData.patientEmail,
        phone: paymentData.patientPhone
      },

      // URL de retorno
      return_url: this.getReturnUrl(paymentData.id),
      cancel_url: this.getCancelUrl(paymentData.id),

      // Notificación
      notification_url: this.getWebhookUrl(paymentData.id),

      // Metadatos
      metadata: {
        appointment_id: paymentData.appointmentId,
        patient_id: paymentData.patientId,
        doctor_id: paymentData.doctorId
      }
    };

    // LLAMADA A API EPAYCO
    const response = await this.makeRequest('/payment/v1/create', orderData);

    return {
      id: paymentData.id,
      status: 'pending',
      provider: 'epayco',
      providerTransactionId: response.data.id,
      paymentUrl: response.data.data.url,
      amount: paymentData.amount,
      currency: paymentData.currency,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutos
    };
  }

  /**
   * Verificar webhook de ePayco
   */
  async verifyWebhook(webhookData) {
    // Verificar firma según documentación ePayco
    // Firma: HMAC-SHA256 con secret key

    const signature = webhookData.headers['x-signature'];
    const payload = webhookData.body;

    const calculatedSignature = this.calculateSignature(payload);

    return signature === calculatedSignature;
  }

  /**
   * Procesar webhook de ePayco
   */
  async processPayment(webhookData) {
    const webhookBody = webhookData.body;

    return {
      transactionId: webhookBody.transaction_id,
      status: this.mapStatus(webhookBody.status),
      provider: 'epayco',
      providerTransactionId: webhookBody.id,
      amount: webhookBody.amount_in_cents / 100,
      currency: webhookBody.currency,
      paidAt: new Date(),
      metadata: webhookBody.metadata
    };
  }

  /**
   * Consultar estado en ePayco
   */
  async getTransactionStatus(transactionId) {
    const response = await this.makeRequest(`/payment/v1/status/${transactionId}`);

    return {
      transactionId: transactionId,
      status: this.mapStatus(response.data.status),
      provider: 'epayco',
      amount: response.data.amount_in_cents / 100,
      currency: response.data.currency
    };
  }

  /**
   * Reembolsar pago en ePayco
   */
  async refundPayment(transactionId, amount = null) {
    const refundData = {
      transaction_id: transactionId,
      amount: amount ? this.formatAmount(amount) : null
    };

    const response = await this.makeRequest('/payment/v1/refund', refundData);

    return {
      transactionId: transactionId,
      refundId: response.data.id,
      status: 'refunded',
      amount: amount || response.data.original_amount / 100
    };
  }

  // ========== MÉTODOS AUXILIARES ==========

  /**
   * Hacer request a API de ePayco
   */
  async makeRequest(endpoint, data) {
    const fetch = (await import('node-fetch')).default;

    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error en API ePayco');
    }

    return await response.json();
  }

  /**
   * Mapear estados de ePayco a estados del sistema
   */
  mapStatus(epaycoStatus) {
    const statusMap = {
      'PENDING': 'pending',
      'APPROVED': 'processing',
      'DECLINED': 'failed',
      'ERROR': 'failed',
      'PENDING': 'pending',
      'APPROVED': 'completed',
      'REFUNDED': 'refunded'
    };

    return statusMap[epaycoStatus] || 'pending';
  }

  /**
   * Calcular firma para webhook verification
   */
  calculateSignature(payload) {
    // Implementación según documentación ePayco
    const crypto = require('crypto');
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(JSON.stringify(payload))
      .digest('hex');

    return signature;
  }
}

module.exports = EPayCoAdapter;
