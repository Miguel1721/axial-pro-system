/**
 * MODELO DE MEDICAMENTOS Y ALERTAS
 * Sistema de alertas farmacológicas y control de inventario
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
 * Inicializar tablas de medicamentos si no existen
 */
const initializeMedicamentosTables = async () => {
  // Verificar si las tablas ya existen
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

  const tablesExist = await checkTable('farmacia_inventario');

  if (tablesExist) {
    console.log('✅ Tablas de medicamentos ya existen, omitiendo creación');
    return;
  }

  // Tabla de medicamentos
  const createMedicamentosTable = `
    CREATE TABLE farmacia_inventario (
      id SERIAL PRIMARY KEY,
      nombre_comercial VARCHAR(200) NOT NULL,
      nombre_generico VARCHAR(200),
      principio_activo VARCHAR(200),
      laboratorio VARCHAR(100),
      presentacion VARCHAR(100),
      concentracion VARCHAR(50),
      forma_farmaceutica VARCHAR(50),
      stock_actual INTEGER DEFAULT 0,
      stock_minimo INTEGER DEFAULT 10,
      unidad_medida VARCHAR(20) DEFAULT 'unidad',
      precio_unitario DECIMAL(10, 2),
      requiere_receta BOOLEAN DEFAULT false,
      es_controlado BOOLEAN DEFAULT false,
      fecha_vencimiento DATE,
      lote VARCHAR(50),
      estante VARCHAR(50),
      observaciones TEXT,
      activo BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX idx_farmacia_stock ON farmacia_inventario(stock_actual);
    CREATE INDEX idx_farmacia_nombre ON farmacia_inventario(nombre_comercial);
    CREATE INDEX idx_farmacia_vencimiento ON farmacia_inventario(fecha_vencimiento);
  `;

  // Tabla de recetas
  const createRecetasTable = `
    CREATE TABLE recetas (
      id SERIAL PRIMARY KEY,
      paciente_id INTEGER NOT NULL,
      doctor_id INTEGER NOT NULL,
      cita_id INTEGER,
      diagnostico TEXT NOT NULL,
      indicaciones TEXT,
      fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      estado VARCHAR(20) DEFAULT 'activa',
      fecha_vencimiento DATE,
      observaciones TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX idx_recetas_paciente ON recetas(paciente_id);
    CREATE INDEX idx_recetas_doctor ON recetas(doctor_id);
    CREATE INDEX idx_recetas_estado ON recetas(estado);
    CREATE INDEX idx_recetas_vencimiento ON recetas(fecha_vencimiento);
  `;

  // Tabla de detalle de recetas (medicamentos por receta)
  const createRecetasDetalleTable = `
    CREATE TABLE recetas_detalle (
      id SERIAL PRIMARY KEY,
      receta_id INTEGER NOT NULL,
      medicamento_id INTEGER NOT NULL,
      dosis VARCHAR(100),
      frecuencia VARCHAR(100),
      duracion_dias INTEGER,
      cantidad_total INTEGER,
      instrucciones TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX idx_recetas_detalle_receta ON recetas_detalle(receta_id);
    CREATE INDEX idx_recetas_detalle_medicamento ON recetas_detalle(medicamento_id);
  `;

  // Tabla de alertas de medicamentos
  const createAlertasTable = `
    CREATE TABLE alertas_medicamentos (
      id SERIAL PRIMARY KEY,
      tipo_alerta VARCHAR(50) NOT NULL,
      severidad VARCHAR(20) DEFAULT 'media',
      titulo VARCHAR(200) NOT NULL,
      descripcion TEXT NOT NULL,
      medicamento_id INTEGER,
      receta_id INTEGER,
      paciente_id INTEGER,
      accion_recomendada TEXT,
      estado VARCHAR(20) DEFAULT 'pendiente',
      fecha_alerta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      fecha_resolucion TIMESTAMP,
      resuelto_por INTEGER,
      creado_por INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX idx_alertas_tipo ON alertas_medicamentos(tipo_alerta);
    CREATE INDEX idx_alertas_estado ON alertas_medicamentos(estado);
    CREATE INDEX idx_alertas_fecha ON alertas_medicamentos(fecha_alerta);
    CREATE INDEX idx_alertas_severidad ON alertas_medicamentos(severidad);
  `;

  try {
    await pool.query(createMedicamentosTable);
    await pool.query(createRecetasTable);
    await pool.query(createRecetasDetalleTable);
    await pool.query(createAlertasTable);

    console.log('✅ Tablas de medicamentos inicializadas correctamente');
  } catch (error) {
    console.error('❌ Error inicializando tablas de medicamentos:', error);
    throw error;
  }
};

