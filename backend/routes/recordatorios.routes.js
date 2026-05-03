/**
 * RUTAS DE AUTOMATIZACIÓN DE RECORDATORIOS
 * API para gestión de recordatorios SMS/WhatsApp con proveedores externos
 */

const express = require('express');
const router = express.Router();
const { Recordatorios } = require('../models/recordatorios.model');
const mockData = require('../mockData');

/**
 * @route   GET /api/recordatorios/configuraciones
 * @desc    Obtener todas las configuraciones de recordatorios
 * @access  Private
 */
router.get('/configuraciones', async (req, res) => {
  try {
    let configuraciones;
    try {
      configuraciones = await Recordatorios.obtenerConfiguraciones();
    } catch (dbError) {
      console.log('Using mock configurations (DB not available):', dbError.message);
      configuraciones = mockData.mockConfiguracionesRecordatorios;
    }

    res.json({
      success: true,
      data: configuraciones,
      total: configuraciones.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error obteniendo configuraciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener configuraciones',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/recordatorios/configuraciones
 * @desc    Crear nueva configuración de recordatorios
 * @access  Private
 */
router.post('/configuraciones', async (req, res) => {
  try {
    const configuracion = await Recordatorios.crearConfiguracion(req.body);

    res.json({
      success: true,
      data: configuracion,
      message: 'Configuración creada exitosamente'
    });
  } catch (error) {
    console.error('Error creando configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear configuración',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/recordatorios/programar
 * @desc    Programar recordatorio para una cita
 * @access  Private
 */
router.post('/programar', async (req, res) => {
  try {
    const { cita_id, configuracion_id } = req.body;

    if (!cita_id || !configuracion_id) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren cita_id y configuracion_id'
      });
    }

    const resultado = await Recordatorios.programarRecordatorio(cita_id, configuracion_id);

    res.json({
      success: true,
      data: resultado,
      message: 'Recordatorio programado exitosamente'
    });
  } catch (error) {
    console.error('Error programando recordatorio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al programar recordatorio',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/recordatorios/enviar/:id
 * @desc    Enviar recordatorio específico
 * @access  Private
 */
router.post('/enviar/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await Recordatorios.enviarRecordatorio(parseInt(id));

    res.json({
      success: true,
      data: resultado,
      message: 'Recordatorio enviado exitosamente'
    });
  } catch (error) {
    console.error('Error enviando recordatorio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar recordatorio',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/recordatorios/verificar-pendientes
 * @desc    Verificar y enviar recordatorios pendientes
 * @access  Private
 */
router.post('/verificar-pendientes', async (req, res) => {
  try {
    const resultados = await Recordatorios.verificarRecordatoriosPendientes();

    const exitosos = resultados.filter(r => r.success).length;
    const fallidos = resultados.filter(r => !r.success).length;

    res.json({
      success: true,
      data: {
        total_procesados: resultados.length,
        exitosos,
        fallidos,
        resultados
      },
      message: `Procesados ${resultados.length} recordatorios: ${exitosos} exitosos, ${fallidos} fallidos`
    });
  } catch (error) {
    console.error('Error verificando pendientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar recordatorios pendientes',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/recordatorios/estadisticas
 * @desc    Obtener estadísticas de efectividad
 * @access  Private
 */
router.get('/estadisticas', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    let estadisticas;
    try {
      estadisticas = await Recordatorios.obtenerEstadisticasEfectividad(
        fecha_inicio,
        fecha_fin
      );
    } catch (dbError) {
      console.log('Using mock statistics (DB not available):', dbError.message);
      estadisticas = {
        total_enviados: 156,
        exitosos: 142,
        fallidos: 14,
        leidos: 128,
        entregados: 135,
        tiempo_promedio_entrega: 0.5
      };
    }

    // Calcular porcentajes
    const porcentajes = {
      exitosos: estadisticas.total_enviados > 0 ?
        ((estadisticas.exitosos / estadisticas.total_enviados) * 100).toFixed(1) : 0,
      leidos: estadisticas.total_enviados > 0 ?
        ((estadisticas.leidos / estadisticas.total_enviados) * 100).toFixed(1) : 0,
      entregados: estadisticas.total_enviados > 0 ?
        ((estadisticas.entregados / estadisticas.total_enviados) * 100).toFixed(1) : 0
    };

    res.json({
      success: true,
      data: {
        ...estadisticas,
        porcentajes
      },
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
 * @route   GET /api/recordatorios/historial
 * @desc    Obtener historial de recordatorios
 * @access  Private
 */
router.get('/historial', async (req, res) => {
  try {
    const { paciente_id, dias } = req.query;

    let historial;
    try {
      historial = await Recordatorios.obtenerHistorial(
        paciente_id ? parseInt(paciente_id) : null,
        dias ? parseInt(dias) : 30
      );
    } catch (dbError) {
      console.log('Using mock history (DB not available):', dbError.message);
      historial = mockData.mockHistorialRecordatorios;
    }

    res.json({
      success: true,
      data: historial,
      total: historial.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/recordatorios/probar-configuracion
 * @desc    Probar configuración de proveedor
 * @access  Private
 */
router.post('/probar-configuracion', async (req, res) => {
  try {
    const { proveedor, config } = req.body;

    if (!proveedor || !config) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren proveedor y config'
      });
    }

    const resultado = await Recordatorios.probarConfiguracion(proveedor, config);

    res.json({
      success: true,
      data: resultado,
      message: resultado.success ? 'Prueba exitosa' : 'Prueba fallida'
    });
  } catch (error) {
    console.error('Error probando configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error al probar configuración',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/recordatorios/empleados/verificacion
 * @desc    Endpoint para empleados verificar/enviar pendientes (cron job)
 * @access  Private
 */
router.get('/empleados/verificacion', async (req, res) => {
  try {
    // Este endpoint es para ser llamado por un cron job o empleado
    const resultados = await Recordatorios.verificarRecordatoriosPendientes();

    res.json({
      success: true,
      data: resultados,
      message: 'Verificación de recordatorios completada'
    });
  } catch (error) {
    console.error('Error en verificación automática:', error);
    res.status(500).json({
      success: false,
      message: 'Error en verificación automática',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/recordatorios/webhooks/whatsapp
 * @desc    Webhook para recibir respuestas de WhatsApp
 * @access  Public
 */
router.post('/webhooks/whatsapp', async (req, res) => {
  try {
    const webhookData = req.body;

    // Procesar respuesta de WhatsApp
    console.log('Webhook recibido:', webhookData);

    // Actualizar estado del recordatorio según respuesta
    if (webhookData.message_status) {
      // Aquí se actualizaría el estado del recordatorio correspondiente
      // Se necesitaría mapear el mensaje ID al recordatorio ID
    }

    res.json({ success: true, message: 'Webhook procesado' });
  } catch (error) {
    console.error('Error procesando webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Error procesando webhook',
      error: error.message
    });
  }
});

module.exports = router;