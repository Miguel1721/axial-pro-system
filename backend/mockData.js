/**
 * Datos mock para desarrollo sin base de datos
 */

const mockAlertas = [
  {
    id: 1,
    medicamento_id: 1,
    medicamento_nombre: 'Amoxicilina',
    presentacion: 'Capsulas',
    tipo_alerta: 'bajo_stock',
    severidad: 'alta',
    titulo: '🚨 Stock Bajo: Amoxicilina',
    descripcion: 'El stock actual (8) está por debajo del mínimo requerido (20)',
    sugerencia: 'Solicitar 32 unidades para mantener stock adecuado',
    estado: 'pendiente',
    fecha_creacion: new Date().toISOString()
  },
  {
    id: 2,
    medicamento_id: 2,
    medicamento_nombre: 'Ibuprofeno',
    presentacion: 'Tabletas',
    tipo_alerta: 'vencimiento',
    severidad: 'media',
    titulo: '⚠️ Vencimiento Próximo: Ibuprofeno',
    descripcion: 'El medicamento vence en 25 días',
    sugerencia: 'Priorizar uso de este medicamento',
    estado: 'pendiente',
    fecha_creacion: new Date().toISOString()
  },
  {
    id: 3,
    medicamento_id: 3,
    medicamento_nombre: 'Paracetamol',
    presentacion: 'Jarabe',
    tipo_alerta: 'reabastecer',
    severidad: 'baja',
    titulo: '📦 Reabastecer Paracetamol',
    descripcion: 'Stock óptimo próximo al mínimo. Considerar próximo pedido',
    sugerencia: 'Programar compra para la próxima semana',
    estado: 'pendiente',
    fecha_creacion: new Date().toISOString()
  }
];

const mockInventario = [
  {
    id: 1,
    nombre: 'Ibuprofeno',
    generico: 'Ibuprofeno',
    presentacion: 'Tabletas',
    concentracion: 400,
    unidad_medida: 'mg',
    categoria: 'Analgésico',
    stock_actual: 25,
    stock_minimo: 10,
    stock_maximo: 100,
    precio_compra: 1200,
    precio_venta: 2500,
    umbral_alerta: 15,
    dias_expiracion: 30,
    activo: true,
    dias_para_vencer: 25,
    stock_dias: 8,
    estado_stock: 'normal',
    necesita_reabastecer: false,
    porcentaje_alerta: 25
  },
  {
    id: 2,
    nombre: 'Amoxicilina',
    generico: 'Amoxicilina',
    presentacion: 'Capsulas',
    concentracion: 500,
    unidad_medida: 'mg',
    categoria: 'Antibiótico',
    stock_actual: 8,
    stock_minimo: 20,
    stock_maximo: 150,
    precio_compra: 4500,
    precio_venta: 8500,
    umbral_alerta: 15,
    dias_expiracion: 30,
    activo: true,
    dias_para_vencer: 45,
    stock_dias: 3,
    estado_stock: 'bajo_stock',
    necesita_reabastecer: true,
    porcentaje_alerta: 100
  },
  {
    id: 3,
    nombre: 'Paracetamol',
    generico: 'Paracetamol',
    presentacion: 'Jarabe',
    concentracion: 120,
    unidad_medida: 'mg/ml',
    categoria: 'Analgésico',
    stock_actual: 85,
    stock_minimo: 15,
    stock_maximo: 200,
    precio_compra: 800,
    precio_venta: 1800,
    umbral_alerta: 15,
    dias_expiracion: 30,
    activo: true,
    dias_para_vencer: 120,
    stock_dias: 28,
    estado_stock: 'normal',
    necesita_reabastecer: false,
    porcentaje_alerta: 15
  }
];

const mockEstadisticas = {
  total_medicamentos: 45,
  bajo_stock: 3,
  vencimiento_critico: 2,
  vencimiento_proximo: 8,
  alertas_pendientes: 3,
  alertas_procesadas: 28,
  promedio_stock: 35.6,
  stock_minimo_global: 0,
  stock_maximo_global: 200,
  porcentaje_bajo_stock: 7,
  porcentaje_vencimiento_critico: 4,
  dias_estimados_agotamiento: 12
};

module.exports = {
  mockAlertas,
  mockInventario,
  mockEstadisticas
};