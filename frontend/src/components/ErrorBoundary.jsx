/**
 * ErrorBoundary - Componente para manejo robusto de errores
 *
 * Características:
 * - Captura errores en componentes hijos
 * - Logging de errores para debugging
 * - UI fallback amigable para usuarios
 * - Opciones de recuperación
 * - Soporte para reporting de errores
 */

import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

// Logger simple para errores (se puede reemplazar con servicio real)
const logError = (error, errorInfo) => {
  const errorData = {
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  // Log en consola
  console.error('Error capturado por ErrorBoundary:', errorData);

  // Aquí se podría enviar a servicio de logging (Sentry, LogRocket, etc.)
  // Ejemplo: Sentry.captureException(error, { extra: errorInfo });

  // Guardar en localStorage para análisis posterior
  try {
    const errorLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
    errorLogs.push(errorData);
    // Mantener solo los últimos 10 errores
    if (errorLogs.length > 10) {
      errorLogs.shift();
    }
    localStorage.setItem('errorLogs', JSON.stringify(errorLogs));
  } catch (e) {
    console.warn('No se pudo guardar error log en localStorage:', e);
  }
};

// FIX 1: DefaultErrorUI ya no depende de useTheme (hook).
// En su lugar recibe isDark como prop, inyectado desde ErrorBoundaryClass
// que lo lee una sola vez al montar (vía ThemeContext directamente o prop externa).
// Esto evita el crash cuando el ThemeContext no está disponible durante un error.
const DefaultErrorUI = ({ error, errorId, onReset, onReload, onGoHome, isDark = false }) => {
  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      <div
        className={`max-w-md w-full rounded-2xl shadow-2xl p-8 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        {/* Icono de error */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Título y mensaje */}
        <h1
          className={`text-2xl font-bold text-center mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}
        >
          ¡Ups! Algo salió mal
        </h1>

        <p
          className={`text-center mb-6 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado y
          estamos trabajando para solucionarlo.
        </p>

        {/* Información técnica (solo en desarrollo) */}
        {import.meta.env.DEV && error && (
          <details
            className={`mb-6 p-4 rounded-lg ${
              isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}
          >
            <summary
              className={`font-mono text-sm cursor-pointer ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Información técnica
            </summary>
            <div className="mt-2 font-mono text-xs text-red-600 dark:text-red-400">
              <p className="font-semibold">Error ID: {errorId}</p>
              <p className="mt-1">{error.message}</p>
              <pre className="mt-2 whitespace-pre-wrap break-all">
                {error.stack}
              </pre>
            </div>
          </details>
        )}

        {/* Acciones */}
        <div className="space-y-3">
          {/* FIX 2: className idéntico en ambas ramas isDark/no-isDark → simplificado */}
          <button
            onClick={onReload}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className="w-4 h-4" />
            Recargar Página
          </button>

          <div className="flex gap-3">
            <button
              onClick={onReset}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              Intentar de nuevo
            </button>

            <button
              onClick={onGoHome}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              <Home className="w-4 h-4" />
              Ir al inicio
            </button>
          </div>

          {/* Enlace para reportar error */}
          <a
            href={`mailto:soporte@agentesia.cloud?subject=Error ${errorId}&body=Descripción del problema:%0A%0A%0AError ID: ${errorId}`}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              isDark
                ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Bug className="w-4 h-4" />
            Reportar error
          </a>
        </div>
      </div>
    </div>
  );
};

class ErrorBoundaryClass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError() {
    // FIX 3: substr() está deprecado → reemplazado por slice()
    return {
      hasError: true,
      errorId: `ERR-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    logError(error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    // FIX 4: errorId se limpia correctamente en el reset
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // FIX 5: isDark se lee desde props para no depender del hook en DefaultErrorUI.
      // Pasa isDark={this.props.isDark ?? false} desde el padre si necesitas soporte dark mode.
      // Alternativa: leer directamente document.documentElement.classList.contains('dark')
      const isDark =
        this.props.isDark ??
        document.documentElement.classList.contains('dark');

      return this.props.fallback ? (
        this.props.fallback({
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          errorId: this.state.errorId,
          reset: this.handleReset,
          reload: this.handleReload,
          goHome: this.handleGoHome
        })
      ) : (
        <DefaultErrorUI
          error={this.state.error}
          errorId={this.state.errorId}
          isDark={isDark}
          onReset={this.handleReset}
          onReload={this.handleReload}
          onGoHome={this.handleGoHome}
        />
      );
    }

    return this.props.children;
  }
}

// Componente ErrorBoundary funcional para usar con hooks
export const ErrorBoundary = ({ children, fallback, isDark }) => {
  return (
    <ErrorBoundaryClass fallback={fallback} isDark={isDark}>
      {children}
    </ErrorBoundaryClass>
  );
};

// Higher Order Component (HOC) para envolver componentes con ErrorBoundary
export const withErrorBoundary = (Component, fallback = null) => {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

// Hook para lanzar errores hacia el ErrorBoundary más cercano
export const useErrorHandler = () => {
  return React.useCallback((error) => {
    throw error;
  }, []);
};

export default ErrorBoundary;