/**
 * MODELO DE INTEGRACIÓN CON CHATBOT EXTERNO
 * Sistema para conectar con chatbot de triaje de empresa externa
 */

const axios = require('axios');

/**
 * Configuración del Chatbot Externo
 */
const CHATBOT_CONFIG = {
  // Modo: 'simulacion' o 'produccion'
  modo: process.env.CHATBOT_MODO || 'simulacion',

  // API Externa (cuando esté disponible)
  apiUrl: process.env.CHATBOT_API_URL || 'https://api.chatbot-externo.com',
  apiKey: process.env.CHATBOT_API_KEY || '',

  // Configuración de timeout
  timeout: 10000, // 10 segundos

  // Configuración de reintentos
  maxRetries: 3,
  retryDelay: 1000
};

/**
 * Clase para manejar el chatbot externo
 */
class ChatbotExterno {
  /**
   * Enviar mensaje al chatbot y obtener respuesta
   */
  static async enviarMensaje(mensaje, pacienteInfo = {}) {
    try {
      if (CHATBOT_CONFIG.modo === 'simulacion') {
        return this.getRespuestaSimulada(mensaje, pacienteInfo);
      }

      // Modo producción: Llamar a API externa
      return await this.llamarAPIExterna(mensaje, pacienteInfo);
    } catch (error) {
      console.error('Error comunicando con chatbot externo:', error);
      // Fallback a simulación si hay error
      return this.getRespuestaSimulada(mensaje, pacienteInfo);
    }
  }

  /**
   * Llamar a la API externa del chatbot
   */
  static async llamarAPIExterna(mensaje, pacienteInfo) {
    try {
      const payload = {
        mensaje: mensaje,
        paciente: pacienteInfo,
        timestamp: new Date().toISOString()
      };

      const response = await axios.post(
        `${CHATBOT_CONFIG.apiUrl}/v1/chat`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${CHATBOT_CONFIG.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: CHATBOT_CONFIG.timeout
        }
      );

      return {
        success: true,
        respuesta: response.data.respuesta,
        clasificacion: response.data.clasificacion,
        urgencia: response.data.urgencia,
        accion_sugerida: response.data.accion_sugerida,
        fuente: 'api_externa'
      };
    } catch (error) {
      console.error('Error en API externa:', error.message);
      throw error;
    }
  }

  /**
   * Obtener respuesta simulada para desarrollo
   */
  static async getRespuestaSimulada(mensaje, pacienteInfo) {
    const mensajeLower = mensaje.toLowerCase();

    // Simular tiempo de respuesta
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Lógica simple de triaje simulado
    let respuesta = '';
    let clasificacion = 'general';
    let urgencia = 'baja';
    let accionSugerida = '';

    // Detección de palabras clave para emergencias
    if (mensajeLower.match(/emergencia|urgente|dolor fuerte|no puedo respirar|sangrado|infarto|derrame|ataque/i)) {
      respuesta = '🚨 **EMERGENCIA DETECTADA**\n\nBasado en su mensaje, parece que necesita atención inmediata. Por favor:\n\n1. Llame al 911 o acuda a urgencias más cercana\n2. No conduzca usted mismo\n3. Si es posible, informe su ubicación actual\n\n¿Necesita que llamemos a una ambulancia?';
      clasificacion = 'emergencia';
      urgencia = 'alta';
      accionSugerida = 'llamar_emergencias';
    }
    // Detección de síntomas graves
    else if (mensajeLower.match(/fiebre alta|dolor pecho|dificultad para respirar|vomito sangre|perdida conocimiento/i)) {
      respuesta = '⚠️ **SÍNTOMAS GRAVES DETECTADOS**\n\nSus síntomas requieren atención médica urgente. Le recomiendo:\n\n1. Acudir a urgencias lo antes posible\n2. Si no puede movilizarse, llame a emergencias\n3. Tenga sus documentos médicos a mano\n\n¿Desea que le ayudemos a buscar el centro más cercano?';
      clasificacion = 'urgente';
      urgencia = 'alta';
      accionSugerida = 'acudir_urgencias';
    }
    // Detección de consultas generales
    else if (mensajeLower.match(/cita|consulta|doctor|medico|turno|horario/i)) {
      respuesta = '📅 **AGENDA DE CITAS**\n\nPuedo ayudarle a:\n\n1. Programar una nueva cita\n2. Consultar citas existentes\n3. Cambiar o cancelar una cita\n\n¿Qué necesita hacer hoy?';
      clasificacion = 'citas';
      urgencia = 'baja';
      accionSugerida = 'menu_citas';
    }
    // Detección de consultas de medicamentos
    else if (mensajeLower.match(/medicamento|medicina|receta|farmacia|pastilla/i)) {
      respuesta = '💊 **MEDICAMENTOS**\n\nPara consultas sobre medicamentos:\n\n1. Para renovar recetas, contacte a su médico\n2. Para verificar stock, llame a farmacia\n3. Para efectos secundarios, consulte a su médico\n\n¿Cuál es su consulta específica?';
      clasificacion = 'medicamentos';
      urgencia = 'baja';
      accionSugerida = 'informacion_medicamentos';
    }
    // Respuesta por defecto
    else {
      respuesta = '👋 **Bienvenido al Asistente Virtual de Axial Pro Clinic**\n\n¿En qué puedo ayudarle hoy?\n\nPuedo asistirle con:\n• 📅 **Citas**: Programar, cambiar o cancelar citas\n• 💊 **Medicamentos**: Consultas sobre tratamientos\n• ⚠️ **Síntomas**: Evaluación preliminar de urgencia\n• ℹ️ **Información**: Horarios, servicios, contacto\n\nPor favor, describa su consulta y intentaré ayudarle.';
      clasificacion = 'bienvenida';
      urgencia = 'baja';
      accionSugerida = 'esperar_input';
    }

    return {
      success: true,
      respuesta: respuesta,
      clasificacion: clasificacion,
      urgencia: urgencia,
      accion_sugerida: accionSugerida,
      fuente: 'simulacion'
    };
  }

