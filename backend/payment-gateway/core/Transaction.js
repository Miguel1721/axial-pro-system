/**
 * MODELO DE TRANSACCIÓN
 * Estandariza todas las transacciones del sistema
 */

class Transaction {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.patientId = data.patientId;
    this.doctorId = data.doctorId;
    this.clinicId = data.clinicId;
    this.appointmentId = data.appointmentId;

    // Monto y moneda
    this.amount = data.amount;
    this.currency = data.currency || 'COP';
    this.amountInWords = this.amountToWords(this.amount);

    // Información de pago
    this.paymentMethod = data.paymentMethod; // card, pse, cash, etc
    this.provider = data.provider; // epayco, payu, etc
    this.providerTransactionId = data.providerTransactionId;

    // Estados
    this.status = data.status || 'pending'; // pending, processing, completed, failed, refunded, expired
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();

    // Metadatos
    this.description = data.description || 'Consulta médica';
    this.metadata = data.metadata || {};
  }

  generateId() {
    return `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  amountToWords(amount) {
    // Implementación básica
    return `${amount} pesos colombianos`;
  }

  toJSON() {
    return {
      id: this.id,
      patientId: this.patientId,
      doctorId: this.doctorId,
      clinicId: this.clinicId,
      appointmentId: this.appointmentId,
      amount: this.amount,
      currency: this.currency,
      amountInWords: this.amountInWords,
      paymentMethod: this.paymentMethod,
      provider: this.provider,
      providerTransactionId: this.providerTransactionId,
      status: this.status,
      description: this.description,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromDatabase(dbRecord) {
    return new Transaction(dbRecord);
  }
}

module.exports = Transaction;
