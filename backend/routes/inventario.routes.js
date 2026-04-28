const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT i.id, i.nombre, i.stock_actual, i.stock_minimo, i.unidad_medida,
              CASE WHEN i.stock_actual <= i.stock_minimo THEN 'bajo'
                   WHEN i.stock_actual <= (i.stock_minimo * 2) THEN 'medio'
                   ELSE 'suficiente'
              END as nivel_stock
       FROM inventario i
       ORDER BY i.nombre ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching inventario:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/actualizar', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { stock_actual } = req.body;

    const result = await db.query(
      `UPDATE inventario
       SET stock_actual = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, nombre, stock_actual, stock_minimo, unidad_medida`,
      [stock_actual, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventario item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating inventario:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/alertas', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, nombre, stock_actual, stock_minimo, unidad_medida
       FROM inventario
       WHERE stock_actual <= stock_minimo
       ORDER BY stock_actual ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching alertas:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;