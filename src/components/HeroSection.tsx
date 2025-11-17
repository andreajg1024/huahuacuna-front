import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';
import { Heart, Users, Award, MapPin } from 'lucide-react';

interface HeroSectionProps {
  onNavigate: (section: string) => void;
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const stats = [
    { icon: Users, value: '542', label: 'Niños Apadrinados' },
    { icon: Award, value: '21', label: 'Años de Experiencia' },
    { icon: MapPin, value: '6+', label: 'Municipios' },
  ];

  return (
    <div className="relative">
      {/* Hero Image Section */}
      <div className="relative h-[600px] md:h-[700px]">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1666281269793-da06484657e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMGVkdWNhdGlvbiUyMGNsYXNzcm9vbXxlbnwxfHx8fDE3NjE1NDkzODB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Children learning"
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
        
        {/* Hero Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 backdrop-blur-sm border border-amber-400/30 rounded-full px-4 py-2 mb-6">
                <Heart className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-amber-100 text-sm">Transformando vidas desde 2003</span>
              </div>
              
              <h1 className="text-white mb-6" style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1.1 }}>
                Sembrando Futuro en la Niñez Vulnerable
              </h1>
              
              <p className="text-xl text-gray-200 mb-8 max-w-2xl">
                Acompañamos a niños, niñas y adolescentes en situación de vulnerabilidad en Armenia y el Quindío, 
                brindándoles educación, salud, nutrición y amor.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button
                  onClick={() => onNavigate('programas')}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-6 text-lg"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Apadrina un Niño
                </Button>
                <Button
                  onClick={() => onNavigate('programas')}
                  variant="outline"
                  className="border-2 border-white text-black hover:bg-white hover:text-gray-900 px-8 py-6 text-lg"
                >
                  Conoce Nuestros Programas
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative -mt-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full mb-4">
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl text-gray-900 mb-2" style={{ fontWeight: 700 }}>
                    {stat.value}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mission Statement Section */}
      <div className="py-20 bg-gradient-to-b from-white to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-gray-900 mb-6">Nuestra Misión</h2>
            <p className="text-lg text-gray-600 mb-8">
              Contribuir al desarrollo integral de niños, niñas y adolescentes en situación de vulnerabilidad, 
              acompañándolos en su proceso de crecimiento y formación, a través de programas de apadrinamiento 
              y desarrollo comunitario.
            </p>
            <div className="bg-white rounded-xl p-8 shadow-md border-l-4 border-amber-500">
              <p className="text-gray-700 italic mb-2">
                "Cualquiera que reciba en mi nombre a un niño como éste, a mí me recibe…"
              </p>
              <p className="text-amber-600">— Mateo 18:5</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

