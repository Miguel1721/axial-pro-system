import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Calendar,
  Clock,
  AlertTriangle,
  Activity,
  BarChart3,
  RefreshCw,
  Info,
  CheckCircle,
  XCircle,
  Zap
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const PrediccionDemanda = () => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState(null);
  const [vista, setVista] = useState('dashboard'); // 'dashboard', 'dias_criticos', 'estadisticas'
  const [ultimoRecalculo, setUltimoRecalculo] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'https://centro-salud.agentesia.cloud:18001';
      const response = await fetch(`${API_URL}/api/predicciones/resumen`);
      const data = await response.json();

      if (data.success) {
        setResumen(data.data);
        setUltimoRecalculo(new Date());
      }
    } catch (error) {
      console.error('Error cargando predicciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const recalcularPredicciones = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://centro-salud.agentesia.cloud:18001';
      await fetch(`${API_URL}/api/predicciones/demanda/recalcular`, { method: 'POST' });
      await cargarDatos();
      alert('✅ Predicciones recalculadas correctamente');
    } catch (error) {
      console.error('Error recalculando:', error);
      alert('❌ Error al recalcular predicciones');
    }
  };

  const getSeveridadColor = (severidad) => {
    const colores = {
      'alta': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
      'media': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
      'baja': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
    };
    return colores[severidad] || colores.baja;
  };

  const getTipoDiaBadge = (tipoDia) => {
    const badges = {
      'lunes': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200', label: 'Lunes' },
      'martes': { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200', label: 'Martes' },
      'miercoles': { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200', label: 'Miércoles' },
      'jueves': { color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-200', label: 'Jueves' },
      'viernes': { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200', label: 'Viernes' },
      'sabado': { color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-200', label: 'Sábado' },
      'domingo': { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200', label: 'Domingo' }
    };
    return badges[tipoDia] || badges.lunes;
  };

  const getEstacionIcon = (estacion) => {
    const iconos = {
      'primavera': '🌸',
      'verano': '☀️',
      'otoño': '🍂',
      'invierno': '❄️'
    };
    return iconos[estacion] || '🌡️';
  };

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
        <Activity className="mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-gray-600 dark:text-gray-400">No hay datos de predicción disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Predicción de Demanda con IA
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Sistema de Machine Learning para optimizar agenda
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setVista('dashboard')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              vista === 'dashboard'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <BarChart3 size={18} className="inline mr-2" />
            Dashboard
          </button>
          <button
            onClick={() => setVista('dias_criticos')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              vista === 'dias_criticos'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <AlertTriangle size={18} className="inline mr-2" />
            Días Críticos
          </button>
          <button
            onClick={() => setVista('estadisticas')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              vista === 'estadisticas'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <TrendingUp size={18} className="inline mr-2" />
            Estadísticas
          </button>
          <button
            onClick={recalcularPredicciones}
            className="p-3 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 rounded-lg transition-colors"
            title="Recalcular predicciones"
          >
            <RefreshCw size={20} className="text-green-600 dark:text-green-400" />
          </button>
        </div>
      </div>

      {/* Vista Dashboard */}
      {vista === 'dashboard' && (
        <>
          {/* Métricas Principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Predicciones</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {resumen.total_predicciones}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Próximos 7 días</p>
                </div>
                <Calendar className="text-blue-500" size={32} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Días Críticos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {resumen.total_dias_criticos}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Alta demanda</p>
                </div>
                <AlertTriangle className="text-purple-500" size={32} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">Promedio Diario</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {Math.round(resumen.estadisticas_historicas?.avg_citas_diarias || 0)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Citas/día</p>
                </div>
                <Activity className="text-green-500" size={32} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Máximo Histórico</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {resumen.estadisticas_historicas?.max_citas_diarias || 0}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Récord citas</p>
                </div>
                <Zap className="text-orange-500" size={32} />
              </div>
            </div>
          </div>

          {/* Predicciones por Día */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Predicciones de Demanda (Próximos 7 Días)
            </h3>
            <div className="space-y-4">
              {resumen.predicciones.map((prediccion) => {
                const tipoDiaBadge = getTipoDiaBadge(prediccion.tipo_dia);
                const estacionIcon = getEstacionIcon(prediccion.estacion);

                return (
                  <div key={prediccion.fecha} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Calendar size={20} className="text-blue-500" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {new Date(prediccion.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${tipoDiaBadge.color}`}>
                              {tipoDiaBadge.label}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {estacionIcon} {prediccion.estacion}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {prediccion.demanda_total}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">citas estimadas</p>
                      </div>
                    </div>

                    {/* Horas con mayor demanda */}
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                      {prediccion.horas.slice(0, 5).map((hora) => (
                        <div key={hora.hora} className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                          <Clock size={16} className="mx-auto mb-1 text-blue-500" />
                          <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{hora.hora}</p>
                          <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{hora.demanda}</p>
                          <p className="text-xs text-gray-500">{hora.confianza}% conf.</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Vista Días Críticos */}
      {vista === 'dias_criticos' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Días Críticos - Alertas de Alta Demanda
          </h3>

          {resumen.dias_criticos.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto mb-4 text-green-400" size={48} />
              <p className="text-gray-600 dark:text-gray-400">
                ¡Excelente! No hay días críticos previstos para la próxima semana.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {resumen.dias_criticos.map((dia) => (
                <div key={dia.fecha} className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle size={24} className="text-red-500" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {new Date(dia.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                          <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${getSeveridadColor(dia.severidad)}`}>
                            Severidad: {dia.severidad.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 ml-9">
                        {dia.razon}
                      </p>
                      <div className="flex items-center gap-4 mt-2 ml-9 text-sm text-gray-600 dark:text-gray-400">
                        <span>
                          <strong>Demanda estimada:</strong> {dia.demanda_estimada} citas
                        </span>
                        <span>
                          <strong>Ocupación:</strong> {Math.round(dia.porcentaje_ocupacion)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Vista Estadísticas */}
      {vista === 'estadisticas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              Estadísticas Históricas (Últimos 30 días)
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Promedio diario</span>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.round(resumen.estadisticas_historicas?.avg_citas_diarias || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Máximo diario</span>
                <span className="text-xl font-bold text-green-600 dark:text-green-400">
                  {resumen.estadisticas_historicas?.max_citas_diarias || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Mínimo diario</span>
                <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  {resumen.estadisticas_historicas?.min_citas_diarias || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Tasa de completación</span>
                <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.round((resumen.estadisticas_historicas?.avg_completadas / resumen.estadisticas_historicas?.avg_citas_diarias) * 100) || 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Cancelaciones promedio</span>
                <span className="text-xl font-bold text-red-600 dark:text-red-400">
                  {Math.round(resumen.estadisticas_historicas?.avg_canceladas || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">No presentados</span>
                <span className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                  {Math.round(resumen.estadisticas_historicas?.avg_no_presentadas || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Info className="text-blue-500 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  ¿Cómo funcionan las predicciones?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Nuestro sistema de IA analiza datos históricos de citas para predecir la demanda futura.
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Patrones de ocupación por día de la semana</li>
                  <li>• Factores estacionales (invierno = más citas)</li>
                  <li>• Tendencias de horarios pico</li>
                  <li>• Aprendizaje continuo con nuevos datos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información de Actualización */}
      {ultimoRecalculo && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <Info size={16} className="inline mr-1" />
          Última actualización: {ultimoRecalculo.toLocaleString('es-ES')}
        </div>
      )}
    </div>
  );
};

export default PrediccionDemanda;
