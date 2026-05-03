const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const MonetizationService = require('../services/monetization.service');
const WhiteLabelService = require('../services/whitelabel.service');

// Admin business dashboard metrics
router.get('/business/metrics', auth, async (req, res) => {
  try {
    // Mock business metrics data
    const metrics = {
      totalRevenue: 48000000,
      activeClients: 400,
      margin: 68,
      avgLTV: 850000,
      monthlyGrowth: 12,
      yearlyGrowth: 45,
      avgSessionTime: 8.5,
      conversionRate: 3.2,
      churnRate: 8.2,
      customerSatisfaction: 4.8
    };
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all clients
router.get('/business/clients', auth, async (req, res) => {
  try {
    // Mock clients data - in real implementation, fetch from database
    const clients = [
      {
        id: 1,
        name: 'Clínica Santa María',
        email: 'info@clinicasantamaria.com',
        plan: 'Enterprise',
        monthlyRevenue: 2999000,
        since: '2024-01-15',
        active: true,
        location: 'Bogotá',
        users: 45
      },
      {
        id: 2,
        name: 'Centro Médico del Norte',
        email: 'contact@centromedico-norte.com',
        plan: 'Profesional',
        monthlyRevenue: 1299000,
        since: '2024-02-20',
        active: true,
        location: 'Medellín',
        users: 22
      },
      {
        id: 3,
        name: 'Consultorio Dr. García',
        email: 'dr.garcia@consultorio.com',
        plan: 'Básico',
        monthlyRevenue: 499000,
        since: '2024-03-10',
        active: true,
        location: 'Cali',
        users: 8
      },
      {
        id: 4,
        name: 'Clín Dental Sonrisa',
        email: 'sonrisa@clinicadental.com',
        plan: 'Básico',
        monthlyRevenue: 499000,
        since: '2024-04-05',
        active: true,
        location: 'Barranquilla',
        users: 6
      },
      {
        id: 5,
        name: 'Laboratorio Médico Central',
        email: 'lab@medicocentral.com',
        plan: 'Profesional',
        monthlyRevenue: 1299000,
        since: '2024-04-20',
        active: true,
        location: 'Bogotá',
        users: 18
      }
    ];

    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get revenue data
router.get('/business/revenue', auth, async (req, res) => {
  try {
    // Mock revenue data
    const revenue = [
      { month: 'Ene', revenue: 8500000, profit: 2500000, clients: 280 },
      { month: 'Feb', revenue: 9200000, profit: 2800000, clients: 310 },
      { month: 'Mar', revenue: 10500000, profit: 3200000, clients: 350 },
      { month: 'Abr', revenue: 12800000, profit: 4200000, clients: 380 },
      { month: 'May', revenue: 14200000, profit: 4800000, clients: 400 }
    ];

    res.json(revenue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get subscription analytics
router.get('/business/subscriptions', auth, async (req, res) => {
  try {
    // Mock subscription analytics
    const analytics = {
      totalSubscriptions: 500,
      planDistribution: {
        free: 180,
        basic: 200,
        professional: 90,
        enterprise: 30
      },
      churnRate: 8.2,
      upgradeRate: 15.3,
      avgSubscriptionValue: 850000,
      monthlyRetention: 92,
      yearlyRetention: 78
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get marketing metrics
router.get('/business/marketing', auth, async (req, res) => {
  try {
    // Mock marketing metrics
    const marketing = {
      totalVisitors: 45000,
      conversionRate: 3.2,
      avgCostPerLead: 12500,
      avgCustomerAcquisitionCost: 83333,
      marketingROI: 240,
      campaignPerformance: {
        seo: { leads: 450, cost: 0, roi: '∞' },
        googleAds: { leads: 280, cost: 2500000, roi: 112 },
        linkedin: { leads: 120, cost: 1800000, roi: 67 },
        email: { leads: 85, cost: 500000, roi: 170 },
        referrals: { leads: 200, cost: 300000, roi: 667 },
        social: { leads: 150, cost: 1200000, roi: 125 }
      },
      contentPerformance: [
        { title: 'Guía: Implementar telemedicina', views: 12500, leads: 45 },
        { title: 'Cómo optimizar turnos con IA', views: 9800, leads: 38 },
        { title: 'Integración con Epic EHR', views: 7500, leads: 25 },
        { title: 'Mejores prácticas HIPAA 2024', views: 6200, leads: 20 }
      ]
    };

    res.json(marketing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update client subscription
router.put('/business/clients/:clientId/subscription', auth, async (req, res) => {
  try {
    const { clientId } = req.params;
    const { plan, billingCycle } = req.body;

    // In real implementation, update client subscription in database
    // For demo purposes, just return success
    res.json({
      message: 'Subscription updated successfully',
      clientId,
      plan,
      billingCycle,
      updated: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update client branding
router.put('/business/clients/:clientId/branding', auth, async (req, res) => {
  try {
    const { clientId } = req.params;
    const brandingData = req.body;

    // Update branding using WhiteLabelService
    const branding = await WhiteLabelService.updateBranding(clientId, brandingData);

    res.json({
      message: 'Branding updated successfully',
      clientId,
      branding
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate white-label app
router.post('/business/clients/:clientId/whitelabel', auth, async (req, res) => {
  try {
    const { clientId } = req.params;
    const brandingData = req.body;

    // Generate white-label app
    const result = await WhiteLabelService.generateWhiteLabelApp(clientId, brandingData);

    res.json({
      message: 'White-label app generated successfully',
      clientId,
      path: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deploy white-label app
router.post('/business/clients/:clientId/deploy', auth, async (req, res) => {
  try {
    const { clientId } = req.params;

    // Deploy white-label app
    const result = await WhiteLabelService.deployWhiteLabel(clientId);

    res.json({
      message: 'Deployment initiated',
      clientId,
      result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get business reports
router.get('/business/reports/:type', auth, async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = req.query;

    // Mock report data based on type
    const reports = {
      revenue: {
        title: 'Reporte de Ingresos',
        data: [
          { date: '2024-01-01', amount: 8500000, plan: 'Enterprise' },
          { date: '2024-01-02', amount: 4200000, plan: 'Profesional' },
          { date: '2024-01-03', amount: 2100000, plan: 'Básico' }
        ]
      },
      clients: {
        title: 'Reporte de Clientes',
        data: [
          { date: '2024-01-01', new: 15, active: 280, churned: 2 },
          { date: '2024-01-02', new: 23, active: 301, churned: 1 },
          { date: '2024-01-03', new: 18, active: 319, churned: 3 }
        ]
      },
      usage: {
        title: 'Reporte de Uso',
        data: [
          { date: '2024-01-01', appointments: 450, telemedicine: 120, ia_modules: 89 },
          { date: '2024-01-02', appointments: 520, telemedicine: 135, ia_modules: 102 },
          { date: '2024-01-03', appointments: 480, telemedicine: 98, ia_modules: 76 }
        ]
      }
    };

    const report = reports[type] || { title: 'Reporte no encontrado', data: [] };
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export business data
router.get('/business/export/:format', auth, async (req, res) => {
  try {
    const { format } = req.params;
    const { type, startDate, endDate } = req.query;

    // Generate export file
    const fileName = `business_report_${type}_${new Date().toISOString().split('T')[0]}.${format}`;
    const filePath = `/tmp/${fileName}`;

    // In real implementation, generate actual export file
    // For demo, return download URL
    res.json({
      message: 'Export generated successfully',
      downloadUrl: `/api/exports/${fileName}`,
      fileName,
      format
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;