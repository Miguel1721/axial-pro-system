// Sistema de temas médicos profesionales para Axial Pro Clinic

export const medicalThemes = {
  // Tema Azul Clínico (defecto) - Serenidad, confianza, profesional
  azul_clinico: {
    id: 'azul_clinico',
    name: 'Azul Clínico',
    description: 'Tema profesional con tonos azules y blancos',
    icon: '🏥',
    colors: {
      primary: {
        50: '#2563eb',   // Azul médico profesional
        100: '#3b82f6',  // Azul más claro
        500: '#1d4ed8',  // Azul profundo
        600: '#1e40af',  // Azul muy profundo
        700: '#0f172a',  // Azul oscuro
        800: '#0a162a',  // Azul muy oscuro
        900: '#0d1117',  // Azul casi negro
        950: '#064e3b',  // Azul muy claro
        990: '#eff6ff',  // Azul casi blanco
        950: '#dbeafe'   // Blanco azulino
      },
      secondary: {
        50: '#e0e7ff',   // Azul médico suave
        100: '#60a5fa',  // Azul claro profesional
        500: '#3b82f6',  // Azul profundo
      },
      accent: {
        50: '#06b6d4',   // Azul vibrante
        100: '#0891b2',  // Azul brillante
        500: '#0ea5e9',  // Azul neón
      },
      background: {
        light: '#f8fafc',  // Blanco azulado muy claro
        main: '#ffffff',  // Blanco puro
        card: '#ffffff',  // Tarjetas blancas
        input: '#ffffff',  // Inputs blancos
        muted: '#f1f5f9',  // Gris azulado claro
      },
      text: {
        primary: '#0f172a',  // Texto principal (azul oscuro)
        secondary: '#64748b',  // Texto secundario (azul medio)
        muted: '#94a3b8',  // Texto apagado (azul claro)
        inverse: '#ffffff',  // Texto invertido (blanco)
      },
      success: {
        bg: '#d1fae5',  // Verde éxito
        text: '#065f46',
      },
      error: {
        bg: '#fee2e2',  // Rojo error
        text: '#b91c1c',
      },
      warning: {
        bg: '#fef3c7',  // Amarillo warning
        text: '#b45309',
      },
      border: {
        light: '#e0e7ff',  // Borde azul claro
        medium: '#3b82f6',  // Borde azul medio
        dark: '#1e40af',  // Borde azul oscuro
      }
    }
  },

  // Tema Verde Quirófano - Salud, procedimientos, confianza
  verde_quirofano: {
    id: 'verde_quirofano',
    name: 'Verde Quirófano',
    description: 'Tema con tonos verdes saludables, ideal para sala de procedimientos',
    icon: '🏥',
    colors: {
      primary: {
        50: '#16a34a',   // Verde médico profesional
        100: '#22c55e',  // Verde claro saludable
        500: '#16a34a',  // Verde procedimientos
        600: '#15803d',  // Verde profundo
        700: '#166534',  // Verde muy profundo
        800: '#14532d',  // Verde oscuro
        900: '#052e16',  // Verde muy oscuro
        950: '#047857',  // Verde muy claro
        990: '#dcfce7',  // Verde casi blanco
        950: '#f0fdf4'   // Blanco verdoso
      },
      secondary: {
        50: '#4ade80',   // Verde médico suave
        100: '#86efac',  // Verde claro natural
        500: '#22c55e',  // Verde procedimientos
      },
      accent: {
        50: '#10b981',   // Verde vibrante
        100: '#34d399',  // Verde brillante
        500: '#22c55e',  // Verde neón
      },
      background: {
        light: '#f0fdf4',  // Blanco verdoso muy claro
        main: '#ffffff',  // Blanco puro
        card: '#ffffff',  // Tarjetas blancas
        input: '#ffffff',  // Inputs blancos
        muted: '#ecfdf5',  // Gris verdoso claro
      },
      text: {
        primary: '#15803d',  // Texto principal (verde oscuro)
        secondary: '#166534',  // Texto secundario (verde medio)
        muted: '#6b7280',  // Texto apagado (verde claro)
        inverse: '#ffffff',  // Texto invertido (blanco)
      },
      success: {
        bg: '#d1fae5',  // Verde éxito
        text: '#065f46',
      },
      error: {
        bg: '#fee2e2',  // Rojo error
        text: '#b91c1c',
      },
      warning: {
        bg: '#fef3c7',  // Amarillo warning
        text: '#b45309',
      },
      border: {
        light: '#86efac',  // Borde verde claro
        medium: '#22c55e',  // Borde verde medio
        dark: '#15803d',  // Borde verde oscuro
      }
    }
  },

  // Tema Rojo Emergencia - Urgencia, alertas, acción
  rojo_emergencia: {
    id: 'rojo_emergencia',
    name: 'Rojo Emergencia',
    description: 'Tema de alta visibilidad para alertas médicas urgentes',
    icon: '🚨',
    colors: {
      primary: {
        50: '#dc2626',   // Rojo médico profesional
        100: '#ef4444',  // Rojo claro urgente
        500: '#dc2626',  // Rojo emergencia
        600: '#991b1b',  // Rojo profundo
        700: '#7f1d1d',  // Rojo muy profundo
        800: '#450a0a',  // Rojo oscuro
        900: '#640c04',  // Rojo muy oscuro
        950: '#f87171',  // Rojo muy claro
        990: '#fee2e2',  // Rojo casi blanco
        950: '#fef2f2',  // Blanco rosáceo
      },
      secondary: {
        50: '#f87171',  // Rojo médico suave
        100: '#fca5a5',  // Rojo claro atenuado
        500: '#dc2626',  // Rojo emergencia
      },
      accent: {
        50: '#ff4757',   // Rojo vibrante
        100: '#ff6b6b',  // Rojo brillante
        500: '#ef4444',  // Rojo neón
      },
      background: {
        light: '#fef2f2',  // Blanco rosáceo muy claro
        main: '#ffffff',  // Blanco puro
        card: '#ffffff',  // Tarjetas blancas
        input: '#ffffff',  // Inputs blancos
        muted: '#fee2e2',  // Gris rosáceo claro
      },
      text: {
        primary: '#dc2626',  // Texto principal (rojo oscuro)
        secondary: '#991b1b',  // Texto secundario (rojo medio)
        muted: '#fca5a5',  // Texto apagado (rojo claro)
        inverse: '#ffffff',  // Texto invertido (blanco)
      },
      success: {
        bg: '#d1fae5',  // Verde éxito (mismo para consistencia)
        text: '#065f46',
      },
      error: {
        bg: '#dc2626',  // Rojo error (consistente)
        text: '#fef2f2',
      },
      warning: {
        bg: '#fef3c7',  // Amarillo warning (mismo)
        text: '#b45309',
      },
      border: {
        light: '#fca5a5',  // Borde rojo claro
        medium: '#dc2626',  // Borde rojo medio
        dark: '#7f1d1d',  // Borde rojo oscuro
      }
    }
  },

  // Tema Morado Nocturno - Elegante, modo noche, estética premium
  morado_nocturno: {
    id: 'morado_nocturno',
    name: 'Morado Nocturno',
    description: 'Tema elegante para uso nocturno con tonos morados cálidos',
    icon: '🌙',
    colors: {
      primary: {
        50: '#4c1d95',   // Morado médico elegante
        100: '#6d28d9',  // Morado claro premium
        500: '#4c1d95',  // Morado nocturno
        600: '#9333ea',  // Morado profundo
        700: '#5b21b6',  // Morado muy profundo
        800: '#1f2937',  // Morado oscuro
        900: '#0f172a',  // Morado muy oscuro
        950: '#4c1d95',  // Morado muy claro
        990: '#8b4513',  // Morado casi blanco
        950: '#f3e8ff',  // Blanco morado suave
      },
      secondary: {
        50: '#7c3aed',  // Morado médico suave
        100: '#9333ea',  // Morado claro premium
        500: '#4c1d95',  // Morado nocturno
      },
      accent: {
        50: '#a78bfa',   // Morado vibrante
        100: '#c026d3',  // Morado brillante
        500: '#9333ea',  // Morado neón
      },
      background: {
        light: '#f3e8ff',  // Blanco morado muy claro
        main: '#1f2937',  // Morado oscuro elegante
        card: '#1f2937',  // Tarjetas moradas oscuras
        input: '#1f2937',  // Inputs morados
        muted: '#4c1d95',  // Gris morado claro
      },
      text: {
        primary: '#9333ea',  // Texto principal (morado oscuro)
        secondary: '#5b21b6',  // Texto secundario (morado medio)
        muted: '#7c3aed',  // Texto apagado (morado claro)
        inverse: '#ffffff',  // Texto invertido (blanco)
      },
      success: {
        bg: '#d1fae5',  // Verde éxito
        text: '#065f46',
      },
      error: {
        bg: '#dc2626',  // Rojo error
        text: '#fef2f2',
      },
      warning: {
        bg: '#fef3c7',  // Amarillo warning
        text: '#b45309',
      },
      border: {
        light: '#9333ea',  // Borde morado claro
        medium: '#4c1d95',  // Borde morado medio
        dark: '#5b21b6',  // Borde morado oscuro
      }
    }
  },

  // Tema Personalizado Personalizado (para usuarios médicos)
  personalizado: {
    id: 'personalizado',
    name: 'Personalizado',
    description: 'Temas configurables por cada médico profesional',
    icon: '🎨',
    colors: {
      primary: {
        50: '#3b82f6',  // Azul base (personalizable)
        100: '#60a5fa',
        500: '#1d4ed8',
        600: '#1e40af',
        700: '#0f172a',
        800: '#0a162a',
        900: '#0d1117',
        950: '#064e3b',
        990: '#eff6ff',
        950: '#dbeafe'
      },
      secondary: {
        50: '#64748b',
        100: '#3b82f6',
        500: '#e0e7ff'
      },
      accent: {
        50: '#06b6d4',
        100: '#0891b2',
        500: '#0ea5e9'
      },
      background: {
        light: '#f8fafc',
        main: '#ffffff',
        card: '#ffffff',
        input: '#ffffff',
        muted: '#f1f5f9'
      },
      text: {
        primary: '#0f172a',
        secondary: '#64748b',
        muted: '#94a3b8',
        inverse: '#ffffff'
      },
      success: {
        bg: '#d1fae5',
        text: '#065f46'
      },
      error: {
        bg: '#fee2e2',
        text: '#b91c1c'
      },
      warning: {
        bg: '#fef3c7',
        text: '#b45309'
      },
      border: {
        light: '#e0e7ff',
        medium: '#3b82f6',
        dark: '#1e40af'
      }
    }
  }
};

