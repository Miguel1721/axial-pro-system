import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import UserAvatar from '../components/UserAvatar';
import AnomaliasFinancieras from '../components/AnomaliasFinancieras';
import {
  Shield,
  BarChart3,
  AlertTriangle,
  Eye,
  Settings,
  Download,
  Activity,
  Users,
  Target,
  FileText,
  CheckCircle
} from 'lucide-react';

const AnomaliasFinancierasPage = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'alertas', label: 'Alertas', icon: AlertTriangle },
    { id: 'riesgo', label: 'Riesgo', icon: Target },
    { id: 'patrones', label: 'Patrones', icon: Eye },
    { id: 'configuracion', label: 'Configuración', icon: Settings }
  ];

  const exportReport = () => {
    alert('Generando reporte de anomalías financieras...');
  };

  const simulateTransaction = () => {
    alert('Simulando transacción para testing...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            🛡️ Detección de Anomalías Financieras
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Sistema inteligente para identificación de fraudes y patrones sospechosos
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={simulateTransaction}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Activity size={20} />
            Simular Transacción
          </button>
          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Download size={20} />
            Exportar Reporte
          </button>
        </div>
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
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Resumen del sistema */}
            <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                📊 Dashboard de Seguridad Financiera
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield size={32} className="text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">Alertas Críticas</h3>
                  <p className="text-2xl font-bold text-red-600">5</p>
                  <p className="text-sm text-gray-500">Requieren acción inmediata</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BarChart3 size={32} className="text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">Tasa de Detección</h3>
                  <p className="text-2xl font-bold text-blue-600">98.5%</p>
                  <p className="text-sm text-gray-500">Precisión del sistema</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users size={32} className="text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">Pacientes Monitoreados</h3>
                  <p className="text-2xl font-bold text-green-600">2,847</p>
                  <p className="text-sm text-gray-500">Activos en el sistema</p>
                </div>
              </div>
            </div>

            {/* Características principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'} text-center`}>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield size={24} className="text-red-500" />
                </div>
                <h3 className="font-semibold mb-2">Detección de Fraudes</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Identificación de transacciones sospechosas y patrones anómalos
                </p>
              </div>
              <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'} text-center`}>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle size={24} className="text-yellow-500" />
                </div>
                <h3 className="font-semibold mb-2">Prevención de Errores</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Detección automática de montos incorrectos y duplicados
                </p>
              </div>
              <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'} text-center`}>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Eye size={24} className="text-purple-500" />
                </div>
                <h3 className="font-semibold mb-2">Monitoreo en Tiempo Real</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Alertas instantáneas con notificaciones push
                </p>
              </div>
              <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'} text-center`}>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target size={24} className="text-green-500" />
                </div>
                <h3 className="font-semibold mb-2">Análisis Predictivo</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Predicción de riesgo basada en histórico de comportamiento
                </p>
              </div>
            </div>

            {/* Próximos pasos recomendados */}
            <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                🎯 Próximos Pasos Recomendados
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={16} className="text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-medium">Implementar autenticación de dos factores</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Aumentar seguridad en transacciones de alto valor
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <BarChart3 size={16} className="text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-medium">Configurar límites personalizados</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Establecer umbrales según perfil de cada paciente
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users size={16} className="text-purple-500" />
                  </div>
                  <div>
                    <h4 className="font-medium">Capacitar al personal</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Protocolos de respuesta ante alertas críticas
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alertas' && <AnomaliasFinancieras />}

        {activeTab === 'riesgo' && (
          <div className="space-y-6">
            <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                📈 Pacientes de Alto Riesgo
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="font-semibold mb-3">Top 5 Riesgo</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>1. Juan Pérez</span>
                      <span className="font-medium text-red-600">Nivel 9</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>2. Ana García</span>
                      <span className="font-medium text-red-600">Nivel 8</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>3. Carlos Mendoza</span>
                      <span className="font-medium text-orange-600">Nivel 7</span>
                    </div>
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="font-semibold mb-3">Patrones Detectados</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Transacciones frecuentes:</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Métodos de pago múltiples:</span>
                      <span className="font-medium">4</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Montos inconsistentes:</span>
                      <span className="font-medium">8</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'patrones' && (
          <div className="space-y-6">
            <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                🔍 Patrones de Comportamiento
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="font-semibold mb-3">Comportamientos Comunes</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Patrones normales: 89%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>Monitorear: 8%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Alerta: 3%</span>
                    </div>
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="font-semibold mb-3">Tipos de Anomalías</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Fraude:</span>
                      <span className="font-medium text-red-600">15</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Error:</span>
                      <span className="font-medium text-yellow-600">45</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sospecha:</span>
                      <span className="font-medium text-orange-600">28</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'configuracion' && (
          <div className="space-y-6">
            <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ⚙️ Configuración de Detección
              </h2>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="font-semibold mb-3">Umbral de Fraude</h3>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="100000"
                      max="1000000"
                      step="50000"
                      defaultValue="200000"
                      className="flex-1"
                    />
                    <span className="font-medium">$200,000</span>
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="font-semibold mb-3">Límite Diario por Paciente</h3>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="100000"
                      max="5000000"
                      step="100000"
                      defaultValue="1000000"
                      className="flex-1"
                    />
                    <span className="font-medium">$1,000,000</span>
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="font-semibold mb-3">Notificaciones</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span>Alertas críticas por email</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span>Notificaciones push</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span>Resumen diario</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnomaliasFinancierasPage;