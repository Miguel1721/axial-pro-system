/**
 * MODELO SIMPLIFICADO DE ALERTAS
 * Sistema de alertas de medicamentos - versión simple y funcional
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
 * Inicializar tabla única de alertas
 */
const initializeAlertasTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS alertas_sistema (
      id SERIAL PRIMARY KEY,
      tipo_alerta VARCHAR(50) NOT NULL,
      severidad VARCHAR(20) DEFAULT 'media',
      titulo VARCHAR(200) NOT NULL,
      descripcion TEXT NOT NULL,
      medicamento_nombre VARCHAR(200),
      paciente_nombre VARCHAR(150),
      accion_recomendada TEXT,
      estado VARCHAR(20) DEFAULT 'pendiente',
      fecha_alerta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      metadata JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_alertas_tipo ON alertas_sistema(tipo_alerta);
    CREATE INDEX IF NOT EXISTS idx_alertas_estado ON alertas_sistema(estado);
    CREATE INDEX IF NOT EXISTS idx_alertas_fecha ON alertas_sistema(fecha_alerta);
  `;

  try {
    await pool.query(createTableQuery);
    console.log('✅ Tabla de alertas inicializada correctamente');
  } catch (error) {
    console.error('❌ Error inicializando tabla de alertas:', error);
  }
};

/**
 * Modelo de Alertas Simplificado
 */
class AlertaSistema {
  /**
   * Crear alerta de stock bajo
   */
  static async crearAlertaStockBajo(nombreMedicamento, stockActual, stockMinimo) {
    const query = `
      INSERT INTO alertas_sistema (
        tipo_alerta, severidad, titulo, descripcion, medicamento_nombre,
        accion_recomendada, estado, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'pendiente', $7)
      RETURNING *
    `;

    const diasFaltante = Math.max(0, stockMinimo - stockActual);

    const values = [
      'stock_bajo',
      diasFaltante === 0 ? 'alta' : 'media',
      `📦 Stock bajo: ${nombreMedicamento}`,
      `El medicamento ${nombreMedicamento} tiene ${stockActual} unidades, por debajo del mínimo (${stockMinimo}). Faltan ${diasFaltante} unidades.`,
      nombreMedicamento,
      `Reabastecer ${nombreMedicamento}. Stock actual: ${stockActual}, Mínimo: ${stockMinimo}`,
      JSON.stringify({ stock_actual, stock_minimo, diferencia: diasFaltante })
    ];

    try {
      await pool.query(query, values);
      console.log(`⚠️  Alerta creada: Stock bajo - ${nombreMedicamento}`);
    } catch (error) {
      console.error('Error creando alerta de stock bajo:', error);
    }
  }

  /**
   * Crear alerta de vencimiento
   */
  static async crearAlertaVencimiento(nombreMedicamento, fechaVencimiento) {
    const diasParaVencer = calcularDiasParaVencer(fechaVencimiento);

    if (diasParaVencer > 30) return; // Solo alertar si vence en 30 días o menos

    const severidad = diasParaVencer <= 7 ? 'alta' : diasParaVencer <= 15 ? 'media' : 'baja';

    const query = `
      INSERT INTO alertas_sistema (
        tipo_alerta, severidad, titulo, descripcion, medicamento_nombre,
        accion_recomendada, estado, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'pendiente', $7)
      RETURNING *
    `;

    const values = [
      'vencimiento',
      severidad,
      `⏰ Vencimiento próximo: ${nombreMedicamento}`,
      `El medicamento ${nombreMedicamento} vence en ${diasParaVencer} días (${fechaVencimiento}).`,
      nombreMedicamento,
      `Retirar del inventario o contactar proveedor. Vence el ${fechaVencimiento}`,
      JSON.stringify({ fecha_vencimiento, dias_para_vencer: diasParaVencer })
    ];

    try {
      await pool.query(query, values);
      console.log(`⚠️  Alerta creada: Vencimiento - ${nombreMedicamento}`);
    } catch (error) {
      console.error('Error creando alerta de vencimiento:', error);
    }
  }

  /**
   * Crear alerta de interacción
   */
  static async crearAlertaInteraccion(medicamentos, pacienteNombre) {
    const query = `
      INSERT INTO alertas_sistema (
        tipo_alerta, severidad, titulo, descripcion, paciente_nombre,
        accion_recomendada, estado, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'pendiente', $7)
      RETURNING *
    `;

    const values = [
      'interaccion_farmacologica',
      'alta',
      `⚠️ Interacción peligrosa: ${medicamentos.join(' + ')}`,
      `Posible interacción peligrosa entre medicamentos. Paciente: ${pacienteNombre}.`,
      pacienteNombre,
      `Revisar combinación de medicamentos. Considerar monitorear efectos secundarios.`,
      JSON.stringify({ medicamentos })
    ];

    try {
      await pool.query(query, values);
      console.log(`⚠️  Alerta creada: Interacción - ${medicamentos.join(' + ')}`);
    } catch (error) {
      console.error('Error creando alerta de interacción:', error);
    }
  }

  /**
   * Obtener alertas pendientes
   */
  static async getAlertasPendientes(filtros = {}) {
    let query = `
      SELECT * FROM alertas_sistema
      WHERE estado = 'pendiente'
    `;
    const values = [];
    let paramCount = 1;

    if (filtros.severidad && filtros.severidad !== 'todos') {
      query += ` AND severidad = $${paramCount}`;
      values.push(filtros.severidad);
      paramCount++;
    }

    if (filtros.tipo && filtros.tipo !== 'todos') {
      query += ` AND tipo_alerta = $${paramCount}`;
      values.push(filtros.tipo);
      paramCount++;
    }

    query += ' ORDER BY severidad DESC, fecha_alerta DESC';

    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error obteniendo alertas:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de alertas
   */
  static async getEstadisticas() {
    const query = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN tipo_alerta = 'stock_bajo' THEN 1 ELSE 0 END) as stock_bajo,
        SUM(CASE WHEN tipo_alerta = 'vencimiento' THEN 1 ELSE 0 END) as vencimiento,
        SUM(CASE WHEN tipo_alerta = 'interaccion_farmacologica' THEN 1 ELSE 0 END) as interacciones,
        SUM(CASE WHEN severidad = 'alta' THEN 1 ELSE 0 END) as alta_severidad,
        SUM(CASE WHEN severidad = 'media' THEN 1 ELSE 0 END) as media_severidad,
        SUM(CASE WHEN severidad = 'baja' THEN 1 ELSE 0 END) as baja_severidad
      FROM alertas_sistema
      WHERE estado = 'pendiente'
    `;

    try {
      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  /**
   * Resolver alerta
   */
  static async resolverAlerta(id) {
    const query = `
      UPDATE alertas_sistema
      SET estado = 'resuelta',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error resolviendo alerta:', error);
      throw error;
    }
  }

  /**
   * Verificar stock y crear alertas automáticamente
   */
  static async verificarYCrearAlertasStock() {
    const query = `
      SELECT nombre_comercial, stock_actual, stock_minimo
      FROM inventario
      WHERE stock_actual < stock_minimo
      LIMIT 10
    `;

    try {
      const result = await pool.query(query);

      for (const item of result.rows) {
        await this.crearAlertaStockBajo(
          item.nombre_comercial,
          item.stock_actual,
          item.stock_minimo
        );
      }

      return result.rows;
    } catch (error) {
      console.error('Error verificando stock:', error);
      return [];
    }
  }

  /**
   * Buscar medicamentos con vencimiento próximo
   */
  static async buscarMedicamentosPorVencer() {
    const query = `
      SELECT nombre, fecha_vencimiento, stock_actual
      FROM inventario
      WHERE fecha_vencimiento IS NOT NULL
      AND fecha_vencimiento <= CURRENT_DATE + INTERVAL '30 days'
      ORDER BY fecha_vencimiento ASC
      LIMIT 10
    `;

    try {
      const result = await pool.query(query);

      for (const item of result.rows) {
        await this.crearAlertaVencimiento(
          item.nombre,
          item.fecha_vencimiento
        );
      }

      return result.rows;
    } catch (error) {
      console.error('Error buscando medicamentos por vencer:', error);
      return [];
    }
  }
}

/**
 * Calcular días para vencer
 */
function calcularDiasParaVencer(fechaVencimiento) {
  const hoy = new Date();
  const vencimiento = new Date(fechaVencimiento);
  const diffTime = vencimiento - hoy;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Inicializar tabla al cargar módulo
initializeAlertasTable().catch(console.error);

module.exports = AlertaSistema;