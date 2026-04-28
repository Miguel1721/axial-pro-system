import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const [highContrast, setHighContrast] = useState(() => {
    const saved = localStorage.getItem('highContrast');
    return saved === 'true';
  });

  const [textSize, setTextSize] = useState(() => {
    const saved = localStorage.getItem('textSize');
    return parseInt(saved) || 100; // 100% por defecto
  });

  const [reduceMotion, setReduceMotion] = useState(() => {
    const saved = localStorage.getItem('reduceMotion');
    return saved === 'true';
  });

  // Aplicar clases de accesibilidad al documento
  useEffect(() => {
    const root = document.documentElement;

    // Alto contraste
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Tamaño de texto
    root.style.fontSize = `${textSize}%`;

    // Reducir movimiento
    if (reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Guardar preferencias
    localStorage.setItem('highContrast', highContrast);
    localStorage.setItem('textSize', textSize);
    localStorage.setItem('reduceMotion', reduceMotion);

    return () => {
      root.classList.remove('high-contrast', 'reduce-motion');
      root.style.fontSize = '';
    };
  }, [highContrast, textSize, reduceMotion]);

  const toggleHighContrast = () => {
    setHighContrast(prev => !prev);
  };

  const increaseTextSize = () => {
    setTextSize(prev => Math.min(prev + 10, 150)); // Máximo 150%
  };

  const decreaseTextSize = () => {
    setTextSize(prev => Math.max(prev - 10, 80)); // Mínimo 80%
  };

  const resetTextSize = () => {
    setTextSize(100);
  };

  const toggleReduceMotion = () => {
    setReduceMotion(prev => !prev);
  };

  return (
    <AccessibilityContext.Provider value={{
      highContrast,
      toggleHighContrast,
      textSize,
      increaseTextSize,
      decreaseTextSize,
      resetTextSize,
      reduceMotion,
      toggleReduceMotion
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};