/**
 * MODELO DE DETECCIÓN DE ANOMALÍAS FINANCIERAS
 * Sistema inteligente para detección de fraudes, errores y patrones sospechosos
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
 * Inicializar tablas de anomalías financieras si no existen
 */
const initializeAnomaliasTables = async () => {
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

  // Crear tabla de transacciones si no existe
  const transaccionesTableExists = await checkTable('transacciones');
  if (!transaccionesTableExists) {
    const createTransaccionesTable = `
      CREATE TABLE transacciones (
        id SERIAL PRIMARY KEY,
        tipo VARCHAR(50) NOT NULL, -- pago, reembolso, ajuste, devolucion
        monto DECIMAL(15,2) NOT NULL,
        moneda VARCHAR(3) DEFAULT 'COP',
        metodo_pago VARCHAR(50), -- efectivo, tarjeta, transferencia, seguro
        paciente_id INTEGER,
        cita_id INTEGER,
        usuario_id INTEGER,
        descripcion TEXT,
        estado VARCHAR(20) DEFAULT 'completada', -- pendiente, completada, anulada, fraudulenta
        referencia VARCHAR(100),
        ubicacion VARCHAR(100), -- caja, en_linea, movil
        ip_address VARCHAR(45),
        dispositivo VARCHAR(100),
        fecha_transaccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_transacciones_fecha ON transacciones(fecha_transaccion);
      CREATE INDEX idx_transacciones_monto ON transacciones(monto);
      CREATE INDEX idx_transacciones_tipo ON transacciones(tipo);
      CREATE INDEX idx_transacciones_paciente ON transacciones(paciente_id);
      CREATE INDEX idx_transacciones_usuario ON transacciones(usuario_id);
    `;
    await pool.query(createTransaccionesTable);
    console.log('✅ Tabla de transacciones creada');
  }

  // Crear tabla de alertas financieras
  const alertasTableExists = await checkTable('alertas_financieras');
  if (!alertasTableExists) {
    const createAlertasTable = `
      CREATE TABLE alertas_financieras (
        id SERIAL PRIMARY KEY,
        tipo_anomalia VARCHAR(50) NOT NULL, -- fraude, error, sospecha, limite_excedido
        severidad VARCHAR(20) DEFAULT 'media', -- baja, media, alta, critica
        nivel_riesgo INTEGER DEFAULT 5, -- 1-10
        transaccion_id INTEGER REFERENCES transacciones(id),
        paciente_id INTEGER,
        usuario_id INTEGER,
        detalles JSONB NOT NULL,
        patron_detectado VARCHAR(100),
        recomendacion TEXT,
        estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, investigando, resuelta, falsa_positiva
        investigado_por INTEGER,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_resolucion TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_alertas_tipo ON alertas_financieras(tipo_anomalia);
      CREATE INDEX idx_alertas_severidad ON alertas_financieras(severidad);
      CREATE INDEX idx_alertas_riesgo ON alertas_financieras(nivel_riesgo);
      CREATE INDEX idx_alertas_estado ON alertas_financieras(estado);
      CREATE INDEX idx_alertas_fecha ON alertas_financieras(fecha_creacion);
    `;
    await pool.query(createAlertasTable);
    console.log('✅ Tabla de alertas financieras creada');
  }

  // Crear tabla de patrones de comportamiento
  const patronesTableExists = await checkTable('patrones_comportamiento');
  if (!patronesTableExists) {
    const createPatronesTable = `
      CREATE TABLE patrones_comportamiento (
        id SERIAL PRIMARY KEY,
        paciente_id INTEGER,
        patron VARCHAR(100) NOT NULL, -- pagos_frecuentes, montos_altos, tiempo_corto, metodologia_cambia
        frecuencia VARCHAR(20), -- diario, semanal, mensual, esporadico
        umbral_minimo DECIMAL(15,2),
        umbral_maximo DECIMAL(15,2),
        count INTEGER DEFAULT 0,
        ultima_ocurrencia TIMESTAMP,
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_patrones_paciente ON patrones_comportamiento(paciente_id);
      CREATE INDEX idx_patrones_tipo ON patrones_comportamiento(patron);
    `;
    await pool.query(createPatronesTable);
    console.log('✅ Tabla de patrones creada');
  }

  // Insertar datos de prueba iniciales
  await insertarDatosPrueba();
};

