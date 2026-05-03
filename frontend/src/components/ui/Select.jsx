import React from 'react';
import { ChevronDown, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Select = React.forwardRef(({
  label,
  options = [],
  value,
  onChange,
  error,
  helperText,
  placeholder = 'Seleccionar...',
  disabled = false,
  className = '',
  containerClassName = '',
  searchable = false,
  ...props
}, ref) => {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const selectRef = React.useRef(null);

  // Filter options if searchable
  const filteredOptions = searchable
    ? options.filter(option =>
        option.label?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(option => option.value === value);

  const selectClasses = `
    w-full px-4 py-2 pr-10 rounded-xl border transition-all duration-200
    appearance-none cursor-pointer
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}
    ${error ? 'border-red-500 focus:ring-red-500' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `;

  return (
    <div className={`flex flex-col gap-1 ${containerClassName}`} ref={selectRef}>
      {label && (
        <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {label}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={selectClasses}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {value && !disabled && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}

      {helperText && !error && (
        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {helperText}
        </span>
      )}

      {selectedOption && selectedOption.description && (
        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {selectedOption.description}
        </span>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;