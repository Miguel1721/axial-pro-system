# 📄 DOCUMENTACIÓN EPAYCO - INTEGRACIÓN AXIAL PRO

## 🔗 ENLACES ÚTILES

- **Sitio oficial:** https://epayco.co
- **Documentación API:** https://epayco.co/docs
- **Panel desarrollador:** https://dashboard.epayco.co
- **Soporte:** soporte@epayco.co

---

## 🚀 GUÍA DE INTEGRACIÓN RÁPIDA

### Paso 1: Crear Cuenta ePayco

1. Registrarse en https://dashboard.epayco.co
2. Completar verificación de negocio
3. Obtener credenciales:
   - API Key
   - Merchant ID
   - Secret Key (para webhooks)

### Paso 2: Configurar en Axial Pro

**En panel admin de Axial Pro:**

```json
{
  "provider": "epayco",
  "mode": "sandbox",
  "merchantId": "tu_merchant_id_aqui",
  "apiKey": "tu_api_key_aqui",
  "secretKey": "tu_secret_key_aqui"
}
```

**O en variables de entorno:**
```bash
EPAYCO_MERCHANT_ID=tu_merchant_id
EPAYCO_API_KEY=tu_api_key
EPAYCO_SECRET_KEY=tu_secret_key
```

### Paso 3: Crear Pago

**API Request:**
```javascript
POST /api/payments/create
{
  "patientId": 123,
  "amount": 50000,
  "currency": "COP",
  "patientName": "Juan Pérez",
  "patientEmail": "juan@email.com",
  "patientPhone": "+57 300 123 4567",
  "description": "Consulta médica"
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "TXN_1234567890_ABC",
  "paymentUrl": "https://checkout.epayco.co/...",
  "amount": 50000,
  "currency": "COP"
}
```

---

## 🔧 CONFIGURACIÓN POR AMBIENTE

### Sandbox (Pruebas)
- **URL:** https://api.secure.payco.co
- **Tarjetas de prueba:** https://docs.epayco.co/#tarjetas-prueba
- **No cobra dinero real**

### Producción
- **URL:** https://secure.epayco.co
- **Cobra dinero real**
- **Requiere certificado SSL**

---

## 📊 MÉTODOS DE PAGO SOPORTADOS

### 1. Tarjetas Crédito/Débito
- Visa, Mastercard, American Express
- Procesamiento inmediato
- Verificación 3D Secure

### 2. PSE (Pago en Línea)
- Todos los bancos colombianos
- Redirección al banco
- Confirmación inmediata

### 3. Efecty
- Pago en puntos físicos
- Código de barras
- Validación en 1 hora

### 4. Cash
- Pago en oficinas
- Referencia de pago
- Validación inmediata

---

## 🔄 WEBHOOKS (Notificaciones)

### URL de Webhook
```
https://api.centro-salud.agentesia.cloud/api/payments/webhook/epayco/{transaction_id}
```

### Eventos Notificados
- `transaction.approved` - Pago aprobado
- `transaction.declined` - Pago rechazado
- `transaction.refunded` - Pago reembolsado
- `transaction.error` - Error en pago

### Verificación de Firma
```javascript
const signature = request.headers['x-signature'];
const calculatedSignature = hmacSHA256(payload, SECRET_KEY);
```

---

## 💳 FORMULARIO DE PAGO

### HTML Integration
```html
<form action="https://checkout.epayco.co" method="POST">
  <input name="merchantId" value="TU_MERCHANT_ID" />
  <input name="apiKey" value="TU_API_KEY" />
  <input name="transactionId" value="TXN_123" />
  <input name="amount" value="50000" />
  <input name="currency" value="COP" />
  <input name="email" value="cliente@email.com" />
  <input name="name" value="Cliente" />
  <input name="mobile" value="+573001234567" />
</form>
```

### JavaScript SDK
```javascript
const ePayco = new Epayco({
  apiKey: 'TU_API_KEY',
  merchantId: 'TU_MERCHANT_ID'
});

const payment = await ePayco.createPayment({
  amount: 50000,
  currency: 'COP',
  paymentMethod: 'card',
  customer: {
    name: 'Juan Pérez',
    email: 'juan@email.com'
  }
});
```

---

## ✅ ESTADOS DE TRANSACCIÓN

| Estado ePayco | Estado Axial Pro | Descripción |
|-----------------|----------------|-------------|
| PENDING | pending | Orden creada |
| APPROVED | completed | Pago exitoso |
| DECLINED | failed | Pago rechazado |
| ERROR | failed | Error en pago |
| REFUNDED | refunded | Reembolsado |

---

## 🔐 SEGURIDAD

- **API Keys:** Encriptadas en base de datos
- **Webhooks:** Verificación con HMAC-SHA256
- **HTTPS:** Obligatorio en producción
- **PCI DSS:** Cumple con estándar de seguridad de tarjetas
- **Tokens:** Sesión única por transacción

---

## 📞 SOPORTE EPAYCO

- **Email:** soporte@epayco.co
- **Teléfono:** +57 (601) 508 9900
- **Chat:** Disponible en dashboard
- **Horario:** Lunes a Viernes 8am-6pm

---

## 🚀 PROXIMOS PASOS DESPUÉS DE CONFIGURAR

1. **Probar pago sandbox** (sin cobrar)
2. **Verificar webhook** (simulado)
3. **Ir a producción** con credenciales reales
4. **Configurar webhook** en dashboard ePayco
5. **¡Recibir primer pago real!**

---

**💡 NOTA:** Este adaptador se usa automáticamente cuando configuras ePayco en el panel admin. No necesitas modificar código.
