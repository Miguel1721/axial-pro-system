import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Monitor,
  MessageCircle,
  Users,
  Settings,
  Maximize2,
  Camera,
  CameraOff
} from 'lucide-react';

const TelemedicinaVideo = ({ consultationId, onEndCall }) => {
  const { isDark } = useTheme();
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [participants, setParticipants] = useState([
    { id: 1, name: 'Dr. Carlos García', role: 'doctor', online: true }
  ]);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);

  useEffect(() => {
    startConsultation();
    return () => {
      stopConsultation();
    };
  }, []);

  useEffect(() => {
    let interval;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const startConsultation = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setTimeout(() => {
        setIsCallActive(true);
        setParticipants([
          ...participants,
          { id: 2, name: 'Juan Pérez', role: 'patient', online: true }
        ]);
      }, 1000);

    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('No se pudo acceder a la cámara y micrófono. Verifica los permisos.');
    }
  };

  const stopConsultation = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    setIsCallActive(false);
    setIsVideoEnabled(false);
    setIsAudioEnabled(false);
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });

        const videoTrack = screenStream.getVideoTracks()[0];
        videoTrack.onended = () => {
          setIsScreenSharing(false);
        };

        setIsScreenSharing(true);
      } else {
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  const handleEndCall = () => {
    if (confirm('¿Terminar consulta virtual?')) {
      stopConsultation();
      onEndCall();
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 shadow-2xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">📹 Consulta Virtual</h2>
            <p className="text-purple-100">Videoconferencia con paciente en tiempo real</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-purple-100">Duración</p>
              <p className="text-3xl font-bold font-mono">{formatDuration(callDuration)}</p>
            </div>
            <div className={`px-4 py-2 rounded-lg ${isCallActive ? 'bg-green-500' : 'bg-yellow-500'}`}>
              {isCallActive ? 'En Progreso' : 'Conectando...'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`rounded-2xl overflow-hidden shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-gray-900'}`}>
          <div className="relative aspect-video bg-black">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${isDark ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'}`}>
                Tú (Dr. Carlos García)
              </div>
              {!isVideoEnabled && (
                <div className="px-3 py-1 rounded-full text-xs font-semibold bg-red-600 text-white">
                  Video apagado
                </div>
              )}
              {!isAudioEnabled && (
                <div className="px-3 py-1 rounded-full text-xs font-semibold bg-red-600 text-white">
                  Micrófono apagado
                </div>
              )}
            </div>
            {!isAudioEnabled && (
              <div className="absolute bottom-4 left-4">
                <MicOff size={32} className="text-red-500" />
              </div>
            )}
          </div>
        </div>

        <div className={`rounded-2xl overflow-hidden shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-gray-900'}`}>
          <div className="relative aspect-video bg-black">
            {!isCallActive ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-white text-lg">Conectando con paciente...</p>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white text-lg">Video del paciente</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`rounded-2xl p-6 shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-2xl transition-all ${isVideoEnabled ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-red-500 text-white hover:bg-red-600'}`}
          >
            {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
          </button>

          <button
            onClick={toggleAudio}
            className={`p-4 rounded-2xl transition-all ${isAudioEnabled ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-500 text-white hover:bg-red-600'}`}
          >
            {isAudioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`p-4 rounded-2xl transition-all ${isScreenSharing ? 'bg-purple-500 text-white hover:bg-purple-600' : (isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}`}
          >
            <Monitor size={24} />
          </button>

          <button className={`p-4 rounded-2xl transition-all ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            <MessageCircle size={24} />
          </button>

          <button className={`p-4 rounded-2xl transition-all ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            <Settings size={24} />
          </button>

          <button
            onClick={handleEndCall}
            className="p-4 rounded-2xl bg-red-600 text-white hover:bg-red-700 transition-all"
          >
            <PhoneOff size={24} />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {participants.length}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Participantes
            </p>
          </div>
          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {isCallActive ? 'HD' : '--'}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Calidad
            </p>
          </div>
          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {isScreenSharing ? 'Sí' : 'No'}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Compartiendo
            </p>
          </div>
        </div>
      </div>

      <div className={`rounded-2xl p-6 shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Participantes ({participants.length})
        </h3>
        <div className="space-y-2">
          {participants.map((participant) => (
            <div key={participant.id} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {participant.name.charAt(0)}
                </div>
                <div>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {participant.name}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {participant.role === 'doctor' ? 'Médico' : 'Paciente'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {participant.online && (
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                )}
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {participant.online ? 'En línea' : 'Desconectado'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TelemedicinaVideo;
