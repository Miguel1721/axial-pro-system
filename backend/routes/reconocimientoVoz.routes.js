/**
 * RUTAS DE RECONOCIMIENTO DE VOZ
 * API para el sistema de reconocimiento de voz con comandos médicos
 */

const express = require('express');
const router = express.Router();

// Simular el reconocimiento de voz para el backend
class MockReconocimientoVoz {
  constructor() {
    this.isListening = false;
    this.transcriptions = [];
    this.commands = {
      'guardar': 'save_note',
      'nueva nota': 'new_note',
      'siguiente paciente': 'next_patient',
      'paciente anterior': 'prev_patient',
      'exportar': 'export',
      'ayuda': 'help'
    };
  }

  startListening() {
    this.isListening = true;
    return true;
  }

  stopListening() {
    this.isListening = false;
    return true;
  }

  processCommand(text) {
    const normalizedText = text.toLowerCase().trim();

    for (const [command, action] of Object.entries(this.commands)) {
      if (normalizedText.includes(command)) {
        return { action, text: originalText };
      }
    }

    return { action: 'save_note', text };
  }

  saveTranscription(text, isFinal = false) {
    const transcription = {
      id: Date.now(),
      text,
      isFinal,
      timestamp: new Date().toISOString()
    };

    this.transcriptions.push(transcription);
    return transcription;
  }

  getStatus() {
    return {
      isListening: this.isListening,
      transcriptionsCount: this.transcriptions.length,
      supported: true
    };
  }
}

const mockRecognition = new MockReconocimientoVoz();

/**
 * @route   POST /api/reconocimiento-voz/iniciar
 * @desc    Iniciar reconocimiento de voz
 * @access  Private
 */
router.post('/iniciar', (req, res) => {
  try {
    const success = mockRecognition.startListening();

    res.json({
      success: true,
      message: 'Reconocimiento de voz iniciado',
      data: {
        isListening: success,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al iniciar reconocimiento de voz',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/reconocimiento-voz/detener
 * @desc    Detener reconocimiento de voz
 * @access  Private
 */
router.post('/detener', (req, res) => {
  try {
    const success = mockRecognition.stopListening();

    res.json({
      success: true,
      message: 'Reconocimiento de voz detenido',
      data: {
        isListening: !success,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al detener reconocimiento de voz',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/reconocimiento-voz/procesar-comando
 * @desc    Procesar comando de voz
 * @access  Private
 */
router.post('/procesar-comando', (req, res) => {
  try {
    const { texto } = req.body;

    if (!texto) {
      return res.status(400).json({
        success: false,
        message: 'Texto requerido'
      });
    }

    const resultado = mockRecognition.processCommand(texto);

    // Guardar transcripción
    mockRecognition.saveTranscription(texto, true);

    res.json({
      success: true,
      message: 'Comando procesado exitosamente',
      data: resultado
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al procesar comando',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/reconocimiento-voz/estado
 * @desc    Obtener estado actual del reconocimiento
 * @access  Private
 */
router.get('/estado', (req, res) => {
  try {
    const status = mockRecognition.getStatus();

    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estado',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/reconocimiento-voz/transcripciones
 * @desc    Obtener todas las transcripciones
 * @access  Private
 */
router.get('/transcripciones', (req, res) => {
  try {
    const { pacienteId } = req.query;

    let transcripciones = mockRecognition.transcriptions;

    if (pacienteId) {
      transcripciones = transcripciones.filter(t =>
        t.pacienteId && t.pacienteId == pacienteId
      );
    }

    res.json({
      success: true,
      data: transcripciones,
      total: transcripciones.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener transcripciones',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/reconocimiento-voz/transcripciones
 * @desc    Limpiar transcripciones antiguas
 * @access  Private
 */
router.delete('/transcripciones', (req, res) => {
  try {
    const { dias = 7 } = req.query;
    const limpiadas = mockRecognition.clearOldTranscriptions(parseInt(dias));

    res.json({
      success: true,
      message: 'Transcripciones limpiadas',
      data: {
        transcripcionesRestantes: limpiadas,
        diasEliminados: dias
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al limpiar transcripciones',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/reconocimiento-voz/comandos
 * @desc    Obtener lista de comandos disponibles
 * @access  Private
 */
router.get('/comandos', (req, res) => {
  try {
    const comandos = [
      { comando: 'guardar', accion: 'Guardar nota actual' },
      { comando: 'nueva nota', accion: 'Crear nueva nota' },
      { comando: 'siguiente paciente', accion: 'Ir al siguiente paciente' },
      { comando: 'paciente anterior', accion: 'Ir al paciente anterior' },
      { comando: 'exportar', accion: 'Exportar transcripciones' },
      { comando: 'ayuda', accion: 'Mostrar ayuda' },
      { comando: 'anadir nota', accion: 'Añadir nota médica' },
      { comando: 'receta medica', accion: 'Crear receta médica' },
      { comando: 'cita', accion: 'Gestionar cita' },
      { comando: 'historial', accion: 'Ver historial paciente' }
    ];

    res.json({
      success: true,
      data: comandos,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener comandos',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/reconocimiento-voz/prueba-audio
 * @desc    Probar micrófono y compatibilidad
 * @access  Private
 */
router.post('/prueba-audio', (req, res) => {
  try {
    // Simulación de prueba de audio
    const compatibilidad = {
      soportado: true,
      navegador: 'Chrome/Firefox/Safari',
      versionMinima: '65',
      permisos: 'Requerido',
      estado: 'Listo para uso'
    };

    res.json({
      success: true,
      message: 'Prueba de audio completada',
      data: compatibilidad
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en prueba de audio',
      error: error.message
    });
  }
});

module.exports = router;