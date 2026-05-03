/**
 * RUTAS DE DETECCIÓN DE ANOMALÍAS FINANCIERAS
 * API para sistema inteligente de detección de fraudes y errores
 */

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { AnomaliasFinancieras } = require('../models/anomaliasFinancieras.model');

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'axial_clinic_db',
  user: process.env.DB_USER || 'axial_admin',
  password: process.env.DB_PASSWORD || 'axial_password_123'
});

/**
 * @route   POST /api/anomalias/detectar
 * @desc    Detectar todas las anomalías financieras
 * @access  Private
 */
router.post('/detectar', async (req, res) => {
  try {
    const anomalias = await AnomaliasFinancieras.detectarAnomalias();

    // Guardar cada alerta detectada
    const alertasGuardadas = [];
    for (const anomalia of anomalias) {
      try {
        const alertaGuardada = await AnomaliasFinancieras.guardarAlerta(anomalia);
        alertasGuardadas.push(alertaGuardada);
      } catch (error) {
        console.error('Error guardando alerta:', error);
      }
    }

    res.json({
      success: true,
      data: alertasGuardadas,
      total_anomalias: anomalias.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error detectando anomalías:', error);
    res.status(500).json({
      success: false,
      message: 'Error al detectar anomalías financieras',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/anomalias
 * @desc    Obtener alertas financieras pendientes
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const { severidad, tipo, estado, limite = 50 } = req.query;

    let query = `
      SELECT af.*, t.monto, t.tipo as transaccion_tipo, t.metodo_pago,
             p.nombre as paciente_nombre, u.nombre as usuario_nombre
      FROM alertas_financieras af
      LEFT JOIN transacciones t ON af.transaccion_id = t.id
      LEFT JOIN pacientes p ON af.paciente_id = p.id
      LEFT JOIN usuarios u ON af.usuario_id = u.id
      WHERE af.estado != 'resuelta'
    `;

    const params = [];
    let paramIndex = 1;

    if (severidad) {
      query += ` AND af.severidad = $${paramIndex}`;
      params.push(severidad);
      paramIndex++;
    }

    if (tipo) {
      query += ` AND af.tipo_anomalia = $${paramIndex}`;
      params.push(tipo);
      paramIndex++;
    }

    if (estado) {
      query += ` AND af.estado = $${paramIndex}`;
      params.push(estado);
      paramIndex++;
    }

    query += ` ORDER BY af.nivel_riesgo DESC, af.fecha_creacion DESC LIMIT $${paramIndex}`;
    params.push(parseInt(limite));

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error obteniendo alertas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener alertas financieras',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/anomalias/estadisticas
 * @desc    Obtener estadísticas del sistema de detección
 * @access  Private
 */
router.get('/estadisticas', async (req, res) => {
  try {
    const estadisticas = await AnomaliasFinancieras.getEstadisticas();

    // Calcular métricas adicionales
    const metricas = {
      ...estadisticas,
      alertas_activas: estadisticas.alertas.total - estadisticas.alertas.resueltas,
      tasa_deteccion: estadisticas.transacciones.total > 0
        ? Math.round((estadisticas.alertas.total / estadisticas.transacciones.total) * 100)
        : 0,
      riesgo_promedio: estadisticas.alertas.total > 0
        ? Math.round(((
            estadisticas.alertas.criticas * 10 +
            estadisticas.alertas.altas * 7 +
            estadisticas.alertas.medias * 5 +
            estadisticas.alertas.bajas * 3
          ) / estadisticas.alertas.total))
        : 0
    };

    res.json({
      success: true,
      data: metricas,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/anomalias/patrones
 * @desc    Obtener patrones de comportamiento detectados
 * @access  Private
 */
router.get('/patrones', async (req, res) => {
  try {
    const { paciente_id } = req.query;

    let query = `
      SELECT af.*, p.nombre as paciente_nombre, t.monto, t.metodo_pago
      FROM alertas_financieras af
      JOIN pacientes p ON af.paciente_id = p.id
      LEFT JOIN transacciones t ON af.transaccion_id = t.id
    `;

    if (paciente_id) {
      query += ` WHERE af.paciente_id = $1 ORDER BY af.fecha_creacion DESC`;
      const result = await pool.query(query, [paciente_id]);
      res.json({
        success: true,
        data: result.rows,
        total: result.rows.length
      });
    } else {
      query += ` GROUP BY af.id, p.id, t.id, t.monto, t.metodo_pago
                 ORDER BY COUNT(*) DESC, af.nivel_riesgo DESC LIMIT 20`;
      const result = await pool.query(query);
      res.json({
        success: true,
        data: result.rows,
        total: result.rows.length
      });
    }
  } catch (error) {
    console.error('Error obteniendo patrones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener patrones',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/anomalias/:id/investigar
 * @desc    Marcar alerta como en investigación
 * @access  Private
 */
router.post('/:id/investigar', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, notas } = req.body;

    const query = `
      UPDATE alertas_financieras
      SET estado = 'investigando',
          investigado_por = $1,
          notas = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;

    const result = await pool.query(query, [userId, notas, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Alerta no encontrada'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Alerta marcada como en investigación'
    });
  } catch (error) {
    console.error('Error investigando alerta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al investigar alerta',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/anomalias/:id/resolver
 * @desc    Marcar alerta como resuelta
 * @access  Private
 */
router.post('/:id/resolver', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, conclusion, es_falsa_positiva } = req.body;

    const estado = es_falsa_positiva ? 'falsa_positiva' : 'resuelta';

    const query = `
      UPDATE alertas_financieras
      SET estado = $1,
          fecha_resolucion = CURRENT_TIMESTAMP,
          investigado_por = $2,
          conclusion = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;

    const result = await pool.query(query, [estado, userId, conclusion, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Alerta no encontrada'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: `Alerta marcada como ${estado}`
    });
  } catch (error) {
    console.error('Error resolviendo alerta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al resolver alerta',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/anomacias/riesgo
 * @desc    Obtener pacientes con mayor riesgo detectado
 * @access  Private
 */
router.get('/riesgo', async (req, res) => {
  try {
    const { limite = 10 } = req.query;

    const query = `
      SELECT
        af.paciente_id,
        p.nombre,
        p.email,
        COUNT(*) as alertas_totales,
        MAX(af.nivel_riesgo) as max_riesgo,
        MAX(af.fecha_creacion) as ultima_alerta,
        STRING_AGG(DISTINCT af.tipo_anomalia, ', ') as tipos_anomalia
      FROM alertas_financieras af
      JOIN pacientes p ON af.paciente_id = p.id
      WHERE af.fecha_creacion >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY af.paciente_id, p.nombre, p.email
      ORDER BY alertas_totales DESC, max_riesgo DESC
      LIMIT $1
    `;

    const result = await pool.query(query, [parseInt(limite)]);

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error obteniendo pacientes de riesgo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pacientes de riesgo',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/anomacias/simular-transaccion
 * @desc    Simular transacción para testing del sistema
 * @access  Private (solo para testing)
 */
router.post('/simular-transaccion', async (req, res) => {
  try {
    const {
      tipo = 'pago',
      monto,
      metodo_pago = 'tarjeta',
      paciente_id,
      usuario_id,
      ip_address = '127.0.0.1'
    } = req.body;

    // Insertar transacción de prueba
    const insertQuery = `
      INSERT INTO transacciones (
        tipo, monto, metodo_pago, paciente_id, usuario_id, ip_address
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      tipo, monto, metodo_pago, paciente_id, usuario_id, ip_address
    ]);

    const transaccion = result.rows[0];

    // Detectar anomalías en esta transacción
    const anomalias = await AnomaliasFinancieras.detectarAnomalias();

    // Filtrar alertas relacionadas con esta transacción
    const alertasRelacionadas = anomalias.filter(a =>
      a.transaccion_id === transaccion.id ||
      a.paciente_id === paciente_id ||
      a.usuario_id === usuario_id
    );

    res.json({
      success: true,
      transaccion: transaccion,
      alertas_detectadas: alertasRelacionadas.length,
      anomalias: alertasRelacionadas,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error simulando transacción:', error);
    res.status(500).json({
      success: false,
      message: 'Error al simular transacción',
      error: error.message
    });
  }
});

module.exports = router;