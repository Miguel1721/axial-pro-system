const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM cabinas ORDER BY nombre ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching cabinas:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/estado', authenticateToken, async (req, res) => {
  try {
    const { estado } = req.body;

    const validStates = ['disponible', 'ocupada', 'limpieza'];
    if (!validStates.includes(estado)) {
      return res.status(400).json({ error: 'Invalid estado' });
    }

    const result = await db.query(
      `UPDATE cabinas SET estado = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, nombre, estado`,
      [estado, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cabina not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating cabina estado:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;