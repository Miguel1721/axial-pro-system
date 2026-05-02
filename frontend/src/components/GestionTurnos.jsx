import React, { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  UserCheck,
  AlertCircle,
  Play,
  CheckCircle,
  XCircle,
  Bell,
  TrendingUp,
  Calendar,
  Plus,
  Search,
  Filter,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const GestionTurnos = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();

  const [turnos, setTurnos] = useState([]);
  const [turnoActual, setTurnoActual] = useState(null);
  const [siguienteTurno, setSiguienteTurno] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [showNuevoTurno, setShowNuevoTurno] = useState(false);
  const [nuevoTurno, setNuevoTurno] = useState({
    paciente_id: '',
    doctor_id: '',
    servicio_id: '',
    prioridad: 3,
    sala: ''
  });

  // Datos simulados para doctores y servicios
  const [doctores] = useState([
    { id: 1, nombre: 'Dr. Carlos García', especialidad: 'Medicina General' },
    { id: 2, nombre: 'Dra. María Rodríguez', especialidad: 'Pediatría' },
    { id: 3, nombre: 'Dr. Juan Martínez', especialidad: 'Cardiología' }
  ]);

  const [servicios] = useState([
    { id: 1, nombre: 'Consulta General', duracion: 15 },
    { id: 2, nombre: 'Revisión', duracion: 10 },
    { id: 3, nombre: 'Procedimiento', duracion: 30 },
    { id: 4, nombre: 'Valoración', duracion: 20 }
  ]);

  useEffect(() => {
    loadTurnos();
    loadEstadisticas();

    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      loadTurnos();
      loadEstadisticas();
    }, 30000);

    return () => clearInterval(interval);
  }, [filtroEstado]);

  const loadTurnos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.centro-salud.agentesia.cloud';

      // Cargar turnos filtrados
      const url = filtroEstado === 'todos'
        ? `${API_URL}/api/turnos`
        : `${API_URL}/api/turnos?estado=${filtroEstado}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setTurnos(data.data || []);

        // Cargar turno actual y siguiente
        if (doctores.length > 0) {
          loadTurnoActual(doctores[0].id);
          loadSiguienteTurno(doctores[0].id);
        }
      }
    } catch (error) {
      console.error('Error cargando turnos:', error);
      // Usar datos simulados si falla la API
      setTurnos(getTurnosSimulados());
    } finally {
      setLoading(false);
    }
  };

  const loadTurnoActual = async (doctorId) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.centro-salud.agentesia.cloud';

      const response = await fetch(`${API_URL}/api/turnos/doctor/${doctorId}/actual`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setTurnoActual(data.data);
      }
    } catch (error) {
      console.error('Error cargando turno actual:', error);
    }
  };

  const loadSiguienteTurno = async (doctorId) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.centro-salud.agentesia.cloud';

      const response = await fetch(`${API_URL}/api/turnos/doctor/${doctorId}/siguiente`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setSiguienteTurno(data.data);
      }
    } catch (error) {
      console.error('Error cargando siguiente turno:', error);
    }
  };

  const loadEstadisticas = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.centro-salud.agentesia.cloud';

      const response = await fetch(`${API_URL}/api/turnos/estadisticas/hoy`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setEstadisticas(data.data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      setEstadisticas(getEstadisticasSimuladas());
    }
  };

  const getTurnosSimulados = () => [
    {
      id: 1,
      numero_turno: '20260502-D1-001',
      paciente_nombre: 'Juan',
      paciente_apellido: 'Pérez',
      doctor_nombre: 'Dr. Carlos García',
      servicio_nombre: 'Consulta General',
      estado: 'atendiendo',
      prioridad: 3,
      hora_llegada: '2026-05-02T10:00:00',
      hora_atencion: '2026-05-02T10:05:00',
      tiempo_estimado: 15,
      sala: 'Consulta 1'
    },
    {
      id: 2,
      numero_turno: '20260502-D1-002',
      paciente_nombre: 'María',
      paciente_apellido: 'González',
      doctor_nombre: 'Dr. Carlos García',
      servicio_nombre: 'Revisión',
      estado: 'esperando',
      prioridad: 2,
      hora_llegada: '2026-05-02T10:10:00',
      tiempo_estimado: 10,
      tiempo_estimado_espera: 8,
      sala: null
    },
    {
      id: 3,
      numero_turno: '20260502-D1-003',
      paciente_nombre: 'Carlos',
      paciente_apellido: 'López',
      doctor_nombre: 'Dr. Carlos García',
      servicio_nombre: 'Procedimiento',
      estado: 'esperando',
      prioridad: 3,
      hora_llegada: '2026-05-02T10:15:00',
      tiempo_estimado: 30,
      tiempo_estimado_espera: 18,
      sala: null
    }
  ];

  const getEstadisticasSimuladas = () => ({
    total: 15,
    esperando: 5,
    atendiendo: 1,
    completados: 8,
    cancelados: 1,
    tiempo_promedio_atencion: '18.5'
  });

  const handleIniciarTurno = async (turnoId) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.centro-salud.agentesia.cloud';

      const response = await fetch(`${API_URL}/api/turnos/${turnoId}/iniciar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          actualizado_por: user?.id
        })
      });

      if (response.ok) {
        loadTurnos();
        loadEstadisticas();

        // Reproducir sonido
        if (soundEnabled) {
          playNotificationSound();
        }
      }
    } catch (error) {
      console.error('Error iniciando turno:', error);
    }
  };

  const handleCompletarTurno = async (turnoId) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.centro-salud.agentesia.cloud';

      const response = await fetch(`${API_URL}/api/turnos/${turnoId}/completar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          actualizado_por: user?.id
        })
      });

      if (response.ok) {
        loadTurnos();
        loadEstadisticas();
      }
    } catch (error) {
      console.error('Error completando turno:', error);
    }
  };

  const handleCancelarTurno = async (turnoId) => {
    if (!confirm('¿Estás seguro de cancelar este turno?')) return;

    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.centro-salud.agentesia.cloud';

      const response = await fetch(`${API_URL}/api/turnos/${turnoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        loadTurnos();
        loadEstadisticas();
      }
    } catch (error) {
      console.error('Error cancelando turno:', error);
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(e => console.log('Audio no disponible'));
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      esperando: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
        icon: Clock,
        text: 'Esperando'
      },
      atendiendo: {
        bg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
        icon: Play,
        text: 'Atendiendo'
      },
      completado: {
        bg: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
        icon: CheckCircle,
        text: 'Completado'
      },
      cancelado: {
        bg: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
        icon: XCircle,
        text: 'Cancelado'
      }
    };

    return badges[estado] || badges.esperando;
  };

  const getPrioridadBadge = (prioridad) => {
    const badges = {
      1: { text: 'Alta', color: 'bg-red-500' },
      2: { text: 'Media', color: 'bg-yellow-500' },
      3: { text: 'Normal', color: 'bg-green-500' }
    };

    return badges[prioridad] || badges[3];
  };

  const filteredTurnos = turnos.filter(turno => {
    const matchesEstado = filtroEstado === 'todos' || turno.estado === filtroEstado;
    const matchesBusqueda = busqueda === '' ||
      turno.paciente_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      turno.paciente_apellido?.toLowerCase().includes(busqueda.toLowerCase()) ||
      turno.numero_turno?.toLowerCase().includes(busqueda.toLowerCase());

    return matchesEstado && matchesBusqueda;
  });

  if (loading && turnos.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Gestión de Turnos
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Sistema de colas y atención de pacientes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-3 rounded-lg transition-colors ${
              soundEnabled
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
            title={soundEnabled ? 'Sonido activado' : 'Sonido desactivado'}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button
            onClick={() => setShowNuevoTurno(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all"
          >
            <Plus size={20} />
            Nuevo Turno
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Hoy</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {estadisticas.total || 0}
                </p>
              </div>
              <Users className="text-blue-500" size={24} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Esperando</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {estadisticas.esperando || 0}
                </p>
              </div>
              <Clock className="text-yellow-500" size={24} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Atendiendo</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {estadisticas.atendiendo || 0}
                </p>
              </div>
              <Play className="text-blue-500" size={24} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completados</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {estadisticas.completados || 0}
                </p>
              </div>
              <CheckCircle className="text-green-500" size={24} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Promedio</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {estadisticas.tiempo_promedio_atencion || 0}m
                </p>
              </div>
              <TrendingUp className="text-purple-500" size={24} />
            </div>
          </div>
        </div>
      )}

      {/* Turno Actual */}
      {turnoActual && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <UserCheck size={32} />
              </div>
              <div>
                <p className="text-sm opacity-80">Turno Actual</p>
                <h3 className="text-3xl font-bold">{turnoActual.numero_turno}</h3>
                <p className="text-lg opacity-90">
                  {turnoActual.paciente_nombre} {turnoActual.paciente_apellido}
                </p>
                <p className="text-sm opacity-80">
                  {turnoActual.servicio_nombre} - Sala {turnoActual.sala}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleCompletarTurno(turnoActual.id)}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
            >
              <CheckCircle size={20} />
              Completar
            </button>
          </div>
        </div>
      )}

      {/* Filtros y Búsqueda */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre o número de turno..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 outline-none"
        >
          <option value="todos">Todos los estados</option>
          <option value="esperando">Esperando</option>
          <option value="atendiendo">Atendiendo</option>
          <option value="completado">Completados</option>
          <option value="cancelado">Cancelados</option>
        </select>
      </div>

      {/* Lista de Turnos */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Turno
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Servicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Prioridad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Tiempo Espera
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTurnos.map((turno) => {
                const estadoBadge = getEstadoBadge(turno.estado);
                const prioridadBadge = getPrioridadBadge(turno.prioridad);
                const EstadoIcon = estadoBadge.icon;

                return (
                  <tr key={turno.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">
                        {turno.numero_turno}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {turno.paciente_nombre} {turno.paciente_apellido}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {turno.servicio_nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${prioridadBadge.color}`}>
                        {prioridadBadge.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${estadoBadge.bg}`}>
                        <EstadoIcon size={14} />
                        {estadoBadge.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {turno.tiempo_estimado_espera ? (
                        <span className="font-medium">
                          ~{turno.tiempo_estimado_espera} min
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        {turno.estado === 'esperando' && (
                          <>
                            <button
                              onClick={() => handleIniciarTurno(turno.id)}
                              className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                              title="Iniciar atención"
                            >
                              <Play size={18} />
                            </button>
                            <button
                              onClick={() => handleCancelarTurno(turno.id)}
                              className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                              title="Cancelar turno"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        {turno.estado === 'atendiendo' && (
                          <button
                            onClick={() => handleCompletarTurno(turno.id)}
                            className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                            title="Completar atención"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredTurnos.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
                    <p className="text-gray-600 dark:text-gray-400">
                      No hay turnos para mostrar
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GestionTurnos;