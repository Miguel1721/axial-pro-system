/**
 * RUTAS DE MEDICAMENTOS Y ALERTAS - API ENDPOINTS
 * Sistema de alertas farmacológicas y control de inventario
 */

const express = require('express');
const router = express.Router();
const { Medicamento, Receta, Alerta } = require('../models/medicamento.model');

// ==================== MEDICAMENTOS ====================

/**
 * GET /api/medicamentos
 * Obtener todos los medicamentos (con filtros)
 */
router.get('/medicamentos', async (req, res) => {
  try {
    const { stock_bajo, vencimiento_proximo, buscar } = req.query;

    if (buscar) {
      const resultados = await Medicamento.buscar(buscar);
      return res.json({ success: true, data: resultados });
    }

    const filtros = {};
    if (stock_bajo) filtros.stock_bajo = true;
    if (vencimiento_proximo) filtros.vencimiento_proximo = true;

    const medicamentos = await Medicamento.getAll(filtros);

    res.json({
      success: true,
      data: medicamentos
    });
  } catch (error) {
    console.error('Error obteniendo medicamentos:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/medicamentos/:id
 * Obtener medicamento por ID
 */
router.get('/medicamentos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const medicamento = await Medicamento.getById(id);

    if (!medicamento) {
      return res.status(404).json({
        success: false,
        error: 'Medicamento no encontrado'
      });
    }

    res.json({
      success: true,
      data: medicamento
    });
  } catch (error) {
    console.error('Error obteniendo medicamento:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/medicamentos
 * Crear nuevo medicamento
 */
router.post('/medicamentos', async (req, res) => {
  try {
    const medicamento = await Medicamento.create(req.body);

    res.status(201).json({
      success: true,
      data: medicamento
    });
  } catch (error) {
    console.error('Error creando medicamento:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/medicamentos/:id/stock
 * Actualizar stock de medicamento
 */
router.put('/medicamentos/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad, operacion = 'restar' } = req.body;

    const medicamento = await Medicamento.actualizarStock(id, cantidad, operacion);

    res.json({
      success: true,
      data: medicamento
    });
  } catch (error) {
    console.error('Error actualizando stock:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== RECETAS ====================

/**
 * GET /api/recetas/paciente/:pacienteId
 * Obtener recetas de un paciente
 */
router.get('/recetas/paciente/:pacienteId', async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const { estado } = req.query;

    const filtros = {};
    if (estado) filtros.estado = estado;

    const recetas = await Receta.getRecetasPaciente(pacienteId, filtros);

    res.json({
      success: true,
      data: recetas
    });
  } catch (error) {
    console.error('Error obteniendo recetas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/recetas/vencidas
 * Obtener recetas vencidas
 */
router.get('/recetas/vencidas', async (req, res) => {
  try {
    const recetas = await Receta.getRecetasVencidas();

    res.json({
      success: true,
      data: recetas
    });
  } catch (error) {
    console.error('Error obteniendo recetas vencidas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/recetas
 * Crear nueva receta
 */
router.post('/recetas', async (req, res) => {
  try {
    const receta = await Receta.create(req.body);

    res.status(201).json({
      success: true,
      data: receta
    });
  } catch (error) {
    console.error('Error creando receta:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== ALERTAS ====================

/**
 * GET /api/alertas
 * Obtener alertas pendientes
 */
router.get('/alertas', async (req, res) => {
  try {
    const { severidad, tipo } = req.query;

    const filtros = {};
    if (severidad) filtros.severidad = severidad;
    if (tipo) filtros.tipo = tipo;

    const alertas = await Alerta.getAlertasPendientes(filtros);

    res.json({
      success: true,
      data: alertas
    });
  } catch (error) {
    console.error('Error obteniendo alertas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/alertas/estadisticas
 * Obtener estadísticas de alertas
 */
router.get('/alertas/estadisticas', async (req, res) => {
  try {
    const estadisticas = await Alerta.getEstadisticas();

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
 * PUT /api/alertas/:id/resolver
 * Resolver alerta
 */
router.put('/alertas/:id/resolver', async (req, res) => {
  try {
    const { id } = req.params;
    const { resuelto_por } = req.body;

    const alerta = await Alerta.resolverAlerta(id, resuelto_por);

    res.json({
      success: true,
      data: alerta
    });
  } catch (error) {
    console.error('Error resolviendo alerta:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;