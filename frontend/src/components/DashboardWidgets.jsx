import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const DashboardWidgets = ({ children, title, onReorder }) => {
  const { isDark } = useTheme();
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-all duration-300 ${
        isDragging ? 'ring-2 ring-blue-500 opacity-50' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h2>
        {onReorder && (
          <button
            onClick={onReorder}
            className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
            title="Reordenar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
      </div>
      {children}
    </div>
  );
};

export default DashboardWidgets;