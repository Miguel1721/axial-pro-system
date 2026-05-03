/**
 * JEST SETUP - Configuración global de tests
 * Se ejecuta antes de todos los tests
 */

// Configurar variables de entorno para tests
process.env.NODE_ENV = 'test';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_NAME = process.env.DB_NAME || 'axial_clinic_db_test';
process.env.DB_USER = process.env.DB_USER || 'axial_admin';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'test_password';

// Timeout global para todos los tests
jest.setTimeout(10000);

// Mock de console.log para reducir ruido en tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // Mantener error para ver fallos reales
  error: console.error
};

// Funciones helper globales
global.testHelpers = {
  // Generar token de test
  getTestToken: () => 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',

  // Generar ID de test
  getTestId: (prefix = 'TEST') => `${prefix}_${Date.now()}`,

  // Esperar un tiempo
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Generar datos de test
  generateTestData: (type) => {
    const testData = {
      paciente: {
        id: 'TEST_PAC_001',
        nombre: 'Paciente Test',
        email: 'test@ejemplo.com'
      },
      cita: {
        id: 'TEST_CITA_001',
        paciente_id: 'TEST_PAC_001',
        fecha: '2026-05-04',
        hora: '09:00'
      },
      medico: {
        id: 'TEST_MED_001',
        nombre: 'Dr. Test',
        especialidad: 'Medicina General'
      }
    };

    return testData[type] || {};
  }
};

// Limpiar mocks después de cada test
afterEach(() => {
  jest.clearAllMocks();
});

console.log('✅ Jest setup completado');