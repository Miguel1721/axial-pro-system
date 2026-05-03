import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  TrendingUp,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter,
  BarChart3,
  Users,
  Calendar,
  Target,
  Zap,
  AlertCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const OptimizacionCitas = () => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState('todos');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'https://centro-salud.agentesia.cloud:18001';
      const response = await fetch(`${API_URL}/api/optimizaciones/resumen`);
      const data = await response.json();

      if (data.success) {
        setResumen(data.data);
      }
    } catch (error) {
      console.error('Error cargando optimizaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const recalcularOptimizaciones = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://centro-salud.agentesia.cloud:18001';
      await fetch(`${API_URL}/api/optimizaciones/recalcular`, { method: 'POST' });
      await cargarDatos();
      alert('✅ Optimizaciones recalculadas correctamente');
    } catch (error) {
      console.error('Error recalculando:', error);
      alert('❌ Error al recalcular optimizaciones');
    }
  };

  const implementarOptimizacion = async (id) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://centro-salud.agentesia.cloud:18001';
      await fetch(`${API_URL}/api/optimizaciones/${id}/implementar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ implementado_por: 1 })
      });
      await cargarDatos();
      alert('✅ Optimización marcada como implementada');
    } catch (error) {
      console.error('Error implementando optimización:', error);
      alert('❌ Error al implementar optimización');
    }
  };

  const getTipoBadge = (tipo) => {
    const badges = {
      'reducir_vacios': {
        label: 'Reducir Vacíos',
        icon: Calendar,
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
      },
      'overbooking': {
        label: 'Overbooking',
        icon: Users,
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200'
      },
      'balancear_carga': {
        label: 'Balancear Carga',
        icon: Target,
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
      },
      'optimizar_tiempos': {
        label: 'Optimizar Tiempos',
        icon: Clock,
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200'
      },
      'reducir_noshows': {
        label: 'Reducir No-Shows',
        icon: Zap,
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
      }
    };
    return badges[tipo] || badges.reducir_vacios;
  };

  const getPrioridadBadge = (prioridad) => {
    const badges = {
      'alta': {
        label: 'Alta',
        color: 'bg-red-500 text-white'
      },
      'media': {
        label: 'Media',
        color: 'bg-yellow-500 text-white'
      },
      'baja': {
        label: 'Baja',
        color: 'bg-green-500 text-white'
      }
    };
    return badges[prioridad] || badges.media;
  };

  const filteredOptimizaciones = resumen?.optimizaciones?.filter(opt => {
    const matchTipo = filtroTipo === 'todos' || opt.tipo_optimizacion === filtroTipo;
    const matchPrioridad = filtroPrioridad === 'todos' || opt.prioridad === filtroPrioridad;
    return matchTipo && matchPrioridad;
  }) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!resumen) {
    return (
      <div className="text-center py-12">
        <Lightbulb className="mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-gray-600 dark:text-gray-400">No hay optimizaciones disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
            Optimización de Citas con IA
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Sistema inteligente para maximizar eficiencia de agenda
          </p>
        </div>
        <button
          onClick={recalcularOptimizaciones}
          className="p-3 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
          title="Recalcular optimizaciones"
        >
          <RefreshCw size={20} className="text-blue-600 dark:text-blue-400" />
        </button>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">Optimizaciones</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {resumen.total_optimizaciones}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Pendientes</p>
            </div>
            <Lightbulb className="text-green-500" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Impacto Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {resumen.estadisticas?.impacto_total || 0}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Citas afectadas</p>
            </div>
            <Target className="text-blue-500" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Tiempo Ahorrado</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {resumen.estadisticas?.tiempo_ahorrado_total || 0}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Minutos</p>
            </div>
            <Clock className="text-purple-500" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Ingresos Adicionales</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ${resumen.estadisticas?.ingresos_adicionales_total?.toFixed(0) || 0}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Estimado mensual</p>
            </div>
            <DollarSign className="text-orange-500" size={32} />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-500" />
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="todos">Todos los tipos</option>
            <option value="reducir_vacios">Reducir Vacíos</option>
            <option value="overbooking">Overbooking</option>
            <option value="balancear_carga">Balancear Carga</option>
            <option value="optimizar_tiempos">Optimizar Tiempos</option>
            <option value="reducir_noshows">Reducir No-Shows</option>
          </select>

          <select
            value={filtroPrioridad}
            onChange={(e) => setFiltroPrioridad(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="todos">Todas las prioridades</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>

        <div className="flex-1"></div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          {filteredOptimizaciones.length} de {resumen.total_optimizaciones} optimizaciones
        </div>
      </div>

      {/* Lista de Optimizaciones */}
      <div className="space-y-4">
        {filteredOptimizaciones.map((opt) => {
          const tipoBadge = getTipoBadge(opt.tipo_optimizacion);
          const prioridadBadge = getPrioridadBadge(opt.prioridad);
          const TipoIcon = tipoBadge.icon;

          return (
            <div key={opt.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <TipoIcon size={24} className="text-blue-500" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {opt.titulo}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${tipoBadge.color}`}>
                          <TipoIcon size={14} />
                          {tipoBadge.label}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${prioridadBadge.color}`}>
                          {prioridadBadge.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    {opt.descripcion}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {opt.impacto_estimado !== undefined && (
                      <div className="flex items-center gap-2">
                        <Target size={16} />
                        <span>Impacto: <strong>{opt.impacto_estimado}</strong> citas</span>
                      </div>
                    )}
                    {opt.ahorro_tiempo_minutos > 0 && (
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>Ahorro: <strong>{opt.ahorro_tiempo_minutos}</strong> min</span>
                      </div>
                    )}
                    {opt.aumento_ingresos > 0 && (
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} />
                        <span>Ingresos: <strong>+${opt.aumento_ingresos}</strong></span>
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>💡 Acción sugerida:</strong> {opt.accion_sugerida}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => implementarOptimizacion(opt.id)}
                    className="px-4 py-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-800 dark:text-green-200 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Implementar
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredOptimizaciones.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="mx-auto mb-4 text-green-400" size={48} />
            <p className="text-gray-600 dark:text-gray-400">
              ¡No hay optimizaciones pendientes con los filtros seleccionados!
            </p>
          </div>
        )}
      </div>

      {/* Información Adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
          <div className="flex items-start gap-3">
            <BarChart3 className="text-blue-500 mt-1" size={24} />
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                Análisis Continuo
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Nuestra IA analiza constantemente la agenda para identificar oportunidades de mejora.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl">
          <div className="flex items-start gap-3">
            <Zap className="text-green-500 mt-1" size={24} />
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                Impacto Real
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Las optimizaciones se basan en datos históricos y patrones reales de tu clínica.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizacionCitas;
