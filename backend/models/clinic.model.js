const mongoose = require('mongoose');

const ClinicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    default: ''
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: { type: String, default: 'Colombia' },
    zipCode: String
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  logo: {
    type: String,
    default: ''
  },
  primary_color: {
    type: String,
    default: '#3B82F6'
  },
  secondary_color: {
    type: String,
    default: '#10B981'
  },
  custom_domains: [{
    type: String
  }],
  settings: {
    timezone: { type: String, default: 'America/Bogota' },
    language: { type: String, default: 'es' },
    currency: { type: String, default: 'COP' }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  subscription_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  }
}, {
  timestamps: true
});

ClinicSchema.index({ email: 1 });
ClinicSchema.index({ location: '2dsphere' });
ClinicSchema.index({ status: 1 });

module.exports = mongoose.model('Clinic', ClinicSchema);