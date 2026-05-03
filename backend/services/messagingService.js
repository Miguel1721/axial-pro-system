/**
 * SERVICIO DE INTEGRACIÓN CON PROVEEDORES EXTERNOS
 * Maneja la comunicación con APIs de SMS/WhatsApp
 */

const axios = require('axios');
const crypto = require('crypto');

class MessagingService {
  constructor() {
    this.providers = {
      twilio: this.initializeTwilio.bind(this),
      sendgrid: this.initializeSendGrid.bind(this),
      local: this.initializeLocal.bind(this)
    };
  }

  // Inicializar proveedor Twilio
  async initializeTwilio(config) {
    const Twilio = require('twilio');
    return new Twilio(config.accountSid, config.authToken);
  }

  // Inicializar SendGrid
  async initializeSendGrid(config) {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(config.apiKey);
    return sgMail;
  }

  // Inicializar proveedor local
  initializeLocal(config) {
    return {
      apiUrl: config.apiUrl,
      apiKey: config.apiKey
    };
  }

  // Enviar mensaje genérico
  async sendMessage(provider, config, destination, message, type = 'whatsapp') {
    try {
      const providerInstance = await this.providers[provider](config);

      switch (provider) {
        case 'twilio':
          return await this.sendTwilioMessage(providerInstance, destination, message, type);
        case 'sendgrid':
          return await this.sendSendGridMessage(providerInstance, destination, message);
        case 'local':
          return await this.sendLocalMessage(providerInstance, destination, message);
        default:
          throw new Error(`Proveedor no soportado: ${provider}`);
      }
    } catch (error) {
      console.error(`Error enviando mensaje con ${provider}:`, error);
      throw error;
    }
  }

  // Enviar mensaje via Twilio
  async sendTwilioMessage(twilio, destination, message, type) {
    const from = type === 'whatsapp' ? `whatsapp:${process.env.TWILIO_PHONE_NUMBER}` : process.env.TWILIO_PHONE_NUMBER;
    const to = type === 'whatsapp' ? `whatsapp:${destination}` : destination;

    return await twilio.messages.create({
      body: message,
      from,
      to
    });
  }

  // Enviar email via SendGrid
  async sendSendGridMessage(sendGrid, destination, message) {
    const msg = {
      to: destination,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: 'Recordatorio de Cita - Axial Pro Clinic',
      text: message,
      html: this.generateEmailTemplate(message)
    };

    return await sendGrid.send(msg);
  }

