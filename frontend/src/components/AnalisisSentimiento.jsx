import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  MessageSquare,
  TrendingUp,
  Users,
  AlertTriangle,
  Star,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  Target,
  Clock,
  CheckCircle,
  Heart,
  Frown,
  Smile,
  Meh,
  Send,
  RefreshCw
} from 'lucide-react';

const AnalisisSentimiento = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [feedbacks, setFeedbacks] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [nps, setNps] = useState(null);
  const [tendencias, setTendencias] = useState([]);
  const [patrones, setPatrones] = useState({});
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [nuevoFeedback, setNuevoFeedback] = useState({
    puntuacion: 7,
    comentarios: ''
  });

  const nivelesSatisfaccion = [
    { id: 'muy_satisfecho', label: 'Muy Satisfecho', color: 'green', icon: Smile, min: 9, max: 10 },
    { id: 'satisfecho', label: 'Satisfecho', color: 'blue', icon: Meh, min: 7, max: 8 },
    { id: 'neutro', label: 'Neutro', color: 'yellow', icon: Meh, min: 5, max: 6 },
    { id: 'insatisfecho', label: 'Insatisfecho', color: 'orange', icon: Frown, min: 3, max: 4 },
    { id: 'muy_insatisfecho', label: 'Muy Insatisfecho', color: 'red', icon: Frown, min: 1, max: 2 }
  ];

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar feedbacks
      const feedbacksResponse = await fetch('/api/sentimiento/feedbacks');
      if (feedbacksResponse.ok) {
        const feedbacksData = await feedbacksResponse.json();
        setFeedbacks(feedbacksData.data || []);
      }

      // Cargar estadísticas
      const statsResponse = await fetch('/api/sentimiento/estadisticas');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setEstadisticas(statsData.data || {});
      }

      // Cargar NPS
      const npsResponse = await fetch('/api/sentimiento/nps');
      if (npsResponse.ok) {
        const npsData = await npsResponse.json();
        setNps(npsData.data || {});
      }

      // Cargar tendencias
      const tendenciasResponse = await fetch('/api/sentimiento/tendencias');
      if (tendenciasResponse.ok) {
        const tendenciasData = await tendenciasResponse.json();
        setTendencias(tendenciasData.data || []);
      }

      // Cargar patrones
      const patronesResponse = await fetch('/api/sentimiento/patrones');
      if (patronesResponse.ok) {
        const patronesData = await patronesResponse.json();
        setPatrones(patronesData.data || {});
      }

      // Cargar alertas
      const alertasResponse = await fetch('/api/sentimiento/alertas');
      if (alertasResponse.ok) {
        const alertasData = await alertasResponse.json();
        setAlertas(alertasData.data || []);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      // Fallback a datos de prueba
      setFeedbacks([
        {
          id: 1,
          paciente_nombre: 'María González',
          puntuacion: 9,
          comentarios: 'Excelente atención, muy profesional y rápido',
          categoria: 'atencion_medica',
          fecha_respuesta: '2026-05-01T10:30:00Z',
          sentimiento_general: 'positivo'
        },
        {
          id: 2,
          paciente_nombre: 'Carlos Rodríguez',
          puntuacion: 4,
          comentarios: 'Tuve que esperar mucho tiempo y la atención fue fría',
          categoria: 'espera',
          fecha_respuesta: '2026-05-01T09:15:00Z',
          sentimiento_general: 'negativo'
        }
      ]);

      setEstadisticas({
        total_feedbacks: 156,
        puntuacion_promedio: 7.8,
        total_promotores: 98,
        total_detractores: 23,
        reciente: 12,
        categorizado: 134
      });

      setNps({
        nps: 48,
        promotores: 98,
        pasivos: 35,
        detractores: 23,
        total_respuestas: 156
      });

      setTendencias([
        { mes: '2024-04', puntuacion_promedio: 7.8, nps: 48 },
        { mes: '2024-03', puntuacion_promedio: 7.6, nps: 42 },
        { mes: '2024-02', puntuacion_promedio: 7.9, nps: 52 }
      ]);

      setPatrones({
        'espera': {
          total: 15,
          puntuacion_promedio: 3.8,
          quejas_comunes: [
            { palabra: 'espera', count: 12 },
            { palabra: 'demora', count: 8 },
            { palabra: 'lento', count: 6 }
          ]
        }
      });

      setAlertas([
        {
          id: 1,
          paciente_nombre: 'Carlos Rodríguez',
          puntuacion: 4,
          comentarios: 'Tuve que esperar mucho tiempo',
          nivel_urgencia: 'critico'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const enviarFeedback = async () => {
    try {
      const response = await fetch('/api/sentimiento/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paciente_id: 1, // ID de prueba
          puntuacion: nuevoFeedback.puntuacion,
          comentarios: nuevoFeedback.comentarios,
          tipo_encuesta: 'general'
        })
      });

      if (response.ok) {
        setNuevoFeedback({ puntuacion: 7, comentarios: '' });
        cargarDatos();
      }
    } catch (error) {
      console.error('Error enviando feedback:', error);
    }
  };

  const getNPSColor = (nps) => {
    if (nps >= 50) return 'text-green-600';
    if (nps >= 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getNPSLabel = (nps) => {
    if (nps >= 50) return 'Excelente';
    if (nps >= 0) return 'Bueno';
    return 'Necesita Mejora';
  };

  const getSentimientoIcon = (sentimiento) => {
    switch (sentimiento) {
      case 'positivo': return <Smile size={20} className="text-green-500" />;
      case 'negativo': return <Frown size={20} className="text-red-500" />;
      default: return <Meh size={20} className="text-yellow-500" />;
    }
  };

  const getUrgenciaColor = (nivel) => {
    switch (nivel) {
      case 'muy_critico': return 'red';
      case 'critico': return 'orange';
      default: return 'yellow';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            💬 Análisis de Sentimiento Pacientes
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Sistema IA para monitoreo de satisfacción y detección de patrones
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
      {estadisticas && nps && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`rounded-xl p-4 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Puntuación Promedio</p>
                <p className="text-2xl font-bold text-blue-600">{estadisticas.puntuacion_promedio}</p>
              </div>
              <Star size={24} className="text-blue-500" />
            </div>
          </div>
          <div className={`rounded-xl p-4 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">NPS</p>
                <p className={`text-2xl font-bold ${getNPSColor(nps.nps)}`}>{nps.nps}</p>
              </div>
              <Target size={24} className="text-green-500" />
            </div>
          </div>
          <div className={`rounded-xl p-4 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Promotores</p>
                <p className="text-2xl font-bold text-green-600">{nps.promotores}</p>
              </div>
              <ThumbsUp size={24} className="text-green-500" />
            </div>
          </div>
          <div className={`rounded-xl p-4 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Alertas</p>
                <p className="text-2xl font-bold text-red-600">{alertas.length}</p>
              </div>
              <AlertTriangle size={24} className="text-red-500" />
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
          onClick={() => setActiveTab('feedbacks')}
          className={`px-4 py-2 font-medium transition-all ${
            activeTab === 'feedbacks'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          💬 Feedbacks ({feedbacks.length})
        </button>
        <button
          onClick={() => setActiveTab('tendencias')}
          className={`px-4 py-2 font-medium transition-all ${
            activeTab === 'tendencias'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          📈 Tendencias
        </button>
        <button
          onClick={() => setActiveTab('alertas')}
          className={`px-4 py-2 font-medium transition-all ${
            activeTab === 'alertas'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          ⚠️ Alertas ({alertas.length})
        </button>
      </div>

      {/* Contenido según tab activo */}
      <div className="transition-all">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Estado NPS */}
            {nps && (
              <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  🎯 Net Promoter Score
                </h2>
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-4xl font-bold ${getNPSColor(nps.nps)}`}>
                      {nps.nps} {getNPSLabel(nps.nps)}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Basado en {nps.total_respuestas} respuestas
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{nps.promotores}</div>
                      <p className="text-xs text-gray-500">Promotores</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{nps.pasivos}</div>
                      <p className="text-xs text-gray-500">Pasivos</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{nps.detractores}</div>
                      <p className="text-xs text-gray-500">Detractores</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Formulario de feedback rápido */}
            <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                📝 Enviar Feedback Rápido
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Puntuación (1-10)</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={nuevoFeedback.puntuacion}
                    onChange={(e) => setNuevoFeedback({...nuevoFeedback, puntuacion: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>1</span>
                    <span className="font-bold">{nuevoFeedback.puntuacion}</span>
                    <span>10</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Comentarios</label>
                  <textarea
                    value={nuevoFeedback.comentarios}
                    onChange={(e) => setNuevoFeedback({...nuevoFeedback, comentarios: e.target.value})}
                    placeholder="Comparte tu experiencia..."
                    className={`w-full px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                    rows={3}
                  />
                </div>
                <button
                  onClick={enviarFeedback}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <Send size={16} />
                  Enviar Feedback
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'feedbacks' && (
          <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Últimos Feedbacks ({feedbacks.length})
            </h2>
            <div className="space-y-4">
              {feedbacks.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare size={64} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No hay feedbacks disponibles</p>
                </div>
              ) : (
                feedbacks.map((feedback) => (
                  <div
                    key={feedback.id}
                    className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getSentimientoIcon(feedback.sentimiento_general)}
                        <div>
                          <h3 className="font-medium">{feedback.paciente_nombre}</h3>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[...Array(10)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  className={
                                    i < feedback.puntuacion
                                      ? 'text-yellow-500 fill-current'
                                      : 'text-gray-300'
                                  }
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">
                              {feedback.puntuacion}/10
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(feedback.fecha_respuesta).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                      {feedback.comentarios}
                    </p>
                    {feedback.categoria && (
                      <span className="inline-block mt-2 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {feedback.categoria}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'tendencias' && (
          <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              📈 Tendencias de Satisfacción
            </h2>
            <div className="space-y-6">
              {tendencias.length === 0 ? (
                <p className="text-gray-500">No hay datos de tendencias disponibles</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tendencias.map((trend, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{trend.mes}</span>
                        <span className={`text-sm font-bold ${
                          trend.nps >= 50 ? 'text-green-600' :
                          trend.nps >= 0 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          NPS: {trend.nps}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Puntuación: {trend.puntuacion_promedio}</span>
                        <span>{trend.total_respuestas} respuestas</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Patrones detectados */}
              {Object.keys(patrones).length > 0 && (
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    🎯 Patrones de Queja Detectados
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(patrones).map(([categoria, datos]) => (
                      <div
                        key={categoria}
                        className={`p-4 rounded-lg border-l-4 border-orange-500 ${
                          isDark ? 'bg-gray-700' : 'bg-gray-50'
                        }`}
                      >
                        <h4 className="font-medium mb-2">{categoria}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {datos.total} quejas • Puntuación: {datos.puntuacion_promedio}/10
                        </p>
                        <div className="mt-2">
                          <p className="text-xs font-medium mb-1">Palabras comunes:</p>
                          <div className="flex flex-wrap gap-1">
                            {datos.quejas_comunes.slice(0, 3).map((item, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full"
                              >
                                {item.palabra} ({item.count})
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'alertas' && (
          <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ⚠️ Alertas de Insatisfacción ({alertas.length})
            </h2>
            {alertas.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
                <p className="text-gray-500">No hay alertas activas</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alertas.map((alerta) => {
                  const color = getUrgenciaColor(alerta.nivel_urgencia);
                  return (
                    <div
                      key={alerta.id}
                      className={`rounded-lg p-4 border-l-4 ${
                        color === 'red' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                        'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={20} className={
                            color === 'red' ? 'text-red-500' : 'text-orange-500'
                          } />
                          <h3 className="font-medium">{alerta.paciente_nombre}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            color === 'red' ? 'bg-red-100 text-red-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {alerta.nivel_urgencia}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          Puntuación: {alerta.puntuacion}/10
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {alerta.comentarios}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalisisSentimiento;