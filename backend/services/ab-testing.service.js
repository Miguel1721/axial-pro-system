/**
 * Servicio de A/B Testing para Axial Pro Clinic
 * Framework para experimentos y optimización de funcionalidades
 */

const fs = require('fs').promises;
const path = require('path');

class ABTestingService {
  constructor() {
    this.dataDir = path.join(__dirname, '..', 'data', 'ab-testing');
    this.experiments = new Map();
    this.assignments = new Map();
    this.results = new Map();

    this.initialize();
  }

  async initialize() {
    await this.ensureDataDirectory();
    await this.loadExistingExperiments();
  }

  async ensureDataDirectory() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      await fs.mkdir(path.join(this.dataDir, 'experiments'), { recursive: true });
      await fs.mkdir(path.join(this.dataDir, 'assignments'), { recursive: true });
      await fs.mkdir(path.join(this.dataDir, 'results'), { recursive: true });
    } catch (error) {
      console.error('Error creating AB testing directories:', error);
    }
  }

  async loadExistingExperiments() {
    try {
      const experimentsDir = path.join(this.dataDir, 'experiments');
      const files = await fs.readdir(experimentsDir);

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(experimentsDir, file);
          const data = await fs.readFile(filePath, 'utf8');
          const experiment = JSON.parse(data);
          this.experiments.set(experiment.id, experiment);
        }
      }
    } catch (error) {
      console.error('Error loading experiments:', error);
    }
  }

  // Crear nuevo experimento
  createExperiment(experiment) {
    const newExperiment = {
      id: experiment.id || `exp_${Date.now()}`,
      name: experiment.name,
      description: experiment.description,
      hypothesis: experiment.hypothesis,
      variantA: experiment.variantA,
      variantB: experiment.variantB,
      trafficPercentage: experiment.trafficPercentage || 50,
      startDate: new Date().toISOString(),
      endDate: experiment.endDate,
      status: 'draft', // draft, running, completed, paused
      metrics: experiment.metrics || [],
      targetAudience: experiment.targetAudience || 'all',
      createdAt: new Date().toISOString()
    };

    this.experiments.set(newExperiment.id, newExperiment);
    this.saveExperiment(newExperiment);

    return newExperiment;
  }

  // Asignar variantes a usuarios
  assignVariant(userId, experimentId) {
    const experiment = this.experiments.get(experimentId);

    if (!experiment) {
      throw new Error('Experiment not found');
    }

    if (experiment.status !== 'running') {
      return null;
    }

    // Verificar si el usuario ya está asignado
    if (this.assignments.has(`${experimentId}_${userId}`)) {
      return this.assignments.get(`${experimentId}_${userId}`).variant;
    }

    // Asignar basado en tráfico y hash determinista
    const assignmentKey = `${experimentId}_${userId}`;
    const hash = this.hash(assignmentKey);
    const variant = hash < (experiment.trafficPercentage / 100) ? 'A' : 'B';

    const assignment = {
      experimentId,
      userId,
      variant,
      assignedAt: new Date().toISOString(),
      completed: false
    };

    this.assignments.set(assignmentKey, assignment);
    this.saveAssignment(assignment);

    return variant;
  }

  // Registrar evento/métrica
  trackEvent(userId, experimentId, event, data = {}) {
    const assignmentKey = `${experimentId}_${userId}`;
    const assignment = this.assignments.get(assignmentKey);

    if (!assignment || assignment.completed) {
      return false;
    }

    const eventRecord = {
      experimentId,
      userId,
      variant: assignment.variant,
      event,
      data,
      timestamp: new Date().toISOString()
    };

    // Guardar evento
    this.saveEvent(eventRecord);

    // Actualizar resultados
    if (!this.results.has(experimentId)) {
      this.results.set(experimentId, {
        experimentId,
        variantA: { events: {}, conversions: 0 },
        variantB: { events: {}, conversions: 0 },
        totalUsers: 0
      });
    }

    const results = this.results.get(experimentId);
    results.totalUsers++;

    if (event === 'conversion') {
      results[`variant${assignment.variant.toUpperCase()}`].conversions++;
    }

    if (!results[`variant${assignment.variant.toUpperCase()}`].events[event]) {
      results[`variant${assignment.variant.toUpperCase()}`].events[event] = 0;
    }
    results[`variant${assignment.variant.toUpperCase()}`].events[event]++;

    return true;
  }

  // Calcular resultados del experimento
  calculateResults(experimentId) {
    const experiment = this.experiments.get(experimentId);
    const results = this.results.get(experimentId);

    if (!experiment || !results) {
      throw new Error('Experiment or results not found');
    }

    const variantA = results.variantA;
    const variantB = results.variantB;

    // Calcular conversion rates
    const conversionRateA = variantA.conversions / results.totalUsersA || 0;
    const conversionRateB = variantB.conversions / results.totalUsersB || 0;

    // Prueba estadística simple (en producción usaría proper statistical tests)
    const improvement = conversionRateB - conversionRateA;
    const confidence = this.calculateConfidence(improvement, results.totalUsers);

    return {
      experimentId,
      experimentName: experiment.name,
      status: experiment.status,
      variantA: {
        users: results.totalUsersA || 0,
        conversions: variantA.conversions,
        conversionRate: conversionRateA
      },
      variantB: {
        users: results.totalUsersB || 0,
        conversions: variantB.conversions,
        conversionRate: conversionRateB
      },
      improvement,
      confidence,
      winner: confidence > 0.95 ? 'B' : confidence < -0.95 ? 'A' : 'undetermined',
      completedAt: new Date().toISOString()
    };
  }

  // Obtener experimento activo para usuario
  getActiveExperiment(userId, featureName) {
    for (const [id, experiment] of this.experiments) {
      if (experiment.status === 'running' && this.isTargetAudience(userId, experiment, featureName)) {
        const variant = this.assignVariant(userId, id);
        if (variant) {
          return { experimentId: id, variant, config: experiment };
        }
      }
    }
    return null;
  }

  // Helper: verificar si el usuario es público objetivo
  isTargetAudience(userId, experiment, featureName) {
    if (experiment.targetAudience === 'all') return true;
    if (experiment.targetAudience === featureName) return true;

    // Implementar lógica más compleja si es necesario
    return false;
  }

  // Administración de experimentos
  startExperiment(experimentId) {
    const experiment = this.experiments.get(experimentId);
    if (experiment) {
      experiment.status = 'running';
      experiment.startDate = new Date().toISOString();
      this.saveExperiment(experiment);
    }
  }

  pauseExperiment(experimentId) {
    const experiment = this.experiments.get(experimentId);
    if (experiment) {
      experiment.status = 'paused';
      this.saveExperiment(experiment);
    }
  }

  completeExperiment(experimentId) {
    const experiment = this.experiments.get(experimentId);
    if (experiment) {
      experiment.status = 'completed';
      experiment.endDate = new Date().toISOString();
      this.saveExperiment(experiment);

      // Guardar resultados finales
      const results = this.calculateResults(experimentId);
      this.saveResults(results);
    }
  }

  // Ejemplos predefinidos de experimentos
  getPredefinedExperiments() {
    return [
      {
        name: 'Botón de Citas',
        description: 'Comparar diseño A vs B del botón de agendar citas',
        hypothesis: 'El diseño B aumentará las conversiones en un 15%',
        variantA: {
          name: 'Diseño A',
          description: 'Botón verde grande con texto "Agendar Cita"',
          component: 'CitaButton',
          props: { variant: 'A' }
        },
        variantB: {
          name: 'Diseño B',
          description: 'Botón azul con icono y texto "Nueva Cita"',
          component: 'CitaButton',
          props: { variant: 'B' }
        },
        metrics: ['clicks', 'conversions'],
        trafficPercentage: 50
      },
      {
        name: 'Dashboard Médico',
        description: 'Comparar layout vertical vs horizontal',
        hypothesis: 'El layout horizontal mejorará la eficiencia en un 20%',
        variantA: {
          name: 'Layout Vertical',
          description: 'Pila vertical de información clave',
          component: 'MedicalDashboard',
          props: { layout: 'vertical' }
        },
        variantB: {
          name: 'Layout Horizontal',
          description: 'Grid horizontal para información paralela',
          component: 'MedicalDashboard',
          props: { layout: 'horizontal' }
        },
        metrics: ['time_to_find_patient', 'user_satisfaction'],
        trafficPercentage: 30
      },
      {
        name: 'Formulario de Registro',
        description: 'Comparar campos visibles vs collapsibles',
        hypothesis: 'Los campos collapsibles reducirán el abandono en un 25%',
        variantA: {
          name: 'Todos Visibles',
          description: 'Todos los campos visibles en página única',
          component: 'PatientForm',
          props: { showAll: true }
        },
        variantB: {
          name: 'Collapsible',
          description: 'Campos organizados en secciones collapsibles',
          component: 'PatientForm',
          props: { showAll: false }
        },
        metrics: ['completion_rate', 'time_to_complete'],
        trafficPercentage: 40
      }
    ];
  }

  // Helpers para persistencia
  async saveExperiment(experiment) {
    const filePath = path.join(this.dataDir, 'experiments', `${experiment.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(experiment, null, 2));
  }

  async saveAssignment(assignment) {
    const filePath = path.join(this.dataDir, 'assignments', `${assignment.experimentId}_${assignment.userId}.json`);
    await fs.writeFile(filePath, JSON.stringify(assignment, null, 2));
  }

  async saveEvent(event) {
    const date = new Date().toISOString().split('T')[0];
    const filePath = path.join(this.dataDir, 'events', `${date}.json`);

    let events = [];
    try {
      const data = await fs.readFile(filePath, 'utf8');
      events = JSON.parse(data);
    } catch (error) {
      // Archivo no existe o vacío
    }

    events.push(event);
    await fs.writeFile(filePath, JSON.stringify(events, null, 2));
  }

  async saveResults(results) {
    const filePath = path.join(this.dataDir, 'results', `${results.experimentId}_results.json`);
    await fs.writeFile(filePath, JSON.stringify(results, null, 2));
  }

  // Hash determinista para asignación
  hash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) / 2147483647; // Normalize to 0-1
  }

  // Calcular confianza (simplificado)
  calculateConfidence(improvement, sampleSize) {
    // Implementación simplificada - en producción usaría pruebas estadísticas reales
    const zScore = Math.abs(improvement) * Math.sqrt(sampleSize);
    const confidence = Math.min(0.99, Math.abs(zScore) / 3.29); // Aproximación
    return improvement < 0 ? -confidence : confidence;
  }

  // Cleanup
  async cleanup(daysToKeep = 90) {
    try {
      const dirs = ['experiments', 'assignments', 'events'];

      for (const dir of dirs) {
        const dirPath = path.join(this.dataDir, dir);
        const files = await fs.readdir(dirPath);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - daysToKeep);

        for (const file of files) {
          const filePath = path.join(dirPath, file);
          const stats = await fs.stat(filePath);

          if (stats.mtime < cutoff) {
            await fs.unlink(filePath);
          }
        }
      }
    } catch (error) {
      console.error('Error during AB testing cleanup:', error);
    }
  }
}

module.exports = ABTestingService;