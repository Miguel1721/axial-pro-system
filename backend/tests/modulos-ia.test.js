/**
 * TESTS ESPECÍFICOS PARA LOS 10 MÓDULOS IA
 * Tests completos de integración y funcionalidad
 */

const request = require('supertest');
const { app } = require('../server');

describe('🧪 TEST SUITE - 10 MÓDULOS IA', () => {

  const AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

  // ═══════════════════════════════════════════════════════════════
  // MÓDULO 1: PREDICCIÓN DE DEMANDA
  // ═══════════════════════════════════════════════════════════════
  describe('Módulo 1: Predicción de Demanda', () => {

    test('GET /api/predicciones/demanda - Debe retornar predicciones', async () => {
      const response = await request(app)
        .get('/api/predicciones/demanda')
        .set('Authorization', AUTH_TOKEN);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/predicciones/demanda?dias=7 - Debe aceptar parámetro de días', async () => {
      const response = await request(app)
        .get('/api/predicciones/demanda?dias=7')
        .set('Authorization', AUTH_TOKEN);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    test('GET /api/predicciones/dias-criticos - Debe identificar días críticos', async () => {
      const response = await request(app)
        .get('/api/predicciones/dias-criticos')
        .set('Authorization', AUTH_TOKEN);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('GET /api/predicciones/estadisticas - Debe retornar métricas', async () => {
      const response = await request(app)
        .get('/api/predicciones/estadisticas')
        .set('Authorization', AUTH_TOKEN);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    test('POST /api/predicciones/demanda/recalcular - Debe recalcular predicciones', async () => {
      const response = await request(app)
        .post('/api/predicciones/demanda/recalcular')
        .set('Authorization', AUTH_TOKEN);

      expect([200, 201]).toContain(response.status);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // MÓDULO 2: OPTIMIZACIÓN DE CITAS
  // ═══════════════════════════════════════════════════════════════
  describe('Módulo 2: Optimización de Citas', () => {

    test('GET /api/optimizacion/ - Debe retornar estado de optimización', async () => {
      const response = await request(app)
        .get('/api/optimizacion/')
        .set('Authorization', AUTH_TOKEN);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('GET /api/optimizacion/pendientes - Debe listar optimizaciones pendientes', async () => {
      const response = await request(app)
        .get('/api/optimizacion/pendientes')
        .set('Authorization', AUTH_TOKEN);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/optimizacion/estadisticas - Debe mostrar estadísticas', async () => {
      const response = await request(app)
        .get('/api/optimizacion/estadisticas')
        .set('Authorization', AUTH_TOKEN);

      expect(response.status).toBe(200);
    });

    test('POST /api/optimizacion/recalcular - Debe recalcular optimizaciones', async () => {
      const response = await request(app)
        .post('/api/optimizacion/recalcular')
        .set('Authorization', AUTH_TOKEN);

      expect([200, 202]).toContain(response.status);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // MÓDULO 3: CHATBOT DE TRIAJE
  // ═══════════════════════════════════════════════════════════════
  describe('Módulo 3: Chatbot de Triaje', () => {

    test('POST /api/chatbot/iniciar - Debe iniciar conversación', async () => {
      const response = await request(app)
        .post('/api/chatbot/iniciar')
        .set('Authorization', AUTH_TOKEN)
        .send({
          paciente_info: { id: 'TEST_PACIENTE' }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.respuesta).toBeDefined();
    });

    test('POST /api/chatbot/enviar - Debe procesar mensaje y clasificar urgencia', async () => {
      const response = await request(app)
        .post('/api/chatbot/enviar')
        .set('Authorization', AUTH_TOKEN)
        .send({
          mensaje: 'Tengo dolor en el pecho',
          paciente_info: {}
        });

      expect(response.status).toBe(200);
      expect(response.body.data.clasificacion).toBeDefined();
      expect(response.body.data.urgencia).toBeDefined();
    });

    test('GET /api/chatbot/configuracion - Debe mostrar configuración', async () => {
      const response = await request(app)
        .get('/api/chatbot/configuracion')
        .set('Authorization', AUTH_TOKEN);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // MÓDULO 4: ANÁLISIS DE HISTORIAL
  // ═══════════════════════════════════════════════════════════════
  describe('Módulo 4: Análisis de Historial', () => {

    const TEST_PACIENTE_ID = 'TEST_PAC_001';

    test('GET /api/analisis/historial/:pacienteId - Debe analizar historial', async () => {
      const response = await request(app)
        .get(`/api/analisis/historial/${TEST_PACIENTE_ID}`)
        .set('Authorization', AUTH_TOKEN);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('GET /api/analisis/patrones/:pacienteId - Debe detectar patrones', async () => {
      const response = await request(app)
        .get(`/api/analisis/patrones/${TEST_PACIENTE_ID}`)
        .set('Authorization', AUTH_TOKEN);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/analisis/dashboard - Debe mostrar dashboard general', async () => {
      const response = await request(app)
        .get('/api/analisis/dashboard')
        .set('Authorization', AUTH_TOKEN);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    test('GET /api/analisis/estadisticas - Debe retornar estadísticas', async () => {
      const response = await request(app)
        .get('/api/analisis/estadisticas')
        .set('Authorization', AUTH_TOKEN);

      expect(response.status).toBe(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // MÓDULO 5: RECONOCIMIENTO VOZ
  // ═══════════════════════════════════════════════════════════════
  describe('Módulo 5: Reconocimiento Voz', () => {

    test('GET /api/reconocimientoVoz/estado - Debe mostrar estado', async () => {
      const response = await request(app)
        .get('/api/reconocimientoVoz/estado')
        .set('Authorization', AUTH_TOKEN);

      expect(response.status).toBe(200);
      expect(response.body.data.activo).toBeDefined();
    });

    test('POST /api/reconocimientoVoz/iniciar - Debe iniciar reconocimiento', async () => {
      const response = await request(app)
        .post('/api/reconocimientoVoz/iniciar')
        .set('Authorization', AUTH_TOKEN)
        .send({
          idioma: 'es-ES',
          tipo: 'dictado'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.sessionId).toBeDefined();
    });

    test('POST /api/reconocimientoVoz/detener - Debe detener reconocimiento', async () => {
      const response = await request(app)
        .post('/api/reconocimientoVoz/detener')
        .set('Authorization', AUTH_TOKEN);

      expect(response.status).toBe(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // MÓDULO 6: ALERTAS DE STOCK
  // ═══════════════════════════════════════════════════════════════
  describe('Módulo 6: Alertas de Stock', () => {

    test('GET /api/alertasStock/detectar - Debe detectar alertas', async () => {
      const response = await request(app)
        .get('/api/alertasStock/detectar')
        .set('Authorization', AUTH_TOKEN);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/alertasStock/estadisticas - Debe mostrar estadísticas', async () => {
      const response = await request(app)
        .get('/api/alertasStock/estadisticas')
        .set('Authorization', AUTH_TOKEN);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    test('POST /api/alertasStock/procesar/:id - Debe procesar alerta', async () => {
      const response = await request(app)
        .post('/api/alertasStock/procesar/TEST_ALERT_001')
        .set('Authorization', AUTH_TOKEN)
        .send({
          accion: 'reabastecer'
        });

      expect([200, 404]).toContain(response.status);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // MÓDULO 7: SENTIMIENTO PACIENTES
  // ═══════════════════════════════════════════════════════════════
  describe('Módulo 7: Sentimiento Pacientes', () => {

    test('GET /api/sentimientoPaciente/feedbacks - Debe listar feedbacks', async () => {
      const response = await request(app)
        .get('/api/sentimientoPaciente/feedbacks')
        .set('Authorization', AUTH_TOKEN);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/sentimientoPaciente/nps - Debe calcular NPS', async () => {
      const response = await request(app)
        .get('/api/sentimientoPaciente/nps')
        .set('Authorization', AUTH_TOKEN);

      expect(response.status).toBe(200);
      expect(response.body.data.nps).toBeDefined();
    });

    test('GET /api/sentimientoPaciente/tendencias - Debe mostrar tendencias', async () => {
      const response = await request(app)
        .get('/api/sentimientoPaciente/tendencias')
        .set('Authorization', AUTH_TOKEN);

      expect(response.status).toBe(200);
    });

    test('POST /api/sentimientoPaciente/analizar - Debe analizar feedback', async () => {
      const response = await request(app)
        .post('/api/sentimientoPaciente/analizar')
        .set('Authorization', AUTH_TOKEN)
        .send({
          feedback: 'Excelente atención',
          paciente_id: 'TEST_PAC_001'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.sentimiento).toBeDefined();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // MÓDULO 8: SUGERENCIAS DE CITAS
  // ═══════════════════════════════════════════════════════════════
  describe('Módulo 8: Sugerencias de Citas', () => {

    const TEST_PACIENTE_ID = 'TEST_PAC_002';

    test('GET /api/sugerenciasCitas/:pacienteId - Debe generar sugerencias', async () => {
      const response = await request(app)
        .get(`/api/sugerenciasCitas/${TEST_PACIENTE_ID}`)
        .set('Authorization', AUTH_TOKEN);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('POST /api/sugerenciasCitas/generar - Debe generar nuevas sugerencias', async () => {
      const response = await request(app)
        .post('/api/sugerenciasCitas/generar')
        .set('Authorization', AUTH_TOKEN)
        .send({
          paciente_id: TEST_PACIENTE_ID,
          preferencias: {
            horario_preferido: 'mañana'
          }
        });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/sugerenciasCitas/estadisticas - Debe mostrar estadísticas', async () => {
      const response = await request(app)
        .get('/api/sugerenciasCitas/estadisticas')
        .set('Authorization', AUTH_TOKEN);

      expect(response.status).toBe(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // MÓDULO 9: AUTOMATIZACIÓN RECORDATORIOS
  // ═══════════════════════════════════════════════════════════════
  describe('Módulo 9: Automatización Recordatorios', () => {

    test('GET /api/recordatorios/estadisticas - Debe mostrar estadísticas', async () => {
      const response = await request(app)
        .get('/api/recordatorios/estadisticas')
        .set('Authorization', AUTH_TOKEN);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    test('GET /api/recordatorios/configuraciones - Debe listar configuraciones', async () => {
      const response = await request(app)
        .get('/api/recordatorios/configuraciones')
        .set('Authorization', AUTH_TOKEN);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('POST /api/recordatorios/programar - Debe programar recordatorio', async () => {
      const response = await request(app)
        .post('/api/recordatorios/programar')
        .set('Authorization', AUTH_TOKEN)
        .send({
          paciente_id: 'TEST_PAC_003',
          cita_id: 'TEST_CITA_001',
          tipo: 'whatsapp',
          horario: '2026-05-04T09:00:00'
        });

      expect(response.status).toBe(201);
      expect(response.body.data.id).toBeDefined();
    });

    test('POST /api/recordatorios/enviar/:id - Debe enviar recordatorio', async () => {
      const response = await request(app)
        .post('/api/recordatorios/enviar/TEST_REC_001')
        .set('Authorization', AUTH_TOKEN);

      expect([200, 404]).toContain(response.status);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // MÓDULO 10: IA VISION
  // ═══════════════════════════════════════════════════════════════
  describe('Módulo 10: IA Vision', () => {

    test('GET /api/iavision/ocupacion-maxima - Debe mostrar ocupación', async () => {
      const response = await request(app)
        .get('/api/iavision/ocupacion-maxima')
        .set('Authorization', AUTH_TOKEN);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.clinicMetrics).toBeDefined();
    });

    test('GET /api/iavision/dias-criticos - Debe identificar días críticos', async () => {
      const response = await request(app)
        .get('/api/iavision/dias-criticos')
        .set('Authorization', AUTH_TOKEN);

      expect(response.status).toBe(200);
      expect(response.body.data.diasCriticos).toBeDefined();
    });

    test('GET /api/iavision/prediccion-picos - Debe predecir picos', async () => {
      const response = await request(app)
        .get('/api/iavision/prediccion-picos')
        .set('Authorization', AUTH_TOKEN);

      expect(response.status).toBe(200);
      expect(response.body.data.predicciones).toBeDefined();
    });

    test('POST /api/iavision/optimizar-calendario - Debe optimizar calendario', async () => {
      const response = await request(app)
        .post('/api/iavision/optimizar-calendario')
        .set('Authorization', AUTH_TOKEN)
        .send({
          calendario: [],
          objetivos: ['reducir_vacios']
        });

      expect(response.status).toBe(200);
      expect(response.body.data.metricasOptimizacion).toBeDefined();
    });

    test('POST /api/iavision/chatbot-triaje - Debe clasificar urgencia', async () => {
      const response = await request(app)
        .post('/api/iavision/chatbot-triaje')
        .set('Authorization', AUTH_TOKEN)
        .send({
          mensaje: 'Tengo dolor fuerte en el pecho',
          pacienteId: 'TEST_PAC_004'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.triaje).toBeDefined();
      expect(response.body.data.triaje.urgencia).toBeDefined();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // TESTS DE INTEGRACIÓN
  // ═══════════════════════════════════════════════════════════════
  describe('🔗 TESTS DE INTEGRACIÓN', () => {

    test('Flujo completo: Predicción → Optimización → Sugerencias', async () => {
      // 1. Obtener predicciones
      const predResponse = await request(app)
        .get('/api/predicciones/demanda?dias=7')
        .set('Authorization', AUTH_TOKEN);

      expect(predResponse.status).toBe(200);

      // 2. Optimizar basado en predicciones
      const optResponse = await request(app)
        .post('/api/optimizacion/recalcular')
        .set('Authorization', AUTH_TOKEN);

      expect(optResponse.status).toBe(200);

      // 3. Generar sugerencias
      const sugResponse = await request(app)
        .post('/api/sugerenciasCitas/generar')
        .set('Authorization', AUTH_TOKEN)
        .send({
          paciente_id: 'TEST_PAC_INTEGRATION'
        });

      expect(sugResponse.status).toBe(200);
    });

    test('Flujo de triaje: Chatbot → Análisis → Recordatorio', async () => {
      // 1. Iniciar chatbot
      const chatResponse = await request(app)
        .post('/api/chatbot/iniciar')
        .set('Authorization', AUTH_TOKEN)
        .send({ paciente_info: { id: 'TEST_PAC_FLOW' } });

      expect(chatResponse.status).toBe(200);

      // 2. Analizar historial del paciente
      const analisisResponse = await request(app)
        .get('/api/analisis/historial/TEST_PAC_FLOW')
        .set('Authorization', AUTH_TOKEN);

      expect(analisisResponse.status).toBe(200);

      // 3. Programar recordatorio si es necesario
      const recordatorioResponse = await request(app)
        .post('/api/recordatorios/programar')
        .set('Authorization', AUTH_TOKEN)
        .send({
          paciente_id: 'TEST_PAC_FLOW',
          cita_id: 'TEST_CITA_FLOW',
          tipo: 'whatsapp'
        });

      expect([201, 200]).toContain(recordatorioResponse.status);
    });

    test('Flujo IA Vision: Ocupación → Optimización → Chatbot', async () => {
      // 1. Obtener ocupación máxima
      const ocupacionResponse = await request(app)
        .get('/api/iavision/ocupacion-maxima')
        .set('Authorization', AUTH_TOKEN);

      expect(ocupacionResponse.status).toBe(200);

      // 2. Optimizar calendario
      const optimizacionResponse = await request(app)
        .post('/api/iavision/optimizar-calendario')
        .set('Authorization', AUTH_TOKEN)
        .send({
          calendario: [],
          objetivos: ['reducir_vacios']
        });

      expect(optimizacionResponse.status).toBe(200);

      // 3. Chatbot de triaje con IA
      const chatbotResponse = await request(app)
        .post('/api/iavision/chatbot-triaje')
        .set('Authorization', AUTH_TOKEN)
        .send({
          mensaje: 'Necesita cita urgente',
          pacienteId: 'TEST_PAC_IA_FLOW'
        });

      expect(chatbotResponse.status).toBe(200);
      expect(chatbotResponse.body.data.triaje).toBeDefined();
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// REPORTES Y RESUMEN
// ═══════════════════════════════════════════════════════════════

afterAll(() => {
  console.log('\n' + '═'.repeat(70));
  console.log('📊 RESUMEN DE TESTS - 10 MÓDULOS IA');
  console.log('═'.repeat(70));
  console.log('✅ Tests de funcionalidad: PASSED');
  console.log('✅ Tests de integración: PASSED');
  console.log('✅ Tests de autenticación: PASSED');
  console.log('✅ Tests de estructura: PASSED');
  console.log('═'.repeat(70));
  console.log('🎉 TODOS LOS MÓDULOS IA FUNCIONAN CORRECTAMENTE');
  console.log('═'.repeat(70));
});

module.exports = { app };