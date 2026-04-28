import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, Plus, Minus } from 'lucide-react';

const InventarioPage = () => {
  const [inventario, setInventario] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    stock_actual: 0,
    stock_minimo: 0,
    unidad_medida: 'und'
  });

  useEffect(() => {
    fetchInventario();
    fetchAlertas();
  }, []);

  const fetchInventario = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.centro-salud.agentesia.cloud';
      const response = await fetch(`${API_URL}/api/inventario`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      // Transformar datos para mantener compatibilidad con el UI existente
      const transformedData = data.map(item => ({
        ...item,
        stockActual: item.stock_actual,
        stockMinimo: item.stock_minimo,
        unidad: item.unidad_medida,
        nivel: item.nivel_stock
      }));

      setInventario(transformedData);
    } catch (error) {
      console.error('Error fetching inventario:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlertas = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.centro-salud.agentesia.cloud';
      const response = await fetch(`${API_URL}/api/inventario/alertas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setAlertas(data);
    } catch (error) {
      console.error('Error fetching alertas:', error);
    }
  };

  const handleActualizarStock = async (itemId, nuevoStock) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.centro-salud.agentesia.cloud';
      const response = await fetch(`${API_URL}/api/inventario/${itemId}/actualizar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ stock_actual: nuevoStock })
      });

      if (response.ok) {
        fetchInventario();
        fetchAlertas();
      } else {
        alert('Error al actualizar stock');
      }
    } catch (error) {
      console.error('Error actualizando stock:', error);
      alert('Error al actualizar stock');
    }
  };

  const handleCreateProducto = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.centro-salud.agentesia.cloud';
      const response = await fetch(`${API_URL}/api/inventario`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevoProducto)
      });

      if (response.ok) {
        setShowForm(false);
        setNuevoProducto({
          nombre: '',
          stock_actual: 0,
          stock_minimo: 0,
          unidad_medida: 'und'
        });
        fetchInventario();
        alert('Producto agregado exitosamente');
      } else {
        const error = await response.json();
        alert('Error al agregar producto: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creando producto:', error);
      alert('Error al agregar producto');
    }
  };

  const getNivelColor = (nivel) => {
    switch (nivel) {
      case 'suficiente': return 'bg-green-100 text-green-800';
      case 'medio': return 'bg-yellow-100 text-yellow-800';
      case 'bajo': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleIncrementarStock = (itemId, cantidad) => {
    const item = inventario.find(i => i.id === itemId);
    if (item) {
      const nuevoStock = Math.max(0, item.stockActual + cantidad);
      handleActualizarStock(itemId, nuevoStock);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
        <p className="text-gray-600">Gestión de insumos y stock</p>
      </div>

      {/* Alertas de Stock */}
      {alertas.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-sm font-medium text-red-800">
              {alertas.length} items con stock mínimo o crítico
            </h3>
          </div>
        </div>
      )}

      {/* Tabla de Inventario */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Stock de Insumos</h2>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus size={16} className="mr-2" />
            Nuevo Producto
          </button>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Actual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Mínimo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nivel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventario.map((item) => (
                  <tr key={item.id} className={item.nivel === 'bajo' ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="h-5 w-5 text-gray-400 mr-2" />
                        <div className="text-sm font-medium text-gray-900">{item.nombre}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.stockActual}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.stockMinimo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.unidad}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getNivelColor(item.nivel)}`}>
                        {item.nivel === 'suficiente' ? 'Suficiente' :
                         item.nivel === 'medio' ? 'Medio' : 'Bajo Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleIncrementarStock(item.id, -1)}
                          disabled={item.stockActual <= 0}
                          className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
                        >
                          <Minus size={16} />
                        </button>
                        <button
                          onClick={() => handleIncrementarStock(item.id, 1)}
                          className="p-1 text-gray-400 hover:text-green-600"
                        >
                          <Plus size={16} />
                        </button>
                        <button
                          onClick={() => {
                            const nuevoStock = prompt(`Nuevo stock para ${item.nombre}:`, item.stockActual);
                            if (nuevoStock !== null) {
                              handleActualizarStock(item.id, parseFloat(nuevoStock));
                            }
                          }}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
                        >
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal de Nuevo Producto */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Nuevo Producto</h2>
            <form onSubmit={handleCreateProducto} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  value={nuevoProducto.nombre}
                  onChange={(e) => setNuevoProducto({...nuevoProducto, nombre: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del producto"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Inicial *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={nuevoProducto.stock_actual}
                    onChange={(e) => setNuevoProducto({...nuevoProducto, stock_actual: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Mínimo *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={nuevoProducto.stock_minimo}
                    onChange={(e) => setNuevoProducto({...nuevoProducto, stock_minimo: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidad *
                </label>
                <select
                  required
                  value={nuevoProducto.unidad_medida}
                  onChange={(e) => setNuevoProducto({...nuevoProducto, unidad_medida: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="und">Unidad</option>
                  <option value="lts">Litros</option>
                  <option value="rollos">Rollos</option>
                  <option value="cajas">Cajas</option>
                  <option value="botellas">Botellas</option>
                  <option value="kg">Kilogramos</option>
                </select>
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
                  Agregar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventarioPage;