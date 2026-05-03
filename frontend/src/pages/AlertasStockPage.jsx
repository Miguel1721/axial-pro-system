import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import UserAvatar from '../components/UserAvatar';
import AlertasStock from '../components/AlertasStock';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  Clock,
  DollarSign,
  BarChart3,
  Calendar,
  Zap,
  Settings,
  Download,
  Plus
} from 'lucide-react';

const AlertasStockPage = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'alertas', label: 'Alertas', icon: AlertTriangle },
    { id: 'inventario', label: 'Inventario', icon: Package },
    { id: 'analitica', label: 'Analítica', icon: TrendingUp },
    { id: 'configuracion', label: 'Configuración', icon: Settings }
  ];

  const exportReport = () => {
    alert('Generando reporte de inventario y alertas...');
  };

  const generateRecommendation = () => {
    alert('Generando plan de optimización de inventario...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Alertas de Stock Inteligentes
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Sistema predictivo de gestión de inventario médico
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={generateRecommendation}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            <TrendingUp size={20} />
            Optimizar Inventario
          </button>
          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
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

      {/* Contenido según tab activo */}
      <div className="transition-all">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Resumen del sistema */}
            <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                📊 Resumen de Gestión de Inventario
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Package size={32} className="text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">Total de Medicamentos</h3>
                  <p className="text-2xl font-bold text-blue-600">247</p>
                  <p className="text-sm text-gray-500">+12 este mes</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertTriangle size={32} className="text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">Alertas Activas</h3>
                  <p className="text-2xl font-bold text-orange-600">18</p>
                  <p className="text-sm text-gray-500">5 críticas</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp size={32} className="text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">Eficiencia</h3>
                  <p className="text-2xl font-bold text-green-600">94%</p>
                  <p className="text-sm text-gray-500">Optimo</p>
                </div>
              </div>
            </div>

            {/* Características principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'} text-center`}>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle size={24} className="text-red-500" />
                </div>
                <h3 className="font-semibold mb-2">Predicción de Agotamiento</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Alertas proactivas antes de quedar sin stock
                </p>
              </div>
              <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'} text-center`}>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock size={24} className="text-orange-500" />
                </div>
                <h3 className="font-semibold mb-2">Control de Vencimiento</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Monitoreo automático de fechas de caducidad
                </p>
              </div>
              <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'} text-center`}>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <DollarSign size={24} className="text-yellow-500" />
                </div>
                <h3 className="font-semibold mb-2">Optimización de Costos</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Análisis de precios y sugerencias de compra
                </p>
              </div>
              <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'} text-center`}>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap size={24} className="text-blue-500" />
                </div>
                <h3 className="font-semibold mb-2">Inteligencia Predictiva</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  IA basada en patrones de uso histórico
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
                    <h4 className="font-medium">Reabastecer Amoxicilina</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Stock crítico. Se recomienda comprar 32 unidades urgentemente.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock size={16} className="text-yellow-500" />
                  </div>
                  <div>
                    <h4 className="font-medium">Rotación de stock Ibuprofeno</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Próximo a vencer. Usar en próximos 15 días o negociar descuento.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp size={16} className="text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-medium">Optimizar compra de Paracetamol</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Alta demanda. Considerar compra mayorista para reducir costos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alertas' && <AlertasStock />}

        {activeTab === 'inventario' && (
          <AlertasStock />
        )}

        {activeTab === 'analitica' && (
          <div className="space-y-6">
            <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                📈 Análisis de Inventario
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="font-semibold mb-3">Movimientos del Mes</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Entradas totales:</span>
                      <span className="font-medium text-green-600">+156</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Salidas totales:</span>
                      <span className="font-medium text-red-600">-142</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Neto:</span>
                      <span className="font-medium">+14</span>
                    </div>
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="font-semibold mb-3">Categorías Más Demandadas</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Analgésicos:</span>
                      <span className="font-medium">35%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Antibióticos:</span>
                      <span className="font-medium">28%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Antiinflamatorios:</span>
                      <span className="font-medium">22%</span>
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
                ⚙️ Configuración de Alertas
              </h2>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="font-semibold mb-3">Umbral de Stock Mínimo</h3>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="5"
                      max="50"
                      defaultValue="15"
                      className="flex-1"
                    />
                    <span className="font-medium">15 unidades</span>
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="font-semibold mb-3">Días Anticipación Vencimiento</h3>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="7"
                      max="90"
                      defaultValue="30"
                      className="flex-1"
                    />
                    <span className="font-medium">30 días</span>
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="font-semibold mb-3">Notificaciones</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span>Alertas de stock bajo</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span>Alertas de vencimiento</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span>Resumen semanal</span>
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

export default AlertasStockPage;