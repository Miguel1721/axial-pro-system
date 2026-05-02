import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Pill,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Bell,
  TrendingUp,
  Filter,
  Search,
  AlertCircle,
  Package,
  Truck
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const AlertasMedicamentos = () => {
  const { isDark } = useTheme();

  const [alertas, setAlertas] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtroSeveridad, setFiltroSeveridad] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [alertaSeleccionada, setAlertaSeleccionada] = useState(null);

  useEffect(() => {
    loadAlertas();
    loadEstadisticas();

    // Actualizar cada 60 segundos
    const interval = setInterval(() => {
      loadAlertas();
      loadEstadisticas();
    }, 60000);

    return () => clearInterval(interval);
  }, [filtroSeveridad, filtroTipo]);

  const loadAlertas = async () => {
    try {
      setLoading(true);

      // Usar API real
      const API_URL = import.meta.env.VITE_API_URL || 'https://centro-salud.agentesia.cloud:18001';
      const response = await fetch(`${API_URL}/api/medicamentos/alertas?severidad=${filtroSeveridad}&tipo=${filtroTipo}`);
      const data = await response.json();

      if (data.success) {
        setAlertas(data.data || []);
      } else {
        // Fallback a datos simulados si hay error
        console.error('Error en API, usando datos simulados');
        setAlertas(getAlertasSimuladas());
      }
    } catch (error) {
      console.error('Error cargando alertas:', error);
      // Fallback a datos simulados si hay error de conexión
      setAlertas(getAlertasSimuladas());
    } finally {
      setLoading(false);
    }
  };

  const loadEstadisticas = async () => {
    try {
      // Usar API real
      const API_URL = import.meta.env.VITE_API_URL || 'https://centro-salud.agentesia.cloud:18001';
      const response = await fetch(`${API_URL}/api/medicamentos/alertas/estadisticas`);
      const data = await response.json();

      if (data.success) {
        setEstadisticas(data.data);
      } else {
        // Fallback a datos simulados si hay error
        setEstadisticas(getEstadisticasSimuladas());
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      // Fallback a datos simulados si hay error de conexión
      setEstadisticas(getEstadisticasSimuladas());
    }
  };

  const getAlertasSimuladas = () => [
    {
      id: 1,
      tipo_alerta: 'stock_bajo',
      severidad: 'alta',
      titulo: '📦 Stock bajo: Ibuprofeno 400mg',
      descripcion: 'El medicamento Ibuprofeno 400mg tiene solo 3 unidades, por debajo del mínimo (10 unidades). Faltan 7 unidades.',
      medicamento_nombre: 'Ibuprofeno 400mg',
      accion_recomendada: 'Reabastecer Ibuprofeno 400mg. Stock actual: 3, Mínimo: 10',
      paciente_nombre: null,
      fecha_alerta: '2026-05-02T22:50:00',
      estado: 'pendiente'
    },
    {
      id: 2,
      tipo_alerta: 'vencimiento',
      severidad: 'media',
      titulo: '⏰ Vencimiento próximo: Paracetamol 500mg',
      descripcion: 'El medicamento Paracetamol 500mg vence en 12 días (2026-05-14). Se recomienda retirar o contactar proveedor.',
      medicamento_nombre: 'Paracetamol 500mg',
      accion_recomendada: 'Retirar del inventario o contactar proveedor. Vence el 2026-05-14',
      paciente_nombre: null,
      fecha_alerta: '2026-05-02T22:50:00',
      estado: 'pendiente'
    },
    {
      id: 3,
      tipo_alerta: 'interaccion_farmacologica',
      severidad: 'alta',
      titulo: '⚠️ Interacción peligrosa: Warfarina + Aspirina',
      descripcion: 'Posible interacción: Aumento del efecto anticoagulante. Paciente: Juan Pérez, Receta #123.',
      medicamento_nombre: null,
      accion_recomendada: 'Revisar receta 123. Considerar alternativas o monitorear efectos secundarios.',
      paciente_nombre: 'Juan Pérez',
      fecha_alerta: '2026-05-02T22:50:00',
      estado: 'pendiente'
    }
  ];

  const getEstadisticasSimuladas = () => ({
    total: 3,
    stock_bajo: 1,
    vencimiento: 1,
    interacciones: 1,
    alta_severidad: 2,
    media_severidad: 1,
    baja_severidad: 0
  });

  const handleResolverAlerta = async (alertaId) => {
    try {
      // Usar API real
      const API_URL = import.meta.env.VITE_API_URL || 'https://centro-salud.agentesia.cloud:18001';
      await fetch(`${API_URL}/api/medicamentos/alertas/${alertaId}/resolver`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resuelto_por: 1 }) // TODO: Usar user?.id cuando tengamos auth
      });

      // Actualizar lista de alertas
      setAlertas(alertas.filter(a => a.id !== alertaId));
      loadEstadisticas();

      alert('✅ Alerta resuelta');
    } catch (error) {
      console.error('Error resolviendo alerta:', error);
      alert('❌ Error al resolver alerta');
    }
  };

  const getTipoBadge = (tipoAlerta) => {
    const badges = {
      stock_bajo: {
        label: 'Stock Bajo',
        icon: Package,
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200'
      },
      vencimiento: {
        label: 'Vencimiento',
        icon: Clock,
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
      },
      interaccion_farmacologica: {
        label: 'Interacción',
        icon: AlertTriangle,
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200'
      }
    };

    return badges[tipoAlerta] || badges.stock_bajo;
  };

  const getSeveridadBadge = (severidad) => {
    const badges = {
      alta: {
        label: 'Alta',
        color: 'bg-red-500 text-white'
      },
      media: {
        label: 'Media',
        color: 'bg-yellow-500 text-white'
      },
      baja: {
        label: 'Baja',
        color: 'bg-green-500 text-white'
      }
    };

    return badges[severidad] || badges.media;
  };

  const filteredAlertas = alertas.filter(alerta => {
    const matchSeveridad = filtroSeveridad === 'todos' || alerta.severidad === filtroSeveridad;
    const matchTipo = filtroTipo === 'todos' || alerta.tipo_alerta === filtroTipo;
    return matchSeveridad && matchTipo;
  });

  if (loading) {
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
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            Alertas de Medicamentos
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Sistema de alertas farmacológicas y control de inventario
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { loadAlertas(); loadEstadisticas(); }}
            className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Actualizar"
          >
            <TrendingUp size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Alertas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {estadisticas.total || 0}
                </p>
              </div>
              <Bell className="text-blue-500" size={24} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Stock Bajo</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {estadisticas.stock_bajo || 0}
                </p>
              </div>
              <Package className="text-orange-500" size={24} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Vencimientos</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {estadisticas.vencimiento || 0}
                </p>
              </div>
              <Clock className="text-red-500" size={24} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Interacciones</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {estadisticas.interacciones || 0}
                </p>
              </div>
              <AlertTriangle className="text-purple-500" size={24} />
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar alertas..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 outline-none"
          />
        </div>

        <select
          value={filtroSeveridad}
          onChange={(e) => setFiltroSeveridad(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 outline-none"
        >
          <option value="todos">Todas las severidades</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>

        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 outline-none"
        >
          <option value="todos">Todos los tipos</option>
          <option value="stock_bajo">Stock Bajo</option>
          <option value="vencimiento">Vencimiento</option>
          <option value="interaccion_farmacologica">Interacción</option>
        </select>
      </div>

      {/* Lista de Alertas */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Severidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Alerta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Detalles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAlertas.map((alerta) => {
                const tipoBadge = getTipoBadge(alerta.tipo_alerta);
                const severidadBadge = getSeveridadBadge(alerta.severidad);
                const TipoIcon = tipoBadge.icon;

                return (
                  <tr key={alerta.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${tipoBadge.color}`}>
                        <TipoIcon size={14} />
                        {tipoBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${severidadBadge.color}`}>
                        {severidadBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {alerta.titulo}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <p className="mb-1">{alerta.descripcion}</p>
                      {alerta.paciente_nombre && (
                        <p className="text-xs text-gray-500">
                          Paciente: {alerta.paciente_nombre}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleResolverAlerta(alerta.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-800 dark:text-green-200 rounded-lg font-medium transition-colors"
                      >
                        <CheckCircle size={16} />
                        Resolver
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredAlertas.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <CheckCircle className="mx-auto mb-4 text-green-400" size={48} />
                    <p className="text-gray-600 dark:text-gray-400">
                      ¡No hay alertas pendientes!
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Información Adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
          <div className="flex items-start gap-3">
            <Package className="text-blue-500 mt-1" size={24} />
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                Gestión de Stock
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Alertas automáticas cuando el stock está por debajo del mínimo establecido.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl">
          <div className="flex items-start gap-3">
            <Clock className="text-red-500 mt-1" size={24} />
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                Control de Vencimiento
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Alertas para medicamentos próximos a vencer (30 días o menos).
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-purple-500 mt-1" size={24} />
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                Interacciones Farmacológicas
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Verificación automática de interacciones peligrosas entre medicamentos.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl">
          <div className="flex items-start gap-3">
            <Truck className="text-green-500 mt-1" size={24} />
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                Reabastecimiento
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Acciones recomendadas para mantener el inventario actualizado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertasMedicamentos;