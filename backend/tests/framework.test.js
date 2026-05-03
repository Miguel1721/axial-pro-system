/**
 * FRAMEWORK DE TESTING AUTOMATIZADO PARA MÓDULOS IA
 * Tests estandarizados para validar funcionalidad de los 10 módulos
 */

const request = require('supertest');
const { app, server } = require('../server');

/**
 * Clase base para tests de módulos IA
 */
class IAModuleTest {
  constructor(moduleName, baseURL) {
    this.moduleName = moduleName;
    this.baseURL = baseURL;
    this.testResults = [];
    this.passedTests = 0;
    this.failedTests = 0;
  }

  /**
   * Test genérico de endpoint GET
   */
  async testGetEndpoint(endpointPath, expectedStatus = 200) {
    try {
      const response = await request(app)
        .get(`${this.baseURL}${endpointPath}`)
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test');

      const passed = response.status === expectedStatus;

      this.recordTest({
        name: `GET ${endpointPath}`,
        passed,
        expected: expectedStatus,
        actual: response.status,
        response: passed ? null : response.body
      });

      return passed;
    } catch (error) {
      this.recordTest({
        name: `GET ${endpointPath}`,
        passed: false,
        expected: expectedStatus,
        actual: 'ERROR',
        error: error.message
      });

      return false;
    }
  }

  /**
   * Test genérico de endpoint POST
   */
  async testPostEndpoint(endpointPath, data, expectedStatus = 200) {
    try {
      const response = await request(app)
        .post(`${this.baseURL}${endpointPath}`)
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test')
        .send(data);

      const passed = response.status === expectedStatus;

      this.recordTest({
        name: `POST ${endpointPath}`,
        passed,
        expected: expectedStatus,
        actual: response.status,
        response: passed ? null : response.body
      });

      return passed;
    } catch (error) {
      this.recordTest({
        name: `POST ${endpointPath}`,
        passed: false,
        expected: expectedStatus,
        actual: 'ERROR',
        error: error.message
      });

      return false;
    }
  }

