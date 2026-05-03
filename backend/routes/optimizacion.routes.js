/**
 * RUTAS DE OPTIMIZACIÓN DE CITAS - API ENDPOINTS
 * Sistema de IA para optimizar agenda y reducir tiempos muertos
 */

const express = require('express');
const { Pool } = require('pg');
const router = express.Router();
const { OptimizacionCitas } = require('../models/optimizacionCitas.model');

// Pool para queries directos
const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'axial_clinic_db',
  user: process.env.DB_USER || 'axial_admin',
  password: process.env.DB_PASSWORD || 'axial_password_123'
});

// ==================== OPTIMIZACIONES ====================

/**
 * GET /api/optimizaciones
 * Obtener optimizaciones pendientes
 */
router.get('/', async (req, res) => {
  try {
    const { tipo, prioridad } = req.query;

    // Analizar agenda y generar optimizaciones
    const optimizaciones = await OptimizacionCitas.analizarAgenda();

    // Filtrar si se especifica
    let filtradas = optimizaciones;
    if (tipo) {
      filtradas = filtradas.filter(opt => opt.tipo_optimizacion === tipo);
    }
    if (prioridad) {
      filtradas = filtradas.filter(opt => opt.prioridad === prioridad);
    }

    res.json({
      success: true,
      data: filtradas,
      total: filtradas.length
    });
  } catch (error) {
    console.error('Error obteniendo optimizaciones:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/optimizaciones/pendientes
 * Obtener optimizaciones pendientes de la BD
 */
router.get('/pendientes', async (req, res) => {
  try {
    const optimizaciones = await OptimizacionCitas.getOptimizacionesPendientes();

    res.json({
      success: true,
      data: optimizaciones,
      total: optimizaciones.length
    });
  } catch (error) {
    console.error('Error obteniendo optimizaciones pendientes:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/optimizaciones/recalcular
 * Forzar recálculo de optimizaciones
 */
router.post('/recalcular', async (req, res) => {
  try {
    // Analizar agenda
    const optimizaciones = await OptimizacionCitas.analizarAgenda();

    // Guardar en BD
    await OptimizacionCitas.guardarOptimizaciones(optimizaciones);

    res.json({
      success: true,
      message: `${optimizaciones.length} optimizaciones generadas correctamente`,
      total: optimizaciones.length
    });
  } catch (error) {
    console.error('Error recalculando optimizaciones:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/optimizaciones/:id/implementar
 * Marcar optimización como implementada
 */
router.put('/:id/implementar', async (req, res) => {
  try {
    const { id } = req.params;
    const { implementado_por = 1 } = req.body;

    const optimizacion = await OptimizacionCitas.marcarImplementada(id, implementado_por);

    res.json({
      success: true,
      data: optimizacion,
      message: 'Optimización marcada como implementada'
    });
  } catch (error) {
    console.error('Error implementando optimización:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== ESTADÍSTICAS ====================

/**
 * GET /api/optimizaciones/estadisticas
 * Obtener estadísticas de optimización
 */
router.get('/estadisticas', async (req, res) => {
  try {
    const estadisticas = await OptimizacionCitas.getEstadisticas();

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
 * GET /api/optimizaciones/resumen
 * Obtener resumen completo para dashboard
 */
router.get('/resumen', async (req, res) => {
  try {
    // Obtener todas las métricas en paralelo
    const [optimizaciones, estadisticas] = await Promise.all([
      OptimizacionCitas.getOptimizacionesPendientes(),
      OptimizacionCitas.getEstadisticas()
    ]);

    // Agrupar optimizaciones por tipo
    const porTipo = {};
    optimizaciones.forEach(opt => {
      if (!porTipo[opt.tipo_optimizacion]) {
        porTipo[opt.tipo_optimizacion] = [];
      }
      porTipo[opt.tipo_optimizacion].push(opt);
    });

    // Agrupar por prioridad
    const porPrioridad = {
      alta: optimizaciones.filter(opt => opt.prioridad === 'alta').length,
      media: optimizaciones.filter(opt => opt.prioridad === 'media').length,
      baja: optimizaciones.filter(opt => opt.prioridad === 'baja').length
    };

    res.json({
      success: true,
      data: {
        optimizaciones: optimizaciones,
        por_tipo: porTipo,
        por_prioridad: porPrioridad,
        estadisticas: estadisticas,
        total_optimizaciones: optimizaciones.length
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

// ==================== SUGERENCIAS DE REUBICACIÓN ====================

/**
 * GET /api/optimizaciones/sugerencias-reubicacion
 * Obtener sugerencias de reubicación de citas
 */
router.get('/sugerencias-reubicacion', async (req, res) => {
  try {
    // Simular sugerencias de reubicación
    const sugerencias = [
      {
        id: 1,
        paciente_nombre: 'María González',
        doctor_origen: 'Dra. Martínez (sobrecargada)',
        doctor_destino: 'Dr. López (disponible)',
        fecha_origen: 'Miércoles 15:00',
        fecha_destino: 'Jueves 10:00',
        razon: 'Balancear carga de trabajo',
        beneficio: 'Reducir tiempo de espera de 30 min a 5 min',
        aceptada: null
      },
      {
        id: 2,
        paciente_nombre: 'Carlos Rodríguez',
        doctor_origen: 'Dr. Pérez (sin disponibilidad)',
        doctor_destino: 'Dra. García (misma especialidad)',
        fecha_origen: 'Viernes 09:00',
        fecha_destino: 'Jueves 16:00',
        razon: 'Doctor original sin cupos',
        beneficio: 'Cita anticipada en 1 día',
        aceptada: null
      }
    ];

    res.json({
      success: true,
      data: sugerencias,
      total: sugerencias.length
    });
  } catch (error) {
    console.error('Error obteniendo sugerencias de reubicación:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
