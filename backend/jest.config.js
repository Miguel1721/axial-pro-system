/**
 * JEST CONFIGURATION - Testing Framework
 * Configuración para tests automatizados de módulos IA
 */

module.exports = {
  // Entorno de test
  testEnvironment: 'node',

  // Patrón de archivos de test
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js'
  ],

  // Archivos a cubrir
  collectCoverageFrom: [
    'routes/**/*.js',
    'models/**/*.js',
    '!routes/**/*.test.js',
    '!**/node_modules/**'
  ],

  // Cobertura mínima
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },

  // Setup de tests
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Timeout para tests
  testTimeout: 10000,

  // Verbosidad
  verbose: true,

  // Cobertura
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],

  // Módulos a transformar
  transform: {},

  // Módulos a ignorar
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/'
  ],

  // Reporters
  reporters: [
    'default',
    ['jest-html-reporters', {
      pageTitle: 'Axial Pro IA - Test Report',
      outputPath: 'test-results.html'
    }]
  ]
};