import React, { useState } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useTheme } from '../context/ThemeContext';
import {
  Eye,
  Minus,
  Plus,
  RotateCcw,
  Zap,
  Accessibility
} from 'lucide-react';

const AccessibilityControl = () => {
  const {
    highContrast,
    toggleHighContrast,
    textSize,
    increaseTextSize,
    decreaseTextSize,
    resetTextSize,
    reduceMotion,
    toggleReduceMotion
  } = useAccessibility();

  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl transition-all duration-200 ${
          isDark
            ? 'bg-gray-700 hover:bg-gray-600 text-white'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
        title="Opciones de Accesibilidad"
        aria-label="Abrir opciones de accesibilidad"
      >
        <Accessibility size={20} />
      </button>

      {/* Panel de accesibilidad */}
      {isOpen && (
        <>
          {/* Overlay para cerrar al hacer clic fuera */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar panel de accesibilidad"
          />

          {/* Panel de opciones */}
          <div className={`absolute right-0 top-12 w-80 rounded-xl shadow-2xl z-50 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Accesibilidad
              </h3>
            </div>

            <div className="p-4 space-y-4">
              {/* Alto Contraste */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Zap className={`w-5 h-5 ${highContrast ? 'text-yellow-500' : 'text-gray-500'}`} />
                  <div>
                    <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Alto Contraste
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Mejora la visibilidad para usuarios con baja visión
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleHighContrast}
                  className={`relative w-12 h-6 rounded-full transition-all duration-200 ${
                    highContrast
                      ? 'bg-yellow-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  aria-label={highContrast ? 'Desactivar alto contraste' : 'Activar alto contraste'}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-200 ${
                      highContrast ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Tamaño de Texto */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <Eye className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Tamaño de Texto
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {textSize}% (100% por defecto)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={resetTextSize}
                    className="p-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Restablecer tamaño"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={decreaseTextSize}
                    disabled={textSize <= 80}
                    className={`p-2 rounded-lg transition-all ${
                      textSize <= 80
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    aria-label="Disminuir tamaño de texto"
                  >
                    <Minus size={20} />
                  </button>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${((textSize - 80) / (150 - 80)) * 100}%` }}
                    />
                  </div>
                  <button
                    onClick={increaseTextSize}
                    disabled={textSize >= 150}
                    className={`p-2 rounded-lg transition-all ${
                      textSize >= 150
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    aria-label="Aumentar tamaño de texto"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              {/* Reducir Movimiento */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
                    <span className="text-white text-xs">♿</span>
                  </div>
                  <div>
                    <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Reducir Movimiento
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Menos animaciones para sensibilidad al movimiento
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleReduceMotion}
                  className={`relative w-12 h-6 rounded-full transition-all duration-200 ${
                    reduceMotion
                      ? 'bg-gradient-to-r from-green-500 to-teal-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  aria-label={reduceMotion ? 'Activar animaciones' : 'Reducir animaciones'}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-200 ${
                      reduceMotion ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Información WCAG */}
              <div className={`p-3 rounded-lg text-center text-xs ${
                isDark ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-50 text-blue-700'
              }`}>
                <p className="font-medium">
                  ♿ Cumple con WCAG 2.1 AA
                </p>
                <p className="mt-1">
                  Configuración optimizada para accesibilidad universal
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AccessibilityControl;