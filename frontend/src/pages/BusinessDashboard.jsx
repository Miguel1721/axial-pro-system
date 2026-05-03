import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts';
import axios from 'axios';

const BusinessDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [billingData, setBillingData] = useState(null);
  const [marketplaceApps, setMarketplaceApps] = useState([]);
  const [integrations, setIntegrations] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [billingRes, appsRes, integrationsRes] = await Promise.all([
        axios.get('/api/monetization/billing'),
        axios.get('/api/monetization/marketplace/apps'),
        axios.get('/api/monetization/marketplace')
      ]);

      setBillingData(billingRes.data);
      setMarketplaceApps(appsRes.data);
      setIntegrations(integrationsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for charts
  const revenueData = [
    { month: 'Ene', revenue: 2500000 },
    { month: 'Feb', revenue: 3200000 },
    { month: 'Mar', revenue: 2800000 },
    { month: 'Abr', revenue: 4100000 },
    { month: 'May', revenue: 3800000 }
  ];

  const userGrowthData = [
    { month: 'Ene', users: 50 },
    { month: 'Feb', users: 120 },
    { month: 'Mar', users: 200 },
    { month: 'Abr', users: 350 },
    { month: 'May', users: 480 }
  ];

  const planDistribution = [
    { name: 'Gratis', value: 120, color: '#8884d8' },
    { name: 'Básico', value: 85, color: '#82ca9d' },
    { name: 'Profesional', value: 45, color: '#ffc658' },
    { name: 'Enterprise', value: 15, color: '#ff7c7c' }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Ingresos Mensuales</h3>
          <p className="text-3xl font-bold text-green-600">
            ${billingData?.subscription?.pricing?.monthly_price?.toLocaleString('es-CO') || '0'}
          </p>
          <p className="text-sm text-gray-500">Próximo cobro: {new Date(billingData?.nextBilling).toLocaleDateString('es-CO')}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Usuarios Activos</h3>
          <p className="text-3xl font-bold text-blue-600">{userGrowthData[userGrowthData.length - 1].users}</p>
          <p className="text-sm text-gray-500">+15% este mes</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Uso IA</h3>
          <p className="text-3xl font-bold text-purple-600">89%</p>
          <p className="text-sm text-gray-500">5,234 consultas IA</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Satisfacción</h3>
          <p className="text-3xl font-bold text-yellow-600">4.8</p>
          <p className="text-sm text-gray-500">NPS Score</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Ingresos por Mes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toLocaleString('es-CO')}`, '']} />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Distribución de Planes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={planDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {planDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Usage Stats */}
      {billingData?.currentMonthUsage && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Uso Actual del Mes</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Pacientes Procesados</p>
              <p className="text-xl font-bold">
                {billingData.currentMonthUsage.patients_processed} / {billingData.currentMonthUsage.limits.patients_limit}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(billingData.currentMonthUsage.patients_processed / billingData.currentMonthUsage.limits.patients_limit) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Almacenamiento</p>
              <p className="text-xl font-bold">
                {(billingData.currentMonthUsage.storage_used / 1024).toFixed(1)} GB / {(billingData.currentMonthUsage.limits.storage_limit / 1024).toFixed(1)} GB
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${(billingData.currentMonthUsage.storage_used / billingData.currentMonthUsage.limits.storage_limit) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Llamadas API</p>
              <p className="text-xl font-bold">
                {billingData.currentMonthUsage.api_calls} / {billingData.currentMonthUsage.limits.api_calls_limit}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${(billingData.currentMonthUsage.api_calls / billingData.currentMonthUsage.limits.api_calls_limit) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderMarketplace = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Marketplace de Integraciones</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {marketplaceApps.map(app => (
          <div key={app.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{app.name}</h3>
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {app.category}
              </span>
            </div>

            <p className="text-gray-600 mb-4">{app.description}</p>

            <div className="mb-4">
              <p className="text-sm font-semibold">Características:</p>
              <ul className="text-sm text-gray-600 mt-2">
                {app.features.slice(0, 2).map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-green-600">{app.pricing}</span>
              <div className="flex items-center">
                <span className="text-yellow-500 mr-1">★</span>
                <span className="text-sm">{app.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Integraciones Activas</h3>
        {integrations.length > 0 ? (
          <div className="space-y-4">
            {integrations.map(integration => (
              <div key={integration._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">{integration.name}</h4>
                  <p className="text-sm text-gray-600">{integration.provider}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  integration.status === 'installed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {integration.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No tienes integraciones activas</p>
        )}
      </div>
    </div>
  );

  const renderSupport = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Soporte Integrado</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Chat en Vivo</h3>
          <p className="text-gray-600 mb-4">Soporte instantáneo con nuestros especialistas</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            Iniciar Chat
          </button>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Ticket de Soporte</h3>
          <p className="text-gray-600 mb-4">Envía tu problema y te responderemos en 24h</p>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
            Crear Ticket
          </button>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Documentación</h3>
          <p className="text-gray-600 mb-4">Guías, tutoriales y API docs</p>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
            Ver Docs
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Mis Tickets</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">ID</th>
                <th className="text-left py-2">Asunto</th>
                <th className="text-left py-2">Estado</th>
                <th className="text-left py-2">Fecha</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2">#001</td>
                <td className="py-2">Error de sincronización</td>
                <td className="py-2">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                    En Progreso
                  </span>
                </td>
                <td className="py-2">01/05/2026</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">#002</td>
                <td className="py-2">Duda de facturación</td>
                <td className="py-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                    Resuelto
                  </span>
                </td>
                <td className="py-2">28/04/2026</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

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
        <h1 className="text-3xl font-bold mb-2">Dashboard de Negocio</h1>
        <p className="text-gray-600">Gestiona tu clínica, ingresos e integraciones</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8 border-b">
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Resumen
          </button>
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'marketplace'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('marketplace')}
          >
            Marketplace
          </button>
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'support'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('support')}
          >
            Soporte
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'marketplace' && renderMarketplace()}
      {activeTab === 'support' && renderSupport()}
    </div>
  );
};

export default BusinessDashboard;