/**
 * Modelo de Medicamento
 */
class Medicamento {
  /**
   * Crear nuevo medicamento
   */
  static async create(data) {
    const {
      nombre_comercial,
      nombre_generico,
      principio_activo,
      laboratorio,
      presentacion,
      concentracion,
      forma_farmaceutica,
      stock_actual = 0,
      stock_minimo = 10,
      unidad_medida = 'unidad',
      precio_unitario,
      requiere_receta = false,
      es_controlado = false,
      fecha_vencimiento,
      lote,
      estante,
      observaciones
    } = data;

    const query = `
      INSERT INTO farmacia_inventario (
        nombre_comercial, nombre_generico, principio_activo, laboratorio,
        presentacion, concentracion, forma_farmaceutica, stock_actual, stock_minimo,
        unidad_medida, precio_unitario, requiere_receta, es_controlado,
        fecha_vencimiento, lote, estante, observaciones
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `;

    const values = [
      nombre_comercial, nombre_generico, principio_activo, laboratorio,
      presentacion, concentracion, forma_farmaceutica, stock_actual, stock_minimo,
      unidad_medida, precio_unitario, requiere_receta, es_controlado,
      fecha_vencimiento, lote, estante, observaciones
    ];

    try {
      const result = await pool.query(query, values);
      const medicamento = result.rows[0];

      // Verificar si hay alertas de stock bajo
      if (medicamento.stock_actual <= medicamento.stock_minimo) {
        await this.crearAlertaStockBajo(medicamento);
      }

      // Verificar si hay vencimiento próximo
      if (medicamento.fecha_vencimiento) {
        const diasParaVencer = this.calcularDiasParaVencer(medicamento.fecha_vencimiento);
        if (diasParaVencer <= 30) {
          await this.crearAlertaVencimiento(medicamento, diasParaVencer);
        }
      }

      return medicamento;
    } catch (error) {
      console.error('Error creando medicamento:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los medicamentos
   */
  static async getAll(filters = {}) {
    let query = `
      SELECT * FROM farmacia_inventario WHERE activo = true
    `;
    const values = [];
    let paramCount = 1;

    if (filters.stock_bajo) {
      query += ` AND stock_actual <= stock_minimo`;
    }

    if (filters.vencimiento_proximo) {
      query += ` AND fecha_vencimiento <= CURRENT_DATE + INTERVAL '30 days'`;
    }

    query += ' ORDER BY nombre_comercial ASC';

    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error obteniendo medicamentos:', error);
      throw error;
    }
  }

  /**
   * Obtener medicamento por ID
   */
  static async getById(id) {
    const query = 'SELECT * FROM farmacia_inventario WHERE id = $1';

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error obteniendo medicamento:', error);
      throw error;
    }
  }

  /**
   * Actualizar stock
   */
  static async actualizarStock(id, cantidad, operacion = 'restar') {
    const query = `
      UPDATE farmacia_inventario
      SET stock_actual = stock_actual ${operacion === 'sumar' ? '+' : '-'} $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [id, cantidad]);
      const medicamento = result.rows[0];

      // Verificar alerta de stock bajo
      if (medicamento.stock_actual <= medicamento.stock_minimo) {
        await this.crearAlertaStockBajo(medicamento);
      }

      return medicamento;
    } catch (error) {
      console.error('Error actualizando stock:', error);
      throw error;
    }
  }

  /**
   * Crear alerta de stock bajo
   */
  static async crearAlertaStockBajo(medicamento) {
    const query = `
      INSERT INTO alertas_medicamentos (
        tipo_alerta, severidad, titulo, descripcion, medicamento_id,
        accion_recomendada, estado
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'pendiente')
      RETURNING *
    `;

    const diasFaltante = Math.max(0, medicamento.stock_minimo - medicamento.stock_actual);

    const values = [
      'stock_bajo',
      diasFaltante === 0 ? 'alta' : 'media',
      `Stock bajo: ${medicamento.nombre_comercial}`,
      `El medicamento ${medicamento.nombre_comercial} tiene ${medicamento.stock_actual} unidades, por debajo del mínimo (${medicamento.stock_minimo}). Faltan ${diasFaltante} unidades.`,
      medicamento.id,
      `Reabastecer ${medicamento.nombre_comercial}. Stock actual: ${medicamento.stock_actual}, Mínimo: ${medicamento.stock_minimo}`
    ];

    try {
      await pool.query(query, values);
      console.log(`⚠️  Alerta creada: Stock bajo - ${medicamento.nombre_comercial}`);
    } catch (error) {
      console.error('Error creando alerta de stock bajo:', error);
    }
  }

  /**
   * Crear alerta de vencimiento
   */
  static async crearAlertaVencimiento(medicamento, diasParaVencer) {
    const query = `
      INSERT INTO alertas_medicamentos (
        tipo_alerta, severidad, titulo, descripcion, medicamento_id,
        accion_recomendada, estado
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'pendiente')
      RETURNING *
    `;

    const severidad = diasParaVencer <= 7 ? 'alta' : diasParaVencer <= 15 ? 'media' : 'baja';

    const values = [
      'vencimiento',
      severidad,
      `Vencimiento próximo: ${medicamento.nombre_comercial}`,
      `El medicamento ${medicamento.nombre_comercial} vence en ${diasParaVencer} días (${medicamento.fecha_vencimiento}).`,
      medicamento.id,
      `Retirar del inventario o contactar proveedor. Vence el ${medicamento.fecha_vencimiento}`
    ];

    try {
      await pool.query(query, values);
      console.log(`⚠️  Alerta creada: Vencimiento - ${medicamento.nombre_comercial}`);
    } catch (error) {
      console.error('Error creando alerta de vencimiento:', error);
    }
  }

  /**
   * Calcular días para vencer
   */
  static calcularDiasParaVencer(fechaVencimiento) {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diffTime = vencimiento - hoy;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Buscar medicamentos
   */
  static async buscar(termino) {
    const query = `
      SELECT * FROM farmacia_inventario
      WHERE activo = true
      AND (
        nombre_comercial ILIKE $1
        OR nombre_generico ILIKE $1
        OR principio_activo ILIKE $1
      )
      ORDER BY nombre_comercial ASC
    `;

    try {
      const result = await pool.query(query, [`%${termino}%`]);
      return result.rows;
    } catch (error) {
      console.error('Error buscando medicamentos:', error);
      throw error;
    }
  }
}

/**
 * Modelo de Receta
 */
class Receta {
  /**
   * Crear nueva receta
   */
  static async create(data) {
    const {
      paciente_id,
      doctor_id,
      cita_id,
      diagnostico,
      indicaciones,
      medicamentos_list, // Array de {medicamento_id, dosis, frecuencia, duracion_dias, cantidad_total}
      fecha_vencimiento,
      observaciones,
      creado_por
    } = data;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Crear receta
      const recetaQuery = `
        INSERT INTO recetas (
          paciente_id, doctor_id, cita_id, diagnostico, indicaciones,
          fecha_vencimiento, observaciones, creado_por
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const recetaValues = [
        paciente_id, doctor_id, cita_id, diagnostico, indicaciones,
        fecha_vencimiento, observaciones, creado_por
      ];

      const recetaResult = await client.query(recetaQuery, recetaValues);
      const receta = recetaResult.rows[0];

      // Agregar medicamentos a la receta
      if (medicamentos_list && medicamentos_list.length > 0) {
        for (const med of medicamentos_list) {
          const detalleQuery = `
            INSERT INTO recetas_detalle (
              receta_id, medicamento_id, dosis, frecuencia, duracion_dias,
              cantidad_total, instrucciones
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
          `;

          await client.query(detalleQuery, [
            receta.id, med.medicamento_id, med.dosis, med.frecuencia,
            med.duracion_dias, med.cantidad_total, med.instrucciones
          ]);

          // Verificar interacciones
          await this.verificarInteracciones(receta.id, med.medicamento_id, paciente_id);
        }
      }

      await client.query('COMMIT');

      console.log(`✅ Receta creada: ${receta.id} - ${medicamentos_list?.length || 0} medicamentos`);

      return receta;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creando receta:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Verificar interacciones farmacológicas
   */
  static async verificarInteracciones(receta_id, medicamento_id, paciente_id) {
    // Lista de interacciones comunes (simplificada)
    const interaccionesPeligrosas = [
      { medicamento1: 'ibuprofeno', medicamento2: 'aspirina', severidad: 'alta', descripcion: 'Riesgo de sangrado gastrointestinal' },
      { medicamento1: 'warfarina', medicamento2: 'aspirina', severidad: 'alta', descripcion: 'Aumento del efecto anticoagulante' },
      { medicamento1: 'diureticos', medicamento2: 'litio', severidad: 'alta', descripcion: 'Toxicidad aumentada' },
      { medicamento1: 'efedrina', medicamento2: 'amantadina', severidad: 'alta', descripcion: 'Hiperserotonina' }
    ];

    try {
      const medicamentoResult = await pool.query(
        'SELECT * FROM medicamentos WHERE id = $1',
        [medicamento_id]
      );

      if (medicamentoResult.rows.length === 0) return;

      const medicamento = medicamentoResult.rows[0];
      const principioActivo = medicamento.principio_activo?.toLowerCase() || '';

      // Buscar interacciones
      for (const interaccion of interaccionesPeligrosas) {
        const interactua = await this.verificaInteraccion(
          interaccion.medicamento1,
          interaccion.medicamento2,
          medicamento_id
        );

        if (interactua) {
          await this.crearAlertaInteraccion(
            receta_id,
            paciente_id,
            interaccion,
            medicamento.nombre_comercial
          );
        }
      }
    } catch (error) {
      console.error('Error verificando interacciones:', error);
    }
  }

  /**
   * Verifica si hay interacción específica
   */
  static async verificaInteraccion(med1, med2, medicamento_id) {
    const query = `
      SELECT COUNT(*) as count
      FROM medicamentos
      WHERE id != $1
      AND (
        LOWER(principio_activo) LIKE LOWER($2)
        OR LOWER(principio_activo) LIKE LOWER($3)
      )
    `;

    try {
      const result = await pool.query(query, [medicamento_id, `%${med1}%`, `%${med2}%`]);
      return result.rows[0].count > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Crear alerta de interacción
   */
  static async crearAlertaInteraccion(receta_id, paciente_id, interaccion, medicamento_nombre) {
    const query = `
      INSERT INTO alertas_medicamentos (
        tipo_alerta, severidad, titulo, descripcion, receta_id,
        paciente_id, accion_recomendada, estado
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendiente')
      RETURNING *
    `;

    const values = [
      'interaccion_farmacologica',
      interaccion.severidad,
      `⚠️ Interacción peligrosa: ${medicamento_nombre}`,
      `Posible interacción: ${interaccion.descripcion}.`,
      receta_id,
      paciente_id,
      `Revisar receta ${receta_id}. Considerar alternativas o monitorear efectos secundarios.`
    ];

    try {
      await pool.query(query, values);
      console.log(`⚠️  Alerta creada: Interacción - ${medicamento_nombre}`);
    } catch (error) {
      console.error('Error creando alerta de interacción:', error);
    }
  }

  /**
   * Obtener recetas de un paciente
   */
  static async getRecetasPaciente(pacienteId, filtros = {}) {
    let query = `
      SELECT r.*, p.nombre as paciente_nombre,
             u.nombre as doctor_nombre
      FROM recetas r
      LEFT JOIN pacientes p ON r.paciente_id = p.id
      LEFT JOIN usuarios u ON r.doctor_id = u.id
      WHERE r.paciente_id = $1
    `;
    const values = [pacienteId];
    let paramCount = 2;

    if (filtros.estado) {
      query += ` AND r.estado = $${paramCount}`;
      values.push(filtros.estado);
      paramCount++;
    }

    query += ' ORDER BY r.fecha_emision DESC';

    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error obteniendo recetas del paciente:', error);
      throw error;
    }
  }

  /**
   * Obtener recetas vencidas
   */
  static async getRecetasVencidas() {
    const query = `
      SELECT r.*, p.nombre as paciente_nombre,
             u.nombre as doctor_nombre
      FROM recetas r
      LEFT JOIN pacientes p ON r.paciente_id = p.id
      LEFT JOIN usuarios u ON r.doctor_id = u.id
      WHERE r.estado = 'activa'
      AND r.fecha_vencimiento < CURRENT_DATE
      ORDER BY r.fecha_vencimiento ASC
    `;

    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error obteniendo recetas vencidas:', error);
      throw error;
    }
  }
}

/**
 * Modelo de Alertas
 */
class Alerta {
  /**
   * Obtener alertas pendientes
   */
  static async getAlertasPendientes(filtros = {}) {
    let query = `
      SELECT a.*, m.nombre_comercial as medicamento_nombre,
             p.nombre as paciente_nombre, p.email as paciente_email
      FROM alertas_medicamentos a
      LEFT JOIN farmacia_inventario m ON a.medicamento_id = m.id
      LEFT JOIN pacientes p ON a.paciente_id = p.id
      WHERE a.estado = 'pendiente'
    `;
    const values = [];
    let paramCount = 1;

    if (filtros.severidad) {
      query += ` AND a.severidad = $${paramCount}`;
      values.push(filtros.severidad);
      paramCount++;
    }

    if (filtros.tipo) {
      query += ` AND a.tipo_alerta = $${paramCount}`;
      values.push(filtros.tipo);
      paramCount++;
    }

    query += ' ORDER BY a.severidad DESC, a.fecha_alerta DESC';

    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error obteniendo alertas pendientes:', error);
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
      FROM alertas_medicamentos
      WHERE estado = 'pendiente'
    `;

    try {
      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      console.error('Error obteniendo estadísticas de alertas:', error);
      throw error;
    }
  }

  /**
   * Resolver alerta
   */
  static async resolverAlerta(id, resuelto_por) {
    const query = `
      UPDATE alertas_medicamentos
      SET estado = 'resuelta',
          fecha_resolucion = CURRENT_TIMESTAMP,
          resuelto_por = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [resuelto_por, id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error resolviendo alerta:', error);
      throw error;
    }
  }
}

/**
 * Crear datos de prueba para medicamentos y alertas
 */
const crearDatosPrueba = async () => {
  try {
    // Verificar si ya hay datos
    const countResult = await pool.query('SELECT COUNT(*) as count FROM farmacia_inventario');
    if (parseInt(countResult.rows[0].count) > 0) {
      console.log('✅ Ya existen datos de medicamentos');
      return;
    }

    console.log('📝 Creando datos de prueba para medicamentos...');

    // Crear medicamentos de prueba
    const medicamentos = [
      {
        nombre_comercial: 'Ibuprofeno 400mg',
        nombre_generico: 'Ibuprofeno',
        principio_activo: 'Ibuprofeno',
        laboratorio: 'Bayer',
        presentacion: 'Caja',
        concentracion: '400mg',
        forma_farmaceutica: 'Tabletas',
        stock_actual: 3,
        stock_minimo: 10,
        unidad_medida: 'unidad',
        precio_unitario: 15.50,
        requiere_receta: false,
        es_controlado: false,
        fecha_vencimiento: '2026-12-01',
        lote: 'IBU400-2026',
        estante: 'A1'
      },
      {
        nombre_comercial: 'Paracetamol 500mg',
        nombre_generico: 'Paracetamol',
        principio_activo: 'Paracetamol',
        laboratorio: 'Genfar',
        presentacion: 'Caja',
        concentracion: '500mg',
        forma_farmaceutica: 'Tabletas',
        stock_actual: 50,
        stock_minimo: 20,
        unidad_medida: 'unidad',
        precio_unitario: 8.00,
        requiere_receta: false,
        es_controlado: false,
        fecha_vencimiento: '2026-05-14', // Vence en 12 días
        lote: 'PAR500-2026',
        estante: 'A2'
      },
      {
        nombre_comercial: 'Amoxicilina 500mg',
        nombre_generico: 'Amoxicilina',
        principio_activo: 'Amoxicilina',
        laboratorio: 'Tecnofarma',
        presentacion: 'Caja',
        concentracion: '500mg',
        forma_farmaceutica: 'Cápsulas',
        stock_actual: 25,
        stock_minimo: 15,
        unidad_medida: 'unidad',
        precio_unitario: 22.00,
        requiere_receta: true,
        es_controlado: false,
        fecha_vencimiento: '2027-01-15',
        lote: 'AMX500-2027',
        estante: 'B1'
      },
      {
        nombre_comercial: 'Warfarina 5mg',
        nombre_generico: 'Warfarina Sódica',
        principio_activo: 'Warfarina',
        laboratorio: 'Roche',
        presentacion: 'Caja',
        concentracion: '5mg',
        forma_farmaceutica: 'Tabletas',
        stock_actual: 30,
        stock_minimo: 10,
        unidad_medida: 'unidad',
        precio_unitario: 45.00,
        requiere_receta: true,
        es_controlado: true,
        fecha_vencimiento: '2027-03-01',
        lote: 'WAR5-2027',
        estante: 'C1'
      },
      {
        nombre_comercial: 'Aspirina 100mg',
        nombre_generico: 'Ácido Acetilsalicílico',
        principio_activo: 'Ácido Acetilsalicílico',
        laboratorio: 'Bayer',
        presentacion: 'Caja',
        concentracion: '100mg',
        forma_farmaceutica: 'Tabletas',
        stock_actual: 100,
        stock_minimo: 30,
        unidad_medida: 'unidad',
        precio_unitario: 12.00,
        requiere_receta: false,
        es_controlado: false,
        fecha_vencimiento: '2027-06-01',
        lote: 'ASP100-2027',
        estante: 'A3'
      }
    ];

    for (const medicamento of medicamentos) {
      await pool.query(`
        INSERT INTO farmacia_inventario (
          nombre_comercial, nombre_generico, principio_activo, laboratorio,
          presentacion, concentracion, forma_farmaceutica, stock_actual, stock_minimo,
          unidad_medida, precio_unitario, requiere_receta, es_controlado,
          fecha_vencimiento, lote, estante
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      `, [
        medicamento.nombre_comercial, medicamento.nombre_generico, medicamento.principio_activo,
        medicamento.laboratorio, medicamento.presentacion, medicamento.concentracion,
        medicamento.forma_farmaceutica, medicamento.stock_actual, medicamento.stock_minimo,
        medicamento.unidad_medida, medicamento.precio_unitario, medicamento.requiere_receta,
        medicamento.es_controlado, medicamento.fecha_vencimiento, medicamento.lote,
        medicamento.estante
      ]);
    }

    // Crear alertas de prueba
    const alertas = [
      {
        tipo_alerta: 'stock_bajo',
        severidad: 'alta',
        titulo: '📦 Stock bajo: Ibuprofeno 400mg',
        descripcion: 'El medicamento Ibuprofeno 400mg tiene solo 3 unidades, por debajo del mínimo (10 unidades). Faltan 7 unidades.',
        accion_recomendada: 'Reabastecer Ibuprofeno 400mg. Stock actual: 3, Mínimo: 10'
      },
      {
        tipo_alerta: 'vencimiento',
        severidad: 'media',
        titulo: '⏰ Vencimiento próximo: Paracetamol 500mg',
        descripcion: 'El medicamento Paracetamol 500mg vence en 12 días (2026-05-14). Se recomienda retirar o contactar proveedor.',
        accion_recomendada: 'Retirar del inventario o contactar proveedor. Vence el 2026-05-14'
      },
      {
        tipo_alerta: 'interaccion_farmacologica',
        severidad: 'alta',
        titulo: '⚠️ Interacción peligrosa: Warfarina + Aspirina',
        descripcion: 'Posible interacción: Aumento del efecto anticoagulante. Paciente: Juan Pérez, Receta #123.',
        paciente_id: 1,
        accion_recomendada: 'Revisar receta 123. Considerar alternativas o monitorear efectos secundarios.'
      }
    ];

    for (const alerta of alertas) {
      await pool.query(`
        INSERT INTO alertas_medicamentos (
          tipo_alerta, severidad, titulo, descripcion, paciente_id, accion_recomendada, estado
        ) VALUES ($1, $2, $3, $4, $5, $6, 'pendiente')
      `, [
        alerta.tipo_alerta, alerta.severidad, alerta.titulo, alerta.descripcion,
        alerta.paciente_id, alerta.accion_recomendada
      ]);
    }

    console.log('✅ Datos de prueba creados correctamente');
  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error);
  }
};

// Inicializar tablas al cargar módulo
initializeMedicamentosTables()
  .then(() => crearDatosPrueba())
  .catch(console.error);

module.exports = { Medicamento, Receta, Alerta };