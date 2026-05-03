const express = require('express');
const router = express.Router();
const IAVisionModel = require('../models/iavision.model');
const authMiddleware = require('../middleware/auth.middleware');

const iavisionModel = new IAVisionModel();

// Obtener métricas de ocupación máxima
router.get('/ocupacion-maxima', authMiddleware(['admin', 'medico', 'recepcionista']), async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    // Simulación de análisis de ocupación
    const analisisOcupacion = {
      id: `ocupacion_${Date.now()}`,
      periodo: { fechaInicio, fechaFin },
      medicos: [
        {
          id: 'MED_001',
          nombre: 'Dr. Juan Pérez',
          especialidad: 'Cardiología',
          ocupacionPromedio: 78,
          diasCriticos: ['2026-05-15', '2026-05-20'],
          horasPico: ['09:00', '11:00', '15:00'],
          disponibilidad: 22,
          ultimaActualizacion: new Date().toISOString()
        }
      ],
      clinicMetrics: {
        ocupacionGeneral: 72,
        diasCriticos: ['2026-05-15', '2026-05-20', '2026-05-25'],
        horasPico: ['08:00-10:00', '11:00-13:00', '16:00-18:00'],
        eficiencia: 0.85,
        tendencia: 'increasing'
      }
    };

    res.json({
      success: true,
      data: analisisOcupacion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener ocupación máxima',
      error: error.message
    });
  }
});

