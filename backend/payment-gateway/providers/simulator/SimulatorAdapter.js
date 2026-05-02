/**
 * ADAPTADOR SIMULADOR - Pagos de Prueba sin API Keys
 * Para desarrollo, pruebas y demostraciones
 */

const BasePaymentAdapter = require('../BasePaymentAdapter');

class SimulatorAdapter extends BasePaymentAdapter {
  constructor(config) {
    super(config);
    this.simulatedPayments = new Map(); // Almacenar pagos simulados en memoria
  }

  /**
   * Crear orden de pago simulada
   */
  async createPaymentOrder(paymentData) {
    // Simular delay de red
    await this.delay(500);

    const order = {
      id: paymentData.id,
      status: 'pending',
      provider: 'simulator',
      providerTransactionId: `SIM_${this.generateId()}`,
      paymentUrl: this.generateSimulatedPaymentUrl(paymentData.id),
      amount: paymentData.amount,
      currency: paymentData.currency || 'COP',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
      testMode: true,
      metadata: {
        appointment_id: paymentData.appointmentId,
        patient_id: paymentData.patientId,
        doctor_id: paymentData.doctorId
      }
    };

    // Guardar en memoria
    this.simulatedPayments.set(paymentData.id, order);

    console.log(`🧪 SIMULADOR: Orden creada ${paymentData.id} - $${paymentData.amount}`);

    return order;
  }

  /**
   * Verificar webhook simulado
   */
  async verifyWebhook(webhookData) {
    // En simulador, siempre es válido
    return true;
  }

  /**
   * Procesar pago simulado
   */
  async processPayment(webhookData) {
    const transactionId = webhookBody.transaction_id;

    // Recuperar orden de memoria
    const order = this.simulatedPayments.get(transactionId);

    if (!order) {
      throw new Error(`Transacción ${transactionId} no encontrada`);
    }

    // Simular resultado según método de pago
    const paymentMethod = webhookData.payment_method || 'card';
    const successRate = this.getSuccessRate(paymentMethod);

    const isSuccess = Math.random() < successRate;

    const transaction = {
      transactionId: transactionId,
      status: isSuccess ? 'completed' : 'failed',
      provider: 'simulator',
      providerTransactionId: order.providerTransactionId,
      amount: order.amount,
      currency: order.currency,
      paidAt: isSuccess ? new Date() : null,
      paymentMethod: paymentMethod,
      testMode: true,
      metadata: {
        ...order.metadata,
        simulated: true,
        successRate: successRate
      }
    };

    // Actualizar en memoria
    this.simulatedPayments.set(transactionId, transaction);

    console.log(`🧪 SIMULADOR: Pago ${transactionId} - ${transaction.status.toUpperCase()}`);

    return transaction;
  }

  /**
   * Consultar estado de transacción simulada
   */
  async getTransactionStatus(transactionId) {
    const transaction = this.simulatedPayments.get(transactionId);

    if (!transaction) {
      throw new Error(`Transacción ${transactionId} no encontrada`);
    }

    return {
      transactionId: transactionId,
      status: transaction.status,
      provider: 'simulator',
      amount: transaction.amount,
      currency: transaction.currency,
      testMode: true
    };
  }

  /**
   * Reembolsar pago simulado
   */
  async refundPayment(transactionId, amount = null) {
    const transaction = this.simulatedPayments.get(transactionId);

    if (!transaction) {
      throw new Error(`Transacción ${transactionId} no encontrada`);
    }

    if (transaction.status !== 'completed') {
      throw new Error(`Solo se pueden reembolsar pagos completados`);
    }

    // Simular delay
    await this.delay(300);

    const refund = {
      transactionId: transactionId,
      refundId: `REF_${this.generateId()}`,
      status: 'refunded',
      amount: amount || transaction.amount,
      originalAmount: transaction.amount,
      currency: transaction.currency,
      refundedAt: new Date(),
      testMode: true
    };

    // Actualizar transacción
    transaction.status = 'refunded';
    transaction.refund = refund;
    this.simulatedPayments.set(transactionId, transaction);

    console.log(`🧪 SIMULADOR: Reembolso ${transactionId} - $${refund.amount}`);

    return refund;
  }

  // ========== MÉTODOS AUXILIARES ==========

  /**
   * Generar URL de pago simulada
   */
  generateSimulatedPaymentUrl(transactionId) {
    const baseUrl = this.config.returnUrl || 'https://centro-salud.agentesia.cloud';
    return `${baseUrl}/payment/simulator/${transactionId}`;
  }

  /**
   * Obtener tasa de éxito según método de pago
   */
  getSuccessRate(paymentMethod) {
    const rates = {
      'card': 0.85,        // 85% éxito
      'pse': 0.90,         // 90% éxito
      'cash': 1.0,         // 100% éxito (no falla)
      'nequi': 0.88,       // 88% éxito
      'default': 0.85
    };

    return rates[paymentMethod] || rates['default'];
  }

  /**
   * Generar ID aleatorio
   */
  generateId() {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  /**
   * Simular delay de red
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Simular pago exitoso manualmente (para testing)
   */
  async simulateSuccessPayment(transactionId) {
    const order = this.simulatedPayments.get(transactionId);

    if (!order) {
      throw new Error(`Orden ${transactionId} no encontrada`);
    }

    const transaction = {
      transactionId: transactionId,
      status: 'completed',
      provider: 'simulator',
      providerTransactionId: order.providerTransactionId,
      amount: order.amount,
      currency: order.currency,
      paidAt: new Date(),
      testMode: true,
      metadata: {
        ...order.metadata,
        simulated: true,
        manuallyCompleted: true
      }
    };

    this.simulatedPayments.set(transactionId, transaction);

    console.log(`✅ SIMULADOR: Pago manual exitoso ${transactionId}`);

    return transaction;
  }

  /**
   * Simular pago fallido manualmente (para testing)
   */
  async simulateFailedPayment(transactionId, reason = 'Tarjeta rechazada') {
    const order = this.simulatedPayments.get(transactionId);

    if (!order) {
      throw new Error(`Orden ${transactionId} no encontrada`);
    }

    const transaction = {
      transactionId: transactionId,
      status: 'failed',
      provider: 'simulator',
      providerTransactionId: order.providerTransactionId,
      amount: order.amount,
      currency: order.currency,
      paidAt: null,
      testMode: true,
      failureReason: reason,
      metadata: {
        ...order.metadata,
        simulated: true,
        manuallyFailed: true
      }
    };

    this.simulatedPayments.set(transactionId, transaction);

    console.log(`❌ SIMULADOR: Pago manual fallido ${transactionId} - ${reason}`);

    return transaction;
  }

  /**
   * Limpiar todos los pagos simulados (para testing)
   */
  clearAllPayments() {
    this.simulatedPayments.clear();
    console.log('🧹 SIMULADOR: Todos los pagos eliminados');
  }

  /**
   * Obtener estadísticas de simulación
   */
  getSimulationStats() {
    const payments = Array.from(this.simulatedPayments.values());

    return {
      total: payments.length,
      completed: payments.filter(p => p.status === 'completed').length,
      failed: payments.filter(p => p.status === 'failed').length,
      pending: payments.filter(p => p.status === 'pending').length,
      refunded: payments.filter(p => p.status === 'refunded').length,
      successRate: payments.length > 0
        ? (payments.filter(p => p.status === 'completed').length / payments.length * 100).toFixed(2) + '%'
        : '0%'
    };
  }
}

module.exports = SimulatorAdapter;