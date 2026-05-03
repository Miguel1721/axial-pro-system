const { Pool } = require('pg');

// Usar el pool existente o crear uno nuevo
const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'axial_clinic_db',
  user: process.env.DB_USER || 'axial_admin',
  password: process.env.DB_PASSWORD || 'axial_password_123'
});

class InventarioModel {
  // Obtener todos los medicamentos/insumos
  async obtenerInventario() {
    const query = `
      SELECT
        id, nombre, generico, presentacion,
        stock_actual, stock_minimo, stock_maximo,
        unidad_medida, proveedor, precio_unitario,
        ultima_actualizacion, categoria, esencial
      FROM inventario_medico
      ORDER BY categoria, nombre
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Obtener medicamentos con bajo stock
  async obtenerAlertasBajoStock() {
    const query = `
      SELECT
        id, nombre, generico, presentacion,
        stock_actual, stock_minimo, stock_maximo,
        unidad_medida, proveedor, precio_unitario,
        ((stock_actual / stock_minimo) * 100) as porcentaje_stock,
        CASE
          WHEN stock_actual <= stock_minimo * 0.2 THEN 'critico'
          WHEN stock_actual <= stock_minimo * 0.5 THEN 'alto'
          WHEN stock_actual <= stock_minimo * 0.8 THEN 'medio'
          ELSE 'normal'
        END as nivel_urgencia
      FROM inventario_medico
      WHERE stock_actual <= stock_minimo
      ORDER BY porcentaje_stock ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Obtener predicciones de demanda
  async obtenerPrediccionesDemanda() {
    const query = `
      SELECT
        m.id, m.nombre, m.generico,
        AVG(h.cantidad_usada) as promedio_mensual,
        COUNT(h.id) as meses_con_datos,
        m.stock_actual,
        m.stock_minimo,
        (m.stock_actual / NULLIF(AVG(h.cantidad_usada), 0)) as meses_restantes,
        CASE
          WHEN AVG(h.cantidad_usada) > 0 AND m.stock_actual / AVG(h.cantidad_usada) < 2 THEN 'urgente'
          WHEN AVG(h.cantidad_usada) > 0 AND m.stock_actual / AVG(h.cantidad_usada) < 3 THEN 'pronto'
          ELSE 'normal'
        END as prediccion_estado
      FROM inventario_medico m
      LEFT JOIN historial_uso h ON m.id = h.medicamento_id
        AND h.fecha >= CURRENT_DATE - INTERVAL '3 months'
      GROUP BY m.id, m.nombre, m.generico, m.stock_actual, m.stock_minimo
      HAVING AVG(h.cantidad_usada) > 0
      ORDER BY meses_restantes ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Registrar movimiento de inventario
  async registrarMovimiento(movimiento) {
    const { medicamento_id, tipo_movimiento, cantidad, motivo, usuario_id } = movimiento;

    await pool.query('BEGIN');

    try {
      // Actualizar stock
      const updateQuery = `
        UPDATE inventario_medico
        SET stock_actual = stock_actual + $1,
            ultima_actualizacion = CURRENT_TIMESTAMP
        WHERE id = $2
      `;
      await pool.query(updateQuery, [cantidad, medicamento_id]);

      // Registrar movimiento
      const insertQuery = `
        INSERT INTO movimientos_inventario
        (medicamento_id, tipo_movimiento, cantidad, motivo, usuario_id, fecha)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        RETURNING id
      `;
      const result = await pool.query(insertQuery, [
        medicamento_id, tipo_movimiento, cantidad, motivo, usuario_id
      ]);

      await pool.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  }

  // Obtener historial de movimientos
  async obtenerHistorialMovimientos(medicamento_id = null, dias = 30) {
    let query = `
      SELECT
        m.id, m.nombre, m.generico,
        mov.tipo_movimiento, mov.cantidad, mov.motivo,
        mov.fecha, u.nombre as usuario,
        CASE
          WHEN mov.tipo_movimiento = 'entrada' THEN 'Ingreso'
          WHEN mov.tipo_movimiento = 'salida' THEN 'Uso'
          WHEN mov.tipo_movimiento = 'ajuste' THEN 'Ajuste'
          ELSE mov.tipo_movimiento
        END as descripcion_movimiento
      FROM movimientos_inventario mov
      JOIN inventario_medico m ON mov.medicamento_id = m.id
      JOIN usuarios u ON mov.usuario_id = u.id
      WHERE mov.fecha >= CURRENT_DATE - INTERVAL '${dias} days'
    `;

    const params = [];
    if (medicamento_id) {
      query += ' AND mov.medicamento_id = $1';
      params.push(medicamento_id);
    }

    query += ' ORDER BY mov.fecha DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Obtener métricas de inventario
  async obtenerMetricasInventario() {
    const query = `
      SELECT
        COUNT(*) as total_medicamentos,
        COUNT(CASE WHEN stock_actual <= stock_minimo THEN 1 END) as baja_stock,
        COUNT(CASE WHEN stock_actual <= stock_minimo * 0.2 THEN 1 END) as critico,
        SUM(precio_unitario * stock_actual) as valor_total_inventario,
        AVG(CASE WHEN stock_actual <= stock_minimo THEN (stock_actual / stock_minimo) * 100 ELSE 100 END) as porcentaje_promedio
      FROM inventario_medico
    `;
    const result = await pool.query(query);
    return result.rows[0];
  }

  // Proyecciones de stock
  async obtenerProyeccionesStock(medicamento_id) {
    const query = `
      SELECT
        m.id, m.nombre, m.generico,
        m.stock_actual,
        AVG(h.cantidad_usada) as promedio_mensual,
        (m.stock_actual / NULLIF(AVG(h.cantidad_usada), 0)) as meses_restantes,
        m.stock_minimo,
        DATE(CURRENT_DATE + (m.stock_actual / NULLIF(AVG(h.cantidad_usada), 1)) * INTERVAL '30 days') as fecha_estimada_agotamiento
      FROM inventario_medico m
      LEFT JOIN historial_uso h ON m.id = h.medicamento_id
        AND h.fecha >= CURRENT_DATE - INTERVAL '6 months'
      WHERE m.id = $1
      GROUP BY m.id, m.nombre, m.generico, m.stock_actual, m.stock_minimo
      HAVING AVG(h.cantidad_usada) > 0
    `;
    const result = await pool.query(query, [medicamento_id]);
    return result.rows[0];
  }
}

module.exports = new InventarioModel();