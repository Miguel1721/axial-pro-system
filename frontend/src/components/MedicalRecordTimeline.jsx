import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  Calendar,
  FileText,
  Download,
  Upload,
  Plus,
  Search,
  Filter,
  X,
  Clock,
  User,
  Stethoscope,
  Pill,
  AlertCircle
} from 'lucide-react';

const MedicalRecordTimeline = ({ patientId }) => {
  const { isDark } = useTheme();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Datos de ejemplo del timeline (vendrán de la API)
  const timelineData = [
    {
      id: 1,
      date: '2024-05-02',
      time: '10:30',
      type: 'consulta',
      title: 'Consulta General',
      description: 'Paciente acude por dolor abdominal persistente',
      doctor: 'Dr. Carlos García',
      documents: [
        { name: 'ecografia_abdominal.pdf', type: 'pdf' },
        { name: 'analisis_sangre.pdf', type: 'pdf' }
      ],
      notes: 'Se prescribe tratamiento con omeprazol 20mg por 14 días. Se recomienda dieta blanda.'
    },
    {
      id: 2,
      date: '2024-04-15',
      time: '15:00',
      type: 'diagnostico',
      title: 'Diagnóstico: Gastritis Crónica',
      description: 'Confirmado mediante endoscopia digestiva alta',
      doctor: 'Dra. María López',
      documents: [
        { name: 'endoscopia.jpg', type: 'image' },
        { name: 'biopsia.pdf', type: 'pdf' }
      ],
      notes: 'Gastritis crónica superficial con áreas de erosión. Iniciar tratamiento médico.'
    },
    {
      id: 3,
      date: '2024-04-10',
      time: '09:00',
      type: 'tratamiento',
      title: 'Inicio de Tratamiento',
      description: 'Prescripción de medicamentos',
      doctor: 'Dr. Carlos García',
      documents: [
        { name: 'receta_ompeprazol.pdf', type: 'pdf' }
      ],
      notes: 'Omeprazol 20mg - 1 cápsula antes del desayuno por 14 días'
    },
    {
      id: 4,
      date: '2024-03-28',
      time: '11:30',
      type: 'examen',
      title: 'Endoscopia Digestiva',
      description: 'Procedimiento diagnóstico',
      doctor: 'Dra. María López',
      documents: [
        { name: 'reporte_endoscopia.pdf', type: 'pdf' },
        { name: 'imagenes_procedimiento.zip', type: 'file' }
      ],
      notes: 'Procedimiento realizado sin complicaciones. Paciente toleró bien.'
    },
    {
      id: 5,
      date: '2024-03-20',
      time: '08:00',
      type: 'laboratorio',
      title: 'Análisis de Laboratorio',
      description: 'Hemograma y bioquímica completa',
      doctor: 'Laboratorio Central',
      documents: [
        { name: 'hemograma.pdf', type: 'pdf' },
        { name: 'bioquimica.pdf', type: 'pdf' }
      ],
      notes: 'Valores dentro de rangos normales. Ligera elevación de amilasa.'
    }
  ];

  // Configuración de iconos y colores por tipo
  const typeConfig = {
    consulta: {
      icon: Stethoscope,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      gradient: 'from-blue-500 to-cyan-500'
    },
    diagnostico: {
      icon: AlertCircle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      gradient: 'from-red-500 to-rose-500'
    },
    tratamiento: {
      icon: Pill,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      gradient: 'from-green-500 to-emerald-500'
    },
    examen: {
      icon: FileText,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      gradient: 'from-purple-500 to-violet-500'
    },
    laboratorio: {
      icon: Calendar,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      gradient: 'from-yellow-500 to-amber-500'
    }
  };

  // Filtrar timeline
  const filteredTimeline = timelineData.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || event.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleExportPDF = () => {
    // Función para exportar a PDF
    alert('Generando PDF del historial médico...');
  };

  const handleFileUpload = (files) => {
    // Función para subir archivos
    console.log('Subiendo archivos:', files);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 shadow-2xl ${isDark ? 'text-white' : 'text-white'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">📋 Historial Médico Digital</h2>
            <p className="text-blue-100">Historia clínica completa del paciente con timeline visual</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
            >
              <Upload size={20} />
              Subir Documentos
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-6 py-3 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800 transition-all shadow-lg hover:shadow-xl"
            >
              <Download size={20} />
              Exportar PDF
            </button>
          </div>
        </div>
      </div>

      {/* Buscador y filtros */}
      <div className={`rounded-xl p-4 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} size={20} />
            <input
              type="text"
              placeholder="Buscar en historial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                  : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500'
              }`}
            />
          </div>
          <div className="flex gap-2">
            {['all', 'consulta', 'diagnostico', 'tratamiento', 'examen', 'laboratorio'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterType === type
                    ? 'bg-blue-500 text-white shadow-md'
                    : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type === 'all' ? 'Todos' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Línea vertical */}
        <div className={`absolute left-8 top-0 bottom-0 w-1 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />

        {/* Eventos del timeline */}
        <div className="space-y-6">
          {filteredTimeline.map((event, index) => {
            const config = typeConfig[event.type] || typeConfig.consulta;
            const Icon = config.icon;

            return (
              <div
                key={event.id}
                className={`relative pl-20 pr-6 py-4 rounded-xl transition-all cursor-pointer hover:shadow-lg ${
                  isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'
                } ${selectedEvent === event.id ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setSelectedEvent(selectedEvent === event.id ? null : event.id)}
              >
                {/* Icono del evento */}
                <div className={`absolute left-4 top-6 w-12 h-12 bg-gradient-to-br ${config.gradient} rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all`}>
                  <Icon size={24} className="text-white" />
                </div>

                {/* Contenido del evento */}
                <div className="space-y-3">
                  {/* Fecha y hora */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar size={16} />
                    <span>{new Date(event.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <Clock size={16} />
                    <span>{event.time}</span>
                  </div>

                  {/* Título y descripción */}
                  <div>
                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
                      {event.title}
                    </h3>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      {event.description}
                    </p>
                  </div>

                  {/* Doctor */}
                  <div className="flex items-center gap-2 text-sm">
                    <User size={16} />
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      {event.doctor}
                    </span>
                  </div>

                  {/* Notas */}
                  {event.notes && (
                    <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {event.notes}
                      </p>
                    </div>
                  )}

                  {/* Documentos adjuntos */}
                  {event.documents && event.documents.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {event.documents.map((doc, docIndex) => (
                        <div
                          key={docIndex}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                            isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Ver documento
                            alert('Abriendo documento: ' + doc.name);
                          }}
                        >
                          <FileText size={16} />
                          <span>{doc.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Detalles expandidos */}
                  {selectedEvent === event.id && (
                    <div className={`mt-4 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-blue-50'} border-l-4 border-blue-500`}>
                      <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Detalles completos
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Tipo:</strong> {event.type.charAt(0).toUpperCase() + event.type.slice(1)}</p>
                        <p><strong>Fecha:</strong> {event.date}</p>
                        <p><strong>Hora:</strong> {event.time}</p>
                        <p><strong>Profesional:</strong> {event.doctor}</p>
                        <p><strong>Notas:</strong> {event.notes}</p>
                        <p><strong>Documentos:</strong> {event.documents.length} archivo(s)</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de subida de archivos */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Subir Documentos
              </h3>
              <button
                onClick={() => setShowUpload(false)}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Dropzone */}
              <div className={`border-2 border-dashed rounded-xl p-8 text-center ${
                isDark
                  ? 'border-gray-600 hover:border-blue-500'
                  : 'border-gray-300 hover:border-blue-500'
              } transition-colors cursor-pointer`}>
                <Upload size={48} className="mx-auto mb-4 text-gray-400" />
                <p className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Arrastra archivos aquí
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  PDF, JPG, PNG hasta 10MB
                </p>
              </div>

              {/* Info */}
              <div className={`p-3 rounded-lg text-sm ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  ℹ️ Los documentos se almacenarán de forma segura y se asociarán automáticamente al historial del paciente.
                </p>
              </div>

              {/* Botón cancelar */}
              <button
                onClick={() => setShowUpload(false)}
                className="w-full py-3 rounded-xl font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecordTimeline;
