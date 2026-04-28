import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Clock, CreditCard, Plus } from 'lucide-react';

const RecepcionPage = () => {
  const [pacientes, setPacientes] = useState([]);
  const [citasHoy, setCitasHoy] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPacienteForm, setShowPacienteForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [nuevoPaciente, setNuevoPaciente] = useState({
    nombre: '',
    telefono: '',
    email: '',
    fecha_nacimiento: '',
    diagnostico_principal: ''
  });

  useEffect(() => {
    fetchPacientes();
    fetchCitasHoy();
  }, []);

  const fetchPacientes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.centro-salud.agentesia.cloud';
      const response = await fetch(`${API_URL}/api/pacientes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setPacientes(data);
    } catch (error) {
      console.error('Error fetching pacientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCitasHoy = async () => {
    try {
      const token = localStorage.getItem('token');
      const today = new Date().toISOString().split('T')[0];
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.centro-salud.agentesia.cloud';

      const response = await fetch(`${API_URL}/api/citas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      // Filtrar citas de hoy
      const citasDeHoy = data.filter(cita =>
        cita.fecha_hora && cita.fecha_hora.startsWith(today)
      );
      setCitasHoy(citasDeHoy);
    } catch (error) {
      console.error('Error fetching citas hoy:', error);
    }
  };

  const handleCheckIn = async (citaId) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.centro-salud.agentesia.cloud';
      const response = await fetch(`${API_URL}/api/citas/${citaId}/estado`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: 'en_sala' })
      });

      if (response.ok) {
        fetchCitasHoy();
        alert('Check-in completado exitosamente');
      } else {
        alert('Error al realizar check-in');
      }
    } catch (error) {
      console.error('Error en check-in:', error);
      alert('Error al realizar check-in');
    }
  };

  const handleCreatePaciente = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.centro-salud.agentesia.cloud';
      const response = await fetch(`${API_URL}/api/pacientes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevoPaciente)
      });

      if (response.ok) {
        setShowPacienteForm(false);
        setNuevoPaciente({
          nombre: '',
          telefono: '',
          email: '',
          fecha_nacimiento: '',
          diagnostico_principal: ''
        });
        fetchPacientes();
        alert('Paciente registrado exitosamente');
      } else {
        const error = await response.json();
        alert('Error al crear paciente: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating paciente:', error);
      alert('Error al crear paciente');
    }
  };

  const filteredPacientes = pacientes.filter(paciente =>
    paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (paciente.telefono && paciente.telefono.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Recepción</h1>
        <p className="text-gray-600">Gestión de pacientes y check-in</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Buscar Paciente */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Buscar Paciente</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre o Teléfono
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Buscar paciente..."
              />
            </div>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <Users size={20} className="inline mr-2" />
              Buscar
            </button>
            <button
              onClick={() => setShowPacienteForm(true)}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center"
            >
              <Plus size={20} className="inline mr-2" />
              Nuevo Paciente
            </button>
          </div>
        </div>

        {/* Pacientes registrados */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Pacientes</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : filteredPacientes.length > 0 ? (
              filteredPacientes.slice(0, 5).map((paciente) => (
                <div key={paciente.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{paciente.nombre}</p>
                    <p className="text-sm text-gray-600">{paciente.telefono || 'Sin teléfono'}</p>
                    <p className="text-xs text-gray-500">Última visita: {paciente.ultima_visita ? new Date(paciente.ultima_visita).toLocaleDateString() : 'Nunca'}</p>
                  </div>
                  <button className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200">
                    <UserCheck size={16} />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                No se encontraron pacientes
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Citas del día */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Citas del Día</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {citasHoy.length > 0 ? (
              citasHoy.map((cita) => (
                <div key={cita.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Clock size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(cita.fecha_hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - {cita.paciente_nombre}
                      </p>
                      <p className="text-sm text-gray-600">{cita.servicio_nombre}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      cita.estado === 'confirmada' ? 'bg-blue-100 text-blue-800' :
                      cita.estado === 'esperando_abono' ? 'bg-yellow-100 text-yellow-800' :
                      cita.estado === 'en_sala' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {cita.estado === 'confirmada' ? 'Confirmada' :
                       cita.estado === 'esperando_abono' ? 'Abono Pendiente' :
                       cita.estado === 'en_sala' ? 'En Sala' :
                       cita.estado}
                    </span>
                    {cita.estado !== 'en_sala' && cita.estado !== 'atendido' && (
                      <button
                        onClick={() => handleCheckIn(cita.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                      >
                        <UserCheck size={16} className="mr-2" />
                        Check-in
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay citas para hoy
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Nuevo Paciente */}
      {showPacienteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nuevo Paciente</h2>
            <form onSubmit={handleCreatePaciente} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={nuevoPaciente.nombre}
                  onChange={(e) => setNuevoPaciente({...nuevoPaciente, nombre: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del paciente"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={nuevoPaciente.telefono}
                  onChange={(e) => setNuevoPaciente({...nuevoPaciente, telefono: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="3001234567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={nuevoPaciente.email}
                  onChange={(e) => setNuevoPaciente({...nuevoPaciente, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@ejemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  value={nuevoPaciente.fecha_nacimiento}
                  onChange={(e) => setNuevoPaciente({...nuevoPaciente, fecha_nacimiento: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnóstico Principal
                </label>
                <textarea
                  value={nuevoPaciente.diagnostico_principal}
                  onChange={(e) => setNuevoPaciente({...nuevoPaciente, diagnostico_principal: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Diagnóstico inicial..."
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPacienteForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Registrar Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecepcionPage;