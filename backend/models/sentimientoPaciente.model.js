const { Pool } = require('pg');

// Usar el pool existente
const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'axial_clinic_db',
  user: process.env.DB_USER || 'axial_admin',
  password: process.env.DB_PASSWORD || 'axial_password_123'
});

class SentimientoPacienteModel {
  // Obtener todos los feedbacks
  async obtenerFeedbacks() {
    const query = `
      SELECT
        f.id, f.paciente_id, f.consulta_id, f.tipo_encuesta,
        f.puntuacion, f.comentarios, f.categoria,
        f.fecha_respuesta, f.fecha_envio, f.estado,
        p.nombre as paciente_nombre, p.email,
        c.tipo_consulta, m.nombre as medico_nombre,
        CASE
          WHEN f.puntuacion >= 8 THEN 'positivo'
          WHEN f.puntuacion >= 6 THEN 'neutral'
          ELSE 'negativo'
        END as sentimiento_general,
        CASE
          WHEN f.puntuacion >= 9 THEN 'muy_satisfecho'
          WHEN f.puntuacion >= 7 THEN 'satisfecho'
          WHEN f.puntuacion >= 5 THEN 'neutro'
          WHEN f.puntuacion >= 3 THEN 'insatisfecho'
          ELSE 'muy_insatisfecho'
        END as nivel_satisfaccion
      FROM feedback_pacientes f
      JOIN pacientes p ON f.paciente_id = p.id
      LEFT JOIN consultas c ON f.consulta_id = c.id
      LEFT JOIN medicos m ON c.medico_id = m.id
      ORDER BY f.fecha_respuesta DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Analizar sentimiento con IA
  async analizarSentimiento(feedback) {
    // Simulación de análisis de sentimiento (en producción usaría un servicio de NLP)
    const palabrasPositivas = [
      'excelente', 'bueno', 'genial', 'maravilloso', 'perfecto',
      'gracias', 'agradable', 'cómodo', 'rápido', 'eficiente',
      'profesional', 'atento', 'amable', 'satisfecho', 'feliz'
    ];

    const palabrasNegativas = [
      'mal', 'horrible', 'terrible', 'pesimo', 'malo',
      'espera', 'lento', 'demora', 'frustrante', 'enojado',
      'insatisfecho', 'incómodo', 'imposible', 'complicado', 'confuso'
    ];

    const comentario = (feedback.comentarios || '').toLowerCase();
    let puntuacionSentimiento = 0.5; // Neutral por defecto
    let emocionesDetectadas = [];
    let temasMencionados = [];

    // Analizar palabras clave
    palabrasPositivas.forEach(palabra => {
      if (comentario.includes(palabra)) {
        puntuacionSentimiento += 0.1;
        emocionesDetectadas.push('satisfacción');
      }
    });

    palabrasNegativas.forEach(palabra => {
      if (comentario.includes(palabra)) {
        puntuacionSentimiento -= 0.1;
        emocionesDetectadas.push('frustración');
      }
    });

    // Detectar temas
    if (comentario.includes('espera') || comentario.includes('demora')) {
      temasMencionados.push('tiempo_espera');
    }
    if (comentario.includes('doctor') || comentario.includes('médico')) {
      temasMencionados.push('atencion_medica');
    }
    if (comentario.includes('recepcion') || comentario.includes('recepcionista')) {
      temasMencionados.push('servicio_recepcion');
    }
    if (comentario.includes('facilidad') || comentario.includes('sencillo')) {
      temasMencionados.push('experiencia_usuario');
    }

    // Normalizar puntuación entre 0 y 1
    puntuacionSentimiento = Math.max(0, Math.min(1, puntuacionSentimiento));

    // Clasificar sentimiento
    let sentimiento = 'neutral';
    if (puntuacionSentimiento >= 0.7) sentimiento = 'positivo';
    else if (puntuacionSentimiento <= 0.3) sentimiento = 'negativo';

    return {
      sentimiento,
      puntuacionSentimiento,
      emociones: [...new Set(emocionesDetectadas)],
      temas: temasMencionados,
      fecha_analisis: new Date().toISOString()
    };
  }

  // Calcular NPS (Net Promoter Score)
  async calcularNPS() {
    const query = `
      SELECT
        COUNT(*) as total_respuestas,
        COUNT(CASE WHEN puntuacion >= 9 THEN 1 END) as promotores,
        COUNT(CASE WHEN puntuacion >= 7 AND puntuacion <= 8 THEN 1 END) as pasivos,
        COUNT(CASE WHEN puntuacion <= 6 THEN 1 END) as detractores
      FROM feedback_pacientes
      WHERE fecha_respuesta >= CURRENT_DATE - INTERVAL '30 days'
    `;
    const result = await pool.query(query);
    const data = result.rows[0];

    const nps = data.total_respuestas > 0 ?
      ((data.promotores - data.detractores) / data.total_respuestas) * 100 : 0;

    return {
      nps: Math.round(nps),
      promotores: data.promotores,
      pasivos: data.pasivos,
      detractores: data.detractores,
      total_respuestas: data.total_respuestas,
      fecha_calculo: new Date().toISOString()
    };
  }

  // Obtener tendencias de satisfacción
  async obtenerTendenciasSatisfaccion(periodos = 12) {
    const query = `
      SELECT
        DATE_TRUNC('month', fecha_respuesta) as mes,
        AVG(puntuacion) as puntuacion_promedio,
        COUNT(*) as total_respuestas,
        COUNT(CASE WHEN puntuacion >= 9 THEN 1 END) as promotores,
        COUNT(CASE WHEN puntuacion <= 6 THEN 1 END) as detractores
      FROM feedback_pacientes
      WHERE fecha_respuesta >= CURRENT_DATE - INTERVAL '${periodos} months'
      GROUP BY DATE_TRUNC('month', fecha_respuesta)
      ORDER BY mes DESC
    `;
    const result = await pool.query(query);

    return result.rows.map(row => ({
      mes: row.mes.toISOString().substring(0, 7), // YYYY-MM format
      puntuacion_promedio: parseFloat(row.puntuacion_promedio),
      total_respuestas: parseInt(row.total_respuestas),
      promotores: parseInt(row.promotores),
      detractores: parseInt(row.detractores),
      nps: row.total_respuestas > 0 ?
        (((row.promotores - row.detractores) / row.total_respuestas) * 100).toFixed(1) : 0
    }));
  }

  // Detectar patrones de quejas
  async detectarPatronesQuejas() {
    const query = `
      SELECT
        categoria,
        puntuacion,
        comentarios,
        LENGTH(comentarios) as longitud,
        fecha_respuesta
      FROM feedback_pacientes
      WHERE puntuacion <= 6
      AND fecha_respuesta >= CURRENT_DATE - INTERVAL '3 months'
      ORDER BY puntuacion ASC, fecha_respuesta DESC
    `;
    const result = await pool.query(query);

    // Agrupar por categoría y analizar patrones
    const patrones = {};
    result.rows.forEach(row => {
      if (!patrones[row.categoria]) {
        patrones[row.categoria] = {
          total: 0,
          puntuacion_promedio: 0,
          quejas_comunes: [],
          frecuencias: {}
        };
      }

      patrones[row.categoria].total++;
      patrones[row.categoria].puntuacion_promedio += row.puntuacion;

      // Extraer palabras clave de las quejas
      const palabras = (row.comentarios || '').toLowerCase().split(/\s+/);
      palabras.forEach(palabra => {
        if (palabra.length > 3) {
          patrones[row.categoria].frecuencias[palabra] =
            (patrones[row.categoria].frecuencias[palabra] || 0) + 1;
        }
      });
    });

    // Calcular promedios y top palabras
    Object.keys(patrones).forEach(categoria => {
      const datos = patrones[categoria];
      datos.puntuacion_promedio =
        datos.puntuacion_promedio / datos.total;

      // Obtener palabras más frecuentes
      datos.quejas_comunes =
        Object.entries(datos.frecuencias)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([palabra, count]) => ({ palabra, count }));
    });

    return patrones;
  }

  // Registrar nuevo feedback
  async registrarFeedback(feedback) {
    const { paciente_id, consulta_id, tipo_encuesta, puntuacion, comentarios } = feedback;

    const query = `
      INSERT INTO feedback_pacientes
      (paciente_id, consulta_id, tipo_encuesta, puntuacion, comentarios, fecha_envio, estado)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, 'pendiente')
      RETURNING id
    `;

    const result = await pool.query(query, [
      paciente_id, consulta_id, tipo_encuesta, puntuacion, comentarios
    ]);

    return result.rows[0];
  }

  // Obtener alertas de insatisfacción
  async obtenerAlertasInsatisfaccion() {
    const query = `
      SELECT
        f.id, f.paciente_id, f.consulta_id, f.puntuacion, f.comentarios,
        f.fecha_respuesta, p.nombre as paciente_nombre, p.email,
        c.tipo_consulta, m.nombre as medico_nombre,
        CASE
          WHEN f.puntuacion <= 3 THEN 'muy_critico'
          WHEN f.puntuacion <= 5 THEN 'critico'
          ELSE 'atencion'
        END as nivel_urgencia
      FROM feedback_pacientes f
      JOIN pacientes p ON f.paciente_id = p.id
      JOIN consultas c ON f.consulta_id = c.id
      JOIN medicos m ON c.medico_id = m.id
      WHERE f.puntuacion <= 6
      AND f.fecha_respuesta >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY f.puntuacion ASC, f.fecha_respuesta DESC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  // Obtener estadísticas generales
  async obtenerEstadisticas() {
    const query = `
      SELECT
        COUNT(*) as total_feedbacks,
        AVG(puntuacion) as puntuacion_promedio,
        COUNT(CASE WHEN puntuacion >= 9 THEN 1 END) as total_promotores,
        COUNT(CASE WHEN puntuacion <= 6 THEN 1 END) as total_detractores,
        COUNT(CASE WHEN fecha_respuesta >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as reciente,
        COUNT(CASE WHEN categoria IS NOT NULL THEN 1 END) as categorizado
      FROM feedback_pacientes
    `;

    const result = await pool.query(query);
    return result.rows[0];
  }
}

module.exports = new SentimientoPacienteModel();