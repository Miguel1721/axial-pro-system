# 📄 DOCUMENTACIÓN WOMPI - INTEGRACIÓN AXIAL PRO

## 🔗 ENLACES ÚTILES

- **Sitio oficial:** https://wompi.co
- **Documentación API:** https://wompi.co/documentación
- **Panel desarrollador:** https://dashboard.wompi.co
- **Soporte:** soporte@wompi.co
- **Sandbox:** https://sandbox.wompi.co

---

## 🎯 ¿POR QUÉ ELEGIR WOMPI?

### ✅ Ventajas

- **Sin costos de integración:** Gratis para comenzar
- **Cuotas sin interés:** Hasta 12 cuotas
- **Nequi integration:** Pagos con Nequi
- **API REST moderna:** Fácil de integrar
- **Soporte 24/7:** Atención en español
- **Comisiones competitivas:** 2.99% + 300 COP

### 💰 Tarifas

| Método | Costo |
|--------|-------|
| Tarjeta de crédito | 2.99% + $300 COP |
| Tarjeta de débito | 2.49% + $300 COP |
| Nequi | 1.5% + $100 COP |
| PSE | $500 COP (fijo) |

---

## 🔧 CONFIGURACIÓN

### 1. Crear Cuenta

1. Ir a https://dashboard.wompi.co
2. Registrarse como negocio
3. Completar verificación de identidad
4. Configurar datos del negocio

### 2. Obtener Credenciales

En el panel de Wompi:

```
Configuración → Integraciones → Llaves de API
```

Obtendrás:
- **Public Key:** Para el frontend
- **Private Key:** Para el backend (¡CONFIDENCIAL!)
- **Event Type:** Para webhooks

### 3. Configurar Webhooks

```
Configuración → Webhooks → Nueva URL
```

URL: `https://api.centro-salud.agentesia.cloud/api/payments/webhook/wompi`

Eventos a suscribirse:
- ✅ transaction.updated
- ✅ tokenization.created

### 4. Obtener Acceptance Token

Necesario para crear transacciones:

```
GET https://sandbox.wompi.co/v1/merchants
```

Respuesta:
```json
{
  "data": {
    "presigned_acceptance": {
      "acceptance_token": "pw_live_abc123...",
      "permalink": "https://checkout.wompi.co/acceptance...",
      "type": "AVERAGE_RECTIFICATION"
    }
  }
}
```

---

## 📝 INTEGRACIÓN

### Configuración en Axial Pro

```json
{
  "provider": "wompi",
  "mode": "sandbox",
  "config": {
    "apiUrl": "https://sandbox.wompi.co",
    "publicKey": "tu_public_key_aqui",
    "privateKey": "tu_private_key_aqui",
    "acceptanceToken": "tu_acceptance_token_aqui",
    "returnUrl": "https://centro-salud.agentesia.cloud/payment/return",
    "cancelUrl": "https://centro-salud.agentesia.cloud/payment/cancel",
    "webhookUrl": "https://api.centro-salud.agentesia.cloud/api/payments/webhook/wompi"
  }
}
```

### Cambiar a Producción

```json
{
  "provider": "wompi",
  "mode": "production",
  "config": {
    "apiUrl": "https://production.wompi.co",
    "publicKey": "pub_prod_xxxxx",
    "privateKey": "prv_prod_xxxxx",
    "acceptanceToken": "prod_token_xxxxx"
  }
}
```

---

## 🔄 FLUJO DE PAGO

### 1. Crear Link de Pago (Integration Link)

```javascript
const paymentData = {
  id: 'ORD_12345',
  amount: 150000,
  currency: 'COP',
  patientEmail: 'juan@email.com',
  patientName: 'Juan Pérez',
  appointmentId: 'APT_001',
  patientId: 'PAT_001',
  doctorId: 'DOC_001'
};

const order = await gateway.createPaymentOrder(paymentData);

// Respuesta:
{
  "id": "ORD_12345",
  "status": "pending",
  "provider": "wompi",
  "providerTransactionId": "WOMPI_ABC123",
  "paymentUrl": "https://checkout.wompi.co/...",
  "amount": 150000,
  "currency": "COP"
}
```

### 2. Redirigir al Paciente

```javascript
window.location.href = order.paymentUrl;
```

El paciente verá:
- Formulario de pago de Wompi
- Opciones: Tarjeta, Nequi, PSE
- Cuotas disponibles (si aplica)

### 3. Webhook de Confirmación

Wompi enviará un POST a tu webhook:

```json
{
  "event": "transaction.updated",
  "data": {
    "transaction": {
      "id": "WOMPI_ABC123",
      "reference": "ORD_12345",
      "status": "APPROVED",
      "amount_in_cents": 15000000,
      "currency": "COP",
      "payment_method_type": "CARD",
      "paid_at": "2026-05-02T22:30:00.000Z"
    }
  }
}
```

### 4. Verificar Firma

