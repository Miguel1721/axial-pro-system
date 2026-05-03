const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: true
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  type: {
    type: String,
    enum: ['subscription', 'pay_per_use', 'one_time', 'topup'],
    required: true
  },
  gateway: {
    type: String,
    enum: ['epayco', 'wompi', 'payu', 'placetopay', 'stripe'],
    required: true
  },
  transaction_id: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'COP'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'success', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  description: {
    type: String,
    required: true
  },
  features_accessed: [{
    feature: String,
    feature_id: String,
    price: Number,
    duration: Number // minutes/hours
  }],
  metadata: {
    ip: String,
    device: String,
    browser: String,
    location: {
      country: String,
      city: String
    }
  },
  refund_info: {
    refund_id: String,
    amount_refunded: Number,
    reason: String,
    date: Date
  }
}, {
  timestamps: true
});

PaymentSchema.index({ clinicId: 1 });
PaymentSchema.index({ transaction_id: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ gateway: 1 });

module.exports = mongoose.model('Payment', PaymentSchema);