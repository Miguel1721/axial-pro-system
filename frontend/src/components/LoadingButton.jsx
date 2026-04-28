import React from 'react';
import { useTheme } from '../context/ThemeContext';

const LoadingButton = ({
  children,
  onClick,
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  variant = 'primary'
}) => {
  const { isDark } = useTheme();

  const variants = {
    primary: `bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 focus:ring-blue-500`,
    secondary: `bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-gray-500`,
    danger: `bg-red-500 text-white hover:bg-red-600 focus:ring-red-500`,
    success: `bg-green-500 text-white hover:bg-green-600 focus:ring-green-500`
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative px-6 py-2.5 rounded-xl font-medium transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center space-x-2
        ${variants[variant]}
        ${isDark ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'}
        ${className}
      `}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          <span>Procesando...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default LoadingButton;