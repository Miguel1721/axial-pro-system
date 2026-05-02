# 🔄 SISTEMA DE GESTIÓN DE TURNOS - DOCUMENTACIÓN COMPLETA

## 🎯 PROPÓSITO

Sistema completo de gestión de colas y turnos para Axial Pro Clinic que permite:
- Gestionar flujo de pacientes de manera eficiente
- Reducir tiempos de espera
- Priorizar casos urgentes
- Mantener informados a los pacientes en tiempo real

---

## 📋 ESTADOS DE TURNO

| Estado | Descripción | Acciones Disponibles |
|--------|-------------|---------------------|
| `esperando` | Paciente en cola esperando atención | Iniciar, Cancelar |
| `atendiendo` | Paciente siendo atendido actualmente | Completar |
| `completado` | Atención finalizada | Solo lectura |
| `cancelado` | Turno cancelado | Solo lectura |

---

## 🏥 PRIORIDADES

| Nivel | Nombre | Uso | Color |
|-------|-------|-----|-------|
| 1 | Alta | Emergencias, casos urgentes | Rojo 🔴 |
| 2 | Media | Urgencias relativas, personas mayores | Amarillo 🟡 |
| 3 | Normal | Consultas regulares | Verde 🟢 |

---

## 🏗️ ARQUITECTURA

### Backend (Node.js + PostgreSQL)

**Modelo de Datos:**
```javascript
{
  id: INTEGER (PK),
  cita_id: INTEGER (FK),
  paciente_id: INTEGER (FK),
  doctor_id: INTEGER (FK),
  servicio_id: INTEGER (FK),
  numero_turno: VARCHAR(20) UNIQUE,
  estado: VARCHAR(20),
  prioridad: INTEGER (1-3),
  hora_llegada: TIMESTAMP,
  hora_atencion: TIMESTAMP,
  hora_fin: TIMESTAMP,
  tiempo_estimado: INTEGER (minutos),
  tiempo_real: INTEGER (minutos),
  sala: VARCHAR(50),
  observaciones: TEXT,
  creado_por: INTEGER (FK),
  actualizado_por: INTEGER (FK)
}
```

**API Endpoints:**
- `POST /api/turnos` - Crear nuevo turno
- `GET /api/turnos` - Listar turnos (con filtros)
- `GET /api/turnos/:id` - Obtener turno por ID
- `GET /api/turnos/numero/:numero_turno` - Buscar por número (público)
- `PUT /api/turnos/:id/estado` - Actualizar estado
- `POST /api/turnos/:id/iniciar` - Iniciar atención
- `POST /api/turnos/:id/completar` - Completar atención
- `DELETE /api/turnos/:id` - Cancelar turno
- `GET /api/turnos/:id/tiempo-estimado` - Calcular tiempo de espera
- `GET /api/turnos/estadisticas/hoy` - Estadísticas del día
- `GET /api/turnos/doctor/:id/actual` - Turno actual del doctor
- `GET /api/turnos/doctor/:id/siguiente` - Siguiente turno en cola

### Frontend (React)

**Componentes:**
1. **GestionTurnos.jsx** - Panel de recepción
   - Lista de turnos con filtros
   - Iniciar/Completar/Cancelar turnos
   - Estadísticas en tiempo real
   - Búsqueda de pacientes
   - Control de sonido

2. **PantallaEspera.jsx** - Pantalla digital para sala de espera
   - Turno actual destacado
   - Cola de espera ordenada
   - Últimos 5 llamados
   - Tiempos estimados
   - Notificaciones sonoras

**Páginas:**
- `/turnos` - Gestión de turnos (recepción)
- `/pantalla-espera` - Pantalla digital (sala de espera)

---

## 🔄 FLUJO DE TRABAJO

### 1. Llegada del Paciente

```
Paciente llega → Recepción toma datos →
Crear turno → Asignar número y prioridad →
Paciente espera en sala
```

### 2. Llamado del Paciente

```
Doctor available → Sistema selecciona siguiente →
Mostrar en pantalla digital →
Reproducir sonido →
Paciente acude a consulta
```

### 3. Atención

```
Recepcionista inicia atención →
Estado cambia a "atendiendo" →
Doctor atiende paciente →
Finalizar atención →
Estado cambia a "completado"
```

### 4. Cálculo de Tiempos

**Algoritmo de Tiempo Estimado:**
```javascript
tiempo_total = 0

para cada turno adelante en cola:
  si turno está "atendiendo":
    tiempo_restante = tiempo_estimado - (ahora - hora_atencion)
    tiempo_total += max(0, tiempo_restante)
  si turno está "esperando":
    tiempo_total += tiempo_estimado

retornar tiempo_total
```

---

## 📊 ESTADÍSTICAS

### Métricas en Tiempo Real

- **Total hoy:** Todos los turnos creados hoy
- **Esperando:** Turnos en cola
- **Atendiendo:** Turno actual
- **Completados:** Atenciones finalizadas
- **Cancelados:** Turnos cancelados
- **Tiempo promedio:** Promedio de duración de atenciones

### Fórmulas

```javascript
tiempo_promedio_atencion = AVG(hora_fin - hora_atencion)
tiempo_promedio_espera = AVG(hora_atencion - hora_llegada)
eficiencia = (completados / total) * 100
```

---