// Obtener días críticos y alertas
router.get('/dias-criticos', authMiddleware(['admin', 'medico', 'recepcionista']), async (req, res) => {
  try {
    const { mes, ano } = req.query;

    const diasCriticos = [
      {
        id: 'critico_001',
        fecha: '2026-05-15',
        tipo: 'sobrecarga',
        medicos: ['MED_001', 'MED_002'],
        citasExcedidas: 45,
        capacidadNormal: 30,
        alerta: 'alta',
        recomendaciones: [
          'Agregar médico de turno',
          'Extender horario hasta 20:00',
          'Reprogramar citas no urgentes'
        ],
        color: '#ef4444'
      },
      {
        id: 'critico_002',
        fecha: '2026-05-20',
        tipo: 'falta personal',
        medicos: ['MED_003'],
        citasExcedidas: 25,
        capacidadNormal: 35,
        alerta: 'media',
        recomendaciones: [
          'Reprogramar citas',
          'Solicitar apoyo de otros médicos'
        ],
        color: '#f59e0b'
      }
    ];

    res.json({
      success: true,
      data: {
        mes,
        ano,
        diasCriticos,
        resumen: {
          totalCriticos: diasCriticos.length,
          altaUrgencia: diasCriticos.filter(d => d.alerta === 'alta').length,
          mediaUrgencia: diasCriticos.filter(d => d.alerta === 'media').length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener días críticos',
      error: error.message
    });
  }
});

// Optimización de calendario
router.post('/optimizar-calendario', authMiddleware(['admin', 'recepcionista']), async (req, res) => {
  try {
    const { calendario, objetivos } = req.body;

    const optimizacion = {
      id: `optimizacion_${Date.now()}`,
      calendarioOriginal: calendario,
      calendarioOptimizado: calendario.map(cita => ({
        ...cita,
        horarioSugerido: sugerirHorarioOptimo(cita),
        prioridad: calcularPrioridad(cita),
        balance: calcularBalance(cita)
      })),
      metricasOptimizacion: {
        reduccionVacios: 0.23,
        equilibrioMedicos: 0.87,
        eficienciaGeneral: 0.91,
        diasOptimizados: 5
      },
      recomendaciones: [
        'Mover citas de mañana a después de las 10:00 para mejor distribución',
        'Agregar bloques de 30 minutos entre citas',
        'Consolidar citas especializadas en días específicos'
      ],
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: optimizacion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al optimizar calendario',
      error: error.message
    });
  }
});

// Predicción de picos estacionales
router.get('/prediccion-picos', authMiddleware(['admin', 'recepcionista']), async (req, res) => {
  try {
    const { tipo = 'estacional' } = req.query;

    const predicciones = {
      tipo,
      periodo: 'Mayo 2026 - Julio 2026',
      predicciones: [
        {
          mes: 'Mayo 2026',
          pico: '15, 20, 25',
          nivel: 'alto',
          factor: 'Fin de semana largo',
          confianza: 0.89,
          recomendaciones: [
            'Preparar personal extra',
            'Incrementar capacidad en 20%',
            'Activar sistema de citas extendidas'
          ]
        },
        {
          mes: 'Junio 2026',
          pico: '5, 12, 18, 28',
          nivel: 'medio',
          factor: 'Inicio de vacaciones',
          confianza: 0.76,
          recomendaciones: [
            'Planificar turnos rotativos',
            'Preparar para reducción de personal'
          ]
        },
        {
          mes: 'Julio 2026',
          pico: '10, 15, 20, 30',
          nivel: 'alto',
          factor: 'Vacaciones escolares',
          confianza: 0.92,
          recomendaciones: [
            'Aumentar capacidad en 30%',
            'Implementar sistema de citas express',
            'Preparar para urgencias'
          ]
        }
      ],
      patronesDetectados: [
        'Los sábados tienen 40% más consultas',
        'Las primeras 3 semanas de cada mes son las más ocupadas',
        'Las mañanas de lunes son las menos ocupadas'
      ]
    };

    res.json({
      success: true,
      data: predicciones
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener predicciones',
      error: error.message
    });
  }
});

// Optimización de citas
router.post('/optimizar-citas', authMiddleware(['admin', 'recepcionista']), async (req, res) => {
  try {
    const { citas, restricciones } = req.body;

    const optimizacion = {
      id: `optimizacion_citas_${Date.now()}`,
      analisis: {
        vaciosAgenda: 12,
        sobresobrescritas: 3,
        ineficiencia: 0.34
      },
      sugerencias: [
        {
          tipo: 'reducir_vacios',
          citasAfectadas: 5,
          beneficio: 'Mejor uso de horario',
          impacto: '25% reducción de espacios vacíos'
        },
        {
          tipo: 'evitar_overbooking',
          citasAfectadas: 3,
          beneficio: 'Evitar sobrecarga de médicos',
          impacto: 'Mejor atención a pacientes'
        },
        {
          tipo: 'balancear_medicos',
          citasAfectadas: 8,
          beneficio: 'Distribución equitativa',
          impacto: '20% mejor balance de carga'
        }
      ],
      horariosOptimos: [
        '08:00-09:00: Citas breves (30 min)',
        '09:00-12:00: Citas standard (45 min)',
        '14:00-16:00: Citas extensas (60 min)',
        '16:00-18:00: Citas express (30 min)'
      ],
      calendarioOptimizado: generarCalendarioOptimizado(citas, restricciones)
    };

    res.json({
      success: true,
      data: optimizacion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al optimizar citas',
      error: error.message
    });
  }
});

// Chatbot de triaje
router.post('/chatbot-triaje', authMiddleware(['admin', 'recepcionista']), async (req, res) => {
  try {
    const { mensaje, pacienteId } = req.body;

    const respuestaTriaje = {
      id: `triaje_${Date.now()}`,
      pacienteId,
      preguntaOriginal: mensaje,
      clasificacionUrgencia: calcularUrgencia(mensaje),
      categoria: categorizarConsulta(mensaje),
      redireccion: {
        destino: determinarDestino(clasificacionUrgencia.categoria),
        prioridad: clasificacionUrgencia.prioridad,
        tiempoEstimado: calcularTiempoEstimado(clasificacionUrgencia.categoria)
      },
      siguientePreguntas: generarSiguientesPreguntas(categorizarConsulta(mensaje)),
      respuestas24_7: generarRespuesta24_7(mensaje),
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: respuestaTriaje
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en chatbot de triaje',
      error: error.message
    });
  }
});

// Analizar documento médico (OCR)
router.post('/analizar-documento', authMiddleware(['medico', 'admin']), async (req, res) => {
  try {
    const { buffer, tipo = 'receta' } = req.body;

    const resultado = await iavisionModel.extractMedicalDocument(buffer, tipo);

    res.json({
      success: true,
      data: resultado
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al analizar documento',
      error: error.message
    });
  }
});

// Analizar imagen médica
router.post('/analizar-imagen', authMiddleware(['medico', 'admin']), async (req, res) => {
  try {
    const { buffer } = req.body;

    const resultado = await iavisionModel.analyzeMedicalImage(buffer);

    res.json({
      success: true,
      data: resultado
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al analizar imagen',
      error: error.message
    });
  }
});

// Reconocimiento facial para check-in
router.post('/checkin-facial', authMiddleware(['recepcionista']), async (req, res) => {
  try {
    const { buffer } = req.body;

    const resultado = await iavisionModel.facialCheckIn(buffer);

    res.json({
      success: true,
      data: resultado
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en reconocimiento facial',
      error: error.message
    });
  }
});

// Obtener todas las analisis guardados
router.get('/analisis', authMiddleware(['admin']), async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../data/iavision_analyses.json');
    let analyses = [];

    try {
      const data = await fs.readFile(filePath, 'utf8');
      analyses = JSON.parse(data);
    } catch (error) {
      // Si no existe el archivo, devolver array vacío
      analyses = [];
    }

    res.json({
      success: true,
      data: analyses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener análisis',
      error: error.message
    });
  }
});

