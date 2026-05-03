const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: true
  },
  plan: {
    type: String,
    enum: ['free', 'basic', 'professional', 'enterprise'],
    default: 'free'
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled', 'expired'],
    default: 'active'
  },
  features: {
    ia_modules: { type: Boolean, default: false },
    telemedicine: { type: Boolean, default: false },
    advanced_analytics: { type: Boolean, default: false },
    custom_branding: { type: Boolean, default: false },
    api_access: { type: Boolean, default: false },
    support_priority: { type: Boolean, default: false },
    storage_limit: { type: Number, default: 1000 }, // MB
    patients_limit: { type: Number, default: 500 },
    doctors_limit: { type: Number, default: 50 }
  },
  pricing: {
    monthly_price: { type: Number, default: 0 },
    annual_price: { type: Number, default: 0 },
    currency: { type: String, default: 'COP' }
  },
  billing_cycle: {
    type: String,
    enum: ['monthly', 'annual'],
    default: 'monthly'
  },
  current_period_end: {
    type: Date,
    required: true
  },
  trial_end: {
    type: Date,
    default: null
  },
  payment_method: {
    type: String,
    default: null
  },
  invoices: [{
    invoice_number: String,
    amount: Number,
    date: Date,
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue', 'cancelled']
    },
    pdf_url: String
  }],
  usage: {
    patients_processed: { type: Number, default: 0 },
    storage_used: { type: Number, default: 0 },
    api_calls: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

SubscriptionSchema.index({ clinicId: 1 });
SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ current_period_end: 1 });

module.exports = mongoose.model('Subscription', SubscriptionSchema);