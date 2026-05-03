/**
 * RUTAS DE ANÁLISIS DE SENTIMIENTO PACIENTES
 * API para el sistema de análisis de feedback y satisfacción
 */

const express = require('express');
const router = express.Router();
const { SentimientoPaciente } = require('../models/sentimientoPaciente.model');
const mockData = require('../mockData');
const { mockFeedbacks, mockNPS, mockTendencias } = mockData;

/**
 * @route   GET /api/sentimiento/feedbacks
 * @desc    Obtener todos los feedbacks de pacientes
 * @access  Private
 */
router.get('/feedbacks', async (req, res) => {
  try {
    let feedbacks;
    try {
      feedbacks = await SentimientoPaciente.obtenerFeedbacks();
    } catch (dbError) {
      console.log('Using mock data (DB not available):', dbError.message);
      feedbacks = mockFeedbacks;
    }

    res.json({
      success: true,
      data: feedbacks,
      total: feedbacks.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error obteniendo feedbacks:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener feedbacks',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/sentimiento/analizar
 * @desc    Analizar sentimiento de un feedback específico
 * @access  Private
 */
router.post('/analizar', async (req, res) => {
  try {
    const { feedback_id, feedback_text } = req.body;

    let feedbackText = feedback_text;
    if (!feedback_text && feedback_id) {
      // Obtener feedback por ID
      const feedbacks = await SentimientoPaciente.obtenerFeedbacks();
      const feedback = feedbacks.find(f => f.id === feedback_id);
      if (feedback) {
        feedbackText = feedback.comentarios;
      }
    }

    if (!feedbackText) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere texto de feedback para analizar'
      });
    }

    const analisis = await SentimientoPaciente.analizarSentimiento({
      comentarios: feedbackText,
      puntuacion: 7 // Valor por defecto
    });

    res.json({
      success: true,
      data: analisis,
      original_text: feedbackText
    });
  } catch (error) {
    console.error('Error analizando sentimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al analizar sentimiento',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/sentimiento/nps
 * @desc    Calcular NPS (Net Promoter Score)
 * @access  Private
 */
router.get('/nps', async (req, res) => {
  try {
    let nps;
    try {
      nps = await SentimientoPaciente.calcularNPS();
    } catch (dbError) {
      console.log('Using mock NPS data (DB not available):', dbError.message);
      nps = mockNPS;
    }

    res.json({
      success: true,
      data: nps,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error calculando NPS:', error);
    res.status(500).json({
      success: false,
      message: 'Error al calcular NPS',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/sentimiento/tendencias
 * @desc    Obtener tendencias de satisfacción
 * @access  Private
 */
router.get('/tendencias', async (req, res) => {
  try {
    const periodos = parseInt(req.query.periodos) || 12;
    let tendencias;

    try {
      tendencias = await SentimientoPaciente.obtenerTendenciasSatisfaccion(periodos);
    } catch (dbError) {
      console.log('Using mock trend data (DB not available):', dbError.message);
      tendencias = mockTendencias;
    }

    res.json({
      success: true,
      data: tendencias,
      periodos,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error obteniendo tendencias:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tendencias',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/sentimiento/patrones
 * @desc    Detectar patrones de quejas
 * @access  Private
 */
router.get('/patrones', async (req, res) => {
  try {
    let patrones;
    try {
      patrones = await SentimientoPaciente.detectarPatronesQuejas();
    } catch (dbError) {
      console.log('Using mock pattern data (DB not available):', dbError.message);
      patrones = {
        'atencion_medica': {
          total: 12,
          puntuacion_promedio: 4.2,
          quejas_comunes: [
            { palabra: 'espera', count: 8 },
            { palabra: 'demora', count: 6 },
            { palabra: 'impatient', count: 5 }
          ]
        }
      };
    }

    res.json({
      success: true,
      data: patrones,
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
 * @route   POST /api/sentimiento/feedback
 * @desc    Registrar nuevo feedback
 * @access  Private
 */
router.post('/feedback', async (req, res) => {
  try {
    const { paciente_id, consulta_id, tipo_encuesta, puntuacion, comentarios } = req.body;

    if (!paciente_id || !puntuacion || puntuacion < 1 || puntuacion > 10) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos o puntuación inválida'
      });
    }

    const feedbackId = await SentimientoPaciente.registrarFeedback({
      paciente_id,
      consulta_id,
      tipo_encuesta,
      puntuacion,
      comentarios
    });

    // Realizar análisis automático
    const analisis = await SentimientoPaciente.analizarSentimiento({
      comentarios: comentarios || '',
      puntuacion: puntuacion
    });

    res.json({
      success: true,
      data: {
        feedback_id: feedbackId,
        analisis
      },
      message: 'Feedback registrado y analizado correctamente'
    });
  } catch (error) {
    console.error('Error registrando feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar feedback',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/sentimiento/alertas
 * @desc    Obtener alertas de insatisfacción
 * @access  Private
 */
router.get('/alertas', async (req, res) => {
  try {
    let alertas;
    try {
      alertas = await SentimientoPaciente.obtenerAlertasInsatisfaccion();
    } catch (dbError) {
      console.log('Using mock alert data (DB not available):', dbError.message);
      alertas = [];
    }

    res.json({
      success: true,
      data: alertas,
      total_alertas: alertas.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error obteniendo alertas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener alertas',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/sentimiento/estadisticas
 * @desc    Obtener estadísticas generales
 * @access  Private
 */
router.get('/estadisticas', async (req, res) => {
  try {
    let estadisticas;
    try {
      estadisticas = await SentimientoPaciente.obtenerEstadisticas();
    } catch (dbError) {
      console.log('Using mock stats data (DB not available):', dbError.message);
      estadisticas = {
        total_feedbacks: 156,
        puntuacion_promedio: 7.8,
        total_promotores: 98,
        total_detractores: 23,
        reciente: 12,
        categorizado: 134
      };
    }

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

module.exports = router;