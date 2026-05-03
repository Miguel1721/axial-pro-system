/**
 * MODELO DE SUGERENCIAS DE CITAS INTELIGENTES
 * Sistema de IA para optimización y personalización de agendamiento
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'axial_clinic_db',
  user: process.env.DB_USER || 'axial_admin',
  password: process.env.DB_PASSWORD || 'axial_password_123'
});

/**
 * Inicializar tablas de sugerencias de citas si no existen
 */
const initializeSugerenciasTables = async () => {
  const checkTable = async (tableName) => {
    try {
      const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = $1
        )
      `, [tableName]);
      return result.rows[0].exists;
    } catch (error) {
      return false;
    }
  };

  // Crear tabla de preferencias de pacientes
  const preferenciasTableExists = await checkTable('preferencias_pacientes');
  if (!preferenciasTableExists) {
    const createPreferenciasTable = `
      CREATE TABLE preferencias_pacientes (
        id SERIAL PRIMARY KEY,
        paciente_id INTEGER UNIQUE REFERENCES pacientes(id),
        dia_preferido VARCHAR(20), -- lunes, martes, etc.
        hora_preferida TIME,
        tipo_consulta_preferido VARCHAR(50), -- general, especialidad, urgente
        medico_preferido INTEGER REFERENCES medicos(id),
        frecuencia_consulta INTERVAL, -- INTERVAL '1 week', etc.
        recordatorio BOOLEAN DEFAULT true,
        notificaciones BOOLEAN DEFAULT true,
        factor_flexibilidad INTEGER DEFAULT 5, -- 1-10 (1: rígido, 10: flexible)
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_preferencias_paciente ON preferencias_pacientes(paciente_id);
    `;
    await pool.query(createPreferenciasTable);
    console.log('✅ Tabla de preferencias de pacientes creada');
  }

  // Crear tabla de disponibilidad histórica
  const disponibilidadTableExists = await checkTable('disponibilidad_historica');
  if (!disponibilidadTableExists) {
    const createDisponibilidadTable = `
      CREATE TABLE disponibilidad_historica (
        id SERIAL PRIMARY KEY,
        medico_id INTEGER REFERENCES medicos(id),
        fecha DATE,
        horas_disponibles INTEGER[],
        citas_agendadas INTEGER,
        citas_atendidas INTEGER,
        cancelaciones INTEGER,
        no_show INTEGER,
        carga_trabajo DECIMAL(5,2), -- 0.0 - 1.0
        popularidad DECIMAL(5,2), -- 0.0 - 1.0
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_disponibilidad_medico ON disponibilidad_historica(medico_id, fecha);
      CREATE INDEX idx_disponibilidad_fecha ON disponibilidad_historica(fecha);
    `;
    await pool.query(createDisponibilidadTable);
    console.log('✅ Tabla de disponibilidad histórica creada');
  }

  // Crear tabla de patrones de citas
  const patronesTableExists = await checkTable('patrones_citas');
  if (!patronesTableExists) {
    const createPatronesTable = `
      CREATE TABLE patrones_citas (
        id SERIAL PRIMARY KEY,
        paciente_id INTEGER REFERENCES pacientes(id),
        patron VARCHAR(100) NOT NULL, -- temprano, tarde, mensual, recurrente, estacional
        frecuencia VARCHAR(20), -- diario, semanal, mensual, trimestral
        hora_predilecta TIME,
        dia_predilecto VARCHAR(20),
        motivo_consulta VARCHAR(100),
        consistencia DECIMAL(3,2), -- 0.0 - 1.0 qué tan consistente
        ultima_ocurrencia TIMESTAMP,
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_patrones_paciente ON patrones_citas(paciente_id);
      CREATE INDEX idx_patrones_tipo ON patrones_citas(patron);
    `;
    await pool.query(createPatronesTable);
    console.log('✅ Tabla de patrones de citas creada');
  }

  // Crear tabla de sugerencias generadas
  const sugerenciasTableExists = await checkTable('sugerencias_citas');
  if (!sugerenciasTableExists) {
    const createSugerenciasTable = `
      CREATE TABLE sugerencias_citas (
        id SERIAL PRIMARY KEY,
        paciente_id INTEGER REFERENCES pacientes(id),
        tipo_sugerencia VARCHAR(50) NOT NULL, -- horario, medico, preparacion, recordatorio
        titulo VARCHAR(200),
        descripcion TEXT,
        datos_sugerencia JSONB,
        nivel_confianza DECIMAL(3,2), -- 0.0 - 1.0
        estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, aceptada, rechazada, ignorada
        creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        respondida_en TIMESTAMP,
        respuesta_usuario VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_sugerencias_paciente ON sugerencias_citas(paciente_id);
      CREATE INDEX idx_sugerencias_tipo ON sugerencias_citas(tipo_sugerencia);
      CREATE INDEX idx_sugerencias_estado ON sugerencias_citas(estado);
      CREATE INDEX idx_sugerencias_fecha ON sugerencias_citas(creada_en);
    `;
    await pool.query(createSugerenciasTable);
    console.log('✅ Tabla de sugerencias de citas creada');
  }

  // Insertar datos de prueba iniciales
  await insertarDatosPrueba();
};

/**
 * Insertar datos de prueba iniciales
 */
const insertarDatosPrueba = async () => {
  try {
    const countPreferencias = await pool.query('SELECT COUNT(*) FROM preferencias_pacientes');
    if (parseInt(countPreferencias.rows[0].count) === 0) {
      // Insertar preferencias de prueba
      const preferencias = [
        { paciente: 1, dia: 'lunes', hora: '09:00', tipo: 'general', medico: 1, flexibilidad: 7 },
        { paciente: 2, dia: 'martes', hora: '14:00', tipo: 'especialidad', medico: 2, flexibilidad: 3 },
        { paciente: 3, dia: 'miercoles', hora: '10:30', tipo: 'urgente', medico: 1, flexibilidad: 9 }
      ];

      for (const pref of preferencias) {
        await pool.query(`
          INSERT INTO preferencias_pacientes (
            paciente_id, dia_preferido, hora_preferida, tipo_consulta_preferido,
            medico_preferido, factor_flexibilidad
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          pref.paciente, pref.dia, pref.hora, pref.tipo, pref.medico, pref.flexibilidad
        ]);
      }

      console.log('✅ Datos de prueba insertados');
    }
  } catch (error) {
    console.log('Error al insertar datos de prueba de sugerencias:', error.message);
  }
};

/**
 * Clase principal para sugerencias de citas
 */
class SugerenciasCitas {
  /**
   * Generar todas las sugerencias para un paciente
   */
  static async generarSugerencias(pacienteId) {
    const sugerencias = [];

    try {
      // Sugerencias de horario
      sugerencias.push(...await this.sugerirHorarioOptimo(pacienteId));

      // Sugerencias de médico
      sugerencias.push(...await this.sugerirMedicoIdeal(pacienteId));

      // Sugerencias de preparación
      sugerencias.push(...await this.sugerirPreparacion(pacienteId));

      // Sugerencias de recordatorio
      sugerencias.push(...await this.sugerirRecordatorios(pacienteId));

      // Guardar sugerencias
      for (const sugerencia of sugerencias) {
        await this.guardarSugerencia(sugerencia);
      }

      return sugerencias;
    } catch (error) {
      console.error('Error generando sugerencias:', error);
      return [];
    }
  }

  /**
   * Sugerir horario óptimo basado en patrones y disponibilidad
   */
  static async sugerirHorarioOptimo(pacienteId) {
    const sugerencias = [];

    try {
      // Obtener preferencias del paciente
      const preferenciasQuery = `
        SELECT dia_preferido, hora_preferida, factor_flexibilidad
        FROM preferencias_pacientes
        WHERE paciente_id = $1
      `;
      const preferenciasResult = await pool.query(preferenciasQuery, [pacienteId]);
      const preferencias = preferenciasResult.rows[0];

      if (!preferencias) {
        // Generar sugerencia genérica
        sugerencias.push({
          tipo_sugerencia: 'horario',
          titulo: '🕐 Mejor momento para tu cita',
          descripcion: 'Basado en nuestra experiencia, las citas por la tarde tienen menor tiempo de espera.',
          datos_sugerencia: {
            horario_recomendado: '14:00 - 16:00',
            dias_disponibles: ['lunes', 'martes', 'jueves'],
            razonamiento: 'Menor demanda durante estas horas'
          },
          nivel_confianza: 0.75,
          paciente_id: pacienteId
        });
        return sugerencias;
      }

      // Analizar disponibilidad histórica
      const disponibilidadQuery = `
        SELECT AVG(carga_trabajo) as carga_promedio, COUNT(*) as dias_disponibles
        FROM disponibilidad_historica
        WHERE fecha >= CURRENT_DATE
        AND EXISTS (SELECT 1 FROM medicos_disponibilidad md WHERE md.medico_id = disponibilidad_historica.medico_id)
      `;
      const disponibilidadResult = await pool.query(disponibilidadQuery);
      const disponibilidad = disponibilidadResult.rows[0];

      // Calcular mejor horario
      const dia = preferencias.dia_preferido;
      const horaBase = preferencias.hora_preferida || '09:00';

      // Considerar flexibilidad
      const flexibilidad = preferencias.factor_flexibilidad;
      const rangoHoras = flexibilidad >= 7 ? 3 : 1; // +- horas

      const horasDisponibles = [];
      for (let i = -rangoHoras; i <= rangoHoras; i++) {
        const hora = new Date(`${dia}T${horaBase}:00`);
        hora.setHours(hora.getHours() + i);
        if (hora.getHours() >= 8 && hora.getHours() <= 17) {
          horasDisponibles.push(hora.toTimeString().substring(0, 5));
        }
      }

      sugerencias.push({
        tipo_sugerencia: 'horario',
        titulo: `🕐 Mejor horario para tu cita`,
        descripcion: `Basado en tus preferencias y disponibilidad, te sugerimos ${horasDisponibles[0]} como opción óptima.`,
        datos_sugerencia: {
          dia_recomendado: dia,
          hora_recomendada: horasDisponibles[0],
          alternativas: horasDisponibles,
          flexibilidad_usada: flexibilidad,
          disponibilidad: disponibilidad
        },
        nivel_confianza: 0.85,
        paciente_id: pacienteId
      });

      return sugerencias;
    } catch (error) {
      console.error('Error sugiriendo horario:', error);
      return [];
    }
  }

  /**
   * Sugerir médico ideal basado en historial y especialidad
   */
  static async sugerirMedicoIdeal(pacienteId) {
    const sugerencias = [];

    try {
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
      const historialResult = await pool.query(historialQuery, [pacienteId]);
      const historial = historialResult.rows;

      // Obtener preferencias
      const preferenciasQuery = `
        SELECT medico_preferido, tipo_consulta_preferido
        FROM preferencias_pacientes
        WHERE paciente_id = $1
      `;
      const preferenciasResult = await pool.query(preferenciasQuery, [pacienteId]);
      const preferencias = preferenciasResult.rows[0];

      if (historial.length > 0) {
        // Analizar patrones
        const especialidades = {};
        let mejorMedico = null;
        let mejorCalificacion = 0;

        historial.forEach(cita => {
          if (!especialidades[cita.especialidad]) {
            especialidades[cita.especialidad] = { count: 0, calificacion: 0 };
          }
          especialidades[cita.especialidad].count++;
          especialidades[cita.especialidad].calificacion += cita.calificacion;

          if (cita.calificacion > mejorCalificacion) {
            mejorCalificacion = cita.calificacion;
            mejorMedico = cita.nombre;
          }
        });

        // Sugerir médico basado en especialidad preferida
        const tipoConsulta = preferencias?.tipo_consulta_preferido || historial[0].tipo_consulta;
        const especialidadRecomendada = Object.keys(especialidades).reduce((a, b) =>
          especialidades[a].count > especialidades[b].count ? a : b
        );

        sugerencias.push({
          tipo_sugerencia: 'medico',
          titulo: '👨‍⚕️ Médico ideal para tu consulta',
          descripcion: `Basado en tu historial, te sugerimos consultar con un ${especialidadRecomendada} especializado.`,
          datos_sugerencia: {
            especialidad_recomendada: especialidadRecomendada,
            medico_recomendado: mejorMedico,
            historial_consultas: especialidades,
            tipo_consulta: tipoConsulta,
            calificacion_promedio: mejorCalificacion
          },
          nivel_confianza: 0.90,
          paciente_id: pacienteId
        });
      }

      return sugerencias;
    } catch (error) {
      console.error('Error sugiriendo médico:', error);
      return [];
    }
  }

  /**
   * Sugerir preparación previa para la cita
   */
  static async sugerirPreparacion(pacienteId) {
    const sugerencias = [];

    try {
      // Obtener tipo de cita más común del paciente
      const tipoCitaQuery = `
        SELECT tipo_consulta, AVG(tiempo_consulta) as tiempo_promedio
        FROM citas
        WHERE paciente_id = $1
        AND estado = 'completada'
        GROUP BY tipo_consulta
        ORDER BY COUNT(*) DESC
        LIMIT 1
      `;
      const tipoCitaResult = await pool.query(tipoCitaQuery, [pacienteId]);
      const tipoCita = tipoCitaResult.rows[0];

      if (!tipoCita) {
        // Sugerencia genérica
        sugerencias.push({
          tipo_sugerencia: 'preparacion',
          titulo: '📋 Prepara tu cita',
          descripcion: 'Llega 15 minutos antes de tu cita con tu documento de identidad y seguro médico.',
          datos_sugerencia: {
            documentos_requeridos: ['Identificación', 'Seguro médico'],
            tiempo_recomendado_llegada: '15 minutos',
            lista_preparacion: [
              'Traer documentos',
              'Llevar historial médico',
              'Preparar preguntas',
              'Llegar con tiempo'
            ]
          },
          nivel_confianza: 0.70,
          paciente_id: pacienteId
        });
        return sugerencias;
      }

      // Preparaciones específicas por tipo de consulta
      const preparaciones = {
        general: {
          documentos: ['Identificación', 'Cartilla médica'],
          recomendaciones: ['Llevar lista de medicamentos', 'Preparar síntomas'],
          tiempo: '15 minutos'
        },
        especialidad: {
          documentos: ['Referencia médica', 'Exámenes previos'],
          recomendaciones: ['Traer resultados de estudios', 'Lista de preguntas específicas'],
          tiempo: '20 minutos'
        },
        urgente: {
          documentos: ['Identificación', 'Cartilla médica'],
          recomendaciones: ['Describir síntomas detalladamente', 'Mencionar alergias'],
          tiempo: '10 minutos'
        }
      };

      const preparacion = preparaciones[tipoCita.tipo_consulta] || preparaciones.general;

      sugerencias.push({
        tipo_sugerencia: 'preparacion',
        titulo: '📋 Prepara tu cita',
        descripcion: `Para tu cita de ${tipoCita.tipo_consulta}, te sugerimos preparar lo siguiente:`,
        datos_sugerencia: {
          tipo_consulta: tipoCita.tipo_consulta,
          tiempo_consulta: tipoCita.tiempo_promedio,
          documentos_requeridos: preparacion.documentos,
          recomendaciones: preparacion.recomendaciones,
          tiempo_recomendado_llegada: preparacion.tiempo,
          tiempo_estimado_consulta: tipoCita.tiempo_promedio
        },
        nivel_confianza: 0.85,
        paciente_id: pacienteId
      });

      return sugerencias;
    } catch (error) {
      console.error('Error sugiriendo preparación:', error);
      return [];
    }
  }

  /**
   * Sugerir recordatorios inteligentes
   */
  static async sugerirRecordatorios(pacienteId) {
    const sugerencias = [];

    try {
      // Obtener historial de no-shows y cancelaciones
      const comportamientoQuery = `
        SELECT
          COUNT(*) as total_citas,
          COUNT(CASE WHEN estado = 'no_show' THEN 1 END) as no_show,
          COUNT(CASE WHEN estado = 'cancelada' THEN 1 END) as cancelaciones,
          AVG(EXTRACT(EPOCH FROM (fecha_cita - fecha_agendada))/3600) as promedio_horas_antes
        FROM citas
        WHERE paciente_id = $1
      `;
      const comportamientoResult = await pool.query(comportamientoQuery, [pacienteId]);
      const comportamiento = comportamientoResult.rows[0];

      if (!comportamiento || comportamiento.total_citas === 0) {
        // Sugerencia genérica
        sugerencias.push({
          tipo_sugerencia: 'recordatorio',
          titulo: '⏰ Configura tus recordatorios',
          descripcion: 'Recibirás notificaciones 24h y 1h antes de tu cita para no olvidarla.',
          datos_sugerencia: {
            canales_notificacion: ['SMS', 'Email', 'Push'],
            tiempos_recordatorio: ['24h antes', '1h antes'],
            sugerencia_personalizada: 'Recomendamos habilitar ambos canales'
          },
          nivel_confianza: 0.80,
          paciente_id: pacienteId
        });
        return sugerencias;
      }

      // Calcular tiempos de recordatorio óptimos
      const promedioHoras = parseFloat(comportamiento.promedio_horas_antes) || 48;
      let tiemposRecordatorio = ['24h antes'];

      if (comportamiento.no_show > comportamiento.total_citas * 0.2) {
        // Paciente con muchos no-shows
        tiemposRecordatorio = ['48h antes', '24h antes', '1h antes'];
      } else if (comportamiento.cancelaciones > comportamiento.total_citas * 0.3) {
        // Paciente con muchas cancelaciones
        tiemposRecordatorio = ['48h antes', '24h antes'];
      } else {
        // Paciente confiable
        tiemposRecordatorio = ['24h antes', '1h antes'];
      }

      sugerencias.push({
        tipo_sugerencia: 'recordatorio',
        titulo: '⏰ Optimiza tus recordatorios',
        descripcion: `Basado en tu historial, te sugerimos recibir recordatorios ${tiemposRecordatorio.join(' y ')}.`,
        datos_sugerencia: {
          historial_citas: comportamiento,
          tiempos_recomendados: tiemposRecordatorio,
            razonamiento: comportamiento.no_show > comportamiento.total_citas * 0.2
              ? 'Has tenido citas no programadas, usaremos recordatorios tempranos'
              : 'Tu historial es confiable, recordatorios estándar son suficientes',
          tipo_usuario: comportamiento.no_show > 0 ? 'requiere_muchas_recordatorios' : 'confiable'
        },
        nivel_confianza: 0.88,
        paciente_id: pacienteId
      });

      return sugerencias;
    } catch (error) {
      console.error('Error sugiriendo recordatorios:', error);
      return [];
    }
  }

  /**
   * Guardar sugerencia en la base de datos
   */
  static async guardarSugerencia(sugerencia) {
    try {
      const query = `
        INSERT INTO sugerencias_citas (
          paciente_id, tipo_sugerencia, titulo, descripcion,
          datos_sugerencia, nivel_confianza
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      const values = [
        sugerencia.paciente_id,
        sugerencia.tipo_sugerencia,
        sugerencia.titulo,
        sugerencia.descripcion,
        JSON.stringify(sugerencia.datos_sugerencia),
        sugerencia.nivel_confianza
      ];

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error guardando sugerencia:', error);
      throw error;
    }
  }

  /**
   * Obtener sugerencias para un paciente
   */
  static async getSugerenciasPaciente(pacienteId, estado = 'pendiente') {
    try {
      const query = `
        SELECT sc.*, p.nombre as paciente_nombre
        FROM sugerencias_citas sc
        JOIN pacientes p ON sc.paciente_id = p.id
        WHERE sc.paciente_id = $1
        AND sc.estado = $2
        ORDER BY sc.nivel_confianza DESC, sc.creada_en DESC
      `;
      const result = await pool.query(query, [pacienteId, estado]);
      return result.rows;
    } catch (error) {
      console.error('Error obteniendo sugerencias:', error);
      return [];
    }
  }

  /**
   * Responder a una sugerencia
   */
  static async responderSugerencia(sugerenciaId, respuesta) {
    try {
      const query = `
        UPDATE sugerencias_citas
        SET estado = $1,
            respondida_en = CURRENT_TIMESTAMP,
            respuesta_usuario = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `;
      const result = await pool.query(query, [
        respuesta.estado,
        respuesta.comentario,
        sugerenciaId
      ]);
      return result.rows[0];
    } catch (error) {
      console.error('Error respondiendo sugerencia:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas del sistema
   */
  static async getEstadisticas() {
    try {
      // Estadísticas generales
      const statsQuery = `
        SELECT
          COUNT(*) as total_sugerencias,
          COUNT(CASE WHEN estado = 'aceptada' THEN 1 END) as aceptadas,
          COUNT(CASE WHEN estado = 'rechazada' THEN 1 END) as rechazadas,
          COUNT(CASE WHEN estado = 'ignorada' THEN 1 END) as ignoradas,
          AVG(nivel_confianza) as confianza_promedio,
          COUNT(CASE WHEN tipo_sugerencia = 'horario' THEN 1 END) as horario,
          COUNT(CASE WHEN tipo_sugerencia = 'medico' THEN 1 END) as medico,
          COUNT(CASE WHEN tipo_sugerencia = 'preparacion' THEN 1 END) as preparacion,
          COUNT(CASE WHEN tipo_sugerencia = 'recordatorio' THEN 1 END) as recordatorio
        FROM sugerencias_citas
        WHERE creada_en >= CURRENT_DATE - INTERVAL '30 days'
      `;
      const statsResult = await pool.query(statsQuery);
      const stats = statsResult.rows[0];

      // Tasa de aceptación
      const tasaAceptacion = stats.total_sugerencias > 0
        ? Math.round((stats.aceptadas / stats.total_sugerencias) * 100)
        : 0;

      return {
        total: parseInt(stats.total_sugerencias),
        aceptadas: parseInt(stats.aceptadas),
        rechazadas: parseInt(stats.rechazadas),
        ignoradas: parseInt(stats.ignoradas),
        tasa_aceptacion: tasaAceptacion,
        confianza_promedio: parseFloat(stats.confianza_promedio || 0),
        por_tipo: {
          horario: parseInt(stats.horario),
          medico: parseInt(stats.medico),
          preparacion: parseInt(stats.preparacion),
          recordatorio: parseInt(stats.recordatorio)
        },
        periodo: '30 días'
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return {};
    }
  }
}

module.exports = { SugerenciasCitas, initializeSugerenciasTables };