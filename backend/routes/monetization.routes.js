const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const MonetizationService = require('../services/monetization.service');

// Get subscription plans
router.get('/plans', auth, async (req, res) => {
  try {
    const plans = MonetizationService.getPlans();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or update subscription
router.post('/subscription', auth, async (req, res) => {
  try {
    const { plan, billingCycle = 'monthly' } = req.body;
    const subscription = await MonetizationService.createSubscription(req.user.clinicId, plan, billingCycle);
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Process payment
router.post('/payment/process', auth, async (req, res) => {
  try {
    const paymentData = req.body;
    paymentData.clinicId = req.user.clinicId;

    const result = await MonetizationService.processPayment(paymentData.clinicId, paymentData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check feature access
router.get('/feature/:feature', auth, async (req, res) => {
  try {
    const { feature } = req.params;
    const hasAccess = await MonetizationService.canAccessFeature(req.user.clinicId, feature);
    res.json({ hasAccess });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Track usage
router.post('/usage/track', auth, async (req, res) => {
  try {
    const { feature, amount = 1 } = req.body;
    const success = await MonetizationService.trackUsage(req.user.clinicId, feature, amount);
    res.json({ success });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get billing dashboard
router.get('/billing', auth, async (req, res) => {
  try {
    const billingData = await MonetizationService.getBillingData(req.user.clinicId);
    res.json(billingData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Calculate upgrade cost
router.post('/upgrade/cost', auth, async (req, res) => {
  try {
    const { newPlan } = req.body;
    const cost = await MonetizationService.calculateUpgradeCost(req.user.clinicId, newPlan);
    res.json(cost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get marketplace integrations
router.get('/marketplace', auth, async (req, res) => {
  try {
    const MarketplaceIntegration = require('../models/marketplace.model');
    const integrations = await MarketplaceIntegration.find({ clinicId: req.user.clinicId });
    res.json(integrations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Install marketplace integration
router.post('/marketplace/install', auth, async (req, res) => {
  try {
    const MarketplaceIntegration = require('../models/marketplace.model');
    const { provider, config, permissions } = req.body;

    const integration = new MarketplaceIntegration({
      clinicId: req.user.clinicId,
      provider,
      config,
      permissions,
      status: 'installed'
    });

    await integration.save();
    res.json(integration);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available marketplace apps
router.get('/marketplace/apps', auth, async (req, res) => {
  try {
    // Sample marketplace apps data
    const apps = [
      {
        id: 'epic-integration',
        name: 'EHR Integration - Epic',
        category: 'ehr',
        provider: 'epic',
        description: 'Integración completa con Epic EHR',
        features: ['Sincronización de pacientes', 'Historial médico', 'Recetas digitales'],
        pricing: '$49/mes',
        rating: 4.8,
        downloads: 1250
      },
      {
        id: 'labcorp-connect',
        name: 'Laboratory Integration - LabCorp',
        category: 'lab',
        provider: 'labcorp',
        description: 'Conexión con servicios de laboratorio LabCorp',
        features: ['Resultados en tiempo real', 'Alertas de resultados', 'Integración con historial'],
        pricing: '$29/mes',
        rating: 4.5,
        downloads: 890
      }
    ];

    res.json(apps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create support ticket
router.post('/support/ticket', auth, async (req, res) => {
  try {
    // Create support ticket logic here
    const ticketData = {
      clinicId: req.user.clinicId,
      ...req.body,
      status: 'open',
      createdAt: new Date()
    };

    // Save to database (implement Support model)
    res.json({ message: 'Support ticket created', ticket: ticketData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;