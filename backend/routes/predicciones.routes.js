/**
 * RUTAS DE PREDICCIÓN DE DEMANDA - API ENDPOINTS
 * Sistema de ML para predecir demanda de citas médicas
 */

const express = require('express');
const { Pool } = require('pg');
const router = express.Router();
const { PrediccionDemanda } = require('../models/prediccionDemanda.model');

// Pool para queries directos en las rutas
const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'axial_clinic_db',
  user: process.env.DB_USER || 'axial_admin',
  password: process.env.DB_PASSWORD || 'axial_password_123'
});

// ==================== PREDICCIONES ====================

/**
 * GET /api/predicciones/demanda
 * Obtener predicciones de demanda para los próximos días
 */
router.get('/demanda', async (req, res) => {
  try {
    const { dias = 7 } = req.query;

    // Generar predicciones si no existen o son viejas
    await PrediccionDemanda.generarPrediccionesSemanal();

    const predicciones = await PrediccionDemanda.getPrediccionesDashboard();

    res.json({
      success: true,
      data: predicciones,
      total: predicciones.length
    });
  } catch (error) {
    console.error('Error obteniendo predicciones:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/predicciones/demanda/fecha/:fecha
 * Obtener predicción para una fecha específica
 */
router.get('/demanda/fecha/:fecha', async (req, res) => {
  try {
    const { fecha } = req.params;

    const query = `
      SELECT
        fecha_predicha,
        hora_predicha,
        demanda_estimada,
        confianza,
        tipo_dia,
        estacion
      FROM predicciones_demanda
      WHERE fecha_predicha = $1
      ORDER BY hora_predicha
    `;

    const result = await pool.query(query, [fecha]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error obteniendo predicción por fecha:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/predicciones/demanda/recalcular
 * Forzar recálculo de predicciones
 */
router.post('/demanda/recalcular', async (req, res) => {
  try {
    await PrediccionDemanda.generarPrediccionesSemanal();
    await PrediccionDemanda.identificarDiasCriticos();

    res.json({
      success: true,
      message: 'Predicciones recalculadas correctamente'
    });
  } catch (error) {
    console.error('Error recalculando predicciones:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== DÍAS CRÍTICOS ====================

/**
 * GET /api/predicciones/dias-criticos
 * Obtener días críticos (alta demanda)
 */
router.get('/dias-criticos', async (req, res) => {
  try {
    const diasCriticos = await PrediccionDemanda.getDiasCriticos();

    res.json({
      success: true,
      data: diasCriticos,
      total: diasCriticos.length
    });
  } catch (error) {
    console.error('Error obteniendo días críticos:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/predicciones/dias-criticos/:fecha/desactivar
 * Desactivar alerta de día crítico
 */
router.put('/dias-criticos/:fecha/desactivar', async (req, res) => {
  try {
    const { fecha } = req.params;

    const query = `
      UPDATE dias_criticos
      SET alerta_activa = false,
          updated_at = CURRENT_TIMESTAMP
      WHERE fecha = $1
      RETURNING *
    `;

    const result = await pool.query(query, [fecha]);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error desactivando día crítico:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== ESTADÍSTICAS ====================

/**
 * GET /api/predicciones/estadisticas
 * Obtener estadísticas de ocupación histórica
 */
router.get('/estadisticas', async (req, res) => {
  try {
    const estadisticas = await PrediccionDemanda.getEstadisticasOcupacion();

    res.json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/predicciones/resumen
 * Obtener resumen completo para el dashboard
 */
router.get('/resumen', async (req, res) => {
  try {
    // Obtener todas las métricas en paralelo
    const [predicciones, diasCriticos, estadisticas] = await Promise.all([
      PrediccionDemanda.getPrediccionesDashboard(),
      PrediccionDemanda.getDiasCriticos(),
      PrediccionDemanda.getEstadisticasOcupacion()
    ]);

    // Procesar predicciones por fecha
    const prediccionesPorFecha = {};
    predicciones.forEach(p => {
      if (!prediccionesPorFecha[p.fecha_predicha]) {
        prediccionesPorFecha[p.fecha_predicha] = {
          fecha: p.fecha_predicha,
          tipo_dia: p.tipo_dia,
          estacion: p.estacion,
          demanda_total: 0,
          horas: []
        };
      }
      prediccionesPorFecha[p.fecha_predicha].demanda_total += p.demanda_estimada;
      prediccionesPorFecha[p.fecha_predicha].horas.push({
        hora: p.hora_predicha,
        demanda: p.demanda_estimada,
        confianza: p.confianza
      });
    });

    res.json({
      success: true,
      data: {
        predicciones: Object.values(prediccionesPorFecha),
        dias_criticos: diasCriticos,
        estadisticas_historicas: estadisticas,
        total_predicciones: predicciones.length,
        total_dias_criticos: diasCriticos.length
      }
    });
  } catch (error) {
    console.error('Error obteniendo resumen:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
