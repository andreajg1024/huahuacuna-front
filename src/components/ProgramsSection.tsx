import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  Heart, 
  GraduationCap, 
  Stethoscope, 
  Shirt, 
  Sparkles, 
  PartyPopper,
  Music,
  Languages,
  Lightbulb,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

export function ProgramsSection() {
  const mainProgram = {
    title: 'Programa de Apadrinamiento Integral',
    description: 'Un compromiso completo con el desarrollo y bienestar de cada niño',
    features: [
      {
        icon: GraduationCap,
        title: 'Educación Completa',
        description: 'Apoyo en matrícula, uniformes, útiles escolares y transporte. Acompañamiento académico permanente.',
        color: 'from-blue-400 to-blue-500',
      },
      {
        icon: Stethoscope,
        title: 'Salud Asegurada',
        description: 'Atención médica, odontológica, psicológica y nutricional. Seguimiento continuo del estado de salud.',
        color: 'from-green-400 to-green-500',
      },
      {
        icon: Shirt,
        title: 'Vestido y Calzado',
        description: 'Dotación de ropa, zapatos y elementos básicos de vestuario durante todo el año.',
        color: 'from-purple-400 to-purple-500',
      },
      {
        icon: Sparkles,
        title: 'Implementos de Aseo',
        description: 'Kit de aseo personal mensual para garantizar la higiene y cuidado personal.',
        color: 'from-pink-400 to-pink-500',
      },
      {
        icon: PartyPopper,
        title: 'Actividades de Esparcimiento',
        description: 'Recreación, deportes, paseos y celebraciones especiales para el desarrollo integral.',
        color: 'from-orange-400 to-orange-500',
      },
    ],
  };

  const additionalPrograms = [
    {
      icon: Music,
      title: 'Escuela de Música',
      description: 'Clases de instrumento, teoría musical y ensambles. Fomentamos el talento artístico y la expresión cultural.',
      image: 'https://images.unsplash.com/photo-1691333940510-7286846c5342?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGNsYXNzJTIwY2hpbGRyZW58ZW58MXx8fHwxNzYxNjIyNjY4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      color: 'border-amber-300',
      bgColor: 'from-amber-50 to-white',
    },
    {
      icon: Languages,
      title: 'Escuela de Inglés',
      description: 'Enseñanza del idioma inglés para ampliar oportunidades futuras y desarrollar habilidades comunicativas.',
      image: 'https://images.unsplash.com/photo-1592106680408-e7e63efbc7ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMHJlYWRpbmclMjBib29rc3xlbnwxfHx8fDE3NjE1OTM3MDJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      color: 'border-blue-300',
      bgColor: 'from-blue-50 to-white',
    },
    {
      icon: Lightbulb,
      title: 'Talleres de Desarrollo Integral',
      description: 'Formación en valores, habilidades para la vida, emprendimiento y desarrollo personal.',
      image: 'https://images.unsplash.com/photo-1565373086464-c8af0d586c0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGNoaWxkcmVuJTIwbGVhcm5pbmd8ZW58MXx8fHwxNzYxNTUwNzAwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      color: 'border-green-300',
      bgColor: 'from-green-50 to-white',
    },
    {
      icon: ShoppingBag,
      title: 'Ropero y Moda Circular',
      description: 'Programa de donación y reutilización de ropa en buen estado, promoviendo la sostenibilidad.',
      image: 'https://images.unsplash.com/photo-1727816563733-887f47dda98f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMHBsYXlpbmclMjBvdXRkb29yfGVufDF8fHx8MTc2MTUwMzQ4N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      color: 'border-purple-300',
      bgColor: 'from-purple-50 to-white',
    },
  ];

  const occasionalHelp = [
    'Apoyo en situaciones de emergencia familiar',
    'Dotación escolar adicional según necesidad',
    'Ayudas alimentarias especiales',
    'Apoyo en gastos médicos extraordinarios',
    'Kits navideños y celebraciones especiales',
  ];

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-100 rounded-full px-4 py-2 mb-4">
            <Heart className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-800 text-sm">Nuestros Programas</span>
          </div>
          <h1 className="text-gray-900 mb-4">Transformando Vidas con Amor</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ofrecemos programas integrales que abarcan todas las áreas del desarrollo infantil
          </p>
        </div>

        {/* Main Program - Apadrinamiento */}
        <div className="mb-20">
          <div className="bg-gradient-to-br from-amber-50 to-emerald-50 rounded-2xl p-8 md:p-12 mb-8">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-white fill-white" />
              </div>
              <h2 className="text-gray-900 mb-4">{mainProgram.title}</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {mainProgram.description}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mainProgram.features.map((feature, index) => (
                <Card key={index} className="bg-white hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-full flex items-center justify-center mb-4`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button className="bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white px-8">
                <Heart className="w-4 h-4 mr-2" />
                Apadrinar un Niño Ahora
              </Button>
            </div>
          </div>
        </div>

        {/* Additional Programs */}
        <div className="mb-20">
          <h2 className="text-gray-900 text-center mb-12">Programas Complementarios</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {additionalPrograms.map((program, index) => (
              <Card key={index} className={`border-2 ${program.color} bg-gradient-to-br ${program.bgColor} overflow-hidden group hover:shadow-xl transition-shadow`}>
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={program.image}
                    alt={program.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                      <program.icon className="w-6 h-6 text-gray-900" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-gray-900 mb-3">{program.title}</h3>
                  <p className="text-gray-600 mb-4">{program.description}</p>
                  <Button variant="ghost" className="text-amber-600 hover:text-amber-700 p-0">
                    Más información
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Occasional Help */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-gray-900 mb-4">Ayudas Ocasionales</h2>
              <p className="text-gray-600 mb-6">
                Además de nuestros programas regulares, brindamos apoyo en situaciones especiales 
                que requieren atención inmediata para garantizar el bienestar de los niños.
              </p>
            </div>
            <div>
              <Card className="bg-white">
                <CardContent className="p-6">
                  <ul className="space-y-3">
                    {occasionalHelp.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Heart className="w-3 h-3 text-blue-600 fill-blue-600" />
                        </div>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

                    
      </div>
    </div>
  );
}

