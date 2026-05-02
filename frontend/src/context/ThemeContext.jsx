import React, { createContext, useContext, useState, useEffect } from 'react';
import { medicalThemes, getThemeByRole, getThemeClasses } from '../themes/medicalThemes';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Obtener rol del usuario
  const userRole = localStorage.getItem('userRole') || 'admin';

  const [theme, setTheme] = useState(() => {
    // Primero check preferencia por rol, luego preferencia general
    const roleBasedTheme = localStorage.getItem(`theme_${userRole}`);
    if (roleBasedTheme) {
      return roleBasedTheme;
    }

    // Si no hay preferencia por rol, usar la general
    const generalTheme = localStorage.getItem('theme');
    if (generalTheme) {
      return generalTheme;
    }

    // Si no hay ninguna preferencia, usar el tema del rol
    return getThemeByRole(userRole);
  });

  const [isDark, setIsDark] = useState(() => {
    // Verificar si el tema actual es oscuro
    const currentThemeId = localStorage.getItem('theme') || localStorage.getItem(`theme_${userRole}`) || getThemeByRole(userRole);
    const currentTheme = medicalThemes[currentThemeId] || medicalThemes.azul_clinico;
    return currentTheme?.colors?.background?.main === medicalThemes.morado_nocturno.colors.background.main;
  });

  // Aplicar tema con sistema médico
  useEffect(() => {
    const currentThemeId = theme || localStorage.getItem('theme') || localStorage.getItem(`theme_${userRole}`);
    const themeObj = medicalThemes[currentThemeId] || medicalThemes.azul_clinico;

    // Aplicar tema médico al documento
    document.documentElement.className = currentThemeId;

    // Si es tema oscuro (moro_nocturno), agregar clase dark para compatibilidad
    if (isDark || currentThemeId === 'moro_nocturno') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Aplicar variables CSS personalizadas del tema
    const root = document.documentElement;
    const colors = themeObj?.colors || medicalThemes.azul_clinico.colors;

    // Variables CSS principales
    root.style.setProperty('--color-primary', colors.primary[500]);
    root.style.setProperty('--color-primary-hover', colors.primary[600]);
    root.style.setProperty('--color-secondary', colors.secondary[500]);
    root.style.setProperty('--color-secondary-hover', colors.secondary[600]);
    root.style.setProperty('--color-accent', colors.accent[500]);
    root.style.setProperty('--color-accent-hover', colors.accent[600]);

    // Variables de fondo
    root.style.setProperty('--bg-primary', colors.background.light);
    root.style.setProperty('--bg-secondary', colors.background.main);
    root.style.setProperty('--bg-accent', colors.background.card);

    // Variables de texto
    root.style.setProperty('--text-primary', colors.text.primary);
    root.style.setProperty('--text-secondary', colors.text.secondary);
    root.style.setProperty('--text-muted', colors.text.muted);
    root.style.setProperty('--text-inverse', colors.text.inverse);

    // Variables de borde
    root.style.setProperty('--border-primary', colors.border.light);
    root.style.setProperty('--border-secondary', colors.border.medium);
    root.style.setProperty('--border-dark', colors.border.dark);

    // Variables de estado
    root.style.setProperty('--success-bg', colors.success.bg);
    root.style.setProperty('--success-text', colors.success.text);
    root.style.setProperty('--error-bg', colors.error.bg);
    root.style.setProperty('--error-text', colors.error.text);
    root.style.setProperty('--warning-bg', colors.warning.bg);
    root.style.setProperty('--warning-text', colors.warning.text);

    // Guardar preferencia
    localStorage.setItem('theme', theme);

  }, [theme, isDark, userRole]);

  const toggleTheme = () => {
    // Rotar entre tema claro y oscuro (usando temas médicos)
    const newTheme = isDark ? 'azul_clinico' : 'moro_nocturno';
    setTheme(newTheme);

    // Limpiar preferencia por rol para usar preferencia general
    localStorage.removeItem(`theme_${userRole}`);
  };

  const setThemeById = (themeId) => {
    setTheme(themeId);
  };

  // Obtener el objeto de tema actual
  const getCurrentTheme = () => {
    const currentThemeId = theme || localStorage.getItem('theme');
    return medicalThemes[currentThemeId] || medicalThemes.azul_clinico;
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      isDark,
      toggleTheme,
      setThemeById,
      getCurrentTheme,
      medicalThemes
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};