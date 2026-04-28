const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM servicios WHERE activo = true ORDER BY nombre ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching servicios:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { nombre, precio_base, comision_porcentaje, requiere_parametros } = req.body;

    const result = await db.query(
      `INSERT INTO servicios (nombre, precio_base, comision_porcentaje, requiere_parametros)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, precio_base, comision_porcentaje, requiere_parametros, activo`,
      [nombre, precio_base, comision_porcentaje, requiere_parametros]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating servicio:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;