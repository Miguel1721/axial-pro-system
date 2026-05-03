import { useState, useEffect } from 'react';

/**
 * Hook personalizado para debouncing de valores
 * Útil para búsquedas, inputs, y cualquier valor que cambie frecuentemente
 *
 * @param {any} value - Valor a hacer debouncing
 * @param {number} delay - Tiempo de espera en ms (default: 500ms)
 * @returns {any} Valor debounced
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 500);
 *
 * useEffect(() => {
 *   // Hacer búsqueda con debouncedSearch
 * }, [debouncedSearch]);
 */
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Crear timer para actualizar el valor debounced
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar timer si el valor cambia antes del tiempo especificado
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;