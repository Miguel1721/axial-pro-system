import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  Save,
  FileText,
  Volume2,
  HelpCircle,
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2,
  Download
} from 'lucide-react';

const ReconocimientoVoz = ({ pacienteId }) => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [isListening, setIsListening] = useState(false);
  const [transcriptions, setTranscriptions] = useState([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState(null);
  const [commands, setCommands] = useState([]);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [audioStream, setAudioStream] = useState(null);

  const recognitionRef = useRef(null);
  const animationRef = useRef(null);

  // Comandos disponibles
  const availableCommands = [
    { comando: 'guardar', accion: 'Guardar nota actual' },
    { comando: 'nueva nota', accion: 'Crear nueva nota' },
    { comando: 'siguiente paciente', accion: 'Ir al siguiente paciente' },
    { comando: 'paciente anterior', accion: 'Ir al paciente anterior' },
    { comando: 'exportar', accion: 'Exportar transcripciones' },
    { comando: 'ayuda', accion: 'Mostrar ayuda' },
    { comando: 'anadir nota', accion: 'Añadir nota médica' },
    { comando: 'receta medica', accion: 'Crear receta médica' },
    { comando: 'cita', accion: 'Gestionar cita' },
    { comando: 'historial', accion: 'Ver historial paciente' }
  ];

  useEffect(() => {
    checkSupport();
    loadCommands();

    return () => {
      if (isListening) {
        stopListening();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (pacienteId) {
      loadTranscripciones();
    }
  }, [pacienteId]);

  const checkSupport = () => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      recognitionRef.current = new webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setError(null);
        console.log('Reconocimiento iniciado');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        console.log('Reconocimiento detenido');
      };

      recognitionRef.current.onresult = (event) => {
        handleResult(event);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Error:', event.error);
        setError(`Error de reconocimiento: ${event.error}`);
        setIsListening(false);
      };

      setIsSupported(true);
    } else {
      setIsSupported(false);
      setError('El reconocimiento de voz no es compatible con tu navegador');
    }
  };

  const loadCommands = async () => {
    try {
      const response = await fetch('/api/reconocimiento-voz/comandos');
      const data = await response.json();
      if (data.success) {
        setCommands(data.data);
      }
    } catch (error) {
      console.error('Error cargando comandos:', error);
      setCommands(availableCommands);
    }
  };

  const loadTranscripciones = async () => {
    try {
      const response = await fetch(`/api/reconocimiento-voz/transcripciones?pacienteId=${pacienteId}`);
      const data = await response.json();
      if (data.success) {
        setTranscriptions(data.data);
      }
    } catch (error) {
      console.error('Error cargando transcripciones:', error);
    }
  };

  const handleResult = (event) => {
    let final = '';
    let interim = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        final += transcript;
        saveTranscription(transcript, true);
      } else {
        interim += transcript;
      }
    }

    if (final) {
      setFinalTranscript(prev => prev + final + ' ');
      setCurrentTranscript('');

      // Procesar comando
      processCommand(final);
    }

    setCurrentTranscript(interim);
  };

  const processCommand = (text) => {
    const normalizedText = text.toLowerCase().trim();
    console.log('Procesando comando:', normalizedText);

    // Guardar como nota
    saveAsNote(text);
  };

  const saveAsNote = async (text) => {
    const note = {
      id: Date.now(),
      title: `Nota de voz - ${new Date().toLocaleDateString()}`,
      content: text,
      type: 'voice_note',
      createdAt: new Date().toISOString(),
      pacienteId: pacienteId
    };

    try {
      // Aquí se guardaría en la API
      console.log('Nota guardada:', note);

      // Agregar a transcripciones
      setTranscriptions(prev => [note, ...prev]);
    } catch (error) {
      console.error('Error guardando nota:', error);
    }
  };

  const startListening = async () => {
    if (!recognitionRef.current) {
      checkSupport();
      return;
    }

    try {
      // Solicitar permisos de micrófono
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);

      // Configurar análisis de audio
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = context.createAnalyser();
      const source = context.createMediaStreamSource(stream);

      source.connect(analyser);
      setAudioContext(context);
      setAnalyser(analyser);

      // Iniciar reconocimiento
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error iniciando reconocimiento:', error);
      setError('No se pudo acceder al micrófono');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }

    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
    }

    if (audioContext) {
      audioContext.close();
      setAudioContext(null);
      setAnalyser(null);
    }
  };

  const exportTranscriptions = () => {
    const dataStr = JSON.stringify(transcriptions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `transcripciones-voz-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const clearTranscriptions = async () => {
    try {
      await fetch('/api/reconocimiento-voz/transcripciones', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dias: 7 })
      });

      setTranscriptions([]);
    } catch (error) {
      console.error('Error limpiando transcripciones:', error);
    }
  };

  const getVolumeLevel = () => {
    if (!analyser || !isListening) return 0;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    return Math.round((average / 255) * 100);
  };

  const renderVolumeBar = () => {
    if (!isListening) return null;

    const volume = getVolumeLevel();
    const volumeColor = volume > 70 ? 'bg-red-500' :
                       volume > 40 ? 'bg-yellow-500' : 'bg-green-500';

    return (
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className={`h-2 rounded-full transition-all duration-100 ${volumeColor}`}
          style={{ width: `${volume}%` }}
        ></div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Reconocimiento de Voz
          </h2>
          <div className="flex items-center gap-2">
            {isSupported ? (
              <CheckCircle size={20} className="text-green-500" />
            ) : (
              <AlertCircle size={20} className="text-red-500" />
            )}
          </div>
        </div>

        {/* Estado del sistema */}
        {!isSupported && (
          <div className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-red-900/20' : 'bg-red-100'}`}>
            <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-700'}`}>
              El reconocimiento de voz no es compatible con tu navegador. Usa Chrome, Firefox o Safari.
            </p>
          </div>
        )}

        {error && (
          <div className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-red-900/20' : 'bg-red-100'}`}>
            <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-700'}`}>
              {error}
            </p>
          </div>
        )}

        {/* Controles principales */}
        <div className="flex items-center gap-4">
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={!isSupported}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isListening ? (
              <>
                <Square size={20} />
                Detener
              </>
            ) : (
              <>
                <Mic size={20} />
                Iniciar Reconocimiento
              </>
            )}
          </button>

          {pacienteId && (
            <button
              onClick={exportTranscriptions}
              className="flex items-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all"
            >
              <Download size={20} />
              Exportar
            </button>
          )}
        </div>

        {/* Indicador de volumen */}
        {isListening && renderVolumeBar()}

        {/* Transcripción actual */}
        {isListening && (
          <div className={`mt-4 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Escuchando...
            </p>
            <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {currentTranscript}
            </p>
          </div>
        )}

        {/* Transcripción final */}
        {finalTranscript && (
          <div className={`mt-4 p-4 rounded-lg ${isDark ? 'bg-green-900/20' : 'bg-green-100'}`}>
            <p className={`text-sm font-medium mb-2 ${isDark ? 'text-green-400' : 'text-green-700'}`}>
              Transcripción final:
            </p>
            <p className={`text-lg ${isDark ? 'text-green-200' : 'text-green-900'}`}>
              {finalTranscript}
            </p>
          </div>
        )}
      </div>

      {/* Historial de transcripciones */}
      <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Historial de Transcripciones
          </h3>
          {transcriptions.length > 0 && (
            <button
              onClick={clearTranscriptions}
              className="flex items-center gap-1 px-3 py-1 text-red-600 text-sm rounded-lg hover:bg-red-50 transition-all"
            >
              <Trash2 size={16} />
              Limpiar
            </button>
          )}
        </div>

        {transcriptions.length === 0 ? (
          <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <FileText size={48} className="mx-auto mb-2 opacity-50" />
            <p>No hay transcripciones aún</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {transcriptions.map((transcription) => (
              <div
                key={transcription.id}
                className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {transcription.title}
                  </h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    transcription.type === 'voice_note' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {transcription.type}
                  </span>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  {transcription.content}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {new Date(transcription.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comandos disponibles */}
      <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Comandos Voz Disponibles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {commands.map((cmd, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
            >
              <code className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                "{cmd.comando}"
              </code>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {cmd.accion}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReconocimientoVoz;