/**
 * CONFIGURACIÓN DE PAGOS - SISTEMA MODULAR
 * Permite cambiar entre pasarelas sin modificar código
 */

class PaymentConfig {
  constructor() {
    this.currentProvider = 'simulator'; // Default: simulator
    this.providers = {
      simulator: {
        name: 'Simulador de Pagos',
        enabled: true,
        mode: 'demo',
        config: {}
      },
      epayco: {
        name: 'ePayco',
        enabled: false,
        mode: 'sandbox',
        config: {
          apiUrl: 'https://api.secure.payco.co',
          merchantId: '',
          apiKey: '',
          secretKey: ''
        }
      },
      payu: {
        name: 'PayU Latam',
        enabled: false,
        mode: 'sandbox',
        config: {
          apiUrl: 'https://sandbox.api.payulatam.com',
          apiLogin: '',
          apiKey: '',
          merchantId: ''
        }
      },
      placetopay: {
        name: 'PlaceToPay',
        enabled: false,
        mode: 'sandbox',
        config: {
          apiUrl: 'https://dev.placetopay.com',
          apiKey: '',
          login: '',
          secretKey: ''
        }
      },
      wompi: {
        name: 'Wompi',
        enabled: false,
        mode: 'sandbox',
        config: {
          apiUrl: 'https://sandbox.wompi.co',
          publicKey: '',
          privateKey: '',
          acceptanceToken: ''
        }
      },
      stripe: {
        name: 'Stripe',
        enabled: false,
        mode: 'sandbox',
        config: {
          apiUrl: 'https://api.stripe.com',
          publicKey: '',
          secretKey: ''
        }
      }
    };
  }

  /**
   * Obtener configuración actual
   */
  getCurrentProvider() {
    return this.providers[this.currentProvider];
  }

  /**
   * Lista de pasarelas disponibles
   */
  getAvailableProviders() {
    return Object.keys(this.providers).map(key => ({
      id: key,
      ...this.providers[key]
    }));
  }

  /**
   * Cambiar proveedor de pagos
   */
  async changeProvider(providerId, config) {
    if (!this.providers[providerId]) {
      throw new Error(`Provider ${providerId} no existe`);
    }

    // Validar configuración
    if (config.apiKey || config.merchantId || config.publicKey) {
      // En producción, validar con API
      await this.validateProviderConfig(providerId, config);
    }

    // Actualizar configuración
    this.providers[providerId] = {
      ...this.providers[providerId],
      ...config,
      enabled: true
    };

    // Desactivar otros proveedores
    Object.keys(this.providers).forEach(key => {
      if (key !== providerId) {
        this.providers[key].enabled = false;
      }
    });

    this.currentProvider = providerId;

    // Guardar en base de datos
    await this.saveConfig();

    return {
      success: true,
      provider: providerId,
      config: this.providers[providerId]
    };
  }

  /**
   * Validar configuración con API de proveedor
   */
  async validateProviderConfig(providerId, config) {
    try {
      // Llamada de prueba a API
      const isValid = await this.testProviderConnection(providerId, config);

      if (!isValid) {
        throw new Error('Credenciales inválidas');
      }

      return true;
    } catch (error) {
      throw new Error(`Error validando configuración: ${error.message}`);
    }
  }

  /**
   * Probar conexión con API de proveedor
   */
  async testProviderConnection(providerId, config) {
    // Implementar test de conexión según cada proveedor
    // Por defecto, retorna true (sandbox mode)

    if (config.mode === 'demo' || config.mode === 'sandbox') {
      return true;
    }

    // Aquí irían las llamadas reales a APIs
    return true;
  }

  /**
   * Guardar configuración en base de datos
   */
  async saveConfig() {
    const config = {
      currentProvider: this.currentProvider,
      providers: this.providers,
      updatedAt: new Date()
    };

    // Guardar en BD encriptado
    console.log('💾 Guardando configuración de pagos:', {
      provider: this.currentProvider,
      enabled: Object.keys(this.providers).filter(k => this.providers[k].enabled)
    });

    // await db.paymentConfig.update(config);
    return config;
  }

  /**
   * Cargar configuración desde base de datos
   */
  async loadConfig() {
    // Cargar desde BD
    // const config = await db.paymentConfig.get();
    // this.providers = config.providers;
    // this.currentProvider = config.currentProvider;

    return this.getCurrentProvider();
  }

  /**
   * Obtener configuración para frontend
   */
  getFrontendConfig() {
    const provider = this.getCurrentProvider();

    return {
      provider: this.currentProvider,
      name: provider.name,
      mode: provider.mode,
      features: this.getProviderFeatures(this.currentProvider),
      paymentMethods: this.getPaymentMethods(this.currentProvider)
    };
  }

  /**
   * Características por proveedor
   */
  getProviderFeatures(providerId) {
    const features = {
      simulator: ['card', 'pse', 'cash', 'refund'],
      epayco: ['card', 'pse', 'cash', 'refund', 'subscription'],
      payu: ['card', 'pse', 'cash', 'refund'],
      placetopay: ['card', 'pse', 'cash', 'refund'],
      wompi: ['card', 'nequi', 'cash', 'installments'],
      stripe: ['card', 'sepa_debit', 'ideal', 'refund', 'subscription']
    };

    return features[providerId] || [];
  }

  /**
   * Métodos de pago disponibles
   */
  getPaymentMethods(providerId) {
    const methods = {
      simulator: [
        { id: 'card', name: 'Tarjeta de crédito', icon: 'credit-card', fees: 0 },
        { id: 'pse', name: 'PSE', icon: 'university', fees: 0 },
        { id: 'cash', name: 'Efectivo', icon: 'banknote', fees: 0 }
      ],
      epayco: [
        { id: 'card', name: 'Tarjeta', icon: 'credit-card', fees: 2.9 + 0.1 },
        { id: 'pse', name: 'PSE', icon: 'university', fees: 0 },
        { id: 'cash', name: 'Efectivo', icon: 'banknote', fees: 0 }
      ]
    };

    return methods[providerId] || methods.simulator;
  }

  /**
   * Obtener tarjetas soportadas
   */
  getSupportedCards(providerId) {
    const cards = {
      simulator: ['visa', 'mastercard', 'amex'],
      epayco: ['visa', 'mastercard', 'amex', 'dinners'],
      payu: ['visa', 'mastercard'],
      placetopay: ['visa', 'mastercard'],
      wompi: ['visa', 'mastercard'],
      stripe: ['visa', 'mastercard', 'amex', 'discover']
    };

    return cards[providerId] || [];
  }
}

module.exports = PaymentConfig;
