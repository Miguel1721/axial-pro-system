/**
 * Configuración de React Query
 *
 * Características:
 * - Caché inteligente de datos
 * - Refetch automático
 * - Reintentos automáticos
 * - Manejo de errores robusto
 * - Optimizaciones de performance
 */

import { QueryClient } from '@tanstack/react-query';

// Crear instancia de QueryClient con configuración optimizada
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tiempo de stale por defecto (5 minutos)
      staleTime: 5 * 60 * 1000,

      // Tiempo de caché por defecto (10 minutos)
      gcTime: 10 * 60 * 1000,

      // Reintentos automáticos con backoff
      retry: (failureCount, error) => {
        // No reintentar en errores 401, 403, 404
        if (error?.status === 401 || error?.status === 403 || error?.status === 404) {
          return false;
        }
        // Máximo 3 reintentos
        return failureCount < 3;
      },

      // Delay exponencial entre reintentos
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch al recuperar foco de ventana
      refetchOnWindowFocus: true,

      // Refetch al reconectar
      refetchOnReconnect: true,

      // No refetch al montar (usar caché si existe)
      refetchOnMount: false,

      // Tiempo de refetch en background
      refetchInterval: false,

      // Número mínimo de milisegundos para mostrar loading
      queryInterval: false
    },

    mutations: {
      // Reintentos para mutations
      retry: (failureCount, error) => {
        // No reintentar en errores de autenticación
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        return failureCount < 2;
      },

      // Delay entre reintentos de mutations
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
    }
  },

  // Logger en desarrollo
  logger: import.meta.env.DEV
    ? {
        log: console.log,
        warn: console.warn,
        error: console.error
      }
    : {
        log: () => {},
        warn: () => {},
        error: () => {}
      }
});

// Configuración específica por query type
export const queryConfig = {
  // Queries de lista (pacientes, citas, etc.)
  listQuery: {
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: true
  },

  // Queries de detalle (paciente individual, etc.)
  detailQuery: {
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    refetchOnWindowFocus: false
  },

  // Queries de dashboard (estadísticas, etc.)
  dashboardQuery: {
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 5 * 60 * 1000, // Refetch cada 5 minutos
    refetchOnWindowFocus: true
  },

  // Queries de usuario/perfil
  userQuery: {
    staleTime: 15 * 60 * 1000, // 15 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
    refetchOnWindowFocus: false
  },

  // Queries de configuración
  configQuery: {
    staleTime: 60 * 60 * 1000, // 1 hora
    gcTime: 24 * 60 * 60 * 1000, // 24 horas
    refetchOnWindowFocus: false
  }
};

// Función para invalidar queries relacionadas
export const invalidateRelatedQueries = (queryClient, resource) => {
  const invalidationPatterns = {
    pacientes: ['pacientes', 'paciente', 'dashboard'],
    citas: ['citas', 'cita', 'agenda', 'dashboard'],
    sesiones: ['sesiones', 'sesion', 'dashboard'],
    usuarios: ['usuarios', 'usuario', 'staff'],
    inventario: ['inventario', 'productos', 'stock'],
    finanzas: ['caja', 'ingresos', 'gastos', 'dashboard']
  };

  const patterns = invalidationPatterns[resource] || [resource];

  patterns.forEach(pattern => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey[0];
        return queryKey.includes(pattern);
      }
    });
  });
};

// Función para optimizar lista de queries
export const prefetchRelatedQueries = async (queryClient, resource) => {
  const prefetchPatterns = {
    pacientes: ['pacientes', 'dashboard'],
    citas: ['citas', 'agenda', 'dashboard'],
    sesiones: ['sesiones', 'dashboard']
  };

  const patterns = prefetchPatterns[resource] || [resource];

  for (const pattern of patterns) {
    try {
      await queryClient.prefetchQuery({
        queryKey: [pattern],
        staleTime: 2 * 60 * 1000
      });
    } catch (error) {
      console.warn(`Failed to prefetch ${pattern}:`, error);
    }
  }
};

// Función para resetear el caché (logout, etc.)
export const resetQueryCache = (queryClient) => {
  queryClient.clear();
};

// Función para obtener datos del caché
export const getCachedData = (queryClient, queryKey) => {
  return queryClient.getQueryData(queryKey);
};

// Función para setear datos en caché
export const setCachedData = (queryClient, queryKey, data) => {
  queryClient.setQueryData(queryKey, data);
};

export default queryClient;