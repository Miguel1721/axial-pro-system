/**
 * RUTAS DE ALERTAS DE STOCK INTELIGENTES
 * API para el sistema de gestión de inventario médico
 */

const express = require('express');
const router = express.Router();
const { AlertasStock } = require('../models/alertasStock.model');
const mockData = require('../mockData');
const { mockAlertas, mockInventario, mockEstadisticas } = mockData;

/**
 * @route   GET /api/alertas-stock/detectar
 * @desc    Detectar todas las alertas de stock
 * @access  Private
 */
router.get('/detectar', async (req, res) => {
  try {
    let alertas;
    try {
      alertas = await AlertasStock.detectarAlertas();
    } catch (dbError) {
      console.log('Using mock data (DB not available):', dbError.message);
      alertas = mockAlertas;
    }

    res.json({
      success: true,
      data: alertas,
      total_alertas: alertas.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error detectando alertas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al detectar alertas de stock',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/alertas-stock
 * @desc    Obtener alertas pendientes
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    let alertas;
    try {
      alertas = await AlertasStock.getAlertasPendientes();
    } catch (dbError) {
      console.log('Using mock data (DB not available):', dbError.message);
      alertas = mockAlertas.filter(a => a.estado === 'pendiente');
    }

    res.json({
      success: true,
      data: alertas,
      total_alertas: alertas.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error obteniendo alertas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener alertas',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/alertas-stock/estadisticas
 * @desc    Obtener estadísticas del inventario
 * @access  Private
 */
router.get('/estadisticas', async (req, res) => {
  try {
    let estadisticas;
    try {
      estadisticas = await AlertasStock.getEstadisticas();
    } catch (dbError) {
      console.log('Using mock data (DB not available):', dbError.message);
      estadisticas = mockEstadisticas;
    }

    // Calcular métricas adicionales
    const metricas = {
      ...estadisticas,
      porcentaje_bajo_stock: estadisticas.total_medicamentos > 0
        ? Math.round((estadisticas.bajo_stock / estadisticas.total_medicamentos) * 100)
        : 0,
      porcentaje_vencimiento_critico: estadisticas.total_medicamentos > 0
        ? Math.round((estadisticas.vencimiento_critico / estadisticas.total_medicamentos) * 100)
        : 0,
      dias_estimados_agotamiento: estadisticas.promedio_stock > 0
        ? Math.round(estadisticas.promedio_stock / 3) // Suponiendo uso promedio de 3 unidades/día
        : 0
    };

    res.json({
      success: true,
      data: metricas,
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
 * @route   GET /api/alertas-stock/mejores-movimientos
 * @desc    Obtener medicamentos con mejor movimiento
 * @access  Private
 */
router.get('/mejores-movimientos', async (req, res) => {
  try {
    const movimientos = await AlertasStock.getMejoresMovimientos();

    res.json({
      success: true,
      data: movimientos,
      total: movimientos.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error obteniendo movimientos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener movimientos',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/alertas-stock/tipos
 * @desc    Obtener tipos de alertas disponibles
 * @access  Private
 */
router.get('/tipos', (req, res) => {
  try {
    const tipos = [
      {
        id: 'bajo_stock',
        nombre: 'Stock Bajo',
        descripcion: 'Medicamentos con stock por debajo del mínimo',
        icon: '⚠️',
        color: 'red'
      },
      {
        id: 'sin_stock',
        nombre: 'Sin Stock',
        description: 'Medicamentos agotados',
        icon: '🚨',
        color: 'red'
      },
      {
        id: 'vencimiento',
        nombre: 'Vencimiento Próximo',
        description: 'Medicamentos próximos a vencer',
        icon: '⏰',
        color: 'orange'
      },
      {
        id: 'precio',
        nombre: 'Aumento de Precio',
        description: 'Medicamentos con aumento inusual de precio',
        icon: '📈',
        color: 'yellow'
      },
      {
        id: 'reabastecer',
        nombre: 'Reabastecer',
        description: 'Sugerencia de compra basada en uso',
        icon: '📦',
        color: 'blue'
      }
    ];

    res.json({
      success: true,
      data: tipos,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener tipos de alertas',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/alertas-stock/procesar/:id
 * @desc    Marcar alerta como procesada
 * @access  Private
 */
router.post('/procesar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de alerta inválido'
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario requerido'
      });
    }

    const alertaProcesada = await AlertasStock.marcarProcesada(parseInt(id), userId);

    res.json({
      success: true,
      data: alertaProcesada,
      message: 'Alerta marcada como procesada exitosamente'
    });
  } catch (error) {
    console.error('Error procesando alerta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar alerta',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/alertas-stock/movimiento
 * @desc    Simular movimiento de inventario
 * @access  Private
 */
router.post('/movimiento', async (req, res) => {
  try {
    const { medicamentoId, tipo, cantidad, motivo, userId } = req.body;

    if (!medicamentoId || !tipo || !cantidad) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos'
      });
    }

    if (tipo !== 'entrada' && tipo !== 'salida' && tipo !== 'ajuste') {
      return res.status(400).json({
        success: false,
        message: 'Tipo de movimiento inválido'
      });
    }

    if (!cantidad || cantidad <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Cantidad inválida'
      });
    }

    const movimiento = await AlertasStock.simularMovimiento(
      medicamentoId,
      tipo,
      parseInt(cantidad),
      motivo,
      userId
    );

    // Volver a detectar alertas después del movimiento
    const nuevasAlertas = await AlertasStock.detectarAlertas();

    res.json({
      success: true,
      data: {
        movimiento,
        nuevas_alertas: nuevasAlertas.length,
        mensaje: 'Movimiento registrado exitosamente'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error registrando movimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar movimiento',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/alertas-stock/inventario
 * @desc    Obtener todo el inventario de medicamentos
 * @access  Private
 */
router.get('/inventario', async (req, res) => {
  try {
    const { categoria } = req.query;

    let query = `
      SELECT
        id, nombre, generico, presentacion, concentracion,
        unidad_medida, categoria, proveedor, lote, fecha_vencimiento,
        stock_actual, stock_minimo, stock_maximo,
        precio_compra, precio_venta,
        ROUND((stock_actual * 100.0 / NULLIF(stock_maximo, 0)), 2) as porcentaje_stock,
        CASE
          WHEN stock_actual = 0 THEN 'sin_stock'
          WHEN stock_actual <= stock_minimo THEN 'bajo_stock'
          WHEN stock_actual > stock_maximo * 0.8 THEN 'alto_stock'
          ELSE 'normal'
        END as estado_stock,
        fecha_vencimiento - CURRENT_DATE as dias_para_vencer
      FROM medicamentos_inventario
      WHERE activo = true
    `;

    if (categoria) {
      query += ` AND categoria = '${categoria}'`;
    }

    query += ` ORDER BY categoria, nombre`;

    let inventario;
    try {
      const result = await pool.query(query);
      inventario = result.rows;
    } catch (dbError) {
      console.log('Using mock data (DB not available):', dbError.message);
      inventario = categoria ?
        mockInventario.filter(m => m.categoria === categoria) :
        mockInventario;
    }

    // Agregar información adicional a cada medicamento
    const inventarioConInfo = inventario.map(med => ({
      ...med,
      stock_dias: med.stock_maximo > 0 ? Math.round(med.stock_actual / 3) : 0,
      necesita_reabastecer: med.stock_actual <= med.stock_minimo ||
                          (med.dias_para_vencer && med.dias_para_vencer <= 30),
      porcentaje_alerta: med.stock_actual <= med.stock_minimo ? 100 :
                       med.stock_actual <= med.stock_minimo * 1.5 ? 75 :
                       med.stock_actual <= med.stock_minimo * 2 ? 50 : 25
    }));

    res.json({
      success: true,
      data: inventarioConInfo,
      total: inventarioConInfo.length,
      categorias: [...new Set(inventario.map(m => m.categoria))],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error obteniendo inventario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener inventario',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/alertas-stock/inventario
 * @desc    Agregar o actualizar medicamento
 * @access  Private
 */
router.post('/inventario', async (req, res) => {
  try {
    const {
      nombre, generico, presentacion, concentracion, unidad_medida,
      categoria, proveedor, lote, fecha_vencimiento, stock_actual,
      stock_minimo, stock_maximo, precio_compra, precio_venta
    } = req.body;

    if (!nombre || !presentacion || !categoria || !unidad_medida) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos'
      });
    }

    // Verificar si el medicamento ya existe
    const existing = await pool.query(`
      SELECT id FROM medicamentos_inventario
      WHERE nombre = $1 AND presentacion = $2 AND concentracion = $3
    `, [nombre, presentacion, concentracion]);

    if (existing.rows.length > 0) {
      // Actualizar medicamento existente
      const updateQuery = `
        UPDATE medicamentos_inventario
        SET generico = $1, proveedor = $2, lote = $3, fecha_vencimiento = $4,
            stock_actual = $5, stock_minimo = $6, stock_maximo = $7,
            precio_compra = $8, precio_venta = $9, updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING *
      `;

      const result = await pool.query(updateQuery, [
        generico, proveedor, lote, fecha_vencimiento,
        stock_actual, stock_minimo, stock_maximo,
        precio_compra, precio_venta,
        existing.rows[0].id
      ]);

      res.json({
        success: true,
        data: result.rows[0],
        message: 'Medicamento actualizado exitosamente'
      });
    } else {
      // Crear nuevo medicamento
      const insertQuery = `
        INSERT INTO medicamentos_inventario (
          nombre, generico, presentacion, concentracion, unidad_medida,
          categoria, proveedor, lote, fecha_vencimiento, stock_actual,
          stock_minimo, stock_maximo, precio_compra, precio_venta
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
      `;

      const result = await pool.query(insertQuery, [
        nombre, generico, presentacion, concentracion, unidad_medida,
        categoria, proveedor, lote, fecha_vencimiento, stock_actual,
        stock_minimo, stock_maximo, precio_compra, precio_venta
      ]);

      res.json({
        success: true,
        data: result.rows[0],
        message: 'Medicamento creado exitosamente'
      });
    }
  } catch (error) {
    console.error('Error guardando medicamento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al guardar medicamento',
      error: error.message
    });
  }
});

module.exports = router;