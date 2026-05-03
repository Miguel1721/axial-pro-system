/**
 * CONFIGURACIÓN PARA INTEGRACIÓN CON WHATSAPP
 * Incluye templates, configuración de proveedores y guidelines
 */

module.exports = {
  // Configuración recomendada para diferentes proveedores
  providers: {
    twilio: {
      name: 'Twilio',
      description: 'Plataforma global de mensajería con soporte para WhatsApp',
      website: 'https://www.twilio.com/whatsapp',
      features: [
        'WhatsApp Business API',
        'Mensajes de texto y multimedia',
        'Webhooks para respuestas',
        'Estadísticas detalladas',
        'Soporte global'
      ],
      setupSteps: [
        'Crear cuenta en Twilio',
        'Verificar número de teléfono colombiano',
        'Solicitar acceso a WhatsApp Business API',
        'Configurar sandbox para pruebas',
        'Obtener Account SID y Auth Token'
      ],
      configTemplate: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        phoneNumber: process.env.TWILIO_PHONE_NUMBER,
        sandboxEnabled: true,
        webhookUrl: `${process.env.BASE_URL || 'https://api.axialclinic.com'}/api/recordatorios/webhooks/whatsapp`
      },
      // Plantillas de mensajes pre aprobadas por WhatsApp
      messageTemplates: {
        citaConfirmada: {
          template: 'confirmacion_cita',
          components: {
            body: [
              {
                type: 'text',
                text: `Hola {{1}}\n\nConfirmamos su cita el {{2}} a las {{3}} con {{4}}.\n\nPor favor llegue 15 minutos antes.\n\nAxial Pro Clinic`
              }
            ]
          }
        },
        recordatorio: {
          template: 'recordatorio_cita',
          components: {
            body: [
              {
                type: 'text',
                text: `Hola {{1}},\n\nLe recordamos su cita mañana {{2}} a las {{3}}.\n\nConsultorio: {{4}}\n\nSi no puede asistir, por favor notifiquenos.`
              }
            ]
          }
        },
        posPregunta: {
          template: 'encuesta_satisfaccion',
          components: {
            body: [
              {
                type: 'text',
                text: `Hola {{1}},\n\n¿Cómo fue su experiencia con nosotros?\n\nValoranos su opinión para mejorar.`
              }
            ]
          }
        }
      }
    },
    sendgrid: {
      name: 'SendGrid',
      description: 'Servicio de email con opción de WhatsApp via Twilio',
      website: 'https://sendgrid.com',
      features: [
        'Alta tasa de entrega',
        'Plantillas personalizadas',
        'Analytics avanzados',
        'Automatización',
        'Escalabilidad'
      ],
      setupSteps: [
        'Crear cuenta en SendGrid',
        'Verificar dominio',
        'Configurar sender authentication',
        'Crear plantillas de email',
        'Obtener API Key'
      ],
      configTemplate: {
        apiKey: process.env.SENDGRID_API_KEY,
        fromEmail: process.env.SENDGRID_FROM_EMAIL,
        fromName: 'Axial Pro Clinic',
        tracking: true,
        analytics: true
      }
    },
    local: {
      name: 'Proveedores Locales (Colombia)',
      description: 'Integración con proveedores colombianos de SMS/WhatsApp',
      website: '',
      examples: [
        'Movii',
        'PagaTodo',
        'Siesa (SMS)',
        'Operadores locales'
      ],
      setupSteps: [
        'Contactar proveedor local',
        'Solicitar cuenta de negocio',
        'Configurar API REST',
        'Probar enviando mensajes',
        'Configurar webhooks'
      ],
      configTemplate: {
        apiUrl: process.env.LOCAL_MESSAGING_API,
        apiKey: process.env.LOCAL_MESSAGING_KEY,
        provider: 'custom',
        timeout: 30000,
        retries: 3
      }
    }
  },

  // Variables personalizadas disponibles en mensajes
  variables: {
    paciente: {
      description: 'Nombre del paciente',
      example: 'María González'
    },
    medico: {
      description: 'Nombre del médico',
      example: 'Dr. Juan Pérez'
    },
    especialidad: {
      description: 'Especialidad médica',
      example: 'Cardiología'
    },
    fecha: {
      description: 'Fecha de la cita',
      example: '3 de mayo de 2024'
    },
    hora: {
      description: 'Hora de la cita',
      example: '10:00 AM'
    },
    consultorio: {
      description: 'Número de consultorio',
      example: '201'
    },
    tipo: {
      description: 'Tipo de cita',
      example: 'Control'
    },
    linkConfirmacion: {
      description: 'Enlace para confirmar/cancelar',
      example: 'https://axialclinic.com/confirmar/123'
    }
  },

  // Plantillas recomendadas para diferentes escenarios
  templates: {
    recordatorioAntesCita: {
      title: 'Recordatorio 24h antes',
      whatsapp: 'Hola {{paciente}}, recordatorio que tiene cita con {{medico}} mañana {{fecha}} a las {{hora}}. Por favor llegue 15 minutos antes.',
      sms: 'Sr/a {{paciente}}, recordatorio cita {{tipo}} {{fecha}} {{hora}}. Confirme asistencia: {{linkConfirmacion}}',
      email: 'Estimado/a {{paciente}}, le recordamos su cita con {{medico}} especialista en {{especialidad}}. Fecha: {{fecha}}, Hora: {{hora}}. Consultorio: {{consultorio}}'
    },
    confirmacionCita: {
      title: 'Confirmación de cita',
      whatsapp: 'Hola {{paciente}}, su cita con {{medico}} está confirmada para {{fecha}} a las {{hora}}. Consultorio {{consultorio}}. ¿Necesita algo más?',
      sms: 'Cita confirmada: {{paciente}} el {{fecha}} {{hora}} con {{medico}}. Tráiga documento de identidad y seguro.',
      email: 'Confirmación de Cita - Axial Pro Clinic\n\nPaciente: {{paciente}}\nMédico: {{medico}}\nEspecialidad: {{especialidad}}\nFecha: {{fecha}}\nHora: {{hora}}\nConsultorio: {{consultorio}}'
    },
    recordatorioDia: {
      title: 'Recordatorio el día de la cita',
      whatsapp: 'Buenos días {{paciente}}, recordatorio que su cita es hoy a las {{hora}} en {{consultorio}}. Le esperamos con sus documentos.',
      sms: 'Recordatorio hoy: {{paciente}}, cita {{hora}} consultorio {{consultorio}}. Llegue 15 min antes.',
      email: 'Recordatorio de Cita de Hoy - Axial Pro Clinic\n\nSu cita es hoy a las {{hora}} en el consultorio {{consultorio}}'
    },
    cancelacion: {
      title: 'Cancelación de cita',
      whatsapp: 'Hola {{paciente}}, lamentamos informar que su cita con {{medico}} del {{fecha}} ha sido cancelada por motivos de fuerza mayor. Le contactaremos para reprogramar.',
      sms: 'Su cita {{fecha}} {{hora}} ha sido cancelada. Pronto contactaremos para nueva fecha.',
      email: 'Cancelación de Cita - Axial Pro Clinic\n\nEstimado/a {{paciente}},\n\nLamentamos informar que su cita del {{fecha}} ha sido cancelada. Nos pondremos en contacto para ofrecerle una nueva fecha.'
    },
    encuestaPostCita: {
      title: 'Encuesta de satisfacción',
      whatsapp: 'Hola {{paciente}}, ¿cómo fue su experiencia hoy? Valoramos su opinión para mejorar. Responde 1-10 siendo 10 muy satisfecho.',
      sms: 'Encuesta: ¿Qué tan satisfecho estuvo? Responda 1-10. Gracias {{paciente}}.',
      email: 'Encuesta de Satisfacción - Axial Pro Clinic\n\nEstimado/a {{paciente}},\n\n¿Qué tan satisfecho estuvo con nuestro servicio? Su opinión nos ayuda a mejorar.'
    }
  },

  // Horarios recomendados para envío
  horariosRecomendados: {
    recordatorio24h: {
      whatsapp: '09:00',
      sms: '09:00',
      email: '18:00'
    },
    recordatorioDia: {
      whatsapp: '08:00',
      sms: '08:00',
      email: '07:00'
    },
    encuestaPostCita: {
      whatsapp: '19:00',
      sms: '19:00',
      email: '20:00'
    }
  },

  // Pruebas y validación
  testing: {
    // Número de prueba para Colombia
    testNumbers: [
      '+573001234567', // Movistar
      '+573102345678',  // Claro
      '+573203456789',  // Tigo
      '+573304567890'   // Wom
    ],
    // Mensajes de prueba
    testMessages: {
      whatsapp: '👋 Hola! Este es un mensaje de prueba del sistema de recordatorios de Axial Pro Clinic.',
      sms: 'Mensaje de prueba SMS de Axial Pro Clinic. Si recibe este mensaje, el sistema funciona correctamente.',
      email: 'Mensaje de prueba de Axial Pro Clinic - Sistema de Recordatorios Automáticos'
    },
    // Validaciones requeridas
    validations: [
      'Formato de número (E164)',
      'Disponibilidad de API',
      'Webhooks configurados',
      'Plantillas aprobadas',
      'Limites de envío',
      'Costos por mensaje'
    ]
  },

  // Errores comunes y soluciones
  troubleshooting: {
    'Invalid number format': {
      cause: 'El número de teléfono no sigue el formato E164',
      solution: 'Formato requerido: +573001234567 (código de país + número completo sin 0 inicial)'
    },
    'Message template not approved': {
      cause: 'La plantilla de mensaje no ha sido aprobada por WhatsApp',
      solution: 'Enviar plantillas para aprobación previa o usar mensajes de texto simple'
    },
    'Quota exceeded': {
      cause: 'Límite diario de mensajes alcanzado',
      solution: 'Aumentar plan o optimizar frecuencia de envío'
    },
    'Webhook not configured': {
      cause: 'No se reciben respuestas del paciente',
      solution: 'Configurar webhook URL en configuración del proveedor'
    },
    'Message too long': {
      cause: 'El mensaje excede el límite de caracteres',
      solution: 'Reducir texto o usar plantillas con variables'
    }
  }
};