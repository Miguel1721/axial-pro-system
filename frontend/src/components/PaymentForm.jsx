import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  University,
  Banknote,
  ArrowLeft,
  Check,
  X,
  Clock,
  Shield,
  AlertCircle
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const PaymentForm = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [paymentData, setPaymentData] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState(null); // 'success', 'failed', 'pending'
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: ''
  });

  useEffect(() => {
    // Obtener datos del pago de la URL o state
    const data = location.state?.paymentData;
    if (data) {
      setPaymentData(data);
    }
  }, [location]);

  const paymentMethods = [
    {
      id: 'card',
      name: 'Tarjeta de Crédito/Débito',
      icon: CreditCard,
      color: 'from-blue-500 to-blue-600',
      description: 'Visa, Mastercard, Amex'
    },
    {
      id: 'pse',
      name: 'PSE',
      icon: University,
      color: 'from-green-500 to-green-600',
      description: 'Pago en línea desde tu banco'
    },
    {
      id: 'cash',
      name: 'Efectivo',
      icon: Banknote,
      color: 'from-yellow-500 to-orange-500',
      description: 'Efecty, Baloto, Pagos Ya'
    }
  ];

  const handlePayment = async () => {
    if (!paymentData) return;

    setProcessing(true);

    try {
      // Crear orden de pago
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...paymentData,
          paymentMethod: selectedMethod
        })
      });

      const result = await response.json();

      if (result.success) {
        // Redirigir a pasarela de pago
        if (result.data.paymentUrl) {
          window.location.href = result.data.paymentUrl;
        } else {
          // Modo simulador - mostrar éxito
          setStatus('success');
        }
      } else {
        setStatus('failed');
      }
    } catch (error) {
      console.error('Error procesando pago:', error);
      setStatus('failed');
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value) => {
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value) => {
    if (value.length === 2 && !value.includes('/')) {
      return value + '/';
    }
    return value;
  };

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="mx-auto mb-4 text-yellow-500" size={48} />
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
            Datos de Pago No Disponibles
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            No se encontraron datos de pago. Por favor, inicia el proceso desde una cita.
          </p>
          <button
            onClick={() => navigate('/citas')}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all"
          >
            Volver a Citas
          </button>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="text-green-600 dark:text-green-400" size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
            ¡Pago Exitoso!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Tu pago ha sido procesado correctamente.
          </p>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Monto pagado: <span className="font-bold text-gray-900 dark:text-gray-100">
                ${paymentData.amount.toLocaleString()} COP
              </span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Referencia: <span className="font-mono text-gray-900 dark:text-gray-100">
                {paymentData.id || 'N/A'}
              </span>
            </p>
          </div>
          <button
            onClick={() => navigate('/citas')}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium transition-all"
          >
            Volver a Citas
          </button>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="text-red-600 dark:text-red-400" size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
            Pago Fallido
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Hubo un error procesando tu pago. Por favor, intenta nuevamente.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setStatus(null)}
              className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all"
            >
              Intentar Nuevamente
            </button>
            <button
              onClick={() => navigate('/citas')}
              className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Volver</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resumen del Pago */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sticky top-6">
              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">
                Resumen del Pago
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Concepto</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {paymentData.concepto || 'Consulta Médica'}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Doctor</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {paymentData.doctorName || 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Fecha</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {paymentData.date || new Date().toLocaleDateString()}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3">
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Total
                  </span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                    ${paymentData.amount?.toLocaleString() || '0'} COP
                  </span>
                </div>
              </div>

              {/* Badges */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Shield size={16} />
                  <span>Pago 100% seguro</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock size={16} />
                  <span>Pago en 30 minutos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de Pago */}
          <div className="lg:col-span-2 space-y-6">
            {/* Métodos de Pago */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">
                Método de Pago
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedMethod === method.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${method.color} text-white flex items-center justify-center mb-3`}>
                        <Icon size={24} />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {method.name}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {method.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Datos de Tarjeta */}
            {selectedMethod === 'card' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">
                  Datos de la Tarjeta
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Número de Tarjeta
                    </label>
                    <input
                      type="text"
                      value={cardData.number}
                      onChange={(e) => setCardData({ ...cardData, number: formatCardNumber(e.target.value) })}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre en la Tarjeta
                    </label>
                    <input
                      type="text"
                      value={cardData.name}
                      onChange={(e) => setCardData({ ...cardData, name: e.target.value.toUpperCase() })}
                      placeholder="JUAN PÉREZ"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Vencimiento
                      </label>
                      <input
                        type="text"
                        value={cardData.expiry}
                        onChange={(e) => setCardData({ ...cardData, expiry: formatExpiry(e.target.value) })}
                        placeholder="MM/YY"
                        maxLength="5"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        CVC
                      </label>
                      <input
                        type="text"
                        value={cardData.cvc}
                        onChange={(e) => setCardData({ ...cardData, cvc: e.target.value.replace(/\D/g, '') })}
                        placeholder="123"
                        maxLength="4"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Información PSE */}
            {selectedMethod === 'pse' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">
                  Pago con PSE
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Serás redirigido a la plataforma de PSE para seleccionar tu banco y completar el pago de forma segura.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 El pago puede tardar hasta 30 minutos en ser confirmado por tu banco.
                  </p>
                </div>
              </div>
            )}

            {/* Información Efectivo */}
            {selectedMethod === 'cash' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">
                  Pago en Efectivo
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Generaremos un código de pago que podrás utilizar en cualquier punto autorizado:
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-green-500" />
                    Efecty
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-green-500" />
                    Baloto
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-green-500" />
                    Pagos Ya
                  </li>
                </ul>
              </div>
            )}

            {/* Botón de Pago */}
            <button
              onClick={handlePayment}
              disabled={processing || (selectedMethod === 'card' && cardData.number.length < 19)}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
            >
              {processing ? (
                <>
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <Shield size={24} />
                  <span>Pagar ${paymentData.amount?.toLocaleString() || '0'} COP</span>
                </>
              )}
            </button>

            {/* Información de Seguridad */}
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              <p>🔒 Tus datos están protegidos con encriptación de grado militar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;