/**
 * MODELO DE ALERTAS DE STOCK INTELIGENTES
 * Sistema de predicción y optimización de inventario médico
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
 * Inicializar tablas de alertas de stock si no existen
 */
const initializeAlertasStockTables = async () => {
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

  const alertasTableExists = await checkTable('alertas_stock');
  const inventarioTableExists = await checkTable('medicamentos_inventario');
  const historialMovimientosTableExists = await checkTable('historial_movimientos');

  // Crear tabla de medicamentos si no existe
  if (!inventarioTableExists) {
    const createInventarioTable = `
      CREATE TABLE medicamentos_inventario (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(200) NOT NULL,
        generico VARCHAR(200),
        presentacion VARCHAR(100) NOT NULL,
        concentracion DECIMAL(10,2),
        unidad_medida VARCHAR(50) NOT NULL,
        categoria VARCHAR(50) NOT NULL,
        proveedor VARCHAR(100),
        lote VARCHAR(50),
        fecha_vencimiento DATE,
        stock_actual INTEGER NOT NULL DEFAULT 0,
        stock_minimo INTEGER NOT NULL DEFAULT 10,
        stock_maximo INTEGER NOT NULL DEFAULT 100,
        precio_compra DECIMAL(10,2),
        precio_venta DECIMAL(10,2),
        umbral_alerta INTEGER DEFAULT 15,
        dias_expiracion INTEGER DEFAULT 30,
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_inventario_nombre ON medicamentos_inventario(nombre);
      CREATE INDEX idx_inventario_categoria ON medicamentos_inventario(categoria);
      CREATE INDEX idx_inventario_stock ON medicamentos_inventario(stock_actual);
      CREATE INDEX idx_inventario_vencimiento ON medicamentos_inventario(fecha_vencimiento);
    `;
    await pool.query(createInventarioTable);
    console.log('✅ Tabla de inventario creada');
  }

  // Crear tabla de historial de movimientos
  if (!historialMovimientosTableExists) {
    const createHistorialTable = `
      CREATE TABLE historial_movimientos (
        id SERIAL PRIMARY KEY,
        medicamento_id INTEGER REFERENCES medicamentos_inventario(id),
        tipo_movimiento VARCHAR(20) NOT NULL, -- entrada, salida, ajuste
        cantidad INTEGER NOT NULL,
        motivo TEXT,
        usuario_id INTEGER,
        fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_movimientos_medicamento ON historial_movimientos(medicamento_id);
      CREATE INDEX idx_movimientos_fecha ON historial_movimientos(fecha_movimiento);
      CREATE INDEX idx_movimientos_tipo ON historial_movimientos(tipo_movimiento);
    `;
    await pool.query(createHistorialTable);
    console.log('✅ Tabla de historial creada');
  }

  // Crear tabla de alertas de stock
  if (!alertasTableExists) {
    const createAlertasTable = `
      CREATE TABLE alertas_stock (
        id SERIAL PRIMARY KEY,
        medicamento_id INTEGER REFERENCES medicamentos_inventario(id),
        tipo_alerta VARCHAR(20) NOT NULL, -- bajo_stock, vencimiento, precio, reabastecer
        severidad VARCHAR(20) DEFAULT 'media', -- bajo, media, alta, critica
        titulo VARCHAR(200) NOT NULL,
        descripcion TEXT NOT NULL,
        sugerencia TEXT,
        estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, procesada, resuelta
        creado_por INTEGER,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_resolucion TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_alertas_medicamento ON alertas_stock(medicamento_id);
      CREATE INDEX idx_alertas_tipo ON alertas_stock(tipo_alerta);
      CREATE INDEX idx_alertas_severidad ON alertas_stock(severidad);
      CREATE INDEX idx_alertas_estado ON alertas_stock(estado);
      CREATE INDEX idx_alertas_fecha ON alertas_stock(fecha_creacion);
    `;
    await pool.query(createAlertasTable);
    console.log('✅ Tabla de alertas de stock creada');
  }

  // Insertar datos de prueba si la tabla está vacía
  await insertarDatosPrueba();
};

