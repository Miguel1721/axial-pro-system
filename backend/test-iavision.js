// Test para Módulo 10 IA Vision
const request = require('supertest');
const app = require('./server');

describe('Módulo 10: IA Vision - Endpoints', () => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

  describe('GET /api/iavision/ocupacion-maxima', () => {
    test('Debería retornar datos de ocupación máxima', async () => {
      const response = await request(app)
        .get('/api/iavision/ocupacion-maxima')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.clinicMetrics).toBeDefined();
      expect(response.body.data.medicos).toBeDefined();
    });
  });

  describe('GET /api/iavision/dias-criticos', () => {
    test('Debería retornar días críticos y alertas', async () => {
      const response = await request(app)
        .get('/api/iavision/dias-criticos')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.diasCriticos).toBeDefined();
      expect(response.body.data.resumen).toBeDefined();
    });
  });

  describe('GET /api/iavision/prediccion-picos', () => {
    test('Debería retornar predicciones de picos estacionales', async () => {
      const response = await request(app)
        .get('/api/iavision/prediccion-picos')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.predicciones).toBeDefined();
      expect(response.body.data.patronesDetectados).toBeDefined();
    });
  });

  describe('POST /api/iavision/optimizar-calendario', () => {
    test('Debería optimizar el calendario', async () => {
      const calendario = [
        { id: 1, fecha: '2026-05-03', horario: '09:00-10:00', urgencia: 'baja' }
      ];

      const response = await request(app)
        .post('/api/iavision/optimizar-calendario')
        .set('Authorization', `Bearer ${token}`)
        .send({ calendario, objetivos: ['reducir_vacios'] })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.metricasOptimizacion).toBeDefined();
      expect(response.body.data.recomendaciones).toBeDefined();
    });
  });

  describe('POST /api/iavision/optimizar-citas', () => {
    test('Debería optimizar citas específicas', async () => {
      const citas = [
        { id: 1, paciente: 'P001', horario: '09:00-10:00', tipo: 'consulta' }
      ];

      const response = await request(app)
        .post('/api/iavision/optimizar-citas')
        .set('Authorization', `Bearer ${token}`)
        .send({ citas, restricciones: {} })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.analisis).toBeDefined();
      expect(response.body.data.sugerencias).toBeDefined();
    });
  });

  describe('POST /api/iavision/chatbot-triaje', () => {
    test('Debería procesar mensaje del chatbot de triaje', async () => {
      const response = await request(app)
        .post('/api/iavision/chatbot-triaje')
        .set('Authorization', `Bearer ${token}`)
        .send({
          mensaje: 'Tengo dolor en el pecho y dificultad para respirar',
          pacienteId: 'P001'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.triaje).toBeDefined();
      expect(response.body.data.triaje.urgencia).toBeDefined();
      expect(response.body.data.triaje.destino).toBeDefined();
    });
  });

  describe('POST /api/iavision/analizar-documento', () => {
    test('Debería analizar documento médico', async () => {
      // Mock buffer (en real sería un archivo)
      const mockBuffer = Buffer.from('documento mock');

      const response = await request(app)
        .post('/api/iavision/analizar-documento')
        .set('Authorization', `Bearer ${token}`)
        .send({
          buffer: mockBuffer.toString('base64'),
          tipo: 'receta'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.type).toBe('receta');
    });
  });

  describe('POST /api/iavision/analizar-imagen', () => {
    test('Debería analizar imagen médica', async () => {
      // Mock buffer (en real sería una imagen)
      const mockBuffer = Buffer.from('imagen mock');

      const response = await request(app)
        .post('/api/iavision/analizar-imagen')
        .set('Authorization', `Bearer ${token}`)
        .send({
          buffer: mockBuffer.toString('base64')
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.type).toBeDefined();
    });
  });

  describe('POST /api/iavision/checkin-facial', () => {
    test('Debería realizar reconocimiento facial', async () => {
      // Mock buffer (en real sería una imagen facial)
      const mockBuffer = Buffer.from('imagen facial mock');

      const response = await request(app)
        .post('/api/iavision/checkin-facial')
        .set('Authorization', `Bearer ${token}`)
        .send({
          buffer: mockBuffer.toString('base64')
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.patientId).toBeDefined();
    });
  });

  describe('GET /api/iavision/analisis', () => {
    test('Debería retornar historial de análisis', async () => {
      const response = await request(app)
        .get('/api/iavision/analisis')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});

console.log('✅ Tests de IA Vision cargados correctamente');
console.log('🔗 Endpoints implementados:');
console.log('   - GET /api/iavision/ocupacion-maxima');
console.log('   - GET /api/iavision/dias-criticos');
console.log('   - GET /api/iavision/prediccion-picos');
console.log('   - POST /api/iavision/optimizar-calendario');
console.log('   - POST /api/iavision/optimizar-citas');
console.log('   - POST /api/iavision/chatbot-triaje');
console.log('   - POST /api/iavision/analizar-documento');
console.log('   - POST /api/iavision/analizar-imagen');
console.log('   - POST /api/iavision/checkin-facial');
console.log('   - GET /api/iavision/analisis');