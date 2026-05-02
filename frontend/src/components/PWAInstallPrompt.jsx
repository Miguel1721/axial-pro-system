import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const PWAInstallPrompt = () => {
  const { isDark } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar si ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Escuchar evento beforeinstallprompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    // Escuchar evento appinstalled
    const appInstalledHandler = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', appInstalledHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', appInstalledHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Mostrar el prompt de instalación nativo
    deferredPrompt.prompt();

    // Esperar a que el usuario responda
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('✅ App instalada');
    } else {
      console.log('ℹ️  Instalación rechazada');
    }

    // Limpiar el deferredPrompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Guardar en localStorage que el usuario lo rechazó
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  // No mostrar si ya está instalada o si el usuario la rechazó hace menos de 7 días
  const lastDismissed = localStorage.getItem('pwa-prompt-dismissed');
  const daysSinceDismissed = lastDismissed
    ? (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24)
    : Infinity;

  if (isInstalled || !showPrompt || daysSinceDismissed < 7) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-blue-500 dark:border-blue-400 p-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Icono de la app */}
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">A</span>
            </div>

            <div>
              <h3 className="font-bold text-lg">Instalar Axial Pro</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Sistema de Gestión Clínica
              </p>
            </div>
          </div>

          {/* Botón cerrar */}
          <button
            onClick={handleDismiss}
            className={`p-1 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Descripción */}
        <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Instala esta app en tu dispositivo para acceso rápido y offline.
        </p>

        {/* Características */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className={`text-center p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="text-2xl mb-1">⚡</div>
            <div className="text-xs font-medium">Rápido</div>
          </div>
          <div className={`text-center p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="text-2xl mb-1">📱</div>
            <div className="text-xs font-medium">Offline</div>
          </div>
          <div className={`text-center p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="text-2xl mb-1">🎨</div>
            <div className="text-xs font-medium">Premium</div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2">
          <button
            onClick={handleDismiss}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              isDark
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Ahora no
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Download size={18} />
            Instalar
          </button>
        </div>

        {/* Info badge */}
        <div className="mt-3 text-center">
          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            🔒 Instalación segura - Sin costo
          </span>
        </div>
      </div>

      {/* Animación CSS */}
      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PWAInstallPrompt;
