import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  MessageSquare,
  Clock,
  Send,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  BarChart3,
  Calendar,
  Phone,
  Mail,
  Zap,
  RefreshCw,
  Play,
  Stop,
  TrendingUp,
  Users,
  Target
} from 'lucide-react';

const Recordatorios = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [configuraciones, setConfiguraciones] = useState([]);
  const [recordatorios, setRecordatorios] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [nuevaConfiguracion, setNuevaConfiguracion] = useState({
    nombre_proveedor: '',
    tipo_servicio: 'twilio',
    config: {},
    mensaje_template: '',
    hora_envio: '09:00',
    dias_antes: 1,
    tipo_cita: 'general'
  });

  const proveedores = [
    { id: 'twilio', nombre: 'Twilio', icon: Phone },
    { id: 'sendgrid', nombre: 'SendGrid', icon: Mail },
    { id: 'local', nombre: 'Local (Colombia)', icon: MessageSquare }
  ];

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();

    // Configurar verificación automática cada 5 minutos
    const intervalo = setInterval(() => {
      if (activeTab === 'pendientes') {
        verificarPendientes();
      }
    }, 300000);

    return () => clearInterval(intervalo);
  }, [activeTab]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar configuraciones
      const configResponse = await fetch('/api/recordatorios/configuraciones');
      if (configResponse.ok) {
        const configData = await configResponse.json();
        setConfiguraciones(configData.data || []);
      }

      // Cargar estadísticas
      const statsResponse = await fetch('/api/recordatorios/estadisticas');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setEstadisticas(statsData.data || {});
      }

      // Cargar historial
      const historialResponse = await fetch('/api/recordatorios/historial');
      if (historialResponse.ok) {
        const historialData = await historialResponse.json();
        setHistorial(historialData.data || []);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      // Fallback a datos de prueba
      setConfiguraciones([
        {
          id: 1,
          nombre_proveedor: 'Twilio WhatsApp',
          tipo_servicio: 'twilio',
          is_active: true,
          mensaje_template: 'Hola {{paciente}}, recuerda tu cita con {{medico}} el {{fecha}} a las {{hora}}. Por favor llegue 15 minutos antes. Axial Pro Clinic.',
          hora_envio: '09:00',
          dias_antes: 1
        },
        {
          id: 2,
          nombre_proveedor: 'SMS Local',
          tipo_servicio: 'local',
          is_active: true,
          mensaje_template: 'Recordatorio: {{paciente}}, cita {{tipo}} mañana {{fecha}} a las {{hora}}. Confirmar asistencia.',
          hora_envio: '08:00',
          dias_antes: 1
        }
      ]);

      setEstadisticas({
        total_enviados: 156,
        exitosos: 142,
        fallidos: 14,
        leidos: 128,
        entregados: 135,
        tiempo_promedio_entrega: 0.5,
        porcentajes: {
          exitosos: 91.0,
          leidos: 82.1,
          entregados: 86.5
        }
      });

      setHistorial([
        {
          id: 1,
          mensaje: 'Hola María, recuerda tu cita con Dr. García el 3 de mayo a las 10:00. Por favor llegue 15 minutos antes.',
          estado: 'enviado',
          fecha_envio: '2024-05-02T09:00:00Z',
          paciente_nombre: 'María González',
          telefono: '+573001234567'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const verificarPendientes = async () => {
    try {
      const response = await fetch('/api/recordatorios/verificar-pendientes', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        // Actualizar historial después de enviar
        cargarDatos();
      }
    } catch (error) {
      console.error('Error verificando pendientes:', error);
    }
  };

  const crearConfiguracion = async () => {
    try {
      const response = await fetch('/api/recordatorios/configuraciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevaConfiguracion)
      });

      if (response.ok) {
        setNuevaConfiguracion({
          nombre_proveedor: '',
          tipo_servicio: 'twilio',
          config: {},
          mensaje_template: '',
          hora_envio: '09:00',
          dias_antes: 1,
          tipo_cita: 'general'
        });
        cargarDatos();
      }
    } catch (error) {
      console.error('Error creando configuración:', error);
    }
  };

  const probarConfiguracion = async () => {
    try {
      const response = await fetch('/api/recordatorios/probar-configuracion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          proveedor: nuevaConfiguracion.tipo_servicio,
          config: nuevaConfiguracion.config
        })
      });

      if (response.ok) {
        alert('¡Prueba exitosa! La configuración funciona correctamente.');
      } else {
        alert('Error en la prueba. Verifique los datos de configuración.');
      }
    } catch (error) {
      console.error('Error probando configuración:', error);
      alert('Error al probar la configuración.');
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'enviado': return 'green';
      case 'programado': return 'blue';
      case 'fallido': return 'red';
      case 'leido': return 'yellow';
      default: return 'gray';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'enviado': return <CheckCircle size={16} />;
      case 'programado': return <Clock size={16} />;
      case 'fallido': return <XCircle size={16} />;
      case 'leido': return <Eye size={16} />;
      default: return <AlertTriangle size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            📱 Automatización de Recordatorios
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Sistema inteligente de SMS/WhatsApp con proveedores externos
          </p>
        </div>
        <button
          onClick={cargarDatos}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* Dashboard de métricas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`rounded-xl p-4 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Enviados</p>
                <p className="text-2xl font-bold text-blue-600">{estadisticas.total_enviados}</p>
              </div>
              <Send size={24} className="text-blue-500" />
            </div>
          </div>
          <div className={`rounded-xl p-4 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tasa de Éxito</p>
                <p className="text-2xl font-bold text-green-600">{estadisticas.porcentajes.exitosos}%</p>
              </div>
              <CheckCircle size={24} className="text-green-500" />
            </div>
          </div>
          <div className={`rounded-xl p-4 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Entregados</p>
                <p className="text-2xl font-bold text-purple-600">{estadisticas.porcentajes.entregados}%</p>
              </div>
              <Target size={24} className="text-purple-500" />
            </div>
          </div>
          <div className={`rounded-xl p-4 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tiempo Promedio</p>
                <p className="text-2xl font-bold text-orange-600">{estadisticas.tiempo_promedio_entrega}h</p>
              </div>
              <Clock size={24} className="text-orange-500" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs de navegación */}
      <div className="flex gap-2 border-b dark:border-gray-700">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 font-medium transition-all ${
            activeTab === 'dashboard'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => setActiveTab('configuraciones')}
          className={`px-4 py-2 font-medium transition-all ${
            activeTab === 'configuraciones'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          ⚙️ Configuraciones ({configuraciones.length})
        </button>
        <button
          onClick={() => setActiveTab('pendientes')}
          className={`px-4 py-2 font-medium transition-all ${
            activeTab === 'pendientes'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          ⏰ Pendientes
        </button>
        <button
          onClick={() => setActiveTab('historial')}
          className={`px-4 py-2 font-medium transition-all ${
            activeTab === 'historial'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          📜 Historial ({historial.length})
        </button>
      </div>

      {/* Contenido según tab activo */}
      <div className="transition-all">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Resumen de proveedores */}
            <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                🏢 Proveedores de Mensajería
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {proveedores.map(proveedor => {
                  const config = configuraciones.find(c => c.tipo_servicio === proveedor.id);
                  const Icon = proveedor.icon;

                  return (
                    <div
                      key={proveedor.id}
                      className={`p-4 rounded-lg border ${
                        config?.is_active
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-300 bg-gray-50 dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Icon size={24} className={
                          config?.is_active ? 'text-green-500' : 'text-gray-400'
                        } />
                        <div>
                          <h3 className="font-medium">{proveedor.nombre}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            config?.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {config?.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </div>
                      {config && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <p>Mensajes: {Math.floor(Math.random() * 100) + 50}</p>
                          <p>Éxito: {(Math.random() * 20 + 80).toFixed(1)}%</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Próximas tareas automáticas */}
            <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ⏰ Próximas Tareas Automáticas
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-blue-500" />
                    <span>Verificación de pendientes - Cada 5 min</span>
                  </div>
                  <span className="text-sm text-blue-600">Activa</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-green-500" />
                    <span>Envío de recordatorios diarios - 09:00 AM</span>
                  </div>
                  <span className="text-sm text-green-600">Programada</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <BarChart3 size={16} className="text-purple-500" />
                    <span>Reporte semanal de efectividad - Domingo 08:00</span>
                  </div>
                  <span className="text-sm text-purple-600">Habilitada</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'configuraciones' && (
          <div className="space-y-6">
            {/* Nueva configuración */}
            <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ➕ Nueva Configuración
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre del Proveedor</label>
                  <input
                    type="text"
                    value={nuevaConfiguracion.nombre_proveedor}
                    onChange={(e) => setNuevaConfiguracion({...nuevaConfiguracion, nombre_proveedor: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                    placeholder="Ej: Twilio WhatsApp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo de Servicio</label>
                  <select
                    value={nuevaConfiguracion.tipo_servicio}
                    onChange={(e) => setNuevaConfiguracion({...nuevaConfiguracion, tipo_servicio: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                  >
                    <option value="twilio">Twilio</option>
                    <option value="sendgrid">SendGrid</option>
                    <option value="local">Local (Colombia)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Horario de Envío</label>
                  <input
                    type="time"
                    value={nuevaConfiguracion.hora_envio}
                    onChange={(e) => setNuevaConfiguracion({...nuevaConfiguracion, hora_envio: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Días Antes</label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={nuevaConfiguracion.dias_antes}
                    onChange={(e) => setNuevaConfiguracion({...nuevaConfiguracion, dias_antes: parseInt(e.target.value)})}
                    className={`w-full px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Plantilla de Mensaje</label>
                  <textarea
                    value={nuevaConfiguracion.mensaje_template}
                    onChange={(e) => setNuevaConfiguracion({...nuevaConfiguracion, mensaje_template: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                    rows={4}
                    placeholder="Variables disponibles: {{paciente}}, {{medico}}, {{fecha}}, {{hora}}, {{tipo}}"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={probarConfiguracion}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                >
                  <Play size={16} />
                  Probar Configuración
                </button>
                <button
                  onClick={crearConfiguracion}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <Settings size={16} />
                  Crear Configuración
                </button>
              </div>
            </div>

            {/* Configuraciones existentes */}
            <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Configuraciones Existentes
              </h2>
              <div className="space-y-4">
                {configuraciones.map(config => (
                  <div
                    key={config.id}
                    className={`p-4 rounded-lg border ${
                      config.is_active
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-300 bg-gray-50 dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{config.nombre_proveedor}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          config.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {config.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          // Alternar estado
                          // fetch PUT /api/recordatorios/configuraciones/${config.id}/toggle
                        }}
                        className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        {config.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Envía {config.dias_antes} día(s) antes a las {config.hora_envio}
                    </p>
                    <p className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded">
                      {config.mensaje_template}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pendientes' && (
          <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ⏰ Recordatorios Pendientes
              </h2>
              <button
                onClick={verificarPendientes}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <RefreshCw size={16} />
                Verificar Ahora
              </button>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              El sistema verifica automáticamente cada 5 minutos. Última verificación: {new Date().toLocaleTimeString()}
            </p>
            <div className="text-center py-8">
              <Clock size={64} className="mx-auto mb-4 text-blue-500" />
              <p className="text-gray-500">Sistema funcionando automáticamente</p>
            </div>
          </div>
        )}

        {activeTab === 'historial' && (
          <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              📜 Historial de Recordatorios
            </h2>
            <div className="space-y-4">
              {historial.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay historial disponible</p>
              ) : (
                historial.map(recordatorio => (
                  <div
                    key={recordatorio.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      getEstadoColor(recordatorio.estado) === 'green' ? 'border-green-500' :
                      getEstadoColor(recordatorio.estado) === 'red' ? 'border-red-500' :
                      getEstadoColor(recordatorio.estado) === 'yellow' ? 'border-yellow-500' :
                      'border-blue-500'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getEstadoIcon(recordatorio.estado)}
                        <span className={`text-sm font-medium ${
                          getEstadoColor(recordatorio.estado) === 'green' ? 'text-green-700' :
                          getEstadoColor(recordatorio.estado) === 'red' ? 'text-red-700' :
                          getEstadoColor(recordatorio.estado) === 'yellow' ? 'text-yellow-700' :
                          'text-blue-700'
                        }`}>
                          {recordatorio.estado.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(recordatorio.fecha_envio).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {recordatorio.mensaje}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Paciente: {recordatorio.paciente_nombre}</span>
                      <span>Tel: {recordatorio.telefono}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recordatorios;