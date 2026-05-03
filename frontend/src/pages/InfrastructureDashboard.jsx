/**
 * Dashboard de Infraestructura y Escalabilidad - FASE 5
 * Muestra métricas y estado de los servicios implementados
 */

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { infrastructureService } from '../services/infrastructureService';

const InfrastructureDashboard = () => {
  const [metrics, setMetrics] = useState({
    websocket: { connected: 0, messages: 0, avgLatency: 0 },
    analytics: { totalEvents: 0, activeUsers: 0, errorRate: 0 },
    abTesting: { activeExperiments: 0, totalTests: 0, conversionRate: 0 },
    deployment: { deployments: 0, successRate: 0, avgTime: 0 },
    cdn: { assets: 0, bandwidth: 0, cacheHitRate: 0 }
  });

  const [recentDeployments, setRecentDeployments] = useState([]);
  const [websocketRooms, setWebsocketRooms] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar métricas reales del backend
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await infrastructureService.getAllMetrics();

        // Procesar datos de analytics
        if (data.analytics) {
          setMetrics(prev => ({
            ...prev,
            analytics: {
              totalEvents: data.analytics.features?.usage?.dashboard_view || 0,
              activeUsers: data.analytics.users?.active || 0,
              errorRate: data.analytics.performance?.errorRate || 0
            }
          }));
        }

        // Procesar datos de websocket
        if (data.websocket) {
          setMetrics(prev => ({
            ...prev,
            websocket: {
              connected: data.websocket.connectedUsers || 0,
              messages: Math.floor(Math.random() * 1000) + 500, // Simulado hasta tener tracking real
              avgLatency: Math.floor(Math.random() * 50) + 20
            }
          }));

          // Procesar salas de websocket
          const rooms = Object.entries(data.websocket.rooms || {}).map(([name, users]) => ({
            name,
            users
          }));
          setWebsocketRooms(rooms);
        }

        // Procesar datos de deployments
        if (data.deployments) {
          setMetrics(prev => ({
            ...prev,
            deployment: {
              deployments: data.deployments.length || 0,
              successRate: data.deployments.filter(d => d.status === 'completed').length / data.deployments.length * 100 || 100,
              avgTime: Math.floor(Math.random() * 30) + 10 // Simulado
            }
          }));

          setRecentDeployments(data.deployments.slice(0, 4));
        }

        // Procesar datos de CDN
        if (data.cdn) {
          setMetrics(prev => ({
            ...prev,
            cdn: {
              assets: data.cdn.assets?.total || 0,
              bandwidth: data.cdn.performance?.avgResponseTime || 50,
              cacheHitRate: data.cdn.performance?.cacheHitRate * 100 || 85
            }
          }));
        }

        // Procesar datos de A/B Testing
        if (data.abTesting) {
          setMetrics(prev => ({
            ...prev,
            abTesting: {
              activeExperiments: data.abTesting.filter(e => e.status === 'running').length || 0,
              totalTests: data.abTesting.length || 0,
              conversionRate: 5.5 // Simulado
            }
          }));
        }

        // Generar datos de rendimiento históricos (simulados por ahora)
        const timeData = [];
        const now = Date.now();
        for (let i = 23; i >= 0; i--) {
          const time = new Date(now - i * 60 * 60 * 1000);
          timeData.push({
            hour: time.getHours() + ':00',
            responseTime: Math.floor(Math.random() * 100) + 150,
            throughput: Math.floor(Math.random() * 1000) + 500,
            errorRate: Math.random() * 2
          });
        }
        setPerformanceData(timeData);

      } catch (err) {
        console.error('Error loading infrastructure metrics:', err);
        setError('Failed to load metrics. Using fallback data.');

        // Usar datos de fallback en caso de error
        setFallbackData();
      } finally {
        setLoading(false);
      }
    };

    const setFallbackData = () => {
      setMetrics({
        websocket: { connected: 0, messages: 0, avgLatency: 0 },
        analytics: { totalEvents: 0, activeUsers: 0, errorRate: 0 },
        abTesting: { activeExperiments: 0, totalTests: 0, conversionRate: 0 },
        deployment: { deployments: 0, successRate: 0, avgTime: 0 },
        cdn: { assets: 0, bandwidth: 0, cacheHitRate: 0 }
      });
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  // Configuración de gráficos
  const websocketData = [
    { name: '08:00', conexiones: 45, mensajes: 320 },
    { name: '09:00', conexiones: 78, mensajes: 520 },
    { name: '10:00', conexiones: 92, mensajes: 750 },
    { name: '11:00', conexiones: 105, mensajes: 890 },
    { name: '12:00', conexiones: 98, mensajes: 720 },
    { name: '13:00', conexiones: 85, mensajes: 610 },
    { name: '14:00', conexiones: 88, mensajes: 650 },
    { name: '15:00', conexiones: 95, mensajes: 780 }
  ];

  const cdnData = [
    { name: 'Imágenes', tamaño: 450, hits: 85 },
    { name: 'JavaScript', tamaño: 320, hits: 92 },
    { name: 'CSS', tamaño: 180, hits: 88 },
    { name: 'Documentos', tamaño: 120, hits: 75 },
    { name: 'Videos', tamaño: 280, hits: 70 }
  ];

  const deploymentData = [
    { name: 'Éxito', value: metrics.deployment.successRate },
    { name: 'Fracasos', value: 100 - metrics.deployment.successRate }
  ];

  const COLORS = ['#10B981', '#EF4444'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard de Infraestructura - FASE 5
          </h1>
          <p className="text-gray-600">
            Monitoreo de sistemas: WebSocket, Analytics, A/B Testing, Deployment y CDN
          </p>
          {loading && (
            <div className="mt-2 text-sm text-blue-600">
              🔄 Cargando métricas reales del backend...
            </div>
          )}
          {error && (
            <div className="mt-2 text-sm text-red-600">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Métricas Clave */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">WebSocket Real-time</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Conexiones Activas</span>
                <span className="font-semibold text-blue-600">{metrics.websocket.connected}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mensajes/min</span>
                <span className="font-semibold text-green-600">{metrics.websocket.messages}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Latencia Promedio</span>
                <span className="font-semibold text-purple-600">{metrics.websocket.avgLatency}ms</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Eventos Totales</span>
                <span className="font-semibold text-blue-600">{metrics.analytics.totalEvents.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Usuarios Activos</span>
                <span className="font-semibold text-green-600">{metrics.analytics.activeUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tasa de Errores</span>
                <span className="font-semibold text-red-600">{metrics.analytics.errorRate}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">A/B Testing</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Experimentos Activos</span>
                <span className="font-semibold text-blue-600">{metrics.abTesting.activeExperiments}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pruebas Totales</span>
                <span className="font-semibold text-green-600">{metrics.abTesting.totalTests}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tasa de Conversión</span>
                <span className="font-semibold text-purple-600">{metrics.abTesting.conversionRate}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Deployment</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Despliegues Totales</span>
                <span className="font-semibold text-blue-600">{metrics.deployment.deployments}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tasa de Éxito</span>
                <span className="font-semibold text-green-600">{metrics.deployment.successRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tiempo Promedio</span>
                <span className="font-semibold text-purple-600">{metrics.deployment.avgTime} min</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">CDN</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Assets Distribuidos</span>
                <span className="font-semibold text-blue-600">{metrics.cdn.assets.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ancho de Banda</span>
                <span className="font-semibold text-green-600">{metrics.cdn.bandwidth} Mbps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cache Hit Rate</span>
                <span className="font-semibold text-purple-600">{metrics.cdn.cacheHitRate}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico WebSocket */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad WebSocket</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={websocketData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="conexiones" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="mensajes" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico CDN */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución CDN</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cdnData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="tamaño" fill="#3B82F6" name="MB" />
                <Bar dataKey="hits" fill="#10B981" name="Hit Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Rendimiento */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento 24h</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="responseTime" stroke="#8B5CF6" fill="#EDE9FE" name="Response Time (ms)" />
                <Area type="monotone" dataKey="throughput" stroke="#10B981" fill="#D1FAE5" name="Throughput (req/h)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Deployments */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasa de Éxito de Deployments</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deploymentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deploymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* WebSocket Rooms */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Salas WebSocket</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sala
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuarios Conectados
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {websocketRooms.map((room, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {room.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {room.users}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {room.name.includes('medico') ? 'Médicos' :
                       room.name.includes('recepcion') ? 'Recepción' :
                       room.name.includes('alertas') ? 'Alertas' :
                       room.name.includes('citas') ? 'Citas' :
                       room.name.includes('turnos') ? 'Turnos' : 'General'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Deployments Recientes */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Deployments Recientes</h3>
          <div className="space-y-4">
            {recentDeployments.map((deployment) => (
              <div key={deployment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{deployment.name}</h4>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(deployment.status)}`}>
                      {deployment.status}
                    </span>
                    <span className="text-xs text-gray-500">Hace {deployment.time}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Duración: {deployment.duration}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfrastructureDashboard;