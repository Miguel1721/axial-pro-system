import React from 'react';
import { Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  leftIcon,
  rightIcon,
  fullWidth = false,
  ...props
}, ref) => {
  const { isDark } = useTheme();

  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: `${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} focus:ring-blue-500 shadow-md hover:shadow-lg`,
    secondary: `${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'} focus:ring-gray-500`,
    success: `${isDark ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'} focus:ring-green-500`,
    danger: `${isDark ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'} focus:ring-red-500`,
    ghost: `${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} focus:ring-gray-500`,
    outline: `border-2 ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} focus:ring-gray-500`
  };

  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!isLoading && leftIcon && <span>{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span>{rightIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;