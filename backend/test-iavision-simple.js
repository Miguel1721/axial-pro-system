// Test simple para Módulo 10 IA Vision
const http = require('http');

// Función para realizar peticiones HTTP
const request = (method, path, data = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

// Función principal para ejecutar pruebas
async function runTests() {
  console.log('🚀 Iniciando pruebas del Módulo 10: IA Vision\n');

  const tests = [
    {
      name: 'Obtener ocupación máxima',
      method: 'GET',
      path: '/iavision/ocupacion-maxima'
    },
    {
      name: 'Obtener días críticos',
      method: 'GET',
      path: '/iavision/dias-criticos'
    },
    {
      name: 'Obtener predicciones de picos',
      method: 'GET',
      path: '/iavision/prediccion-picos'
    },
    {
      name: 'Optimizar citas',
      method: 'POST',
      path: '/iavision/optimizar-citas',
      data: {
        citas: [{ id: 1, paciente: 'P001', horario: '09:00-10:00' }],
        restricciones: {}
      }
    },
    {
      name: 'Chatbot de triaje',
      method: 'POST',
      path: '/iavision/chatbot-triaje',
      data: {
        mensaje: 'Tengo dolor de cabeza',
        pacienteId: 'P001'
      }
    }
  ];

  const results = [];

  for (const test of tests) {
    try {
      console.log(`📝 Test: ${test.name}`);

      const result = await request(test.method, test.path, test.data);

      if (result.status === 200 && result.data.success) {
        console.log(`  ✅ ÉXITO - Status: ${result.status}`);
        results.push({ name: test.name, status: 'PASS', result });
      } else {
        console.log(`  ❌ ERROR - Status: ${result.status}`);
        console.log(`  Respuesta: ${JSON.stringify(result.data, null, 2)}`);
        results.push({ name: test.name, status: 'FAIL', result });
      }
    } catch (error) {
      console.log(`  ❌ ERROR - ${error.message}`);
      results.push({ name: test.name, status: 'ERROR', error });
    }

    console.log(''); // Espacio entre tests
  }

  // Resumen de resultados
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const errors = results.filter(r => r.status === 'ERROR').length;

  console.log('📊 RESUMEN DE PRUEBAS:');
  console.log(`✅ Exitosos: ${passed}`);
  console.log(`❌ Fallidos: ${failed}`);
  console.log(`⚠️  Errores: ${errors}`);
  console.log(`📈 Total: ${results.length}`);

  if (failed === 0 && errors === 0) {
    console.log('\n🎉 ¡Todos los tests del Módulo 10 IA Vision pasaron!');
  } else {
    console.log('\n⚠️  Algunos tests fallaron. Revisar la implementación.');
  }

  return results;
}

// Ejecutar pruebas
runTests().catch(console.error);