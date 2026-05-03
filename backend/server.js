const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const pacientesRoutes = require('./routes/pacientes.routes');
const citasRoutes = require('./routes/citas.routes');
const sesionesRoutes = require('./routes/sesiones.routes');
const inventarioRoutes = require('./routes/inventario.routes');
const cajaRoutes = require('./routes/caja.routes');
const serviciosRoutes = require('./routes/servicios.routes');
const cabinasRoutes = require('./routes/cabinas.routes');
const paymentRoutes = require('./payment-gateway/routes/payment.routes');
const turnosRoutes = require('./routes/turnos.routes');
const medicamentosRoutes = require('./routes/medicamentos.routes');
const prediccionesRoutes = require('./routes/predicciones.routes');
const optimizacionRoutes = require('./routes/optimizacion.routes');
const chatbotRoutes = require('./routes/chatbot.routes');
const analisisRoutes = require('./routes/analisis.routes');
const reconocimientoVozRoutes = require('./routes/reconocimientoVoz.routes');
const iavisionRoutes = require('./routes/iavision.routes');
const alertasStockRoutes = require('./routes/alertasStock.routes');
const recordatoriosRoutes = require('./routes/recordatorios.routes');
const sentimientoPacienteRoutes = require('./routes/sentimientoPaciente.routes');
const sugerenciasCitasRoutes = require('./routes/sugerenciasCitas.routes');

// FASE 5: Infraestructura y Escalabilidad
const analyticsRoutes = require('./routes/analytics.routes');
const abTestingRoutes = require('./routes/ab-testing.routes');
const deploymentRoutes = require('./routes/deployment.routes');
const cdnRoutes = require('./routes/cdn.routes');
const WebSocketService = require('./services/websocket.service');

// FASE 6: Seguridad y Cumplimiento
const securityRoutes = require('./routes/security.routes');

// FASE 7: Monetización y Negocio
const monetizationRoutes = require('./routes/monetization.routes');
const payPerUseRoutes = require('./routes/pay-per-use.routes');
const adminBusinessRoutes = require('./routes/admin-business.routes');

// Configuración de CORS para producción
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://centro-salud.agentesia.cloud']
  : ['http://localhost:5173', 'http://localhost:5173'];

const app = express();
const server = http.createServer(app);

// Inicializar WebSocket Service completo
const wsService = new WebSocketService(server);
const io = wsService.io;

const corsOptions = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/sesiones', sesionesRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/caja', cajaRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/cabinas', cabinasRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/turnos', turnosRoutes);
app.use('/api/medicamentos', medicamentosRoutes);
app.use('/api/predicciones', prediccionesRoutes);
app.use('/api/optimizaciones', optimizacionRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/analisis', analisisRoutes);
app.use('/api/reconocimiento-voz', reconocimientoVozRoutes);
app.use('/api/iavision', iavisionRoutes);
app.use('/api/alertasStock', alertasStockRoutes);
app.use('/api/recordatorios', recordatoriosRoutes);
app.use('/api/sentimientoPaciente', sentimientoPacienteRoutes);
app.use('/api/sugerenciasCitas', sugerenciasCitasRoutes);

// FASE 5: Rutas de Infraestructura
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ab-testing', abTestingRoutes);
app.use('/api/deployment', deploymentRoutes);
app.use('/api/cdn', cdnRoutes);

// FASE 6: Rutas de Seguridad y Cumplimiento
app.use('/api/security', securityRoutes);

// FASE 7: Rutas de Monetización y Negocio
app.use('/api/monetization', monetizationRoutes);
app.use('/api/pay-per-use', payPerUseRoutes);
app.use('/api/admin', adminBusinessRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// FASE 5: Endpoints de WebSocket
app.get('/socketio/status', (req, res) => {
  res.json({
    success: true,
    connectedUsers: wsService.getConnectedUsers().length,
    rooms: wsService.getRoomStats(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 WebSocket Service initialized`);
  console.log(`📊 Analytics Service initialized`);
  console.log(`🧪 A/B Testing Service initialized`);
  console.log(`🚀 Deployment Service initialized`);
  console.log(`🌐 CDN Service initialized`);
  console.log(`🛡️ Security & Compliance Service initialized`);
});

module.exports = { app, io, wsService };