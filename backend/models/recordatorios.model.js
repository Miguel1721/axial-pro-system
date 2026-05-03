const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'axial_clinic_db',
  user: process.env.DB_USER || 'axial_admin',
  password: process.env.DB_PASSWORD || 'axial_password_123'
});

// Clase para manejar proveedores de messaging
class ProveedorMessaging {
  constructor(tipo) {
    this.tipo = tipo;
    this.config = this.obtenerConfiguracion(tipo);
  }

  obtenerConfiguracion(tipo) {
    const configuraciones = {
      twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        phoneNumber: process.env.TWILIO_PHONE_NUMBER
      },
      sendgrid: {
        apiKey: process.env.SENDGRID_API_KEY,
        fromEmail: process.env.SENDGRID_FROM_EMAIL
      },
      local: {
        apiUrl: process.env.LOCAL_MESSAGING_API,
        apiKey: process.env.LOCAL_MESSAGING_KEY
      }
    };
    return configuraciones[tipo] || null;
  }

  async enviarMensaje(destinatario, mensaje, tipo = 'whatsapp') {
    try {
      switch (this.tipo) {
        case 'twilio':
          return this.enviarTwilio(destinatario, mensaje, tipo);
        case 'sendgrid':
          return this.enviarSendGrid(destinatario, mensaje);
        case 'local':
          return this.enviarLocal(destinatario, mensaje);
        default:
          throw new Error('Proveedor no soportado');
      }
    } catch (error) {
      console.error(`Error enviando mensaje con ${this.tipo}:`, error);
      throw error;
    }
  }

  async enviarTwilio(destinatario, mensaje, tipo) {
    const twilio = require('twilio')(this.config.accountSid, this.config.authToken);

    const options = {
      body: mensaje,
      from: this.config.phoneNumber,
      to: destinatario
    };

    if (tipo === 'whatsapp') {
      options.from = `whatsapp:${this.config.phoneNumber}`;
      options.to = `whatsapp:${destinatario}`;
    }

    return await twilio.messages.create(options);
  }

  async enviarSendGrid(destinatario, mensaje) {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(this.config.apiKey);

    const msg = {
      to: destinatario,
      from: this.config.fromEmail,
      subject: 'Recordatorio de Cita - Axial Pro Clinic',
      text: mensaje,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Recordatorio de Cita</h2>
          <p>${mensaje.replace(/\n/g, '<br>')}</p>
          <p style="margin-top: 20px; color: #666;">
            Este es un recordatorio automático de Axial Pro Clinic.
          </p>
        </div>
      `
    };

    await sgMail.send(msg);
  }

  async enviarLocal(destinatario, mensaje) {
    const response = await fetch(this.config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        to: destinatario,
        message: mensaje,
        provider: this.tipo
      })
    });

    if (!response.ok) {
      throw new Error('Error en API local de messaging');
    }

    return await response.json();
  }
}

class RecordatoriosModel {
  // Obtener todas las configuraciones de recordatorios
  async obtenerConfiguraciones() {
    const query = `
      SELECT
        id, nombre_proveedor, tipo_servicio, config,
        is_active, created_at, updated_at,
        mensaje_template, hora_envio, dias_antes,
        tipo_cita, especialidad
      FROM configuraciones_recordatorios
      ORDER BY nombre_proveedor
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Crear nueva configuración de recordatorio
  async crearConfiguracion(configuracion) {
    const {
      nombre_proveedor,
      tipo_servicio,
      config,
      mensaje_template,
      hora_envio,
      dias_antes,
      tipo_cita,
      especialidad
    } = configuracion;

    const query = `
      INSERT INTO configuraciones_recordatorios
      (nombre_proveedor, tipo_servicio, config, mensaje_template,
       hora_envio, dias_antes, tipo_cita, especialidad, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
      RETURNING id
    `;

    const result = await pool.query(query, [
      nombre_proveedor,
      tipo_servicio,
      JSON.stringify(config),
      mensaje_template,
      hora_envio,
      dias_antes,
      tipo_cita,
      especialidad
    ]);

    return result.rows[0];
  }

  // Programar recordatorio para una cita
  async programarRecordatorio(citaId, configuracionId) {
    // Obtener datos de la cita
    const citaQuery = `
      SELECT c.*, p.nombre as paciente_nombre, p.telefono, p.email,
             m.nombre as medico_nombre, m.especialidad
      FROM citas c
      JOIN pacientes p ON c.paciente_id = p.id
      JOIN medicos m ON c.medico_id = m.id
      WHERE c.id = $1
    `;
    const citaResult = await pool.query(citaQuery, [citaId]);
    const cita = citaResult.rows[0];

    if (!cita) {
      throw new Error('Cita no encontrada');
    }

    // Obtener configuración
    const configQuery = `
      SELECT * FROM configuraciones_recordatorios WHERE id = $1
    `;
    const configResult = await pool.query(configQuery, [configuracionId]);
    const config = configResult.rows[0];

    if (!config) {
      throw new Error('Configuración no encontrada');
    }

    // Calcular fecha de envío
    const fechaCita = new Date(cita.fecha);
    const fechaEnvio = new Date(fechaCita);
    fechaEnvio.setDate(fechaEnvio.getDate() - config.dias_antes);

    // Crear mensaje personalizado
    const mensaje = this.generarMensajePersonalizado(cita, config.mensaje_template);

    // Guardar registro del recordatorio programado
    const recordatorioQuery = `
      INSERT INTO recordatorios_programados
      (cita_id, configuracion_id, paciente_telefono, paciente_email,
       mensaje, fecha_envio, estado, intentos, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, 'programado', 0, CURRENT_TIMESTAMP)
      RETURNING id
    `;

    const result = await pool.query(recordatorioQuery, [
      citaId,
      configuracionId,
      cita.telefono,
      cita.email,
      mensaje,
      fechaEnvio
    ]);

    return { recordatorioId: result.rows[0].id, fechaEnvio };
  }

  // Generar mensaje personalizado
  generarMensajePersonalizado(cita, template) {
    const fechaFormateada = new Date(cita.fecha).toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const horaFormateada = new Date(`2000-01-01T${cita.hora}`).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return template
      .replace('{{paciente}}', cita.paciente_nombre)
      .replace('{{medico}}', cita.medico_nombre)
      .replace('{{especialidad}}', cita.especialidad)
      .replace('{{fecha}}', fechaFormateada)
      .replace('{{hora}}', horaFormateada)
      .replace('{{tipo}}', cita.tipo_consulta);
  }

  // Enviar recordatorio programado
  async enviarRecordatorio(recordatorioId) {
    // Obtener recordatorio
    const query = `
      SELECT rp.*, cr.config, cr.tipo_servicio
      FROM recordatorios_programados rp
      JOIN configuraciones_recordatorios cr ON rp.configuracion_id = cr.id
      WHERE rp.id = $1
    `;
    const result = await pool.query(query, [recordatorioId]);
    const recordatorio = result.rows[0];

    if (!recordatorio) {
      throw new Error('Recordatorio no encontrado');
    }

    // Crear proveedor de messaging
    const proveedor = new ProveedorMessaging(recordatorio.tipo_servicio);

    try {
      // Enviar mensaje
      const response = await proveedor.enviarMensaje(
        recordatorio.paciente_telefono,
        recordatorio.mensaje,
        'whatsapp'
      );

      // Actualizar estado
      await pool.query(`
        UPDATE recordatorios_programados
        SET estado = 'enviado',
            enviado_el = CURRENT_TIMESTAMP,
            respuesta = $1,
            intentos = intentos + 1
        WHERE id = $2
      `, [JSON.stringify(response), recordatorioId]);

      return { success: true, response };
    } catch (error) {
      // Actualizar estado con error
      await pool.query(`
        UPDATE recordatorios_programados
        SET estado = 'fallido',
            error = $1,
            intentos = intentos + 1
        WHERE id = $2
      `, [error.message, recordatorioId]);

      throw error;
    }
  }

  // Verificar y enviar recordatorios pendientes
  async verificarRecordatoriosPendientes() {
    const query = `
      SELECT rp.*, cr.config, cr.tipo_servicio
      FROM recordatorios_programados rp
      JOIN configuraciones_recordatorios cr ON rp.configuracion_id = cr.id
      WHERE rp.estado IN ('programado', 'fallido')
        AND rp.fecha_envio <= CURRENT_TIMESTAMP
        AND rp.intentos < 3
      ORDER BY rp.fecha_envio ASC
    `;

    const result = await pool.query(query);
    const pendientes = result.rows;

    const resultados = [];

    for (const recordatorio of pendientes) {
      try {
        const resultado = await this.enviarRecordatorio(recordatorio.id);
        resultados.push({ ...resultado, recordatorioId: recordatorio.id });
      } catch (error) {
        resultados.push({
          success: false,
          error: error.message,
          recordatorioId: recordatorio.id
        });
      }
    }

    return resultados;
  }

  // Obtener estadísticas de efectividad
  async obtenerEstadisticasEfectividad(fechaInicio = null, fechaFin = null) {
    let query = `
      SELECT
        COUNT(*) as total_enviados,
        COUNT(CASE WHEN estado = 'enviado' THEN 1 END) as exitosos,
        COUNT(CASE WHEN estado = 'fallido' THEN 1 END) as fallidos,
        COUNT(CASE WHEN respuesta->>'status' = 'read' THEN 1 END) as leidos,
        COUNT(CASE WHEN respuesta->>'status' = 'delivered' THEN 1 END) as entregados,
        AVG(EXTRACT(EPOCH FROM (enviado_el - fecha_envio))/3600) as tiempo_promedio_entrega
      FROM recordatorios_programados
    `;

    const params = [];
    if (fechaInicio && fechaFin) {
      query += ` WHERE enviado_el BETWEEN $1 AND $2`;
      params.push(fechaInicio, fechaFin);
    }

    const result = await pool.query(query, params);
    return result.rows[0];
  }

  // Obtener historial de recordatorios
  async obtenerHistorial(pacienteId = null, dias = 30) {
    let query = `
      SELECT
        rp.id, rp.mensaje, rp.estado, rp.fecha_envio, rp.enviado_el,
        rp.intentos, rp.error,
        c.fecha as cita_fecha, c.hora as cita_hora,
        p.nombre as paciente_nombre, p.telefono,
        cr.nombre_proveedor, cr.tipo_servicio
      FROM recordatorios_programados rp
      JOIN citas c ON rp.cita_id = c.id
      JOIN pacientes p ON c.paciente_id = p.id
      JOIN configuraciones_recordatorios cr ON rp.configuracion_id = cr.id
      WHERE rp.fecha_envio >= CURRENT_DATE - INTERVAL '${dias} days'
    `;

    const params = [];
    if (pacienteId) {
      query += ' AND p.id = $1';
      params.push(pacienteId);
    }

    query += ' ORDER BY rp.fecha_envio DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Probar configuración de proveedor
  async probarConfiguracion(proveedor, config) {
    const proveedorTest = new ProveedorMensaje(proveedor);
    proveedorTest.config = config;

    try {
      const response = await proveedorTest.enviarMensaje(
        process.env.TEST_PHONE_NUMBER || '+573001234567',
        'Mensaje de prueba de Axial Pro Clinic',
        'whatsapp'
      );

      return { success: true, response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new RecordatoriosModel();