/**
 * Insertar datos de prueba iniciales
 */
const insertarDatosPrueba = async () => {
  try {
    const countTransacciones = await pool.query('SELECT COUNT(*) FROM transacciones');
    if (parseInt(countTransacciones.rows[0].count) === 0) {
      // Insertar transacciones de prueba con diferentes patrones
      const transacciones = [
        // Transacciones normales
        { tipo: 'pago', monto: 45000, metodo: 'tarjeta', paciente: 1, usuario: 1 },
        { tipo: 'pago', monto: 85000, metodo: 'efectivo', paciente: 2, usuario: 1 },
        { tipo: 'pago', monto: 120000, metodo: 'transferencia', paciente: 3, usuario: 2 },

        // Transacciones con posibles anomalías
        { tipo: 'pago', monto: 500000, metodo: 'tarjeta', paciente: 4, usuario: 1, ip: '192.168.1.100' },
        { tipo: 'reembolso', monto: 250000, paciente: 5, usuario: 3, ip: '10.0.0.50' },
        { tipo: 'pago', monto: 80000, metodo: 'tarjeta', paciente: 1, usuario: 1 }, // Mismo paciente, 2 pagos seguidos
        { tipo: 'pago', monto: 95000, metodo: 'efectivo', paciente: 6, usuario: 4 }
      ];

      for (const trans of transacciones) {
        await pool.query(`
          INSERT INTO transacciones (
            tipo, monto, metodo_pago, paciente_id, usuario_id,
            ip_address, referencia
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          trans.tipo, trans.monto, trans.metodo, trans.paciente, trans.usuario,
          trans.ip || '127.0.0.1', `REF-${Date.now()}-${Math.random()}`
        ]);
      }

      console.log('✅ Datos de prueba insertados');
    }
  } catch (error) {
    console.log('Error al insertar datos de prueba financieros:', error.message);
  }
};

/**
 * Clase principal para detección de anomalías financieras
 */
class AnomaliasFinancieras {
  /**
   * Detectar todas las anomalías en transacciones recientes
   */
  static async detectarAnomalias() {
    const anomalias = [];

    try {
      // Detectar múltiples tipos de anomalías
      anomalias.push(...await this.detectarFraudes());
      anomalias.push(...await this.detectarErrores());
      anomalias.push(...await this.detectarPatronesSospechosos());
      anomalias.push(...await this.detectarLimitesExcedidos());

      return anomalias;
    } catch (error) {
      console.error('Error detectando anomalías financieras:', error);
      return [];
    }
  }

  /**
   * Detectar posibles fraudes usando algoritmo de detección
   */
  static async detectarFraudes() {
    const fraudes = [];

    try {
      // Transacciones inusualmente altas
      const altasQuery = `
        SELECT t.*, p.nombre as paciente_nombre, u.nombre as usuario_nombre
        FROM transacciones t
        JOIN pacientes p ON t.paciente_id = p.id
        JOIN usuarios u ON t.usuario_id = u.id
        WHERE t.monto > 200000
        AND t.fecha_transaccion >= CURRENT_DATE - INTERVAL '30 days'
        AND t.estado != 'anulada'
      `;
      const altasResult = await pool.query(altasQuery);

      for (const trans of altasResult.rows) {
        fraudes.push({
          id: Date.now() + Math.random(),
          tipo_anomalia: 'fraude',
          severidad: trans.monto > 500000 ? 'critica' : 'alta',
          nivel_riesgo: 8,
          transaccion: trans,
          patron_detectado: 'monto_alto_extremo',
          detalles: {
            monto_transaccion: trans.monto,
            umbral_normal: 200000,
            diferencia: trans.monto - 200000,
            porcentaje_exceso: Math.round(((trans.monto - 200000) / 200000) * 100)
          },
          recomendacion: 'Requerir validación administrativa inmediata. Verificar identidad del paciente.',
          paciente_id: trans.paciente_id,
          usuario_id: trans.usuario_id
        });
      }

      // Transacciones con IP diferente a habitual
      const ipQuery = `
        SELECT t.*, p.nombre as paciente_nombre,
               COUNT(*) as transacciones_paciente,
               COUNT(DISTINCT t.ip_address) as ips_diferentes
        FROM transacciones t
        JOIN pacientes p ON t.paciente_id = p.id
        WHERE t.fecha_transaccion >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY t.id, p.id
        HAVING COUNT(DISTINCT t.ip_address) > 1
        AND COUNT(*) > 3
      `;
      const ipResult = await pool.query(ipQuery);

      for (const trans of ipResult.rows) {
        fraudes.push({
          id: Date.now() + Math.random(),
          tipo_anomalia: 'fraude',
          severidad: 'media',
          nivel_riesgo: 6,
          transaccion: trans,
          patron_detectado: 'ip_variable',
          detalles: {
            transacciones_paciente: trans.transacciones_paciente,
            ips_diferentes: trans.ips_diferentes,
            porcentaje_ips: Math.round((trans.ips_diferentes / trans.transacciones_paciente) * 100)
          },
          recomendacion: 'Verificar identidad del paciente. Posible uso no autorizado.',
          paciente_id: trans.paciente_id,
          usuario_id: trans.usuario_id
        });
      }

      return fraudes;
    } catch (error) {
      console.error('Error detectando fraudes:', error);
      return [];
    }
  }

  /**
   * Detectar errores de transacción
   */
  static async detectarErrores() {
    const errores = [];

    try {
      // Montos redondos (posibles errores de entrada)
      const redondosQuery = `
        SELECT *, monto % 1000 = 0 as es_redondo
        FROM transacciones
        WHERE monto % 1000 = 0
        AND monto > 10000
        AND fecha_transaccion >= CURRENT_DATE - INTERVAL '14 days'
        AND estado = 'completada'
      `;
      const redondosResult = await pool.query(redondosQuery);

      for (const trans of redondosResult.rows) {
        errores.push({
          id: Date.now() + Math.random(),
          tipo_anomalia: 'error',
          severidad: 'baja',
          nivel_riesgo: 3,
          transaccion: trans,
          patron_detectado: 'monto_redondo',
          detalles: {
            monto_transaccion: trans.monto,
            es_redondo: trans.es_redondo,
            posible_error: 'Monto redondo podría indicar error de entrada'
          },
          recomendacion: 'Revisar la transacción para confirmar que es correcta.',
          paciente_id: trans.paciente_id,
          usuario_id: trans.usuario_id
        });
      }

      // Transacciones con tiempo demasiado rápido (posible bulk)
      const rapidoQuery = `
        SELECT t1.*, t2.fecha_transaccion as anterior,
               EXTRACT(EPOCH FROM (t1.fecha_transaccion - t2.fecha_transaccion)) as diff_segundos
        FROM transacciones t1
        JOIN transacciones t2 ON t1.paciente_id = t2.paciente_id AND t1.id != t2.id
        WHERE t1.fecha_transaccion >= CURRENT_DATE - INTERVAL '1 hour'
        AND EXTRACT(EPOCH FROM (t1.fecha_transaccion - t2.fecha_transaccion)) < 10
        ORDER BY t1.fecha_transaccion
      `;
      const rapidoResult = await pool.query(rapidoQuery);

      for (const trans of rapidoResult.rows) {
        if (trans.diff_segundos < 30) {
          errores.push({
            id: Date.now() + Math.random(),
            tipo_anomalia: 'error',
            severidad: 'media',
            nivel_riesgo: 5,
            transaccion: trans,
            patron_detectado: 'transacciones_rapidas',
            detalles: {
              tiempo_entre_transacciones: trans.diff_segundos,
              limite_normal: 30,
              posible_bulk: true
            },
            recomendacion: 'Verificar si son transacciones legítimas o bulk processing.',
            paciente_id: trans.paciente_id,
            usuario_id: trans.usuario_id
          });
        }
      }

      return errores;
    } catch (error) {
      console.error('Error detectando errores:', error);
      return [];
    }
  }

  /**
   * Detectar patrones de comportamiento sospechoso
   */
  static async detectarPatronesSospechosos() {
    const patrones = [];

    try {
      // Pagos frecuentes en corto tiempo
      const frecuenteQuery = `
        SELECT paciente_id, COUNT(*) as count,
               MIN(fecha_transaccion) as inicio,
               MAX(fecha_transaccion) as fin,
               EXTRACT(EPOCH FROM (MAX(fecha_transaccion) - MIN(fecha_transaccion))) as duracion_segundos
        FROM transacciones
        WHERE fecha_transaccion >= CURRENT_DATE - INTERVAL '1 day'
        AND tipo = 'pago'
        GROUP BY paciente_id
        HAVING COUNT(*) > 5
      `;
      const frecuenteResult = await pool.query(frecuenteQuery);

      for (const pat of frecuenteResult.rows) {
        const transacciones_hora = (pat.duracion_segundos / 3600) || 1;
        const frecuencia_hora = pat.count / transacciones_hora;

        if (frecuencia_hora > 10) {
          patrones.push({
            id: Date.now() + Math.random(),
            tipo_anomalia: 'sospecha',
            severidad: 'media',
            nivel_riesgo: 6,
            transaccion: pat,
            patron_detectado: 'pagos_frecuentes',
            detalles: {
              transacciones_totales: pat.count,
              duracion_horas: transacciones_hora,
              frecuencia_hora: Math.round(frecuencia_hora),
              limite_normal: 10
            },
            recomendacion: 'Monitorear actividad del paciente. Posible abuso de servicios.',
            paciente_id: pat.paciente_id
          });
        }
      }

      // Cambio repentino en método de pago
      const cambioMetodoQuery = `
        SELECT t.*,
               COUNT(DISTINCT metodo_pago) as metodos_diferentes,
               LAG(metodo_pago) OVER (ORDER BY fecha_transaccion) as metodo_anterior
        FROM transacciones t
        WHERE t.paciente_id = (
          SELECT paciente_id FROM transacciones
          WHERE fecha_transaccion >= CURRENT_DATE - INTERVAL '3 days'
          GROUP BY paciente_id HAVING COUNT(*) >= 3
          LIMIT 1
        )
        AND t.fecha_transaccion >= CURRENT_DATE - INTERVAL '3 days'
      `;
      const cambioResult = await pool.query(cambioMetodoQuery);

      const pacienteMetodos = {};
      for (const trans of cambioResult.rows) {
        if (!pacienteMetodos[trans.paciente_id]) {
          pacienteMetodos[trans.paciente_id] = new Set();
        }
        pacienteMetodos[trans.paciente_id].add(trans.metodo_pago);
      }

      for (const [pacienteId, metodos] of Object.entries(pacienteMetodos)) {
        if (metodos.size > 2) {
          patrones.push({
            id: Date.now() + Math.random(),
            tipo_anomalia: 'sospecha',
            severidad: 'baja',
            nivel_riesgo: 4,
            detalles: {
              paciente_id: pacienteId,
              metodos_diferentes: Array.from(metodos),
              cantidad_metodos: metodos.size,
              limite_normal: 2
            },
            patron_detectado: 'cambio_metodo_pago',
            recomendacion: 'Verificar si el cambio de método de pago es legítimo.',
            paciente_id: parseInt(pacienteId)
          });
        }
      }

      return patrones;
    } catch (error) {
      console.error('Error detectando patrones sospechosos:', error);
      return [];
    }
  }

  /**
   * Detectar cuando se exceden límites predefinidos
   */
  static async detectarLimitesExcedidos() {
    const limites = [];

    try {
      // Límite diario por paciente
      const diarioQuery = `
        SELECT paciente_id, SUM(monto) as monto_total, COUNT(*) as transacciones_count
        FROM transacciones
        WHERE fecha_transaccion >= CURRENT_DATE
        AND tipo = 'pago'
        GROUP BY paciente_id
        HAVING SUM(monto) > 1000000
      `;
      const diarioResult = await pool.query(diarioQuery);

      for (const lim of diarioResult.rows) {
        limites.push({
          id: Date.now() + Math.random(),
          tipo_anomalia: 'limite_excedido',
          severidad: 'critica',
          nivel_riesgo: 9,
          detalles: {
            paciente_id: lim.paciente_id,
            monto_total: lim.monto_total,
            limite_diario: 1000000,
            exceso: lim.monto_total - 1000000,
            transacciones_count: lim.transacciones_count
          },
          patron_detectado: 'limite_diario_excedido',
          recomendacion: '¡Alerta crítica! Excede límite diario requerir autorización especial.',
          paciente_id: lim.paciente_id
        });
      }

      // Límite semanal por usuario
      const semanalQuery = `
        SELECT usuario_id, SUM(monto) as monto_total, COUNT(*) as transacciones_count
        FROM transacciones
        WHERE fecha_transaccion >= CURRENT_DATE - INTERVAL '7 days'
        AND tipo = 'pago'
        GROUP BY usuario_id
        HAVING SUM(monto) > 5000000
      `;
      const semanalResult = await pool.query(semanalQuery);

      for (const lim of semanalResult.rows) {
        limites.push({
          id: Date.now() + Math.random(),
          tipo_anomalia: 'limite_excedido',
          severidad: 'alta',
          nivel_riesgo: 7,
          detalles: {
            usuario_id: lim.usuario_id,
            monto_total: lim.monto_total,
            limite_semanal: 5000000,
            exceso: lim.monto_total - 5000000,
            transacciones_count: lim.transacciones_count
          },
          patron_detectado: 'limite_semanal_excedido',
          recomendacion: 'Usuario excede límite semanal. Revisar actividad.',
          usuario_id: lim.usuario_id
        });
      }

      return limites;
    } catch (error) {
      console.error('Error detectando límites excedidos:', error);
      return [];
    }
  }

  /**
   * Obtener estadísticas financieras
   */
  static async getEstadisticas() {
    try {
      // Estadísticas generales
      const statsQuery = `
        SELECT
          COUNT(*) as total_transacciones,
          SUM(monto) as monto_total,
          AVG(monto) as monto_promedio,
          COUNT(CASE WHEN tipo = 'pago' THEN 1 END) as pagos,
          COUNT(CASE WHEN tipo = 'reembolso' THEN 1 END) as reembolsos,
          COUNT(CASE WHEN tipo = 'devolucion' THEN 1 END) as devoluciones,
          COUNT(CASE WHEN estado = 'fraudulenta' THEN 1 END) as fraudulentas
        FROM transacciones
        WHERE fecha_transaccion >= CURRENT_DATE - INTERVAL '30 days'
      `;
      const statsResult = await pool.query(statsQuery);
      const stats = statsResult.rows[0];

      // Estadísticas de alertas
      const alertasQuery = `
        SELECT
          COUNT(*) as total_alertas,
          COUNT(CASE WHEN severidad = 'critica' THEN 1 END) as criticas,
          COUNT(CASE WHEN severidad = 'alta' THEN 1 END) as altas,
          COUNT(CASE WHEN severidad = 'media' THEN 1 END) as medias,
          COUNT(CASE WHEN severidad = 'baja' THEN 1 END) as bajas
        FROM alertas_financieras
        WHERE fecha_creacion >= CURRENT_DATE - INTERVAL '30 days'
      `;
      const alertasResult = await pool.query(alertasQuery);
      const alertas = alertasResult.rows[0];

      // Porcentajes
      const porcentajes = {
        tasa_fraude: stats.total_transacciones > 0
          ? Math.round((stats.fraudulentas / stats.total_transacciones) * 100)
          : 0,
        alertas_criticas: alertas.total_alertas > 0
          ? Math.round((alertas.criticas / alertas.total_alertas) * 100)
          : 0
      };

      return {
        transacciones: {
          total: parseInt(stats.total_transacciones),
          monto_total: parseFloat(stats.monto_total || 0),
          monto_promedio: parseFloat(stats.monto_promedio || 0),
          pagos: parseInt(stats.pagos),
          reembolsos: parseInt(stats.reembolsos),
          devoluciones: parseInt(stats.devoluciones),
          fraudulentas: parseInt(stats.fraudulentas)
        },
        alertas: {
          total: parseInt(alertas.total_alertas),
          criticas: parseInt(alertas.criticas),
          altas: parseInt(alertas.altas),
          medias: parseInt(alertas.medias),
          bajas: parseInt(alertas.bajas)
        },
        porcentajes,
        periodo: '30 dias'
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas financieras:', error);
      return {};
    }
  }

  /**
   * Guardar alerta detectada
   */
  static async guardarAlerta(alerta) {
    try {
      const query = `
        INSERT INTO alertas_financieras (
          tipo_anomalia, severidad, nivel_riesgo, transaccion_id,
          paciente_id, usuario_id, detalles, patron_detectado,
          recomendacion
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      const values = [
        alerta.tipo_anomalia,
        alerta.severidad,
        alerta.nivel_riesgo,
        alerta.transaccion_id,
        alerta.paciente_id,
        alerta.usuario_id,
        JSON.stringify(alerta.detalles),
        alerta.patron_detectado,
        alerta.recomendacion
      ];

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error guardando alerta financiera:', error);
      throw error;
    }
  }
}

module.exports = { AnomaliasFinancieras, initializeAnomaliasTables };