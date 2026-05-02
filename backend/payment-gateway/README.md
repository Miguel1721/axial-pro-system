# 🏦 SISTEMA DE PAGOS MODULAR - AXIAL PRO CLINIC

## 🎯 ESTRATEGIA DE IMPLEMENTACIÓN

Sistema de pagos **modular y flexible** que permite cambiar entre pasarelas colombianas fácilmente, sin modificar el código core.

**ÚNICO REQUISITO:** Configurar API keys y credenciales de la pasarela elegida.

---

## 📋 PASARELAS SOPORTADAS (Colombia)

### 1️⃣ EPAYCO
- **Documentación:** https://epayco.co/docs
- **Características:**
  - Pagos con tarjeta de crédito/débito
  - PSE (Pago en línea de bancos)
  - Efecty
  - Cash payment
  - API REST RESTful

### 2️⃣ PAYU
- **Documentación:** https://developers.payu.com/
- **Características:**
  - Tarjetas crédito/débito
  - PSE
  - Efecty
  - Pagos recurrentes
  - API REST

### 3️⃣ PLACETOPAY
- **Documentación:** https://developers.placetopay.com/
- **Características:**
  - Tarjetas
  - PSE
  - Efecty
  - Cash
  - API REST

### 4️⃣ WOMPI
- **Documentación:** https://wompi.co/documentacion
- **Características:**
  - Pagos en cuotas
  - Tarjetas
  - Nequi
  - API REST

### 5️⃣ STRIPE (Internacional)
- **Documentación:** https://stripe.com/docs
- **Características:**
  - API más robusta del mercado
  - Soporte internacional
  - Webhooks
  - Stripe Connect

---

## 🏗️ ARQUITECTURA MODULAR

```
payment-gateway/
├── core/                      # NÚCLEO DEL SISTEMA
│   ├── PaymentGateway.js      # Gateway principal
│   ├── Transaction.js          # Modelo de transacción
│   ├── PaymentProcessor.js    # Procesador genérico
│   └── WebhookHandler.js       # Manejo de webhooks
│
├── providers/                  # ADAPTADORES POR PASARELA
│   ├── epayco/
│   │   ├── EPayCoAdapter.js
│   │   ├── EPayCoClient.js
│   │   └── DOCUMENTACION.md
│   ├── payu/
│   │   ├── PayUAdapter.js
│   │   ├── PayUClient.js
│   │   └── DOCUMENTACION.md
│   ├── placetopay/
│   │   ├── PlaceToPayAdapter.js
│   │   ├── PlaceToPayClient.js
│   │   └── DOCUMENTACION.md
│   ├── wompi/
│   │   ├── WompiAdapter.js
│   │   ├── WompiClient.js
│   │   └── DOCUMENTACION.md
│   ├── stripe/
│   │   ├── StripeAdapter.js
│   │   ├── StripeClient.js
│   │   └── DOCUMENTACION.md
│   └── simulator/
│       ├── SimulatorAdapter.js # PAGOS SIMULADOS
│       ├── SimulatorClient.js
│       └── DOCUMENTACION.md
│
├── config/                     # CONFIGURACIÓN
│   ├── payment.config.js       # Configuración principal
│   └── credentials.config.js    # Credenciales encriptadas
│
└── routes/                     # ENDPOINTS API
    ├── payment.routes.js        # Rutas de pagos
    ├── webhook.routes.js        # Webhooks de pasarelas
    └── config.routes.js        # Configuración admin
```

---

## 🔧 CÓMO FUNCIONA

### 1. FLUJO DE PAGO

```
Paciente → Sistema → PaymentGateway → ProviderAdapter → Pasarela
           ↓
        Crear orden de pago
           ↓
        Redirigir a pasarela
           ↓
        Procesar pago
           ↓
        Webhook de confirmación
           ↓
        Actualizar estado
```

### 2. CAMBIAR DE PASARELA

**Solo 2 pasos:**

1. **En panel admin:**
   ```javascript
   {
     "provider": "epayco", // o "payu", "placetopay", "wompi", "stripe"
     "mode": "sandbox",
     "apiKey": "tu_api_key_aqui"
   }
   ```

2. **Guardar configuración**

**¡Listo!** El sistema usa automáticamente esa pasarela.

---

## 📝 ESTADOS DE TRANSACCIÓN

- `pending` - Orden creada, esperando pago
- `processing` - Pagando en pasarela
- `completed` - Pago exitoso
- `failed` - Pago fallido
- `refunded` - Reembolsado
- `expired` - Orden expirada

---

## 🔐 SEGURIDAD

- **API keys encriptadas** en base de datos
- **Tokens únicos** por transacción
- **Firmas digitales** para webhooks
- **HTTPS obligatorio** en producción
- **PCI DSS** compliant (para tarjetas)

---

## 🚀 INSTALACIÓN

1. **Elegir pasarela** (ej: ePayco)
2. **Crear cuenta** en la pasarela
3. **Obtener credenciales** (API key, Secret key)
4. **Configurar en sistema** (panel admin)
5. **¡Listo para recibir pagos!**

---

## 📖 GUÍAS POR PASARELA

Cada carpeta de proveedor tiene:
- `DOCUMENTACION.md` - Guía específica de esa pasarela
- `Client.js` - Implementación de la API
- `Adapter.js` - Adaptador al sistema genérico

---

**SISTEMA 100% MODULAR - CAMBIA DE PASARELA EN 5 MINUTOS**
