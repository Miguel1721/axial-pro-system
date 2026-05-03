import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import UserAvatar from '../components/UserAvatar';
import AnalisisHistorial from '../components/AnalisisHistorial';
import {
  BarChart3,
  Users,
  AlertTriangle,
  TrendingUp,
  FileText,
  Settings,
  Download
} from 'lucide-react';

const AnalisisPage = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [activePatient, setActivePatient] = useState(null);

  // Datos de pacientes simulados (en producción vendrían de la API)
  const pacientes = [
    {
      id: 1,
      nombre: 'Juan Pérez García',
      edad: 45,
      sangre: 'A+',
      alergias: 'Penicilina',
      ultimoControl: '2024-05-01',
      riesgo: 'alto'
    },
    {
      id: 2,
      nombre: 'María López Rodríguez',
      edad: 32,
      sangre: 'B+',
      alergias: 'Ninguna',
      ultimoControl: '2024-04-28',
      riesgo: 'bajo'
    },
    {
      id: 3,
      nombre: 'Carlos Sánchez Díaz',
      edad: 58,
      sangre: 'O-',
      alergias: 'Ibuprofeno',
      ultimoControl: '2024-04-25',
      riesgo: 'medio'
    }
  ];

  const handleExportReport = () => {
    alert('Generando reporte de análisis completo...');
    // Aquí iría la lógica para exportar el reporte
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Análisis de Historial Médico
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Sistema Inteligente de Análisis con IA
          </p>
        </div>
        <button
          onClick={handleExportReport}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Download size={20} />
          Exportar Reporte
        </button>
      </div>

      {/* Panel de selección de pacientes */}
      {!activePatient && (
        <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Seleccione un paciente para analizar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pacientes.map((paciente) => (
              <div
                key={paciente.id}
                onClick={() => setActivePatient(paciente)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 hover:border-blue-500'
                    : 'bg-white border-gray-200 hover:border-blue-500'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <UserAvatar
                    nombre={paciente.nombre}
                    size={40}
                    className="bg-gradient-to-br from-blue-500 to-purple-600"
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

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      Sangre:
                    </span>
                    <span className="font-medium">{paciente.sangre}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      Último control:
                    </span>
                    <span className="font-medium">{paciente.ultimoControl}</span>
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
      )}

      {/* Panel de análisis del paciente seleccionado */}
      {activePatient && (
        <>
          {/* Header del paciente */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <UserAvatar
                nombre={activePatient.nombre}
                size={56}
                className="bg-gradient-to-br from-blue-500 to-purple-600"
              />
              <div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {activePatient.nombre}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>ID: #{activePatient.id}</span>
                  <span>Edad: {activePatient.edad} años</span>
                  <span>Sangre: {activePatient.sangre}</span>
                  {activePatient.alergias !== 'Ninguna' && (
                    <span className="text-red-600">Alergias: {activePatient.alergias}</span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setActivePatient(null)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all"
            >
              Cambiar paciente
            </button>
          </div>

          {/* Componente de análisis */}
          <AnalisisHistorial pacienteId={activePatient.id} />
        </>
      )}

      {/* Información del sistema */}
      <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          ¿Cómo funciona el sistema de análisis?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <BarChart3 size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-semibold mb-1">Patrones Recurrentes</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Detecta repetición de síntomas y condiciones
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />
            </div>
            <h4 className="font-semibold mb-1">Factores de Riesgo</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Identifica condiciones de riesgo potencial
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-semibold mb-1">Tendencias de Salud</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Analiza mejoras o deterioros en salud
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <FileText size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="font-semibold mb-1">Alertas Tempranas</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Previene complicaciones con alertas proactivas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalisisPage;