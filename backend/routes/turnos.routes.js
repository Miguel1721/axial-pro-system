/**
 * RUTAS DE TURNOS - API ENDPOINTS
 * Sistema de gestión de turnos para Axial Pro Clinic
 */

const express = require('express');
const router = express.Router();
const Turno = require('../models/turno.model');

// ==================== RUTAS PÚBLICAS ====================

/**
 * GET /api/turnos/numero/:numero_turno
 * Buscar turno por número (para pacientes)
 */
router.get('/numero/:numero_turno', async (req, res) => {
  try {
    const { numero_turno } = req.params;
    const turno = await Turno.getByNumero(numero_turno);

    if (!turno) {
      return res.status(404).json({
        success: false,
        error: 'Turno no encontrado'
      });
    }

    // Calcular tiempo estimado si está esperando
    if (turno.estado === 'esperando') {
      turno.tiempo_estimado_espera = await Turno.calcularTiempoEstimado(turno.id);
    }

    res.json({
      success: true,
      data: turno
    });
  } catch (error) {
    console.error('Error obteniendo turno por número:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/turnos/:id/tiempo-estimado
 * Calcular tiempo estimado de espera
 */
router.get('/:id/tiempo-estimado', async (req, res) => {
  try {
    const { id } = req.params;
    const tiempoEstimado = await Turno.calcularTiempoEstimado(id);

    res.json({
      success: true,
      data: {
        turno_id: id,
        tiempo_estimado_minutos: tiempoEstimado
      }
    });
  } catch (error) {
    console.error('Error calculando tiempo estimado:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== RUTAS PROTEGIDAS ====================

/**
 * GET /api/turnos
 * Obtener todos los turnos (con filtros)
 */
router.get('/', async (req, res) => {
  try {
    const { estado, doctor_id, fecha } = req.query;
    const filters = {};

    if (estado) filters.estado = estado;
    if (doctor_id) filters.doctor_id = doctor_id;
    if (fecha) filters.fecha = fecha;

    const turnos = await Turno.getAll(filters);

    res.json({
      success: true,
      data: turnos
    });
  } catch (error) {
    console.error('Error obteniendo turnos:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/turnos/estadisticas
 * Obtener estadísticas de turnos de hoy
 */
router.get('/estadisticas/hoy', async (req, res) => {
  try {
    const { doctor_id } = req.query;
    const estadisticas = await Turno.getEstadisticasHoy(doctor_id);

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
 * GET /api/turnos/doctor/:doctor_id/actual
 * Obtener turno actual de un doctor
 */
router.get('/doctor/:doctor_id/actual', async (req, res) => {
  try {
    const { doctor_id } = req.params;
    const turno = await Turno.getTurnoActual(doctor_id);

    res.json({
      success: true,
      data: turno
    });
  } catch (error) {
    console.error('Error obteniendo turno actual:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/turnos/doctor/:doctor_id/siguiente
 * Obtener siguiente turno en cola
 */
router.get('/doctor/:doctor_id/siguiente', async (req, res) => {
  try {
    const { doctor_id } = req.params;
    const turno = await Turno.getSiguienteTurno(doctor_id);

    if (turno) {
      // Calcular tiempo estimado
      turno.tiempo_estimado_espera = await Turno.calcularTiempoEstimado(turno.id);
    }

    res.json({
      success: true,
      data: turno
    });
  } catch (error) {
    console.error('Error obteniendo siguiente turno:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/turnos
 * Crear nuevo turno
 */
router.post('/', async (req, res) => {
  try {
    const {
      cita_id,
      paciente_id,
      doctor_id,
      servicio_id,
      prioridad = 3,
      tiempo_estimado = 15,
      sala,
      observaciones,
      creado_por
    } = req.body;

    // Validaciones
    if (!paciente_id || !doctor_id || !servicio_id) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos: paciente_id, doctor_id, servicio_id'
      });
    }

    const turno = await Turno.create({
      cita_id,
      paciente_id,
      doctor_id,
      servicio_id,
      prioridad,
      tiempo_estimado,
      sala,
      observaciones,
      creado_por
    });

    res.status(201).json({
      success: true,
      data: turno
    });
  } catch (error) {
    console.error('Error creando turno:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/turnos/:id/estado
 * Actualizar estado de turno
 */
router.put('/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, actualizado_por } = req.body;

    if (!estado) {
      return res.status(400).json({
        success: false,
        error: 'Estado es requerido'
      });
    }

    const estadosValidos = ['esperando', 'atendiendo', 'completado', 'cancelado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        error: `Estado inválido. Must be one of: ${estadosValidos.join(', ')}`
      });
    }

    const additionalData = {};
    if (actualizado_por) additionalData.actualizado_por = actualizado_por;

    const turno = await Turno.updateEstado(id, estado, additionalData);

    res.json({
      success: true,
      data: turno
    });
  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/turnos/:id/iniciar
 * Iniciar atención de un turno
 */
router.post('/:id/iniciar', async (req, res) => {
  try {
    const { id } = req.params;
    const { actualizado_por } = req.body;

    const turno = await Turno.updateEstado(id, 'atendiendo', {
      actualizado_por
    });

    res.json({
      success: true,
      data: turno
    });
  } catch (error) {
    console.error('Error iniciando turno:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/turnos/:id/completar
 * Completar atención de un turno
 */
router.post('/:id/completar', async (req, res) => {
  try {
    const { id } = req.params;
    const { actualizado_por } = req.body;

    const turno = await Turno.updateEstado(id, 'completado', {
      actualizado_por
    });

    res.json({
      success: true,
      data: turno
    });
  } catch (error) {
    console.error('Error completando turno:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/turnos/:id
 * Cancelar/eliminar turno
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const turno = await Turno.delete(id);

    res.json({
      success: true,
      data: turno
    });
  } catch (error) {
    console.error('Error eliminando turno:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/turnos/:id
 * Obtener turno por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const turno = await Turno.getById(id);

    if (!turno) {
      return res.status(404).json({
        success: false,
        error: 'Turno no encontrado'
      });
    }

    // Calcular tiempo estimado si está esperando
    if (turno.estado === 'esperando') {
      turno.tiempo_estimado_espera = await Turno.calcularTiempoEstimado(turno.id);
    }

    res.json({
      success: true,
      data: turno
    });
  } catch (error) {
    console.error('Error obteniendo turno:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;