// Funciones auxiliares
function sugerirHorarioOptimo(cita) {
  const horasPico = ['08:00-09:00', '11:00-12:00', '16:00-17:00'];
  const horasBajas = ['10:00-11:00', '15:00-16:00'];

  if (cita.urgencia === 'baja' && horasBajas.includes(cita.horario)) {
    return cita.horario;
  } else if (horasBajas.includes(cita.horario)) {
    return horasBajas[0];
  }
  return cita.horario;
}

function calcularPrioridad(cita) {
  const factores = {
    urgencia: { alta: 3, media: 2, baja: 1 },
    tipo: { consulta: 1, emergencia: 3, chequeo: 2 },
    medicoExperiencia: { senior: 2, junior: 1 }
  };

  return (factores.urgencia[cita.urgencia] || 1) +
         (factores.tipo[cita.tipo] || 1) +
         (factores.medicoExperiencia[cita.medicoExperiencia] || 1);
}

function calcularBalance(cita) {
  return Math.random() * 100; // Simplificado para demo
}

function calcularUrgencia(mensaje) {
  const urgencias = {
    alta: ['emergencia', 'dolor fuerte', 'fiebre alta', 'sangre'],
    media: ['dolor', 'fiebre', 'consulta'],
    baja: ['cita', 'checkup', 'seguimiento']
  };

  const lowerMensaje = mensaje.toLowerCase();
  for (const [nivel, palabras] of Object.entries(urgencias)) {
    if (palabras.some(palabra => lowerMensaje.includes(palabra))) {
      return { nivel, prioridad: nivel === 'alta' ? 3 : nivel === 'media' ? 2 : 1 };
    }
  }

  return { nivel: 'baja', prioridad: 1 };
}

function categorizarConsulta(mensaje) {
  const categorias = {
    emergencia: ['emergencia', 'dolor fuerte', 'sangre'],
    urgente: ['dolor',fiebre', 'sintoma'],
    programada: ['cita', 'checkup', 'seguimiento'],
    general: ['consulta', 'duda', 'informacion']
  };

  const lowerMensaje = mensaje.toLowerCase();
  for (const [categoria, palabras] of Object.entries(categorias)) {
    if (palabras.some(palabra => lowerMensaje.includes(palabra))) {
      return categoria;
    }
  }

  return 'general';
}

function determinarDestino(categoria) {
  const destinos = {
    emergencia: 'urgencias',
    urgente: 'consultorio_inmediato',
    programada: 'consultorio_programado',
    general: 'recepcion'
  };

  return destinos[categoria] || 'recepcion';
}

function calcularTiempoEstimado(categoria) {
  const tiempos = {
    emergencia: '10-15 min',
    urgente: '20-30 min',
    programada: '45-60 min',
    general: '30-45 min'
  };

  return tiempos[categoria] || '30 min';
}

function generarSiguientesPreguntas(categoria) {
  const preguntas = {
    emergencia: [
      '¿Tiene dificultad para respirar?',
      '¿Tiene alergias conocidas?',
      '¿Está tomando algún medicamento?'
    ],
    urgente: [
      '¿Cuánto tiempo tiene los síntomas?',
      '¿Ha tomado algún medicamento?',
      '¿Tiene alguna condición preexistente?'
    ],
    programada: [
      '¿Trae alguna documentación?',
      '¿Es su primera consulta?',
      '¿Viene por seguimiento o resultado?'
    ]
  };

  return preguntas[categoria] || [];
}

function generarRespuesta24_7(mensaje) {
  const respuestas = {
    consulta: 'Nuestro sistema está disponible 24/7 para emergencias. Para consultas programadas, puede agendar en cualquier momento.',
    emergencia: '¡Emergencia detectada! Por favor, diríjase a urgencias de inmediato. Nuestro personal está preparado para atenderle.',
    urgente: 'Su consulta es urgente. Le atenderemos en el menor tiempo posible. Por favor, mantenga la calma.',
    general: 'Gracias por contactarnos. Nuestro equipo le atenderá lo antes posible. ¿En qué podemos ayudarle?'
  };

  const categoria = categorizarConsulta(mensaje);
  return respuestas[categoria] || respuestas.general;
}

function generarCalendarioOptimizado(citas, restricciones) {
  // Simplificado para demo
  return citas.map(cita => ({
    ...cita,
    horarioOptimo: sugerirHorarioOptimo(cita),
    eficiencia: Math.random() * 100
  }));
}

module.exports = router;