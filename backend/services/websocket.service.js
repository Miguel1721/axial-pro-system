/**
 * Servicio de WebSocket para comunicación en tiempo real
 * Implementa actualizaciones instantáneas para el sistema médico
 */

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

class WebSocketService {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    // Mapa de usuarios conectados
    this.connectedUsers = new Map();

    // Mapa de salas por tipo
    this.rooms = {
      'alertas': new Set(),
      'citas': new Set(),
      'turnos': new Set(),
      'historial': new Set(),
      'general': new Set()
    };

    this.initialize();
  }

  initialize() {
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'axial_clinic_secret');
        socket.user = decoded;
        next();
      } catch (err) {
        next(new Error('Authentication error: Invalid token'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`🔌 Usuario conectado: ${socket.user.email || socket.user.id}`);

      // Unir usuario a sala general
      socket.join('general');
      this.connectedUsers.set(socket.id, {
        user: socket.user,
        rooms: new Set(['general']),
        connectedAt: new Date()
      });

      // Unir a salas específicas según rol
      this.joinUserToRooms(socket);

      // Eventos de sala
      this.setupRoomEvents(socket);

      // Eventos de usuario
      this.setupUserEvents(socket);

      // Enviar estado inicial
      this.sendStatusUpdate(socket);

      // Notificación de conexión
      this.broadcastToUser(socket.user.id, {
        type: 'connection',
        message: 'Conectado al sistema en tiempo real',
        timestamp: new Date().toISOString()
      });

      socket.on('disconnect', () => {
        console.log(`🔌 Usuario desconectado: ${socket.user.email || socket.user.id}`);
        this.handleDisconnection(socket);
      });
    });
  }

  joinUserToRooms(socket) {
    const { rol } = socket.user;

    // Unir a salas según rol
    switch (rol) {
      case 'medico':
        socket.join('medicos');
        socket.join('alertas');
        socket.join('citas');
        break;
      case 'recepcionista':
        socket.join('recepcion');
        socket.join('turnos');
        break;
      case 'admin':
        socket.join('admin');
        socket.join('alertas');
        socket.join('citas');
        socket.join('turnos');
        socket.join('general');
        break;
      case 'paciente':
        socket.join('pacientes');
        socket.join(`paciente_${socket.user.id}`);
        break;
    }

    // Unir a sala personal del usuario
    socket.join(`user_${socket.user.id}`);
  }

  setupRoomEvents(socket) {
    // Alertas de stock
    socket.on('join:alertas', () => {
      socket.join('alertas');
      this.connectedUsers.get(socket.id).rooms.add('alertas');
      socket.emit('joined:alertas', { message: 'Unido a alertas en tiempo real' });
    });

    socket.on('leave:alertas', () => {
      socket.leave('alertas');
      this.connectedUsers.get(socket.id).rooms.delete('alertas');
      socket.emit('left:alertas', { message: 'Salido de alertas' });
    });

    // Citas y turnos
    socket.on('join:citas', () => {
      socket.join('citas');
      this.connectedUsers.get(socket.id).rooms.add('citas');
      socket.emit('joined:citas', { message: 'Unido a citas en tiempo real' });
    });

    socket.on('join:turnos', () => {
      socket.join('turnos');
      this.connectedUsers.get(socket.id).rooms.add('turnos');
      socket.emit('joined:turnos', { message: 'Unido a turnos en tiempo real' });
    });

    // Chat de consultas
    socket.on('join:consulta', (consultaId) => {
      socket.join(`consulta_${consultaId}`);
      socket.emit('joined:consulta', { consultaId, message: 'Unido a consulta' });
    });

    socket.on('leave:consulta', (consultaId) => {
      socket.leave(`consulta_${consultaId}`);
      socket.emit('left:consulta', { consultaId, message: 'Salido de consulta' });
    });

    // Actualizaciones de inventario
    socket.on('join:inventario', () => {
      socket.join('inventario');
      this.connectedUsers.get(socket.id).rooms.add('inventario');
      socket.emit('joined:inventario', { message: 'Unido a inventario en tiempo real' });
    });
  }

  setupUserEvents(socket) {
    // Marcar alerta como vista
    socket.on('alerta:vista', (alertaId) => {
      this.broadcastToRoom('alertas', {
        type: 'alertaActualizada',
        alertaId,
        vistoPor: socket.user.id,
        timestamp: new Date().toISOString()
      });

      // Actualizar en la base de datos (simulado)
      console.log(`Alerta ${alertaId} vista por ${socket.user.email}`);
    });

    // Nueva cita agendada
    socket.on('cita:nueva', (citaData) => {
      this.broadcastToRoom('citas', {
        type: 'nuevaCita',
        cita: citaData,
        notificacion: `Nueva cita agendada para ${citaData.paciente.nombre}`,
        timestamp: new Date().toISOString()
      });
    });

    // Cambio en turno
    socket.on('turno:actualizado', (turnoData) => {
      this.broadcastToRoom('turnos', {
        type: 'turnoActualizado',
        turno: turnoData,
        notificacion: `Turno ${turnoData.numero} actualizado`,
        timestamp: new Date().toISOString()
      });

      // Notificación específica para el paciente
      this.broadcastToUser(turnoData.pacienteId, {
        type: 'turnoLlamado',
        turno: turnoData,
        message: 'Su turno ha sido llamado',
        timestamp: new Date().toISOString()
      });
    });

    // Mensaje de consulta
    socket.on('consulta:mensaje', (data) => {
      this.broadcastToRoom(`consulta_${data.consultaId}`, {
        type: 'nuevoMensaje',
        mensaje: data.mensaje,
        autor: socket.user.nombre,
        timestamp: new Date().toISOString()
      });
    });

    // Emergencia
    socket.on('emergencia', (data) => {
      this.broadcastToRoom('general', {
        type: 'emergencia',
        ...data,
        timestamp: new Date().toISOString()
      });

      // Notificación push a todos los médicos
      this.io.to('medicos').emit('push:notification', {
        type: 'emergencia',
        titulo: '🚨 Emergencia',
        mensaje: data.mensaje,
        severidad: 'critica',
        timestamp: new Date().toISOString()
      });
    });
  }

  sendStatusUpdate(socket) {
    const status = {
      type: 'status',
      user: {
        id: socket.user.id,
        nombre: socket.user.nombre,
        rol: socket.user.rol
      },
      connectedUsers: this.connectedUsers.size,
      rooms: Array.from(this.connectedUsers.get(socket.id)?.rooms || []),
      timestamp: new Date().toISOString()
    };

    socket.emit('status', status);
  }

  handleDisconnection(socket) {
    const user = this.connectedUsers.get(socket.id);
    if (user) {
      this.connectedUsers.delete(socket.id);
      this.broadcastToUser(socket.user.id, {
        type: 'disconnection',
        message: 'Usuario desconectado',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Métodos públicos
  sendToUser(userId, event, data) {
    this.io.to(`user_${userId}`).emit(event, data);
  }

  broadcastToUser(userId, data) {
    this.io.to(`user_${userId}`).emit('notification', data);
  }

  broadcastToRoom(room, data) {
    this.io.to(room).emit('broadcast', data);
  }

  sendAlert(alert) {
    // Enviar alerta a salas relevantes
    if (alert.tipo_alerta === 'bajo_stock' || alert.tipo_alerta === 'sin_stock') {
      this.broadcastToRoom('alertas', {
        type: 'nuevaAlerta',
        alerta: alert,
        timestamp: new Date().toISOString()
      });
    }

    // Enviar notificación a administradores
    this.io.to('admin').emit('push:notification', {
      type: 'alerta',
      titulo: `🚨 ${alert.titulo}`,
      mensaje: alert.descripcion,
      severidad: alert.severidad,
      data: alert,
      timestamp: new Date().toISOString()
    });
  }

  getConnectedUsers() {
    return Array.from(this.connectedUsers.values()).map(user => ({
      id: user.user.id,
      nombre: user.user.nombre,
      rol: user.user.rol,
      connectedAt: user.connectedAt,
      rooms: Array.from(user.rooms)
    }));
  }

  getRoomStats() {
    const stats = {};
    for (const [roomName, room] of Object.entries(this.rooms)) {
      stats[roomName] = room.size;
    }
    return stats;
  }
}

module.exports = WebSocketService;