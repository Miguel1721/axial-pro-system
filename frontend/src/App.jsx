/**
 * App - VERSIÓN CORREGIDA v2
 *
 * CORRECCIONES:
 * 1. AuthProvider debe vivir en main.jsx (encima de App) — ver nota al final
 * 2. DemoRoute redirige a /landing cuando no hay sesión (evita bucle infinito)
 * 3. Suspense centralizado — eliminados los <React.Suspense> por ruta
 * 4. URL corregida: /reconocimiento-voz (sin tilde)
 * 5. Eliminado `user` sin usar en App
 */

import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { QueryProvider } from './components/QueryProvider';
import { ToastProvider } from './components/ToastSystem';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy loading de páginas
const DashboardAdmin        = React.lazy(() => import('./pages/DashboardAdmin'));
const AgendaPage            = React.lazy(() => import('./pages/AgendaPage'));
const RecepcionPage         = React.lazy(() => import('./pages/RecepcionPage'));
const ClinicaPage           = React.lazy(() => import('./pages/ClinicaPage'));
const CajaPage              = React.lazy(() => import('./pages/CajaPage'));
const InventarioPage        = React.lazy(() => import('./pages/InventarioPage'));
const PortalPaciente        = React.lazy(() => import('./pages/PortalPaciente'));
const HistorialMedicoPage   = React.lazy(() => import('./pages/HistorialMedicoPage'));
const TelemedicinaPage      = React.lazy(() => import('./pages/TelemedicinaPage'));
const TurnosPage            = React.lazy(() => import('./pages/TurnosPage'));
const PantallaEsperaPage    = React.lazy(() => import('./pages/PantallaEsperaPage'));
const AlertasPage           = React.lazy(() => import('./pages/AlertasPage'));
const PrediccionesPage      = React.lazy(() => import('./pages/PrediccionesPage'));
const OptimizacionesPage    = React.lazy(() => import('./pages/OptimizacionesPage'));
const ChatbotPage           = React.lazy(() => import('./pages/ChatbotPage'));
const AnalisisPage          = React.lazy(() => import('./pages/AnalisisPage'));
const ReconocimientoVozPage = React.lazy(() => import('./pages/ReconocimientoVozPage'));
const InfrastructureDashboard = React.lazy(() => import('./pages/InfrastructureDashboard'));
const IAVisionPage          = React.lazy(() => import('./pages/IAVisionPage'));
const ChatbotTriajePage     = React.lazy(() => import('./pages/ChatbotTriajePage'));
const LandingPage           = React.lazy(() => import('./pages/LandingPage'));
const DemoInteractive       = React.lazy(() => import('./pages/DemoInteractive'));

