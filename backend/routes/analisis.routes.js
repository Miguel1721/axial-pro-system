/**
 * RUTAS DE ANÁLISIS DE HISTORIAL MÉDICO
 * API para el sistema de análisis de historial médico con IA
 */

const express = require('express');
const router = express.Router();
const { AnalisisHistorial } = require('../models/analisisHistorial.model');

/**
 * @route   GET /api/analisis/historial/:pacienteId
 * @desc    Analizar historial completo de un paciente
 * @access  Private
 */
router.get('/historial/:pacienteId', async (req, res) => {
  try {
    const { pacienteId } = req.params;

    if (!pacienteId || isNaN(pacienteId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de paciente inválido'
      });
    }

    const analisis = await AnalisisHistorial.analizarPaciente(pacienteId);

    res.json({
      success: true,
      data: analisis,
      total_encontrado: analisis.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error analizando historial:', error);
    res.status(500).json({
      success: false,
      message: 'Error al analizar historial del paciente',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/analisis/estadisticas
 * @desc    Obtener estadísticas generales de análisis
 * @access  Private
 */
router.get('/estadisticas', async (req, res) => {
  try {
    const estadisticas = await AnalisisHistorial.getEstadisticas();

    res.json({
      success: true,
      data: estadisticas,
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
 * @route   GET /api/analisis/patrones/:pacienteId
 * @desc    Detectar patrones recurrentes en un paciente
 * @access  Private
 */
router.get('/patrones/:pacienteId', async (req, res) => {
  try {
    const { pacienteId } = req.params;

    if (!pacienteId || isNaN(pacienteId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de paciente inválido'
      });
    }

    const patrones = await AnalisisHistorial.detectarPatronesRecurrentes(pacienteId);

    res.json({
      success: true,
      data: patrones,
      total_patrones: patrones.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error detectando patrones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al detectar patrones',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/analisis/riesgos/:pacienteId
 * @desc    Identificar factores de riesgo de un paciente
 * @access  Private
 */
router.get('/riesgos/:pacienteId', async (req, res) => {
  try {
    const { pacienteId } = req.params;

    if (!pacienteId || isNaN(pacienteId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de paciente inválido'
      });
    }

    const riesgos = await AnalisisHistorial.identificarFactoresRiesgo(pacienteId);

    res.json({
      success: true,
      data: riesgos,
      total_riesgos: riesgos.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error identificando riesgos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al identificar factores de riesgo',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/analisis/tendencias/:pacienteId
 * @desc    Analizar tendencias de salud de un paciente
 * @access  Private
 */
router.get('/tendencias/:pacienteId', async (req, res) => {
  try {
    const { pacienteId } = req.params;

    if (!pacienteId || isNaN(pacienteId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de paciente inválido'
      });
    }

    const tendencias = await AnalisisHistorial.analizarTendenciasSalud(pacienteId);

    res.json({
      success: true,
      data: tendencias,
      total_tendencias: tendencias.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error analizando tendencias:', error);
    res.status(500).json({
      success: false,
      message: 'Error al analizar tendencias',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/analisis/alertas/:pacienteId
 * @desc    Generar alertas tempranas para un paciente
 * @access  Private
 */
router.get('/alertas/:pacienteId', async (req, res) => {
  try {
    const { pacienteId } = req.params;

    if (!pacienteId || isNaN(pacienteId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de paciente inválido'
      });
    }

    const alertas = await AnalisisHistorial.generarAlertasTempranas(pacienteId);

    res.json({
      success: true,
      data: alertas,
      total_alertas: alertas.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generando alertas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar alertas tempranas',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/analisis/recomendaciones/:pacienteId
 * @desc    Generar recomendaciones preventivas para un paciente
 * @access  Private
 */
router.get('/recomendaciones/:pacienteId', async (req, res) => {
  try {
    const { pacienteId } = req.params;

    if (!pacienteId || isNaN(pacienteId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de paciente inválido'
      });
    }

    const recomendaciones = await AnalisisHistorial.generarRecomendaciones(pacienteId);

    res.json({
      success: true,
      data: recomendaciones,
      total_recomendaciones: recomendaciones.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generando recomendaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar recomendaciones',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/analisis/revisar/:analisisId
 * @desc    Marcar un análisis como revisado
 * @access  Private
 */
router.post('/revisar/:analisisId', async (req, res) => {
  try {
    const { analisisId } = req.params;
    const { userId } = req.body;

    if (!analisisId || isNaN(analisisId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de análisis inválido'
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario requerido'
      });
    }

    const analisisRevisado = await AnalisisHistorial.marcarRevisado(analisisId, userId);

    res.json({
      success: true,
      data: analisisRevisado,
      message: 'Análisis marcado como revisado exitosamente'
    });
  } catch (error) {
    console.error('Error marcando análisis como revisado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar análisis como revisado',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/analisis/dashboard
 * @desc    Obtener datos para dashboard de análisis
 * @access  Private
 */
router.get('/dashboard', async (req, res) => {
  try {
    // Obtener estadísticas generales
    const estadisticas = await AnalisisHistorial.getEstadisticas();

    // Resumen por tipo de análisis
    const resumen = {
      total_analisis_pendientes: estadisticas.total_analisis || 0,
      criticos: estadisticas.alta_severidad || 0,
      moderados: estadisticas.media_severidad || 0,
      leves: estadisticas.baja_severidad || 0,
      patrones_detectados: estadisticas.patrones || 0,
      factores_riesgo: estadisticas.factores_riesgo || 0,
      tendencias: estadisticas.tendencias || 0,
      alertas_tempranas: estadisticas.alertas || 0,
      recomendaciones: estadisticas.recomendaciones || 0
    };

    res.json({
      success: true,
      data: resumen,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error obteniendo dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos del dashboard',
      error: error.message
    });
  }
});

module.exports = router;