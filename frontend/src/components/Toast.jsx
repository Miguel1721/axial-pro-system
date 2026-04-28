import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, X, Info, AlertTriangle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Toast = ({ id, type, message, duration = 3000, onClose }) => {
  const { isDark } = useTheme();
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose?.(id);
      }, 300); // Tiempo de animación de salida
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, id, onClose]);

  if (!isVisible) return null;

  const toastConfig = {
    success: {
      icon: CheckCircle,
      bgColor: isDark ? 'bg-green-900' : 'bg-green-50',
      borderColor: isDark ? 'border-green-700' : 'border-green-200',
      iconColor: 'text-green-500',
      title: 'Éxito'
    },
    error: {
      icon: AlertCircle,
      bgColor: isDark ? 'bg-red-900' : 'bg-red-50',
      borderColor: isDark ? 'border-red-700' : 'border-red-200',
      iconColor: 'text-red-500',
      title: 'Error'
    },
    info: {
      icon: Info,
      bgColor: isDark ? 'bg-blue-900' : 'bg-blue-50',
      borderColor: isDark ? 'border-blue-700' : 'border-blue-200',
      iconColor: 'text-blue-500',
      title: 'Información'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: isDark ? 'bg-yellow-900' : 'bg-yellow-50',
      borderColor: isDark ? 'border-yellow-700' : 'border-yellow-200',
      iconColor: 'text-yellow-500',
      title: 'Advertencia'
    }
  };

  const config = toastConfig[type] || toastConfig.info;
  const Icon = config.icon;

  return (
    <div
      className={`transform transition-all duration-300 ${
        isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}
    >
      <div
        className={`flex items-start space-x-3 p-4 rounded-xl border shadow-lg ${
          config.bgColor
        } ${config.borderColor} backdrop-blur-sm`}
      >
        <Icon className={`flex-shrink-0 ${config.iconColor}`} size={20} />
        <div className="flex-1">
          <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {config.title}
          </p>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {message}
          </p>
        </div>
        <button
          onClick={() => {
            setIsExiting(true);
            setTimeout(() => {
              setIsVisible(false);
              onClose?.(id);
            }, 300);
          }}
          className={`flex-shrink-0 transition-transform hover:scale-110 ${
            isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;