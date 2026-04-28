const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.id, p.nombre as paciente_nombre, s.nombre as servicio_nombre,
              c.fecha_hora, c.estado, c.abono_pagado
       FROM citas c
       JOIN pacientes p ON c.paciente_id = p.id
       JOIN servicios s ON c.servicio_id = s.id
       ORDER BY c.fecha_hora ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching citas:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, requireRole(['admin', 'medico', 'recepcion']), async (req, res) => {
  try {
    const { paciente_id, servicio_id, fecha_hora } = req.body;

    const result = await db.query(
      `INSERT INTO citas (paciente_id, servicio_id, fecha_hora)
       VALUES ($1, $2, $3)
       RETURNING id, paciente_id, servicio_id, fecha_hora, estado, abono_pagado`,
      [paciente_id, servicio_id, fecha_hora]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating cita:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/estado', authenticateToken, requireRole(['admin', 'medico', 'recepcion', 'caja']), async (req, res) => {
  try {
    const { estado } = req.body;

    const validStates = ['esperando_abono', 'confirmada', 'en_sala', 'atendido', 'cancelada'];
    if (!validStates.includes(estado)) {
      return res.status(400).json({ error: 'Invalid estado' });
    }

    const result = await db.query(
      `UPDATE citas SET estado = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, paciente_id, servicio_id, fecha_hora, estado, abono_pagado`,
      [estado, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cita not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating cita estado:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/abono', authenticateToken, requireRole(['recepcion', 'caja']), async (req, res) => {
  try {
    const { monto } = req.body;

    const result = await db.query(
      `UPDATE citas
       SET abono_pagado = $1, estado = 'confirmada', updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, paciente_id, servicio_id, fecha_hora, estado, abono_pagado`,
      [monto, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cita not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding abono:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;