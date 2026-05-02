# 🧪 SIMULADOR DE PAGOS - DOCUMENTACIÓN

## 🎯 PROPÓSITO

El adaptador simulador permite **probar el sistema de pagos sin necesidad de API keys reales**. Es ideal para:

- ✅ Desarrollo y testing
- ✅ Demostraciones a clientes
- ✅ Pruebas de integración
- ✅ Validación de flujos de pago
- ✅ Formación de personal

---

## 🚀 CARACTERÍSTICAS

### ✨ Modo Simulación Total

- **Sin API Keys:** No requiere configuración alguna
- **Pagos en memoria:** Almacenamiento temporal (se pierde al reiniciar)
- **URLs de prueba:** Genera URLs de pago simuladas
- **Estados realistas:** Simula todos los estados de transacción

### 📊 Tasas de Éxito Realistas

| Método de Pago | Tasa de Éxito |
|---------------|--------------|
| Tarjeta de crédito | 85% |
| PSE | 90% |
| Efectivo | 100% |
| Nequi | 88% |

### 🎮 Control Manual

Además de la simulación aleatoria, puedes controlar manualmente el resultado:

```javascript
// Forzar pago exitoso
await simulator.simulateSuccessPayment(transactionId);

// Forzar pago fallido
await simulator.simulateFailedPayment(transactionId, 'Tarjeta rechazada');

// Ver estadísticas
const stats = simulator.getSimulationStats();
console.log(stats);
// { total: 10, completed: 8, failed: 2, successRate: '80%' }
```

---

## 🔧 CONFIGURACIÓN

```javascript
{
  provider: 'simulator',
  mode: 'demo',
  config: {}
}
```

**No requiere credenciales de ningún tipo.**

---

## 📖 FLUJOS DE PAGO

### 1️⃣ Crear Orden de Pago

```javascript
const paymentData = {
  id: 'ORD_12345',
  amount: 150000,
  currency: 'COP',
  patientName: 'Juan Pérez',
  patientEmail: 'juan@email.com',
  patientPhone: '+57 300 123 4567',
  appointmentId: 'APT_001',
  patientId: 'PAT_001',
  doctorId: 'DOC_001'
};

const order = await gateway.createPaymentOrder(paymentData);

// Respuesta:
{
  id: 'ORD_12345',
  status: 'pending',
  provider: 'simulator',
  providerTransactionId: 'SIM_ABC123',
  paymentUrl: 'https://centro-salud.agentesia.cloud/payment/simulator/ORD_12345',
  amount: 150000,
  currency: 'COP',
  testMode: true
}
```

### 2️⃣ Simular Proceso de Pago

El usuario es redirigido a `paymentUrl` donde verá:

1. **Formulario de pago simulado**
2. **Selección de método de pago**
3. **Información de la orden**
4. **Botón "Pagar"**

Al hacer clic en "Pagar":
- El sistema simula el procesamiento
- Aplica la tasa de éxito según el método
- Redirige al resultado (éxito/fallo)

### 3️⃣ Webhook de Confirmación

```javascript
// Webhook recibido (simulado)
{
  transaction_id: 'ORD_12345',
  payment_method: 'card',
  status: 'completed' // o 'failed'
}

const result = await gateway.processPayment(webhookData);

// Respuesta:
{
  transactionId: 'ORD_12345',
  status: 'completed',
  provider: 'simulator',
  amount: 150000,
  currency: 'COP',
  paidAt: '2026-05-02T22:30:00.000Z',
  testMode: true
}
```

---

## 🎨 INTERFAZ DE SIMULACIÓN

### Página de Pago Simulado

```
┌─────────────────────────────────────┐
│  💳 PAGO SIMULADO - AXIAL PRO CLINIC │
├─────────────────────────────────────┤
│                                      │
│  Orden: #ORD_12345                  │
│  Monto: $150,000 COP                │
│  Concepto: Consulta Médica          │
│                                      │
│  Método de Pago:                    │
│  □ Tarjeta de crédito (85% éxito)   │
│  □ PSE (90% éxito)                  │
│  □ Efectivo (100% éxito)            │
│  □ Nequi (88% éxito)                │
│                                      │
│  [💳 PAGAR AHORA]                   │
│                                      │
│  ⚠️ Modo simulación - Sin cargo real │
└─────────────────────────────────────┘
```

### Página de Resultado

**Éxito:**
```
┌─────────────────────────────────────┐
│  ✅ PAGO EXITOSO                    │
├─────────────────────────────────────┤
│  Transaction ID: ORD_12345          │
│  Monto: $150,000 COP                │
│  Método: Tarjeta de crédito         │
│  Fecha: 02/05/2026 22:30:00        │
│                                      │
│  [← Volver al sistema]              │
└─────────────────────────────────────┘
```

