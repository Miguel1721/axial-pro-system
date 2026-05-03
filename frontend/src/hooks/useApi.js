import { useState, useEffect, useCallback } from 'react';

/**
 * Hook personalizado para llamadas a API con loading y error states
 * Este es un hook temporal hasta que se implemente React Query
 *
 * @param {string} url - URL de la API
 * @param {object} options - Opciones de fetch (method, headers, body, etc.)
 * @returns {object} { data, loading, error, refetch }
 *
 * @example
 * const { data: patients, loading, error, refetch } = useApi('/api/pacientes');
 * const { data: citas, loading: citasLoading, error: citasError } = useApi('/api/citas');
 */
const useApi = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Determinar si hacer fetch automático
  const { fetchOnMount = true, ...fetchOptions } = options;

  const fetchData = useCallback(async () => {
    if (!url) return;

    setLoading(true);
    setError(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.centro-salud.agentesia.cloud';
      const token = localStorage.getItem('token');

      const headers = {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
        ...fetchOptions.headers
      };

      const response = await fetch(`${API_URL}${url}`, {
        ...fetchOptions,
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonData = await response.json();
      setData(jsonData);
      return jsonData;
    } catch (err) {
      setError(err.message || 'Error al cargar datos');
      console.error(`Error fetching ${url}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, fetchOptions]);

  useEffect(() => {
    if (fetchOnMount) {
      fetchData();
    }
  }, [fetchOnMount, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};

/**
 * Hook para mutations (POST, PUT, DELETE)
 *
 * @returns {object} { mutate, data, loading, error }
 *
 * @example
 * const { mutate, loading, error } = useMutation();
 * await mutate('/api/pacientes', { method: 'POST', body: JSON.stringify(newPatient) });
 */
export const useMutation = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.centro-salud.agentesia.cloud';
      const token = localStorage.getItem('token');

      const headers = {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
        ...options.headers
      };

      const response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonData = await response.json();
      setData(jsonData);
      return jsonData;
    } catch (err) {
      setError(err.message || 'Error al realizar la operación');
      console.error(`Error in mutation ${url}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    mutate,
    data,
    loading,
    error
  };
};

export default useApi;