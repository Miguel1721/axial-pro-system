import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const Input = React.forwardRef(({
  type = 'text',
  label,
  error,
  helperText,
  icon,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const { isDark } = useTheme();

  const inputClasses = `
    w-full px-4 py-2 rounded-xl border transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}
    ${error ? 'border-red-500 focus:ring-red-500' : ''}
    ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${icon ? 'pl-10' : ''}
    ${className}
  `;

  return (
    <div className={`flex flex-col gap-1 ${containerClassName}`}>
      {label && (
        <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={inputClasses}
          {...props}
        />
      </div>

      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}

      {helperText && !error && (
        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {helperText}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;