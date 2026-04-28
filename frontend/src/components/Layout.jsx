import React from 'react';
import { Outlet, Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RoleSelector from './RoleSelector';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Stethoscope,
  CreditCard,
  Package,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();

  const menuItems = {
    admin: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/agenda', icon: Calendar, label: 'Agenda' },
      { path: '/recepcion', icon: Users, label: 'Recepción' },
      { path: '/clinica', icon: Stethoscope, label: 'Clínica' },
      { path: '/caja', icon: CreditCard, label: 'Caja' },
      { path: '/inventario', icon: Package, label: 'Inventario' }
    ],
    medico: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/agenda', icon: Calendar, label: 'Agenda' },
      { path: '/recepcion', icon: Users, label: 'Recepción' },
      { path: '/clinica', icon: Stethoscope, label: 'Clínica' }
    ],
    recepcion: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/agenda', icon: Calendar, label: 'Agenda' },
      { path: '/recepcion', icon: Users, label: 'Recepción' },
      { path: '/caja', icon: CreditCard, label: 'Caja' }
    ],
    caja: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/caja', icon: CreditCard, label: 'Caja' }
    ],
    paciente: [
      { path: '/mi-portal/citas', icon: Calendar, label: 'Mis Citas' },
      { path: '/mi-portal/historial', icon: Stethoscope, label: 'Mi Historial' },
      { path: '/mi-portal/bonos', icon: CreditCard, label: 'Mis Bonos' }
    ]
  };

  const userMenuItems = menuItems[user?.rol] || [];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 text-center">
        <p className="text-sm font-medium">🎭 Modo Demo - Cambia roles libremente para explorar todas las funcionalidades</p>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-16 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-white rounded-lg shadow-md"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <h1 className="text-xl font-bold">🎭 Axial Pro Clinic Demo</h1>
          </div>

          {/* User info */}
          <div className="p-4 border-b">
            <p className="text-sm text-gray-600">Bienvenido</p>
            <p className="font-semibold truncate">{user?.nombre}</p>
            <p className="text-xs text-gray-500 uppercase">{user?.rol}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {userMenuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {userMenuItems.find(item => location.pathname === item.path || location.pathname.startsWith(item.path))?.label ||
               (user?.rol === 'paciente' ? 'Mi Portal' : 'Dashboard')}
            </h2>

            {/* Role Selector in header */}
            <RoleSelector />
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;