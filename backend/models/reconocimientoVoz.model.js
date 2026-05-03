/**
 * MODELO DE RECONOCIMIENTO DE VOZ
 * Sistema de reconocimiento de voz usando Web Speech API nativa
 */

/**
 * Clase para manejar el reconocimiento de voz
 */
class ReconocimientoVoz {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.transcriptions = [];
    this.commands = {
      'guardar': 'save_note',
      'nueva nota': 'new_note',
      'siguiente paciente': 'next_patient',
      'paciente anterior': 'prev_patient',
      'exportar': 'export',
      'ayuda': 'help',
      'pausa': 'pause',
      'continuar': 'resume',
      'detener': 'stop'
    };

    this.initializeRecognition();
  }

  /**
   * Inicializar el reconocimiento de voz
   */
  initializeRecognition() {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      this.recognition = new webkitSpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'es-ES';

      this.recognition.onstart = () => {
        this.isListening = true;
        console.log('Reconocimiento de voz iniciado');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        console.log('Reconocimiento de voz detenido');
      };

      this.recognition.onresult = (event) => {
        this.handleResult(event);
      };

      this.recognition.onerror = (event) => {
        console.error('Error en reconocimiento de voz:', event.error);
      };
    } else {
      console.log('Web Speech API no soportada en este navegador');
    }
  }

  /**
   * Iniciar el reconocimiento de voz
   */
  startListening() {
    if (this.recognition && !this.isListening) {
      this.recognition.start();
      return true;
    }
    return false;
  }

  /**
   * Detener el reconocimiento de voz
   */
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      return true;
    }
    return false;
  }

  /**
   * Manejar los resultados del reconocimiento
   */
  handleResult(event) {
    let finalTranscript = '';
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    if (finalTranscript) {
      this.processCommand(finalTranscript);
      this.saveTranscription(finalTranscript, true);
    }

    return {
      final: finalTranscript,
      interim: interimTranscript
    };
  }

  /**
   * Procesar comandos de voz
   */
  processCommand(text) {
    const normalizedText = text.toLowerCase().trim();

    // Comandos directos
    for (const [command, action] of Object.entries(this.commands)) {
      if (normalizedText.includes(command)) {
        return this.executeAction(action, text);
      }
    }

    // Comandos médicos específicos
    if (normalizedText.includes('anadir nota')) {
      return this.executeAction('add_note', text);
    }

    if (normalizedText.includes('receta medica')) {
      return this.executeAction('prescription', text);
    }

    if (normalizedText.includes('cita')) {
      return this.executeAction('appointment', text);
    }

    if (normalizedText.includes('historial')) {
      return this.executeAction('history', text);
    }

    // Guardar como nota general si no es un comando
    this.saveAsNote(text);
    return { action: 'save_note', text };
  }

  /**
   * Ejecutar acciones basadas en comandos
   */
  executeAction(action, originalText) {
    const response = {
      action,
      text: originalText,
      timestamp: new Date().toISOString()
    };

    switch (action) {
      case 'save_note':
        this.saveAsNote(originalText);
        break;
      case 'new_note':
        this.createNewNote();
        break;
      case 'next_patient':
        this.navigateToNextPatient();
        break;
      case 'prev_patient':
        this.navigateToPrevPatient();
        break;
      case 'export':
        this.exportData();
        break;
      case 'help':
        this.showHelp();
        break;
    }

    return response;
  }

  /**
   * Guardar transcripción
   */
  saveTranscription(text, isFinal = false) {
    const transcription = {
      id: Date.now(),
      text,
      isFinal,
      timestamp: new Date().toISOString(),
      patientId: this.currentPatientId || null
    };

    this.transcriptions.push(transcription);
    return transcription;
  }

  /**
   * Guardar como nota médica
   */
  saveAsNote(text) {
    const note = {
      id: Date.now(),
      title: `Nota de voz - ${new Date().toLocaleDateString()}`,
      content: text,
      type: 'voice_note',
      createdAt: new Date().toISOString(),
      patientId: this.currentPatientId || null
    };

    // Aquí se guardaría en la base de datos en un sistema real
    console.log('Nota guardada:', note);
    return note;
  }

  /**
   * Crear nueva nota
   */
  createNewNote() {
    const newNote = {
      id: Date.now(),
      title: 'Nueva nota',
      content: '',
      type: 'new_note',
      createdAt: new Date().toISOString()
    };

    console.log('Nueva nota creada');
    return newNote;
  }

  /**
   * Navegar al siguiente paciente
   */
  navigateToNextPatient() {
    console.log('Navegando al siguiente paciente');
    // Lógica para cambiar de paciente
    return { action: 'navigate', target: 'next_patient' };
  }

  /**
   * Navegar al paciente anterior
   */
  navigateToPrevPatient() {
    console.log('Navegando al paciente anterior');
    // Lógica para cambiar de paciente
    return { action: 'navigate', target: 'prev_patient' };
  }

  /**
   * Exportar datos
   */
  exportData() {
    const exportData = {
      transcriptions: this.transcriptions,
      exportDate: new Date().toISOString()
    };

    console.log('Exportando datos:', exportData);
    return exportData;
  }

  /**
   * Mostrar ayuda
   */
  showHelp() {
    const helpCommands = [
      'guardar - Guardar nota actual',
      'nueva nota - Crear nueva nota',
      'siguiente paciente - Ir al siguiente paciente',
      'paciente anterior - Ir al paciente anterior',
      'exportar - Exportar todas las transcripciones',
      'ayuda - Mostrar este mensaje'
    ];

    console.log('Comandos disponibles:', helpCommands);
    return { action: 'help', commands: helpCommands };
  }

  /**
   * Obtener estado actual
   */
  getStatus() {
    return {
      isListening: this.isListening,
      transcriptionsCount: this.transcriptions.length,
      supported: this.recognition !== null
    };
  }

  /**
   * Configurar paciente actual
   */
  setCurrentPatient(patientId) {
    this.currentPatientId = patientId;
  }

  /**
   * Obtener transcripciones de un paciente
   */
  getPatientTranscriptions(patientId) {
    return this.transcriptions.filter(t => t.patientId === patientId);
  }

  /**
   * Limpiar transcripciones antiguas
   */
  clearOldTranscriptions(days = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    this.transcriptions = this.transcriptions.filter(
      t => new Date(t.timestamp) > cutoffDate
    );

    return this.transcriptions.length;
  }
}

// Exportar para uso en Node.js (simulado)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ReconocimientoVoz };
} else {
  // Exportar para navegador
  window.ReconocimientoVoz = ReconocimientoVoz;
}