```javascript
const signature = req.headers['x-signature'];
const timestamp = req.headers['x-timestamp'];
const payload = req.body;

// Calcular firma esperada
const data = timestamp + JSON.stringify(payload);
const expectedSignature = crypto
  .createHmac('sha256', PRIVATE_KEY)
  .update(data)
  .digest('hex');

if (signature !== expectedSignature) {
  return res.status(401).json({ error: 'Invalid signature' });
}
```

---

## 🎨 MÉTODOS DE PAGO SOPORTADOS

### Tarjeta de Crédito/Débito

```javascript
{
  payment_method_type: "CARD",
  card: {
    "number": "4242424242424242", // Test
    "cvc": "123",
    "expiry": "2025/12",
    "card_holder": "JUAN PEREZ"
  }
}
```

### Nequi

```javascript
{
  payment_method_type: "NEQUI",
  phone: "+573001234567"
}
```

### PSE

```javascript
{
  payment_method_type: "PSE",
  bank_code: "1007",
  return_url: "https://..."
}
```

---

## ✅ TESTING - TARJETAS DE PRUEBA

### Wompi Sandbox

Usa estas tarjetas para probar:

#### ✅ Pagos Exitosos

| Tarjeta | Resultado |
|---------|-----------|
| `4242 4242 4242 4242` | Aprobado |
| `4012 8888 8888 1881` | Aprobado (con cuotas) |

#### ❌ Pagos Fallidos

| Tarjeta | Resultado |
|---------|-----------|
| `4000 0000 0000 0002` | Tarjeta rechazada |
| `4000 0000 0000 9995` | Fondos insuficientes |
| `4000 0000 0000 0069` | Tarjeta vencida |

#### 🔢 Datos de Prueba

- **CVC:** Cualquier 3 dígitos
- **Fecha:** Cualquier fecha futura
- **Nombre:** Cualquier nombre

---

## 📊 ESTADOS DE TRANSACCIÓN

| Estado Wompi | Estado Axial Pro | Descripción |
|--------------|------------------|-------------|
| `PENDING` | `pending` | Orden creada, esperando pago |
| `APPROVED` | `completed` | Pago exitoso |
| `DECLINED` | `failed` | Pago rechazado |
| `ERROR` | `failed` | Error en proceso |
| `VOIDED` | `refunded` | Reembolsado |

---

## 🔔 WEBHOOKS

### Eventos Recibidos

1. **transaction.created**
   - Se dispara cuando se crea una transacción

2. **transaction.updated**
   - Se dispara cuando cambia el estado
   - IMPORTANTE: Aquí confirmas el pago

3. **tokenization.created**
   - Se dispara al tokenizar una tarjeta

### Verificar Webhook

```javascript
app.post('/api/payments/webhook/wompi', async (req, res) => {
  const signature = req.headers['x-signature'];
  const timestamp = req.headers['x-timestamp'];

  // Verificar firma
  const isValid = await gateway.provider.verifyWebhook({
    headers: req.headers,
    body: req.body
  });

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid webhook' });
  }

  // Procesar pago
  const result = await gateway.processPayment({
    headers: req.headers,
    body: req.body
  });

  res.json({ received: true });
});
```

---

## 🛡️ SEGURIDAD

### ✅ Buenas Prácticas

1. **Nunca exponer Private Key en el frontend**
2. **Usar HTTPS en producción**
3. **Verificar firmas de webhooks**
4. **Validar montos antes de procesar**
5. **Implementar idempotencia en transacciones**

### ⚠️ Precauciones

- **Private Key:** Solo en backend, nunca en commits
- **Public Key:** Se puede usar en frontend
- **Webhooks:** Validar SIEMPRE la firma
- **Logs:** No logs con información sensible

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "Invalid acceptance token"

**Solución:**
- Obtener un nuevo acceptance token
- Verificar que sea del ambiente correcto (sandbox/production)

### Error: "Signature verification failed"

**Solución:**
- Verificar timestamp (debe ser UTC)
- Usar Private Key correcta
- Concatenar timestamp + payload en orden correcto

### Pago queda en PENDING

**Solución:**
- Esperar webhook de actualización
- Consultar estado manualmente después de 1 minuto
- Verificar que el webhook esté configurado correctamente

---

## 📞 SOPORTE WOMPI

- **Email:** soporte@wompi.co
- **Teléfono:** +57 601 720 9030
- **Chat:** Disponible en el dashboard
- **Documentación:** https://wompi.co/documentación

---

## 🎯 PRÓXIMOS PASOS

1. **Crear cuenta** en Wompi Sandbox
2. **Obtener credenciales** (Public Key, Private Key)
3. **Configurar en Axial Pro** (panel admin)
4. **Probar en sandbox** con tarjetas de prueba
5. **Configurar webhook** en el dashboard
6. **Verificar firma** de webhooks
7. **Ir a producción** con credenciales reales

---

**🚀 WOMPI ES UNA DE LAS PASARELAS MÁS MODERNAS DE COLOMBIA**