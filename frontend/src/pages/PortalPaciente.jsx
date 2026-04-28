import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, History, Gift, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PortalPaciente = ({ activeTab }) => {
  const [citas, setCitas] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [bonos, setBonos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [servicios, setServicios] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const currentTab = activeTab || location.pathname.split('/').pop() || 'citas';

  useEffect(() => {
    if (user?.id) {
      fetchPacienteData();
      fetchServicios();
    }
  }, [user, currentTab]);

  const fetchPacienteData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.centro-salud.agentesia.cloud';

      // Fetch citas del paciente
      const citasResponse = await fetch(`${API_URL}/api/citas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const citasData = await citasResponse.json();

      // Filtrar citas del paciente actual (asumiendo que el backend devuelve todas las citas)
      const pacienteCitas = citasData.filter(cita => cita.paciente_id === user.id);
      setCitas(pacienteCitas);

      // Fetch sesiones del paciente (como historial)
      const sesionesResponse = await fetch(`${API_URL}/api/sesiones`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const sesionesData = await sesionesResponse.json();

      // Filtrar sesiones del paciente actual y que estén finalizadas
      const pacienteSesiones = sesionesData.filter(sesion =>
        sesion.paciente_id === user.id && sesion.estado === 'finalizado'
      );
      setHistorial(pacienteSesiones);

      // Fetch bonos del paciente
      const bonosResponse = await fetch(`${API_URL}/api/caja/bonos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const bonosData = await bonosResponse.json();

      // Filtrar bonos del paciente actual
      const pacienteBonos = bonosData.filter(bono => bono.paciente_id === user.id);
      setBonos(pacienteBonos);

    } catch (error) {
      console.error('Error fetching paciente data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServicios = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.centro-salud.agentesia.cloud';
      const response = await fetch(`${API_URL}/api/servicios`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setServicios(data);
    } catch (error) {
      console.error('Error fetching servicios:', error);
    }
  };

  const tabs = [
    { id: 'citas', icon: Calendar, label: 'Mis Citas' },
    { id: 'historial', icon: History, label: 'Historial' },
    { id: 'bonos', icon: Gift, label: 'Mis Bonos' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleAgendarCita = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const servicioId = formData.get('servicio');
    const fecha = formData.get('fecha');
    const hora = formData.get('hora');

    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.centro-salud.agentesia.cloud';
      const response = await fetch(`${API_URL}/api/citas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paciente_id: user.id,
          servicio_id: parseInt(servicioId),
          fecha_hora: `${fecha}T${hora}:00`
        })
      });

      if (response.ok) {
        alert('Cita agendada exitosamente');
        fetchPacienteData();
        e.target.reset();
      } else {
        const error = await response.json();
        alert('Error al agendar cita: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error agendando cita:', error);
      alert('Error al agendar cita');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Portal Paciente</h1>
          <p className="text-gray-600">Gestión de tu historial clínico y citas</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigate(`/mi-portal/${tab.id}`)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                currentTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon size={20} className="inline mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de Tabs */}
      <div>
        {/* Mis Citas */}
        {currentTab === 'citas' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Próximas Citas</h2>
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : citas.filter(cita => cita.estado === 'confirmada' && new Date(cita.fecha_hora) >= new Date()).length > 0 ? (
                <div className="space-y-4">
                  {citas.filter(cita => cita.estado === 'confirmada' && new Date(cita.fecha_hora) >= new Date()).map((cita) => {
                    const fechaHora = new Date(cita.fecha_hora);
                    return (
                      <div key={cita.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{fechaHora.toLocaleDateString('es-ES')} a las {fechaHora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                            <p className="text-sm text-gray-600 mt-1">{cita.servicio_nombre}</p>
                            <div className="mt-2 flex space-x-2">
                              <button className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200">
                                Ver Detalles
                              </button>
                              <button className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200">
                                Cancelar
                              </button>
                            </div>
                          </div>
                          <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Confirmada
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No tienes próximas citas agendadas
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Agendar Nueva Cita</h2>
              <form onSubmit={handleAgendarCita} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Servicio
                  </label>
                  <select
                    name="servicio"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar servicio</option>
                    {servicios.map(servicio => (
                      <option key={servicio.id} value={servicio.id}>{servicio.nombre} - ${servicio.precio_base.toLocaleString()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha preferida
                  </label>
                  <input
                    type="date"
                    name="fecha"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora preferida
                  </label>
                  <input
                    type="time"
                    name="hora"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Agendar Cita
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Historial */}
        {currentTab === 'historial' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Historial de Consultas</h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : historial.length > 0 ? (
                <div className="space-y-4">
                  {historial.map((consulta) => {
                    const fecha = new Date(consulta.hora_inicio);
                    return (
                      <div key={consulta.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-gray-900">{fecha.toLocaleDateString('es-ES')}</p>
                            <p className="text-sm text-gray-600">{consulta.servicio_nombre}</p>
                          </div>
                          <span className="text-lg font-semibold text-gray-900">
                            ${consulta.total_final?.toLocaleString() || '0'}
                          </span>
                        </div>
                        <div className="mt-3 space-y-2 text-sm text-gray-600">
                          <p><strong>Médico:</strong> {consulta.medico_nombre}</p>
                          {consulta.nota_evolucion && (
                            <p><strong>Notas:</strong> {consulta.nota_evolucion}</p>
                          )}
                        </div>
                        <button className="mt-3 text-blue-600 hover:text-blue-800 text-sm">
                          Ver Recibo Completo
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No tienes historial de consultas
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mis Bonos */}
        {currentTab === 'bonos' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Mis Bonos Activos</h2>
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : bonos.filter(bono => bono.activo).length > 0 ? (
                <div className="space-y-4">
                  {bonos.filter(bono => bono.activo).map((bono) => {
                    const restantes = bono.sesiones_totales - bono.sesiones_usadas;
                    const progreso = (bono.sesiones_usadas / bono.sesiones_totales) * 100;
                    return (
                      <div key={bono.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-medium text-gray-900">{bono.nombre_paquete}</p>
                            <p className="text-sm text-gray-600">Contratado el {new Date(bono.created_at).toLocaleDateString('es-ES')}</p>
                          </div>
                          <span className="text-lg font-semibold text-blue-600">
                            {restantes} restantes
                          </span>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progreso</span>
                            <span>{bono.sesiones_usadas} de {bono.sesiones_totales} usadas</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${progreso}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No tienes bonos activos
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Comprar Nuevo Bono</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 hover:border-blue-500 cursor-pointer">
                  <h3 className="font-medium text-gray-900">3 Sesiones</h3>
                  <p className="text-sm text-gray-600 mt-1">$540,000</p>
                  <p className="text-xs text-gray-500 mt-2">180,000 por sesión</p>
                </div>
                <div className="border rounded-lg p-4 hover:border-blue-500 cursor-pointer">
                  <h3 className="font-medium text-gray-900">5 Sesiones</h3>
                  <p className="text-sm text-gray-600 mt-1">$900,000</p>
                  <p className="text-xs text-gray-500 mt-2">180,000 por sesión</p>
                </div>
                <div className="border rounded-lg p-4 hover:border-blue-500 cursor-pointer">
                  <h3 className="font-medium text-gray-900">10 Sesiones</h3>
                  <p className="text-sm text-gray-600 mt-1">$1,800,000</p>
                  <p className="text-xs text-gray-500 mt-2">180,000 por sesión</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortalPaciente;