import React, { useState, useEffect } from 'react';
import { CreditCard, Receipt, TrendingUp, Download, Plus } from 'lucide-react';

const CajaPage = () => {
  const [cierreCaja, setCierreCaja] = useState({
    totalCitas: 0,
    totalAbonos: 0,
    citasHoy: 0,
    abonosHoy: 0
  });
  const [bonos, setBonos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBonoForm, setShowBonoForm] = useState(false);
  const [pacientes, setPacientes] = useState([]);
  const [nuevoBono, setNuevoBono] = useState({
    paciente_id: '',
    nombre_paquete: '',
    sesiones_totales: 5,
    precio_pagado: 0
  });

  useEffect(() => {
    fetchCierreCaja();
    fetchBonos();
    fetchPacientes();
  }, []);

  const fetchCierreCaja = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.centro-salud.agentesia.cloud';
      const response = await fetch(`${API_URL}/api/caja/cierre-caja`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      setCierreCaja({
        totalCitas: data.citas?.total_citas || 0,
        totalAbonos: data.citas?.total_abonos || 0,
        citasHoy: data.citas?.citas_hoy || 0,
        abonosHoy: data.citas?.abonos_hoy || 0
      });
    } catch (error) {
      console.error('Error fetching cierre caja:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBonos = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.centro-salud.agentesia.cloud';
      const response = await fetch(`${API_URL}/api/caja/bonos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setBonos(data);
    } catch (error) {
      console.error('Error fetching bonos:', error);
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

  const handleCreateBono = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.centro-salud.agentesia.cloud';
      const response = await fetch(`${API_URL}/api/caja/bonos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevoBono)
      });

      if (response.ok) {
        setShowBonoForm(false);
        setNuevoBono({
          paciente_id: '',
          nombre_paquete: '',
          sesiones_totales: 5,
          precio_pagado: 0
        });
        fetchBonos();
        alert('Bono creado exitosamente');
      } else {
        const error = await response.json();
        alert('Error al crear bono: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating bono:', error);
      alert('Error al crear bono');
    }
  };

  const bonosEjemplo = [
    { id: 1, paciente: 'Juan Pérez', paquete: 'Paquete 5 sesiones', sesionesRestantes: 2, valor: 900000 },
    { id: 2, paciente: 'María García', paquete: 'Paquete 10 sesiones', sesionesRestantes: 5, valor: 1800000 },
    { id: 3, paciente: 'Carlos López', paquete: 'Paquete 3 sesiones', sesionesRestantes: 1, valor: 540000 }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Caja</h1>
        <p className="text-gray-600">Gestión de pagos y bonos</p>
      </div>

      {/* Resumen del Día */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500 rounded-lg">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Citas Totales</p>
              <p className="text-2xl font-semibold text-gray-900">{cierreCaja.totalCitas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-500 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Abonos</p>
              <p className="text-2xl font-semibold text-gray-900">${cierreCaja.totalAbonos.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-500 rounded-lg">
              <Receipt className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Citas Hoy</p>
              <p className="text-2xl font-semibold text-gray-900">{cierreCaja.citasHoy}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-500 rounded-lg">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Abonos Hoy</p>
              <p className="text-2xl font-semibold text-gray-900">${cierreCaja.abonosHoy.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bonos de Pacientes */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Bonos de Pacientes</h2>
            <button
              onClick={() => setShowBonoForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <Plus size={16} className="mr-2" />
              Nuevo Bono
            </button>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : bonosEjemplo.length > 0 ? (
              <div className="space-y-3">
                {bonosEjemplo.map((bono) => (
                  <div key={bono.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{bono.paciente_nombre}</p>
                      <p className="text-sm text-gray-600">{bono.nombre_paquete}</p>
                      <p className="text-xs text-gray-500">${bono.precio_pagado.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{bono.sesiones_totales - bono.sesiones_usadas} sesiones restantes</p>
                      <span className={`mt-1 inline-block px-3 py-1 text-xs rounded-full ${
                        bono.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {bono.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No hay bonos registrados
              </div>
            )}
          </div>
        </div>

        {/* Formulario de Pago */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Registrar Pago</h2>
          </div>
          <div className="p-6">
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paciente
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Seleccionar paciente</option>
                  {pacientes.map(paciente => (
                    <option key={paciente.id} value={paciente.id}>{paciente.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Concepto
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Axial Pro (Descompresión) - $180,000</option>
                  <option>Quiropraxia Especializada - $120,000</option>
                  <option>Fisioterapia Integral - $100,000</option>
                  <option>Adicionales</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pago
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Efectivo</option>
                  <option>Tarjeta Débito</option>
                  <option>Tarjeta Crédito</option>
                  <option>Transferencia</option>
                  <option>Bono</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Procesar Pago
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  <Download size={20} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal de Nuevo Bono */}
      {showBonoForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nuevo Bono</h2>
            <form onSubmit={handleCreateBono} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paciente *
                </label>
                <select
                  required
                  value={nuevoBono.paciente_id}
                  onChange={(e) => setNuevoBono({...nuevoBono, paciente_id: e.target.value})}
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
                  Nombre del Paquete *
                </label>
                <input
                  type="text"
                  required
                  value={nuevoBono.nombre_paquete}
                  onChange={(e) => setNuevoBono({...nuevoBono, nombre_paquete: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Paquete 5 sesiones"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sesiones Totales *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={nuevoBono.sesiones_totales}
                  onChange={(e) => setNuevoBono({...nuevoBono, sesiones_totales: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Pagado *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={nuevoBono.precio_pagado}
                  onChange={(e) => setNuevoBono({...nuevoBono, precio_pagado: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBonoForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Crear Bono
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CajaPage;