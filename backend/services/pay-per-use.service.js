const MonetizationService = require('./monetization.service');

class PayPerUseService {
  // IA Feature pricing configuration
  static getIAPricing() {
    return {
      // Prediction modules
      demand_prediction: {
        name: 'Predicción de Demanda',
        unit: 'prediction',
        price_per_unit: 500, // COP per prediction
        unit_description: 'Predicción horaria',
        description: 'Predice demanda de citas por hora',
        max_units_per_month: 1000
      },
      appointment_optimization: {
        name: 'Optimización de Citas',
        unit: 'optimization',
        price_per_unit: 1000,
        unit_description: 'Optimización',
        description: 'Optimiza agenda médica',
        max_units_per_month: 500
      },
      chatbot_triage: {
        name: 'Chatbot de Triaje',
        unit: 'conversation',
        price_per_unit: 200,
        unit_description: 'Conversación',
        description: 'Automatiza triaje inicial',
        max_units_per_month: 2000
      },
      history_analysis: {
        name: 'Análisis de Historial',
        unit: 'analysis',
        price_per_unit: 800,
        unit_description: 'Análisis de paciente',
        description: 'Analiza historial médico para insights',
        max_units_per_month: 300
      },
      voice_recognition: {
        name: 'Reconocimiento de Voz',
        unit: 'minute',
        price_per_unit: 100,
        unit_description: 'Minuto de audio',
        description: 'Transcribe notas médicas por voz',
        max_units_per_month: 600
      },
      stock_alerts: {
        name: 'Alertas de Stock',
        unit: 'alert',
        price_per_unit: 150,
        unit_description: 'Alerta enviada',
        description: 'Monitorea inventario de medicamentos',
        max_units_per_month: 1000
      },
      sentiment_analysis: {
        name: 'Análisis de Sentimiento',
        unit: 'analysis',
        price_per_unit: 300,
        unit_description: 'Análisis de feedback',
        description: 'Analiza satisfacción de pacientes',
        max_units_per_month: 500
      },
      appointment_suggestions: {
        name: 'Sugerencias de Citas',
        unit: 'suggestion',
        price_per_unit: 250,
        unit_description: 'Sugerencia',
        description: 'Sugiere citas basado en historial',
        max_units_per_month: 800
      },
      reminders: {
        name: 'Automatización de Recordatorios',
        unit: 'reminder',
        price_per_unit: 50,
        unit_description: 'Recordatorio enviado',
        description: 'Envía recordatorios automáticos',
        max_units_per_month: 2000
      },
      vision_analysis: {
        name: 'IA Vision',
        unit: 'analysis',
        price_per_unit: 1500,
        unit_description: 'Análisis de imagen',
        description: 'Analiza radiografías básicas',
        max_units_per_month: 100
      }
    };
  }

  // Calculate cost for IA features
  static calculateFeatureCost(featureId, units) {
    const pricing = this.getIAPricing()[featureId];
    if (!pricing) {
      throw new Error('Feature not found');
    }

    // Check if within limits
    if (units > pricing.max_units_per_month) {
      throw new Error(`Maximum units exceeded: ${pricing.max_units_per_month} per month`);
    }

    const totalCost = units * pricing.price_per_unit;
    return {
      feature: pricing,
      units,
      totalCost,
      unitPrice: pricing.price_per_unit,
      maxUnits: pricing.max_units_per_month
    };
  }

  // Process pay-per-use payment
  static async processPayPerUse(clinicId, featureUsage) {
    const { featureId, units, metadata } = featureUsage;
    const cost = this.calculateFeatureCost(featureId, units);

    // Check if user has access (either subscription has this feature or enough balance)
    const hasAccess = await MonetizationService.canAccessFeature(clinicId, 'ia_modules');
    if (!hasAccess) {
      throw new Error('IA modules not available for this subscription');
    }

    // Create payment record
    const Payment = require('../models/payment.model');
    const payment = new Payment({
      clinicId,
      type: 'pay_per_use',
      feature: featureId,
      units,
      amount: cost.totalCost,
      description: `${cost.feature.name} - ${units} ${cost.feature.unit_description}s`,
      status: 'success',
      metadata
    });

    await payment.save();

    // Track usage
    await MonetizationService.trackUsage(clinicId, 'api_calls', units);

    return {
      payment,
      cost
    };
  }

