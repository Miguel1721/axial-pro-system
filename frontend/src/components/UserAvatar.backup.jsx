import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Shield,
  Stethoscope,
  Headphones,
  DollarSign,
  User,
  ChevronDown
} from 'lucide-react';

const UserAvatar = ({ size = 'md', showName = true, showRole = true, className = '' }) => {
  const { user } = useAuth();
  const { isDark, theme } = useTheme();

  // Configuración de avatares por rol
  const avatarConfig = {
    admin: {
      icon: Shield,
      label: 'Admin',
      color: 'from-red-500 to-rose-600',
      bgColor: 'bg-red-500',
      textColor: 'text-red-600',
      iconColor: 'text-white',
      emoji: '👨‍💼',
      description: 'Administrador del Sistema'
    },
    medico: {
      icon: Stethoscope,
      label: 'Médico',
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-500',
      textColor: 'text-blue-600',
      iconColor: 'text-white',
      emoji: '👨‍⚕️',
      description: 'Personal Médico'
    },
    recepcion: {
      icon: Headphones,
      label: 'Recepción',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500',
      textColor: 'text-green-600',
      iconColor: 'text-white',
      emoji: '💁',
      description: 'Recepción y Atención'
    },
    caja: {
      icon: DollarSign,
      label: 'Caja',
      color: 'from-yellow-500 to-amber-600',
      bgColor: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      iconColor: 'text-white',
      emoji: '💰',
      description: 'Tesorería y Pagos'
    },
    paciente: {
      icon: User,
      label: 'Paciente',
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-500',
      textColor: 'text-purple-600',
      iconColor: 'text-white',
      emoji: '👤',
      description: 'Paciente'
    }
  };

  const config = avatarConfig[user?.rol] || avatarConfig.paciente;
  const Icon = config.icon;

  // Tamaños
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  };

  const avatarSize = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Avatar con gradiente */}
      <div className={`${avatarSize} bg-gradient-to-br ${config.color} rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer relative group`}>
        <Icon size={size === 'xs' ? 14 : size === 'sm' ? 18 : size === 'md' ? 22 : size === 'lg' ? 26 : 32} className={config.iconColor} />

        {/* Tooltip en hover */}
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
          <div className={`px-3 py-2 rounded-lg shadow-xl ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} border border-gray-200 dark:border-gray-700 whitespace-nowrap`}>
            <p className="font-semibold text-sm">{config.emoji} {config.label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{config.description}</p>
          </div>
          {/* Triángulo del tooltip */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-200 dark:border-t-gray-700" />
        </div>
      </div>

      {/* Nombre y rol */}
      {(showName || showRole) && (
        <div className="flex flex-col">
          {showName && (
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} ${size === 'xs' ? 'text-xs' : size === 'sm' ? 'text-sm' : 'text-base'}`}>
              {user?.nombre || 'Usuario'}
            </span>
          )}
          {showRole && (
            <span className={`text-xs font-medium ${config.textColor} opacity-80`}>
              {config.label}
            </span>
          )}
        </div>
      )}

      {/* Flecha indicadora (opcional) */}
      {size === 'lg' || size === 'xl' ? (
        <ChevronDown size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
      ) : null}
    </div>
  );
};

// Componente de avatar compacto para spaces reducidos
export const AvatarCompact = ({ size = 'sm', className = '' }) => {
  const { user } = useAuth();
  const { theme } = useTheme();

  const avatarConfig = {
    admin: { emoji: '👨‍💼', color: 'bg-red-500' },
    medico: { emoji: '👨‍⚕️', color: 'bg-blue-500' },
    recepcion: { emoji: '💁', color: 'bg-green-500' },
    caja: { emoji: '💰', color: 'bg-yellow-500' },
    paciente: { emoji: '👤', color: 'bg-purple-500' }
  };

  const config = avatarConfig[user?.rol] || avatarConfig.paciente;

  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  return (
    <div className={`${sizes[size]} ${config.color} rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 ${className}`}>
      <span className="text-sm">{config.emoji}</span>
    </div>
  );
};

// Componente de avatar con inicial
export const AvatarInitial = ({ size = 'md', className = '' }) => {
  const { user } = useAuth();

  const avatarConfig = {
    admin: { color: 'from-red-500 to-rose-600' },
    medico: { color: 'from-blue-500 to-cyan-600' },
    recepcion: { color: 'from-green-500 to-emerald-600' },
    caja: { color: 'from-yellow-500 to-amber-600' },
    paciente: { color: 'from-purple-500 to-violet-600' }
  };

  const config = avatarConfig[user?.rol] || avatarConfig.paciente;
  const initial = user?.nombre?.charAt(0).toUpperCase() || 'U';

  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  };

  return (
    <div className={`${sizes[size]} bg-gradient-to-br ${config.color} rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer ${className}`}>
      <span className="font-bold text-white">{initial}</span>
    </div>
  );
};

export default UserAvatar;
