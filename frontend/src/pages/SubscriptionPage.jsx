import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SubscriptionPage = () => {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [billingData, setBillingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [upgradeCost, setUpgradeCost] = useState(null);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const [planRes, billingRes] = await Promise.all([
        axios.get('/api/monetization/subscription'),
        axios.get('/api/monetization/billing')
      ]);
      setCurrentPlan(planRes.data);
      setBillingData(billingRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Gratis',
      price: 0,
      description: 'Perfecto para clínicas pequeñas',
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
    {
      id: 'basic',
      name: 'Básico',
      price: 499000,
      description: 'Ideal para clínicas emergentes',
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
    {
      id: 'professional',
      name: 'Profesional',
      price: 1299000,
      description: 'Para clínicas establecidas',
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
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 2999000,
      description: 'Solución completa para redes clínicas',
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
  ];

  const handlePlanChange = async (planId) => {
    if (currentPlan.plan === planId) return;

    setSelectedPlan(planId);
    setUpgrading(true);

    try {
      const response = await axios.post('/api/monetization/upgrade/cost', { newPlan: planId });
      setUpgradeCost(response.data);
    } catch (error) {
      console.error('Error calculating upgrade cost:', error);
    } finally {
      setUpgrading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!selectedPlan) return;

    try {
      await axios.post('/api/monetization/subscription', {
        plan: selectedPlan,
        billingCycle: currentPlan.billing_cycle
      });

      alert('¡Plan actualizado exitosamente!');
      fetchSubscriptionData();
      setSelectedPlan('');
      setUpgradeCost(null);
    } catch (error) {
      console.error('Error upgrading plan:', error);
      alert('Error al actualizar el plan');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getFeatureIcon = (enabled) => {
    return enabled ? (
      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Suscripción y Planes</h1>
        <p className="text-gray-600">
          {billingData?.trialStatus?.active
            ? `Prueba gratuita hasta ${new Date(billingData.trialStatus.daysLeft).toLocaleDateString('es-CO')}`
            : 'Gestiona tu plan actual y actualiza cuando lo necesites'
          }
        </p>
      </div>

      {/* Current Plan */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Plan Actual</h2>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold">{plans.find(p => p.id === currentPlan.plan)?.name}</h3>
              <p className="text-gray-600">{plans.find(p => p.id === currentPlan.plan)?.description}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(billingData?.subscription?.pricing?.monthly_price || 0)}
              </p>
              <p className="text-sm text-gray-500">
                {currentPlan.billing_cycle === 'monthly' ? 'mensual' : 'anual'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
              <h4 className="font-semibold mb-2">Características incluidas</h4>
              <ul className="space-y-2">
                {Object.entries(plans.find(p => p.id === currentPlan.plan)?.features || {}).map(([feature, enabled]) => (
                  <li key={feature} className="flex items-center">
                    {getFeatureIcon(enabled)}
                    <span className="ml-2 capitalize">
                      {feature.replace(/_/g, ' ')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Uso actual</h4>
              {billingData?.currentMonthUsage && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Pacientes:</span>
                    <span>{billingData.currentMonthUsage.patients_processed} / {billingData.currentMonthUsage.limits.patients_limit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Almacenamiento:</span>
                    <span>{(billingData.currentMonthUsage.storage_used / 1024).toFixed(1)} GB</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Mejora tu Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.filter(p => p.id !== 'free').map(plan => (
            <div
              key={plan.id}
              className={`bg-white p-6 rounded-lg shadow border-2 cursor-pointer transition-all ${
                selectedPlan === plan.id
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => handlePlanChange(plan.id)}
            >
              <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
              <p className="text-gray-600 mb-4 text-sm">{plan.description}</p>
              <div className="mb-4">
                <p className="text-2xl font-bold text-green-600">{formatCurrency(plan.price)}</p>
                <p className="text-sm text-gray-500">mensual</p>
              </div>
              <div className="space-y-2 mb-4">
                {Object.entries(plan.features).map(([feature, enabled]) => (
                  <div key={feature} className="flex items-center text-sm">
                    {getFeatureIcon(enabled)}
                    <span className="ml-2 capitalize">
                      {feature.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {upgradeCost && (
          <div className="bg-blue-50 p-6 rounded-lg mt-4">
            <h3 className="text-lg font-semibold mb-2">Resumen de la Actualización</h3>
            <div className="space-y-2">
              <p>De: {plans.find(p => p.id === upgradeCost.currentPlan).name}</p>
              <p>A: {plans.find(p => p.id === upgradeCost.newPlan).name}</p>
              <p>Costo prorrateado: {formatCurrency(upgradeCost.proratedCost)}</p>
              <p className="text-xl font-bold">Total a pagar: {formatCurrency(upgradeCost.totalDue)}</p>
            </div>
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {upgrading ? 'Procesando...' : 'Confirmar Actualización'}
            </button>
          </div>
        )}
      </div>

      {/* Billing Information */}
      {billingData && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Información de Facturación</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Próximo pago</h3>
              <p>{new Date(billingData.nextBilling).toLocaleDateString('es-CO')}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Método de pago</h3>
              <p>Tarjeta •••• {billingData.subscription?.payment_method?.slice(-4) || 'Sin agregar'}</p>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Historial de pagos</h3>
            <div className="space-y-2">
              {billingData.recentPayments?.map(payment => (
                <div key={payment._id} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-medium">{payment.description}</p>
                    <p className="text-sm text-gray-500">{new Date(payment.createdAt).toLocaleDateString('es-CO')}</p>
                  </div>
                  <span className="font-bold">{formatCurrency(payment.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;