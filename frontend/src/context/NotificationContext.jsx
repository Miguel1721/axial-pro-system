import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Simulación de notificaciones con polling seguro
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || 'https://api.centro-salud.agentesia.cloud';

        // Fetch notificaciones desde API
        const response = await fetch(`${API_URL}/api/notificaciones`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const unreadNotifications = data.filter(n => !n.leida);
          setNotifications(data);
          setUnreadCount(unreadNotifications.length);
        }
      } catch (error) {
        // Silencioso - no romper la app si falla
        console.log('Notificaciones polling (seguro):', error.message);
      }
    };

    // Polling cada 30 segundos (seguro y no sobrecarga)
    const interval = setInterval(fetchNotifications, 30000);
    fetchNotifications(); // Primera carga

    return () => clearInterval(interval);
  }, []);

  const markAsRead = (notificationId) => {
    setNotifications(prev => prev.map(n =>
      n.id === notificationId ? { ...n, leida: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, leida: true })));
    setUnreadCount(0);
  };

  // Función segura para agregar notificaciones (usada por simulación)
  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      addNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};