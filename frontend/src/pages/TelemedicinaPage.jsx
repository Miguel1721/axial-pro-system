import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import UserAvatar from '../components/UserAvatar';
import TelemedicinaVideo from '../components/TelemedicinaVideo';
import TelemedicinaChat from '../components/TelemedicinaChat';
import {
  Video,
  MessageCircle,
  Calendar,
  Clock,
  FileText,
  Phone,
  CheckCircle,
  XCircle
} from 'lucide-react';

const TelemedicinaPage = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('video');
  const [consultationActive, setConsultationActive] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  // Consultas virtuales de ejemplo
  const consultations = [
    {
      id: 1,
      patientName: 'Juan Pérez',
      patientEmail: 'juan.perez@email.com',
      date: '2024-05-02',
      time: '10:30',
      status: 'programada',
      type: 'consulta-general',
      reason: 'Dolor abdominal persistente'
    },
    {
      id: 2,
      patientName: 'María González',
      patientEmail: 'maria.gonzalez@email.com',
      date: '2024-05-02',
      time: '11:00',
      status: 'completada',
      type: 'seguimiento',
      reason: 'Control post-tratamiento gastritis'
    },
    {
      id: 3,
      patientName: 'Carlos Rodríguez',
      patientEmail: 'carlos.rodriguez@email.com',
      date: '2024-05-02',
      time: '15:30',
      status: 'cancelada',
      type: 'telemedicina',
      reason: 'Consulta de rutina'
    }
  ];

  const handleStartConsultation = (consultation) => {
    setSelectedConsultation(consultation);
    setConsultationActive(true);
    setActiveTab('video');
  };

  const handleEndCall = () => {
    setConsultationActive(false);
    setSelectedConsultation(null);
    setActiveTab('agenda');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      programada: {
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        label: 'Programada'
      },
      en_progreso: {
        icon: Video,
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        label: 'En Progreso'
      },
      completada: {
        icon: CheckCircle,
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        label: 'Completada'
      },
      cancelada: {
        icon: XCircle,
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        label: 'Cancelada'
      }
    };

    const config = statusConfig[status] || statusConfig.programada;
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={14} />
        {config.label}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Avatar del médico */}
          <UserAvatar size="lg" showName={true} showRole={false} />

          {/* Info */}
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Telemedicina
            </h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Consultas virtuales con videoconferencia y chat
            </p>
          </div>
        </div>
      </div>

      {/* Alerta de consulta activa */}
      {consultationActive && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 shadow-2xl text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                <Video size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-1">
                  Consulta en Progreso
                </h3>
                <p className="text-green-100">
                  Paciente: {selectedConsultation?.patientName}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-100 mb-1">Duración</p>
              <p className="text-3xl font-bold font-mono" id="call-duration">00:00</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs de navegación */}
      {!consultationActive && (
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('agenda')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'agenda'
                ? 'bg-blue-500 text-white shadow-md'
                : isDark
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
            }`}
          >
            <Calendar size={20} />
            Agenda de Consultas
          </button>
          <button
            onClick={() => setActiveTab('historial')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'historial'
                ? 'bg-blue-500 text-white shadow-md'
                : isDark
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
            }`}
          >
            <FileText size={20} />
            Historial de Consultas
          </button>
        </div>
      )}

      {/* Contenido según tab */}
      {consultationActive ? (
        /* Consulta activa - Video + Chat */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TelemedicinaVideo
            consultationId={selectedConsultation?.id}
            onEndCall={handleEndCall}
          />
          <TelemedicinaChat
            consultationId={selectedConsultation?.id}
            patientId={selectedConsultation?.patientName}
          />
        </div>
      ) : (
        /* Agenda de consultas */
        activeTab === 'agenda' && (
          <div className={`rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Consultas Programadas ({consultations.length})
              </h3>
            </div>

            <div className="divide-y">
              {consultations.map((consultation) => (
                <div
                  key={consultation.id}
                  className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {consultation.patientName.charAt(0)}
                        </div>
                        <div>
                          <h4 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {consultation.patientName}
                          </h4>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {consultation.patientEmail}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <Calendar size={14} className="inline mr-1" />
                            Fecha
                          </p>
                          <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {new Date(consultation.date).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <Clock size={14} className="inline mr-1" />
                            Hora
                          </p>
                          <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {consultation.time}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Motivo
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {consultation.reason}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      {getStatusBadge(consultation.status)}

                      {consultation.status === 'programada' && (
                        <button
                          onClick={() => handleStartConsultation(consultation)}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
                        >
                          <Video size={20} />
                          Iniciar Consulta
                        </button>
                      )}

                      {consultation.status === 'completada' && (
                        <button
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                            isDark
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <FileText size={18} />
                          Ver Detalles
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {/* Historial de consultas */}
      {!consultationActive && activeTab === 'historial' && (
        <div className={`rounded-2xl p-8 text-center shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <FileText size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Historial de Consultas Virtuales
          </h3>
          <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Aquí podrás ver el historial completo de todas las consultas virtuales realizadas
          </p>
          <button className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all">
            Próximamente
          </button>
        </div>
      )}
    </div>
  );
};

export default TelemedicinaPage;
