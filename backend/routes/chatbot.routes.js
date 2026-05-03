/**
 * RUTAS DE CHATBOT EXTERNO - API ENDPOINTS
 * Sistema para conectar con chatbot de empresa externa
 */

const express = require('express');
const router = express.Router();
const { ChatbotExterno } = require('../models/chatbotExterno.model');

// ==================== CHATBOT ====================

/**
 * POST /api/chatbot/enviar
 * Enviar mensaje al chatbot y obtener respuesta
 */
router.post('/enviar', async (req, res) => {
  try {
    const { mensaje, paciente_info } = req.body;

    if (!mensaje) {
      return res.status(400).json({
        success: false,
        error: 'El mensaje es requerido'
      });
    }

    const respuesta = await ChatbotExterno.enviarMensaje(mensaje, paciente_info);

    res.json({
      success: true,
      data: respuesta
    });
  } catch (error) {
    console.error('Error enviando mensaje al chatbot:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/chatbot/iniciar
 * Iniciar conversación con paciente
 */
router.post('/iniciar', async (req, res) => {
  try {
    const { paciente_info } = req.body;

    const respuesta = await ChatbotExterno.iniciarConversacion(paciente_info);

    res.json({
      success: true,
      data: respuesta
    });
  } catch (error) {
    console.error('Error iniciando conversación:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== CONFIGURACIÓN ====================

/**
 * GET /api/chatbot/configuracion
 * Obtener configuración actual del chatbot
 */
router.get('/configuracion', async (req, res) => {
  try {
    const config = ChatbotExterno.getConfiguracion();

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error obteniendo configuración:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/chatbot/configuracion
 * Actualizar configuración del chatbot (API externa)
 */
router.put('/configuracion', async (req, res) => {
  try {
    const { api_url, api_key, modo } = req.body;

    // Validar que sea admin para cambiar configuración
    // TODO: Implementar verificación de admin

    const resultado = await ChatbotExterno.actualizarConfiguracion({
      apiUrl: api_url,
      apiKey: api_key
    });

    if (modo) {
      await ChatbotExterno.cambiarModo(modo);
    }

    res.json({
      success: true,
      data: resultado
    });
  } catch (error) {
    console.error('Error actualizando configuración:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/chatbot/probar-conexion
 * Probar conexión con API externa
 */
router.post('/probar-conexion', async (req, res) => {
  try {
    const resultado = await ChatbotExterno.probarConexion();

    res.json({
      success: true,
      data: resultado
    });
  } catch (error) {
    console.error('Error probando conexión:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/chatbot/cambiar-modo
 * Cambiar modo de operación (simulacion/produccion)
 */
router.post('/cambiar-modo', async (req, res) => {
  try {
    const { modo } = req.body;

    if (!modo || !['simulacion', 'produccion'].includes(modo)) {
      return res.status(400).json({
        success: false,
        error: 'Modo inválido. Debe ser "simulacion" o "produccion"'
      });
    }

    const resultado = await ChatbotExterno.cambiarModo(modo);

    res.json({
      success: true,
      data: resultado
    });
  } catch (error) {
    console.error('Error cambiando modo:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== ESTADÍSTICAS ====================

/**
 * GET /api/chatbot/estadisticas
 * Obtener estadísticas del chatbot
 */
router.get('/estadisticas', async (req, res) => {
  try {
    const estadisticas = await ChatbotExterno.getEstadisticas();

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

module.exports = router;
