import React, { useState, useEffect } from 'react';
import { Stethoscope, Users, Clock, CheckCircle } from 'lucide-react';

const ClinicaPage = () => {
  const [sesiones, setSesiones] = useState([]);
  const [cabinas, setCabinas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notasEvolucion, setNotasEvolucion] = useState({});
  const [parametros, setParametros] = useState({});

  useEffect(() => {
    fetchSesiones();
    fetchCabinas();
    const interval = setInterval(fetchSesiones, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const fetchSesiones = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.centro-salud.agentesia.cloud';
      const response = await fetch(`${API_URL}/api/sesiones`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      // Filtrar solo sesiones en proceso
      setSesiones(data.filter(s => s.estado === 'en_proceso'));
    } catch (error) {
      console.error('Error fetching sesiones:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCabinas = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.centro-salud.agentesia.cloud';
      const response = await fetch(`${API_URL}/api/cabinas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setCabinas(data);
    } catch (error) {
      console.error('Error fetching cabinas:', error);
    }
  };

  const handleFinalizarSesion = async (sesionId) => {
    const notas = notasEvolucion[sesionId] || '';
    const params = parametros[sesionId] || {};

    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.centro-salud.agentesia.cloud';
      const response = await fetch(`${API_URL}/api/sesiones/${sesionId}/finalizar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nota_evolucion: notas,
          param_traccion_kg: params.traccion_kg,
          param_traccion_angulo: params.angulo,
          consentimiento_firmado: true
        })
      });

      if (response.ok) {
        fetchSesiones();
        fetchCabinas();
        // Limpiar el formulario
        setNotasEvolucion(prev => ({ ...prev, [sesionId]: '' }));
        setParametros(prev => ({ ...prev, [sesionId]: {} }));
        alert('Sesión finalizada exitosamente');
      } else {
        alert('Error al finalizar sesión');
      }
    } catch (error) {
      console.error('Error finalizando sesión:', error);
      alert('Error al finalizar sesión');
    }
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      en_proceso: { text: 'En Proceso', class: 'bg-blue-100 text-blue-800' },
      finalizado: { text: 'Finalizado', class: 'bg-green-100 text-green-800' },
      pagado: { text: 'Pagado', class: 'bg-yellow-100 text-yellow-800' }
    };
    return estados[estado] || estados.en_proceso;
  };

  const getEstadoCabinaBadge = (estado) => {
    const estados = {
      disponible: { text: 'Disponible', class: 'bg-green-100 text-green-800' },
      ocupada: { text: 'Ocupada', class: 'bg-red-100 text-red-800' },
      limpieza: { text: 'Limpieza', class: 'bg-yellow-100 text-yellow-800' }
    };
    return estados[estado] || estados.disponible;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clínica</h1>
        <p className="text-gray-600">Gestión de sesiones y cabinas</p>
      </div>

      {/* Estado de Cabinas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Estado de Cabinas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cabinas.length > 0 ? (
            cabinas.map((cabina) => (
              <div key={cabina.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{cabina.nombre}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoCabinaBadge(cabina.estado).class}`}>
                    {getEstadoCabinaBadge(cabina.estado).text}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users size={16} className="mr-1" />
                  <span>Actualizada: {cabina.updated_at ? new Date(cabina.updated_at).toLocaleTimeString() : 'N/A'}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-4 text-gray-500">
              Cargando cabinas...
            </div>
          )}
        </div>
      </div>

      {/* Sesiones en Progreso */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Sesiones en Progreso</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : sesiones.length > 0 ? (
            <div className="space-y-4">
              {sesiones.map((sesion) => {
                const inicio = new Date(sesion.hora_inicio);
                const duracion = Math.floor((new Date() - inicio) / 60000); // minutos

                return (
                  <div key={sesion.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Stethoscope size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{sesion.paciente_nombre}</p>
                          <p className="text-sm text-gray-600">{sesion.servicio_nombre} - {sesion.cabina_nombre}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoBadge(sesion.estado).class}`}>
                          {getEstadoBadge(sesion.estado).text}
                        </span>
                        <p className="text-sm text-gray-600 mt-1">{inicio.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} ({duracion} min)</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Users size={16} className="mr-1" />
                          <span>{sesion.medico_nombre}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock size={16} className="mr-1" />
                          <span>{duracion} min en sesión</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleFinalizarSesion(sesion.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                      >
                        <CheckCircle size={16} className="mr-2" />
                        Finalizar
                      </button>
                    </div>

                    {/* Campos para notas clínicas */}
                    <div className="mt-4 space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notas de Evolución
                        </label>
                        <textarea
                          value={notasEvolucion[sesion.id] || ''}
                          onChange={(e) => setNotasEvolucion(prev => ({ ...prev, [sesion.id]: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={2}
                          placeholder="Registrar notas de evolución..."
                        />
                      </div>
                      {sesion.servicio_nombre?.includes('Axial Pro') && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tracción (kg)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={parametros[sesion.id]?.traccion_kg || ''}
                              onChange={(e) => setParametros(prev => ({
                                ...prev,
                                [sesion.id]: { ...prev[sesion.id], traccion_kg: e.target.value }
                              }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="0.0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Ángulo (°)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={parametros[sesion.id]?.angulo || ''}
                              onChange={(e) => setParametros(prev => ({
                                ...prev,
                                [sesion.id]: { ...prev[sesion.id], angulo: e.target.value }
                              }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="0.0"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No hay sesiones en progreso
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClinicaPage;