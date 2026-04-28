import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus } from 'lucide-react';

const AgendaPage = () => {
  const [citas, setCitas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    paciente_id: '',
    servicio_id: '',
    fecha_hora: ''
  });

  useEffect(() => {
    fetchCitas();
    fetchPacientes();
    fetchServicios();
  }, [selectedDate]);

  const fetchCitas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.centro-salud.agentesia.cloud';
      const response = await fetch(`${API_URL}/api/citas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      // Filtrar citas por fecha seleccionada
      const filteredCitas = data.filter(cita =>
        cita.fecha_hora && cita.fecha_hora.startsWith(selectedDate)
      );
      setCitas(filteredCitas);
    } catch (error) {
      console.error('Error fetching citas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPacientes = async () => {
    try {
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

  const handleCreateCita = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.centro-salud.agentesia.cloud';
      const response = await fetch(`${API_URL}/api/citas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowForm(false);
        setFormData({ paciente_id: '', servicio_id: '', fecha_hora: '' });
        fetchCitas();
      } else {
        const error = await response.json();
        alert('Error al crear cita: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating cita:', error);
      alert('Error al crear cita');
    }
  };

  const handleUpdateEstado = async (citaId, nuevoEstado) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.centro-salud.agentesia.cloud';
      const response = await fetch(`${API_URL}/api/citas/${citaId}/estado`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (response.ok) {
        fetchCitas();
      } else {
        alert('Error al actualizar estado');
      }
    } catch (error) {
      console.error('Error updating cita estado:', error);
      alert('Error al actualizar estado');
    }
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      esperando_abono: { text: 'Abono Pendiente', class: 'bg-yellow-100 text-yellow-800' },
      confirmada: { text: 'Confirmada', class: 'bg-green-100 text-green-800' },
      en_sala: { text: 'En Sala', class: 'bg-blue-100 text-blue-800' },
      atendido: { text: 'Atendido', class: 'bg-gray-100 text-gray-800' },
      cancelada: { text: 'Cancelada', class: 'bg-red-100 text-red-800' }
    };
    return estados[estado] || estados.esperando_abono;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-600">Gestión de citas y turnos</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Nueva Cita</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Calendar size={20} />
            <span className="font-medium">{new Date(selectedDate).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {citas.map((cita) => (
              <div key={cita.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <Clock size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{cita.paciente_nombre}</p>
                    <p className="text-sm text-gray-600">{cita.servicio_nombre}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-500">
                    {new Date(cita.fecha_hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <select
                    value={cita.estado}
                    onChange={(e) => handleUpdateEstado(cita.id, e.target.value)}
                    className={`px-3 py-1 text-xs font-medium rounded-full border-0 cursor-pointer ${getEstadoBadge(cita.estado).class}`}
                  >
                    <option value="esperando_abono">Abono Pendiente</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="en_sala">En Sala</option>
                    <option value="atendido">Atendido</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        {citas.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            No hay citas programadas para esta fecha
          </div>
        )}
      </div>

      {/* Modal de Nueva Cita */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nueva Cita</h2>
            <form onSubmit={handleCreateCita} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paciente
                </label>
                <select
                  required
                  value={formData.paciente_id}
                  onChange={(e) => setFormData({...formData, paciente_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar paciente</option>
                  {pacientes.map(paciente => (
                    <option key={paciente.id} value={paciente.id}>{paciente.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Servicio
                </label>
                <select
                  required
                  value={formData.servicio_id}
                  onChange={(e) => setFormData({...formData, servicio_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar servicio</option>
                  {servicios.map(servicio => (
                    <option key={servicio.id} value={servicio.id}>{servicio.nombre} - ${servicio.precio_base}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha y Hora
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.fecha_hora}
                  onChange={(e) => setFormData({...formData, fecha_hora: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Agendar Cita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaPage;