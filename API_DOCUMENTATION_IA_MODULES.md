# 📚 API DOCUMENTATION - IA MODULES
**Axial Pro Clinic - Sistema de Inteligencia Artificial**
**Versión:** 2.0
**Última actualización:** 3 de Mayo de 2026

---

## 📋 TABLA DE CONTENIDOS

1. [Módulo 1: Predicción de Demanda](#módulo-1-predicción-de-demanda)
2. [Módulo 2: Optimización de Citas](#módulo-2-optimización-de-citas)
3. [Módulo 3: Chatbot de Triaje](#módulo-3-chatbot-de-triaje)
4. [Módulo 4: Análisis de Historial](#módulo-4-análisis-de-historial)
5. [Módulo 5: Reconocimiento Voz](#módulo-5-reconocimiento-voz)
6. [Módulo 6: Alertas de Stock](#módulo-6-alertas-de-stock)
7. [Módulo 7: Sentimiento Pacientes](#módulo-7-sentimiento-pacientes)
8. [Módulo 8: Sugerencias de Citas](#módulo-8-sugerencias-de-citas)
9. [Módulo 9: Automatización Recordatorios](#módulo-9-automatización-recordatorios)
10. [Módulo 10: IA Vision](#módulo-10-ia-vision)

---

## 🔐 AUTENTICACIÓN

Todos los endpoints requieren autenticación mediante token JWT en el header:

```http
Authorization: Bearer <token>
```

### Obtener Token
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```

---

## 📊 MÓDULO 1: PREDICCIÓN DE DEMANDA

### Descripción
Sistema de Machine Learning para predecir la demanda de citas médicas y optimizar recursos.

### Endpoints

#### 1. Obtener Predicciones de Demanda
```http
GET /api/predicciones/demanda?dias=7
```

**Parámetros:**
- `dias` (opcional): Número de días a predecir (defecto: 7)

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "fecha": "2026-05-04",
      "prediccion": 45,
      "confianza": 0.87,
      "factor": "Fin de semana"
    }
  ],
  "total": 7
}
```

#### 2. Obtener Predicción por Fecha
```http
GET /api/predicciones/demanda/fecha/2026-05-04
```

#### 3. Obtener Días Críticos
```http
GET /api/predicciones/dias-criticos
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "fecha": "2026-05-15",
      "nivel": "alto",
      "motivo": "Festivo local"
    }
  ]
}
```

#### 4. Obtener Estadísticas
```http
GET /api/predicciones/estadisticas
```

#### 5. Recalcular Predicciones
```http
POST /api/predicciones/demanda/recalcular
```

---

## ⚙️ MÓDULO 2: OPTIMIZACIÓN DE CITAS

### Descripción
Algoritmos inteligentes para optimizar la agenda y reducir vacíos.

### Endpoints

#### 1. Obtener Optimizaciones
```http
GET /api/optimizacion/
```

#### 2. Obtener Optimizaciones Pendientes
```http
GET /api/optimizacion/pendientes
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "opt_001",
      "tipo": "reubicacion",
      "prioridad": "alta",
      "estado": "pendiente"
    }
  ]
}
```

#### 3. Recalcular Optimizaciones
```http
POST /api/optimizacion/recalcular
```

#### 4. Obtener Estadísticas
```http
GET /api/optimizacion/estadisticas
```

---

## 🤖 MÓDULO 3: CHATBOT DE TRIAJE

### Descripción
Asistente virtual con IA para clasificación automática de urgencias médicas.

### Endpoints

#### 1. Iniciar Conversación
```http
POST /api/chatbot/iniciar
Content-Type: application/json

{
  "paciente_info": {
    "id": "PAC_001",
    "nombre": "Juan Pérez"
  }
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "respuesta": "¡Hola! ¿En qué puedo ayudarte?",
    "clasificacion": "general",
    "urgencia": "baja"
  }
}
```

#### 2. Enviar Mensaje
```http
POST /api/chatbot/enviar
Content-Type: application/json

{
  "mensaje": "Tengo dolor de cabeza",
  "paciente_info": {}
}
```

#### 3. Obtener Configuración
```http
GET /api/chatbot/configuracion
```

#### 4. Probar Conexión
```http
POST /api/chatbot/probar-conexion
```

---

## 📋 MÓDULO 4: ANÁLISIS DE HISTORIAL

### Descripción
Sistema avanzado de análisis de historial médico con detección de patrones y alertas.

### Endpoints

#### 1. Obtener Análisis de Paciente
```http
GET /api/analisis/historial/:pacienteId
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "pacienteId": "PAC_001",
    "analisis": [
      {
        "tipo": "patron_recurrente",
        "descripcion": "Dolor de cabeza frecuente",
        "frecuencia": "mensual",
        "severidad": "media"
      }
    ]
  }
}
```

#### 2. Obtener Patrones
```http
GET /api/analisis/patrones/:pacienteId
```

#### 3. Obtener Dashboard
```http
GET /api/analisis/dashboard
```

---

## 🎤 MÓDULO 5: RECONOCIMIENTO VOZ

### Descripción
Sistema de reconocimiento de voz para dictado de notas médicas y comandos.

### Endpoints

#### 1. Iniciar Reconocimiento
```http
POST /api/reconocimientoVoz/iniciar
Content-Type: application/json

{
  "idioma": "es-ES",
  "tipo": "dictado"
}
```

#### 2. Detener Reconocimiento
```http
POST /api/reconocimientoVoz/detener
```

#### 3. Procesar Comando
```http
POST /api/reconocimientoVoz/procesar-comando
Content-Type: application/json

{
  "comando": "crear cita para mañana"
}
```

---

## 💊 MÓDULO 6: ALERTAS DE STOCK

### Descripción
Sistema inteligente de predicción de agotamiento y optimización de inventario.

### Endpoints

#### 1. Detectar Alertas
```http
GET /api/alertasStock/detectar
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "alert_001",
      "medicamento": "Ibuprofeno 400mg",
      "tipo": "agotamiento",
      "prioridad": "alta",
      "stock_actual": 15,
      "stock_minimo": 50
    }
  ]
}
```

#### 2. Obtener Estadísticas
```http
GET /api/alertasStock/estadisticas
```

#### 3. Procesar Alerta
```http
POST /api/alertasStock/procesar/:id
```

---

## 😊 MÓDULO 7: SENTIMIENTO PACIENTES

### Descripción
Análisis de sentimiento y satisfacción del paciente con NPS.

### Endpoints

#### 1. Obtener Feedbacks
```http
GET /api/sentimientoPaciente/feedbacks
```

#### 2. Obtener NPS
```http
GET /api/sentimientoPaciente/nps
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "nps": 72,
    "promotores": 45,
    "pasivos": 30,
    "detractores": 25,
    "tendencia": "positiva"
  }
}
```

#### 3. Obtener Tendencias
```http
GET /api/sentimientoPaciente/tendencias
```

#### 4. Analizar Feedback
```http
POST /api/sentimientoPaciente/analizar
Content-Type: application/json

{
  "feedback": "Muy buena atención",
  "paciente_id": "PAC_001"
}
```

---

## 📅 MÓDULO 8: SUGERENCIAS DE CITAS

### Descripción
Sistema de recomendaciones inteligentes para optimización de citas.

### Endpoints

#### 1. Obtener Sugerencias
```http
GET /api/sugerenciasCitas/:pacienteId
```

#### 2. Generar Sugerencias
```http
POST /api/sugerenciasCitas/generar
Content-Type: application/json

{
  "paciente_id": "PAC_001",
  "preferencias": {
    "horario_preferido": "mañana",
    "medico_preferido": "MED_001"
  }
}
```

#### 3. Obtener Estadísticas
```http
GET /api/sugerenciasCitas/estadisticas
```

---

## 📱 MÓDULO 9: AUTOMATIZACIÓN RECORDATORIOS

### Descripción
Sistema automatizado de recordatorios vía SMS/WhatsApp con optimización de horarios.

### Endpoints

#### 1. Obtener Configuraciones
```http
GET /api/recordatorios/configuraciones
```

#### 2. Programar Recordatorio
```http
POST /api/recordatorios/programar
Content-Type: application/json

{
  "paciente_id": "PAC_001",
  "cita_id": "CITA_001",
  "tipo": "whatsapp",
  "horario": "2026-05-03T09:00:00"
}
```

#### 3. Enviar Recordatorio
```http
POST /api/recordatorios/enviar/:id
```

#### 4. Obtener Estadísticas
```http
GET /api/recordatorios/estadisticas
```

---

## 🤖 MÓDULO 10: IA VISION

### Descripción
Sistema avanzado de visión artificial para análisis de documentos, imágenes y reconocimiento facial.

### Endpoints

#### 1. Obtener Ocupación Máxima
```http
GET /api/iavision/ocupacion-maxima
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "clinicMetrics": {
      "ocupacionGeneral": 72,
      "eficiencia": 0.85
    },
    "medicos": [
      {
        "id": "MED_001",
        "ocupacionPromedio": 78,
        "diasCriticos": ["2026-05-15"]
      }
    ]
  }
}
```

#### 2. Obtener Días Críticos
```http
GET /api/iavision/dias-criticos
```

#### 3. Obtener Predicciones de Picos
```http
GET /api/iavision/prediccion-picos
```

#### 4. Optimizar Calendario
```http
POST /api/iavision/optimizar-calendario
Content-Type: application/json

{
  "calendario": [],
  "objetivos": ["reducir_vacios"]
}
```

#### 5. Chatbot de Triaje IA Vision
```http
POST /api/iavision/chatbot-triaje
Content-Type: application/json

{
  "mensaje": "Tengo dolor en el pecho",
  "pacienteId": "PAC_001"
}
```

#### 6. Analizar Documento (OCR)
```http
POST /api/iavision/analizar-documento
Content-Type: application/json

{
  "buffer": "base64_encoded_file",
  "tipo": "receta"
}
```

#### 7. Analizar Imagen
```http
POST /api/iavision/analizar-imagen
```

#### 8. Check-in Facial
```http
POST /api/iavision/checkin-facial
```

---

## 📊 RESPONSES STANDARD

### Success Response
```json
{
  "success": true,
  "data": {},
  "timestamp": "2026-05-03T12:00:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE",
  "timestamp": "2026-05-03T12:00:00Z"
}
```

### HTTP Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔧 TESTING

### Ejecutar Tests Automatizados
```bash
cd backend
node tests/framework.test.js
```

### Limpiar Código
```bash
cd backend
node scripts/clean-code.js
```

---

## 📞 SOPORTE

Para preguntas o problemas con la API de módulos IA:
- Email: api-support@axialpro.clinic
- Slack: #api-support
- Issues: GitHub Issues

---

**Documentación generada automáticamente - Axial Pro Clinic IA Team**