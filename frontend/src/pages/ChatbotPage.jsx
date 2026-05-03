import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ChatbotTriaje from '../components/ChatbotTriaje';

const ChatbotPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Volver</span>
        </button>

        {/* Información sobre el Chatbot */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
            Asistente Virtual con IA
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sistema de triaje automatizado las 24 horas. Clasifica urgencias y dirige a los pacientes.
          </p>
        </div>

        {/* Cards informativos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Clasificación Automática</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              El sistema identifica automáticamente el nivel de urgencia basándose en los síntomas descritos.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">IA Integrada</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Conectado con chatbot externo especializado en triaje médico. Respuestas inteligentes 24/7.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Detección de Emergencias</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Identifica síntomas críticos y deriva inmediatamente a servicios de emergencia cuando es necesario.
            </p>
          </div>
        </div>

        {/* Indicador del chatbot */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center animate-pulse">
              <span className="text-3xl">💬</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                El asistente virtual está activo
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Haz clic en el botón flotante en la esquina inferior derecha para comenzar una conversación.
              </p>
            </div>
          </div>
        </div>

        {/* Componente Chatbot */}
        <ChatbotTriaje
          pacienteInfo={{
            id: 1,
            nombre: 'Paciente Demo',
            email: 'demo@ejemplo.com'
          }}
        />
      </div>
    </div>
  );
};

export default ChatbotPage;
