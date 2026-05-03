/**
 * Design System Tokens - Versión Simplificada
 *
 * Tokens de diseño sin dependencias circulares
 * Solo exporta constantes, no objetos importados
 */

// ============================================
// COLORES - Paleta Médica Profesional
// ============================================

export const COLORS = {
  // Azul médico - Confianza y salud
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',     // Principal
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Verde médico - Salud y éxito
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#10b981',     // Éxito
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },

  // Rojo médico - Alertas y errores
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',     // Error
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Naranja - Advertencias
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',     // Advertencia
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Púrpura - Innovación e IA
  innovation: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',     // Innovación
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },
};

// ============================================
// TIPOGRAFÍA - Escala WCAG AA
// ============================================

export const TYPOGRAPHY = {
  h1: 'text-5xl font-bold leading-tight text-text-primary',
  h2: 'text-4xl font-semibold leading-tight text-text-primary',
  h3: 'text-3xl font-semibold leading-snug text-text-primary',
  h4: 'text-2xl font-semibold leading-normal text-text-primary',
  body: 'text-base font-normal leading-normal text-text-primary',     // 16px WCAG mínimo
  bodySm: 'text-sm font-normal leading-normal text-text-primary',     // 14px WCAG mínimo
  caption: 'text-sm font-normal leading-normal text-text-secondary',
  label: 'text-sm font-medium leading-normal uppercase text-text-primary',
};

// ============================================
// ESPACIADO - Sistema consistente
// ============================================

export const SPACING = {
  xs: '0.5rem',      // 8px
  sm: '0.75rem',     // 12px
  md: '1rem',        // 16px
  lg: '1.5rem',      // 24px
  xl: '2rem',        // 32px
  '2xl': '3rem',     // 48px
  '3xl': '4rem',     // 64px
};

// ============================================
// BORDES - Radios consistentes
// ============================================

export const BORDERS = {
  sm: 'rounded-sm',       // 2px
  DEFAULT: 'rounded',      // 4px
  md: 'rounded-md',        // 6px
  lg: 'rounded-lg',        // 8px
  xl: 'rounded-xl',        // 12px
  '2xl': 'rounded-2xl',    // 16px
  full: 'rounded-full',    // Circular
};

// ============================================
// UTILIDADES - Helpers CSS
// ============================================

export const UTILS = {
  // Focus visible para accesibilidad
  focusRing: 'focus:ring-4 focus:ring-primary-300 focus:outline-none',

  // Transiciones suaves
  transition: 'transition-all duration-200 ease-in-out',

  // Sombra suave
  shadowSoft: 'shadow-soft',

  // Touch target mínimo WCAG 2.5.5
  touchTarget: 'min-h-[44px] min-w-[44px]',
};
