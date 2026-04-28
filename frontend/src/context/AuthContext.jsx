import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const rawApiUrl = import.meta.env.VITE_API_URL;
      const API_URL = (rawApiUrl && rawApiUrl !== 'undefined')
                      ? rawApiUrl
                      : 'https://api.centro-salud.agentesia.cloud';
      const rawSocketUrl = import.meta.env.VITE_SOCKET_URL;
      const SOCKET_URL = (rawSocketUrl && rawSocketUrl !== 'undefined')
                         ? rawSocketUrl
                         : 'wss://api.centro-salud.agentesia.cloud';

      fetch(`${API_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          localStorage.removeItem('token');
        } else {
          setUser(data);
          const socketInstance = io(SOCKET_URL, {
            auth: {
              token: token,
              userId: data.id
            }
          });
          setSocket(socketInstance);
          socketInstance.on('connect', () => {
            console.log('Socket connected:', socketInstance.id);
            socketInstance.emit('join-room', 'all-users');
          });
        }
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('token');
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const rawApiUrl = import.meta.env.VITE_API_URL;
      const API_URL = (rawApiUrl && rawApiUrl !== 'undefined')
                      ? rawApiUrl
                      : 'https://api.centro-salud.agentesia.cloud';
      const rawSocketUrl = import.meta.env.VITE_SOCKET_URL;
      const SOCKET_URL = (rawSocketUrl && rawSocketUrl !== 'undefined')
                         ? rawSocketUrl
                         : 'wss://api.centro-salud.agentesia.cloud';

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);

        const socketInstance = io(SOCKET_URL, {
          auth: {
            token: data.token,
            userId: data.user.id
          }
        });
        setSocket(socketInstance);
        socketInstance.on('connect', () => {
          socketInstance.emit('join-room', 'all-users');
        });

        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    if (socket) {
      socket.disconnect();
    }
    localStorage.removeItem('token');
    setUser(null);
    setSocket(null);
  };

  const hasRole = (roles) => {
    return user && roles.includes(user.rol);
  };

  const value = {
    user,
    login,
    logout,
    hasRole,
    socket,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};