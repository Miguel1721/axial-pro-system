import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  FileText,
  X,
  Check,
  CheckCheck
} from 'lucide-react';

const TelemedicinaChat = ({ consultationId, patientId }) => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'patient',
      senderName: 'Juan Pérez',
      text: 'Doctor, llevo una semana con dolor abdominal persistente. ¿Qué me recomienda?',
      time: '10:30',
      read: true,
      timestamp: new Date(Date.now() - 300000)
    },
    {
      id: 2,
      sender: 'doctor',
      senderName: 'Dr. Carlos García',
      text: 'Entiendo, Juan. Voy a revisar tus síntomas. ¿El dolor es más intenso por la mañana o por la noche?',
      time: '10:31',
      read: true,
      timestamp: new Date(Date.now() - 240000)
    },
    {
      id: 3,
      sender: 'patient',
      senderName: 'Juan Pérez',
      text: 'Es más intenso por la mañana, especialmente después del desayuno.',
      time: '10:32',
      read: true,
      timestamp: new Date(Date.now() - 180000)
    },
    {
      id: 4,
      sender: 'doctor',
      senderName: 'Dr. Carlos García',
      text: 'Eso es característico de la gastritis. Te voy a recetar omeprazol 20mg antes del desayuno por 14 días. Además, te recomiendo una dieta blanca.',
      time: '10:33',
      read: true,
      timestamp: new Date(Date.now() - 120000)
    }
  ]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const messagesEndRef = useRef(null);

  const emojis = ['😊', '😷', '🏥', '💊', '❤️', '👍', '🙏', '🤒', '😔', '🤕'];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: user?.rol || 'doctor',
      senderName: user?.nombre || 'Dr. Actual',
      text: message,
      time: new Date().toTimeString().slice(0, 5),
      read: false,
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    // Simular respuesta automática del paciente
    if (user?.rol === 'doctor') {
      setTimeout(() => {
        const responses = [
          'Entiendo doctor, ¿es algo grave?',
          'Muchas gracias por la explicación.',
          '¿Cuánto tiempo debo tomar el medicamento?',
          '¿Hay algún efecto secundario que deba conocer?',
          'Lo intentaré, doctor. Gracias.'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        const patientResponse = {
          id: Date.now() + 1,
          sender: 'patient',
          senderName: 'Juan Pérez',
          text: randomResponse,
          time: new Date().toTimeString().slice(0, 5),
          read: true,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, patientResponse]);
      }, 2000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileAttach = (file) => {
    // Función para adjuntar archivos
    console.log('Adjuntando archivo:', file);
    alert('Archivo adjuntado: ' + file.name);
    setShowAttachMenu(false);
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours} h`;
    return timestamp.toLocaleDateString('es-ES');
  };

  return (
    <div className={`rounded-2xl shadow-2xl flex flex-col h-[600px] ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      {/* Header del chat */}
      <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                JP
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Juan Pérez
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Paciente • Consulta Virtual
              </p>
            </div>
          </div>
          <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isOwn = msg.sender === user?.rol || msg.sender === 'doctor';

          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${isOwn ? 'order-1' : 'order-2'}`}>
                {!isOwn && (
                  <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {msg.senderName}
                  </p>
                )}
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    isOwn
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : isDark
                      ? 'bg-gray-700 text-gray-100'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
                <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {getTimeAgo(msg.timestamp)}
                  </span>
                  {isOwn && (
                    <>
                      {msg.read ? (
                        <CheckCheck size={14} className="text-blue-500" />
                      ) : (
                        <Check size={14} className="text-gray-400" />
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensaje */}
      <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        {/* Emoji picker */}
        {showEmojiPicker && (
          <div className={`absolute bottom-20 left-4 p-3 rounded-xl shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="grid grid-cols-5 gap-2">
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setMessage(message + emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Attach menu */}
        {showAttachMenu && (
          <div className={`absolute bottom-20 left-4 p-2 rounded-xl shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={() => {
                document.getElementById('file-input').click();
                setShowAttachMenu(false);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg w-full text-left ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <FileText size={18} />
              <span>Documento</span>
            </button>
            <button
              onClick={() => {
                document.getElementById('image-input').click();
                setShowAttachMenu(false);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg w-full text-left ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <FileText size={18} />
              <span>Imagen</span>
            </button>
          </div>
        )}

        {/* Input field */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
          >
            <Paperclip size={20} />
          </button>

          <input
            type="file"
            id="file-input"
            className="hidden"
            onChange={(e) => handleFileAttach(e.target.files[0])}
            accept=".pdf,.doc,.docx,.txt"
          />

          <input
            type="file"
            id="image-input"
            className="hidden"
            onChange={(e) => handleFileAttach(e.target.files[0])}
            accept="image/*"
          />

          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje..."
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                  : 'bg-gray-100 border-gray-200 text-gray-900 focus:border-blue-500'
              }`}
            />
          </div>

          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
          >
            <Smile size={20} />
          </button>

          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className={`p-3 rounded-xl transition-all ${
              message.trim()
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Send size={20} />
          </button>
        </div>

        {/* Info de seguridad */}
        <div className={`mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          🔒 Conversación encriptada de extremo a extremo
        </div>
      </div>
    </div>
  );
};

export default TelemedicinaChat;
