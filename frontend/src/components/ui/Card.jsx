import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const Card = React.forwardRef(({
  children,
  className = '',
  noPadding = false,
  hover = false,
  variant = 'default',
  ...props
}, ref) => {
  const { isDark } = useTheme();

  const baseClasses = 'rounded-xl shadow-lg transition-all duration-200';

  const variants = {
    default: isDark ? 'bg-gray-800' : 'bg-white',
    primary: isDark ? 'bg-gradient-to-br from-blue-900 to-blue-800' : 'bg-gradient-to-br from-blue-50 to-blue-100',
    success: isDark ? 'bg-gradient-to-br from-green-900 to-green-800' : 'bg-gradient-to-br from-green-50 to-green-100',
    warning: isDark ? 'bg-gradient-to-br from-yellow-900 to-yellow-800' : 'bg-gradient-to-br from-yellow-50 to-yellow-100',
    danger: isDark ? 'bg-gradient-to-br from-red-900 to-red-800' : 'bg-gradient-to-br from-red-50 to-red-100'
  };

  const hoverClasses = hover ? 'hover:shadow-xl hover:scale-105 cursor-pointer' : '';
  const paddingClass = noPadding ? '' : 'p-6';

  return (
    <div
      ref={ref}
      className={`${baseClasses} ${variants[variant]} ${hoverClasses} ${paddingClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

// CardHeader component
export const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
};

// CardTitle component
export const CardTitle = ({ children, className = '' }) => {
  const { isDark } = useTheme();
  return (
    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} ${className}`}>
      {children}
    </h3>
  );
};

// CardDescription component
export const CardDescription = ({ children, className = '' }) => {
  const { isDark } = useTheme();
  return (
    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'} ${className}`}>
      {children}
    </p>
  );
};

// CardContent component
export const CardContent = ({ children, className = '' }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

// CardFooter component
export const CardFooter = ({ children, className = '' }) => {
  const { isDark } = useTheme();
  return (
    <div className={`mt-4 pt-4 border-t ${className} ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      {children}
    </div>
  );
};

export default Card;