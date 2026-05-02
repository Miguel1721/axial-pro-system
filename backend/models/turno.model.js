/**
 * MODELO DE TURNO - Sistema de Gestión de Turnos
 * Base de datos: PostgreSQL (usando tabla existente o creando nueva)
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'axial_pro_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

/**
 * Inicializar tabla de turnos si no existe
 */
const initializeTurnosTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS turnos (
      id SERIAL PRIMARY KEY,
      cita_id INTEGER REFERENCES citas(id),
      paciente_id INTEGER REFERENCES pacientes(id),
      doctor_id INTEGER REFERENCES usuarios(id),
      servicio_id INTEGER REFERENCES servicios(id),
      numero_turno VARCHAR(20) UNIQUE NOT NULL,
      estado VARCHAR(20) DEFAULT 'esperando',
      prioridad INTEGER DEFAULT 3,
      hora_llegada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      hora_atencion TIMESTAMP,
      hora_fin TIMESTAMP,
      tiempo_estimado INTEGER,
      tiempo_real INTEGER,
      sala VARCHAR(50),
      observaciones TEXT,
      creado_por INTEGER REFERENCES usuarios(id),
      actualizado_por INTEGER REFERENCES usuarios(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_turnos_estado ON turnos(estado);
    CREATE INDEX IF NOT EXISTS idx_turnos_prioridad ON turnos(prioridad);
    CREATE INDEX IF NOT EXISTS idx_turnos_doctor ON turnos(doctor_id);
    CREATE INDEX IF NOT EXISTS idx_turnos_fecha ON turnos(hora_llegada);
  `;

  try {
    await pool.query(createTableQuery);
    console.log('✅ Tabla de turnos inicializada correctamente');
  } catch (error) {
    console.error('❌ Error inicializando tabla de turnos:', error);
    throw error;
  }
};

/**
 * Modelo de Turno
 */
class Turno {
  /**
   * Crear un nuevo turno
   */
  static async create(data) {
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
    } = data;

    // Generar número de turno único
    const numero_turno = await this.generateNumeroTurno(doctor_id);

    const query = `
      INSERT INTO turnos (
        cita_id, paciente_id, doctor_id, servicio_id,
        numero_turno, prioridad, tiempo_estimado, sala,
        observaciones, creado_por
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      cita_id, paciente_id, doctor_id, servicio_id,
      numero_turno, prioridad, tiempo_estimado, sala,
      observaciones, creado_por
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creando turno:', error);
      throw error;
    }
  }

  /**
   * Generar número de turno único
   */
  static async generateNumeroTurno(doctor_id) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');

    // Contar turnos de este doctor hoy
    const countQuery = `
      SELECT COUNT(*) as count
      FROM turnos
      WHERE doctor_id = $1
      AND DATE(hora_llegada) = CURRENT_DATE
    `;

    const result = await pool.query(countQuery, [doctor_id]);
    const count = parseInt(result.rows[0].count) + 1;

    return `${dateStr}-D${doctor_id}-${count.toString().padStart(3, '0')}`;
  }

  /**
   * Obtener todos los turnos (con filtros)
   */
  static async getAll(filters = {}) {
    let query = `
      SELECT t.*, p.nombre as paciente_nombre, p.apellido as paciente_apellido,
             u.nombre as doctor_nombre, u.apellido as doctor_apellido,
             s.nombre as servicio_nombre
      FROM turnos t
      LEFT JOIN pacientes p ON t.paciente_id = p.id
      LEFT JOIN usuarios u ON t.doctor_id = u.id
      LEFT JOIN servicios s ON t.servicio_id = s.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    // Filtros
    if (filters.estado) {
      query += ` AND t.estado = $${paramCount}`;
      values.push(filters.estado);
      paramCount++;
    }

    if (filters.doctor_id) {
      query += ` AND t.doctor_id = $${paramCount}`;
      values.push(filters.doctor_id);
      paramCount++;
    }

    if (filters.fecha) {
      query += ` AND DATE(t.hora_llegada) = $${paramCount}`;
      values.push(filters.fecha);
      paramCount++;
    }

    query += ' ORDER BY t.prioridad ASC, t.hora_llegada ASC';

    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error obteniendo turnos:', error);
      throw error;
    }
  }

  /**
   * Obtener turno por ID
   */
  static async getById(id) {
    const query = `
      SELECT t.*, p.nombre as paciente_nombre, p.apellido as paciente_apellido,
             u.nombre as doctor_nombre, u.apellido as doctor_apellido,
             s.nombre as servicio_nombre
      FROM turnos t
      LEFT JOIN pacientes p ON t.paciente_id = p.id
      LEFT JOIN usuarios u ON t.doctor_id = u.id
      LEFT JOIN servicios s ON t.servicio_id = s.id
      WHERE t.id = $1
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error obteniendo turno:', error);
      throw error;
    }
  }

  /**
   * Obtener turno por número
   */
  static async getByNumero(numero_turno) {
    const query = `
      SELECT t.*, p.nombre as paciente_nombre, p.apellido as paciente_apellido,
             u.nombre as doctor_nombre, u.apellido as doctor_apellido,
             s.nombre as servicio_nombre
      FROM turnos t
      LEFT JOIN pacientes p ON t.paciente_id = p.id
      LEFT JOIN usuarios u ON t.doctor_id = u.id
      LEFT JOIN servicios s ON t.servicio_id = s.id
      WHERE t.numero_turno = $1
    `;

    try {
      const result = await pool.query(query, [numero_turno]);
      return result.rows[0];
    } catch (error) {
      console.error('Error obteniendo turno por número:', error);
      throw error;
    }
  }

  /**
   * Actualizar estado de turno
   */
  static async updateEstado(id, estado, additionalData = {}) {
    const updates = ['estado = $2', 'updated_at = CURRENT_TIMESTAMP'];
    const values = [id, estado];
    let paramCount = 3;

    // Actualizar hora según estado
    if (estado === 'atendiendo') {
      updates.push('hora_atencion = CURRENT_TIMESTAMP');
    } else if (estado === 'completado') {
      updates.push('hora_fin = CURRENT_TIMESTAMP');
    }

    // Datos adicionales
    Object.keys(additionalData).forEach(key => {
      updates.push(`${key} = $${paramCount}`);
      values.push(additionalData[key]);
      paramCount++;
    });

    const query = `
      UPDATE turnos
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error actualizando estado de turno:', error);
      throw error;
    }
  }

  /**
   * Calcular tiempo promedio de espera
   */
  static async getTiempoPromedioEspera(doctor_id = null) {
    let query = `
      SELECT
        AVG(EXTRACT(EPOCH FROM (hora_atencion - hora_llegada))) as tiempo_promedio
      FROM turnos
      WHERE hora_atencion IS NOT NULL
    `;
    const values = [];

    if (doctor_id) {
      query += ' AND doctor_id = $1';
      values.push(doctor_id);
    }

    try {
      const result = await pool.query(query, values);
      const tiempoPromedio = result.rows[0].tiempo_promedio;
      return tiempoPromedio ? Math.round(tiempoPromedio / 60) : 15; // Retorna en minutos
    } catch (error) {
      console.error('Error calculando tiempo promedio:', error);
      return 15; // Default 15 minutos
    }
  }

  /**
   * Obtener estadísticas de turnos de hoy
   */
  static async getEstadisticasHoy(doctor_id = null) {
    let query = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'esperando' THEN 1 ELSE 0 END) as esperando,
        SUM(CASE WHEN estado = 'atendiendo' THEN 1 ELSE 0 END) as atendiendo,
        SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) as completados,
        SUM(CASE WHEN estado = 'cancelado' THEN 1 ELSE 0 END) as cancelados,
        AVG(CASE WHEN hora_fin IS NOT NULL AND hora_atencion IS NOT NULL
          THEN EXTRACT(EPOCH FROM (hora_fin - hora_atencion))/60
          ELSE NULL END) as tiempo_promedio_atencion
      FROM turnos
      WHERE DATE(hora_llegada) = CURRENT_DATE
    `;
    const values = [];

    if (doctor_id) {
      query += ' AND doctor_id = $1';
      values.push(doctor_id);
    }

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  /**
   * Obtener turno actual de un doctor
   */
  static async getTurnoActual(doctor_id) {
    const query = `
      SELECT t.*, p.nombre as paciente_nombre, p.apellido as paciente_apellido,
             s.nombre as servicio_nombre
      FROM turnos t
      LEFT JOIN pacientes p ON t.paciente_id = p.id
      LEFT JOIN servicios s ON t.servicio_id = s.id
      WHERE t.doctor_id = $1
      AND t.estado = 'atendiendo'
      ORDER BY t.hora_atencion DESC
      LIMIT 1
    `;

    try {
      const result = await pool.query(query, [doctor_id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error obteniendo turno actual:', error);
      throw error;
    }
  }

  /**
   * Obtener siguiente turno en cola
   */
  static async getSiguienteTurno(doctor_id) {
    const query = `
      SELECT t.*, p.nombre as paciente_nombre, p.apellido as paciente_apellido,
             p.telefono as paciente_telefono,
             s.nombre as servicio_nombre
      FROM turnos t
      LEFT JOIN pacientes p ON t.paciente_id = p.id
      LEFT JOIN servicios s ON t.servicio_id = s.id
      WHERE t.doctor_id = $1
      AND t.estado = 'esperando'
      ORDER BY t.prioridad ASC, t.hora_llegada ASC
      LIMIT 1
    `;

    try {
      const result = await pool.query(query, [doctor_id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error obteniendo siguiente turno:', error);
      throw error;
    }
  }

  /**
   * Calcular tiempo estimado de espera para un turno
   */
  static async calcularTiempoEstimado(turno_id) {
    const turno = await this.getById(turno_id);
    if (!turno) return null;

    const query = `
      SELECT
        SUM(
          CASE
            WHEN t2.estado = 'atendiendo' THEN
              COALESCE(t2.tiempo_estimado, 15) -
              EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - t2.hora_atencion))/60
            WHEN t2.estado = 'esperando' THEN
              COALESCE(t2.tiempo_estimado, 15)
            ELSE 0
          END
        ) as minutos_restantes
      FROM turnos t2
      WHERE t2.doctor_id = $1
      AND t2.estado IN ('esperando', 'atendiendo')
      AND (
        (t2.prioridad < $2) OR
        (t2.prioridad = $2 AND t2.hora_llegada <= $3)
      )
    `;

    const values = [turno.doctor_id, turno.prioridad, turno.hora_llegada];

    try {
      const result = await pool.query(query, values);
      const minutosRestantes = parseFloat(result.rows[0].minutos_restantes) || 0;
      return Math.max(0, Math.round(minutosRestantes));
    } catch (error) {
      console.error('Error calculando tiempo estimado:', error);
      return 15;
    }
  }

  /**
   * Eliminar turno (soft delete)
   */
  static async delete(id) {
    const query = `
      UPDATE turnos
      SET estado = 'cancelado',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error eliminando turno:', error);
      throw error;
    }
  }
}

// Inicializar tabla al cargar módulo
initializeTurnosTable().catch(console.error);

module.exports = Turno;