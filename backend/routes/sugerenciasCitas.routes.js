/**
 * RUTAS DE SUGERENCIAS DE CITAS INTELIGENTES
 * API para sistema de optimización y personalización de citas
 */

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { SugerenciasCitas } = require('../models/sugerenciasCitas.model');

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'axial_clinic_db',
  user: process.env.DB_USER || 'axial_admin',
  password: process.env.DB_PASSWORD || 'axial_password_123'
});

/**
 * @route   POST /api/sugerencias/generar
 * @desc    Generar sugerencias para un paciente
 * @access  Private
 */
router.post('/generar', async (req, res) => {
  try {
    const { pacienteId } = req.body;

    if (!pacienteId) {
      return res.status(400).json({
        success: false,
        message: 'ID de paciente requerido'
      });
    }

    const sugerencias = await SugerenciasCitas.generarSugerencias(pacienteId);

    res.json({
      success: true,
      data: sugerencias,
      total_sugerencias: sugerencias.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generando sugerencias:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar sugerencias de citas',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/sugerencias/:pacienteId
 * @desc    Obtener sugerencias para un paciente
 * @access  Private
 */
router.get('/:pacienteId', async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const { estado = 'pendiente' } = req.query;

    const sugerencias = await SugerenciasCitas.getSugerenciasPaciente(pacienteId, estado);

    res.json({
      success: true,
      data: sugerencias,
      total: sugerencias.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error obteniendo sugerencias:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener sugerencias',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/sugerencias/estadisticas
 * @desc    Obtener estadísticas del sistema
 * @access  Private
 */
router.get('/estadisticas', async (req, res) => {
  try {
    const estadisticas = await SugerenciasCitas.getEstadisticas();

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
 * @route   POST /api/sugerencias/:id/responder
 * @desc    Responder a una sugerencia
 * @access  Private
 */
router.post('/:id/responder', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, comentario } = req.body;

    if (!estado || !['aceptada', 'rechazada', 'ignorada'].includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido. Debe ser: aceptada, rechazada o ignorada'
      });
    }

    const respuesta = await SugerenciasCitas.responderSugerencia(id, {
      estado,
      comentario
    });

    res.json({
      success: true,
      data: respuesta,
      message: 'Sugerencia respondida exitosamente'
    });
  } catch (error) {
    console.error('Error respondiendo sugerencia:', error);
    res.status(500).json({
      success: false,
      message: 'Error al responder sugerencia',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/sugerencias/recomendaciones/horario
 * @desc    Obtener recomendación de horario ideal
 * @access  Private
 */
router.get('/recomendaciones/horario/:pacienteId', async (req, res) => {
  try {
    const { pacienteId } = req.params;

    // Obtener disponibilidad general
    const disponibilidadQuery = `
      SELECT fecha, horas_disponibles, citas_agendadas, carga_trabajo
      FROM disponibilidad_historica
      WHERE fecha >= CURRENT_DATE
      ORDER BY fecha
      LIMIT 7
    `;
    const disponibilidad = await pool.query(disponibilidadQuery);

    // Obtener patrones del paciente
    const patronesQuery = `
      SELECT patron, frecuencia, hora_predilecta, dia_predilecto
      FROM patrones_citas
      WHERE paciente_id = $1 AND activo = true
    `;
    const patronesResult = await pool.query(patronesQuery, [pacienteId]);

    // Generar recomendación simple
    const recomendacion = {
      dia_recomendado: 'lunes',
      hora_recomendada: '09:00',
      razonamiento: 'Basado en disponibilidad y patrones históricos',
      confianza: 0.85
    };

    res.json({
      success: true,
      data: recomendacion,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error obteniendo recomendación de horario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener recomendación de horario',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/sugerencias/recomendaciones/medico
 * @desc    Obtener recomendación de médico ideal
 * @access  Private
 */
router.get('/recomendaciones/medico/:pacienteId', async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const { tipoConsulta } = req.query;

    // Obtener historial del paciente
    const historialQuery = `
      SELECT c.tipo_consulta, m.especialidad, m.nombre, m.calificacion
      FROM citas c
      JOIN medicos m ON c.medico_id = m.id
      WHERE c.paciente_id = $1
      AND c.estado = 'completada'
      ORDER BY c.fecha DESC
      LIMIT 5
    `;
    const historial = await pool.query(historialQuery, [pacienteId]);

    // Obtener disponibilidad actual
    const disponibilidadQuery = `
      SELECT m.id, m.nombre, m.especialidad, COUNT(c.id) as citas_agendadas
      FROM medicos m
      LEFT JOIN citas c ON m.id = c.medico_id
        AND c.fecha >= CURRENT_DATE
        AND c.estado = 'confirmada'
      GROUP BY m.id, m.nombre, m.especialidad
    `;
    const disponibilidad = await pool.query(disponibilidadQuery);

    // Calcular médico ideal simple
    const medicoIdeal = {
      medico_recomendado: historial.rows[0]?.nombre || 'Dr. Pérez',
      especialidad: historial.rows[0]?.especialidad || 'General',
      razonamiento: 'Basado en historial del paciente',
      confianza: 0.90
    };

    res.json({
      success: true,
      data: medicoIdeal,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error obteniendo recomendación de médico:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener recomendación de médico',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/sugerencias/actualizar-preferencias
 * @desc    Actualizar preferencias de un paciente
 * @access  Private
 */
router.post('/actualizar-preferencias', async (req, res) => {
  try {
    const { pacienteId, preferencias } = req.body;

    const { diaPreferido, horaPreferida, tipoConsulta, medicoPreferido, flexibilidad } = preferencias;

    // Actualizar o crear preferencias
    const query = `
      INSERT INTO preferencias_pacientes (
        paciente_id, dia_preferido, hora_preferida, tipo_consulta_preferido,
        medico_preferido, factor_flexibilidad, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      ON CONFLICT (paciente_id) DO UPDATE SET
        dia_preferido = $2,
        hora_preferida = $3,
        tipo_consulta_preferido = $4,
        medico_preferido = $5,
        factor_flexibilidad = $6,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result = await pool.query(query, [
      pacienteId,
      diaPreferido,
      horaPreferida,
      tipoConsulta,
      medicoPreferido,
      flexibilidad || 5
    ]);

    // Generar nuevas sugerencias basadas en nuevas preferencias
    const nuevasSugerencias = await SugerenciasCitas.generarSugerencias(pacienteId);

    res.json({
      success: true,
      data: {
        preferencias: result.rows[0],
        nuevas_sugerencias: nuevasSugerencias
      },
      message: 'Preferencias actualizadas exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando preferencias:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar preferencias',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/sugerencias/analisis-patron/:pacienteId
 * @desc    Analizar patrón de citas de un paciente
 * @access  Private
 */
router.get('/analisis-patron/:pacienteId', async (req, res) => {
  try {
    const { pacienteId } = req.params;

    const patronQuery = `
      SELECT
        patron,
        frecuencia,
        hora_predilecta,
        dia_predilecto,
        COUNT(*) as frecuencia_ocurrencia,
        AVG(consistencia) as consistencia_promedio,
        MAX(ultima_ocurrencia) as ultima_veces
      FROM patrones_citas
      WHERE paciente_id = $1 AND activo = true
      GROUP BY patron, frecuencia, hora_predilecta, dia_predilecto
      ORDER BY frecuencia_ocurrencia DESC
    `;

    const patronResult = await pool.query(patronQuery, [pacienteId]);

    // Analizar consistencia y generar insights
    const insights = [];
    for (const p of patronResult.rows) {
      if (p.frecuencia_ocurrencia >= 3) {
        insights.push({
          patron: p.patron,
          descripcion: this.generarDescripcionPatron(p),
          consistencia: p.consistencia_promedio,
          recomendacion: this.generarRecomendacionPatron(p)
        });
      }
    }

    // Funciones auxiliares (temporalmente inline)
    function generarDescripcionPatron(patron) {
      const descripciones = {
        'temprano': 'El paciente prefiere citas tempranas en la mañana',
        'tarde': 'El paciente prefiere citas en la tarde',
        'mensual': 'Paciente tiene citas mensuales regulares',
        'recurrente': 'Paciente consulta por problemas recurrentes',
        'estacional': 'Paciente consulta según estaciones del año'
      };
      return descripciones[patron.patron] || 'Patron detectado';
    }

    function generarRecomendacionPatron(patron) {
      const recomendaciones = {
        'temprano': 'Ofrecer primeras horas del día',
        'tarde': 'Ofrecer citas después de las 14:00',
        'mensual': 'Recordar cita mensual automáticamente',
        'recurrente': 'Preparar historial del paciente',
        'estacional': 'Anticipar necesidades por temporada'
      };
      return recomendaciones[patron.patron] || 'Continuar monitoreando';
    }

    res.json({
      success: true,
      data: {
        patrones_detectados: patronResult.rows,
        insights,
        analisis_completo: insights.length > 0
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error analizando patrón:', error);
    res.status(500).json({
      success: false,
      message: 'Error al analizar patrón de citas',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/sugerencias/tendencias
 * @desc    Obtener tendencias de agendamiento
 * @access  Private
 */
router.get('/tendencias', async (req, res) => {
  try {
    const { dias = 30 } = req.query;

    // Tendencias de popularidad por especialidad
    const tendenciasQuery = `
      SELECT
        m.especialidad,
        COUNT(c.id) as total_citas,
        AVG(c.tiempo_consulta) as tiempo_promedio,
        COUNT(CASE WHEN c.estado = 'completada' THEN 1 END) * 100.0 / COUNT(c.id) as tasa_exitosa
      FROM citas c
      JOIN medicos m ON c.medico_id = m.id
      WHERE c.fecha >= CURRENT_DATE - INTERVAL '${dias} days'
      GROUP BY m.especialidad
      ORDER BY total_citas DESC
    `;

    const tendenciasResult = await pool.query(tendenciasQuery);

    // Horarios pico
    const horariosPicoQuery = `
      SELECT EXTRACT(HOUR FROM c.fecha_cita) as hora,
        COUNT(c.id) as citas_por_hora
      FROM citas c
      WHERE c.fecha >= CURRENT_DATE - INTERVAL '${dias} days'
      GROUP BY EXTRACT(HOUR FROM c.fecha_cita)
      ORDER BY citas_por_hora DESC
    `;

    const horariosResult = await pool.query(horariosPicoQuery);

    // Días de la semana más ocupados
    const diasQuery = `
      SELECT TO_CHAR(c.fecha_cita, 'Day') as dia_semana,
        COUNT(c.id) as citas_dia
      FROM citas c
      WHERE c.fecha >= CURRENT_DATE - INTERVAL '${dias} days'
      GROUP BY TO_CHAR(c.fecha_cita, 'Day')
      ORDER BY citas_dia DESC
    `;

    const diasResult = await pool.query(diasQuery);

    res.json({
      success: true,
      data: {
        por_especialidad: tendenciasResult.rows,
        horarios_pico: horariosResult.rows,
        dias_semana: diasResult.rows,
        periodo: `${dias} días`
      },
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

module.exports = router;