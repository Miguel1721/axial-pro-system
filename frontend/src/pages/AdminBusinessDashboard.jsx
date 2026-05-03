import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import axios from 'axios';

const AdminBusinessDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [businessMetrics, setBusinessMetrics] = useState({});
  const [clients, setClients] = useState([]);
  const [revenue, setRevenue] = useState([]);

  useEffect(() => {
    fetchBusinessData();
  }, []);

  const fetchBusinessData = async () => {
    try {
      const [metricsRes, clientsRes, revenueRes] = await Promise.all([
        axios.get('/api/admin/business/metrics'),
        axios.get('/api/admin/business/clients'),
        axios.get('/api/admin/business/revenue')
      ]);

      setBusinessMetrics(metricsRes.data);
      setClients(clientsRes.data);
      setRevenue(revenueRes.data);
    } catch (error) {
      console.error('Error fetching business data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for charts
  const monthlyRevenue = [
    { month: 'Ene', revenue: 8500000, profit: 2500000 },
    { month: 'Feb', revenue: 9200000, profit: 2800000 },
    { month: 'Mar', revenue: 10500000, profit: 3200000 },
    { month: 'Abr', revenue: 12800000, profit: 4200000 },
    { month: 'May', revenue: 14200000, profit: 4800000 }
  ];

  const clientRetention = [
    { month: 'Ene', retention: 85, new: 25 },
    { month: 'Feb', retention: 88, new: 42 },
    { month: 'Mar', retention: 82, new: 68 },
    { month: 'Abr', retention: 90, new: 95 },
    { month: 'May', retention: 92, new: 120 }
  ];

  const planDistribution = [
    { name: 'Gratis', value: 180, color: '#8884d8' },
    { name: 'Básico', value: 125, color: '#82ca9d' },
    { name: 'Profesional', value: 75, color: '#ffc658' },
    { name: 'Enterprise', value: 20, color: '#ff7c7c' }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Business Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <h3 className="text-lg font-semibold mb-2">Ingresos Totales</h3>
          <p className="text-3xl font-bold">
            ${(businessMetrics.totalRevenue / 1000000).toFixed(1)}M
          </p>
          <p className="text-sm opacity-90">+12% vs mes anterior</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg text-white">
          <h3 className="text-lg font-semibold mb-2">Clientes Activos</h3>
          <p className="text-3xl font-bold">{businessMetrics.activeClients}</p>
          <p className="text-sm opacity-90">+8% este mes</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <h3 className="text-lg font-semibold mb-2">Margen Bruto</h3>
          <p className="text-3xl font-bold">{businessMetrics.margin}%</p>
          <p className="text-sm opacity-90">+2% vs trimestre anterior</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-lg text-white">
          <h3 className="text-lg font-semibold mb-2">LTV Promedio</h3>
          <p className="text-3xl font-bold">
            ${(businessMetrics.avgLTV / 1000).toFixed(0)}k
          </p>
          <p className="text-sm opacity-90">+15% vs año anterior</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Ingresos y Beneficios Mensuales</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toLocaleString('es-CO')}`, '']} />
              <Legend />
              <Bar dataKey="revenue" fill="#3B82F6" name="Ingresos" />
              <Bar dataKey="profit" fill="#10B981" name="Beneficios" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Retención y Nuevos Clientes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={clientRetention}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="retention" stroke="#8884d8" name="Retención %" />
              <Line type="monotone" dataKey="new" stroke="#82ca9d" name="Nuevos Clientes" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Plan Distribution */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Distribución de Planes</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {planDistribution.map(plan => (
            <div key={plan.name} className="text-center">
              <div
                className="w-32 h-32 mx-auto mb-2"
                style={{ backgroundColor: plan.color + '20' }}
              >
                <PieChart width={128} height={128}>
                  <Pie
                    data={[plan]}
                    cx="50%"
                    cy="50%"
                    innerRadius={32}
                    outerRadius={64}
                    dataKey="value"
                  >
                    <Cell fill={plan.color} />
                  </Pie>
                </PieChart>
              </div>
              <h4 className="font-semibold">{plan.name}</h4>
              <p className="text-2xl font-bold" style={{ color: plan.color }}>
                {plan.value}
              </p>
              <p className="text-sm text-gray-600">clínicas</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderClients = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Top Clientes por Ingresos</h3>
          <div className="space-y-3">
            {clients.slice(0, 5).map((client, index) => (
              <div key={client.id} className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold mr-3">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-gray-600">{client.plan}</p>
                  </div>
                </div>
                <span className="font-bold">${client.monthlyRevenue.toLocaleString('es-CO')}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Crecimiento por Región</h3>
          <div className="space-y-3">
            {[
              { region: 'Bogotá', growth: 35, clients: 180 },
              { region: 'Medellín', growth: 28, clients: 120 },
              { region: 'Cali', growth: 42, clients: 85 },
              { region: 'Barranquilla', growth: 18, clients: 45 }
            ].map((region, index) => (
              <div key={region.region} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{region.region}</p>
                  <p className="text-sm text-gray-600">{region.clients} clínicas</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${region.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {region.growth > 0 ? '+' : ''}{region.growth}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Tasa de Abandono</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-red-600 mb-2">8.2%</div>
            <p className="text-gray-600">Este mes</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Gratis → Básico</span>
                <span className="text-green-600">+12%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Básico → Prof</</span>
                <span className="text-green-600">+18%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Cancelaciones</span>
                <span className="text-red-600">-5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Client List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Todas las Clínicas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-4">Clínica</th>
                <th className="text-left py-3 px-4">Plan</th>
                <th className="text-left py-3 px-4">Ingreso Mensual</th>
                <th className="text-left py-3 px-4">Desde</th>
                <th className="text-left py-3 px-4">Estado</th>
                <th className="text-left py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-gray-600">{client.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      client.plan === 'Enterprise' ? 'bg-purple-100 text-purple-800' :
                      client.plan === 'Profesional' ? 'bg-blue-100 text-blue-800' :
                      client.plan === 'Básico' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {client.plan}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium">
                    ${client.monthlyRevenue.toLocaleString('es-CO')}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(client.since).toLocaleDateString('es-CO')}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      client.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {client.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-blue-600 hover:text-blue-800 mr-2">
                      Ver
                    </button>
                    <button className="text-green-600 hover:text-green-800">
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderMarketing = () => (
    <div className="space-y-6">
      {/* Marketing Funnel */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Embudo de Marketing</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="bg-blue-100 p-4 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">10,000</div>
              <p className="text-sm text-gray-600 mt-1">Visitas</p>
            </div>
            <div className="h-1 w-full bg-gray-200 my-2"></div>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 p-4 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">2,500</div>
              <p className="text-sm text-gray-600 mt-1">Registros</p>
            </div>
            <div className="h-1 w-full bg-gray-200 my-2"></div>
          </div>
          <div className="text-center">
            <div className="bg-green-100 p-4 rounded-lg">
              <div className="text-3xl font-bold text-green-600">500</div>
              <p className="text-sm text-gray-600 mt-1">Pruebas</p>
            </div>
            <div className="h-1 w-full bg-gray-200 my-2"></div>
          </div>
          <div className="text-center">
            <div className="bg-orange-100 p-4 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">150</div>
              <p className="text-sm text-gray-600 mt-1">Conversiones</p>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-600">Tasa de Conversión</p>
            <p className="font-bold">1.5%</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Costo por Lead</p>
            <p className="font-bold">$12,500</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">CAC</p>
            <p className="font-bold">$83,333</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">ROI</p>
            <p className="font-bold">240%</p>
          </div>
        </div>
      </div>

      {/* Campaign Performance */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Desempeño de Campañas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'SEO Orgánico', leads: 450, cost: 0, roi: '∞' },
            { name: 'Google Ads', leads: 280, cost: 2500000, roi: '112%' },
            { name: 'LinkedIn', leads: 120, cost: 1800000, roi: '67%' },
            { name: 'Email Marketing', leads: 85, cost: 500000, roi: '170%' },
            { name: 'Referidos', leads: 200, cost: 300000, roi: '667%' },
            { name: 'Redes Sociales', leads: 150, cost: 1200000, roi: '125%' }
          ].map(campaign => (
            <div key={campaign.name} className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">{campaign.name}</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Leads:</span>
                  <span className="font-bold">{campaign.leads}</span>
                </div>
                <div className="flex justify-between">
                  <span>Costo:</span>
                  <span className="font-bold">${campaign.cost.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between">
                  <span>ROI:</span>
                  <span className={`font-bold ${
                    parseInt(campaign.roi) > 200 ? 'text-green-600' :
                    parseInt(campaign.roi) > 100 ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {campaign.roi}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Strategy */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Estrategia de Contenido</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">Contenido Popular</h4>
            <div className="space-y-2">
              {[
                { title: 'Guía: Implementar telemedicina en 7 días', views: 12500 },
                { title: 'Cómo optimizar turnos con IA', views: 9800 },
                { title: 'Integración con Epic EHR', views: 7500 },
                { title: 'Mejores prácticas HIPAA 2024', views: 6200 }
              ].map(content => (
                <div key={content.title} className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm">{content.title}</span>
                  <span className="text-xs text-gray-600">{content.views.toLocaleString()} vistas</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Próximos Contenidos</h4>
            <div className="space-y-2">
              {[
                { title: 'Webinar: AI en diagnóstico', date: '15/05', status: 'En producción' },
                { title: 'Ebook: Transformación digital', date: '20/05', status: 'Borrador' },
                { title: 'Caso de estudio: Clínica XYZ', date: '25/05', status: 'Revisión' },
                { title: 'Video tutorial: Setup rápido', date: '30/05', status: 'Planificado' }
              ].map(content => (
                <div key={content.title} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <p className="text-sm font-medium">{content.title}</p>
                    <p className="text-xs text-gray-600">{content.date} • {content.status}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    content.status === 'En producción' ? 'bg-blue-100 text-blue-800' :
                    content.status === 'Borrador' ? 'bg-gray-100 text-gray-800' :
                    content.status === 'Revisión' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {content.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
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
        <h1 className="text-3xl font-bold mb-2">Dashboard Administrativo - Negocio</h1>
        <p className="text-gray-600">Métricas, clientes y marketing de la plataforma</p>
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
            Resumen General
          </button>
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'clients'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('clients')}
          >
            Clientes
          </button>
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'marketing'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('marketing')}
          >
            Marketing
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'clients' && renderClients()}
      {activeTab === 'marketing' && renderMarketing()}
    </div>
  );
};

export default AdminBusinessDashboard;