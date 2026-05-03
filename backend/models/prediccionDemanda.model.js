/**
 * MODELO DE PREDICCIÓN DE DEMANDA
 * Sistema de ML para predecir demanda de citas médicas
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
 * Inicializar tablas de predicción si no existen
 */
const initializePrediccionTables = async () => {
  const checkTable = async (tableName) => {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = $1
      )
    `, [tableName]);
    return result.rows[0].exists;
  };

  const tablesExist = await checkTable('predicciones_demanda');

  if (tablesExist) {
    console.log('✅ Tablas de predicción ya existen');
    return;
  }

  // Tabla de predicciones de demanda
  const createPrediccionesTable = `
    CREATE TABLE predicciones_demanda (
      id SERIAL PRIMARY KEY,
      fecha_predicha DATE NOT NULL,
      hora_predicha TIME NOT NULL,
      demanda_estimada INTEGER NOT NULL,
      demanda_real INTEGER,
      confianza DECIMAL(5,2),
      tipo_dia VARCHAR(20),
      estacion VARCHAR(20),
      factores_extras TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX idx_predicciones_fecha ON predicciones_demanda(fecha_predicha);
    CREATE INDEX idx_predicciones_hora ON predicciones_demanda(hora_predicha);
    CREATE INDEX idx_predicciones_tipo ON predicciones_demanda(tipo_dia);
  `;

  // Tabla de días críticos
  const createDiasCriticosTable = `
    CREATE TABLE dias_criticos (
      id SERIAL PRIMARY KEY,
      fecha DATE NOT NULL,
      severidad VARCHAR(20) NOT NULL,
      razon TEXT NOT NULL,
      demanda_estimada INTEGER NOT NULL,
      capacidad_total INTEGER NOT NULL,
    porcentaje_ocupacion DECIMAL(5,2) NOT NULL,
      alerta_activa BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX idx_dias_criticos_fecha ON dias_criticos(fecha);
    CREATE INDEX idx_dias_criticos_severidad ON dias_criticos(severidad);
  `;

  // Tabla de métricas de ocupación histórica
  const createMetricasTable = `
    CREATE TABLE metricas_ocupacion (
      id SERIAL PRIMARY KEY,
      fecha DATE NOT NULL,
      hora TIME NOT NULL,
      citas_total INTEGER NOT NULL,
      citas_completadas INTEGER DEFAULT 0,
      citas_canceladas INTEGER DEFAULT 0,
      citas_no_presentadas INTEGER DEFAULT 0,
      doctores_disponibles INTEGER DEFAULT 1,
      especialidad VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX idx_metricas_fecha ON metricas_ocupacion(fecha);
    CREATE INDEX idx_metricas_hora ON metricas_ocupacion(hora);
    CREATE INDEX idx_metricas_especialidad ON metricas_ocupacion(especialidad);
  `;

  try {
    await pool.query(createPrediccionesTable);
    await pool.query(createDiasCriticosTable);
    await pool.query(createMetricasTable);
    console.log('✅ Tablas de predicción creadas correctamente');
  } catch (error) {
    console.error('❌ Error creando tablas de predicción:', error);
    throw error;
  }
};

/**
 * Algoritmo de predicción de demanda (simplificado)
 * En producción, esto podría usar scikit-learn, TensorFlow, etc.
 */
class PrediccionDemanda {
  /**
   * Obtener datos históricos de ocupación
   */
  static async getDatosHistoricos(dias = 30) {
    const query = `
      SELECT
        fecha,
        EXTRACT(DOW FROM fecha) as dia_semana,
        EXTRACT(DAY FROM fecha) as dia_mes,
        EXTRACT(MONTH FROM fecha) as mes,
        hora,
        AVG(citas_total) as avg_citas,
        AVG(citas_completadas) as avg_completadas,
        AVG(doctores_disponibles) as avg_doctores
      FROM metricas_ocupacion
      WHERE fecha >= CURRENT_DATE - INTERVAL '${dias} days'
      GROUP BY fecha, hora
      ORDER BY fecha, hora
    `;

    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error obteniendo datos históricos:', error);
      return [];
    }
  }

  /**
   * Calcular predicción de demanda para una fecha/hora específica
   * Algoritmo simplificado basado en patrones históricos
   */
  static async calcularPrediccion(fecha, hora) {
    try {
      // Obtener datos históricos para el mismo día de la semana y hora
      const diaSemana = new Date(fecha).getDay();
      const horaStr = hora.toString().substring(0, 5);

      const query = `
        SELECT
          AVG(citas_total) as avg_citas,
          STDDEV(citas_total) as std_citas,
          AVG(citas_completadas) as avg_completadas,
          COUNT(*) as muestras
        FROM metricas_ocupacion
        WHERE EXTRACT(DOW FROM fecha) = $1
        AND hora = $2
        AND fecha >= CURRENT_DATE - INTERVAL '60 days'
      `;

      const result = await pool.query(query, [diaSemana, horaStr]);

      if (result.rows.length === 0 || !result.rows[0].muestras) {
        // Si no hay datos históricos, usar predicción base
        return this.getPrediccionBase(diaSemana, horaStr);
      }

      const historico = result.rows[0];
      const avgCitas = Math.round(historico.avg_citas || 5);
      const confianza = Math.min(95, 50 + (historico.muestras * 2));

      // Factores estacionales
      const mes = new Date(fecha).getMonth();
      const estacion = this.getEstacion(mes);
      const factorEstacional = this.getFactorEstacional(estacion);

      // Ajustar predicción con factores
      const prediccion = Math.round(avgCitas * factorEstacional);

      return {
        fecha_predicha: fecha,
        hora_predicha: horaStr,
        demanda_estimada: Math.max(1, prediccion),
        demanda_real: null,
        confianza: confianza,
        tipo_dia: this.getTipoDia(diaSemana),
        estacion: estacion,
        factores_extras: JSON.stringify({
          avg_historico: avgCitas,
          factor_estacional: factorEstacional,
          muestras: historico.muestras
        })
      };
    } catch (error) {
      console.error('Error calculando predicción:', error);
      return this.getPrediccionBase(new Date(fecha).getDay(), hora.toString().substring(0, 5));
    }
  }

  /**
   * Obtener predicción base cuando no hay datos históricos
   */
  static getPrediccionBase(diaSemana, hora) {
    const horaNum = parseInt(hora.split(':')[0]);
    let base = 3;

    // Ajustar por hora (más citas en horarios centrales)
    if (horaNum >= 8 && horaNum <= 11) base = 5;
    else if (horaNum >= 14 && horaNum <= 17) base = 6;
    else if (horaNum >= 18 && horaNum <= 20) base = 4;
    else base = 2;

    // Ajustar por día de la semana
    if (diaSemana === 1 || diaSemana === 2) base *= 1.2; // Lunes y martes
    else if (diaSemana === 5) base *= 1.3; // Viernes
    else if (diaSemana === 0) base *= 0.6; // Domingo

    return {
      fecha_predicha: new Date().toISOString().split('T')[0],
      hora_predicha: hora,
      demanda_estimada: Math.max(1, Math.round(base)),
      demanda_real: null,
      confianza: 40,
      tipo_dia: this.getTipoDia(diaSemana),
      estacion: 'primavera',
      factores_extras: JSON.stringify({ tipo: 'prediccion_base' })
    };
  }

  /**
   * Obtener estación del año
   */
  static getEstacion(mes) {
    if (mes >= 2 && mes <= 4) return 'primavera';
    if (mes >= 5 && mes <= 7) return 'verano';
    if (mes >= 8 && mes <= 10) return 'otoño';
    return 'invierno';
  }

  /**
   * Obtener factor estacional
   */
  static getFactorEstacional(estacion) {
    const factores = {
      'primavera': 1.2,  // Alergias, check-ups de inicio de año
      'verano': 0.9,     // Menos citas (vacaciones)
      'otoño': 1.1,      // Regreso a rutina
      'invierno': 1.3    // Gripe, resfriados
    };
    return factores[estacion] || 1.0;
  }

  /**
   * Obtener tipo de día
   */
  static getTipoDia(diaSemana) {
    const tipos = {
      0: 'domingo',
      1: 'lunes',
      2: 'martes',
      3: 'miercoles',
      4: 'jueves',
      5: 'viernes',
      6: 'sabado'
    };
    return tipos[diaSemana] || 'desconocido';
  }

  /**
   * Generar predicciones para los próximos 7 días
   */
  static async generarPrediccionesSemanal() {
    try {
      const predicciones = [];
      const horas = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

      for (let i = 0; i < 7; i++) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + i);
        const fechaStr = fecha.toISOString().split('T')[0];

        for (const hora of horas) {
          const prediccion = await this.calcularPrediccion(fechaStr, hora);

          // Guardar en BD
          await pool.query(`
            INSERT INTO predicciones_demanda
            (fecha_predicha, hora_predicha, demanda_estimada, confianza, tipo_dia, estacion, factores_extras)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT DO NOTHING
          `, [
            prediccion.fecha_predicha,
            prediccion.hora_predicha,
            prediccion.demanda_estimada,
            prediccion.confianza,
            prediccion.tipo_dia,
            prediccion.estacion,
            prediccion.factores_extras
          ]);

          predicciones.push(prediccion);
        }
      }

      console.log(`✅ ${predicciones.length} predicciones generadas`);
      return predicciones;
    } catch (error) {
      console.error('Error generando predicciones:', error);
      throw error;
    }
  }

  /**
   * Identificar días críticos (alta demanda)
   */
  static async identificarDiasCriticos() {
    try {
      // Obtener predicciones para los próximos 7 días
      const query = `
        SELECT
          fecha_predicha,
          SUM(demanda_estimada) as total_demanda,
          COUNT(*) as horas_con_prediccion
        FROM predicciones_demanda
        WHERE fecha_predicha >= CURRENT_DATE
        AND fecha_predicha <= CURRENT_DATE + INTERVAL '7 days'
        GROUP BY fecha_predicha
        ORDER BY fecha_predicha
      `;

      const result = await pool.query(query);
      const diasCriticos = [];

      for (const row of result.rows) {
        const capacidadTotal = 40; // Capacidad máxima por día
        const porcentajeOcupacion = (row.total_demanda / capacidadTotal) * 100;
        const demandaPromedio = row.total_demanda / row.horas_con_prediccion;

        let severidad = 'baja';
        let razon = 'Demanda normal';

        if (porcentajeOcupacion >= 90) {
          severidad = 'alta';
          razon = `Sobrecarga prevista: ${Math.round(porcentajeOcupacion)}% de capacidad`;
        } else if (porcentajeOcupacion >= 75) {
          severidad = 'media';
          razon = `Alta demanda prevista: ${Math.round(porcentajeOcupacion)}% de capacidad`;
        }

        // Guardar día crítico si la demanda es alta
        if (severidad !== 'baja') {
          await pool.query(`
            INSERT INTO dias_criticos
            (fecha, severidad, razon, demanda_estimada, capacidad_total, porcentaje_ocupacion)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (fecha) DO UPDATE
            SET severidad = EXCLUDED.severidad,
                razon = EXCLUDED.razon,
                demanda_estimada = EXCLUDED.demanda_estimada,
                porcentaje_ocupacion = EXCLUDED.porcentaje_ocupacion,
                alerta_activa = true
          `, [
            row.fecha_predicha,
            severidad,
            razon,
            row.total_demanda,
            capacidadTotal,
            porcentajeOcupacion
          ]);

          diasCriticos.push({
            fecha: row.fecha_predicha,
            severidad,
            razon,
            demanda_estimada: row.total_demanda,
            capacidad_total: capacidadTotal,
            porcentaje_ocupacion: porcentajeOcupacion
          });
        }
      }

      console.log(`✅ ${diasCriticos.length} días críticos identificados`);
      return diasCriticos;
    } catch (error) {
      console.error('Error identificando días críticos:', error);
      throw error;
    }
  }

  /**
   * Obtener predicciones para el dashboard
   */
  static async getPrediccionesDashboard() {
    try {
      const query = `
        SELECT
          fecha_predicha,
          hora_predicha,
          demanda_estimada,
          confianza,
          tipo_dia,
          estacion
        FROM predicciones_demanda
        WHERE fecha_predicha >= CURRENT_DATE
        AND fecha_predicha <= CURRENT_DATE + INTERVAL '7 days'
        ORDER BY fecha_predicha, hora_predicha
      `;

      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error obteniendo predicciones dashboard:', error);
      throw error;
    }
  }

  /**
   * Obtener días críticos para alertas
   */
  static async getDiasCriticos() {
    try {
      const query = `
        SELECT
          fecha,
          severidad,
          razon,
          demanda_estimada,
          capacidad_total,
          porcentaje_ocupacion
        FROM dias_criticos
        WHERE fecha >= CURRENT_DATE
        AND alerta_activa = true
        ORDER BY fecha ASC
        LIMIT 10
      `;

      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error obteniendo días críticos:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de ocupación histórica
   */
  static async getEstadisticasOcupacion() {
    try {
      const query = `
        SELECT
          AVG(citas_total) as avg_citas_diarias,
          MAX(citas_total) as max_citas_diarias,
          MIN(citas_total) as min_citas_diarias,
          AVG(citas_completadas) as avg_completadas,
          AVG(citas_canceladas) as avg_canceladas,
          AVG(citas_no_presentadas) as avg_no_presentadas
        FROM metricas_ocupacion
        WHERE fecha >= CURRENT_DATE - INTERVAL '30 days'
      `;

      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}

// Inicializar tablas y generar predicciones al cargar módulo
initializePrediccionTables()
  .then(() => PrediccionDemanda.generarPrediccionesSemanal())
  .then(() => PrediccionDemanda.identificarDiasCriticos())
  .catch(console.error);

module.exports = { PrediccionDemanda };