// FIX 2: Ruta protegida — redirige a /landing (no a /dashboard) para evitar bucle infinito
const DemoRoute = React.memo(({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/landing" replace />;
  }

  if (roles && !roles.includes(user.rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
});

DemoRoute.displayName = 'DemoRoute';

// FIX 5: Eliminado `const { user } = useAuth()` — no se usaba en App
function App() {
  return (
    // CRÍTICO: ThemeProvider primero para que ErrorBoundary pueda leer isDark
    <ThemeProvider>
      <ErrorBoundary>
        <AccessibilityProvider>
          <NotificationProvider>
            <ToastProvider>
              <QueryProvider>
                <Router>
                  {/* FIX 3: Un solo Suspense centralizado cubre todas las rutas lazy */}
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      {/* Ruta raíz → landing para usuarios sin sesión */}
                      <Route path="/" element={<Navigate to="/landing" replace />} />

                      <Route path="/" element={<Layout />}>

                        <Route path="/dashboard" element={
                          <DemoRoute>
                            <DashboardAdmin />
                          </DemoRoute>
                        } />

                        <Route path="/agenda" element={
                          <DemoRoute roles={['admin', 'medico', 'recepcion']}>
                            <AgendaPage />
                          </DemoRoute>
                        } />

                        <Route path="/recepcion" element={
                          <DemoRoute roles={['admin', 'medico', 'recepcion']}>
                            <RecepcionPage />
                          </DemoRoute>
                        } />

                        <Route path="/clinica" element={
                          <DemoRoute roles={['admin', 'medico']}>
                            <ClinicaPage />
                          </DemoRoute>
                        } />

                        <Route path="/caja" element={
                          <DemoRoute roles={['admin', 'caja']}>
                            <CajaPage />
                          </DemoRoute>
                        } />

                        <Route path="/inventario" element={
                          <DemoRoute roles={['admin']}>
                            <InventarioPage />
                          </DemoRoute>
                        } />

                        <Route path="/historial-medico" element={
                          <DemoRoute roles={['admin', 'medico']}>
                            <HistorialMedicoPage />
                          </DemoRoute>
                        } />

                        <Route path="/telemedicina" element={
                          <DemoRoute roles={['admin', 'medico']}>
                            <TelemedicinaPage />
                          </DemoRoute>
                        } />

                        <Route path="/turnos" element={
                          <DemoRoute roles={['admin', 'medico', 'recepcion', 'paciente']}>
                            <TurnosPage />
                          </DemoRoute>
                        } />

                        <Route path="/pantalla-espera" element={
                          <DemoRoute roles={['paciente']}>
                            <PantallaEsperaPage />
                          </DemoRoute>
                        } />

                        <Route path="/alertas" element={
                          <DemoRoute roles={['admin', 'farmacia']}>
                            <AlertasPage />
                          </DemoRoute>
                        } />

                        <Route path="/predicciones" element={
                          <DemoRoute roles={['admin']}>
                            <PrediccionesPage />
                          </DemoRoute>
                        } />

                        <Route path="/optimizaciones" element={
                          <DemoRoute roles={['admin']}>
                            <OptimizacionesPage />
                          </DemoRoute>
                        } />

                        <Route path="/chatbot" element={
                          <DemoRoute>
                            <ChatbotPage />
                          </DemoRoute>
                        } />

                        <Route path="/analisis" element={
                          <DemoRoute roles={['admin']}>
                            <AnalisisPage />
                          </DemoRoute>
                        } />

                        {/* FIX 4: URL sin tilde — /reconocimiento-voz */}
                        <Route path="/reconocimiento-voz" element={
                          <DemoRoute roles={['admin']}>
                            <ReconocimientoVozPage />
                          </DemoRoute>
                        } />

                        <Route path="/infraestructura" element={
                          <DemoRoute roles={['admin']}>
                            <InfrastructureDashboard />
                          </DemoRoute>
                        } />

                        <Route path="/ia-vision" element={
                          <DemoRoute roles={['admin']}>
                            <IAVisionPage />
                          </DemoRoute>
                        } />

                        <Route path="/chatbot-triaje" element={
                          <DemoRoute>
                            <ChatbotTriajePage />
                          </DemoRoute>
                        } />

                        {/* Rutas públicas — sin DemoRoute */}
                        <Route path="/demo"           element={<DemoInteractive />} />
                        <Route path="/portal-paciente" element={
                          <DemoRoute roles={['paciente']}>
                            <PortalPaciente />
                          </DemoRoute>
                        } />
                        <Route path="/landing" element={<LandingPage />} />

                      </Route>

                      {/* 404 fallback */}
                      <Route path="*" element={<Navigate to="/landing" replace />} />

                    </Routes>
                  </Suspense>
                </Router>
              </QueryProvider>
            </ToastProvider>
          </NotificationProvider>
        </AccessibilityProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;

/*
 * ─────────────────────────────────────────────────────────────
 * FIX 1 — AuthProvider debe ir en main.jsx, NO dentro de App.
 *
 * App llama useAuth() dentro de DemoRoute, pero si AuthProvider
 * vive dentro de App, los renders iniciales ocurren ANTES de que
 * el provider esté montado → crash en runtime.
 *
 * main.jsx correcto:
 *
 * import { AuthProvider } from './context/AuthContext';
 * import App from './App';
 *
 * ReactDOM.createRoot(document.getElementById('root')).render(
 *   <React.StrictMode>
 *     <AuthProvider>
 *       <App />
 *     </AuthProvider>
 *   </React.StrictMode>
 * );
 * ─────────────────────────────────────────────────────────────
 */