/**
 * UserAvatar - Versión Optimizada
 *
 * Mejoras implementadas:
 * - React.memo para evitar re-renders innecesarios
 * - useMemo para configuraciones memoizadas
 * - Componentes separados para mejor optimización
 * - Soporte para accesibilidad (aria-labels)
 * - Reducción de cálculos repetitivos
 */

import React, { useMemo, memo } from 'react';
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

// Configuración memoizada de avatares por rol
const AVATAR_CONFIG = {
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

// Tamaños memoizados
const SIZE_CONFIG = {
  xs: { container: 'w-6 h-6 text-xs', icon: 14 },
  sm: { container: 'w-8 h-8 text-sm', icon: 18 },
  md: { container: 'w-10 h-10 text-base', icon: 22 },
  lg: { container: 'w-12 h-12 text-lg', icon: 26 },
  xl: { container: 'w-16 h-16 text-xl', icon: 32 }
};

const UserAvatar = memo(({
  size = 'md',
  showName = true,
  showRole = true,
  className = '',
  showTooltip = true
}) => {
  const { user } = useAuth();
  const { isDark, theme } = useTheme();

  // Memoizar configuración del avatar
  const config = useMemo(() => {
    return AVATAR_CONFIG[user?.rol] || AVATAR_CONFIG.paciente;
  }, [user?.rol]);

  // Memoizar tamaño
  const sizeConfig = useMemo(() => {
    return SIZE_CONFIG[size] || SIZE_CONFIG.md;
  }, [size]);

  // Memoizar Icon component
  const Icon = useMemo(() => config.icon, [config]);

  // Memoizar inicial del nombre
  const initial = useMemo(() => {
    return user?.nombre?.charAt(0).toUpperCase() || 'U';
  }, [user?.nombre]);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Avatar con gradiente */}
      <div
        className={`${sizeConfig.container} bg-gradient-to-br ${config.color} rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer relative group`}
        role="img"
        aria-label={`${config.emoji} ${config.label}`}
      >
        <Icon size={sizeConfig.icon} className={config.iconColor} />

        {/* Tooltip en hover */}
        {showTooltip && (
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
            <div className={`px-3 py-2 rounded-lg shadow-xl ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} border border-gray-200 dark:border-gray-700 whitespace-nowrap`}>
              <p className="font-semibold text-sm">{config.emoji} {config.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{config.description}</p>
            </div>
            {/* Triángulo del tooltip */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-200 dark:border-t-gray-700" />
          </div>
        )}
      </div>

      {/* Nombre y rol */}
      {(showName || showRole) && (
        <div className="flex flex-col">
          {showName && (
            <span
              className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} ${size === 'xs' ? 'text-xs' : size === 'sm' ? 'text-sm' : 'text-base'}`}
              aria-label={`Nombre: ${user?.nombre || 'Usuario'}`}
            >
              {user?.nombre || 'Usuario'}
            </span>
          )}
          {showRole && (
            <span
              className={`text-xs font-medium ${config.textColor} opacity-80`}
              aria-label={`Rol: ${config.label}`}
            >
              {config.label}
            </span>
          )}
        </div>
      )}

      {/* Flecha indicadora (opcional) */}
      {(size === 'lg' || size === 'xl') && (
        <ChevronDown size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
      )}
    </div>
  );
});

UserAvatar.displayName = 'UserAvatar';

// Componente de avatar compacto optimizado
export const AvatarCompact = memo(({
  size = 'sm',
  className = '',
  showTooltip = false
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();

  const config = useMemo(() => {
    return AVATAR_CONFIG[user?.rol] || AVATAR_CONFIG.paciente;
  }, [user?.rol]);

  const sizeConfig = useMemo(() => {
    return SIZE_CONFIG[size] || SIZE_CONFIG.sm;
  }, [size]);

  return (
    <div
      className={`${sizeConfig.container} ${config.bgColor} rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 ${className}`}
      role="img"
      aria-label={`${config.emoji} ${config.label}`}
    >
      <span className="text-sm">{config.emoji}</span>
    </div>
  );
});

AvatarCompact.displayName = 'AvatarCompact';

// Componente de avatar con inicial optimizado
export const AvatarInitial = memo(({
  size = 'md',
  className = '',
  showTooltip = false
}) => {
  const { user } = useAuth();

  const config = useMemo(() => {
    return AVATAR_CONFIG[user?.rol] || AVATAR_CONFIG.paciente;
  }, [user?.rol]);

  const initial = useMemo(() => {
    return user?.nombre?.charAt(0).toUpperCase() || 'U';
  }, [user?.nombre]);

  const sizeConfig = useMemo(() => {
    return SIZE_CONFIG[size] || SIZE_CONFIG.md;
  }, [size]);

  const { isDark } = useTheme();

  return (
    <div
      className={`${sizeConfig.container} bg-gradient-to-br ${config.color} rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer ${className}`}
      role="img"
      aria-label={`${config.emoji} ${config.label}`}
    >
      <span className="font-bold text-white">{initial}</span>
    </div>
  );
});

AvatarInitial.displayName = 'AvatarInitial';

export default UserAvatar;