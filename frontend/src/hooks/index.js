// Hooks Personalizados - Export Centralizado
// Este archivo centraliza todos los hooks personalizados del sistema

export { default as useDebounce } from './useDebounce';
export { default as useLocalStorage } from './useLocalStorage';
export { default as useApi, useMutation } from './useApi';

// Información sobre hooks disponibles
/**
 * useDebounce: Para debouncing de valores (búsquedas, inputs)
 * useLocalStorage: Para gestionar localStorage con sincronización
 * useApi: Para llamadas a API con loading y error states (temporal)
 * useMutation: Para mutations (POST, PUT, DELETE) (temporal)
 *
 * Nota: Los hooks useApi y useMutation son temporales hasta que se implemente React Query
 */