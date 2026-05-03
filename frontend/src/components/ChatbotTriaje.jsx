import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  Send,
  X,
  Minimize2,
  Maximize2,
  Bot,
  User,
  Activity,
  Settings,
  Info
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ChatbotTriaje = ({ pacienteInfo = {} }) => {
  const { isDark } = useTheme();
  const [minimizado, setMinimizado] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [conversacion, setConversacion] = useState([]);
  const [escribiendo, setEscribiendo] = useState(false);
  const [configuracion, setConfiguracion] = useState(null);
  const [mostrarConfig, setMostrarConfig] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!minimizado && conversacion.length === 0) {
      iniciarConversacion();
    }
  }, [minimizado]);

  useEffect(() => {
    scrollToBottom();
  }, [conversacion]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const iniciarConversacion = async () => {
    try {
      setEscribiendo(true);
      const API_URL = import.meta.env.VITE_API_URL || 'https://centro-salud.agentesia.cloud:18001';
      const response = await fetch(`${API_URL}/api/chatbot/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paciente_info: pacienteInfo })
      });
      const data = await response.json();

      if (data.success) {
        agregarMensaje('bot', data.data.respuesta, {
          clasificacion: data.data.clasificacion,
          urgencia: data.data.urgencia,
          accionSugerida: data.data.accion_sugerida
        });
      }
    } catch (error) {
      console.error('Error iniciando conversación:', error);
      agregarMensaje('bot', '👋 **Bienvenido al Asistente Virtual**\n\nLo siento, hay un problema de conexión. Por favor, intente nuevamente.');
    } finally {
      setEscribiendo(false);
    }
  };

  const enviarMensaje = async () => {
    if (!mensaje.trim()) return;

    const mensajeUsuario = mensaje;
    setMensaje('');
    agregarMensaje('usuario', mensajeUsuario);

    try {
      setEscribiendo(true);
      const API_URL = import.meta.env.VITE_API_URL || 'https://centro-salud.agentesia.cloud:18001';
      const response = await fetch(`${API_URL}/api/chatbot/enviar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensaje: mensajeUsuario,
          paciente_info: pacienteInfo
        })
      });
      const data = await response.json();

      if (data.success) {
        agregarMensaje('bot', data.data.respuesta, {
          clasificacion: data.data.clasificacion,
          urgencia: data.data.urgencia,
          accionSugerida: data.data.accion_sugerida,
          fuente: data.data.fuente
        });
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      agregarMensaje('bot', 'Lo siento, hubo un error al procesar su mensaje. Por favor, intente nuevamente.');
    } finally {
      setEscribiendo(false);
    }
  };

  const agregarMensaje = (tipo, texto, metadata = {}) => {
    setConversacion(prev => [...prev, {
      id: Date.now(),
      tipo,
      texto,
      timestamp: new Date(),
      metadata
    }]);
  };

  const getUrgenciaColor = (urgencia) => {
    const colores = {
      'alta': 'border-red-500 bg-red-50 dark:bg-red-900/20',
      'media': 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
      'baja': 'border-green-500 bg-green-50 dark:bg-green-900/20'
    };
    return colores[urgencia] || colores.baja;
  };

  const getFuenteLabel = (fuente) => {
    if (fuente === 'simulacion') {
      return <span className="text-xs text-gray-500">(Modo Simulación)</span>;
    }
    return <span className="text-xs text-blue-500">(Chatbot Externo)</span>;
  };

  const cargarConfiguracion = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://centro-salud.agentesia.cloud:18001';
      const response = await fetch(`${API_URL}/api/chatbot/configuracion`);
      const data = await response.json();

      if (data.success) {
        setConfiguracion(data.data);
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
    }
  };

  if (minimizado) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => {
            setMinimizado(false);
            cargarConfiguracion();
          }}
          className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <MessageCircle size={24} />
          <div className="text-left">
            <p className="font-semibold">Asistente Virtual</p>
            <p className="text-xs opacity-90">Disponible 24/7</p>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-2xl">
        <div className="flex items-center gap-3">
          <Bot size={24} />
          <div>
            <p className="font-semibold">Asistente Virtual</p>
            {configuracion && (
              <p className="text-xs opacity-90">
                {configuracion.modo === 'simulacion' ? 'Modo Simulación' : 'Conectado'}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMostrarConfig(!mostrarConfig)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Configuración"
          >
            <Settings size={18} />
          </button>
          <button
            onClick={() => setMinimizado(true)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Minimizar"
          >
            <Minimize2 size={18} />
          </button>
          <button
            onClick={() => {
              setMinimizado(true);
              setConversacion([]);
            }}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Cerrar"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Configuración */}
      {mostrarConfig && configuracion && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Modo:</span>
              <span className={`px-2 py-1 rounded ${configuracion.modo === 'simulacion' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                {configuracion.modo.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">API Externa:</span>
              <span className={configuracion.apiKeyConfigurada ? 'text-green-600' : 'text-gray-600'}>
                {configuracion.apiKeyConfigurada ? 'Configurada ✓' : 'No configurada'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">URL API:</span>
              <span className="text-gray-600 text-xs truncate max-w-[200px]">
                {configuracion.apiUrl || 'No configurada'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversacion.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex gap-3 max-w-[80%] ${
                msg.tipo === 'usuario' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {msg.tipo === 'bot' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <Bot size={16} className="text-white" />
                  </div>
                </div>
              )}
              <div
                className={`px-4 py-3 rounded-2xl ${
                  msg.tipo === 'usuario'
                    ? 'bg-blue-500 text-white'
                    : `${getUrgenciaColor(msg.metadata.urgencia || 'baja')} border`
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.texto}</p>
                {msg.metadata.fuente && (
                  <div className="mt-2">
                    {getFuenteLabel(msg.metadata.fuente)}
                  </div>
                )}
                {msg.metadata.urgencia && msg.metadata.urgencia !== 'baja' && (
                  <div className={`mt-2 text-xs font-semibold ${
                    msg.metadata.urgencia === 'alta' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    <Activity size={12} className="inline mr-1" />
                    Urgencia: {msg.metadata.urgencia.toUpperCase()}
                  </div>
                )}
              </div>
              {msg.tipo === 'usuario' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                    <User size={16} className="text-gray-600 dark:text-gray-300" />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {escribiendo && (
          <div className="flex justify-start">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div className="px-4 py-3 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !escribiendo && enviarMensaje()}
            placeholder="Escribe tu mensaje..."
            disabled={escribiendo}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
          />
          <button
            onClick={enviarMensaje}
            disabled={escribiendo || !mensaje.trim()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send size={18} />
            Enviar
          </button>
        </div>

        {/* Info */}
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
          <Info size={12} />
          <span>Este asistente usa IA para clasificar urgencias. Para emergencias reales, llame al 911.</span>
        </div>
      </div>
    </div>
  );
};

export default ChatbotTriaje;
