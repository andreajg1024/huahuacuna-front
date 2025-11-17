import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { 
  Heart, ArrowRight, CheckCircle2, Users, Clock, Award,
  ChevronLeft, ChevronRight, Star
} from 'lucide-react';
import { useVolunteering } from '../../contexts/VolunteeringContext';
import { VolunteerApplicationForm } from './VolunteerApplicationForm';

export const PublicVolunteeringPage: React.FC = () => {
  const { pageContent } = useVolunteering();
  const [showForm, setShowForm] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => setShowForm(true), 500);
  };

  const activeTestimonials = pageContent.testimonios.filter(t => t.activo);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % activeTestimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + activeTestimonials.length) % activeTestimonials.length);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section 
        className="relative h-[600px] flex items-center justify-center text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${pageContent.hero.imagenFondo}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl mb-6 text-white">
            {pageContent.hero.titulo}
          </h1>
          <p className="text-2xl mb-8 text-white/90">
            {pageContent.hero.subtitulo}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-[#F4B223] hover:bg-[#E5A820] text-gray-900 text-lg px-8 py-6"
              onClick={scrollToForm}
            >
              <Heart className="w-5 h-5 mr-2" />
              Quiero ser Voluntario
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white/10 hover:bg-white/20 text-white border-white text-lg px-8 py-6"
              onClick={() => window.scrollTo({ top: 700, behavior: 'smooth' })}
            >
              Conoce Más
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {pageContent.hero.stats.map((stat, index) => (
              <div key={index} className="bg-white/20 backdrop-blur-md rounded-lg p-4">
                <div className="text-3xl mb-1">{stat.value}</div>
                <div className="text-sm text-white/90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating CTA - Sticky */}
        <button
          onClick={scrollToForm}
          className="fixed bottom-6 right-6 z-50 bg-[#F4B223] hover:bg-[#E5A820] text-gray-900 px-6 py-3 rounded-full shadow-lg flex items-center gap-2 transition-all hover:scale-105"
        >
          <Heart className="w-5 h-5" />
          <span className="hidden sm:inline">Ser Voluntario</span>
        </button>
      </section>

      {/* Section 1 - ¿Qué es el Voluntariado? */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: pageContent.queEs.contenido }}
              />
              
              {pageContent.queEs.testimonial && (
                <div className="mt-8 p-6 bg-[#4A9D5F]/10 border-l-4 border-[#4A9D5F] rounded">
                  <div className="flex items-start gap-4">
                    <img 
                      src={pageContent.queEs.testimonial.foto} 
                      alt={pageContent.queEs.testimonial.nombre}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <p className="italic text-gray-700 mb-2">
                        "{pageContent.queEs.testimonial.cita}"
                      </p>
                      <p className="text-sm">
                        <strong>{pageContent.queEs.testimonial.nombre}</strong>
                        <span className="text-gray-600"> - {pageContent.queEs.testimonial.rol}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <img 
                src={pageContent.queEs.imagen} 
                alt="Voluntarios en acción"
                className="rounded-lg shadow-xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 - ¿Por qué ser Voluntario? */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4">Beneficios de Ser Voluntario</h2>
            <p className="text-xl text-gray-600">
              Descubre todo lo que ganarás al unirte a nuestra familia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pageContent.beneficios.map((beneficio, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="text-5xl mb-4">{beneficio.icono}</div>
                  <h3 className="text-xl mb-2">{beneficio.titulo}</h3>
                  <p className="text-gray-600">{beneficio.descripcion}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 - Áreas de Voluntariado */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4">¿Dónde Puedes Ayudar?</h2>
            <p className="text-xl text-gray-600">
              Tenemos oportunidades en diversas áreas según tus habilidades
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pageContent.areas.map((area, index) => (
              <Card key={index} className="hover:shadow-xl transition-all hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-5xl flex-shrink-0">{area.icono}</div>
                    <div className="flex-1">
                      <h3 className="text-xl mb-2">{area.nombre}</h3>
                      <p className="text-gray-600 mb-4">{area.descripcion}</p>
                      <div className="flex flex-wrap gap-2">
                        {area.habilidades.map((habilidad, idx) => (
                          <Badge key={idx} variant="secondary" className="bg-[#4A9D5F]/10 text-[#4A9D5F]">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {habilidad}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 - Requisitos */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4">Requisitos para Ser Voluntario</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left - Requirements */}
            <div>
              <h3 className="text-2xl mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-[#4A9D5F]" />
                Requisitos Básicos
              </h3>
              <div className="space-y-3">
                {pageContent.requisitos.basicos.map((req, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-[#4A9D5F] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{req}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Process */}
            <div>
              <h3 className="text-2xl mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-[#F4B223]" />
                Proceso de Selección
              </h3>
              <div className="space-y-4">
                {pageContent.requisitos.proceso.map((paso, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#F4B223] text-gray-900 flex items-center justify-center">
                      {paso.paso}
                    </div>
                    <div className="flex-1">
                      <h4 className="mb-1">{paso.titulo}</h4>
                      <p className="text-sm text-gray-600">{paso.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 - Testimonios */}
      {activeTestimonials.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-[#4A9D5F]/10 to-[#F4B223]/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl mb-4">Lo Que Dicen Nuestros Voluntarios</h2>
            </div>

            <div className="relative">
              <Card className="border-2">
                <CardContent className="p-8">
                  <div className="text-center">
                    <img 
                      src={activeTestimonials[currentTestimonial].foto}
                      alt={activeTestimonials[currentTestimonial].nombre}
                      className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-[#F4B223]"
                    />
                    <div className="flex justify-center gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-5 h-5 fill-[#F4B223] text-[#F4B223]" />
                      ))}
                    </div>
                    <p className="text-xl italic text-gray-700 mb-4">
                      "{activeTestimonials[currentTestimonial].cita}"
                    </p>
                    <p className="mb-1">
                      <strong>{activeTestimonials[currentTestimonial].nombre}</strong>
                    </p>
                    <p className="text-gray-600 mb-1">
                      {activeTestimonials[currentTestimonial].rol}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activeTestimonials[currentTestimonial].tiempo}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {activeTestimonials.length > 1 && (
                <>
                  <button
                    onClick={prevTestimonial}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextTestimonial}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  <div className="flex justify-center gap-2 mt-6">
                    {activeTestimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentTestimonial(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentTestimonial 
                            ? 'bg-[#F4B223] w-8' 
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Section 6 - FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4">Preguntas Frecuentes</h2>
            <p className="text-xl text-gray-600">
              Encuentra respuestas a las preguntas más comunes
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {pageContent.faq.filter(f => f.activo).map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span>{item.pregunta}</span>
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {item.respuesta}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Section 7 - Final CTA */}
      <section className="py-20 bg-gradient-to-br from-[#4A9D5F] to-[#3B7D4D] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl mb-4">
            ¿Listo para Marcar la Diferencia?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Únete a nuestra familia de voluntarios hoy
          </p>

          <Button 
            size="lg" 
            className="bg-[#F4B223] hover:bg-[#E5A820] text-gray-900 text-lg px-12 py-6 mb-12"
            onClick={scrollToForm}
          >
            <Heart className="w-5 h-5 mr-2" />
            Inscribirme como Voluntario
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center justify-center gap-3">
              <Award className="w-8 h-8 text-[#F4B223]" />
              <div className="text-left">
                <div className="text-sm text-white/80">Certificación</div>
                <div>Oficial</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-[#F4B223]" />
              <div className="text-left">
                <div className="text-sm text-white/80">Ambiente</div>
                <div>Seguro</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Users className="w-8 h-8 text-[#F4B223]" />
              <div className="text-left">
                <div className="text-sm text-white/80">Apoyo</div>
                <div>Continuo</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <div ref={formRef}>
        {showForm && (
          <section className="py-20 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <VolunteerApplicationForm onClose={() => setShowForm(false)} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
