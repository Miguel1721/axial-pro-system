/**
 * Script de prueba para la API de Alertas de Stock
 */

const express = require('express');
const alertasRoutes = require('./routes/alertasStock.routes');

const app = express();
app.use(express.json());
app.use('/api/alertas-stock', alertasRoutes);

const PORT = 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor de prueba corriendo en http://localhost:${PORT}`);

  // Pruebas básicas
  setTimeout(async () => {
    console.log('\n📊 Probando endpoints...');

    try {
      // Test GET /api/alertas-stock
      const response1 = await fetch(`http://localhost:${PORT}/api/alertas-stock`);
      const data1 = await response1.json();
      console.log(`✅ GET /api/alertas-stock: ${data1.total_alertas} alertas encontradas`);

      // Test GET /api/alertas-stock/estadisticas
      const response2 = await fetch(`http://localhost:${PORT}/api/alertas-stock/estadisticas`);
      const data2 = await response2.json();
      console.log(`✅ GET /api/alertas-stock/estadisticas: ${data2.data.total_medicamentos} medicamentos`);

      // Test GET /api/alertas-stock/inventario
      const response3 = await fetch(`http://localhost:${PORT}/api/alertas-stock/inventario`);
      const data3 = await response3.json();
      console.log(`✅ GET /api/alertas-stock/inventario: ${data3.data.length} items en inventario`);

      console.log('\n🎉 ¡Todos los endpoints funcionan correctamente!');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error en pruebas:', error.message);
      process.exit(1);
    }
  }, 1000);
});