const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middlewares/auth');

const router = express.Router();

router.get('/cierre-caja', authenticateToken, requireRole(['caja']), async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const result = await db.query(
      `SELECT
         COUNT(*) as total_citas,
         SUM(abono_pagado) as total_abonos,
         COUNT(CASE WHEN fecha_hora::date = $1 THEN 1 END) as citas_hoy,
         SUM(CASE WHEN fecha_hora::date = $1 THEN abono_pagado ELSE 0 END) as abonos_hoy
       FROM citas
       WHERE fecha_hora::date >= $1`,
      [today]
    );

    const sesionesHoy = await db.query(
      `SELECT
         COUNT(*) as total_sesiones,
         SUM(total_final) as total_facturado,
         COUNT(CASE WHEN hora_inicio::date = $1 THEN 1 END) as sesiones_hoy,
         SUM(CASE WHEN hora_inicio::date = $1 THEN total_final ELSE 0 END) as facturado_hoy
       FROM sesiones
       WHERE hora_inicio::date >= $1`,
      [today]
    );

    res.json({
      citas: result.rows[0],
      sesiones: sesionesHoy.rows[0]
    });
  } catch (error) {
    console.error('Error fetching cierre caja:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/bonos', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT b.id, b.nombre_paquete, b.sesiones_totales, b.sesiones_usadas,
              b.precio_pagado, b.activo, p.nombre as paciente_nombre
       FROM bonos_paciente b
       JOIN pacientes p ON b.paciente_id = p.id
       ORDER BY p.nombre ASC, b.nombre_paquete ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching bonos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/bonos', authenticateToken, requireRole(['admin', 'medico', 'recepcion']), async (req, res) => {
  try {
    const { paciente_id, nombre_paquete, sesiones_totales, precio_pagado } = req.body;

    const result = await db.query(
      `INSERT INTO bonos_paciente (paciente_id, nombre_paquete, sesiones_totales, precio_pagado)
       VALUES ($1, $2, $3, $4)
       RETURNING id, paciente_id, nombre_paquete, sesiones_totales, sesiones_usadas, precio_pagado, activo`,
      [paciente_id, nombre_paquete, sesiones_totales, precio_pagado]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating bono:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/bonos/:id', authenticateToken, requireRole(['admin', 'medico', 'recepcion']), async (req, res) => {
  try {
    const { sesiones_usadas } = req.body;

    const result = await db.query(
      `UPDATE bonos_paciente
       SET sesiones_usadas = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, paciente_id, nombre_paquete, sesiones_totales, sesiones_usadas, precio_pagado, activo`,
      [sesiones_usadas, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bono not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating bono:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;