import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Eye,
  FileText
} from 'lucide-react';

const AnalisisHistorial = ({ pacienteId }) => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [analisis, setAnalisis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [stats, setStats] = useState(null);

  const tiposAnalisis = [
    { id: 'all', label: 'Todos', color: 'gray' },
    { id: 'patron_recurrente', label: 'Patrones', color: 'blue' },
    { id: 'factor_riesgo', label: 'Riesgos', color: 'red' },
    { id: 'tendencia_salud', label: 'Tendencias', color: 'green' },
    { id: 'alerta_temprana', label: 'Alertas', color: 'orange' },
    { id: 'recomendacion_preventiva', label: 'Recomendaciones', color: 'purple' }
  ];

  const getSeveridadColor = (severidad) => {
    switch (severidad) {
      case 'alta': return 'red';
      case 'media': return 'yellow';
      case 'baja': return 'green';
      default: return 'gray';
    }
  };

  const getSeveridadIcon = (severidad) => {
    switch (severidad) {
      case 'alta': return <AlertTriangle size={20} className="text-red-500" />;
      case 'media': return <Clock size={20} className="text-yellow-500" />;
      case 'baja': return <CheckCircle size={20} className="text-green-500" />;
      default: return <FileText size={20} className="text-gray-500" />;
    }
  };

  const cargarAnalisis = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analisis/historial/${pacienteId}`);
      const data = await response.json();

      if (data.success) {
        setAnalisis(data.data);
      } else {
        console.error('Error al cargar análisis:', data.message);
      }
    } catch (error) {
      console.error('Error en la API:', error);
      // Datos de prueba para desarrollo
      setAnalisis([
        {
          id: 1,
          tipo_analisis: 'patron_recurrente',
          severidad: 'media',
          titulo: '🔄 Patrón Recurrente: Infecciones Respiratorias',
          descripcion: 'El paciente ha tenido 5 infecciones respiratorias en los últimos 6 meses, todas en temporada de primavera.',
          patron_detectado: 'Alergia estacional no diagnosticada. Frecuencia: 83% en primavera.',
          recomendacion: 'Prueba de alergia específica. Considerar antihistamínicos preventivos en primavera.',
          factores_riesgo: 'Historial familiar de asma. Exposición a polen.',
          estado: 'pendiente'
        },
        {
          id: 2,
          tipo_analisis: 'factor_riesgo',
          severidad: 'alta',
          titulo: '⚠️ Factor de Riesgo: Hipertensión',
          descripcion: 'Presión arterial consistentemente elevada (140/90 mmHg promedio) en últimas 4 consultas.',
          patron_detectado: 'Tendencia al aumento: de 130/85 a 145/95 en 3 meses.',
          recomendacion: 'MONITOR REQUERIDO. Consulta con cardiología. Control diario de presión.',
          factores_riesgo: 'Obesidad (IMC 29). Sedentarismo. Historial familiar de hipertensión.',
          estado: 'pendiente'
        },
        {
          id: 3,
          tipo_analisis: 'tendencia_salud',
          severidad: 'baja',
          titulo: '📈 Tendencia Positiva: Mejora Peso',
          descripcion: 'Reducción de peso del 5% en los últimos 3 meses (85 kg → 81 kg).',
          patron_detectado: 'Tendencia descendente consistente. -1.3 kg/mes en promedio.',
          recomendacion: 'Continuar plan actual. Reevaluar en 3 meses. Objetivo: 75 kg.',
          factores_riesgo: 'Adherencia excelente a dieta y ejercicio.',
          estado: 'pendiente'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const response = await fetch('/api/analisis/estadisticas');
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const marcarRevisado = async (analisisId) => {
    try {
      const response = await fetch(`/api/analisis/revisar/${analisisId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user?.id })
      });

      if (response.ok) {
        cargarAnalisis();
        cargarEstadisticas();
      }
    } catch (error) {
      console.error('Error marcando como revisado:', error);
    }
  };

  useEffect(() => {
    cargarAnalisis();
    cargarEstadisticas();
  }, [pacienteId]);

  const filteredAnalisis = selectedType === 'all'
    ? analisis
    : analisis.filter(a => a.tipo_analisis === selectedType);

  return (
    <div className="space-y-6">
      {/* Estadísticas del Dashboard */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`rounded-xl p-4 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Análisis</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_analisis}</p>
              </div>
              <FileText size={24} className="text-blue-500" />
            </div>
          </div>
          <div className={`rounded-xl p-4 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Críticos</p>
                <p className="text-2xl font-bold text-red-600">{stats.alta_severidad}</p>
              </div>
              <AlertTriangle size={24} className="text-red-500" />
            </div>
          </div>
          <div className={`rounded-xl p-4 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Alertas</p>
                <p className="text-2xl font-bold text-orange-600">{stats.alertas}</p>
              </div>
              <Clock size={24} className="text-orange-500" />
            </div>
          </div>
          <div className={`rounded-xl p-4 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Recomendaciones</p>
                <p className="text-2xl font-bold text-purple-600">{stats.recomendaciones}</p>
              </div>
              <CheckCircle size={24} className="text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {tiposAnalisis.map((tipo) => (
          <button
            key={tipo.id}
            onClick={() => setSelectedType(tipo.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedType === tipo.id
                ? 'bg-blue-500 text-white shadow-md'
                : isDark
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
            }`}
          >
            {tipo.label}
          </button>
        ))}
      </div>

      {/* Botón recargar */}
      <div className="flex justify-end">
        <button
          onClick={cargarAnalisis}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Cargando...' : 'Actualizar'}
        </button>
      </div>

      {/* Lista de análisis */}
      <div className="space-y-4">
        {filteredAnalisis.map((analisisItem) => (
          <div
            key={analisisItem.id}
            className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border-l-4 ${
              getSeveridadColor(analisisItem.severidad) === 'red' ? 'border-red-500' :
              getSeveridadColor(analisisItem.severidad) === 'yellow' ? 'border-yellow-500' :
              getSeveridadColor(analisisItem.severidad) === 'green' ? 'border-green-500' :
              'border-gray-500'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                {getSeveridadIcon(analisisItem.severidad)}
                <div>
                  <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {analisisItem.titulo}
                  </h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      getSeveridadColor(analisisItem.severidad) === 'red' ? 'bg-red-100 text-red-700' :
                      getSeveridadColor(analisisItem.severidad) === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                      getSeveridadColor(analisisItem.severidad) === 'green' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {analisisItem.severidad.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(analisisItem.fecha_analisis).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              {analisisItem.estado === 'pendiente' && (
                <button
                  onClick={() => marcarRevisado(analisisItem.id)}
                  className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-all"
                >
                  <Eye size={14} />
                  Revisar
                </button>
              )}
            </div>

            {/* Descripción */}
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {analisisItem.descripcion}
            </p>

            {/* Patrón detectado */}
            {analisisItem.patron_detectado && (
              <div className={`mb-4 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">
                  Patrón detectado:
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  {analisisItem.patron_detectado}
                </p>
              </div>
            )}

            {/* Factores de riesgo */}
            {analisisItem.factor_riesgo && (
              <div className={`mb-4 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-orange-50'}`}>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-400 mb-1">
                  Factores de riesgo:
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-300">
                  {analisisItem.factor_riesgo}
                </p>
              </div>
            )}

            {/* Recomendación */}
            {analisisItem.recomendacion && (
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
                <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                  Recomendación:
                </p>
                <p className="text-sm text-green-600 dark:text-green-300">
                  {analisisItem.recomendacion}
                </p>
              </div>
            )}

            {/* Estado */}
            <div className="flex items-center justify-between mt-4">
              <span className={`text-xs px-2 py-1 rounded-full ${
                analisisItem.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {analisisItem.estado === 'pendiente' ? 'Pendiente' : 'Revisado'}
              </span>
              {analisisItem.fecha_revision && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Revisado: {new Date(analisisItem.fecha_revision).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ))}

        {filteredAnalisis.length === 0 && !loading && (
          <div className={`rounded-xl p-8 text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <FileText size={64} className="mx-auto mb-4 text-gray-400" />
            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              No se encontraron análisis
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {selectedType === 'all'
                ? 'El paciente no tiene análisis registrados aún.'
                : `No hay análisis de tipo "${tiposAnalisis.find(t => t.id === selectedType)?.label}" para este paciente.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalisisHistorial;