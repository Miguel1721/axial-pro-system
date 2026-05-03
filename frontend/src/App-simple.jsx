/**
 * App - VERSIÓN SIMPLIFICADA
 *
 * Versión limpia sin optimizaciones complejas que causan problemas
 */
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

// Importaciones directas SIN lazy loading
import DashboardAdmin from './pages/DashboardAdmin';
import AgendaPage from './pages/AgendaPage';
import RecepcionPage from './pages/RecepcionPage';
import ClinicaPage from './pages/ClinicaPage';
import CajaPage from './pages/CajaPage';
import InventarioPage from './pages/InventarioPage';
import PortalPaciente from './pages/PortalPaciente';
import HistorialMedicoPage from './pages/HistorialMedicoPage';
import TelemedicinaPage from './pages/TelemedicinaPage';
import TurnosPage from './pages/TurnosPage';
import PantallaEsperaPage from './pages/PantallaEsperaPage';
import AlertasPage from './pages/AlertasPage';
import ChatbotPage from './pages/ChatbotPage';

// Componente de ruta protegida
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

// App principal simplificado
function App() {
  const { user } = useAuth();

  return (
    <ThemeProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

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

              <Route path="/chatbot" element={
                <DemoRoute>
                  <ChatbotPage />
                </DemoRoute>
              } />

              <Route path="/portal-paciente" element={
                <DemoRoute roles={['paciente']}>
                  <PortalPaciente />
                </DemoRoute>
              } />
            </Route>
          </Routes>
        </Router>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;