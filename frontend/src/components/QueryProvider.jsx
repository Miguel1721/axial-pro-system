/**
 * QueryProvider - Provider de React Query
 *
 * Características:
 * - Configuración centralizada de React Query
 * - DevTools en desarrollo
 * - Manejo de errores global
 * - Persistencia de caché
 */

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import queryClient from '../lib/queryClient';

export const QueryProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}

      {/* React Query DevTools - Solo en desarrollo */}
      {import.meta.env.DEV && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom-right"
          buttonProps={{
            style: {
              background: '#3b82f6',
              padding: '8px',
              borderRadius: '8px'
            }
          }}
        />
      )}
    </QueryClientProvider>
  );
};

export default QueryProvider;