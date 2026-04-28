const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, nombre, telefono, email, fecha_nacimiento, diagnostico_principal, eva_promedio, tiene_rx, notas_crm, ultima_visita FROM pacientes ORDER BY nombre ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching pacientes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, requireRole(['admin', 'medico', 'recepcion']), async (req, res) => {
  try {
    const { nombre, telefono, email, fecha_nacimiento, diagnostico_principal, eva_promedio, notas_crm } = req.body;

    const result = await db.query(
      `INSERT INTO pacientes (nombre, telefono, email, fecha_nacimiento, diagnostico_principal, eva_promedio, notas_crm)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, nombre, telefono, email, fecha_nacimiento, diagnostico_principal, eva_promedio, tiene_rx, notas_crm`,
      [nombre, telefono, email, fecha_nacimiento, diagnostico_principal, eva_promedio, notas_crm]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating paciente:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM pacientes WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Paciente not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching paciente:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticateToken, requireRole(['admin', 'medico', 'recepcion']), async (req, res) => {
  try {
    const { nombre, telefono, email, fecha_nacimiento, diagnostico_principal, eva_promedio, notas_crm } = req.body;

    const result = await db.query(
      `UPDATE pacientes
       SET nombre = $1, telefono = $2, email = $3, fecha_nacimiento = $4,
           diagnostico_principal = $5, eva_promedio = $6, notas_crm = $7,
           ultima_visita = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING id, nombre, telefono, email, fecha_nacimiento, diagnostico_principal, eva_promedio, tiene_rx, notas_crm`,
      [nombre, telefono, email, fecha_nacimiento, diagnostico_principal, eva_promedio, notas_crm, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Paciente not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating paciente:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;