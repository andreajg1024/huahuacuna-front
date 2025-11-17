import { ImageWithFallback } from './figma/ImageWithFallback';
import { Heart, Target, Eye, Award, Users, Lightbulb } from 'lucide-react';
import { Card, CardContent } from './ui/card';

export function AboutSection() {
  const values = [
    {
      icon: Heart,
      title: 'Amor',
      description: 'Brindamos cariño y acompañamiento a cada niño',
    },
    {
      icon: Target,
      title: 'Compromiso',
      description: 'Dedicados al bienestar integral de la niñez',
    },
    {
      icon: Users,
      title: 'Solidaridad',
      description: 'Trabajamos juntos por una causa común',
    },
    {
      icon: Lightbulb,
      title: 'Innovación',
      description: 'Buscamos constantemente mejores formas de servir',
    },
  ];

  const timeline = [
    { year: '2003', event: 'Fundación como "Sonrisa Italiana"' },
    { year: '2008', event: 'Inicio del programa de apadrinamiento' },
    { year: '2012', event: 'Expansión a 6 municipios del Quindío' },
    { year: '2015', event: 'Creación de la Escuela de Música' },
    { year: '2018', event: 'Implementación de talleres de desarrollo' },
    { year: '2020', event: 'Adaptación a programas virtuales' },
    { year: '2023', event: '542 niños apadrinados activamente' },
  ];

  const team = [
    {
      name: 'María González',
      role: 'Directora Ejecutiva',
      image: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwbWVldGluZyUyMGNvbGxhYm9yYXRpb258ZW58MXx8fHwxNzYxNTk1NzU2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      name: 'Carlos Ramírez',
      role: 'Coordinador de Programas',
      image: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwbWVldGluZyUyMGNvbGxhYm9yYXRpb258ZW58MXx8fHwxNzYxNTk1NzU2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      name: 'Ana Martínez',
      role: 'Trabajadora Social',
      image: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwbWVldGluZyUyMGNvbGxhYm9yYXRpb258ZW58MXx8fHwxNzYxNTk1NzU2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      name: 'Luis Torres',
      role: 'Coordinador de Educación',
      image: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwbWVldGluZyUyMGNvbGxhYm9yYXRpb258ZW58MXx8fHwxNzYxNTk1NzU2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
  ];

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-amber-100 rounded-full px-4 py-2 mb-4">
            <Heart className="w-4 h-4 text-amber-600" />
            <span className="text-amber-800 text-sm">Conócenos</span>
          </div>
          <h1 className="text-gray-900 mb-4">Fundación Huahuacuna</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Más de 20 años transformando vidas y construyendo futuro para la niñez vulnerable del Quindío
          </p>
        </div>

        {/* History Section */}
        <div className="mb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-gray-900 mb-6">Nuestra Historia</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  La Fundación Huahuacuna nació en 2003 con el nombre de "Sonrisa Italiana", 
                  con la misión de brindar apoyo integral a niños, niñas y adolescentes en situación 
                  de vulnerabilidad en Armenia, Quindío.
                </p>
                <p>
                  Durante más de dos décadas, hemos trabajado incansablemente para garantizar que 
                  cada niño tenga acceso a educación de calidad, atención en salud, nutrición 
                  adecuada y un entorno lleno de amor y oportunidades.
                </p>
                <p>
                  Hoy, somos una red de esperanza que conecta a más de 542 niños con padrinos 
                  comprometidos, creando lazos que transforman vidas y construyen un futuro mejor 
                  para nuestra comunidad.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1565373086464-c8af0d586c0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGNoaWxkcmVuJTIwbGVhcm5pbmd8ZW58MXx8fHwxNzYxNTUwNzAwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Children learning"
                  className="w-full h-[400px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mission and Vision */}
        <div className="mb-20">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center mb-4">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-gray-900 mb-4">Nuestra Misión</h3>
                <p className="text-gray-600">
                  Contribuir al desarrollo integral de niños, niñas y adolescentes en situación de 
                  vulnerabilidad, acompañándolos en su proceso de crecimiento y formación a través 
                  de programas de apadrinamiento y desarrollo comunitario.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center mb-4">
                  <Eye className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-gray-900 mb-4">Nuestra Visión</h3>
                <p className="text-gray-600">
                  Ser reconocidos como una organización líder en el acompañamiento integral de la 
                  niñez vulnerable, generando impacto sostenible y transformación social en el 
                  departamento del Quindío.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h2 className="text-gray-900 text-center mb-12">Nuestros Valores</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-gray-900 mb-2">{value.title}</h4>
                  <p className="text-sm text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-20">
          <h2 className="text-gray-900 text-center mb-12">Nuestra Trayectoria</h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-amber-200"></div>
            
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-amber-500">
                      <div className="text-2xl text-amber-600 mb-2" style={{ fontWeight: 700 }}>
                        {item.year}
                      </div>
                      <p className="text-gray-700">{item.event}</p>
                    </div>
                  </div>
                  
                  {/* Timeline dot */}
                  <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-amber-500 rounded-full border-4 border-white shadow"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="mb-20">
          <h2 className="text-gray-900 text-center mb-4">Nuestro Equipo</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Profesionales comprometidos con el bienestar y desarrollo integral de cada niño
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-4 group">
                  <div className="w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-amber-200 shadow-lg group-hover:border-amber-400 transition-colors">
                    <ImageWithFallback
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <h4 className="text-gray-900 mb-1">{member.name}</h4>
                <p className="text-sm text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Biblical Quote */}
        <div className="bg-gradient-to-r from-amber-500 to-emerald-500 rounded-2xl p-12 text-center text-white">
          <div className="max-w-3xl mx-auto">
            <Award className="w-16 h-16 mx-auto mb-6 opacity-80" />
            <p className="text-2xl mb-4 italic" style={{ fontWeight: 500 }}>
              "Cualquiera que reciba en mi nombre a un niño como éste, a mí me recibe…"
            </p>
            <p className="text-xl opacity-90">— Mateo 18:5</p>
          </div>
        </div>
      </div>
    </div>
  );
}
