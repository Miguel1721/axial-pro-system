import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

const DemoRoute = ({ children, roles }) => {
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
};

const DashboardAdmin = React.lazy(() => import('./pages/DashboardAdmin'));
const AgendaPage = React.lazy(() => import('./pages/AgendaPage'));
const RecepcionPage = React.lazy(() => import('./pages/RecepcionPage'));
const ClinicaPage = React.lazy(() => import('./pages/ClinicaPage'));
const CajaPage = React.lazy(() => import('./pages/CajaPage'));
const InventarioPage = React.lazy(() => import('./pages/InventarioPage'));
const PortalPaciente = React.lazy(() => import('./pages/PortalPaciente'));

function App() {
  const { user } = useAuth();

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Redirigir la raíz al dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route
          path="/"
          element={<Layout />}
        >
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
        </Route>

        <Route
          path="/mi-portal"
          element={
            <DemoRoute roles={['paciente']}>
              <Layout />
            </DemoRoute>
          }
        >
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
    </ThemeProvider>
  );
}

export default App;