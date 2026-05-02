import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import UserAvatar from '../components/UserAvatar';
import MedicalRecordTimeline from '../components/MedicalRecordTimeline';
import MedicalNotesEditor from '../components/MedicalNotesEditor';
import {
  FileText,
  History,
  Download,
  Upload,
  User as UserIcon
} from 'lucide-react';

const HistorialMedicoPage = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('timeline');

  // Datos del paciente (en producción vendrían de la API)
  const patientData = {
    id: 1,
    nombre: 'Juan Pérez García',
    edad: 45,
    sangre: 'A+',
    alergias: 'Penicilina',
    telefono: '+57 300 123 4567',
    email: 'juan.perez@email.com',
    historialCompleto: true
  };

  const tabs = [
    { id: 'timeline', label: 'Timeline', icon: History },
    { id: 'notas', label: 'Notas Médicas', icon: FileText },
    { id: 'documentos', label: 'Documentos', icon: Upload }
  ];

  const handleExportComplete = () => {
    // Función para exportar todo el historial a PDF
    alert('Generando PDF completo del historial médico...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Avatar del paciente */}
          <div className={`w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg`}>
            <UserIcon size={32} className="text-white" />
          </div>

          {/* Info del paciente */}
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Historial Médico
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>Paciente: {patientData.nombre}</span>
              <span>•</span>
              <span>Edad: {patientData.edad} años</span>
              <span>•</span>
              <span>Sangre: {patientData.sangre}</span>
            </div>
          </div>
        </div>

        {/* Botón exportar */}
        <button
          onClick={handleExportComplete}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Download size={20} />
          Exportar Historial PDF
        </button>
      </div>

      {/* Tabs de navegación */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white shadow-md'
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

      {/* Información adicional del paciente */}
      <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Información del Paciente
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Teléfono</p>
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{patientData.telefono}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Email</p>
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{patientData.email}</p>
          </div>
          <div className={`p-4 rounded-lg bg-red-100 dark:bg-red-900/20`}>
            <p className={`text-sm text-red-600 dark:text-red-400`}>Alergias</p>
            <p className="font-semibold text-red-700 dark:text-red-300">{patientData.alergias}</p>
          </div>
        </div>
      </div>

      {/* Contenido según tab activo */}
      <div className="transition-all">
        {activeTab === 'timeline' && (
          <MedicalRecordTimeline patientId={patientData.id} />
        )}

        {activeTab === 'notas' && (
          <MedicalNotesEditor patientId={patientData.id} />
        )}

        {activeTab === 'documentos' && (
          <div className={`rounded-xl p-8 text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <Upload size={64} className="mx-auto mb-4 text-gray-400" />
            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Gestión de Documentos
            </h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Aquí podrás gestionar todos los documentos médicos del paciente (PDFs, imágenes, etc.)
            </p>
            <button className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all">
              Próximamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorialMedicoPage;