// Función para obtener tema por rol
export const getThemeByRole = (role) => {
  const themeMap = {
    admin: medicalThemes.azul_clinico,
    medico: medicalThemes.azul_clinico,
    recepcion: medicalThemes.verde_quirofano,
    caja: medicalThemes.rojo_emergencia,
    paciente: medicalThemes.morado_nocturno
  };

  return themeMap[role] || medicalThemes.azul_clinico;
};

// Función para obtener lista de temas disponibles
export const getAvailableThemes = (role) => {
  const baseThemes = [
    medicalThemes.azul_clinico,
    medicalThemes.verde_quirofano,
    medicalThemes.rojo_emergencia,
    medicalThemes.morado_nocturno
  ];

  return baseThemes;
};

// Función para generar clases CSS dinámicas según tema
export const getThemeClasses = (themeId) => {
  const theme = medicalThemes[themeId] || medicalThemes.azul_clinico;
  const colors = theme.colors;

  return {
    bg: {
      primary: `bg-[${colors.primary[500]}`
    },
    text: {
      primary: `text-[${colors.text.primary}]`
    },
    border: {
      primary: `border-[${colors.border.medium}]`
    },
    button: {
      primary: `bg-[${colors.primary[500]} hover:bg-[${colors.primary[600]} text-white`,
      secondary: `bg-[${colors.secondary[500]} text-[${colors.text.primary}]`
    },
    accent: {
      accent: `bg-[${colors.accent[500]}`
    }
  };
};