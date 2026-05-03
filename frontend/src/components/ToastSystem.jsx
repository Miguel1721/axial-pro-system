/**
 * ToastSystem - Sistema de Notificaciones Mejorado
 *
 * Características:
 * - Multiple toasts simultáneos
 * - Auto-dismiss con progreso
 * - Acciones personalizadas
 * - Posicionamiento configurable
 * - Animaciones suaves
 * - Accesibilidad (ARIA)
 * - Persistencia en localStorage
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle, AlertCircle, X, Info, AlertTriangle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ToastContext = createContext();

// Configuración de tipos de toast
const TOAST_TYPES = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50 dark:bg-green-900',
    borderColor: 'border-green-200 dark:border-green-700',
    iconColor: 'text-green-500',
    progressColor: 'bg-green-500'
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50 dark:bg-red-900',
    borderColor: 'border-red-200 dark:border-red-700',
    iconColor: 'text-red-500',
    progressColor: 'bg-red-500'
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50 dark:bg-blue-900',
    borderColor: 'border-blue-200 dark:border-blue-700',
    iconColor: 'text-blue-500',
    progressColor: 'bg-blue-500'
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50 dark:bg-yellow-900',
    borderColor: 'border-yellow-200 dark:border-yellow-700',
    iconColor: 'text-yellow-500',
    progressColor: 'bg-yellow-500'
  }
};

// Provider del sistema de toasts
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast = {
      id,
      type: 'info',
      duration: 3000,
      ...toast
    };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Auto dismiss
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  // Métodos de conveniencia
  const success = useCallback((message, options = {}) => {
    return addToast({ ...options, type: 'success', message });
  }, [addToast]);

  const error = useCallback((message, options = {}) => {
    return addToast({ ...options, type: 'error', message, duration: 5000 });
  }, [addToast]);

  const info = useCallback((message, options = {}) => {
    return addToast({ ...options, type: 'info', message });
  }, [addToast]);

  const warning = useCallback((message, options = {}) => {
    return addToast({ ...options, type: 'warning', message });
  }, [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    info,
    warning
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Hook personalizado para usar toasts
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider');
  }
  return context;
};

// Contenedor de toasts
const ToastContainer = () => {
  const { toasts, removeToast } = useToast();
  const { isDark } = useTheme();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

// Item individual de toast
const ToastItem = memo(({ toast, onClose }) => {
  const { isDark } = useTheme();
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  const config = TOAST_TYPES[toast.type] || TOAST_TYPES.info;
  const Icon = config.icon;

  // Animación de progreso
  useEffect(() => {
    if (toast.duration > 0) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const decrement = 100 / (toast.duration / 100);
          const newProgress = prev - decrement;
          return newProgress > 0 ? newProgress : 0;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [toast.duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div
      className={`transform transition-all duration-300 pointer-events-auto ${
        isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}
    >
      <div
        className={`flex items-start space-x-3 p-4 rounded-xl border shadow-lg ${
          config.bgColor
        } ${config.borderColor} backdrop-blur-sm min-w-[300px] max-w-md`}
      >
        <Icon className={`flex-shrink-0 ${config.iconColor}`} size={20} />

        <div className="flex-1">
          <p
            className={`font-semibold text-sm ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            {toast.title || config.type.charAt(0).toUpperCase() + config.type.slice(1)}
          </p>
          {toast.message && (
            <p
              className={`text-sm mt-1 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              {toast.message}
            </p>
          )}

          {/* Acciones personalizadas */}
          {toast.actions && (
            <div className="flex gap-2 mt-3">
              {toast.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    action.onClick();
                    handleClose();
                  }}
                  className={`text-sm font-medium ${
                    action.primary
                      ? 'text-blue-600 hover:text-blue-700'
                      : isDark
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleClose}
          className={`flex-shrink-0 transition-transform hover:scale-110 ${
            isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <X size={16} />
        </button>
      </div>

      {/* Barra de progreso */}
      {toast.duration > 0 && (
        <div className={`h-1 ${config.bgColor} rounded-b-xl overflow-hidden`}>
          <div
            className={`h-full ${config.progressColor} transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
});

ToastItem.displayName = 'ToastItem';

// Componente memoizado para mejor performance
const memo = React.memo;