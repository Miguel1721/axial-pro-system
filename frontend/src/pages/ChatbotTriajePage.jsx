import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ChatbotTriaje from '../components/ChatbotTriaje';

const ChatbotTriajePage = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [pacienteInfo, setPacienteInfo] = useState(null);

  useEffect(() => {
    // Cargar información del paciente si está disponible
    const paciente = localStorage.getItem('pacienteActual');
    if (paciente) {
      try {
        setPacienteInfo(JSON.parse(paciente));
      } catch (error) {
        console.error('Error al cargar información del paciente:', error);
      }
    }
  }, []);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🤖 Chatbot de Triaje
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Asistente virtual disponible 24/7 para clasificar la urgencia de las consultas
          </p>
        </div>

        {/* Chatbot */}
        <div className="mb-8">
          <ChatbotTriaje pacienteInfo={pacienteInfo} />
        </div>

        {/* Información del chatbot */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              📋 Características del Chatbot
            </h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Clasificación automática de urgencias (Alta, Media, Baja)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Redirección automática al área correspondiente</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Tiempo estimado de atención por tipo de consulta</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Recomendaciones basadas en síntomas</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Historial de consultas para seguimiento</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Soporte 24/7 para emergencias</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              🚨 Protocolo de Urgencias
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2">
                  Emergencia Alta
                </h3>
                <p className="text-sm text-red-700 dark:text-red-400">
                  Dolor en el pecho, dificultad para respirar, sangrado abundante,
                  pérdida de conocimiento. Diríjase directamente a urgencias.
                </p>
                <p className="text-xs text-red-600 dark:text-red-500 mt-2">
                  Tiempo estimado: 0-15 min
                </p>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                  Urgencia Media
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  Dolor moderado, fiebre, vómitos, diarrea. Espere en sala de espera,
                  será llamado en breve.
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2">
                  Tiempo estimado: 20-30 min
                </p>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                  Urgencia Baja
                </h3>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Consulta programada, chequeo de rutina, seguimiento. Tome asiento
                  y espere su turno.
                </p>
                <p className="text-xs text-green-600 dark:text-green-500 mt-2">
                  Tiempo estimado: 30-45 min
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotTriajePage;