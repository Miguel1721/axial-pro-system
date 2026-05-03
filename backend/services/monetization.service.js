const Subscription = require('../models/subscription.model');
const Payment = require('../models/payment.model');
const Clinic = require('../models/clinic.model');

class MonetizationService {
  // Get subscription plans configuration
  static getPlans() {
    return {
      free: {
        name: 'Gratis',
        description: 'Perfecto para clínicas pequeñas',
        price: 0,
        features: {
          ia_modules: false,
          telemedicine: false,
          advanced_analytics: false,
          custom_branding: false,
          api_access: false,
          support_priority: false,
          storage_limit: 100,
          patients_limit: 100,
          doctors_limit: 5
        }
      },
      basic: {
        name: 'Básico',
        description: 'Ideal para clínicas emergentes',
        price: 499000,
        features: {
          ia_modules: true,
          telemedicine: true,
          advanced_analytics: false,
          custom_branding: false,
          api_access: false,
          support_priority: false,
          storage_limit: 1000,
          patients_limit: 1000,
          doctors_limit: 20
        }
      },
      professional: {
        name: 'Profesional',
        description: 'Para clínicas establecidas',
        price: 1299000,
        features: {
          ia_modules: true,
          telemedicine: true,
          advanced_analytics: true,
          custom_branding: true,
          api_access: true,
          support_priority: true,
          storage_limit: 5000,
          patients_limit: 5000,
          doctors_limit: 100
        }
      },
      enterprise: {
        name: 'Enterprise',
        description: 'Solución completa para redes clínicas',
        price: 2999000,
        features: {
          ia_modules: true,
          telemedicine: true,
          advanced_analytics: true,
          custom_branding: true,
          api_access: true,
          support_priority: true,
          storage_limit: 20000,
          patients_limit: 20000,
          doctors_limit: 500,
          multi_location: true,
          white_label: true
        }
      }
    };
  }

  // Create or update subscription
  static async createSubscription(clinicId, plan, billingCycle = 'monthly') {
    const plans = this.getPlans();
    const selectedPlan = plans[plan];

    if (!selectedPlan) {
      throw new Error('Plan no válido');
    }

    const subscription = await Subscription.findOneAndUpdate(
      { clinicId },
      {
        plan,
        billing_cycle: billingCycle,
        status: 'active',
        current_period_end: this.calculateNextPeriod(billingCycle),
        pricing: {
          monthly_price: billingCycle === 'monthly' ? selectedPlan.price : selectedPlan.price / 12,
          annual_price: billingCycle === 'annual' ? selectedPlan.price : selectedPlan.price * 12,
          currency: 'COP'
        },
        features: selectedPlan.features,
        $setOnInsert: {
          trial_end: plan === 'free' ? null : Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days trial for paid plans
        }
      },
      { upsert: true, new: true }
    );

    return subscription;
  }

  // Calculate next billing period
  static calculateNextPeriod(billingCycle) {
    const now = new Date();
    if (billingCycle === 'monthly') {
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    } else {
      return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    }
  }

  // Process payment
  static async processPayment(clinicId, paymentData) {
    const subscription = await this.createSubscription(clinicId, paymentData.plan, paymentData.billingCycle);

    const payment = new Payment({
      clinicId,
      subscriptionId: subscription._id,
      type: paymentData.type || 'subscription',
      gateway: paymentData.gateway,
      transaction_id: paymentData.transactionId,
      amount: paymentData.amount,
      currency: paymentData.currency || 'COP',
      status: 'success',
      description: `Plan ${subscription.plan} - ${paymentData.billingCycle}`,
      metadata: paymentData.metadata
    });

    await payment.save();

    // Update subscription status and period
    subscription.current_period_end = this.calculateNextPeriod(paymentData.billingCycle);
    await subscription.save();

    return { subscription, payment };
  }

  // Check feature access
  static async canAccessFeature(clinicId, feature) {
    const subscription = await Subscription.findOne({ clinicId });
    if (!subscription || subscription.status !== 'active') {
      return false;
    }

    // Check if in trial period
    if (subscription.trial_end && subscription.trial_end > new Date()) {
      return true;
    }

    // Check feature permissions
    return subscription.features[feature] === true;
  }

  // Usage tracking for pay-per-use features
  static async trackUsage(clinicId, feature, amount = 1) {
    const subscription = await Subscription.findOne({ clinicId });
    if (!subscription) return false;

    if (feature === 'storage') {
      subscription.usage.storage_used += amount;
    } else if (feature === 'api_calls') {
      subscription.usage.api_calls += amount;
    } else if (feature === 'patients') {
      subscription.usage.patients_processed += amount;
    }

    await subscription.save();
    return true;
  }

  // Get billing dashboard data
  static async getBillingData(clinicId) {
    const subscription = await Subscription.findOne({ clinicId })
      .populate('clinicId', 'name')
      .lean();

    if (!subscription) {
      return null;
    }

    const payments = await Payment.find({ clinicId })
      .sort({ createdAt: -1 })
      .limit(10);

    const currentMonthUsage = this.getCurrentMonthUsage(subscription);

    return {
      subscription,
      recentPayments: payments,
      currentMonthUsage,
      nextBilling: subscription.current_period_end,
      trialStatus: subscription.trial_end ? {
        active: subscription.trial_end > new Date(),
        daysLeft: Math.ceil((subscription.trial_end - new Date()) / (1000 * 60 * 60 * 24))
      } : null
    };
  }

  // Get current month usage
  static getCurrentMonthUsage(subscription) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      patients_processed: subscription.usage.patients_processed,
      storage_used: subscription.usage.storage_used,
      api_calls: subscription.usage.api_calls,
      limits: {
        patients_limit: subscription.features.patients_limit,
        storage_limit: subscription.features.storage_limit,
        api_calls_limit: 10000 // Default limit
      }
    };
  }

  // Calculate upgrade cost
  static async calculateUpgradeCost(clinicId, newPlan) {
    const currentSubscription = await Subscription.findOne({ clinicId });
    const plans = this.getPlans();
    const currentPlan = plans[currentSubscription.plan];
    const selectedPlan = plans[newPlan];

    // Prorated cost for remaining period
    const daysRemaining = Math.ceil((currentSubscription.current_period_end - new Date()) / (1000 * 60 * 60 * 24));
    const dailyRate = currentSubscription.billing_cycle === 'monthly'
      ? currentPlan.price / 30
      : currentPlan.price / 365;

    const proratedCost = dailyRate * daysRemaining;
    const upgradeCost = selectedPlan.price - proratedCost;

    return {
      currentPlan: currentSubscription.plan,
      newPlan,
      currentPrice: currentPlan.price,
      newPrice: selectedPlan.price,
      proratedCost,
      totalDue: Math.max(0, upgradeCost),
      billingCycle: currentSubscription.billing_cycle
    };
  }
}

module.exports = MonetizationService;