**Fallo:**
```
┌─────────────────────────────────────┐
│  ❌ PAGO FALLIDO                    │
├─────────────────────────────────────┤
│  Transaction ID: ORD_12345          │
│  Monto: $150,000 COP                │
│  Motivo: Tarjeta rechazada          │
│                                      │
│  [← Intentar nuevamente]            │
└─────────────────────────────────────┘
```

---

## 🧪 TESTING

### Casos de Prueba

#### 1. Pago Exitoso
```javascript
const payment = {
  id: 'TEST_SUCCESS',
  amount: 100000,
  currency: 'COP',
  payment_method: 'card' // 85% probabilidad de éxito
};

// Intentar múltiples veces hasta éxito
for (let i = 0; i < 10; i++) {
  const result = await gateway.processPayment(payment);
  if (result.status === 'completed') break;
}
```

#### 2. Pago Fallido
```javascript
// Usar método con menor probabilidad
const payment = {
  id: 'TEST_FAIL',
  payment_method: 'card'
};

// O forzar fallo manualmente
await simulator.simulateFailedPayment('TEST_FAIL', 'Saldo insuficiente');
```

#### 3. Reembolso
```javascript
const refund = await gateway.refundPayment('ORD_12345');

// Respuesta:
{
  transactionId: 'ORD_12345',
  refundId: 'REF_XYZ123',
  status: 'refunded',
  amount: 150000,
  refundedAt: '2026-05-02T22:35:00.000Z'
}
```

#### 4. Consulta de Estado
```javascript
const status = await gateway.getTransactionStatus('ORD_12345');

// Respuesta:
{
  transactionId: 'ORD_12345',
  status: 'completed',
  provider: 'simulator',
  amount: 150000,
  currency: 'COP'
}
```

---

## 📊 MÉTODOS AUXILIARES

### `simulateSuccessPayment(transactionId)`
Fuerza un pago como exitoso.

```javascript
await simulator.simulateSuccessPayment('ORD_12345');
```

### `simulateFailedPayment(transactionId, reason)`
Fuerza un pago como fallido.

```javascript
await simulator.simulateFailedPayment('ORD_12345', 'Tarjeta vencida');
```

### `getSimulationStats()`
Obtener estadísticas de simulación.

```javascript
const stats = simulator.getSimulationStats();

console.log(stats);
// {
//   total: 100,
//   completed: 85,
//   failed: 15,
//   pending: 0,
//   refunded: 5,
//   successRate: '85%'
// }
```

### `clearAllPayments()`
Limpiar todos los pagos simulados de memoria.

```javascript
simulator.clearAllPayments();
```

---

## ⚠️ LIMITACIONES

1. **Almacenamiento en memoria:** Los pagos se pierden al reiniciar el servidor
2. **Sin persistencia:** No se guardan en base de datos
3. **Sin procesamiento real:** No hay comunicación con bancos
4. **Sin notificaciones reales:** Los webhooks son simulados

---

## 🔄 MIGRACIÓN A PRODUCCIÓN

Cuando estés listo para usar una pasarela real:

1. **Elegir pasarela** (ePayco, PayU, Wompi, etc.)
2. **Crear cuenta** en la pasarela
3. **Obtener credenciales** (API Key, Secret Key)
4. **Configurar en sistema:**
   ```javascript
   {
     provider: 'epayco', // Cambiar de 'simulator' a 'epayco'
     mode: 'production',
     apiKey: 'tu_api_key_real',
     merchantId: 'tu_merchant_id',
     secretKey: 'tu_secret_key'
   }
   ```

**¡El código permanece IGUAL!** Solo cambias la configuración.

---

## 🎯 VENTAJAS

✅ **Sin costos:** No paga comisiones de prueba
✅ **Sin configuración:** Funciona de inmediato
✅ **Sin riesgos:** No hay dinero real involucrado
✅ **Rápido:** Respuestas instantáneas
✅ **Control total:** Puedes forzar resultados
✅ **Ideal para demos:** Impresiona clientes

---

## 📞 SOPORTE

Para más información:
- **README General:** `../README.md`
- **Documentación Axial Pro:** `/home/ubuntu/axial-pro-system/CLAUDE_CODE_MAESTRO.md`

---

**🧪 EL SIMULADOR HACE QUE EL DESARROLLO DE PAGOS SEA SEGURO Y RÁPIDO**