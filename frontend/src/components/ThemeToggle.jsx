import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-12 h-6 rounded-full transition-all duration-300 ease-in-out ${
        isDark
          ? 'bg-gradient-to-r from-purple-600 to-blue-600'
          : 'bg-gradient-to-r from-orange-400 to-yellow-500'
      } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        isDark ? 'focus:ring-purple-600' : 'focus:ring-yellow-500'
      }`}
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-label="Cambiar tema"
    >
      <div
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transform transition-all duration-300 ease-in-out ${
          isDark ? 'right-1' : 'left-1'
        }`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {isDark ? (
            <Moon size={12} className="text-purple-600" />
          ) : (
            <Sun size={12} className="text-orange-500" />
          )}
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;