import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  RotateCw,
  HeartPulse,
  Calendar,
  Users,
  FileText,
  Video,
  Brain,
  BarChart3,
  Smartphone,
  CheckCircle,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  MessageSquare,
  Activity,
  Clock,
  Award,
  Shield,
  Globe,
  Settings,
  Bell,
  Search,
  Plus,
  MinusCircle
} from 'lucide-react';

const DemoInteractive = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedModule, setSelectedModule] = useState(null);
  const [demoData, setDemoData] = useState({
    pacientes: 156,
    citasHoy: 42,
    doctores: 8,
    satisfaccion: 94,
    ingresos: 2340000,
    eficiencia: 87
  });

  const demoSteps = [
    {
      id: 'welcome',
      title: 'Bienvenido a Axial Pro',
      subtitle: 'La plataforma integral para clínicas modernas',
      icon: <HeartPulse className="h-16 w-16" />,
      content: 'Descubre cómo nuestra IA puede transformar tu operación clínica',
      duration: 5000
    },
    {
      id: 'dashboard',
      title: 'Dashboard Inteligente',
      subtitle: 'Control total de tu clínica en tiempo real',
      icon: <BarChart3 className="h-16 w-16" />,
      content: 'Métricas clave, insights de IA y alertas automáticas',
      duration: 5000
    },
    {
      id: 'citas',
      title: 'Gestión de Citas IA',
      subtitle: 'Optimización automática con machine learning',
      icon: <Calendar className="h-16 w-16" />,
      content: 'Reducción de vacíos, balanceo de médicos y predicción de demanda',
      duration: 5000
    },
    {
      id: 'historial',
      title: 'Historial Médico Avanzado',
      subtitle: 'Registro completo con análisis de IA',
      icon: <FileText className="h-16 w-16" />,
      content: 'Timeline visual, patrones recurrentes y alertas tempranas',
      duration: 5000
    },
    {
      id: 'telemedicina',
      title: 'Telemedicina Integrada',
      subtitle: 'Videoconsultas de alta calidad',
      icon: <Video className="h-16 w-16" />,
      content: 'Chat en tiempo real, prescripciones digitales y seguimiento',
      duration: 5000
    },
    {
      id: 'ia',
      title: 'Módulos IA',
      subtitle: '10 sistemas de inteligencia artificial',
      icon: <Brain className="h-16 w-16" />,
      content: 'Predicción, triaje, reconocimiento de voz, análisis y más',
      duration: 5000
    }
  ];

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % demoSteps.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const handleNextStep = () => {
    setCurrentStep((prev) => (prev + 1) % demoSteps.length);
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => (prev - 1 + demoSteps.length) % demoSteps.length);
  };

  const handleSkipToEnd = () => {
    setCurrentStep(demoSteps.length - 1);
  };

  const handleStartFree = () => {
    navigate('/signup?plan=free');
  };

  const handleContactSales = () => {
    navigate('/contact?source=demo');
  };

  const currentDemoStep = demoSteps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors"
            >
              <X className="h-6 w-6" />
              <span className="hidden md:inline">Salir</span>
            </button>

            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <HeartPulse className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Axial Pro Demo</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 text-white hover:text-blue-400 transition-colors"
              title={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </button>

            <button
              onClick={handleSkipToEnd}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Saltar Tour
            </button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="pt-24 pb-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-center space-x-2 mb-8">
            {demoSteps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(index)}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                  index === currentStep
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white scale-110'
                    : index < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {/* Demo Content */}
          <div className="bg-slate-800/50 backdrop-blur-md rounded-3xl p-8 border border-slate-700">
            {/* Step Content */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl text-white">
                  {currentDemoStep.icon}
                </div>
              </div>
              <h2 className="text-4xl font-bold text-white mb-2">{currentDemoStep.title}</h2>
              <p className="text-xl text-blue-200">{currentDemoStep.subtitle}</p>
            </div>

            {/* Interactive Demo Preview */}
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
              {currentStep === 0 && (
                <WelcomeDemo onStart={handleNextStep} />
              )}
              {currentStep === 1 && <DashboardDemo demoData={demoData} />}
              {currentStep === 2 && <CitasDemo demoData={demoData} />}
              {currentStep === 3 && <HistorialDemo demoData={demoData} />}
              {currentStep === 4 && <TelemedicinaDemo demoData={demoData} />}
              {currentStep === 5 && <IAModulesDemo demoData={demoData} />}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={handlePrevStep}
                className="flex items-center space-x-2 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
                <span>Anterior</span>
              </button>

              <div className="flex space-x-4">
                <button
                  onClick={handleStartFree}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Sparkles className="h-5 w-5 inline mr-2" />
                  Comenzar Gratis
                </button>
                <button
                  onClick={handleContactSales}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MessageSquare className="h-5 w-5 inline mr-2" />
                  Hablar con Ventas
                </button>
              </div>

              <button
                onClick={handleNextStep}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
              >
                <span>Siguiente</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Demo Components
const WelcomeDemo = ({ onStart }) => (
  <div className="text-center space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <Users className="h-12 w-12 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">400+</h3>
        <p className="text-blue-100">Clínicas Activas</p>
      </div>
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 text-white">
        <Users className="h-12 w-12 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">2M+</h3>
        <p className="text-purple-100">Pacientes</p>
      </div>
      <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6 text-white">
        <TrendingUp className="h-12 w-12 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">30%</h3>
        <p className="text-green-100">Reducción Tiempo Admin</p>
      </div>
    </div>

    <button
      onClick={onStart}
      className="mt-8 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-lg font-medium hover:shadow-xl transition-all duration-200"
    >
      <Play className="h-6 w-6 inline mr-3" />
      Comenzar Tour Interactivo
    </button>
  </div>
);

const DashboardDemo = ({ demoData }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-4 text-white">
        <Activity className="h-8 w-8 mb-2" />
        <p className="text-sm opacity-90">Citas Hoy</p>
        <p className="text-2xl font-bold">{demoData.citasHoy}</p>
      </div>
      <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-4 text-white">
        <Users className="h-8 w-8 mb-2" />
        <p className="text-sm opacity-90">Pacientes</p>
        <p className="text-2xl font-bold">{demoData.pacientes}</p>
      </div>
      <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-4 text-white">
        <TrendingUp className="h-8 w-8 mb-2" />
        <p className="text-sm opacity-90">Ingresos</p>
        <p className="text-2xl font-bold">${(demoData.ingresos / 1000000).toFixed(1)}M</p>
      </div>
    </div>

    <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl p-4 border border-indigo-700">
      <div className="flex items-start space-x-3">
        <Brain className="h-8 w-8 text-indigo-400 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-indigo-200">Insight IA</p>
          <p className="text-sm text-indigo-100">Predicción: Alta demanda esperada mañana entre 9-11 AM. La IA recomienda agregar un médico de turno.</p>
        </div>
      </div>
    </div>
  </div>
);

const CitasDemo = ({ demoData }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <h4 className="text-white font-semibold mb-3">Optimización IA</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Vacíos reducidos</span>
            <span className="text-green-400 font-semibold">23%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Balance médicos</span>
            <span className="text-blue-400 font-semibold">87%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Eficiencia</span>
            <span className="text-purple-400 font-semibold">91%</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <h4 className="text-white font-semibold mb-3">Predicción de Demanda</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Mañana</span>
            <span className="text-red-400 font-semibold">Alta</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Tarde</span>
            <span className="text-yellow-400 font-semibold">Media</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Noche</span>
            <span className="text-green-400 font-semibold">Baja</span>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl p-4 border border-blue-800">
      <p className="text-sm text-blue-200">
        <Zap className="h-4 w-4 inline mr-2" />
        La IA ha optimizado automáticamente 8 citas esta semana, reduciendo tiempos de espera en 15%
      </p>
    </div>
  </div>
);

const HistorialDemo = ({ demoData }) => (
  <div className="space-y-6">
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <h4 className="text-white font-semibold mb-4">Timeline Visual del Paciente</h4>
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <div className="flex-1 bg-slate-700 rounded-lg p-3">
            <p className="text-white text-sm font-medium">Consulta de seguimiento</p>
            <p className="text-gray-400 text-xs">Hace 2 días - Dr. Pérez</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <div className="flex-1 bg-slate-700 rounded-lg p-3">
            <p className="text-white text-sm font-medium">Resultado de análisis</p>
            <p className="text-gray-400 text-xs">Hace 5 días - Laboratorio</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <div className="flex-1 bg-slate-700 rounded-lg p-3">
            <p className="text-white text-sm font-medium">Consulta inicial</p>
            <p className="text-gray-400 text-xs">Hace 1 semana - Medicina General</p>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-gradient-to-r from-amber-900 to-orange-900 rounded-xl p-4 border border-amber-700">
      <div className="flex items-start space-x-3">
        <Target className="h-6 w-6 text-amber-400 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-200">Alerta IA Detectada</p>
          <p className="text-xs text-amber-100">Patrón recurrente: El paciente tiene dolores de cabeza cada 2-3 semanas. Se recomienda seguimiento preventivo.</p>
        </div>
      </div>
    </div>
  </div>
);

const TelemedicinaDemo = ({ demoData }) => (
  <div className="space-y-6">
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <h4 className="text-white font-semibold mb-4">Videoconsulta en Progreso</h4>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 rounded-lg p-4">
          <div className="aspect-video bg-gradient-to-br from-blue-900 to-purple-900 rounded-lg flex items-center justify-center">
            <Video className="h-12 w-12 text-blue-400" />
            <p className="text-blue-300 text-sm mt-2">Video LL</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-green-400">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Conexión estable</span>
          </div>
          <div className="flex items-center space-x-2 text-green-400">
            <Clock className="h-4 w-4" />
            <span className="text-sm">12:45 de duración</span>
          </div>
          <div className="flex items-center space-x-2 text-blue-400">
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm">Chat activo</span>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <h4 className="text-white font-semibold mb-3">Funcionalidades</h4>
        <ul className="space-y-2">
          <li className="flex items-center text-gray-300 text-sm">
            <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
            Video HD
          </li>
          <li className="flex items-center text-gray-300 text-sm">
            <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
            Chat tiempo real
          </li>
          <li className="flex items-center text-gray-300 text-sm">
            <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
            Prescripciones digitales
          </li>
        </ul>
      </div>

      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <h4 className="text-white font-semibold mb-3">Estadísticas</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Calidad video</span>
            <span className="text-blue-400 font-semibold">HD</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Satisfacción</span>
            <span className="text-green-400 font-semibold">94%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const IAModulesDemo = ({ demoData }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4">
      {[
        { name: 'Predicción de Demanda', desc: 'Predice citas con 87% precisión', color: 'blue' },
        { name: 'Optimización de Citas', desc: 'Reduce vacíos en 23%', color: 'green' },
        { name: 'Chatbot de Triaje', desc: 'Clasifica urgencias 24/7', color: 'purple' },
        { name: 'Análisis de Historial', desc: 'Detecta patrones recurrentes', color: 'indigo' },
        { name: 'Reconocimiento Voz', desc: 'Dicta notas médicas', color: 'pink' },
        { name: 'Alertas de Stock', desc: 'Predice agotamientos', color: 'red' },
        { name: 'Sentimiento Pacientes', desc: 'Analiza feedbacks', color: 'yellow' },
        { name: 'Sugerencias Citas', desc: 'Recomienda horarios óptimos', color: 'cyan' },
        { name: 'Recordatorios IA', desc: 'SMS/WhatsApp automáticos', color: 'orange' },
        { name: 'IA Vision', desc: 'OCR y reconocimiento facial', color: 'violet' }
      ].map((module, index) => (
        <div key={index} className={`bg-gradient-to-br from-${module.color}-900 to-${module.color}-950 rounded-xl p-4 border border-${module.color}-700`}>
          <div className="flex items-center space-x-3 mb-2">
            <Brain className="h-6 w-6 text-white" />
            <h5 className="text-white font-semibold text-sm">{module.name}</h5>
          </div>
          <p className="text-gray-300 text-xs">{module.desc}</p>
        </div>
      ))}
    </div>

    <div className="bg-gradient-to-r from-green-900 to-emerald-900 rounded-xl p-4 border border-green-700">
      <div className="flex items-center space-x-3">
        <Award className="h-8 w-8 text-green-400 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-green-200">Sistema IA Completo</p>
          <p className="text-xs text-green-100">10 módulos integrados trabajando 24/7 para optimizar tu clínica</p>
        </div>
      </div>
    </div>
  </div>
);

export default DemoInteractive;