  // Check balance and limits
  static async checkBalance(clinicId) {
    const subscription = await MonetizationService.getBillingData(clinicId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const pricing = this.getIAPricing();
    const currentMonthUsage = MonetizationService.getCurrentMonthUsage(subscription.subscription);

    // Calculate available units for each feature
    const availableUnits = {};
    for (const [featureId, pricingData] of Object.entries(pricing)) {
      const used = currentMonthUsage.api_calls || 0;
      const remaining = Math.max(0, pricingData.max_units_per_month - used);
      availableUnits[featureId] = {
        ...pricingData,
        used,
        remaining,
        usagePercentage: (used / pricingData.max_units_per_month) * 100
      };
    }

    return {
      subscription: subscription.subscription,
      currentMonthUsage: currentMonthUsage,
      availableUnits,
      nextBilling: subscription.nextBilling
    };
  }

  // Get usage history
  static async getUsageHistory(clinicId, startDate, endDate) {
    const Payment = require('../models/payment.model');
    const query = {
      clinicId,
      type: 'pay_per_use',
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    };

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Group by feature
    const usageByFeature = {};
    payments.forEach(payment => {
      if (!usageByFeature[payment.feature]) {
        usageByFeature[payment.feature] = {
          totalAmount: 0,
          totalUnits: 0,
          transactions: []
        };
      }
      usageByFeature[payment.feature].totalAmount += payment.amount;
      usageByFeature[payment.feature].totalUnits += payment.units;
      usageByFeature[payment.feature].transactions.push(payment);
    });

    return {
      totalTransactions: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      usageByFeature
    };
  }

  // Generate usage invoice
  static async generateUsageInvoice(clinicId, month) {
    const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
    const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const usage = await this.getUsageHistory(clinicId, startDate, endDate);
    const pricing = this.getIAPricing();

    let invoiceItems = [];
    let totalAmount = 0;

    for (const [featureId, featureUsage] of Object.entries(usage.usageByFeature)) {
      const featurePricing = pricing[featureId];
      if (featurePricing) {
        invoiceItems.push({
          featureId,
          featureName: featurePricing.name,
          units: featureUsage.totalUnits,
          unitPrice: featurePricing.price_per_unit,
          totalAmount: featureUsage.totalAmount
        });
        totalAmount += featureUsage.totalAmount;
      }
    }

    const invoice = {
      clinicId,
      month: month.toISOString().slice(0, 7), // YYYY-MM format
      startDate,
      endDate,
      invoiceItems,
      totalAmount,
      generatedAt: new Date(),
      status: 'pending'
    };

    // Save invoice (implement Invoice model)
    return invoice;
  }

  // Set usage alerts
  static async setupUsageAlerts(clinicId, thresholds) {
    // Save thresholds for monitoring
    const alerts = {
      clinicId,
      thresholds,
      enabled: true,
      lastChecked: new Date(),
      alerts: []
    };

    // In real implementation, save to database and set up monitoring
    return alerts;
  }

  // Get recommendations for optimization
  static getOptimizationRecommendations(clinicId) {
    // Mock recommendations based on usage patterns
    return [
      {
        type: 'cost_optimization',
        title: 'Optimizar costo de Chatbot de Triaje',
        description: 'Has usado 1500/2000 conversaciones este mes',
        suggestion: 'Considera el plan Profesional para más conversaciones incluidas',
        potential_savings: 50000,
        priority: 'high'
      },
      {
        type: 'efficiency_improvement',
        title: 'Implementar Predicción de Demanda',
        description: 'Reduce tiempos de espera un 30%',
        suggestion: 'Activa el módulo para optimizar agendas',
        impact: 'high',
        priority: 'medium'
      },
      {
        type: 'new_feature',
        title: 'Prueba IA Vision',
        description: 'Análisis automatizado de radiografías',
        suggestion: 'Nuevo módulo con 100 análisis gratis',
        priority: 'low'
      }
    ];
  }
}

module.exports = PayPerUseService;