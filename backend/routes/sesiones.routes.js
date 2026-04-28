const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middlewares/auth');

const router = express.Router();

router.post('/', authenticateToken, requireRole(['medico', 'recepcion']), async (req, res) => {
  try {
    const {
      paciente_id,
      servicio_id,
      cabina_id,
      medico_id,
      abono_previo = 0,
      usó_bono_id
    } = req.body;

    const result = await db.query(
      `INSERT INTO sesiones (
        paciente_id, servicio_id, cabina_id, medico_id,
        abono_previo, usó_bono_id, hora_inicio
      ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING id, paciente_id, servicio_id, cabina_id, medico_id, estado,
               subtotal_base, total_adicionales, abono_previo, usó_bono_id, total_final, hora_inicio`,
      [paciente_id, servicio_id, cabina_id, medico_id, abono_previo, usó_bono_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating sesion:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT s.id, p.nombre as paciente_nombre, u.nombre as medico_nombre,
              c.nombre as cabina_nombre, sv.nombre as servicio_nombre, s.estado,
              s.hora_inicio, s.hora_fin, s.total_final
       FROM sesiones s
       JOIN pacientes p ON s.paciente_id = p.id
       JOIN usuarios u ON s.medico_id = u.id
       JOIN cabinas c ON s.cabina_id = c.id
       JOIN servicios sv ON s.servicio_id = sv.id
       ORDER BY s.hora_inicio DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching sesiones:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/finalizar', authenticateToken, requireRole(['medico', 'recepcion']), async (req, res) => {
  try {
    const { nota_evolucion, param_traccion_kg, param_traccion_angulo, consentimiento_firmado } = req.body;

    const result = await db.query(
      `UPDATE sesiones
       SET hora_fin = CURRENT_TIMESTAMP,
           nota_evolucion = $1,
           param_traccion_kg = $2,
           param_traccion_angulo = $3,
           consentimiento_firmado = $4,
           estado = 'finalizado'
       WHERE id = $5 AND estado = 'en_proceso'
       RETURNING id, paciente_id, servicio_id, cabina_id, medico_id, estado, hora_inicio, hora_fin`,
      [nota_evolucion, param_traccion_kg, param_traccion_angulo, consentimiento_firmado, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sesion not found or already finished' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error finalizing sesion:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/adicionales', authenticateToken, requireRole(['medico', 'recepcion']), async (req, res) => {
  try {
    const { adicional_id } = req.body;

    const [adicional, sesion] = await Promise.all([
      db.query('SELECT precio FROM adicionales WHERE id = $1', [adicional_id]),
      db.query('SELECT * FROM sesiones WHERE id = $1', [req.params.id])
    ]);

    if (adicional.rows.length === 0) {
      return res.status(404).json({ error: 'Adicional not found' });
    }

    if (sesion.rows.length === 0 || sesion.rows[0].estado !== 'en_proceso') {
      return res.status(400).json({ error: 'Sesion must be in progress' });
    }

    const result = await db.query(
      `INSERT INTO sesiones_adicionales (sesion_id, adicional_id, precio_cobrado)
       VALUES ($1, $2, $3)
       RETURNING id, sesion_id, adicional_id, precio_cobrado`,
      [req.params.id, adicional_id, adicional.rows[0].precio]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding adicional:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;