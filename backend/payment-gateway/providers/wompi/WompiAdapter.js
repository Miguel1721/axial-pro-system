/**
 * ADAPTADOR WOMPI - Pasarela de Pagos Colombianos
 * Documentación: https://wompi.co/documentacion
 */

const BasePaymentAdapter = require('../BasePaymentAdapter');

class WompiAdapter extends BasePaymentAdapter {
  constructor(config) {
    super(config);
    this.apiUrl = config.mode === 'production'
      ? 'https://production.wompi.co'
      : 'https://sandbox.wompi.co';
  }

  /**
   * Crear orden de pago en Wompi
   */
  async createPaymentOrder(paymentData) {
    await this.validateConfig();

    const orderData = {
      amount_in_cents: this.formatAmount(paymentData.amount),
      currency: paymentData.currency || 'COP',
      customer_email: paymentData.patientEmail,
      payment_description: `Consulta médica - ${paymentData.patientName}`,
      payment_reference: paymentData.id,
      redirect_url: this.getReturnUrl(paymentData.id),
      acceptance_token: this.config.acceptanceToken,

      // Metadata
      metadata: {
        appointment_id: paymentData.appointmentId,
        patient_id: paymentData.patientId,
        doctor_id: paymentData.doctorId,
        patient_name: paymentData.patientName
      }
    };

    // LLAMADA A API WOMPI
    const response = await this.makeRequest('/v1/integration_links', orderData);

    return {
      id: paymentData.id,
      status: 'pending',
      provider: 'wompi',
      providerTransactionId: response.data.id,
      paymentUrl: response.data.url,
      amount: paymentData.amount,
      currency: paymentData.currency,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
      acceptanceToken: this.config.acceptanceToken
    };
  }

  /**
   * Verificar webhook de Wompi
   */
  async verifyWebhook(webhookData) {
    // Verificar firma según documentación Wompi
    const signature = webhookData.headers['x-signature'];
    const timestamp = webhookData.headers['x-timestamp'];
    const payload = webhookData.body;

    const calculatedSignature = this.calculateSignature(payload, timestamp);

    return signature === calculatedSignature;
  }

  /**
   * Procesar webhook de Wompi
   */
  async processPayment(webhookData) {
    const webhookBody = webhookData.body;

    return {
      transactionId: webhookBody.data.transaction.reference,
      status: this.mapStatus(webhookBody.data.transaction.status),
      provider: 'wompi',
      providerTransactionId: webhookBody.data.transaction.id,
      amount: webhookBody.data.transaction.amount_in_cents / 100,
      currency: webhookBody.data.transaction.currency,
      paidAt: new Date(webhookBody.data.transaction.paid_at),
      paymentMethod: webhookBody.data.payment_method_type,
      metadata: webhookBody.data.transaction.metadata
    };
  }

  /**
   * Consultar estado en Wompi
   */
  async getTransactionStatus(transactionId) {
    const response = await this.makeRequest(`/v1/transactions/${transactionId}`);

    return {
      transactionId: transactionId,
      status: this.mapStatus(response.data.status),
      provider: 'wompi',
      amount: response.data.amount_in_cents / 100,
      currency: response.data.currency
    };
  }

  /**
   * Reembolsar pago en Wompi
   */
  async refundPayment(transactionId, amount = null) {
    const refundData = {
      amount_in_cents: amount ? this.formatAmount(amount) : null
    };

    const response = await this.makeRequest(`/v1/transactions/${transactionId}/refund`, refundData);

    return {
      transactionId: transactionId,
      refundId: response.data.id,
      status: 'refunded',
      amount: amount || response.data.original_amount / 100
    };
  }

  // ========== MÉTODOS AUXILIARES ==========

  /**
   * Hacer request a API de Wompi
   */
  async makeRequest(endpoint, data = null) {
    const fetch = (await import('node-fetch')).default;

    const options = {
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.publicKey}`
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.apiUrl}${endpoint}`, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error en API Wompi');
    }

    return await response.json();
  }

  /**
   * Mapear estados de Wompi a estados del sistema
   */
  mapStatus(wompiStatus) {
    const statusMap = {
      'PENDING': 'pending',
      'APPROVED': 'completed',
      'DECLINED': 'failed',
      'ERROR': 'failed',
      'VOIDED': 'refunded'
    };

    return statusMap[wompiStatus] || 'pending';
  }

  /**
   * Calcular firma para webhook verification
   */
  calculateSignature(payload, timestamp) {
    const crypto = require('crypto');

    // Concatenar timestamp y payload
    const data = `${timestamp}${JSON.stringify(payload)}`;

    // Generar firma
    const signature = crypto
      .createHmac('sha256', this.privateKey)
      .update(data)
      .digest('hex');

    return signature;
  }

  /**
   * Obtener acceptance token
   */
  async getAcceptanceToken() {
    const response = await this.makeRequest('/v1/merchants');

    return {
      acceptanceToken: response.data.data.presigned_acceptance.token,
      permalink: response.data.data.permalink
    };
  }
}

module.exports = WompiAdapter;