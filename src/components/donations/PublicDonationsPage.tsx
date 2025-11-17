import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { 
  Heart, Shield, TrendingUp, Users, DollarSign, Award,
  Download, ChevronRight, Phone, Mail, MapPin, Package
} from 'lucide-react';
import { MonetaryDonationForm } from './MonetaryDonationForm';
import { InKindDonationForm } from './InKindDonationForm';
import { useDonations } from '../../contexts/DonationsContext';

export const PublicDonationsPage: React.FC = () => {
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [showInKindForm, setShowInKindForm] = useState(false);
  const { getTotalDonated, getDonationCount } = useDonations();

  const currentYear = new Date().getFullYear();
  const totalRaised = getTotalDonated(currentYear);
  const donationCount = getDonationCount('aprobada');

  const impactExamples = [
    { icon: '🍎', amount: '$50,000', impact: 'Alimenta a un niño por 1 mes' },
    { icon: '📚', amount: '$100,000', impact: 'Útiles escolares completos para 1 niño' },
    { icon: '🎒', amount: '$200,000', impact: 'Uniforme y calzado para 1 niño' },
    { icon: '🏥', amount: '$300,000', impact: 'Control médico anual para 1 niño' },
    { icon: '🎓', amount: '$500,000', impact: 'Educación completa por 1 mes' },
    { icon: '❤️', amount: '$1,000,000', impact: 'Apadrinamiento completo por 1 mes' }
  ];

  const destinations = [
    { name: 'General', description: 'Donde más se necesite', color: 'bg-gray-100' },
    { name: 'Apadrinamiento', description: 'Apoyo integral a niños', color: 'bg-[#4A9D5F]/10' },
    { name: 'Educación', description: 'Útiles, uniformes y matrícula', color: 'bg-blue-100' },
    { name: 'Salud', description: 'Atención médica y nutricional', color: 'bg-red-100' },
    { name: 'Alimentación', description: 'Programa nutricional', color: 'bg-orange-100' },
    { name: 'Infraestructura', description: 'Mejoras en instalaciones', color: 'bg-purple-100' }
  ];

  const testimonials = [
    {
      name: 'María G.',
      type: 'Donante Recurrente',
      quote: 'Donar a Huahuacuna me llena de alegría. Ver el impacto directo en los niños es increíble. Es la mejor inversión que he hecho.',
      amount: '$500,000+',
      since: '2023'
    },
    {
      name: 'Juan P.',
      type: 'Donante Frecuente',
      quote: 'La transparencia de la fundación me da confianza. Sé exactamente a dónde va mi aporte y cómo ayuda a los niños.',
      amount: '$300,000+',
      since: '2024'
    },
    {
      name: 'Ana L.',
      type: 'Primera Donante',
      quote: 'Hice mi primera donación este año y quedé encantada con el proceso. Fácil, seguro y con certificado inmediato.',
      amount: '$100,000',
      since: '2025'
    }
  ];

  const faqs = [
    {
      question: '¿Mi donación es deducible de impuestos?',
      answer: 'Sí, todas las donaciones son deducibles de impuestos según el artículo 125 del Estatuto Tributario. Para donaciones superiores a $50,000 COP, generamos automáticamente un certificado tributario válido para tu declaración de renta.'
    },
    {
      question: '¿Cómo recibo mi certificado?',
      answer: 'El certificado tributario se genera automáticamente al completar tu donación (si es mayor a $50,000). Lo recibirás por email junto con tu recibo digital y también podrás descargarlo desde tu panel de donante.'
    },
    {
      question: '¿Puedo elegir a qué proyecto va mi donación?',
      answer: 'Sí, durante el proceso de donación puedes seleccionar el destino específico: General, Apadrinamiento, Educación, Salud, Alimentación o Infraestructura. Si prefieres, puedes dejarlo en "General" y nosotros lo asignaremos donde más se necesite.'
    },
    {
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Actualmente aceptamos PSE (Pagos Seguros en Línea), transferencia bancaria y donaciones en efectivo. Próximamente incorporaremos tarjetas de crédito/débito.'
    },
    {
      question: '¿Cómo sé que mi donación llegó?',
      answer: 'Recibirás confirmación inmediata por email con tu recibo digital. Además, puedes ver todas tus donaciones en tu panel de donante si creas una cuenta.'
    },
    {
      question: '¿Puedo hacer donaciones recurrentes?',
      answer: 'Estamos trabajando en habilitar donaciones mensuales automáticas. Por ahora, puedes hacer donaciones puntuales cuando lo desees.'
    }
  ];

  const scrollToDonation = () => {
    setShowDonationForm(true);
    setTimeout(() => {
      document.getElementById('donation-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  if (showInKindForm) {
    return <InKindDonationForm onBack={() => setShowInKindForm(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section (RF-033) */}
      <section 
        className="relative bg-gradient-to-br from-[#4A9D5F] to-[#3B7D4D] text-white py-24 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(74, 157, 95, 0.9), rgba(59, 125, 77, 0.9)), url('https://images.unsplash.com/photo-1612446485216-2dc52fc0bb05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMGhlbHBpbmclMjBkb25hdGlvbiUyMGNoYXJpdHl8ZW58MXx8fHwxNzYxNjMwNDEzfDA&ixlib=rb-4.1.0&q=80&w=1080')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl mb-6 text-white">
            Tu Donación Transforma Vidas
          </h1>
          <p className="text-2xl mb-8 text-white/95 max-w-3xl mx-auto">
            Cada aporte ayuda a construir el futuro de un niño
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-white text-[#4A9D5F] hover:bg-white/90 text-xl py-6 px-8"
              onClick={scrollToDonation}
            >
              <Heart className="w-6 h-6 mr-2" />
              Donar Ahora
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 text-white/90">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>Donación 100% segura</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              <span>Certificado tributario incluido</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span>Transparencia garantizada</span>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats Section (RF-033) */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl text-center mb-12">El Impacto de tu Donación</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card>
              <CardContent className="p-6 text-center">
                <DollarSign className="w-12 h-12 text-[#4A9D5F] mx-auto mb-4" />
                <p className="text-4xl mb-2">${(totalRaised / 1000000).toFixed(1)}M</p>
                <p className="text-gray-600">Recaudado en {currentYear}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-[#4A9D5F] mx-auto mb-4" />
                <p className="text-4xl mb-2">542</p>
                <p className="text-gray-600">Niños beneficiados</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Award className="w-12 h-12 text-[#4A9D5F] mx-auto mb-4" />
                <p className="text-4xl mb-2">21</p>
                <p className="text-gray-600">Años de experiencia</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-12 h-12 text-[#4A9D5F] mx-auto mb-4" />
                <p className="text-4xl mb-2">95%</p>
                <p className="text-gray-600">Va directo a programas</p>
              </CardContent>
            </Card>
          </div>

          {/* Fund Allocation Chart */}
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6">
              <h3 className="text-xl mb-4 text-center">Distribución de Fondos</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Programas</span>
                    <span className="font-medium">95%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-[#4A9D5F] h-3 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Administración</span>
                    <span className="font-medium">3%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-blue-500 h-3 rounded-full" style={{ width: '3%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Recaudación</span>
                    <span className="font-medium">2%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-purple-500 h-3 rounded-full" style={{ width: '2%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why Donate Section (RF-033) */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl text-center mb-6">Tu Aporte Hace la Diferencia</h2>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-12">
            En Fundación Huahuacuna, cada peso donado se convierte en oportunidades reales para niños
            en situación de vulnerabilidad. Tu generosidad permite que estos niños accedan a educación,
            alimentación, salud y un futuro digno.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {impactExamples.map((example, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="text-5xl mb-4">{example.icon}</div>
                  <p className="text-2xl text-[#4A9D5F] mb-2">{example.amount}</p>
                  <p className="text-gray-700">{example.impact}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Donation Methods Section (RF-033) */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl text-center mb-12">Cómo Puedes Donar</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Monetary Donation Card */}
            <Card className="border-2 border-[#4A9D5F]">
              <CardContent className="p-8">
                <div className="text-5xl mb-4 text-center">💳</div>
                <h3 className="text-2xl mb-4 text-center">Donación en Línea</h3>
                <p className="text-gray-600 mb-6 text-center">
                  Dona de forma segura mediante PSE
                </p>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-[#4A9D5F]">✓</span>
                    <span>Pago inmediato y seguro</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4A9D5F]">✓</span>
                    <span>Certificado tributario automático</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4A9D5F]">✓</span>
                    <span>Monto libre desde $10,000</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4A9D5F]">✓</span>
                    <span>Recibo digital instantáneo</span>
                  </li>
                </ul>

                <Button 
                  className="w-full bg-[#4A9D5F] hover:bg-[#3B7D4D]" 
                  size="lg"
                  onClick={scrollToDonation}
                >
                  Donar Ahora
                </Button>
              </CardContent>
            </Card>

            {/* In-Kind Donation Card (RF-037) */}
            <Card>
              <CardContent className="p-8">
                <div className="text-5xl mb-4 text-center">📦</div>
                <h3 className="text-2xl mb-4 text-center">Donación Física</h3>
                <p className="text-gray-600 mb-6 text-center">
                  Dona artículos, tiempo o servicios
                </p>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-[#4A9D5F]">✓</span>
                    <span>Ropa, útiles, muebles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4A9D5F]">✓</span>
                    <span>Alimentos no perecederos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4A9D5F]">✓</span>
                    <span>Tiempo (voluntariado)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4A9D5F]">✓</span>
                    <span>Servicios profesionales</span>
                  </li>
                </ul>

                <Button 
                  className="w-full" 
                  variant="outline"
                  size="lg"
                  onClick={() => setShowInKindForm(true)}
                >
                  <Package className="w-4 h-4 mr-2" />
                  Donar en Especie
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Donation Destinations Section (RF-033) */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl text-center mb-12">¿A Dónde Va tu Donación?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((dest, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className={`${dest.color} rounded-lg p-4 mb-4`}>
                    <h3 className="text-xl mb-2">{dest.name}</h3>
                    <p className="text-gray-700">{dest.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section (RF-033) */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl text-center mb-12">Lo Que Dicen Nuestros Donantes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#4A9D5F] rounded-full flex items-center justify-center text-white text-xl">
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.type}</p>
                      <p className="text-xs text-gray-500">Donante desde {testimonial.since}</p>
                    </div>
                  </div>
                  <Badge className="mt-4" variant="secondary">
                    Ha donado: {testimonial.amount}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl text-center mb-12">Preguntas Frecuentes</h2>
          
          <Accordion type="single" collapsible className="bg-white rounded-lg">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="px-6">{faq.question}</AccordionTrigger>
                <AccordionContent className="px-6 text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Donation Form Section */}
      {showDonationForm && (
        <section id="donation-form" className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <MonetaryDonationForm onClose={() => setShowDonationForm(false)} />
          </div>
        </section>
      )}

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#4A9D5F] to-[#3B7D4D] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl mb-6">¿Listo para Hacer la Diferencia?</h2>
          <p className="text-2xl mb-8 text-white/90">
            Tu donación transforma vidas hoy
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-[#4A9D5F] hover:bg-white/90 text-xl py-6 px-8"
              onClick={scrollToDonation}
            >
              <Heart className="w-5 h-5 mr-2" />
              Donar Ahora
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 text-xl py-6 px-8"
            >
              <Phone className="w-5 h-5 mr-2" />
              Contactar
            </Button>
          </div>
        </div>
      </section>

      {/* Sticky Donation Button */}
      <Button
        className="fixed bottom-6 right-6 rounded-full w-16 h-16 shadow-2xl bg-[#F59E0B] hover:bg-[#D97706] z-50"
        onClick={scrollToDonation}
      >
        <Heart className="w-6 h-6" fill="white" />
      </Button>
    </div>
  );
};

