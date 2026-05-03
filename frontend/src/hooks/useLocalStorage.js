import { useState, useEffect, useCallback } from 'react';

/**
 * Hook personalizado para gestionar localStorage con sincronización
 *
 * @param {string} key - Clave para localStorage
 * @param {any} initialValue - Valor inicial si no existe en localStorage
 * @returns {[any, Function, Function]} [valor, setValor, removeValor]
 *
 * @example
 * const [user, setUser, removeUser] = useLocalStorage('user', { name: 'Demo' });
 * setUser({ name: 'Nuevo Usuario' });
 * removeUser();
 */
const useLocalStorage = (key, initialValue) => {
  // Función para obtener valor inicial de localStorage
  const readValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState(readValue);

  // Función para actualizar valor en localStorage y estado
  const setValue = useCallback((value) => {
    try {
      // Permitir que value sea una función (similar a useState)
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      setStoredValue(valueToStore);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        // Disparar evento para que otros componentes con la misma clave se actualicen
        window.dispatchEvent(new Event('local-storage'));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Función para eliminar valor del localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        window.dispatchEvent(new Event('local-storage'));
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Escuchar cambios en localStorage de otras pestañas/componentes
  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };

    window.addEventListener('local-storage', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('local-storage', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [readValue]);

  return [storedValue, setValue, removeValue];
};

export default useLocalStorage;