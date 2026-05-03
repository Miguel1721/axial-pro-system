# 📱 Configuración de WhatsApp para Axial Pro Clinic

## 📋 Resumen

Este documento describe la configuración necesaria para integrar el sistema de recordatorios automáticos con WhatsApp a través de proveedores externos.

## 🚀 Proveedores Soportados

### 1. Twilio (Recomendado para WhatsApp)

#### Requisitos
- Cuenta Twilio Business
- Número de teléfono colombiano verificado
- Acceso a WhatsApp Business API
- Account SID y Auth Token

#### Pasos de Configuración

1. **Crear cuenta en Twilio**
   ```bash
   # Ir a https://www.twilio.com/try-twilio
   # Registrarse con cuenta de negocio
   ```

2. **Verificar número colombiano**
   - Comprar número colombiano (+57)
   - Verificar el número en la consola de Twilio

3. **Solicitar acceso a WhatsApp**
   - Completar formulario en: https://www.twilio.com/whatsapp
   - Proporcionar detalles del negocio
   - Esperar aprobación (usualmente 24-48h)

4. **Configurar sandbox**
   - Agregar números de prueba en la configuración de sandbox
   - Números de prueba: `+573001234567` (formato internacional)

5. **Variables de entorno**
   ```bash
   # .env file
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=whatsapp:+573001234567
   TEST_PHONE_NUMBER=+573001234567
   ```

6. **Probar configuración**
   ```javascript
   // Probar con el endpoint de prueba
   curl -X POST https://api.axialclinic.com/api/recordatorios/probar-configuracion \
     -H "Content-Type: application/json" \
     -d '{"proveedor": "twilio", "config": {"accountSid": "...", "authToken": "...", "phoneNumber": "..."}}'
   ```

### 2. Proveedores Locales (Colombia)

#### Movii
1. Crear cuenta en https://movii.com
2. Obtener credenciales API
3. Configurar números de verificación
4. Configurar webhooks

#### Siesa SMS
1. Contactar a soporte@siesa.com
2. Solicitar acceso a API SMS
3. Configurar plantillas de mensajes
4. Establecer límites de envío

### 3. SendGrid (Solo Email)

```bash
# .env file
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=clinic@axialclinic.com
```

## ⚙️ Configuración del Sistema

### 1. Configuración Básica

Ir a: `/configuraciones` en el panel de administración

1. **Nueva Configuración**
   - Nombre del proveedor
   - Tipo: twilio/sendgrid/local
   - Horario de envío (recomendado: 09:00)
   - Días antes: 1 (24h antes)
   - Plantilla de mensaje

2. **Plantilla de Mensaje**
   ```
   Hola {{paciente}},
   
   Recordatorio de su cita con {{medico}} el {{fecha}} a las {{hora}}.
   
   Por favor llegue 15 minutos antes.
   
   Axial Pro Clinic
   ```

3. **Variables Disponibles**
   - {{paciente}}: Nombre del paciente
   - {{medico}}: Nombre del médico
   - {{especialidad}}: Especialidad médica
   - {{fecha}}: Fecha de cita
   - {{hora}}: Hora de cita
   - {{consultorio}}: Número de consultorio
   - {{tipo}}: Tipo de cita

### 2. Configuración Avanzada

#### Webhooks
Configurar URL para recibir respuestas:
```
https://api.axialclinic.com/api/recordatorios/webhooks/whatsapp
```

#### Seguimiento de Mensajes
- Estados: sent, delivered, read, failed
- Webhooks en tiempo real
- Logs de auditoría

## 📊 Monitoreo y Estadísticas

### Métricas Disponibles
- Tasa de entrega
- Tasa de lectura
- Tiempo promedio de respuesta
- Costos por mensaje
- Errores por proveedor

### Panel de Control
- Dashboard en tiempo real
- Historial de mensajes
- Estadísticas por día/semana/mes
- Alertas de errores

## 🚨 Errores Comunes y Soluciones

### Twilio
```
Error 21608: "The 'from' phone number ... is not a valid, SMS-capable inbound phone number for this organization"
Solución: Verificar que el número esté aprobado para WhatsApp
```

```
Error 21211: "Invalid 'To' phone number"
Solución: Formato E164 (+573001234567)
```

### Proveedores Locales
```
Error: Quota exceeded
Solución: Aumentar plan o optimizar frecuencia
```

## 🔒 Seguridad

### Autenticación
- API Keys gestionadas
- Webhooks firmados (HMAC)
- Logs de auditoría completa

### Privacidad de Datos
- Mensajes encriptados en tránsito
- No almacenamiento de información sensible
- Cumplimiento GDPR/CCPA

## 📱 Plantillas Recomendadas

### Recordatorio 24h antes
```
Hola {{paciente}},

Le recordamos su cita con {{medico}} mañana {{fecha}} a las {{hora}}.

Por favor llegue 15 minutos antes.

Si no puede asistir, por favor notifíquenos.

Axial Pro Clinic
```

### Confirmación de Cita
```
Hola {{paciente}},

Su cita con {{medico}} está confirmada para {{fecha}} a las {{hora}}.

Consultorio: {{consultorio}}

¿Necesita ayuda con algo más?

Axial Pro Clinic
```

## 🚀 Despliegue

### Entorno de Desarrollo
1. Usar proveedores con sandbox
2. Configurar números de prueba
3. Probar todas las plantillas

### Entorno de Producción
1. Activar modo producción
2. Usar números verificados
3. Monitorear costos
4. Configurar alertas

## 📞 Soporte

Para problemas técnicos:
- Email: soporte@axialclinic.com
- Teléfono: +57 1 234 5678
- WhatsApp: +57 300 123 4567

## 📈 Mejores Prácticas

1. **Frecuencia de Envío**
   - Máximo 2 mensajes por paciente por día
   - Respetar horarios comerciales (08:00-20:00)

2. **Personalización**
   - Usar nombre del paciente
   - Incluir detalles relevantes
   - Mantener tono profesional pero amable

3. **Optimización**
   - Probar diferentes plantillas
   - Monitorear tasas de respuesta
   - Ajustar horarios según respuestas

4. **Legal**
   - Obtener consentimiento explícito
   - Proveer opción de darse de baja
   - Cumplir normativas locales

---

*Última actualización: 3 de Mayo de 2026*