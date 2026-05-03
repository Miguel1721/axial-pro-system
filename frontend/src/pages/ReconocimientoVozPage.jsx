import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import UserAvatar from '../components/UserAvatar';
import ReconocimientoVoz from '../components/ReconocimientoVoz';
import {
  Mic,
  MicOff,
  Users,
  FileText,
  Settings,
  Volume2,
  Clock,
  CheckCircle,
  AlertCircle,
  Download
} from 'lucide-react';

const ReconocimientoVozPage = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [activePatient, setActivePatient] = useState(null);
  const [selectedTab, setSelectedTab] = useState('recognition');

  // Datos de pacientes simulados (en producción vendrían de la API)
  const pacientes = [
    {
      id: 1,
      nombre: 'Juan Pérez García',
      edad: 45,
      sangre: 'A+',
      ultimaNota: 'Control de presión arterial elevada',
      riesgo: 'alto'
    },
    {
      id: 2,
      nombre: 'María López Rodríguez',
      edad: 32,
      sangre: 'B+',
      ultimaNota: 'Revision rutinaria - Todo normal',
      riesgo: 'bajo'
    },
    {
      id: 3,
      nombre: 'Carlos Sánchez Díaz',
      edad: 58,
      sangre: 'O-',
      ultimaNota: 'Dolor en articulaciones',
      riesgo: 'medio'
    }
  ];

  const tabs = [
    { id: 'recognition', label: 'Reconocimiento', icon: Mic },
    { id: 'history', label: 'Historial', icon: FileText },
    { id: 'commands', label: 'Comandos', icon: Settings },
    { id: 'patients', label: 'Pacientes', icon: Users }
  ];

  const exportReport = () => {
    alert('Generando reporte de reconocimiento de voz...');
  };

  const renderPatientSelector = () => (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Seleccione un paciente para el reconocimiento de voz
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pacientes.map((paciente) => (
          <div
            key={paciente.id}
            onClick={() => setActivePatient(paciente)}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
              isDark
                ? 'bg-gray-800 border-gray-600 hover:border-blue-500'
                : 'bg-white border-gray-200 hover:border-blue-500'
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              <UserAvatar
                nombre={paciente.nombre}
                size={48}
                className="bg-gradient-to-br from-purple-500 to-pink-600"
              />
              <div>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {paciente.nombre}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {paciente.edad} años
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  Sangre:
                </span>
                <span className="font-medium">{paciente.sangre}</span>
              </div>
              <div className="text-sm">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  Última nota:
                </span>
                <p className="font-medium text-gray-900 dark:text-white mt-1">
                  {paciente.ultimaNota}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  Riesgo:
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  paciente.riesgo === 'alto' ? 'bg-red-100 text-red-700' :
                  paciente.riesgo === 'medio' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {paciente.riesgo.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRecognitionTab = () => (
    <div className="space-y-6">
      {/* Información del sistema */}
      <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          🎤 Sistema de Reconocimiento de Voz
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Mic size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="font-semibold mb-1">Dictado de Notas</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Convierte voz a texto en tiempo real
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Volume2 size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-semibold mb-1">Transcripción</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Graba y transcribe consultas
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Settings size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-semibold mb-1">Comandos Voz</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Control por voz rápido y preciso
            </p>
          </div>
        </div>
      </div>

      {/* Componente de reconocimiento */}
      {activePatient ? (
        <ReconocimientoVoz pacienteId={activePatient.id} />
      ) : (
        <div className={`rounded-xl p-8 text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <Mic size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Seleccione un paciente
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Para comenzar a usar el reconocimiento de voz, primero seleccione un paciente del listado.
          </p>
        </div>
      )}
    </div>
  );

  const renderHistoryTab = () => (
    <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Historial de Reconocimiento de Voz
      </h3>
      <div className="space-y-4">
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">Hoy - 10:30 AM</h4>
            <span className="text-xs text-green-600">Completado</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Transcripción de consulta con Juan Pérez García - 5 minutos de audio
          </p>
        </div>
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">Ayer - 2:15 PM</h4>
            <span className="text-xs text-green-600">Completado</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Transcripción de consulta con María López Rodríguez - 3 minutos de audio
          </p>
        </div>
      </div>
    </div>
  );

  const renderCommandsTab = () => (
    <div className="space-y-6">
      <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Comandos de Voz Médicos
        </h3>

        <div className="space-y-4">
          <div>
            <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Gestión de Notas
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <code className="text-sm text-blue-600">"guardar"</code>
                <p className="text-xs text-gray-600 mt-1">Guarda la nota actual</p>
              </div>
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <code className="text-sm text-blue-600">"nueva nota"</code>
                <p className="text-xs text-gray-600 mt-1">Crea una nueva nota</p>
              </div>
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <code className="text-sm text-blue-600">"anadir nota"</code>
                <p className="text-xs text-gray-600 mt-1">Añade nota médica</p>
              </div>
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <code className="text-sm text-blue-600">"receta medica"</code>
                <p className="text-xs text-gray-600 mt-1">Crea receta médica</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Navegación
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <code className="text-sm text-blue-600">"siguiente paciente"</code>
                <p className="text-xs text-gray-600 mt-1">Siguiente paciente</p>
              </div>
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <code className="text-sm text-blue-600">"paciente anterior"</code>
                <p className="text-xs text-gray-600 mt-1">Paciente anterior</p>
              </div>
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <code className="text-sm text-blue-600">"historial"</code>
                <p className="text-xs text-gray-600 mt-1">Ver historial</p>
              </div>
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <code className="text-sm text-blue-600">"cita"</code>
                <p className="text-xs text-gray-600 mt-1">Gestionar citas</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Sistema
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <code className="text-sm text-blue-600">"exportar"</code>
                <p className="text-xs text-gray-600 mt-1">Exportar datos</p>
              </div>
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <code className="text-sm text-blue-600">"ayuda"</code>
                <p className="text-xs text-gray-600 mt-1">Mostrar ayuda</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Mejores Prácticas
        </h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <CheckCircle size={16} className="text-green-500 mt-0.5" />
            <span>Habla claro y a un ritmo moderado</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={16} className="text-green-500 mt-0.5" />
            <span>Mantén una distancia adecuada del micrófono</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={16} className="text-green-500 mt-0.5" />
            <span>Evita ruidos de fondo cuando sea posible</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertCircle size={16} className="text-yellow-500 mt-0.5" />
            <span>Usar Chrome para mejor compatibilidad</span>
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Reconocimiento de Voz Médico
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Sistema nativo de dictado y comandos por voz
          </p>
        </div>
        <button
          onClick={exportReport}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Download size={20} />
          Exportar Reporte
        </button>
      </div>

      {/* Tabs de navegación */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                selectedTab === tab.id
                  ? 'bg-purple-500 text-white shadow-md'
                  : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
              }`}
            >
              <Icon size={20} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Contenido según tab activo */}
      <div className="transition-all">
        {selectedTab === 'recognition' && renderRecognitionTab()}
        {selectedTab === 'history' && renderHistoryTab()}
        {selectedTab === 'commands' && renderCommandsTab()}
        {selectedTab === 'patients' && renderPatientSelector()}
      </div>
    </div>
  );
};

export default ReconocimientoVozPage;