## 🔧 CONFIGURACIÓN

### Duración de Servicios

| Servicio | Duración (min) |
|----------|----------------|
| Consulta General | 15 |
| Revisión | 10 |
| Procedimiento | 30 |
| Valoración | 20 |

### Actualización Automática

- **Frontend:** Cada 30 segundos
- **Pantalla digital:** Cada 10 segundos
- **Reloj:** Cada 1 segundo

---

## 🎨 INTERFAZ DE USUARIO

### Colores de Estados

- **Esperando:** Amarillo (`bg-yellow-100`)
- **Atendiendo:** Azul (`bg-blue-100`)
- **Completado:** Verde (`bg-green-100`)
- **Cancelado:** Rojo (`bg-red-100`)

### Gradientes

- **Principal:** Purple → Pink
- **Atendiendo:** Blue → Purple
- **Urgente:** Red → Orange

---

## 📱 NOTIFICACIONES

### Sonoras

- Archivo: `/notification.mp3`
- Control: Toggle on/off
- Activación: Al iniciar atención

### Visuales

- Badge animado del turno actual
- Pulso en pantalla digital
- Lista de últimos llamados

---

## 🚀 INSTALACIÓN

### Backend

1. El modelo de datos se inicializa automáticamente:
```javascript
const Turno = require('./models/turno.model');
// La tabla se crea automáticamente si no existe
```

2. Las rutas se registran en server.js:
```javascript
const turnosRoutes = require('./routes/turnos.routes');
app.use('/api/turnos', turnosRoutes);
```

### Frontend

1. Agregar rutas en App.jsx:
```javascript
<Route path="/turnos" element={<TurnosPage />} />
<Route path="/pantalla-espera" element={<PantallaEsperaPage />} />
```

2. Agregar en navegación:
```javascript
// En recepción
<Link to="/turnos">Gestión de Turnos</Link>

// En pantalla de espera (navegación dedicada)
<Link to="/pantalla-espera">Pantalla Digital</Link>
```

---

## 🧪 TESTING

### Casos de Prueba

#### 1. Crear Turno
```javascript
POST /api/turnos
{
  "paciente_id": 1,
  "doctor_id": 1,
  "servicio_id": 1,
  "prioridad": 3,
  "tiempo_estimado": 15
}

// Respuesta: 201 Created
{
  "success": true,
  "data": {
    "id": 1,
    "numero_turno": "20260502-D1-001",
    "estado": "esperando",
    ...
  }
}
```

#### 2. Iniciar Atención
```javascript
POST /api/turnos/1/iniciar
{
  "actualizado_por": 1
}

// Respuesta: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "estado": "atendiendo",
    "hora_atencion": "2026-05-02T10:05:00",
    ...
  }
}
```

#### 3. Calcular Tiempo
```javascript
GET /api/turnos/2/tiempo-estimado

// Respuesta: 200 OK
{
  "success": true,
  "data": {
    "turno_id": 2,
    "tiempo_estimado_minutos": 18
  }
}
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "Tabla turnos no existe"

**Solución:** El modelo se inicializa automáticamente al cargar el módulo. Reiniciar el servidor backend.

### Error: "Número de turno duplicado"

**Solución:** El número de turno es único. Se genera automáticamente con formato: `YYYYMMDD-D{doctor_id}-{contador}`

### Tiempo estimado incorrecto

**Solución:** Verificar que los turnos tengan `tiempo_estimado` configurado correctamente según el servicio.

### Pantalla digital no actualiza

**Solución:** Verificar que el intervalo de actualización esté configurado (default: 10 segundos).

---

## 📈 MÉTRICAS DE ÉXITO

### Objetivos

- ✅ **Tiempo de espera < 30 min** para prioridad normal
- ✅ **Tiempo de espera < 5 min** para prioridad alta
- ✅ **Eficiencia > 90%** (completados / total)
- ✅ **Satisfacción paciente > 4/5**

### KPIs a Medir

- Tiempo promedio de espera
- Tiempo promedio de atención
- Número de pacientes por hora
- Tasa de cancelaciones
- Peak hours (horas pico)

---

## 🔄 INTEGRACIÓN CON OTROS MÓDULOS

### Con Sistema de Citas

```javascript
// Al crear cita, opcionalmente crear turno
const turno = await Turno.create({
  cita_id: cita.id,
  paciente_id: cita.paciente_id,
  doctor_id: cita.doctor_id,
  servicio_id: cita.servicio_id
});
```

### Con Recepción

```javascript
// Al llegar el paciente
const turno = await Turno.create({
  paciente_id: paciente.id,
  doctor_id: doctorSeleccionado,
  servicio_id: servicioSeleccionado,
  prioridad: determinarPrioridad(paciente)
});
```

### Con Dashboard

```javascript
// Mostrar estadísticas en tiempo real
const stats = await Turno.getEstadisticasHoy();
// { total: 15, esperando: 5, atendiendo: 1, completados: 8 }
```

---

## 📞 SOPORTE

Para más información:
- **README General:** `../README.md`
- **Documentación Axial Pro:** `/home/ubuntu/axial-pro-system/CLAUDE_CODE_MAESTRO.md`

---

**🔄 EL SISTEMA DE GESTIÓN DE TURNOS HACE QUE LA CLÍNICA FUNCIONE COMO UN RELOJ**