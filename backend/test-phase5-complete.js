/**
 * Script de prueba completa para FASE 5: Infraestructura y Escalabilidad
 * Verifica que todos los servicios funcionen correctamente
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const testResults = [];

async function testEndpoint(name, url, method = 'GET', data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: { 'Content-Type': 'application/json' }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);

    testResults.push({
      name,
      status: 'PASS',
      url,
      response: response.data
    });

    console.log(`✅ PASS: ${name}`);
    return response.data;
  } catch (error) {
    testResults.push({
      name,
      status: 'FAIL',
      url,
      error: error.message
    });

    console.log(`❌ FAIL: ${name} - ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('🧪 Testing FASE 5: Infraestructura y Escalabilidad\n');

  // 1. Test Analytics Service
  console.log('📊 Testing Analytics Service...');

  await testEndpoint('Analytics Health', '/api/analytics/health');

  await testEndpoint(
    'Track User',
    '/api/analytics/track/user',
    'POST',
    {
      userId: 'test-user-1',
      role: 'admin',
      action: 'login'
    }
  );

  await testEndpoint(
    'Track Session',
    '/api/analytics/track/session',
    'POST',
    {
      userId: 'test-user-1',
      duration: 3600,
      success: true
    }
  );

  await testEndpoint(
    'Track Feature',
    '/api/analytics/track/feature',
    'POST',
    {
      feature: 'dashboard_view',
      userId: 'test-user-1'
    }
  );

  await testEndpoint(
    'Track Medical Event',
    '/api/analytics/track/medical-event',
    'POST',
    {
      event: 'cita_creada',
      data: {
        pacienteId: 'paciente-1',
        medicoId: 'medico-1'
      }
    }
  );

  const metrics = await testEndpoint('Get Realtime Metrics', '/api/analytics/metrics/realtime');

  // 2. Test A/B Testing Service
  console.log('\n🧪 Testing A/B Testing Service...');

  await testEndpoint('AB Testing Health', '/api/ab-testing/health');

  await testEndpoint(
    'Create Experiment',
    '/api/ab-testing/experiments',
    'POST',
    {
      name: 'Test Experiment 1',
      description: 'Testing experiment functionality',
      hypothesis: 'Variant B will improve conversion by 15%',
      variantA: {
        name: 'Control',
        description: 'Original version'
      },
      variantB: {
        name: 'Treatment',
        description: 'New version'
      },
      trafficPercentage: 50,
      metrics: ['conversion', 'clicks']
    }
  );

  await testEndpoint('Get All Experiments', '/api/ab-testing/experiments');

  await testEndpoint('Get Predefined Experiments', '/api/ab-testing/predefined');

  // 3. Test WebSocket Service
  console.log('\n🔌 Testing WebSocket Service...');

  const wsStatus = await testEndpoint('WebSocket Status', '/socketio/status');

  // 4. Test Deployment Service
  console.log('\n🚀 Testing Deployment Service...');

  await testEndpoint('Deployment Health', '/api/deployment/health');

  await testEndpoint('Get Deployment Strategies', '/api/deployment/strategies');

  await testEndpoint(
    'Create Deployment',
    '/api/deployment/deployments',
    'POST',
    {
      name: 'Test Deployment',
      version: '1.0.1',
      description: 'Testing deployment functionality',
      strategy: 'blue-green',
      rollbackOnFailure: true,
      createdBy: 'test-user'
    }
  );

  await testEndpoint('Get Deployment History', '/api/deployment/history');

  // 5. Test CDN Service
  console.log('\n🌐 Testing CDN Service...');

  await testEndpoint('CDN Health', '/api/cdn/health');

  await testEndpoint('Get CDN Stats', '/api/cdn/stats');

  await testEndpoint('Get CDN Config', '/api/cdn/config');

  // Summary
  console.log('\n📈 TEST SUMMARY\n');

  const passed = testResults.filter(t => t.status === 'PASS').length;
  const failed = testResults.filter(t => t.status === 'FAIL').length;
  const total = testResults.length;

  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(2)}%`);

  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults
      .filter(t => t.status === 'FAIL')
      .forEach(t => {
        console.log(`  - ${t.name}: ${t.error}`);
      });
  }

  console.log('\n✨ FASE 5 Testing Complete!');
  return failed === 0;
}

// Run tests
runTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
  });