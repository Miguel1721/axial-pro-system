import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Eye,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Clock,
  Users,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  Brain,
  CheckCircle,
  XCircle
} from 'lucide-react';

const IAVisionPage = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ocupacion');
  const [ocupacionData, setOcupacionData] = useState(null);
  const [diasCriticos, setDiasCriticos] = useState(null);
  const [predicciones, setPredicciones] = useState(null);
  const [optimizacion, setOptimizacion] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const token = localStorage.getItem('token');

      // Cargar ocupación máxima
      const ocupacionRes = await fetch('/api/iavision/ocupacion-maxima', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const ocupacionJson = await ocupacionRes.json();
      setOcupacionData(ocupacionJson.data);

      // Cargar días críticos
      const criticosRes = await fetch('/api/iavision/dias-criticos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const criticosJson = await criticosRes.json();
      setDiasCriticos(criticosJson.data);

      // Cargar predicciones
      const predRes = await fetch('/api/iavision/prediccion-picos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const predJson = await predRes.json();
      setPredicciones(predJson.data);

    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderOcupacion = () => {
    if (!ocupacionData) return <div className="text-center p-8">Cargando datos...</div>;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Ocupación General</p>
                <p className="text-3xl font-bold mt-2">{ocupacionData.clinicMetrics.ocupacionGeneral}%</p>
              </div>
              <Activity className="text-4xl text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Eficiencia</p>
                <p className="text-3xl font-bold mt-2">
                  {(ocupacionData.clinicMetrics.eficiencia * 100).toFixed(1)}%
                </p>
              </div>
              <Target className="text-4xl text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Tendencia</p>
                <p className="text-xl font-bold mt-2">
                  {ocupacionData.clinicMetrics.tendencia === 'increasing' ? 'Creciente' : 'Estable'}
                </p>
              </div>
              <TrendingUp className="text-4xl text-purple-200" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Users className="mr-2" /> Médicos con Alta Ocupación
          </h3>
          <div className="space-y-4">
            {ocupacionData.medicos.map(medico => (
              <div key={medico.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold">{medico.nombre}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    medico.ocupacionPromedio > 80
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : medico.ocupacionPromedio > 60
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {medico.ocupacionPromedio}% ocupado
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {medico.especialidad} • {medico.disponibilidad}% disponible
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {medico.diasCriticos.map(dia => (
                    <span key={dia} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                      Día crítico: {dia}
                    </span>
                  ))}
                  {medico.horasPico.map(hora => (
                    <span key={hora} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      Pico: {hora}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDiasCriticos = () => {
    if (!diasCriticos) return <div className="text-center p-8">Cargando datos...</div>;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100">Días Críticos</p>
                <p className="text-3xl font-bold mt-2">{diasCriticos.totalCriticos}</p>
              </div>
              <AlertTriangle className="text-4xl text-red-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Urgencia Alta</p>
                <p className="text-3xl font-bold mt-2">{diasCriticos.resumen.altaUrgencia}</p>
              </div>
              <XCircle className="text-4xl text-orange-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">Urgencia Media</p>
                <p className="text-3xl font-bold mt-2">{diasCriticos.resumen.mediaUrgencia}</p>
              </div>
              <Clock className="text-4xl text-yellow-200" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4">Lista de Días Críticos</h3>
          <div className="space-y-4">
            {diasCriticos.diasCriticos.map(dia => (
              <div key={dia.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{dia.fecha}</h4>
                    <span className={`inline-block px-2 py-1 rounded text-sm font-medium mt-1 ${
                      dia.alerta === 'alta'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {dia.alerta === 'alta' ? 'Urgencia Alta' : 'Urgencia Media'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold" style={{ color: dia.color }}>
                      {dia.tipo}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h5 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Médicos afectados: {medicos.length}
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {dia.medicos.map(med => (
                        <span key={med} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {med}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Citas excedidas: {dia.citasExcedidas}
                    </h5>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${(dia.citasExcedidas / dia.capacidadNormal) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h5 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Recomendaciones:
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {dia.recomendaciones.map((rec, idx) => (
                      <li key={idx} className="text-gray-600 dark:text-gray-400">{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPredicciones = () => {
    if (!predicciones) return <div className="text-center p-8">Cargando datos...</div>;

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Predicción de Picos Estacionales</h2>
              <p className="text-indigo-100 mt-1">{predicciones.periodo}</p>
            </div>
            <Brain className="text-5xl text-indigo-200" />
          </div>
          <p className="text-indigo-100">
            IA predictiva para optimizar recursos y mejorar la atención
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {predicciones.predicciones.map(prediccion => (
            <div key={prediccion.mes} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  {prediccion.mes}
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  prediccion.nivel === 'alto'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {prediccion.nivel}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Días pico: <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {prediccion.pico}
                  </span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Factor: <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {prediccion.factor}
                  </span>
                </p>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Confianza</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {(prediccion.confianza * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${prediccion.confianza * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recomendaciones:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  {prediccion.recomendaciones.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <BarChart3 className="mr-2" /> Patrones Detectados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predicciones.patronesDetectados.map((patron, idx) => (
              <div key={idx} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start">
                  <TrendingUp className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">{patron}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderOptimizacion = () => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <Target className="mr-2" /> Optimización de Calendario
        </h3>

        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Reducción de Vacíos</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">23%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Equilibrio Médicos</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">87%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Eficiencia General</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">91%</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Horarios Óptimos Sugeridos</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              '08:00-09:00: Citas breves (30 min)',
              '09:00-12:00: Citas standard (45 min)',
              '14:00-16:00: Citas extensas (60 min)',
              '16:00-18:00: Citas express (30 min)'
            ].map((horario, idx) => (
              <div key={idx} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <CheckCircle className="text-green-500 mr-3" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{horario}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Recomendaciones Clave</h4>
          <div className="space-y-2">
            {[
              'Mover citas de mañana a después de las 10:00 para mejor distribución',
              'Agregar bloques de 30 minutos entre citas',
              'Consolidar citas especializadas en días específicos',
              'Evitar agendar 3 citas seguidas para el mismo médico'
            ].map((rec, idx) => (
              <div key={idx} className="flex items-start p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Zap className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{rec}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
            onClick={handleOptimizarCalendario}
          >
            Optimizar Mi Calendario Actual
          </button>
        </div>
      </div>
    );
  };

  const handleOptimizarCalendario = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch('/api/iavision/optimizar-calendario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          calendario: [], // Enviar calendario real del paciente
          objetivos: ['reducir_vacios', 'balancear_medicos', 'evitar_overbooking']
        })
      });

      const result = await response.json();
      if (result.success) {
        setOptimizacion(result.data);
        // Aquí se podría actualizar la UI con el calendario optimizado
      }
    } catch (error) {
      console.error('Error al optimizar calendario:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🤖 IA Vision - Inteligencia Artificial Médica
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Sistema de inteligencia artificial para optimización y predicción
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'ocupacion', label: 'Ocupación Máxima', icon: Activity },
                { id: 'criticos', label: 'Días Críticos', icon: AlertTriangle },
                { id: 'predicciones', label: 'Predicciones', icon: TrendingUp },
                { id: 'optimizacion', label: 'Optimización', icon: Target }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="mr-2 h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {activeTab === 'ocupacion' && renderOcupacion()}
          {activeTab === 'criticos' && renderDiasCriticos()}
          {activeTab === 'predicciones' && renderPredicciones()}
          {activeTab === 'optimizacion' && renderOptimizacion()}
        </div>
      </div>
    </div>
  );
};

export default IAVisionPage;