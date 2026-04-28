const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3002;
const JWT_SECRET = 'test_secret_key';

app.use(cors());
app.use(express.json());

// Login mock
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Credenciales de prueba
  if (email === 'admin@axial.com' && password === 'admin123') {
    const token = jwt.sign(
      { id: 1, email: email, rol: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      token,
      user: {
        id: 1,
        nombre: 'Dr. Admin',
        email: email,
        rol: 'admin'
      }
    });
  }

  return res.status(401).json({ error: 'Credenciales inválidas' });
});

// Endpoint de perfil
app.get('/api/auth/profile', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({
      id: decoded.id,
      nombre: 'Dr. Admin',
      email: decoded.email,
      rol: decoded.rol
    });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

// Endpoints mock adicionales
app.get('/api/pacientes', (req, res) => {
  res.json([
    { id: 1, nombre: 'Juan Pérez', telefono: '3001234567', email: 'juan@email.com', ultima_visita: '2024-04-27' },
    { id: 2, nombre: 'María García', telefono: '3007654321', email: 'maria@email.com', ultima_visita: '2024-04-26' }
  ]);
});

app.get('/api/citas', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  res.json([
    { id: 1, paciente_id: 1, paciente_nombre: 'Juan Pérez', servicio_id: 1, servicio_nombre: 'Axial Pro', fecha_hora: `${today}T10:00:00`, estado: 'confirmada', abono_pagado: 0 },
    { id: 2, paciente_id: 2, paciente_nombre: 'María García', servicio_id: 2, servicio_nombre: 'Fisioterapia', fecha_hora: `${today}T14:00:00`, estado: 'confirmada', abono_pagado: 0 }
  ]);
});

app.get('/api/servicios', (req, res) => {
  res.json([
    { id: 1, nombre: 'Axial Pro (Descompresión)', precio_base: 180000, comision_porcentaje: 0.20, requiere_parametros: true },
    { id: 2, nombre: 'Quiropraxia Especializada', precio_base: 120000, comision_porcentaje: 0.30, requiere_parametros: false },
    { id: 3, nombre: 'Fisioterapia Integral', precio_base: 100000, comision_porcentaje: 0.25, requiere_parametros: false }
  ]);
});

app.get('/api/sesiones', (req, res) => {
  res.json([]);
});

app.get('/api/cabinas', (req, res) => {
  res.json([
    { id: 1, nombre: 'Cabina 1 - Ajustes', estado: 'disponible' },
    { id: 2, nombre: 'Cabina 2 - Fisioterapia', estado: 'disponible' },
    { id: 3, nombre: 'Sala Axial Pro', estado: 'disponible' }
  ]);
});

app.get('/api/caja/cierre-caja', (req, res) => {
  res.json({
    citas: { total_citas: 25, total_abonos: 4500000, citas_hoy: 12, abonos_hoy: 2800000 },
    sesiones: { total_sesiones: 20, total_facturado: 3600000, sesiones_hoy: 8, facturado_hoy: 1440000 }
  });
});

app.get('/api/caja/bonos', (req, res) => {
  res.json([]);
});

app.get('/api/inventario', (req, res) => {
  res.json([
    { id: 1, nombre: 'Sábana Desechable', stock_actual: 45, stock_minimo: 20, unidad_medida: 'und', nivel_stock: 'suficiente' },
    { id: 2, nombre: 'Aceite de Masaje (1L)', stock_actual: 5, stock_minimo: 2, unidad_medida: 'lts', nivel_stock: 'suficiente' }
  ]);
});

app.get('/api/inventario/alertas', (req, res) => {
  res.json([
    { id: 1, producto: 'Sábana Desechable', alerta: 'Stock bajo - menos de 20 unidades' }
  ]);
});

app.listen(PORT, () => {
  console.log(`Mock server corriendo en puerto ${PORT}`);
  console.log(`Login: admin@axial.com / admin123`);
});