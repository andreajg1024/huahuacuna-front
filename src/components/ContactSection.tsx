import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

export function ContactSection() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      alert('¡Gracias por contactarnos! Responderemos pronto.');
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        asunto: '',
        mensaje: '',
      });
      setIsSubmitting(false);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Dirección',
      content: 'Calle 21 #14-28, Armenia, Quindío, Colombia',
      color: 'from-blue-400 to-blue-500',
    },
    {
      icon: Phone,
      title: 'Teléfonos',
      content: '+57 (6) 746 1234\n+57 321 456 7890',
      color: 'from-emerald-400 to-emerald-500',
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'info@huahuacuna.org\npadrinos@huahuacuna.org',
      color: 'from-amber-400 to-amber-500',
    },
    {
      icon: Clock,
      title: 'Horario de Atención',
      content: 'Lunes a Viernes: 8:00 AM - 5:00 PM\nSábados: 9:00 AM - 1:00 PM',
      color: 'from-purple-400 to-purple-500',
    },
  ];

  const faqs = [
    {
      question: '¿Cómo puedo apadrinar a un niño?',
      answer: 'Puedes iniciar el proceso de apadrinamiento contactándonos por teléfono, email o visitando nuestra sede. Te explicaremos el proceso, los requisitos y te presentaremos a los niños disponibles para apadrinamiento.',
    },
    {
      question: '¿Cuál es el aporte mensual para apadrinar?',
      answer: 'El aporte sugerido es de $150.000 COP mensuales, que cubre educación, salud, alimentación y actividades recreativas. Sin embargo, puedes realizar aportes de otros montos según tu capacidad.',
    },
    {
      question: '¿Puedo conocer al niño que apadrino?',
      answer: 'Sí, organizamos encuentros periódicos entre padrinos y ahijados. También puedes coordinar visitas con previo aviso para compartir momentos especiales.',
    },
    {
      question: '¿Cómo sé que mi donación llega al niño?',
      answer: 'Enviamos informes trimestrales con actualizaciones sobre el desarrollo del niño, fotografías y detalles del uso de los recursos. Además, manejamos total transparencia financiera.',
    },
    {
      question: '¿Aceptan voluntarios?',
      answer: 'Sí, valoramos mucho el trabajo voluntario. Puedes apoyar en clases de refuerzo, talleres, eventos especiales y actividades administrativas. Contáctanos para conocer las oportunidades disponibles.',
    },
    {
      question: '¿Cómo puedo hacer donaciones de ropa o útiles?',
      answer: 'Recibimos donaciones en nuestra sede de lunes a viernes. También organizamos jornadas especiales de recolección que anunciamos en nuestras redes sociales.',
    },
    {
      question: '¿La fundación tiene certificado de donación para deducciones tributarias?',
      answer: 'Sí, estamos debidamente registrados y emitimos certificados de donación que pueden ser usados para deducciones tributarias según la ley colombiana.',
    },
    {
      question: '¿Hasta qué edad acompañan a los niños?',
      answer: 'Acompañamos a los niños desde los 5 años hasta que terminan su educación secundaria (aproximadamente 18 años). En casos especiales, apoyamos estudios técnicos o universitarios.',
    },
  ];

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-100 rounded-full px-4 py-2 mb-4">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-800 text-sm">Contáctanos</span>
          </div>
          <h1 className="text-gray-900 mb-4">Estamos Aquí para Ti</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            ¿Tienes preguntas o quieres ser parte de nuestra misión? Nos encantaría escucharte
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* Contact Form */}
          <div>
            <Card>
              <CardContent className="p-8">
                <h2 className="text-gray-900 mb-6">Envíanos un Mensaje</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="nombre">Nombre Completo *</Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      placeholder="Tu nombre"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Correo Electrónico *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="tu@email.com"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      name="telefono"
                      type="tel"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="+57 321 456 7890"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="asunto">Asunto *</Label>
                    <Input
                      id="asunto"
                      name="asunto"
                      value={formData.asunto}
                      onChange={handleChange}
                      required
                      placeholder="¿En qué podemos ayudarte?"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="mensaje">Mensaje *</Label>
                    <Textarea
                      id="mensaje"
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleChange}
                      required
                      placeholder="Cuéntanos más sobre tu consulta o interés..."
                      rows={6}
                      className="mt-2"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white"
                  >
                    {isSubmitting ? (
                      'Enviando...'
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Mensaje
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h2 className="text-gray-900 mb-6">Información de Contacto</h2>
            
            {contactInfo.map((info, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${info.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <info.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 mb-2">{info.title}</h3>
                      <p className="text-gray-600 whitespace-pre-line">{info.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Social Media */}
            <Card className="bg-gradient-to-br from-amber-50 to-emerald-50">
              <CardContent className="p-6">
                <h3 className="text-gray-900 mb-4">Síguenos en Redes Sociales</h3>
                <div className="flex gap-3">
                  <a 
                    href="https://www.facebook.com/FundacionHuahuacuna" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:shadow-md transition-shadow"
                    aria-label="Facebook"
                  >
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a 
                    href="https://www.instagram.com/huahuacuna?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:shadow-md transition-shadow"
                    aria-label="Instagram"
                  >
                    <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  {/* Icono de Twitter removido según requerimiento */}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        <div className="mb-20">
          <h2 className="text-gray-900 mb-6 text-center">Encuéntranos</h2>
          <Card>
            <CardContent className="p-0">
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3977.3600067132165!2d-75.67896858939763!3d4.529015143102909!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e38f5465b0fc04d%3A0xbbc50feac054ed76!2sFundación%20Huahuacuna!5e0!3m2!1ses!2sco!4v1764572074286!5m2!1ses!2sco"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Ubicación Fundación Huahuacuna"
                ></iframe>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-gray-900 mb-4 text-center">Preguntas Frecuentes</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Encuentra respuestas a las preguntas más comunes sobre nuestros programas
          </p>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-gray-200 rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline">
                    <span className="text-gray-900">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}

