import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  AlertTriangle,
  DollarSign,
  Shield,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Users,
  Zap,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckSquare,
  FileText,
  Target,
  Activity
} from 'lucide-react';

const AnomaliasFinancieras = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [anomalias, setAnomalias] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeveridad, setSelectedSeveridad] = useState('all');
  const [selectedTipo, setSelectedTipo] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('alertas');
  const [autoDetect, setAutoDetect] = useState(true);

  const tiposAnomalia = [
    { id: 'all', label: 'Todos', color: 'gray', icon: AlertTriangle },
    { id: 'fraude', label: 'Fraude', color: 'red', icon: Shield },
    { id: 'error', label: 'Error', color: 'yellow', icon: AlertCircle },
    { id: 'sospecha', label: 'Sospecha', color: 'orange', icon: Eye },
    { id: 'limite_excedido', label: 'Límite Excedido', color: 'purple', icon: Target }
  ];

  const severidades = [
    { id: 'all', label: 'Todas' },
    { id: 'critica', label: 'Críticas', color: 'red' },
    { id: 'alta', label: 'Altas', color: 'orange' },
    { id: 'media', label: 'Medias', color: 'yellow' },
    { id: 'baja', label: 'Bajas', color: 'green' }
  ];

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();

    // Configurar detección automática
    let intervalo;
    if (autoDetect) {
      intervalo = setInterval(() => {
        cargarDatos();
      }, 30000); // Cada 30 segundos
    }

    return () => {
      if (intervalo) clearInterval(intervalo);
    };
  }, [autoDetect]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar alertas
      const alertasResponse = await fetch('/api/anomalias');
      if (alertasResponse.ok) {
        const alertasData = await alertasResponse.json();
        setAnomalias(alertasData.data || []);
      }

      // Cargar estadísticas
      const statsResponse = await fetch('/api/anomalias/estadisticas');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setEstadisticas(statsData.data || {});
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      // Fallback a datos de prueba
      setAnomalias([
        {
          id: 1,
          tipo_anomalia: 'fraude',
          severidad: 'critica',
          nivel_riesgo: 9,
          titulo: '🚨 Transacción Fraudulenta Detectada',
          descripcion: 'Monto extremadamente alto detectado en tarjeta de crédito',
          detalles: {
            monto_transaccion: 500000,
            umbral_normal: 200000,
            diferencia: 300000,
            porcentaje_exceso: 150
          },
          recomendacion: 'Requerir validación administrativa inmediata. Verificar identidad del paciente.',
          paciente_nombre: 'Juan Pérez',
          usuario_nombre: 'Dr. María López',
          fecha_creacion: new Date().toISOString(),
          estado: 'pendiente'
        },
        {
          id: 2,
          tipo_anomalia: 'error',
          severidad: 'media',
          nivel_riesgo: 5,
          titulo: '⚠️ Error en Monto de Transacción',
          descripcion: 'Monto redondo detectado, posible error de entrada',
          detalles: {
            monto_transaccion: 25000,
            es_redondo: true,
            posible_error: 'Monto redondo podría indicar error de entrada'
          },
          recomendacion: 'Revisar la transacción para confirmar que es correcta.',
          paciente_nombre: 'Ana García',
          usuario_nombre: 'Carlos Rodríguez',
          fecha_creacion: new Date().toISOString(),
          estado: 'investigando'
        }
      ]);

      setEstadisticas({
        transacciones: {
          total: 1247,
          monto_total: 84567890,
          monto_promedio: 67850,
          pagos: 1156,
          reembolsos: 67,
          devoluciones: 24,
          fraudulentas: 3
        },
        alertas: {
          total: 45,
          criticas: 5,
          altas: 12,
          medias: 18,
          bajas: 10
        },
        porcentajes: {
          tasa_fraude: 0.24,
          alertas_criticas: 11
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const investigarAnomalia = async (id) => {
    try {
      const response = await fetch(`/api/anomalias/${id}/investigar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user?.id,
          notas: 'Iniciando investigación...'
        })
      });

      if (response.ok) {
        cargarDatos();
      }
    } catch (error) {
      console.error('Error investigando anomalía:', error);
    }
  };

  const resolverAnomalia = async (id, esFalsaPositiva = false) => {
    try {
      const response = await fetch(`/api/anomalias/${id}/resolver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user?.id,
          conclusion: esFalsaPositiva ? 'Falsa positiva - Transacción legítima' : 'Investigación completada',
          es_falsa_positiva: esFalsaPositiva
        })
      });

      if (response.ok) {
        cargarDatos();
      }
    } catch (error) {
      console.error('Error resolviendo anomalía:', error);
    }
  };

  const getSeveridadColor = (severidad) => {
    switch (severidad) {
      case 'critica': return 'red';
      case 'alta': return 'orange';
      case 'media': return 'yellow';
      case 'baja': return 'green';
      default: return 'gray';
    }
  };

  const getTipoIcon = (tipo) => {
    const tipoData = tiposAnomalia.find(t => t.id === tipo);
    return tipoData ? tipoData.icon : AlertTriangle;
  };

  const getTipoColor = (tipo) => {
    const tipoData = tiposAnomalia.find(t => t.id === tipo);
    return tipoData ? tipoData.color : 'gray';
  };

  const filteredAnomalias = anomalias.filter(anomalia => {
    const matchSeveridad = selectedSeveridad === 'all' || anomalia.severidad === selectedSeveridad;
    const matchTipo = selectedTipo === 'all' || anomalia.tipo_anomalia === selectedTipo;
    const matchSearch = anomalia.paciente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       anomalia.titulo.toLowerCase().includes(searchTerm.toLowerCase());

    return matchSeveridad && matchTipo && matchSearch;
  });

  const totalAnomalias = anomalias.length;
  const criticas = anomalias.filter(a => a.severidad === 'critica').length;
  const altas = anomalias.filter(a => a.severidad === 'alta').length;
  const enInvestigacion = anomalias.filter(a => a.estado === 'investigando').length;
  const pendientes = anomalias.filter(a => a.estado === 'pendiente').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            🛡️ Detección de Anomalías Financieras
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Sistema inteligente para detección de fraudes y errores en transacciones
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setAutoDetect(!autoDetect)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              autoDetect
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <Zap size={16} />
            {autoDetect ? 'Auto-detectando' : 'Auto-detectar'}
          </button>
          <button
            onClick={cargarDatos}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Dashboard de estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`rounded-xl p-4 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Alertas Activas</p>
                <p className="text-2xl font-bold text-red-600">{estadisticas.alertas?.total || 0}</p>
              </div>
              <AlertTriangle size={24} className="text-red-500" />
            </div>
          </div>
          <div className={`rounded-xl p-4 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Transacciones</p>
                <p className="text-2xl font-bold text-blue-600">{estadisticas.transacciones?.total || 0}</p>
              </div>
              <DollarSign size={24} className="text-blue-500" />
            </div>
          </div>
          <div className={`rounded-xl p-4 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tasa de Fraude</p>
                <p className="text-2xl font-bold text-purple-600">{estadisticas.porcentajes?.tasa_fraude || 0}%</p>
              </div>
              <Shield size={24} className="text-purple-500" />
            </div>
          </div>
          <div className={`rounded-xl p-4 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Riesgo Promedio</p>
                <p className="text-2xl font-bold text-orange-600">{estadisticas.riesgo_promedio || 0}/10</p>
              </div>
              <TrendingUp size={24} className="text-orange-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por paciente o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedSeveridad}
              onChange={(e) => setSelectedSeveridad(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {severidades.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            <select
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {tiposAnomalia.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resumen de estados */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`rounded-xl p-4 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Críticas</p>
              <p className="text-xl font-bold text-red-600">{criticas}</p>
            </div>
            <XCircle size={20} className="text-red-500" />
          </div>
        </div>
        <div className={`rounded-xl p-4 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Altas</p>
              <p className="text-xl font-bold text-orange-600">{altas}</p>
            </div>
            <AlertCircle size={20} className="text-orange-500" />
          </div>
        </div>
        <div className={`rounded-xl p-4 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">En Investigación</p>
              <p className="text-xl font-bold text-yellow-600">{enInvestigacion}</p>
            </div>
            <Clock size={20} className="text-yellow-500" />
          </div>
        </div>
        <div className={`rounded-xl p-4 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pendientes</p>
              <p className="text-xl font-bold text-blue-600">{pendientes}</p>
            </div>
            <Eye size={20} className="text-blue-500" />
          </div>
        </div>
      </div>

      {/* Lista de anomalías */}
      <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Anomalías Detectadas ({filteredAnomalias.length})
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw size={24} className="animate-spin text-blue-500" />
          </div>
        ) : filteredAnomalias.length === 0 ? (
          <div className="text-center py-8">
            <CheckSquare size={64} className="mx-auto mb-4 text-green-500" />
            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              No se encontraron anomalías
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              El sistema funciona correctamente sin detectar anomalías
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAnomalias.map((anomalia) => {
              const IconComponent = getTipoIcon(anomalia.tipo_anomalia);
              return (
                <div
                  key={anomalia.id}
                  className={`rounded-lg p-6 border-l-4 ${
                    getSeveridadColor(anomalia.severidad) === 'red' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                    getSeveridadColor(anomalia.severidad) === 'orange' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' :
                    getSeveridadColor(anomalia.severidad) === 'yellow' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                    getSeveridadColor(anomalia.severidad) === 'green' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                    'border-gray-500 bg-gray-50 dark:bg-gray-700'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        getTipoColor(anomalia.tipo_anomalia) === 'red' ? 'bg-red-100 dark:bg-red-900/20' :
                        getTipoColor(anomalia.tipo_anomalia) === 'orange' ? 'bg-orange-100 dark:bg-orange-900/20' :
                        getTipoColor(anomalia.tipo_anomalia) === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                        getTipoColor(anomalia.tipo_anomalia) === 'green' ? 'bg-green-100 dark:bg-green-900/20' :
                        'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        <IconComponent size={20} />
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {anomalia.titulo}
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            getSeveridadColor(anomalia.severidad) === 'red' ? 'bg-red-100 text-red-700' :
                            getSeveridadColor(anomalia.severidad) === 'orange' ? 'bg-orange-100 text-orange-700' :
                            getSeveridadColor(anomalia.severidad) === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                            getSeveridadColor(anomalia.severidad) === 'green' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {anomalia.severidad.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Nivel Riesgo: {anomalia.nivel_riesgo}/10
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(anomalia.fecha_creacion).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {anomalia.estado === 'pendiente' && (
                        <button
                          onClick={() => investigarAnomalia(anomalia.id)}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                        >
                          Investigar
                        </button>
                      )}
                      {anomalia.estado === 'investigando' && (
                        <>
                          <button
                            onClick={() => resolverAnomalia(anomalia.id, false)}
                            className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                          >
                            Resolver
                          </button>
                          <button
                            onClick={() => resolverAnomalia(anomalia.id, true)}
                            className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                          >
                            Falso Positivo
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Descripción */}
                  <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {anomalia.descripcion}
                  </p>

                  {/* Detalles */}
                  <div className={`rounded-lg p-4 mb-4 ${
                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Detalles de la anomalía:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {Object.entries(anomalia.detalles || {}).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{key}:</span>
                          <span className={isDark ? 'text-white' : 'text-gray-900'}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Paciente y Usuario */}
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        Paciente: {anomalia.paciente_nombre}
                      </span>
                      <span className="mx-2">•</span>
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        Usuario: {anomalia.usuario_nombre}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      anomalia.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                      anomalia.estado === 'investigando' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {anomalia.estado.toUpperCase()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnomaliasFinancieras;