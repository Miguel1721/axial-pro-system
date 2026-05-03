import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Users,
  Shield,
  BarChart,
  Video,
  Smartphone,
  Check,
  ArrowRight,
  Play,
  X,
  Menu,
  ChevronDown,
  Clock,
  TrendingUp,
  Award,
  Heart,
  Stethoscope,
  FileText,
  Calendar,
  Sparkles,
  Star,
  Phone,
  Mail,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$0',
      period: 'siempre',
      description: 'Para clínicas en crecimiento',
      features: [
        'Hasta 200 pacientes',
        'Hasta 5 doctores',
        'Citas básicas',
        'Historial digital',
        'Soporte por email'
      ],
      color: 'emerald',
      recommended: false
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '$499.000',
      period: '/mes',
      description: 'Para clínicas establecidas',
      features: [
        'Todo lo de Starter',
        'Pacientes ilimitados',
        'IA Predictiva incluida',
        'Telemedicina HD',
        'Analytics avanzado',
        'Soporte prioritario'
      ],
      color: 'blue',
      recommended: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      period: '/mes',
      description: 'Para grandes redes',
      features: [
        'Todo lo de Professional',
        'Multi-sede ilimitado',
        'White-label completo',
        'API completa',
        'Account Manager',
        'SLA garantizado'
      ],
      color: 'purple',
      recommended: false
    }
  ];

  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: 'Inteligencia Artificial',
      description: 'Sistema predictivo que optimiza agendas, reduce tiempos de espera y anticipa demanda.',
      tags: ['Machine Learning', 'Analytics']
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: 'Gestión Inteligente',
      description: 'Optimización automática de citas, balanceo de carga y reducción de espacios vacíos.',
      tags: ['Eficiencia', 'Automatización']
    },
    {
      icon: <Video className="h-8 w-8" />,
      title: 'Telemedicina',
      description: 'Plataforma de videoconsultas integrada con chat en tiempo real y recetas digitales.',
      tags: ['Video', 'Chat', 'Recetas']
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: 'Historial Médico',
      description: 'Registro completo con timeline visual, análisis de patrones y alertas tempranas.',
      tags: ['Analytics', 'Seguridad']
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Seguridad Enterprise',
      description: 'Cumplimiento HIPAA/GDPR, cifrado end-to-end y backups automáticos.',
      tags: ['Seguridad', 'Cumplimiento']
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: 'App Móvil',
      description: 'PWA instalable que funciona sin conexión, con sincronización automática.',
      tags: ['Mobile', 'Offline']
    }
  ];

  const testimonials = [
    {
      quote: "Implementamos Axial Pro hace 8 meses y redujimos el tiempo administrativo en 40%. La IA de predicción es impresionante.",
      author: "Dra. María González",
      role: "Directora Médica",
      clinic: "Clínica Santa María",
      rating: 5
    },
    {
      quote: "El sistema de triaje por IA ha reducido las consultas innecesarias en 35%. Los pacientes valoran muchísimo la rapidez.",
      author: "Dr. Carlos Ramírez",
      role: "CEO Médico",
      clinic: "Centro Médico del Norte",
      rating: 5
    },
    {
      quote: "La plataforma se pagó sola en 4 meses. El ROI ha sido excepcional y el soporte técnico es excelente.",
      author: "Lic. Ana Patricia Rodríguez",
      role: "Gerente Administrativa",
      clinic: "Salud Total",
      rating: 5
    }
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md border-b border-gray-100' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-emerald-600 rounded-xl">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-semibold text-gray-900">Axial Pro</span>
                <span className="text-sm text-gray-500 ml-2">Clinic</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('features')} className="text-sm text-gray-700 hover:text-emerald-600 transition-colors">
                Características
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-sm text-gray-700 hover:text-emerald-600 transition-colors">
                Cómo Funciona
              </button>
              <button onClick={() => scrollToSection('pricing')} className="text-sm text-gray-700 hover:text-emerald-600 transition-colors">
                Planes
              </button>
              <button onClick={() => scrollToSection('testimonials')} className="text-sm text-gray-700 hover:text-emerald-600 transition-colors">
                Casos de Éxito
              </button>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/demo')}
                className="hidden sm:flex items-center space-x-2 px-5 py-2.5 text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium"
              >
                <Play className="h-4 w-4" />
                <span>Demo</span>
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
              >
                <span>Empezar Gratis</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-emerald-600"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 py-4">
            <div className="px-4 space-y-3">
              <button onClick={() => scrollToSection('features')} className="block w-full text-left px-3 py-2 text-sm text-gray-700">
                Características
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left px-3 py-2 text-sm text-gray-700">
                Cómo Funciona
              </button>
              <button onClick={() => scrollToSection('pricing')} className="block w-full text-left px-3 py-2 text-sm text-gray-700">
                Planes
              </button>
              <button onClick={() => scrollToSection('testimonials')} className="block w-full w-full text-left px-3 py-2 text-sm text-gray-700">
                Casos de Éxito
              </button>
              <div className="pt-3 border-t border-gray-200 space-y-3">
                <button onClick={() => navigate('/demo')} className="w-full text-left px-3 py-2 text-sm text-emerald-700">
                  Ver Demo
                </button>
                <button onClick={() => navigate('/signup')} className="w-full text-left px-3 py-2 text-sm text-gray-900 font-medium">
                  Empezar Gratis
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
                  Transforma tu Clínica con Inteligencia Artificial
                </h1>
                <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                  Plataforma integral que combina gestión médica avanzada, IA predictiva y telemedicina.
                  Optimiza cada aspecto de tu operación.
                </p>
              </div>

              {/* Primary CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/signup')}
                  className="inline-flex items-center justify-center space-x-3 px-8 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-200 text-base font-medium shadow-lg hover:shadow-xl"
                >
                  <span>Comenzar Gratis</span>
                  <ArrowRight className="h-5 w-5" />
                </button>

                <button
                  onClick={() => navigate('/demo')}
                  className="inline-flex items-center justify-center space-x-3 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-200 text-base font-medium"
                >
                  <Play className="h-5 w-5 text-emerald-600" />
                  <span>Ver Demo</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 flex flex flex-wrap gap-6">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-emerald-600" />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-900">HIPAA</span>
                    <span className="text-xs text-gray-500">Compliant</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-900">Disponible</span>
                    <span className="text-xs text-gray-500">24/7</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-900">Premio</span>
                    <span className="text-xs text-gray-500">Innovación</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Dashboard Preview */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Dashboard - Demo</h3>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 bg-white/20 px-2 py-1 rounded">
                        <Users className="h-4 w-4 text-white" />
                        <span className="text-xs text-white">Dr. Pérez</span>
                      </div>
                      <div className="flex items-center space-x-1 bg-white/20 px-2 py-1 rounded">
                        <Clock className="h-4 w-4 text-white" />
                        <span className="text-xs text-white">10:30 AM</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-emerald-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-emerald-700">23</p>
                      <p className="text-xs text-emerald-600">Citas Hoy</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-blue-700">156</p>
                      <p className="text-xs text-blue-600">Pacientes</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-purple-700">87%</p>
                      <p className="text-xs text-purple-600">Eficiencia</p>
                    </div>
                  </div>

                  {/* Insight Card */}
                  <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <Brain className="h-8 w-8 text-blue-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Insight de IA</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Predicción: Alta demanda esperada mañana entre 9-11 AM.
                          <strong className="text-emerald-700">Recomendación:</strong> Agregar médico de turno.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <FileText className="h-4 w-4 text-gray-600" />
                      <span className="text-xs text-gray-700">Nueva Cita</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <Users className="h-4 w-4 text-gray-600" />
                      <span className="text-xs text-gray-700">Ver Pacientes</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '400+', label: 'Clínicas Activas' },
              { value: '2M+', label: 'Pacientes' },
              { value: '95%', label: 'Satisfacción' },
              { value: '30%', label: 'Menos Tiempo Admin' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl font-bold text-emerald-600">{stat.value}</p>
                <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Características Principales
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Funcionalidades avanzadas con IA que transforman la operación clínica
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start space-x-4 mb-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">
                      {feature.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {feature.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="inline-flex items-center px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Cómo Funciona
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comienza en minutos, implementa en días
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Regístrate Gratis',
                description: 'Crea tu cuenta en menos de 2 minutos. No se requiere tarjeta de crédito.',
                icon: <UserPlus className="h-8 w-8" />
              },
              {
                step: '02',
                title: 'Configura tu Clínica',
                description: 'Personaliza horarios, carga doctores y adapta el sistema a tu flujo de trabajo.',
                icon: <Settings className="h-8 w-8" />
              },
              {
                step: '03',
                title: 'Comienza a Usar',
                description: 'Importa pacientes, programa citas y empieza a ver resultados de inmediato.',
                icon: <CheckCircle className="h-8 w-8" />
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 text-white rounded-full text-xl font-bold mb-4">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Planes Adaptados a tu Clínica
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comienza gratis, escala a medida que creces
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl p-6 border-2 transition-all duration-200 ${
                  plan.recommended
                    ? 'border-emerald-600 shadow-xl relative'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-emerald-600 text-white text-xs font-medium rounded-full">
                    Recomendado
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-1">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => plan.id === 'enterprise' ? navigate('/contact') : navigate('/signup')}
                  className={`w-full py-3 rounded-lg font-medium transition-all duration-200 ${
                    plan.recommended
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.id === 'enterprise' ? 'Contactar Ventas' : 'Seleccionar Plan'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Confían en Nosotros
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Clínicas que ya están transformando su operación
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
              >
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                    <span className="text-xl font-bold">{testimonial.author.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{testimonial.author}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <p className="text-xs text-emerald-600 font-medium">{testimonial.clinic}</p>
                  </div>
                </div>

                <p className="text-gray-700 italic leading-relaxed mb-4">"{testimonial.quote}"</p>

                <div className="flex items-center space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400" fill="currentColor" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-emerald-600 to-emerald-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            ¿Listo para modernizar tu clínica?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Únete a las clínicas que están mejorando la atención médica en Colombia
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/demo')}
              className="inline-flex items-center justify-center space-x-3 px-8 py-4 bg-white text-emerald-700 rounded-xl hover:bg-gray-50 transition-all duration-200 text-base font-medium"
            >
              <Play className="h-5 w-5" />
              <span>Ver Demo Interactiva</span>
            </button>

            <button
              onClick={() => navigate('/signup')}
              className="inline-flex items-center justify-center space-x-3 px-8 py-4 border-2 border-white text-white rounded-xl hover:bg-white/10 transition-all duration-200 text-base font-medium"
            >
              <span>Comenzar Gratis</span>
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Trust Info */}
          <div className="mt-12 flex justify-center items-center space-x-8 text-emerald-100">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span className="text-sm">Garantía de 30 días</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span className="text-sm">Soporte 24/7</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span className="text-sm">Respuesta en 2h</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-lg font-semibold text-white">Axial Pro Clinic</span>
                  <p className="text-sm text-gray-500">Sistema Médico Integral</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Producto</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-emerald-400 transition-colors">Características</a></li>
                <li><a href="#pricing" className="hover:text-emerald-400 transition-colors">Planes</a></li>
                <li><a href="#testimonials" className="hover:text-emerald-400 transition-colors">Casos de éxito</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Empresa</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Sobre nosotros</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Carreras</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Soporte</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Centro de ayuda</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Documentación</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Estado del sistema</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              © 2026 Axial Pro Clinic. Todos los derechos reservados.
            </p>

            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-emerald-400 transition-colors">
                <Shield className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-emerald-400 transition-colors">
                <Globe className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