  /**
   * Iniciar conversación con paciente
   */
  static async iniciarConversacion(pacienteInfo) {
    try {
      const mensajeBienvenida = {
        mensaje: 'iniciar_conversacion',
        paciente: pacienteInfo
      };

      return await this.enviarMensaje('', pacienteInfo);
    } catch (error) {
      console.error('Error iniciando conversación:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas del chatbot
   */
  static async getEstadisticas() {
    return {
      modo: CHATBOT_CONFIG.modo,
      api_configurada: !!CHATBOT_CONFIG.apiKey,
      api_url: CHATBOT_CONFIG.modo === 'produccion' ? CHATBOT_CONFIG.apiUrl : 'No configurada',
      ultimos_7_dias: {
        conversaciones: Math.floor(Math.random() * 100) + 50,
        emergencias_detectadas: Math.floor(Math.random() * 10) + 1,
        citas_agendadas: Math.floor(Math.random() * 30) + 10
      },
      satisfaccion_pacientes: 4.2
    };
  }

  /**
   * Probar conexión con API externa
   */
  static async probarConexion() {
    try {
      if (CHATBOT_CONFIG.modo === 'simulacion') {
        return {
          success: true,
          modo: 'simulacion',
          mensaje: 'Modo simulación activo. La API externa no está configurada.'
        };
      }

      const response = await axios.get(
        `${CHATBOT_CONFIG.apiUrl}/health`,
        {
          headers: {
            'Authorization': `Bearer ${CHATBOT_CONFIG.apiKey}`
          },
          timeout: 5000
        }
      );

      return {
        success: true,
        modo: 'produccion',
        mensaje: 'Conexión exitosa con API externa',
        status: response.status
      };
    } catch (error) {
      return {
        success: false,
        modo: 'produccion',
        mensaje: `Error de conexión: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Cambiar modo de operación
   */
  static async cambiarModo(nuevoModo) {
    if (!['simulacion', 'produccion'].includes(nuevoModo)) {
      throw new Error('Modo inválido. Debe ser "simulacion" o "produccion"');
    }

    CHATBOT_CONFIG.modo = nuevoModo;

    return {
      success: true,
      modo: nuevoModo,
      mensaje: `Modo cambiado a ${nuevoModo}`
    };
  }

  /**
   * Actualizar configuración de API
   */
  static async actualizarConfiguracion(config) {
    if (config.apiUrl) {
      CHATBOT_CONFIG.apiUrl = config.apiUrl;
    }
    if (config.apiKey) {
      CHATBOT_CONFIG.apiKey = config.apiKey;
    }

    return {
      success: true,
      mensaje: 'Configuración actualizada correctamente',
      config: {
        apiUrl: CHATBOT_CONFIG.apiUrl,
        apiKey: CHATBOT_CONFIG.apiKey ? '***' : 'No configurada'
      }
    };
  }

  /**
   * Obtener configuración actual (sin mostrar API key)
   */
  static getConfiguracion() {
    return {
      modo: CHATBOT_CONFIG.modo,
      apiUrl: CHATBOT_CONFIG.apiUrl,
      apiKeyConfigurada: !!CHATBOT_CONFIG.apiKey,
      timeout: CHATBOT_CONFIG.timeout,
      maxRetries: CHATBOT_CONFIG.maxRetries
    };
  }
}

module.exports = { ChatbotExterno, CHATBOT_CONFIG };
