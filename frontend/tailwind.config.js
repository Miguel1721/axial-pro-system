/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Habilitar modo oscuro manual con clase 'dark'
  theme: {
    extend: {
      colors: {
        // Colores primarios (Azul médico)
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },

        // Colores de éxito (Verde médico)
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },

        // Colores de error (Rojo médico)
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },

        // Colores de advertencia (Naranja)
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },

        // Colores de innovación (Púrpura - IA)
        innovation: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },

        // Colores de información (Cian)
        info: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },

        // Variables CSS para compatibilidad
        'primary-500': 'var(--color-primary)',
        'success-500': 'var(--color-success)',
        'error-500': 'var(--color-error)',
        'warning-500': 'var(--color-warning)',

        // Fondos
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-accent': 'var(--bg-accent)',

        // Textos
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'text-inverse': 'var(--text-inverse)',

        // Estados
        'success-bg': 'var(--success-bg)',
        'success-text': 'var(--success-text)',
        'error-bg': 'var(--error-bg)',
        'error-text': 'var(--error-text)',
        'warning-bg': 'var(--warning-bg)',
        'warning-text': 'var(--warning-text)',

        // Bordes
        'border-primary': 'var(--border-primary)',
        'border-secondary': 'var(--border-secondary)',
        'border-dark': 'var(--border-dark)',
      },

      // Espaciado
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      // Tipografía
      fontSize: {
        'xxs': '0.625rem',
      },

      // Bordes
      borderRadius: {
        '4xl': '2rem',
      },

      // Sombras
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },

      // Animaciones
      animationDuration: {
        '4000': '4000ms',
      },
    },
  },
  plugins: [],
}