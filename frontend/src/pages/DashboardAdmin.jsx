import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Calendar, CreditCard, TrendingUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import DashboardWidgets from '../components/DashboardWidgets';
import AnimatedCharts from '../components/AnimatedCharts';

const DashboardAdmin = () => {
  const { isDark } = useTheme();

  const [stats, setStats] = useState({
    totalPacientes: 0,
    citasHoy: 0,
    sesionesHoy: 0,
    ingresosHoy: 0
  });
  const [loading, setLoading] = useState(true);
  const [proximasCitas, setProximasCitas] = useState([]);
  const [sesionesEnProgreso, setSesionesEnProgreso] = useState([]);
  const [activeTab, setActiveTab] = useState('resumen');

  // Estado para widgets personalizados
  const [widgetOrder, setWidgetOrder] = useState(() => {
    const saved = localStorage.getItem('dashboardWidgetOrder');
    return saved ? JSON.parse(saved) : ['stats', 'citas', 'sesiones'];
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    localStorage.setItem('dashboardWidgetOrder', JSON.stringify(widgetOrder));
  }, [widgetOrder]);

  const moveWidget = (currentIndex, newIndex) => {
    const newOrder = [...widgetOrder];
    const [movedWidget] = newOrder.splice(currentIndex, 1);
    newOrder.splice(newIndex, 0, movedWidget);
    setWidgetOrder(newOrder);
  };

  const moveUp = (index) => {
    if (index > 0) {
      moveWidget(index, index - 1);
    }
  };

  const moveDown = (index) => {
    if (index < widgetOrder.length - 1) {
      moveWidget(index, index + 1);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.centro-salud.agentesia.cloud';
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch pacientes count
      const pacientesResponse = await fetch(`${API_URL}/api/pacientes`, { headers });
      const pacientesData = await pacientesResponse.json();
      const totalPacientes = pacientesData.length || 0;

      // Fetch citas de hoy
      const today = new Date().toISOString().split('T')[0];
      const citasResponse = await fetch(`${API_URL}/api/citas`, { headers });
      const citasData = await citasResponse.json();
      const citasHoy = Array.isArray(citasData) ? citasData.filter(cita =>
        cita.fecha_hora && cita.fecha_hora.startsWith(today)
      ).length : 0;

      // Fetch sesiones de hoy
      const sesionesResponse = await fetch(`${API_URL}/api/sesiones`, { headers });
      const sesionesData = await sesionesResponse.json();
      const sesionesHoy = Array.isArray(sesionesData) ? sesionesData.filter(sesion =>
        sesion.hora_inicio && sesion.hora_inicio.startsWith(today)
      ).length : 0;

      // Fetch ingresos de hoy
      const cajaResponse = await fetch(`${API_URL}/api/caja/cierre-caja`, { headers });
      const cajaData = await cajaResponse.json();
      const ingresosHoy = cajaData.sesiones?.facturado_hoy || 0;

      setStats({
        totalPacientes,
        citasHoy,
        sesionesHoy,
        ingresosHoy
      });

      // Próximas citas (hoy y futuras)
      const proximas = citasData
        .filter(cita => cita.fecha_hora >= today && cita.estado !== 'cancelada' && cita.estado !== 'atendido')
        .sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora))
        .slice(0, 4);
      setProximasCitas(proximas);

      // Sesiones en progreso
      const enProgreso = sesionesData.filter(sesion => sesion.estado === 'en_proceso').slice(0, 2);
      setSesionesEnProgreso(enProgreso);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: 'Total Pacientes',
      value: stats.totalPacientes,
      icon: Users,
      color: 'bg-blue-500',
      change: '+5%',
      changeType: 'positive'
    },
    {
      title: 'Citas Hoy',
      value: stats.citasHoy,
      icon: Calendar,
      color: 'bg-green-500',
      change: '+2',
      changeType: 'positive'
    },
    {
      title: 'Sesiones Hoy',
      value: stats.sesionesHoy,
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+3',
      changeType: 'positive'
    },
    {
      title: 'Ingresos Hoy',
      value: `$${stats.ingresosHoy.toLocaleString()}`,
      icon: CreditCard,
      color: 'bg-yellow-500',
      change: '+15%',
      changeType: 'positive'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Dashboard</h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Resumen del día de hoy</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('resumen')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'resumen'
                ? 'bg-blue-600 text-white'
                : isDark
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📊 Resumen
          </button>
          <button
            onClick={() => setActiveTab('graficos')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'graficos'
                ? 'bg-blue-600 text-white'
                : isDark
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📈 Gráficos
          </button>
          <button
            onClick={() => setWidgetOrder(['stats', 'citas', 'sesiones'])}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isDark
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ↺ Reset
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Cargando datos...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'resumen' ? (
            <>
              {/* Contenido del Resumen */}
          {widgetOrder.map((widgetType, widgetIndex) => {
            if (widgetType === 'stats') {
              return (
                <DashboardWidgets
                  key="stats"
                  title="Estadísticas"
                  onReorder={() => moveDown(widgetIndex)}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cards.map((card, index) => (
                      <div key={index} className={`rounded-lg shadow-lg p-6 transition-all duration-300 ${
                        isDark ? 'bg-gray-700' : 'bg-white'
                      }`}>
                        <div className="flex items-center">
                          <div className={`p-3 rounded-lg ${card.color}`}>
                            <card.icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="ml-4">
                            <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{card.title}</p>
                            <p className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{card.value}</p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <span className={`inline-flex items-center text-xs font-medium ${
                            card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            {card.change}
                          </span>
                          <span className={`text-xs ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>vs. ayer</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </DashboardWidgets>
              );
            }

            if (widgetType === 'citas') {
              return (
                <DashboardWidgets
                  key="citas"
                  title="Próximas Citas"
                  onReorder={() => {
                    if (widgetIndex > 0) moveUp(widgetIndex);
                    else moveDown(widgetIndex);
                  }}
                >
                  <div className="space-y-3">
                    {proximasCitas.length > 0 ? proximasCitas.map((cita) => (
                      <div key={cita.id} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                        isDark ? 'bg-gray-700' : 'bg-gray-50'
                      }`}>
                        <div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{cita.paciente_nombre}</p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {new Date(cita.fecha_hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - {cita.servicio_nombre}
                          </p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          cita.estado === 'confirmada' ? 'bg-green-100 text-green-800' :
                          cita.estado === 'esperando_abono' ? 'bg-yellow-100 text-yellow-800' :
                          cita.estado === 'en_sala' ? 'bg-blue-100 text-blue-800' :
                          isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {cita.estado === 'confirmada' ? 'Confirmada' :
                           cita.estado === 'esperando_abono' ? 'Abono Pendiente' :
                           cita.estado === 'en_sala' ? 'En Sala' :
                           cita.estado}
                        </span>
                      </div>
                    )) : (
                      <div className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        No hay próximas citas
                      </div>
                    )}
                  </div>
                </DashboardWidgets>
              );
            }

            if (widgetType === 'sesiones') {
              return (
                <DashboardWidgets
                  key="sesiones"
                  title="Sesiones en Progreso"
                  onReorder={() => {
                    if (widgetIndex < widgetOrder.length - 1) moveDown(widgetIndex);
                    else moveUp(widgetIndex);
                  }}
                >
                  <div className="space-y-3">
                    {sesionesEnProgreso.length > 0 ? sesionesEnProgreso.map((sesion) => (
                      <div key={sesion.id} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                        isDark ? 'bg-gray-700' : 'bg-gray-50'
                      }`}>
                        <div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{sesion.paciente_nombre}</p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{sesion.cabina_nombre} - {sesion.medico_nombre}</p>
                        </div>
                        <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          En Proceso
                        </span>
                      </div>
                    )) : (
                      <div className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        No hay sesiones en progreso
                      </div>
                    )}
                  </div>
                </DashboardWidgets>
              );
            }

            return null;
          })}
            </>
          ) : (
            <AnimatedCharts />
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardAdmin;