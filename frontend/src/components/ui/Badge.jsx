import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const Badge = React.forwardRef(({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
  ...props
}, ref) => {
  const { isDark } = useTheme();

  const variants = {
    default: isDark
      ? 'bg-gray-700 text-gray-300'
      : 'bg-gray-100 text-gray-800',
    primary: isDark
      ? 'bg-blue-900 text-blue-300'
      : 'bg-blue-100 text-blue-800',
    success: isDark
      ? 'bg-green-900 text-green-300'
      : 'bg-green-100 text-green-800',
    warning: isDark
      ? 'bg-yellow-900 text-yellow-300'
      : 'bg-yellow-100 text-yellow-800',
    danger: isDark
      ? 'bg-red-900 text-red-300'
      : 'bg-red-100 text-red-800',
    info: isDark
      ? 'bg-cyan-900 text-cyan-300'
      : 'bg-cyan-100 text-cyan-800',
    outline: isDark
      ? 'border border-gray-600 text-gray-300'
      : 'border border-gray-300 text-gray-700'
  };

  const sizes = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-sm'
  };

  const dotColors = {
    default: isDark ? 'bg-gray-400' : 'bg-gray-500',
    primary: isDark ? 'bg-blue-400' : 'bg-blue-500',
    success: isDark ? 'bg-green-400' : 'bg-green-500',
    warning: isDark ? 'bg-yellow-400' : 'bg-yellow-500',
    danger: isDark ? 'bg-red-400' : 'bg-red-500',
    info: isDark ? 'bg-cyan-400' : 'bg-cyan-500'
  };

  return (
    <span
      ref={ref}
      className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`mr-1.5 h-1.5 w-1.5 rounded-full ${dotColors[variant]}`}
        />
      )}
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

// Status Badge - for status indicators
export const StatusBadge = ({ status, className = '', ...props }) => {
  const statusConfig = {
    pending: { variant: 'warning', label: 'Pendiente' },
    confirmed: { variant: 'success', label: 'Confirmada' },
    cancelled: { variant: 'danger', label: 'Cancelada' },
    completed: { variant: 'success', label: 'Completada' },
    in_progress: { variant: 'primary', label: 'En Progreso' },
    failed: { variant: 'danger', label: 'Fallida' },
    active: { variant: 'success', label: 'Activo' },
    inactive: { variant: 'default', label: 'Inactivo' }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge
      variant={config.variant}
      dot
      className={className}
      {...props}
    >
      {config.label}
    </Badge>
  );
};

// Count Badge - for notification counts
export const CountBadge = ({ count, max = 99, className = '', ...props }) => {
  const displayCount = count > max ? `${max}+` : count;

  return (
    <Badge
      variant="danger"
      size="sm"
      className={`min-w-[1.25rem] h-5 flex items-center justify-center p-0 ${className}`}
      {...props}
    >
      {displayCount}
    </Badge>
  );
};

export default Badge;