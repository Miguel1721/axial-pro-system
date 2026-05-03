import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  AlertTriangle,
  Package,
  TrendingUp,
  Clock,
  DollarSign,
  CheckCircle,
  RefreshCw,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  BarChart3,
  Calendar,
  Zap
} from 'lucide-react';

const AlertasStock = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [alertas, setAlertas] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTipo, setSelectedTipo] = useState('all');
  const [selectedCategoria, setSelectedCategoria] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('alertas');

  const tiposAlerta = [
    { id: 'all', label: 'Todas', color: 'gray', icon: AlertTriangle },
    { id: 'bajo_stock', label: 'Stock Bajo', color: 'red', icon: AlertTriangle },
    { id: 'sin_stock', label: 'Sin Stock', color: 'red', icon: Package },
    { id: 'vencimiento', label: 'Vencimiento', color: 'orange', icon: Clock },
    { id: 'precio', label: 'Precios', color: 'yellow', icon: DollarSign },
    { id: 'reabastecer', label: 'Reabastecer', color: 'blue', icon: Package }
  ];

  const categorias = [
    'Analgésico',
    'Antibiótico',
    'Antihistamínico',
    'Gastroprotector',
    'Antiinflamatorio',
    'Vitaminas'
  ];

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar alertas
      const alertasResponse = await fetch('/api/alertas-stock');
      const alertasData = await alertasResponse.json();
      if (alertasData.success) {
        setAlertas(alertasData.data);
      }

      // Cargar estadísticas
      const statsResponse = await fetch('/api/alertas-stock/estadisticas');
      const statsData = await statsResponse.json();
      if (statsData.success) {
        setEstadisticas(statsData.data);
      }

      // Cargar inventario
      const invResponse = await fetch('/api/alertas-stock/inventario');
      const invData = await invResponse.json();
      if (invData.success) {
        setInventario(invData.data);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      // Datos de prueba para desarrollo
      setAlertas([
        {
          id: 1,
          medicamento_nombre: 'Amoxicilina',
          presentacion: 'Capsulas',
          tipo_alerta: 'bajo_stock',
          severidad: 'alta',
          titulo: '🚨 Stock Bajo: Amoxicilina',
          descripcion: 'El stock actual (8) está por debajo del mínimo requerido (20)',
          sugerencia: 'Solicitar 32 unidades para mantener stock adecuado',
          estado: 'pendiente',
          fecha_creacion: '2024-05-01T10:30:00Z'
        },
        {
          id: 2,
          medicamento_nombre: 'Ibuprofeno',
          presentacion: 'Tabletas',
          tipo_alerta: 'vencimiento',
          severidad: 'media',
          titulo: '⚠️ Vencimiento Próximo: Ibuprofeno',
          descripcion: 'El medicamento vence en 25 días',
          sugerencia: 'Priorizar uso de este medicamento',
          estado: 'pendiente',
          fecha_creacion: '2024-05-01T10:30:00Z'
        }
      ]);

      setEstadisticas({
        total_medicamentos: 45,
        bajo_stock: 3,
        vencimiento_critico: 2,
        vencimiento_proximo: 8,
        alertas_pendientes: 12,
        alertas_procesadas: 28,
        promedio_stock: 35.6,
        stock_minimo_global: 0,
        stock_maximo_global: 200,
        porcentaje_bajo_stock: 7,
        porcentaje_vencimiento_critico: 4
      });

      setInventario([
        {
          id: 1,
          nombre: 'Ibuprofeno',
          presentacion: 'Tabletas',
          concentracion: 400,
          unidad_medida: 'mg',
          categoria: 'Analgésico',
          stock_actual: 25,
          stock_minimo: 10,
          stock_maximo: 100,
          precio_venta: 2500,
          estado_stock: 'normal',
          dias_para_vencer: 25,
          stock_dias: 8,
          necesita_reabastecer: false,
          porcentaje_alerta: 25
        },
        {
          id: 2,
          nombre: 'Amoxicilina',
          presentacion: 'Capsulas',
          concentracion: 500,
          unidad_medida: 'mg',
          categoria: 'Antibiótico',
          stock_actual: 8,
          stock_minimo: 20,
          stock_maximo: 150,
          precio_venta: 8500,
          estado_stock: 'bajo_stock',
          dias_para_vencer: 45,
          stock_dias: 3,
          necesita_reabastecer: true,
          porcentaje_alerta: 100
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const procesarAlerta = async (alertaId) => {
    try {
      const response = await fetch(`/api/alertas-stock/procesar/${alertaId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user?.id })
      });

      if (response.ok) {
        cargarDatos();
      }
    } catch (error) {
      console.error('Error procesando alerta:', error);
    }
  };

  const getSeveridadColor = (severidad) => {
    switch (severidad) {
      case 'critica': return 'red';
      case 'alta': return 'orange';
      case 'media': return 'yellow';
      case 'baja': return 'green';
      default: return 'gray';
    }
  };

  const getEstadoStockColor = (estado) => {
    switch (estado) {
      case 'sin_stock': return 'red';
      case 'bajo_stock': return 'orange';
      case 'alto_stock': return 'blue';
      case 'normal': return 'green';
      default: return 'gray';
    }
  };

  const filteredAlertas = alertas.filter(alerta => {
    const matchTipo = selectedTipo === 'all' || alerta.tipo_alerta === selectedTipo;
    const matchCategoria = selectedCategoria === 'all' ||
                           inventario.find(m => m.nombre === alerta.medicamento_nombre)?.categoria === selectedCategoria;
    const matchSearch = alerta.medicamento_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       alerta.titulo.toLowerCase().includes(searchTerm.toLowerCase());

    return matchTipo && matchCategoria && matchSearch;
  });

  const filteredInventario = inventario.filter(med => {
    const matchCategoria = selectedCategoria === 'all' || med.categoria === selectedCategoria;
    const matchSearch = med.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       med.generico?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchCategoria && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Dashboard de estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`rounded-xl p-4 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Medicamentos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{estadisticas.total_medicamentos}</p>
              </div>
              <Package size={24} className="text-blue-500" />
            </div>
          </div>
          <div className={`rounded-xl p-4 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Alertas Pendientes</p>
                <p className="text-2xl font-bold text-orange-600">{estadisticas.alertas_pendientes}</p>
              </div>
              <AlertTriangle size={24} className="text-orange-500" />
            </div>
          </div>
          <div className={`rounded-xl p-4 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Stock Bajo</p>
                <p className="text-2xl font-bold text-red-600">{estadisticas.bajo_stock}</p>
              </div>
              <TrendingDown size={24} className="text-red-500" />
            </div>
          </div>
          <div className={`rounded-xl p-4 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Vencimiento Crítico</p>
                <p className="text-2xl font-bold text-red-600">{estadisticas.vencimiento_critico}</p>
              </div>
              <Clock size={24} className="text-red-500" />
            </div>
          </div>
        </div>
      )}

      {/* Controles principales */}
      <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
              className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
            >
              {tiposAlerta.map(tipo => (
                <option key={tipo.id} value={tipo.id}>{tipo.label}</option>
              ))}
            </select>
            <select
              value={selectedCategoria}
              onChange={(e) => setSelectedCategoria(e.target.value)}
              className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
            >
              <option value="all">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar medicamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
              />
            </div>
            <button
              onClick={cargarDatos}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b dark:border-gray-700">
        <button
          onClick={() => setActiveTab('alertas')}
          className={`px-4 py-2 font-medium transition-all ${
            activeTab === 'alertas'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Alertas ({alertas.length})
        </button>
        <button
          onClick={() => setActiveTab('inventario')}
          className={`px-4 py-2 font-medium transition-all ${
            activeTab === 'inventario'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Inventario ({inventario.length})
        </button>
      </div>

      {/* Contenido según tab activo */}
      <div className="transition-all">
        {activeTab === 'alertas' && (
          <div className="space-y-4">
            {filteredAlertas.length === 0 ? (
              <div className={`rounded-xl p-8 text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  No hay alertas
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  El inventario está en buen estado
                </p>
              </div>
            ) : (
              filteredAlertas.map((alerta) => (
                <div
                  key={alerta.id}
                  className={`rounded-xl p-6 shadow-lg border-l-4 ${
                    getSeveridadColor(alerta.severidad) === 'red' ? 'border-red-500' :
                    getSeveridadColor(alerta.severidad) === 'orange' ? 'border-orange-500' :
                    getSeveridadColor(alerta.severidad) === 'yellow' ? 'border-yellow-500' :
                    getSeveridadColor(alerta.severidad) === 'green' ? 'border-green-500' :
                    'border-gray-500'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        getSeveridadColor(alerta.severidad) === 'red' ? 'bg-red-100 dark:bg-red-900/20' :
                        getSeveridadColor(alerta.severidad) === 'orange' ? 'bg-orange-100 dark:bg-orange-900/20' :
                        getSeveridadColor(alerta.severidad) === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                        getSeveridadColor(alerta.severidad) === 'green' ? 'bg-green-100 dark:bg-green-900/20' :
                        'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        {tiposAlerta.find(t => t.id === alerta.tipo_alerta)?.icon ?
                          <React.createElement(tiposAlerta.find(t => t.id === alerta.tipo_alerta).icon, { size: 20 }) :
                          <AlertTriangle size={20} />
                        }
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {alerta.titulo}
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            getSeveridadColor(alerta.severidad) === 'red' ? 'bg-red-100 text-red-700' :
                            getSeveridadColor(alerta.severidad) === 'orange' ? 'bg-orange-100 text-orange-700' :
                            getSeveridadColor(alerta.severidad) === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                            getSeveridadColor(alerta.severidad) === 'green' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {alerta.severidad.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(alerta.fecha_creacion).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => procesarAlerta(alerta.id)}
                      className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-all"
                    >
                      Procesar
                    </button>
                  </div>

                  {/* Contenido */}
                  <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {alerta.descripcion}
                  </p>

                  {alerta.sugerencia && (
                    <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">
                        Sugerencia:
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-300">
                        {alerta.sugerencia}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'inventario' && (
          <div className="space-y-4">
            {filteredInventario.length === 0 ? (
              <div className={`rounded-xl p-8 text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <Package size={64} className="mx-auto mb-4 text-gray-400" />
                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  No hay medicamentos en inventario
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Agrega medicamentos para comenzar a gestionar el inventario
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <th className="text-left py-3 px-4 font-medium">Medicamento</th>
                      <th className="text-left py-3 px-4 font-medium">Stock</th>
                      <th className="text-left py-3 px-4 font-medium">Estado</th>
                      <th className="text-left py-3 px-4 font-medium">Precio</th>
                      <th className="text-left py-3 px-4 font-medium">Días de Stock</th>
                      <th className="text-left py-3 px-4 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventario.map((med) => (
                      <tr key={med.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{med.nombre}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {med.generico} - {med.concentracion} {med.unidad_medida}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-lg font-semibold">
                            {med.stock_actual} / {med.stock_maximo}
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                med.estado_stock === 'bajo_stock' ? 'bg-orange-500' :
                                med.estado_stock === 'sin_stock' ? 'bg-red-500' :
                                med.estado_stock === 'alto_stock' ? 'bg-blue-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${med.porcentaje_stock}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            getEstadoStockColor(med.estado_stock) === 'red' ? 'bg-red-100 text-red-700' :
                            getEstadoStockColor(med.estado_stock) === 'orange' ? 'bg-orange-100 text-orange-700' :
                            getEstadoStockColor(med.estado_stock) === 'blue' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {med.estado_stock === 'bajo_stock' ? 'Stock Bajo' :
                             med.estado_stock === 'sin_stock' ? 'Sin Stock' :
                             med.estado_stock === 'alto_stock' ? 'Stock Alto' : 'Normal'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold">${med.precio_venta.toLocaleString()}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Compra: ${med.precio_compra?.toLocaleString()}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Zap size={16} className="text-gray-400" />
                            <span className="font-medium">{med.stock_dias}</span>
                            <span className="text-sm text-gray-500">días</span>
                          </div>
                          {med.dias_para_vencer && med.dias_para_vencer <= 30 && (
                            <div className="text-xs text-orange-600 mt-1">
                              ⚠️ Vence en {med.dias_para_vencer} días
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-all">
                              <Edit size={16} />
                            </button>
                            <button className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-all">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertasStock;