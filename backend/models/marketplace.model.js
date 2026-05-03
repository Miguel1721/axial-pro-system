const mongoose = require('mongoose');

const MarketplaceIntegrationSchema = new mongoose.Schema({
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: true
  },
  provider: {
    type: String,
    enum: ['epic', 'cerner', 'nextgen', 'drchrono', 'webmd', 'labcorp', 'quest'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['ehr', 'billing', 'lab', 'pharmacy', 'imaging', 'telehealth', 'analytics'],
    required: true
  },
  features: [{
    type: String
  }],
  pricing: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['installed', 'available', 'unavailable'],
    default: 'available'
  },
  config: {
    api_key: String,
    secret: String,
    endpoints: {
      base: String,
      auth: String,
      data: String
    },
    mapping: {
      patients: String,
      appointments: String,
      records: String
    }
  },
  permissions: [{
    type: String,
    enum: ['read', 'write', 'admin']
  }],
  last_sync: {
    type: Date,
    default: null
  },
  sync_status: {
    type: String,
    enum: ['idle', 'syncing', 'error', 'completed'],
    default: 'idle'
  }
}, {
  timestamps: true
});

MarketplaceIntegrationSchema.index({ clinicId: 1 });
MarketplaceIntegrationSchema.index({ provider: 1 });
MarketplaceIntegrationSchema.index({ category: 1 });

module.exports = mongoose.model('MarketplaceIntegration', MarketplaceIntegrationSchema);