import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const features = [
    {
      icon: '🎯',
      title: 'Gestión Inteligente de Turnos',
      description: 'Optimiza agendas con IA y reduce tiempos de espera hasta 70%'
    },
    {
      icon: '📊',
      title: 'Analytics en Tiempo Real',
      description: 'Métricas avanzadas para toma de decisiones basada en datos'
    },
    {
      icon: '💊',
      title: 'Telemedicina Integrada',
      description: 'Videoconsultas, chat y recetas digitales en una sola plataforma'
    },
    {
      icon: '🤖',
      title: 'IA Médica Ética',
      description: 'Predicciones y análisis automatizados para mejor atención'
    },
    {
      icon: '📱',
      title: 'PWA y Móvil First',
      description: 'App instalable con experiencia nativa en cualquier dispositivo'
    },
    {
      icon: '🔒',
      title: 'Cumplimiento Total',
      description: '100% compliant con HIPAA, GDPR y normativas colombianas'
    }
  ];

  const pricingPlans = [
    {
      name: 'Gratis',
      price: '$0',
      period: 'siempre',
      popular: false,
      features: [
        'Hasta 100 pacientes',
        'Gestión básica de turnos',
        'Panel simple',
        'Soporte por email'
      ],
      cta: 'Comenzar Gratis',
      ctaVariant: 'primary'
    },
    {
      name: 'Básico',
      price: '$499',
      period: 'mes',
      popular: true,
      features: [
        'Hasta 1000 pacientes',
        'Telemedicina completa',
        '3 módulos de IA',
        'Soporte prioritario',
        'Analytics básico'
      ],
      cta: 'Comenzar Prueba',
      ctaVariant: 'secondary'
    },
    {
      name: 'Profesional',
      price: '$1,299',
      period: 'mes',
      popular: false,
      features: [
        'Hasta 5000 pacientes',
        'Todos los módulos de IA',
        'Branding personalizado',
        'API de acceso',
        'Soporte 24/7',
        'Avanzado analytics'
      ],
      cta: 'Solicitar Demo',
      ctaVariant: 'secondary'
    },
    {
      name: 'Enterprise',
      price 'Personalizado',
      period: '',
      popular: false,
      features: [
        'Pacientes ilimitados',
        'White-label completo',
        'Multi-sucursal',
        'Dedicado support',
        'Integraciones personalizadas',
        'SLA 99.9%'
      ],
      cta: 'Contactar Ventas',
      ctaVariant: 'tertiary'
    }
  ];

  const handleSubscribe = async (e) => {
    e.preventDefault();
    try {
      // Subscribe user logic here
      setIsSubscribed(true);
      setEmail('');
    } catch (error) {
      console.error('Subscription failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
              Transforma tu clínica con
              <span className="text-blue-600 block md:inline"> IA Médica</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Sistema integral de gestión médica con inteligencia artificial predictiva.
              Optimiza operaciones, mejora la atención y escala tu negocio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/signup" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                Empezar Prueba Gratis
              </Link>
              <Link to="/demo" className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
                Ver Demo Interactiva
              </Link>
            </div>
          </div>
        </div>
        {/* Floating elements */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que tu clínica necesita
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Desde la gestión básica hasta la IA avanzada, cubre todas tus necesidades operativas.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 transition-all hover:shadow-lg">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">30%</div>
              <div className="text-xl">Menos tiempo de espera</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-xl">Precisión IA</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-xl">Disponibilidad</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-xl">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Planes para cada tamaño
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Empieza gratis y escala según creces. Sin contratos a largo plazo.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-xl border p-8 ${
                  plan.popular ? 'border-blue-500 shadow-xl scale-105' : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm">
                    Popular
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-gray-600">/{plan.period}</span>}
                  </div>
                  <ul className="mb-8 space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full py-3 rounded-lg font-semibold ${
                    plan.ctaVariant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                    plan.ctaVariant === 'secondary' ? 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50' :
                    'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  } transition`}>
                    {plan.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-xl text-gray-600">
              Clínicas que ya transformaron su práctica
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "La IA ha reducido nuestros tiempos de espera en un 70%. Los pacientes están mucho más satisfechos.",
                author: "Dra. María González",
                title: "Directora Médica, Clínica Santa María",
                avatar: "👩‍⚕️"
              },
              {
                quote: "Optimizamos turnos y tenemos menos citas perdidas. El sistema es intuitivo y el soporte excelente.",
                author: "Dr. Carlos Rodríguez",
                title: "Gerente, Centro Médico del Norte",
                avatar: "👨‍⚕️"
              },
              {
                quote: "Implementamos telemedicina en una semana. La integración fue perfecta y los resultados inmediatos.",
                author: "Dra. Ana Pérez",
                title: "CEO, Consultorios Médicos Unidos",
                avatar: "👩‍⚕️"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-3">{testimonial.avatar}</div>
                  <div>
                    <h4 className="font-semibold">{testimonial.author}</h4>
                    <p className="text-sm text-gray-600">{testimonial.title}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Listo para transformar tu clínica?
          </h2>
          <p className="text-xl mb-8">
            Únete a más de 100 clínicas que ya están usando Axial Pro Clinic.
          </p>
          <form onSubmit={handleSubscribe} className="max-w-md mx-auto mb-8">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900"
                required
              />
              <button
                type="submit"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                {isSubscribed ? '¡Gracias!' : 'Comenzar'}
              </button>
            </div>
          </form>
          <p className="text-blue-100">
            30 días de prueba gratis • Sin tarjeta requerida
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Axial Pro Clinic</h3>
              <p className="text-gray-400">
                El futuro de la gestión médica está aquí.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/features" className="hover:text-white">Características</Link></li>
                <li><Link to="/pricing" className="hover:text-white">Precios</Link></li>
                <li><Link to="/demo" className="hover:text-white">Demo</Link></li>
                <li><Link to="/integrations" className="hover:text-white">Integraciones</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white">Sobre nosotros</Link></li>
                <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link to="/careers" className="hover:text-white">Carreras</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contacto</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/privacy" className="hover:text-white">Privacidad</Link></li>
                <li><Link to="/terms" className="hover:text-white">Términos</Link></li>
                <li><Link to="/compliance" className="hover:text-white">Cumplimiento</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Axial Pro Clinic. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;