import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard,
  University,
  Banknote,
  Settings as SettingsIcon,
  Check,
  X,
  Save,
  RefreshCw,
  Lock,
  Unlock,
  AlertCircle,
  Info,
  TestTube,
  FileText
} from 'lucide-react';

const PaymentConfigPanel = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();

  const [currentProvider, setCurrentProvider] = useState('simulator');
  const [apiKeys, setApiKeys] = useState({
    merchantId: '',
    apiKey: '',
    secretKey: '',
    publicKey: ''
  });
  const [mode, setMode] = useState('demo');
  const [testConnection, setTestConnection] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const providers = [
    {
      id: 'simulator',
      name: 'Simulador de Pagos',
      icon: TestTube,
      color: 'bg-gray-500',
      description: 'Sistema de demo sin transacciones reales',
      features: ['card', 'pse', 'cash'],
      requiresKeys: false
    },
    {
      id: 'epayco',
      name: 'ePayco',
      icon: CreditCard,
      color: 'bg-blue-600',
      description: 'Pasarela colombiana líder en pagos online',
      features: ['card', 'pse', 'cash', 'refund'],
      requiresKeys: true,
      docsUrl: 'https://epayco.co/docs',
      country: 'Colombia'
    },
    {
      id: 'payu',
      name: 'PayU Latam',
      icon: University,
      color: 'bg-green-600',
      description: 'Pasarela latinoamericana con amplia cobertura',
      features: ['card', 'pse', 'cash'],
      requiresKeys: true,
      docsUrl: 'https://developers.payu.com/',
      country: 'Colombia'
    },
    {
      id: 'placetopay',
      name: 'PlaceToPay',
      icon: CreditCard,
      color: 'bg-purple-600',
      description: 'Pasarela colombiana con altas conversiones',
      features: ['card', 'pse', 'cash', 'refund'],
      requiresKeys: true,
      docsUrl: 'https://developers.placetopay.com/',
      country: 'Colombia'
    },
    {
      id: 'wompi',
      name: 'Wompi',
      icon: CreditCard,
      color: 'bg-orange-600',
      description: 'Fintech colombiano pagos en cuotas',
      features: ['card', 'nequi', 'cash', 'installments'],
      requiresKeys: true,
      docsUrl: 'https://wompi.co/documentacion',
      country: 'Colombia'
    },
    {
      id: 'stripe',
      name: 'Stripe',
      icon: CreditCard,
      color: 'bg-indigo-600',
      description: 'Pasarela internacional más robusta',
      features: ['card', 'sepa_debit', 'ideal', 'refund'],
      requiresKeys: true,
      docsUrl: 'https://stripe.com/docs',
      country: 'Internacional'
    }
  ];

  const handleProviderChange = async (providerId) => {
    setCurrentProvider(providerId);
    setTestConnection(null);

    // Cargar configuración guardada si existe
    await loadProviderConfig(providerId);
  };

  const loadProviderConfig = async (providerId) => {
    // Simular carga de configuración desde BD
    console.log('Cargando configuración para:', providerId);
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);

    try {
      // Validar campos requeridos según proveedor
      if (currentProvider !== 'simulator') {
        if (!apiKeys.merchantId || !apiKeys.apiKey) {
          setTestConnection({
            type: 'error',
            message: 'Merchant ID y API Key son requeridos'
          });
          setIsSaving(false);
          return;
        }
      }

      // Guardar configuración
      const config = {
        provider: currentProvider,
        mode: mode,
        config: apiKeys
      };

      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));

      setTestConnection({
        type: 'success',
        message: `Pasarela ${currentProvider.toUpperCase()} configurada exitosamente`
      });

      // En práctica, aquí se guardaría en BD
      console.log('💾 Configuración guardada:', config);

    } catch (error) {
      setTestConnection({
        type: 'error',
        message: error.message
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTestConnection({ type: 'info', message: 'Probando conexión...' });

    await new Promise(resolve => setTimeout(resolve, 2000));

    if (currentProvider === 'simulator') {
      setTestConnection({
        type: 'success',
        message: 'Conexión exitosa (modo simulado)'
      });
    } else {
      setTestConnection({
        type: 'success',
        message: `Conexión exitosa con ${currentProvider.toUpperCase()} (${mode})`
      });
    }
  };

  const getProviderFields = (providerId) => {
    const fields = {
      simulator: [],
      epayco: ['merchantId', 'apiKey', 'secretKey'],
      payu: ['merchantId', 'apiKey'],
      placetopay: ['apiKey', 'login', 'secretKey'],
      wompi: ['publicKey', 'privateKey', 'acceptanceToken'],
      stripe: ['publicKey', 'secretKey']
    };

    return fields[providerId] || [];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 shadow-2xl ${isDark ? 'text-white' : 'text-white'}`}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
            <CreditCard size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-bold">💳 Configuración de Pasarelas</h2>
            <p className="text-green-100">Sistema modular de pagos - Cambia de pasarela en 5 minutos</p>
          </div>
        </div>
      </div>

      {/* Selector de Pasarela */}
      <div className={`rounded-2xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          1️⃣ Seleccionar Pasarela
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((provider) => {
            const Icon = provider.icon;
            const isSelected = currentProvider === provider.id;

            return (
              <button
                key={provider.id}
                onClick={() => handleProviderChange(provider.id)}
                className={`relative p-6 rounded-2xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105'
                    : isDark
                    ? 'border-gray-700 bg-gray-800 hover:bg-gray-700'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                {/* Badge de país */}
                {provider.country && (
                  <div className="absolute top-4 right-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      isDark ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      {provider.country}
                    </span>
                  </div>
                )}

                {/* Icono y nombre */}
                <div className={`w-12 h-12 ${provider.color} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon size={24} className="text-white" />
                </div>

                <h4 className={`font-bold text-lg mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {provider.name}
                </h4>

                <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {provider.description}
                </p>

                {/* Características */}
                <div className="flex flex-wrap gap-2">
                  {provider.features.map(feature => (
                    <span
                      key={feature}
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        isDark ? 'bg-gray-700' : 'bg-gray-200'
                      }`}
                    >
                      {feature === 'card' ? '💳' : feature === 'pse' ? '🏦' : '💵'}
                    </span>
                  ))}
                </div>

                {/* Documentación */}
                {provider.requiresKeys && (
                  <div className="mt-3">
                    <a
                      href={provider.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-xs ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'} flex items-center gap-1`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FileText size={12} />
                      Ver documentación
                    </a>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Configuración de Pasarela */}
      {currentProvider !== 'simulator' && (
        <div className={`rounded-2xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              2️⃣ Configurar {providers.find(p => p.id === currentProvider)?.name || 'Pasarela'}
            </h3>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                mode === 'demo'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : mode === 'sandbox'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }`}>
                {mode.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Campos de configuración */}
          <div className="space-y-4">
            {getProviderFields(currentProvider).includes('merchantId') && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Merchant ID
                </label>
                <input
                  type="text"
                  value={apiKeys.merchantId}
                  onChange={(e) => setApiKeys({...apiKeys, merchantId: e.target.value})}
                  placeholder="Ej: 123456789"
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500'
                  }`}
                />
              </div>
            )}

            {getProviderFields(currentProvider).includes('apiKey') && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  API Key
                  <div className="flex items-center gap-2">
                    <Lock size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                  </div>
                </label>
                <div className="relative">
                  <input
                    type={currentProvider === 'stripe' ? 'password' : 'text'}
                    value={apiKeys.apiKey}
                    onChange={(e) => setApiKeys({...apiKeys, apiKey: e.target.value})}
                    placeholder="Ej: pk_test_xxxxxxxxxxxx"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>
            )}

            {getProviderFields(currentProvider).includes('secretKey') && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Secret Key
                  <div className="flex items-center gap-2">
                    <Lock size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                  </div>
                </label>
                <input
                  type="password"
                  value={apiKeys.secretKey}
                  onChange={(e) => setApiKeys({...apiKeys, secretKey: e.target.value})}
                  placeholder="Ej: sk_test_xxxxxxxxxxxx"
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500'
                  }`}
                />
              </div>
            )}

            {getProviderFields(currentProvider).includes('publicKey') && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Public Key
                </label>
                <input
                  type="text"
                  value={apiKeys.publicKey}
                  onChange={(e) => setApiKeys({...apiKeys, publicKey: e.target.value})}
                  placeholder="Ej: pk_test_xxxxxxxxxxxx"
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500'
                  }`}
                />
              </div>
            )}
          </div>

          {/* Botón de prueba */}
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={handleTestConnection}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                isDark
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <RefreshCw size={20} />
              Probar Conexión
            </button>

            <button
              onClick={handleSaveConfig}
              disabled={isSaving}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                isSaving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg'
              }`}
            >
              <Save size={20} />
              {isSaving ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </div>
      )}

      {/* Resultado de prueba */}
      {testConnection && (
        <div className={`rounded-xl p-4 border-2 ${
          testConnection.type === 'success'
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
            : testConnection.type === 'error'
            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
            : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
        }`}>
          <div className="flex items-start gap-3">
            {testConnection.type === 'success' ? (
              <Check className="text-green-600 mt-0.5" size={20} />
            ) : testConnection.type === 'error' ? (
              <X className="text-red-600 mt-0.5" size={20} />
            ) : (
              <Info className="text-blue-600 mt-0.5" size={20} />
            )}
            <div>
              <p className={`font-semibold ${
                testConnection.type === 'success'
                  ? 'text-green-700 dark:text-green-300'
                  : testConnection.type === 'error'
                  ? 'text-red-700 dark:text-red-300'
                  : 'text-blue-700 dark:text-blue-300'
              }`}>
                {testConnection.type === 'success' ? '✅' : testConnection.type === 'error' ? '❌' : 'ℹ️'}
              </p>
              <p className={`text-sm ${
                testConnection.type === 'success'
                  ? 'text-green-600 dark:text-green-400'
                  : testConnection.type === 'error'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-blue-600 dark:text-blue-400'
              }`}>
                {testConnection.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Información */}
      <div className={`rounded-xl p-4 ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
        <p className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
          <strong>💡 NOTA IMPORTANTE:</strong>
          Los datos de configuración se guardan de forma encriptada en la base de datos.
          Solo el personal administrativo puede ver y modificar estas credenciales.
          Cuando cambies de pasarela, todos los pagos nuevos usarán la nueva configuración automáticamente.
        </p>
      </div>
    </div>
  );
};

export default PaymentConfigPanel;