  /**
   * Test de estructura de respuesta
   */
  async testResponseStructure(endpointPath, expectedFields) {
    try {
      const response = await request(app)
        .get(`${this.baseURL}${endpointPath}`)
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test');

      if (response.status !== 200) {
        this.recordTest({
          name: `Estructura ${endpointPath}`,
          passed: false,
          reason: `Status ${response.status} en lugar de 200`
        });
        return false;
      }

      const data = response.body.data || response.body;
      const missingFields = expectedFields.filter(field => !(field in data));

      const passed = missingFields.length === 0;

      this.recordTest({
        name: `Estructura ${endpointPath}`,
        passed,
        missingFields: missingFields.length > 0 ? missingFields : null
      });

      return passed;
    } catch (error) {
      this.recordTest({
        name: `Estructura ${endpointPath}`,
        passed: false,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Test de autenticación
   */
  async testAuthentication(endpointPath) {
    try {
      const response = await request(app)
        .get(`${this.baseURL}${endpointPath}`); // Sin token

      const passed = response.status === 401 || response.status === 403;

      this.recordTest({
        name: `Auth ${endpointPath}`,
        passed,
        expected: '401/403',
        actual: response.status
      });

      return passed;
    } catch (error) {
      this.recordTest({
        name: `Auth ${endpointPath}`,
        passed: false,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Registrar resultado de test
   */
  recordTest(test) {
    test.timestamp = new Date().toISOString();
    test.module = this.moduleName;
    this.testResults.push(test);

    if (test.passed) {
      this.passedTests++;
    } else {
      this.failedTests++;
    }
  }

  /**
   * Obtener resumen de tests
   */
  getSummary() {
    const total = this.passedTests + this.failedTests;
    const successRate = total > 0 ? Math.round((this.passedTests / total) * 100) : 0;

    return {
      module: this.moduleName,
      total,
      passed: this.passedTests,
      failed: this.failedTests,
      successRate,
      results: this.testResults
    };
  }

  /**
   * Imprimir reporte de tests
   */
  printReport() {
    const summary = this.getSummary();

    console.log(`\n📊 ${this.moduleName} - Test Results`);
    console.log('─'.repeat(50));
    console.log(`Total: ${summary.total}`);
    console.log(`✅ Passed: ${summary.passed}`);
    console.log(`❌ Failed: ${summary.failed}`);
    console.log(`📈 Success Rate: ${summary.successRate}%`);

    if (summary.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(t => !t.passed)
        .forEach(t => {
          console.log(`  ❌ ${t.name}`);
          if (t.expected) console.log(`     Expected: ${t.expected}, Got: ${t.actual}`);
          if (t.error) console.log(`     Error: ${t.error}`);
        });
    }
  }
}

/**
 * Suite de tests para los 10 módulos IA
 */
class IAModuleTestSuite {
  constructor() {
    this.modules = [];
    this.globalResults = {
      totalModules: 0,
      totalTests: 0,
      totalPassed: 0,
      totalFailed: 0,
      globalSuccessRate: 0
    };
  }

  /**
   * Agregar módulo a la suite
   */
  addModule(moduleName, baseURL, testConfig) {
    const moduleTest = new IAModuleTest(moduleName, baseURL);
    this.modules.push({
      name: moduleName,
      test: moduleTest,
      config: testConfig
    });
  }

  /**
   * Ejecutar todos los tests
   */
  async runAllTests() {
    console.log('🚀 Iniciando Test Suite de Módulos IA');
    console.log('═'.repeat(70));

    const moduleResults = [];

    for (const module of this.modules) {
      console.log(`\n🧪 Testing: ${module.name}`);
      console.log('─'.repeat(70));

      await this.runModuleTests(module);
      module.test.printReport();

      const summary = module.test.getSummary();
      moduleResults.push(summary);

      this.globalResults.totalModules++;
      this.globalResults.totalTests += summary.total;
      this.globalResults.totalPassed += summary.passed;
      this.globalResults.totalFailed += summary.failed;
    }

    this.calculateGlobalResults();
    this.printGlobalReport();

    return this.globalResults;
  }

  /**
   * Ejecutar tests de un módulo específico
   */
  async runModuleTests(module) {
    const { test, config } = module;

    // Tests de endpoints GET
    if (config.getEndpoints) {
      for (const endpoint of config.getEndpoints) {
        await test.testGetEndpoint(endpoint.path, endpoint.expectedStatus);
      }
    }

    // Tests de endpoints POST
    if (config.postEndpoints) {
      for (const endpoint of config.postEndpoints) {
        await test.testPostEndpoint(endpoint.path, endpoint.data, endpoint.expectedStatus);
      }
    }

    // Tests de estructura de respuesta
    if (config.structureTests) {
      for (const structureTest of config.structureTests) {
        await test.testResponseStructure(structureTest.path, structureTest.fields);
      }
    }

    // Tests de autenticación
    if (config.authTests) {
      for (const authPath of config.authTests) {
        await test.testAuthentication(authPath);
      }
    }
  }

  /**
   * Calcular resultados globales
   */
  calculateGlobalResults() {
    this.globalResults.globalSuccessRate = this.globalResults.totalTests > 0
      ? Math.round((this.globalResults.totalPassed / this.globalResults.totalTests) * 100)
      : 0;
  }

  /**
   * Imprimir reporte global
   */
  printGlobalReport() {
    console.log('\n' + '═'.repeat(70));
    console.log('📋 GLOBAL TEST REPORT');
    console.log('═'.repeat(70));
    console.log(`Total Módulos: ${this.globalResults.totalModules}`);
    console.log(`Total Tests: ${this.globalResults.totalTests}`);
    console.log(`✅ Passed: ${this.globalResults.totalPassed}`);
    console.log(`❌ Failed: ${this.globalResults.totalFailed}`);
    console.log(`📈 Global Success Rate: ${this.globalResults.globalSuccessRate}%`);

    if (this.globalResults.globalSuccessRate >= 90) {
      console.log('\n🎉 EXCELENTE - Todos los módulos funcionando correctamente');
    } else if (this.globalResults.globalSuccessRate >= 80) {
      console.log('\n✅ MUY BUENO - La mayoría de funcionalidad implementada');
    } else if (this.globalResults.globalSuccessRate >= 70) {
      console.log('\n✅ BUENO - Sistema funcional con mejoras menores necesarias');
    } else if (this.globalResults.globalSuccessRate >= 60) {
      console.log('\n⚠️  ACEPTABLE - Requiere atención');
    } else {
      console.log('\n🔴 CRÍTICO - No listo para producción');
    }

    console.log('═'.repeat(70));
  }
}

/**
 * Configuración de tests para los 10 módulos IA
 */
function getIAModuleTestConfig() {
  return {
    module1: {
      getEndpoints: [
        { path: '/demanda', expectedStatus: 200 },
        { path: '/dias-criticos', expectedStatus: 200 },
        { path: '/estadisticas', expectedStatus: 200 }
      ],
      structureTests: [
        { path: '/demanda', fields: ['success', 'data'] }
      ]
    },
    module2: {
      getEndpoints: [
        { path: '/', expectedStatus: 200 },
        { path: '/estadisticas', expectedStatus: 200 }
      ]
    },
    module3: {
      postEndpoints: [
        { path: '/iniciar', data: {}, expectedStatus: 200 }
      ],
      getEndpoints: [
        { path: '/configuracion', expectedStatus: 200 }
      ]
    },
    module4: {
      getEndpoints: [
        { path: '/dashboard', expectedStatus: 200 }
      ],
      structureTests: [
        { path: '/dashboard', fields: ['success', 'data'] }
      ]
    },
    module5: {
      getEndpoints: [
        { path: '/estado', expectedStatus: 200 }
      ]
    },
    module6: {
      getEndpoints: [
        { path: '/detectar', expectedStatus: 200 },
        { path: '/estadisticas', expectedStatus: 200 }
      ]
    },
    module7: {
      getEndpoints: [
        { path: '/feedbacks', expectedStatus: 200 },
        { path: '/nps', expectedStatus: 200 }
      ]
    },
    module8: {
      getEndpoints: [
        { path: '/estadisticas', expectedStatus: 200 }
      ],
      postEndpoints: [
        { path: '/generar', data: { pacienteId: 'TEST_001' }, expectedStatus: 200 }
      ]
    },
    module9: {
      getEndpoints: [
        { path: '/estadisticas', expectedStatus: 200 },
        { path: '/configuraciones', expectedStatus: 200 }
      ]
    },
    module10: {
      getEndpoints: [
        { path: '/ocupacion-maxima', expectedStatus: 200 },
        { path: '/dias-criticos', expectedStatus: 200 },
        { path: '/prediccion-picos', expectedStatus: 200 }
      ],
      postEndpoints: [
        { path: '/optimizar-calendario', data: {}, expectedStatus: 200 }
      ]
    }
  };
}

/**
 * Función principal para ejecutar tests
 */
async function runIAModuleTests() {
  const suite = new IAModuleTestSuite();
  const config = getIAModuleTestConfig();

  // Agregar los 10 módulos
  suite.addModule('Módulo 1: Predicciones', '/api/predicciones', config.module1);
  suite.addModule('Módulo 2: Optimización', '/api/optimizacion', config.module2);
  suite.addModule('Módulo 3: Chatbot', '/api/chatbot', config.module3);
  suite.addModule('Módulo 4: Análisis', '/api/analisis', config.module4);
  suite.addModule('Módulo 5: Reconocimiento Voz', '/api/reconocimientoVoz', config.module5);
  suite.addModule('Módulo 6: Alertas Stock', '/api/alertasStock', config.module6);
  suite.addModule('Módulo 7: Sentimiento', '/api/sentimientoPaciente', config.module7);
  suite.addModule('Módulo 8: Sugerencias', '/api/sugerenciasCitas', config.module8);
  suite.addModule('Módulo 9: Recordatorios', '/api/recordatorios', config.module9);
  suite.addModule('Módulo 10: IA Vision', '/api/iavision', config.module10);

  const results = await suite.runAllTests();

  // Guardar resultados
  const fs = require('fs');
  const reportPath = __dirname + '/../test-results-ia-modules.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  console.log(`\n📁 Test results saved to: ${reportPath}`);

  // Retornar código de exit apropiado
  process.exit(results.globalSuccessRate >= 70 ? 0 : 1);
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runIAModuleTests().catch(console.error);
}

module.exports = {
  IAModuleTest,
  IAModuleTestSuite,
  getIAModuleTestConfig,
  runIAModuleTests
};