/**
 * Cliente de API optimizado para React Query
 *
 * Características:
 * - Interceptores para auth
 * - Manejo centralizado de errores
 * - Transformación de respuestas
 * - Retry automático
 * - Logging
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Configuración base de API
const API_URL = import.meta.env.VITE_API_URL || 'https://api.centro-salud.agentesia.cloud';

// Obtener token de autenticación
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Cliente de fetch optimizado
export const apiClient = async (endpoint, options = {}) => {
  const token = getAuthToken();

  const config = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);

    // Manejar errores HTTP
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        status: response.status,
        message: errorData.message || response.statusText,
        details: errorData
      };
    }

    return await response.json();
  } catch (error) {
    // Logging de errores
    console.error(`API Error [${config.method}] ${endpoint}:`, error);
    throw error;
  }
};

// Métodos de conveniencia
export const api = {
  get: (endpoint, options) => apiClient(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, data, options) => apiClient(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data)
  }),
  put: (endpoint, data, options) => apiClient(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  patch: (endpoint, data, options) => apiClient(endpoint, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  delete: (endpoint, options) => apiClient(endpoint, { ...options, method: 'DELETE' })
};

// Claves de query para React Query
export const queryKeys = {
  // Queries generales
  all: () => ['api'],
  dashboard: () => ['dashboard'],
  users: () => ['users'],
  user: (id) => ['users', id],

  // Queries médicas
  pacientes: () => ['pacientes'],
  paciente: (id) => ['pacientes', id],
  citas: () => ['citas'],
  cita: (id) => ['citas', id],
  sesiones: () => ['sesiones'],
  sesion: (id) => ['sesiones', id],

  // Queries administrativas
  inventario: () => ['inventario'],
  caja: () => ['caja'],
  staff: () => ['staff'],

  // Queries combinadas
  pacienteConCitas: (id) => ['pacientes', id, 'citas'],
  dashboardStats: () => ['dashboard', 'stats']
};

// Hooks personalizados para queries comunes

// Hook para obtener lista de pacientes
export const usePacientes = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.pacientes(),
    queryFn: () => api.get('/api/pacientes'),
    ...options
  });
};

// Hook para obtener un paciente específico
export const usePaciente = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.paciente(id),
    queryFn: () => api.get(`/api/pacientes/${id}`),
    enabled: !!id,
    ...options
  });
};

// Hook para obtener lista de citas
export const useCitas = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.citas(),
    queryFn: () => api.get('/api/citas'),
    ...options
  });
};

// Hook para obtener una cita específica
export const useCita = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.cita(id),
    queryFn: () => api.get(`/api/citas/${id}`),
    enabled: !!id,
    ...options
  });
};

// Hook para obtener sesiones
export const useSesiones = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.sesiones(),
    queryFn: () => api.get('/api/sesiones'),
    ...options
  });
};

// Hook para obtener datos del dashboard
export const useDashboardData = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.dashboardStats(),
    queryFn: () => api.get('/api/dashboard/stats'),
    staleTime: 1 * 60 * 1000, // 1 minuto
    refetchInterval: 5 * 60 * 1000, // Refetch cada 5 minutos
    ...options
  });
};

// Hooks para mutations

// Hook para crear paciente
export const useCrearPaciente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paciente) => api.post('/api/pacientes', paciente),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: queryKeys.pacientes() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
    }
  });
};

// Hook para actualizar paciente
export const useActualizarPaciente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.put(`/api/pacientes/${id}`, data),
    onSuccess: (data, variables) => {
      // Actualizar caché del paciente específico
      queryClient.setQueryData(queryKeys.paciente(variables.id), data);
      // Invalidar lista de pacientes
      queryClient.invalidateQueries({ queryKey: queryKeys.pacientes() });
    }
  });
};

// Hook para eliminar paciente
export const useEliminarPaciente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/api/pacientes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pacientes() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
    }
  });
};

// Hook para crear cita
export const useCrearCita = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cita) => api.post('/api/citas', cita),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.citas() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
    }
  });
};

// Hook para actualizar cita
export const useActualizarCita = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.put(`/api/citas/${id}`, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.cita(variables.id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.citas() });
    }
  });
};

// Hook genérico para cualquier query
export const useApiQuery = (key, endpoint, options = {}) => {
  return useQuery({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: () => api.get(endpoint),
    ...options
  });
};

// Hook genérico para cualquier mutation
export const useApiMutation = (endpoint, method = 'POST', options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => {
      return api[method.toLowerCase()](endpoint, data);
    },
    onSuccess: () => {
      // Invalidar todas las queries por defecto
      queryClient.invalidateQueries();
    },
    ...options
  });
};

export default api;