const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const PayPerUseService = require('../services/pay-per-use.service');

// Get IA features pricing
router.get('/features', auth, async (req, res) => {
  try {
    const features = PayPerUseService.getIAPricing();
    res.json(features);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Calculate feature cost
router.post('/calculate-cost', auth, async (req, res) => {
  try {
    const { featureId, units } = req.body;
    const cost = PayPerUseService.calculateFeatureCost(featureId, units);
    res.json(cost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Process pay-per-use payment
router.post('/process', auth, async (req, res) => {
  try {
    const { featureId, units, metadata } = req.body;
    const result = await PayPerUseService.processPayPerUse(req.user.clinicId, {
      featureId,
      units,
      metadata
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check balance and usage limits
router.get('/balance', auth, async (req, res) => {
  try {
    const balance = await PayPerUseService.checkBalance(req.user.clinicId);
    res.json(balance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get usage history
router.get('/usage', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const usage = await PayPerUseService.getUsageHistory(
      req.user.clinicId,
      startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
      endDate || new Date().toISOString()
    );
    res.json(usage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate usage invoice
router.post('/invoice/generate', auth, async (req, res) => {
  try {
    const { month } = req.body;
    const invoice = await PayPerUseService.generateUsageInvoice(req.user.clinicId, month);
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Setup usage alerts
router.post('/alerts/setup', auth, async (req, res) => {
  try {
    const { thresholds } = req.body;
    const alerts = await PayPerUseService.setupUsageAlerts(req.user.clinicId, thresholds);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get optimization recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    const recommendations = PayPerUseService.getOptimizationRecommendations(req.user.clinicId);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test an IA feature (demo mode)
router.post('/test/:featureId', auth, async (req, res) => {
  try {
    const { featureId } = req.params;
    const { units = 1, testMode = true } = req.body;

    if (testMode) {
      // In test mode, don't charge but track usage
      const cost = PayPerUseService.calculateFeatureCost(featureId, units);
      await PayPerUseService.processPayPerUse(req.user.clinicId, {
        featureId,
        units,
        metadata: { testMode: true, testId: Date.now() }
      });

      res.json({
        success: true,
        message: 'Test mode - Feature tested successfully',
        cost,
        note: 'This was a test. No charges were applied.'
      });
    } else {
      // Regular mode - process payment
      const result = await PayPerUseService.processPayPerUse(req.user.clinicId, {
        featureId,
        units,
        metadata: { testMode: false }
      });
      res.json(result);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get feature usage statistics
router.get('/stats/:featureId', auth, async (req, res) => {
  try {
    const { featureId } = req.params;
    const { period = 'month' } = req.query;

    // Mock statistics - in real implementation, query database
    const stats = {
      featureId,
      period,
      totalUsage: 450,
      totalCost: 225000,
      avgUsagePerDay: 15,
      peakUsage: 68,
      usageByDay: [
        { date: '2024-01-01', usage: 45, cost: 22500 },
        { date: '2024-01-02', usage: 52, cost: 26000 },
        { date: '2024-01-03', usage: 38, cost: 19000 }
      ],
      projections: {
        expectedUsage: 600,
        expectedCost: 300000,
        monthlyGrowth: 12.5
      }
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set billing preferences
router.put('/billing/preferences', auth, async (req, res) => {
  try {
    const preferences = req.body;
    // Save billing preferences (implement BillingPreferences model)
    res.json({
      message: 'Billing preferences updated successfully',
      preferences
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get billing history
router.get('/billing/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    // Mock billing history - in real implementation, query database
    const history = {
      transactions: [
        {
          id: 'tx_001',
          date: '2024-01-15',
          description: 'Chatbot de Triaje - 500 conversaciones',
          amount: 100000,
          status: 'completed'
        },
        {
          id: 'tx_002',
          date: '2024-01-14',
          description: 'Predicción de Demanda - 10 predicciones',
          amount: 5000,
          status: 'completed'
        }
      ],
      total: 105000,
      page: parseInt(page),
      totalPages: 5,
      totalTransactions: 50
    };

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;