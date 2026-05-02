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

// Configuración de CORS para producción
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://centro-salud.agentesia.cloud']
  : ['http://localhost:5173', 'http://localhost:5173'];

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

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

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`Cliente ${socket.id} se unió a ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, io };