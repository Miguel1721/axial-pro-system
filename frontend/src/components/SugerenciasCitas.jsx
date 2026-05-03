import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Clock,
  User,
  FileText,
  Bell,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  TrendingUp,
  Target,
  Calendar,
  Settings,
  Lightbulb,
  Star,
  BarChart3,
  AlertCircle
} from 'lucide-react';

const SugerenciasCitas = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [sugerencias, setSugerencias] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTipo, setSelectedTipo] = useState('all');
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [pacienteId, setPacienteId] = useState(1); // ID de paciente de prueba

  const tiposSugerencia = [
    { id: 'all', label: 'Todas', color: 'gray', icon: Lightbulb },
    { id: 'horario', label: 'Horarios', color: 'blue', icon: Clock },
    { id: 'medico', label: 'Médicos', color: 'green', icon: User },
    { id: 'preparacion', label: 'Preparación', color: 'purple', icon: FileText },
    { id: 'recordatorio', label: 'Recordatorios', color: 'orange', icon: Bell }
  ];

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();

    // Configurar generación automática
    let intervalo;
    if (autoGenerate) {
      intervalo = setInterval(() => {
        generarNuevasSugerencias();
      }, 300000); // Cada 5 minutos
    }

    return () => {
      if (intervalo) clearInterval(intervalo);
    };
  }, [autoGenerate]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar sugerencias
      const sugerenciasResponse = await fetch(`/api/sugerencias/${pacienteId}`);
      if (sugerenciasResponse.ok) {
        const sugerenciasData = await sugerenciasResponse.json();
        setSugerencias(sugerenciasData.data || []);
      }

      // Cargar estadísticas
      const statsResponse = await fetch('/api/sugerencias/estadisticas');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setEstadisticas(statsData.data || {});
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      // Fallback a datos de prueba
      setSugerencias([
        {
          id: 1,
          tipo_sugerencia: 'horario',
          titulo: '🕐 Mejor horario para tu cita',
          descripcion: 'Basado en tu historial, te sugerimos las 9:00 AM los lunes para evitar filas.',
          datos_sugerencia: {
            dia_recomendado: 'lunes',
            hora_recomendada: '09:00',
            alternativas: ['10:00', '11:00'],
            flexibilidad: 7
          },
          nivel_confianza: 0.85,
          estado: 'pendiente',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          tipo_sugerencia: 'medico',
          titulo: '👨‍⚕️ Médico ideal para tu caso',
          descripcion: 'El Dr. García tiene experiencia en tu tipo de consulta y alta calificación.',
          datos_sugerencia: {
            medico_recomendado: 'Dr. García',
            especialidad: 'Cardiología',
            calificacion: 4.8,
            historial_previo: true
          },
          nivel_confianza: 0.92,
          estado: 'pendiente',
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          tipo_sugerencia: 'preparacion',
          titulo: '📋 Prepara tu cita',
          descripcion: 'Para tu consulta especializada, lleva tus resultados de análisis recientes.',
          datos_sugerencia: {
            documentos_requeridos: ['Resultados de análisis', 'Identificación'],
            tiempo_recomendado_llegada: '20 minutos',
            lista_preparacion: ['Llevar historial', 'Preparar preguntas', 'Traer exámenes']
          },
          nivel_confianza: 0.78,
          estado: 'pendiente',
          created_at: new Date().toISOString()
        }
      ]);

      setEstadisticas({
        total: 156,
        aceptadas: 142,
        rechazadas: 8,
        ignoradas: 6,
        tasa_aceptacion: 91,
        confianza_promedio: 0.85,
        por_tipo: {
          horario: 45,
          medico: 38,
          preparacion: 42,
          recordatorio: 31
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const generarNuevasSugerencias = async () => {
    try {
      const response = await fetch('/api/sugerencias/generar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pacienteId })
      });

      if (response.ok) {
        cargarDatos();
      }
    } catch (error) {
      console.error('Error generando sugerencias:', error);
    }
  };

  const responderSugerencia = async (id, respuesta) => {
    try {
      const response = await fetch(`/api/sugerencias/${id}/responder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(respuesta)
      });

      if (response.ok) {
        cargarDatos();
      }
    } catch (error) {
      console.error('Error respondiendo sugerencia:', error);
    }
  };

  const getTipoIcon = (tipo) => {
    const tipoData = tiposSugerencia.find(t => t.id === tipo);
    return tipoData ? tipoData.icon : Lightbulb;
  };

  const getTipoColor = (tipo) => {
    const tipoData = tiposSugerencia.find(t => t.id === tipo);
    return tipoData ? tipoData.color : 'gray';
  };

  const filteredSugerencias = sugerencias.filter(sugerencia => {
    const matchTipo = selectedTipo === 'all' || sugerencia.tipo_sugerencia === selectedTipo;
    return matchTipo;
  });

  const totalSugerencias = sugerencias.length;
  const aceptadas = sugerencias.filter(s => s.estado === 'aceptada').length;
  const pendientes = sugerencias.filter(s => s.estado === 'pendiente').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            💡 Sugerencias de Citas Inteligentes
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Sistema IA para optimización personalizada de agendamiento
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setAutoGenerate(!autoGenerate)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              autoGenerate
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <RefreshCw size={16} />
            {autoGenerate ? 'Auto-generando' : 'Auto-generar'}
          </button>
          <button
            onClick={generarNuevasSugerencias}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <Lightbulb size={16} className={loading ? 'animate-spin' : ''} />
            Generar Sugerencias
          </button>
        </div>
      </div>

      {/* Dashboard de estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`rounded-xl p-4 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tasa Aceptación</p>
                <p className="text-2xl font-bold text-green-600">{estadisticas.tasa_aceptacion}%</p>
              </div>
              <Target size={24} className="text-green-500" />
            </div>
          </div>
          <div className={`rounded-xl p-4 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Confianza IA</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(estadisticas.confianza_promedio * 100).toFixed(0)}%
                </p>
              </div>
              <Star size={24} className="text-blue-500" />
            </div>
          </div>
          <div className={`rounded-xl p-4 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sugerencias Activas</p>
                <p className="text-2xl font-bold text-purple-600">{pendientes}</p>
              </div>
              <Lightbulb size={24} className="text-purple-500" />
            </div>
          </div>
          <div className={`rounded-xl p-4 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Generadas</p>
                <p className="text-2xl font-bold text-orange-600">{estadisticas.total}</p>
              </div>
              <BarChart3 size={24} className="text-orange-500" />
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas por tipo */}
      {estadisticas?.por_tipo && (
        <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            📊 Rendimiento por Tipo
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(estadisticas.por_tipo).map(([tipo, count]) => {
              const tipoData = tiposSugerencia.find(t => t.id === tipo);
              return (
                <div key={tipo} className="text-center">
                  <div className={`w-12 h-12 bg-${tipoData?.color || 'gray'}-100 dark:bg-${tipoData?.color || 'gray'}-900/20 rounded-full flex items-center justify-center mx-auto mb-2`}>
                    {React.createElement(tipoData?.icon || Lightbulb, { size: 24 })}
                  </div>
                  <p className="font-semibold">{count}</p>
                  <p className="text-sm text-gray-500">{tipoData?.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex flex-wrap gap-4">
          {tiposSugerencia.map(tipo => {
            const Icon = tipo.icon;
            return (
              <button
                key={tipo.id}
                onClick={() => setSelectedTipo(tipo.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  selectedTipo === tipo.id
                    ? `bg-${tipo.color}-500 text-white`
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Icon size={16} />
                {tipo.label} ({sugerencias.filter(s => s.tipo_sugerencia === tipo.id).length})
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de sugerencias */}
      <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Sugerencias Activas ({filteredSugerencias.length})
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw size={24} className="animate-spin text-blue-500" />
          </div>
        ) : filteredSugerencias.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ¡No hay sugerencias pendientes!
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              El sistema está actualizado y todas tus sugerencias han sido procesadas
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSugerencias.map((sugerencia) => {
              const IconComponent = getTipoIcon(sugerencia.tipo_sugerencia);
              const color = getTipoColor(sugerencia.tipo_sugerencia);

              return (
                <div
                  key={sugerencia.id}
                  className={`rounded-lg p-6 border-l-4 ${
                    color === 'red' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                    color === 'orange' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' :
                    color === 'yellow' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                    color === 'green' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                    color === 'blue' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' :
                    color === 'purple' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' :
                    'border-gray-500 bg-gray-50 dark:bg-gray-700'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        color === 'red' ? 'bg-red-100 dark:bg-red-900/20' :
                        color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/20' :
                        color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                        color === 'green' ? 'bg-green-100 dark:bg-green-900/20' :
                        color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20' :
                        color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/20' :
                        'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        <IconComponent size={20} />
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {sugerencia.titulo}
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            color === 'red' ? 'bg-red-100 text-red-700' :
                            color === 'orange' ? 'bg-orange-100 text-orange-700' :
                            color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                            color === 'green' ? 'bg-green-100 text-green-700' :
                            color === 'blue' ? 'bg-blue-100 text-blue-700' :
                            color === 'purple' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {sugerencia.tipo_sugerencia}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Confianza: {(sugerencia.nivel_confianza * 100).toFixed(0)}%
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(sugerencia.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {sugerencia.estado === 'pendiente' && (
                        <>
                          <button
                            onClick={() => responderSugerencia(sugerencia.id, {
                              estado: 'aceptada',
                              comentario: 'Excelente sugerencia'
                            })}
                            className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => responderSugerencia(sugerencia.id, {
                              estado: 'rechazada',
                              comentario: 'No aplicable en este momento'
                            })}
                            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      {sugerencia.estado === 'aceptada' && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm">
                          ✅ Aceptada
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Descripción */}
                  <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {sugerencia.descripcion}
                  </p>

                  {/* Detalles específicos */}
                  <div className={`rounded-lg p-4 mb-4 ${
                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Detalles de la sugerencia:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {Object.entries(sugerencia.datos_sugerencia || {}).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{key}:</span>
                          <span className={isDark ? 'text-white' : 'text-gray-900'}>
                            {Array.isArray(value) ? value.join(', ') : value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs">
                    <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                      Generada por IA basada en tu historial y preferencias
                    </span>
                    <div className="flex items-center gap-2">
                      <Star size={12} className="text-yellow-500" />
                      <span>{(sugerencia.nivel_confianza * 100).toFixed(0)}% de confianza</span>
                    </div>
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

export default SugerenciasCitas;