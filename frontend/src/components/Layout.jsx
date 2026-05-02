import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';
import ThemeSelector from './ThemeSelector';
import AccessibilityControl from './AccessibilityControl';
import RoleSelector from './RoleSelector';
import UserAvatar from './UserAvatar';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Stethoscope,
  CreditCard,
  Package,
  LogOut
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const location = useLocation();

  const menuItems = {
    admin: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Panel' },
      { path: '/agenda', icon: Calendar, label: 'Agenda' },
      { path: '/recepcion', icon: Users, label: 'Sala' },
      { path: '/clinica', icon: Stethoscope, label: 'Clínica' },
      { path: '/caja', icon: CreditCard, label: 'Caja' },
      { path: '/inventario', icon: Package, label: 'Inventario' }
    ],
    medico: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Panel' },
      { path: '/agenda', icon: Calendar, label: 'Agenda' },
      { path: '/recepcion', icon: Users, label: 'Sala' },
      { path: '/clinica', icon: Stethoscope, label: 'Clínica' }
    ],
    recepcion: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Panel' },
      { path: '/agenda', icon: Calendar, label: 'Agenda' },
      { path: '/recepcion', icon: Users, label: 'Sala' },
      { path: '/caja', icon: CreditCard, label: 'Caja' }
    ],
    caja: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Panel' },
      { path: '/caja', icon: CreditCard, label: 'Caja' }
    ],
    paciente: [
      { path: '/mi-portal/citas', icon: Calendar, label: 'Citas' },
      { path: '/mi-portal/historial', icon: Stethoscope, label: 'Historial' },
      { path: '/mi-portal/bonos', icon: CreditCard, label: 'Bonos' }
    ]
  };

  const userMenuItems = menuItems[user?.rol] || [];

  const handleLogout = () => {
    logout();
  };

  const currentPageLabel = userMenuItems.find(
    item => location.pathname === item.path || location.pathname.startsWith(item.path)
  )?.label || (user?.rol === 'paciente' ? 'Mi Portal' : 'Panel');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Minimal Header - Mobile */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-semibold text-gray-800 dark:text-white">Axial Pro</span>
          </div>
          <div className="flex items-center space-x-2">
            <AccessibilityControl />
            <NotificationBell />
            <ThemeSelector />
            <RoleSelector />
          </div>
        </div>
      </header>

      {/* Premium Navbar - Desktop */}
      <header className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-800 dark:text-white">Axial Pro Clinic</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Gestión Médica Premium</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-1">
              {userMenuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                    location.pathname === item.path
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <item.icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-3">
              {/* Avatar del usuario con nombre y rol */}
              <div className="hidden lg:block">
                <UserAvatar size="sm" showName={true} showRole={true} />
              </div>

              {/* Controles de accesibilidad, notificaciones, tema y rol */}
              <AccessibilityControl />
              <NotificationBell />
              <ThemeSelector />
              <RoleSelector />

              {/* Botón de logout */}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
                title="Cerrar Sesión"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Mobile */}
      <div className="md:hidden pt-16 pb-20 px-4">
        <div className="max-w-md mx-auto">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{currentPageLabel}</h2>
            <div className="flex items-center gap-2">
              <UserAvatar size="xs" showName={false} showRole={false} />
              <p className="text-sm text-gray-500 dark:text-gray-400">Bienvenido, {user?.nombre}</p>
            </div>
          </div>
          <Outlet />
        </div>
      </div>

      {/* Main Content - Desktop */}
      <div className="hidden md:block pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <main className="py-6">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Bottom Navigation Bar - Mobile (iOS style) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 pb-safe">
          <div className="flex items-center justify-around px-2 py-2">
            {userMenuItems.slice(0, 4).map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon size={20} className={isActive ? 'transform scale-110' : ''} />
                  <span className="text-[10px] font-medium mt-1">{item.label}</span>
                </Link>
              );
            })}

            {/* More button for additional menu items */}
            {userMenuItems.length > 4 && (
              <button
                className="flex flex-col items-center justify-center px-3 py-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                    +{userMenuItems.length - 4}
                  </span>
                </div>
                <span className="text-[10px] font-medium mt-1">Más</span>
              </button>
            )}

            {/* Logout button - Mobile */}
            <button
              onClick={handleLogout}
              className="flex flex-col items-center justify-center px-3 py-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400"
            >
              <LogOut size={20} />
              <span className="text-[10px] font-medium mt-1">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;