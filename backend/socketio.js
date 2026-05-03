/**
 * Configuración principal de Socket.io
 */

const express = require('express');
const http = require('http');
const WebSocketService = require('./services/websocket.service');

const app = express();
const server = http.createServer(app);

// Inicializar servicio WebSocket
const wsService = new WebSocketService(server);

// Exportar tanto el app como el servidor para Socket.io
module.exports = { app, server, wsService };

// Ruta de estado para Socket.io
app.get('/socketio/status', (req, res) => {
  res.json({
    connectedUsers: wsService.getConnectedUsers().length,
    rooms: wsService.getRoomStats(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});