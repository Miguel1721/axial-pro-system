import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import LoadingSpinner from './components/LoadingSpinner';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" />;
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
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute roles={['admin', 'medico', 'recepcion', 'caja']}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <React.Suspense fallback={<LoadingSpinner />}>
                <DashboardAdmin />
              </React.Suspense>
            </ProtectedRoute>
          } />

          <Route path="/agenda" element={
            <ProtectedRoute roles={['admin', 'medico', 'recepcion']}>
              <React.Suspense fallback={<LoadingSpinner />}>
                <AgendaPage />
              </React.Suspense>
            </ProtectedRoute>
          } />

          <Route path="/recepcion" element={
            <ProtectedRoute roles={['admin', 'medico', 'recepcion']}>
              <React.Suspense fallback={<LoadingSpinner />}>
                <RecepcionPage />
              </React.Suspense>
            </ProtectedRoute>
          } />

          <Route path="/clinica" element={
            <ProtectedRoute roles={['admin', 'medico']}>
              <React.Suspense fallback={<LoadingSpinner />}>
                <ClinicaPage />
              </React.Suspense>
            </ProtectedRoute>
          } />

          <Route path="/caja" element={
            <ProtectedRoute roles={['admin', 'recepcion', 'caja']}>
              <React.Suspense fallback={<LoadingSpinner />}>
                <CajaPage />
              </React.Suspense>
            </ProtectedRoute>
          } />

          <Route path="/inventario" element={
            <ProtectedRoute roles={['admin']}>
              <React.Suspense fallback={<LoadingSpinner />}>
                <InventarioPage />
              </React.Suspense>
            </ProtectedRoute>
          } />
        </Route>

        <Route
          path="/mi-portal"
          element={
            <ProtectedRoute roles={['paciente']}>
              <React.Suspense fallback={<LoadingSpinner />}>
                <PortalPaciente />
              </React.Suspense>
            </ProtectedRoute>
          }
        >
          <Route path="citas" element={<PortalPaciente activeTab="citas" />} />
          <Route path="historial" element={<PortalPaciente activeTab="historial" />} />
          <Route path="bonos" element={<PortalPaciente activeTab="bonos" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;