/**
 * App - Versión Optimizada con React Query
 *
 * Mejoras implementadas:
 * - QueryProvider de React Query
 * - Error Boundary global
 * - Toast System mejorado
 * - React.memo en componentes principales
 * - Lazy loading optimizado
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

// Lazy loading de páginas (ya implementado, solo lo reorganizamos)
const DashboardAdmin = React.lazy(() => import('./pages/DashboardAdmin'));
const AgendaPage = React.lazy(() => import('./pages/AgendaPage'));
const RecepcionPage = React.lazy(() => import('./pages/RecepcionPage'));
const ClinicaPage = React.lazy(() => import('./pages/ClinicaPage'));
const CajaPage = React.lazy(() => import('./pages/CajaPage'));
const InventarioPage = React.lazy(() => import('./pages/InventarioPage'));
const PortalPaciente = React.lazy(() => import('./pages/PortalPaciente'));
const HistorialMedicoPage = React.lazy(() => import('./pages/HistorialMedicoPage'));
const TelemedicinaPage = React.lazy(() => import('./pages/TelemedicinaPage'));
const TurnosPage = React.lazy(() => import('./pages/TurnosPage'));
const PantallaEsperaPage = React.lazy(() => import('./pages/PantallaEsperaPage'));
const AlertasPage = React.lazy(() => import('./pages/AlertasPage'));
const PrediccionesPage = React.lazy(() => import('./pages/PrediccionesPage'));
const OptimizacionesPage = React.lazy(() => import('./pages/OptimizacionesPage'));
const ChatbotPage = React.lazy(() => import('./pages/ChatbotPage'));
const AnalisisPage = React.lazy(() => import('./pages/AnalisisPage'));
const ReconocimientoVozPage = React.lazy(() => import('./pages/ReconocimientoVozPage'));
const InfrastructureDashboard = React.lazy(() => import('./pages/InfrastructureDashboard'));
const IAVisionPage = React.lazy(() => import('./pages/IAVisionPage'));
const ChatbotTriajePage = React.lazy(() => import('./pages/ChatbotTriajePage'));
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const DemoInteractive = React.lazy(() => import('./pages/DemoInteractive'));

// Componente de ruta protegido optimizado
const DemoRoute = React.memo(({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/dashboard" />;
  }

  if (roles && !roles.includes(user.rol)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
});

// Componente principal optimizado
function App() {
  const { user } = useAuth();

  return (
    <ErrorBoundary>
      <AccessibilityProvider>
        <NotificationProvider>
          <ToastProvider>
            <ThemeProvider>
              <QueryProvider>
                <Router>
                  <Routes>
                    {/* Redirigir la raíz al dashboard */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />

                    <Route path="/" element={<Layout />}>
                      <Route path="/dashboard" element={
                        <DemoRoute>
                          <React.Suspense fallback={<LoadingSpinner />}>
                            <DashboardAdmin />
                          </React.Suspense>
                        </DemoRoute>
                      } />

                      <Route path="/agenda" element={
                        <DemoRoute roles={['admin', 'medico', 'recepcion']}>
                          <React.Suspense fallback={<LoadingSpinner />}>
                            <AgendaPage />
                          </React.Suspense>
                        </DemoRoute>
                      } />

                      <Route path="/recepcion" element={
                        <DemoRoute roles={['admin', 'medico', 'recepcion']}>
                          <React.Suspense fallback={<LoadingSpinner />}>
                            <RecepcionPage />
                          </React.Suspense>
                        </DemoRoute>
                      } />

                      <Route path="/clinica" element={
                        <DemoRoute roles={['admin', 'medico']}>
                          <React.Suspense fallback={<LoadingSpinner />}>
                            <ClinicaPage />
                          </React.Suspense>
                        </DemoRoute>
                      } />

                      <Route path="/caja" element={
                        <DemoRoute roles={['admin', 'recepcion', 'caja']}>
                          <React.Suspense fallback={<LoadingSpinner />}>
                            <CajaPage />
                          </React.Suspense>
                        </DemoRoute>
                      } />

                      <Route path="/inventario" element={
                        <DemoRoute roles={['admin']}>
                          <React.Suspense fallback={<LoadingSpinner />}>
                            <InventarioPage />
                          </React.Suspense>
                        </DemoRoute>
                      } />

                      <Route path="/historial-medico" element={
                        <DemoRoute roles={['admin', 'medico']}>
                          <React.Suspense fallback={<LoadingSpinner />}>
                            <HistorialMedicoPage />
                          </React.Suspense>
                        </DemoRoute>
                      } />

                      <Route path="/telemedicina" element={
                        <DemoRoute roles={['admin', 'medico']}>
                          <React.Suspense fallback={<LoadingSpinner />}>
                            <TelemedicinaPage />
                          </React.Suspense>
                        </DemoRoute>
                      } />

                      <Route path="/turnos" element={
                        <DemoRoute roles={['admin', 'recepcion']}>
                          <React.Suspense fallback={<LoadingSpinner />}>
                            <TurnosPage />
                          </React.Suspense>
                        </DemoRoute>
                      } />

                      <Route path="/alertas" element={
                        <DemoRoute roles={['admin', 'medico', 'farmacia']}>
                          <React.Suspense fallback={<LoadingSpinner />}>
                            <AlertasPage />
                          </React.Suspense>
                        </DemoRoute>
                      } />

                      <Route path="/predicciones" element={
                        <DemoRoute roles={['admin', 'recepcion']}>
                          <React.Suspense fallback={<LoadingSpinner />}>
                            <PrediccionesPage />
                          </React.Suspense>
                        </DemoRoute>
                      } />

                      <Route path="/optimizaciones" element={
                        <DemoRoute roles={['admin', 'recepcion']}>
                          <React.Suspense fallback={<LoadingSpinner />}>
                            <OptimizacionesPage />
                          </React.Suspense>
                        </DemoRoute>
                      } />

                      <Route path="/chatbot" element={
                        <DemoRoute>
                          <React.Suspense fallback={<LoadingSpinner />}>
                            <ChatbotPage />
                          </React.Suspense>
                        </DemoRoute>
                      } />

                      <Route path="/analisis" element={
                        <DemoRoute roles={['admin', 'medico']}>
                          <React.Suspense fallback={<LoadingSpinner />}>
                            <AnalisisPage />
                          </React.Suspense>
                        </DemoRoute>
                      } />

                      <Route path="/reconocimiento-voz" element={
                        <DemoRoute roles={['admin', 'medico']}>
                          <React.Suspense fallback={<LoadingSpinner />}>
                            <ReconocimientoVozPage />
                          </React.Suspense>
                        </DemoRoute>
                      } />

                      <Route path="/infraestructura" element={
                        <DemoRoute roles={['admin']}>
                          <React.Suspense fallback={<LoadingSpinner />}>
                            <InfrastructureDashboard />
                          </React.Suspense>
                        </DemoRoute>
                      } />

                      <Route path="/ia-vision" element={
                        <DemoRoute roles={['admin', 'medico', 'recepcion']}>
                          <React.Suspense fallback={<LoadingSpinner />}>
                            <IAVisionPage />
                          </React.Suspense>
                        </DemoRoute>
                      } />

                      <Route path="/chatbot-triaje" element={
                        <DemoRoute>
                          <React.Suspense fallback={<LoadingSpinner />}>
                            <ChatbotTriajePage />
                          </React.Suspense>
                        </DemoRoute>
                      } />

                      <Route path="/landing" element={
                        <React.Suspense fallback={<LoadingSpinner />}>
                          <LandingPage />
                        </React.Suspense>
                      } />

                      <Route path="/demo" element={
                        <React.Suspense fallback={<LoadingSpinner />}>
                          <DemoInteractive />
                        </React.Suspense>
                      } />
                    </Route>

                    <Route path="/pantalla-espera" element={
                      <React.Suspense fallback={<LoadingSpinner />}>
                        <PantallaEsperaPage />
                      </React.Suspense>
                    } />

                    <Route path="/mi-portal" element={
                      <DemoRoute roles={['paciente']}>
                        <Layout />
                      </DemoRoute>
                    }>
                      <Route path="citas" element={
                        <React.Suspense fallback={<LoadingSpinner />}>
                          <PortalPaciente activeTab="citas" />
                        </React.Suspense>
                      } />
                      <Route path="historial" element={
                        <React.Suspense fallback={<LoadingSpinner />}>
                          <PortalPaciente activeTab="historial" />
                        </React.Suspense>
                      } />
                      <Route path="bonos" element={
                        <React.Suspense fallback={<LoadingSpinner />}>
                          <PortalPaciente activeTab="bonos" />
                        </React.Suspense>
                      } />
                    </Route>
                  </Routes>
                </Router>
              </QueryProvider>
            </ThemeProvider>
          </ToastProvider>
        </NotificationProvider>
      </AccessibilityProvider>
    </ErrorBoundary>
  );
}

export default React.memo(App);