  // Enviar mensaje via API local
  async sendLocalMessage(localConfig, destination, message) {
    const response = await axios.post(localConfig.apiUrl, {
      to: destination,
      message: message,
      provider: 'local'
    }, {
      headers: {
        'Authorization': `Bearer ${localConfig.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  }

  // Generar plantilla de email
  generateEmailTemplate(message) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Axial Pro Clinic</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Recordatorio de Cita</p>
        </div>
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
          <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="margin: 0; line-height: 1.6; color: #334155;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          <div style="margin-top: 20px; padding: 15px; background: #e2e8f0; border-radius: 6px;">
            <p style="margin: 0; font-size: 14px; color: #64748b;">
              <strong>Nota:</strong> Este es un mensaje automático generado por el sistema de Axial Pro Clinic.
              Por favor, no responda este email.
            </p>
          </div>
          <div style="margin-top: 20px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #94a3b8;">
              Axial Pro Clinic - Tu salud es nuestra prioridad
            </p>
          </div>
        </div>
      </div>
    `;
  }

  // Validar webhook signature (Twilio)
  validateTwilioSignature(requestBody, signature, authToken) {
    const url = `${process.env.BASE_URL || 'https://api.axialclinic.com'}/api/recordatorios/webhooks/whatsapp`;
    const stringToSign = `${url}${requestBody}`;
    const expectedSignature = crypto
      .createHmac('sha1', authToken)
      .update(stringToSign)
      .digest('base64');

    return expectedSignature === signature;
  }

  // Procesar respuesta de webhook
  async processWebhook(provider, data) {
    try {
      switch (provider) {
        case 'twilio':
          return await this.processTwilioWebhook(data);
        case 'sendgrid':
          return await this.processSendGridWebhook(data);
        case 'local':
          return await this.processLocalWebhook(data);
        default:
          throw new Error('Proveedor no soportado para webhooks');
      }
    } catch (error) {
      console.error('Error procesando webhook:', error);
      throw error;
    }
  }

  // Procesar webhook de Twilio
  async processTwilioWebhook(data) {
    const messageType = data.MessageStatus || data.CallStatus;
    const messageId = data.MessageSid;
    const timestamp = new Date().toISOString();

    // Guardar log del webhook
    console.log(`Twilio Webhook - ${messageType}: ${messageId} at ${timestamp}`);

    // Aquí se podría actualizar el estado del recordatorio en la base de datos
    // si se logra mapear el messageId con un recordatorio específico

    return { success: true, provider: 'twilio', status: messageType, messageId };
  }

  // Procesar webhook de SendGrid
  async processSendGridWebhook(data) {
    const results = data.map(event => ({
      timestamp: event.timestamp,
      email: event.email,
      event: event.event,
      reason: event.reason || null,
      messageId: event.x_message_id || null
    }));

    // Guardar logs de eventos
    results.forEach(event => {
      console.log(`SendGrid Event - ${event.event} for ${event.email}`);
    });

    return { success: true, provider: 'sendgrid', events: results };
  }

  // Procesar webhook local
  async processLocalWebhook(data) {
    console.log('Local Webhook received:', data);

    // Procesar según la estructura del proveedor local
    return { success: true, provider: 'local', data };
  }

  // Estadísticas del proveedor
  async getProviderStats(provider, config, startDate, endDate) {
    try {
      const providerInstance = await this.providers[provider](config);

      switch (provider) {
        case 'twilio':
          return await this.getTwilioStats(providerInstance, startDate, endDate);
        case 'sendgrid':
          return await this.getSendGridStats(providerInstance, startDate, endDate);
        case 'local':
          return await this.getLocalStats(providerInstance, startDate, endDate);
        default:
          throw new Error('Proveedor no soportado para estadísticas');
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  // Obtener estadísticas de Twilio
  async getTwilioStats(twilio, startDate, endDate) {
    // Obtener métricas de la API de Twilio
    const messages = await twilio.messages.list({
      dateSent: startDate.toISOString(),
      dateSentAfter: startDate.toISOString(),
      dateSentBefore: endDate.toISOString(),
      limit: 1000
    });

    const stats = {
      total: messages.length,
      delivered: messages.filter(m => m.status === 'delivered').length,
      failed: messages.filter(m => m.status === 'failed').length,
      read: messages.filter(m => m.status === 'read').length,
      timestamps: messages.map(m => ({
        sid: m.sid,
        status: m.status,
        date: m.dateCreated
      }))
    };

    return stats;
  }

  // Obtener estadísticas de SendGrid
  async getSendGridStats(sendGrid, startDate, endDate) {
    // Usar la API de SendGrid para obtener estadísticas
    const stats = await sendGrid.get({
      url: `/v3/messages/blocks`,
      qs: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      }
    });

    return stats[0] || {};
  }

  // Obtener estadísticas del proveedor local
  async getLocalStats(localConfig, startDate, endDate) {
    try {
      const response = await axios.get(`${localConfig.apiUrl}/stats`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
        headers: {
          'Authorization': `Bearer ${localConfig.apiKey}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas locales:', error);
      throw error;
    }
  }

  // Validar configuración del proveedor
  async validateProviderConfiguration(provider, config) {
    try {
      const testMessage = 'Mensaje de prueba de Axial Pro Clinic';
      const testDestination = process.env.TEST_PHONE_NUMBER || '+573001234567';

      // Enviar mensaje de prueba
      const result = await this.sendMessage(provider, config, testDestination, testMessage, 'whatsapp');

      // Verificar respuesta
      if (result.sid || result.messageId) {
        return { success: true, message: 'Configuración validada exitosamente' };
      } else {
        return { success: false, message: 'Respuesta inesperada del proveedor' };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

module.exports = new MessagingService();