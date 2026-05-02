import React, { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  Bell,
  Volume2,
  VolumeX,
  Monitor,
  User,
  Calendar,
  TrendingUp
} from 'lucide-react';

const PantallaEspera = () => {
  const [turnos, setTurnos] = useState([]);
  const [turnoActual, setTurnoActual] = useState(null);
  const [ultimosLlamados, setUltimosLlamados] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadData();

    // Actualizar cada 10 segundos
    const interval = setInterval(() => {
      loadData();
      setCurrentTime(new Date());
    }, 10000);

    // Actualizar reloj cada segundo
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(clockInterval);
    };
  }, []);

  const loadData = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.centro-salud.agentesia.cloud';

      // Cargar turnos esperando
      const turnosResponse = await fetch(`${API_URL}/api/turnos?estado=esperando`);
      const turnosData = await turnosResponse.json();

      // Cargar turno actual
      const actualResponse = await fetch(`${API_URL}/api/turnos/doctor/1/actual`);
      const actualData = await actualResponse.json();

      if (turnosData.success) {
        setTurnos(turnosData.data || getTurnosSimulados());
      }

      if (actualData.success && actualData.data) {
        setTurnoActual(actualData.data);
        // Agregar a últimos llamados si es nuevo
        setUltimosLlamados(prev => {
          const yaExiste = prev.some(t => t.id === actualData.data.id);
          if (!yaExiste) {
            playNotificationSound();
            return [actualData.data, ...prev].slice(0, 5);
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      setTurnos(getTurnosSimulados());
    }
  };

  const getTurnosSimulados = () => [
    {
      id: 2,
      numero_turno: '20260502-D1-002',
      paciente_nombre: 'María',
      paciente_apellido: 'González',
      doctor_nombre: 'Dr. Carlos García',
      servicio_nombre: 'Revisión',
      prioridad: 2,
      hora_llegada: '2026-05-02T10:10:00',
      tiempo_estimado_espera: 8
    },
    {
      id: 3,
      numero_turno: '20260502-D1-003',
      paciente_nombre: 'Carlos',
      paciente_apellido: 'López',
      doctor_nombre: 'Dr. Carlos García',
      servicio_nombre: 'Procedimiento',
      prioridad: 3,
      hora_llegada: '2026-05-02T10:15:00',
      tiempo_estimado_espera: 18
    },
    {
      id: 4,
      numero_turno: '20260502-D1-004',
      paciente_nombre: 'Ana',
      paciente_apellido: 'Martínez',
      doctor_nombre: 'Dr. Carlos García',
      servicio_nombre: 'Consulta General',
      prioridad: 3,
      hora_llegada: '2026-05-02T10:20:00',
      tiempo_estimado_espera: 28
    },
    {
      id: 5,
      numero_turno: '20260502-D1-005',
      paciente_nombre: 'Pedro',
      paciente_apellido: 'Sánchez',
      doctor_nombre: 'Dr. Carlos García',
      servicio_nombre: 'Valoración',
      prioridad: 1,
      hora_llegada: '2026-05-02T10:25:00',
      tiempo_estimado_espera: 5
    }
  ];

  const playNotificationSound = () => {
    if (!soundEnabled) return;

    try {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(e => console.log('Audio no disponible'));
    } catch (error) {
      console.log('Error reproduciendo sonido:', error);
    }
  };

  const getPrioridadBadge = (prioridad) => {
    const badges = {
      1: { text: 'PRIORIDAD ALTA', color: 'bg-red-500' },
      2: { text: 'PRIORIDAD MEDIA', color: 'bg-yellow-500' },
      3: { text: 'PRIORIDAD NORMAL', color: 'bg-green-500' }
    };

    return badges[prioridad] || badges[3];
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Monitor size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Pantalla de Espera
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Axial Pro Clinic - Sistema de Turnos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {formatTime(currentTime)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatDate(currentTime)}
              </p>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-4 rounded-xl transition-all shadow-lg ${
                soundEnabled
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
              }`}
              title={soundEnabled ? 'Sonido activado' : 'Sonido desactivado'}
            >
              {soundEnabled ? <Volume2 size={28} /> : <VolumeX size={28} />}
            </button>
          </div>
        </div>

        {/* Turno Actual - Destacado */}
        {turnoActual && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 text-white shadow-2xl animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                  <Bell size={48} />
                </div>
                <div>
                  <p className="text-lg opacity-80 mb-2">ATENDIENDO AHORA</p>
                  <h2 className="text-6xl font-black mb-3">
                    {turnoActual.numero_turno}
                  </h2>
                  <p className="text-3xl font-semibold mb-1">
                    {turnoActual.paciente_nombre} {turnoActual.paciente_apellido}
                  </p>
                  <p className="text-xl opacity-90">
                    {turnoActual.servicio_nombre} - Sala {turnoActual.sala || 'A asignar'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <User size={64} />
                </div>
                <p className="text-lg opacity-80">Dr. Carlos García</p>
              </div>
            </div>
          </div>
        )}

        {/* Contenido Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cola de Espera */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Users size={24} className="text-purple-500" />
                Cola de Espera
              </h3>
              <span className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full font-semibold">
                {turnos.length} pacientes
              </span>
            </div>

            <div className="space-y-4">
              {turnos.map((turno, index) => {
                const prioridadBadge = getPrioridadBadge(turno.prioridad);

                return (
                  <div
                    key={turno.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      turno.prioridad === 1
                        ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                          index < 3 ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gray-400'
                        }`}>
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-mono font-bold text-xl text-gray-900 dark:text-gray-100">
                            {turno.numero_turno}
                          </p>
                          <p className="text-lg text-gray-700 dark:text-gray-300">
                            {turno.paciente_nombre} {turno.paciente_apellido}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`px-3 py-1 text-xs font-semibold text-white rounded-full ${prioridadBadge.color}`}>
                          {prioridadBadge.text}
                        </span>
                        <div className="flex items-center gap-2 mt-2 text-gray-600 dark:text-gray-400">
                          <Clock size={16} />
                          <span className="font-medium">
                            ~{turno.tiempo_estimado_espera || 15} min
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {turnos.length === 0 && (
                <div className="text-center py-12">
                  <Users className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-gray-600 dark:text-gray-400">
                    No hay pacientes en espera
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Últimos Llamados */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Bell size={24} className="text-blue-500" />
                Últimos Llamados
              </h3>
              <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-semibold">
                Últimas 5 citas
              </span>
            </div>

            <div className="space-y-4">
              {ultimosLlamados.length > 0 ? (
                ultimosLlamados.map((turno, index) => (
                  <div
                    key={turno.id}
                    className={`p-4 rounded-xl transition-all ${
                      index === 0
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                        : 'bg-gray-50 dark:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-mono font-bold text-xl ${index === 0 ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>
                          {turno.numero_turno}
                        </p>
                        <p className={`text-lg ${index === 0 ? 'text-white/90' : 'text-gray-700 dark:text-gray-300'}`}>
                          {turno.paciente_nombre} {turno.paciente_apellido}
                        </p>
                      </div>

                      {index === 0 && (
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <Bell size={24} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Bell className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-gray-600 dark:text-gray-400">
                    No hay llamados recientes
                  </p>
                </div>
              )}
            </div>

            {/* Información Adicional */}
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
              <div className="flex items-center gap-3">
                <Calendar className="text-purple-500" size={24} />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    Tiempo Promedio de Atención
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ~15 minutos por paciente
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-blue-500" size={24} />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    Eficiencia del Sistema
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {turnos.length > 0 ? `${turnos.length} pacientes en cola` : 'Sin espera'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            🏥 Axial Pro Clinic - Sistema de Gestión de Turnos v1.0
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Si su número no aparece en 30 minutos, acérquese a recepción
          </p>
        </div>
      </div>
    </div>
  );
};

export default PantallaEspera;