/**
 * Insertar datos de prueba iniciales
 */
const insertarDatosPrueba = async () => {
  try {
    const count = await pool.query('SELECT COUNT(*) FROM medicamentos_inventario');
    if (parseInt(count.rows[0].count) === 0) {
      const medicamentos = [
        { nombre: 'Ibuprofeno', generico: 'Ibuprofeno', presentacion: 'Tabletas', concentracion: 400, unidad: 'mg', categoria: 'Analgésico', stock_actual: 25, stock_minimo: 10, stock_maximo: 100 },
        { nombre: 'Amoxicilina', generico: 'Amoxicilina', presentacion: 'Capsulas', concentracion: 500, unidad: 'mg', categoria: 'Antibiótico', stock_actual: 8, stock_minimo: 20, stock_maximo: 150 },
        { nombre: 'Paracetamol', generico: 'Paracetamol', presentacion: 'Jarabe', concentracion: 120, unidad: 'mg/ml', categoria: 'Analgésico', stock_actual: 45, stock_minimo: 15, stock_maximo: 200 },
        { nombre: 'Loratadina', generico: 'Loratadina', presentacion: 'Tabletas', concentracion: 10, unidad: 'mg', categoria: 'Antihistamínico', stock_actual: 35, stock_minimo: 10, stock_maximo: 80 },
        { nombre: 'Omeprazol', generico: 'Omeprazol', presentacion: 'Capsulas', concentracion: 20, unidad: 'mg', categoria: 'Gastroprotector', stock_actual: 12, stock_minimo: 15, stock_maximo: 100 }
      ];

      for (const med of medicamentos) {
        await pool.query(`
          INSERT INTO medicamentos_inventario (
            nombre, generico, presentacion, concentracion, unidad_medida,
            categoria, stock_actual, stock_minimo, stock_maximo,
            precio_compra, precio_venta, umbral_alerta
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
          med.nombre, med.generico, med.presentacion, med.concentracion, med.unidad,
          med.categoria, med.stock_actual, med.stock_minimo, med.stock_maximo,
          Math.random() * 100 + 10, // precio_compra aleatorio
          Math.random() * 200 + 20, // precio_venta aleatorio
          15
        ]);
      }

      console.log('✅ Datos de prueba insertados');
    }
  } catch (error) {
    console.log('Error al insertar datos de prueba:', error.message);
  }
};

/**
 * Clase principal para alertas de stock
 */
class AlertasStock {
  /**
   * Detectar todas las alertas de stock
   */
  static async detectarAlertas() {
    const alertas = [];

    try {
      // Alertas de bajo stock
      alertas.push(...await this.detectarBajoStock());

      // Alertas de vencimiento
      alertas.push(...await this.detectarVencimiento());

      // Alertas de precio
      alertas.push(...await this.detectarPrecios());

      // Alertas de reabastecimiento
      alertas.push(...await this.sugerirReabastecimiento());

      return alertas;
    } catch (error) {
      console.error('Error detectando alertas:', error);
      return [];
    }
  }

  /**
   * Detectar medicamentos con bajo stock
   */
  static async detectarBajoStock() {
    const query = `
      SELECT
        id, nombre, stock_actual, stock_minimo,
        ROUND((stock_actual * 100.0 / stock_minimo), 2) as porcentaje_stock
      FROM medicamentos_inventario
      WHERE stock_actual <= stock_minimo AND activo = true
      ORDER BY stock_actual ASC
    `;

    const result = await pool.query(query);
    const alertas = [];

    for (const med of result.rows) {
      let severidad = 'media';
      let tipo_alerta = 'bajo_stock';

      if (med.stock_actual === 0) {
        severidad = 'critica';
        tipo_alerta = 'sin_stock';
      } else if (med.stock_actual <= med.stock_minimo * 0.5) {
        severidad = 'alta';
      }

      alertas.push({
        id: Date.now() + Math.random(),
        medicamento_id: med.id,
        tipo_alerta,
        severidad,
        titulo: `🚨 Stock Bajo: ${med.nombre}`,
        descripcion: `El stock actual (${med.stock_actual}) está por debajo del mínimo requerido (${med.stock_minimo})`,
        sugerencia: `Solicitar ${med.stock_minimo - med.stock_actual + 10} unidades para mantener stock adecuado`,
        fecha_creacion: new Date().toISOString(),
        medicamento: med
      });
    }

    return alertas;
  }

  /**
   * Detectar medicamentos próximos a vencer
   */
  static async detectarVencimiento() {
    const query = `
      SELECT
        id, nombre, stock_actual, fecha_vencimiento,
        fecha_vencimiento - CURRENT_DATE as dias_para_vencer
      FROM medicamentos_inventario
      WHERE fecha_vencimiento <= CURRENT_DATE + INTERVAL '30 days'
      AND fecha_vencimiento >= CURRENT_DATE
      AND activo = true
      ORDER BY dias_para_vencer ASC
    `;

    const result = await pool.query(query);
    const alertas = [];

    for (const med of result.rows) {
      let severidad = 'media';
      let tipo_alerta = 'vencimiento';

      if (med.dias_para_vencer <= 7) {
        severidad = 'critica';
      } else if (med.dias_para_vencer <= 14) {
        severidad = 'alta';
      }

      alertas.push({
        id: Date.now() + Math.random(),
        medicamento_id: med.id,
        tipo_alerta,
        severidad,
        titulo: `⚠️ Vencimiento Próximo: ${med.nombre}`,
        descripcion: `El medicamento vence en ${med.dias_para_vencer} días`,
        sugerencia: 'Priorizar uso de este medicamento. Contactar proveedor para devolución o descuento',
        fecha_creacion: new Date().toISOString(),
        medicamento: med
      });
    }

    return alertas;
  }

  /**
   * Detectar cambios anormales en precios
   */
  static async detectarPrecios() {
    // Simulación de detección de precios
    const preciosAnormales = [
      { id: 1, nombre: 'Ibuprofeno', precio_actual: 250, precio_promedio: 120, variacion: 108 },
      { id: 2, nombre: 'Amoxicilina', precio_actual: 85, precio_promedio: 60, variacion: 42 }
    ];

    const alertas = [];

    for (const med of preciosAnormales) {
      if (med.variacion > 50) { // Más de 50% de variación
        alertas.push({
          id: Date.now() + Math.random(),
          medicamento_id: med.id,
          tipo_alerta: 'precio',
          severidad: 'alta',
          titulo: `📈 Aumento de Precio: ${med.nombre}`,
          descripcion: `El precio ha aumentado un ${med.variacion}% respecto al promedio`,
          sugerencia: 'Revisar con proveedor. Considerar buscar alternativas o negociar precio',
          fecha_creacion: new Date().toISOString(),
          medicamento: med
        });
      }
    }

    return alertas;
  }

  /**
   * Sugerir reabastecimiento basado en patrón de uso
   */
  static async sugerirReabastecimiento() {
    // Simulación de análisis de patrones
    const sugerencias = [
      {
        id: 1,
        nombre: 'Paracetamol',
        stock_actual: 45,
        stock_minimo: 15,
        uso_diario_estimado: 8,
        dias_restantes: 5,
        sugerido: 60
      },
      {
        id: 2,
        nombre: 'Loratadina',
        stock_actual: 35,
        stock_minimo: 10,
        uso_diario_estimado: 3,
        dias_restantes: 11,
        sugerido: 40
      }
    ];

    const alertas = [];

    for (const med of sugerencias) {
      if (med.dias_restantes <= 7) {
        alertas.push({
          id: Date.now() + Math.random(),
          medicamento_id: med.id,
          tipo_alerta: 'reabastecer',
          severidad: 'media',
          titulo: `📦 Sugerencia de Reabastecimiento: ${med.nombre}`,
          descripcion: `Con el stock actual, se agotaría en ${med.dias_restantes} días`,
          sugerencia: `Solicitar ${med.sugerido} unidades (basado en uso de ${med.uso_diario_estimado} unidades/día)`,
          fecha_creacion: new Date().toISOString(),
          medicamento: med
        });
      }
    }

    return alertas;
  }

  /**
   * Obtener alertas no procesadas
   */
  static async getAlertasPendientes() {
    try {
      const query = `
        SELECT a.*, m.nombre as medicamento_nombre, m.presentacion, m.unidad_medida
        FROM alertas_stock a
        JOIN medicamentos_inventario m ON a.medicamento_id = m.id
        WHERE a.estado = 'pendiente'
        ORDER BY a.severidad DESC, a.fecha_creacion ASC
      `;

      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error obteniendo alertas:', error);
      return [];
    }
  }

  /**
   * Marcar alerta como procesada
   */
  static async marcarProcesada(alertaId, userId) {
    try {
      const query = `
        UPDATE alertas_stock
        SET estado = 'procesada',
            fecha_resolucion = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;

      const result = await pool.query(query, [alertaId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error marcando alerta:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de inventario
   */
  static async getEstadisticas() {
    try {
      const query = `
        SELECT
          COUNT(*) as total_medicamentos,
          COUNT(CASE WHEN stock_actual <= stock_minimo THEN 1 END) as bajo_stock,
          COUNT(CASE WHEN fecha_vencimiento <= CURRENT_DATE + INTERVAL '7 days' THEN 1 END) as vencimiento_critico,
          COUNT(CASE WHEN fecha_vencimiento <= CURRENT_DATE + INTERVAL '30 days' THEN 1 END) as vencimiento_proximo,
          COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as alertas_pendientes,
          COUNT(CASE WHEN estado = 'procesada' THEN 1 END) as alertas_procesadas,
          AVG(stock_actual) as promedio_stock,
          MIN(stock_actual) as stock_minimo_global,
          MAX(stock_actual) as stock_maximo_global
        FROM medicamentos_inventario
        WHERE activo = true
      `;

      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return null;
    }
  }

  /**
   * Obtener medicamentos con mejor movimiento
   */
  static async getMejoresMovimientos() {
    try {
      const query = `
        SELECT
          m.id, m.nombre, m.stock_actual, m.stock_minimo,
          COUNT(h.id) as movimientos_30dias,
          SUM(CASE WHEN h.tipo_movimiento = 'salida' THEN h.cantidad ELSE 0 END) as total_salidas,
          ROUND(AVG(CASE WHEN h.tipo_movimiento = 'salida' THEN h.cantidad END), 2) as promedio_salida
        FROM medicamentos_inventario m
        LEFT JOIN historial_movimientos h ON m.id = h.medicamento_id
          AND h.fecha_movimiento >= CURRENT_DATE - INTERVAL '30 days'
        WHERE m.activo = true
        GROUP BY m.id, m.nombre, m.stock_actual, m.stock_minimo
        ORDER BY movimientos_30dias DESC
        LIMIT 10
      `;

      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error obteniendo movimientos:', error);
      return [];
    }
  }

  /**
   * Simular movimiento de inventario
   */
  static async simularMovimiento(medicamentoId, tipo, cantidad, motivo, userId) {
    try {
      // Actualizar stock
      const updateQuery = `
        UPDATE medicamentos_inventario
        SET stock_actual = CASE
          WHEN $2 = 'entrada' THEN stock_actual + $3
          WHEN $2 = 'salida' THEN stock_actual - $3
          ELSE stock_actual
        END,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND activo = true
        RETURNING *
      `;

      const result = await pool.query(updateQuery, [medicamentoId, tipo, cantidad]);
      const medicamento = result.rows[0];

      // Registrar movimiento
      const movimientoQuery = `
        INSERT INTO historial_movimientos (
          medicamento_id, tipo_movimiento, cantidad, motivo, usuario_id
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      await pool.query(movimientoQuery, [medicamentoId, tipo, cantidad, motivo, userId]);

      return medicamento;
    } catch (error) {
      console.error('Error simulando movimiento:', error);
      throw error;
    }
  }
}

// Inicializar tablas al cargar módulo
initializeAlertasStockTables().catch(console.error);

module.exports = { AlertasStock };