import { ImageWithFallback } from './figma/ImageWithFallback';
import { Calendar, MapPin, Clock, Users, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export function EventsSection() {
  const upcomingEvents = [
    {
      id: 1,
      title: 'Celebración Día del Niño 2024',
      date: '2024-04-28',
      time: '2:00 PM - 6:00 PM',
      location: 'Parque de la Vida, Armenia',
      description: 'Jornada especial de recreación, juegos y sorpresas para todos nuestros niños apadrinados.',
      attendees: '250+ esperados',
      image: 'https://images.unsplash.com/photo-1727816563733-887f47dda98f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMHBsYXlpbmclMjBvdXRkb29yfGVufDF8fHx8MTc2MTUwMzQ4N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      category: 'Celebración',
    },
    {
      id: 2,
      title: 'Concierto Escuela de Música',
      date: '2024-05-15',
      time: '6:00 PM - 8:00 PM',
      location: 'Teatro Municipal de Armenia',
      description: 'Presentación de los talentos de nuestra escuela de música. Invitamos a toda la comunidad.',
      attendees: '150+ esperados',
      image: 'https://images.unsplash.com/photo-1691333940510-7286846c5342?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGNsYXNzJTIwY2hpbGRyZW58ZW58MXx8fHwxNzYxNjIyNjY4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      category: 'Cultural',
    },
    {
      id: 3,
      title: 'Taller para Padrinos: Acompañamiento Efectivo',
      date: '2024-06-10',
      time: '9:00 AM - 12:00 PM',
      location: 'Sede Fundación Huahuacuna',
      description: 'Espacio de formación para fortalecer el vínculo entre padrinos y ahijados.',
      attendees: '80+ esperados',
      image: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwbWVldGluZyUyMGNvbGxhYm9yYXRpb258ZW58MXx8fHwxNzYxNTk1NzU2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      category: 'Formación',
    },
    {
      id: 4,
      title: 'Jornada de Ropero Comunitario',
      date: '2024-07-20',
      time: '8:00 AM - 4:00 PM',
      location: 'Sede Fundación Huahuacuna',
      description: 'Recepción de donaciones de ropa y distribución a familias necesitadas.',
      attendees: '200+ esperados',
      image: 'https://images.unsplash.com/photo-1565373086464-c8af0d586c0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGNoaWxkcmVuJTIwbGVhcm5pbmd8ZW58MXx8fHwxNzYxNTUwNzAwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      category: 'Solidaridad',
    },
  ];

  const pastEvents = [
    {
      id: 1,
      title: 'Navidad con Amor 2023',
      date: 'Diciembre 2023',
      description: 'Celebración navideña con entrega de regalos y compartir familiar.',
      attendees: '500+ asistentes',
      photos: 45,
      image: 'https://images.unsplash.com/photo-1761053276085-88b29f1d3062?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBldmVudCUyMGNlbGVicmF0aW9ufGVufDF8fHx8MTc2MTUzMTMxMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      id: 2,
      title: 'Encuentro de Padrinos 2023',
      date: 'Octubre 2023',
      description: 'Espacio de conexión entre padrinos y ahijados con actividades recreativas.',
      attendees: '180+ asistentes',
      photos: 62,
      image: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwbWVldGluZyUyMGNvbGxhYm9yYXRpb258ZW58MXx8fHwxNzYxNTk1NzU2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      id: 3,
      title: 'Graduación Escuela de Música',
      date: 'Julio 2023',
      description: 'Ceremonia de graduación de estudiantes destacados del programa musical.',
      attendees: '120+ asistentes',
      photos: 38,
      image: 'https://images.unsplash.com/photo-1691333940510-7286846c5342?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGNsYXNzJTIwY2hpbGRyZW58ZW58MXx8fHwxNzYxNjIyNjY4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      id: 4,
      title: 'Campaña de Salud Integral',
      date: 'Mayo 2023',
      description: 'Jornada de atención médica, odontológica y nutricional gratuita.',
      attendees: '300+ asistentes',
      photos: 54,
      image: 'https://images.unsplash.com/photo-1666281269793-da06484657e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMGVkdWNhdGlvbiUyMGNsYXNzcm9vbXxlbnwxfHx8fDE3NjE1NDkzODB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      id: 5,
      title: 'Día de la Familia 2023',
      date: 'Marzo 2023',
      description: 'Actividades recreativas y deportivas para fortalecer los lazos familiares.',
      attendees: '250+ asistentes',
      photos: 71,
      image: 'https://images.unsplash.com/photo-1727816563733-887f47dda98f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMHBsYXlpbmclMjBvdXRkb29yfGVufDF8fHx8MTc2MTUwMzQ4N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      id: 6,
      title: 'Taller de Emprendimiento Juvenil',
      date: 'Enero 2023',
      description: 'Formación en habilidades empresariales para adolescentes del programa.',
      attendees: '65+ asistentes',
      photos: 29,
      image: 'https://images.unsplash.com/photo-1565373086464-c8af0d586c0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGNoaWxkcmVuJTIwbGVhcm5pbmd8ZW58MXx8fHwxNzYxNTUwNzAwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
  ];

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Celebración': 'bg-pink-100 text-pink-800',
      'Cultural': 'bg-purple-100 text-purple-800',
      'Formación': 'bg-blue-100 text-blue-800',
      'Solidaridad': 'bg-emerald-100 text-emerald-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-100 rounded-full px-4 py-2 mb-4">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span className="text-purple-800 text-sm">Nuestros Eventos</span>
          </div>
          <h1 className="text-gray-900 mb-4">Actividades y Celebraciones</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Espacios de encuentro, aprendizaje y celebración para nuestra comunidad
          </p>
        </div>

        {/* Upcoming Events */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-gray-900">Próximos Eventos</h2>
            <Badge className="bg-amber-500 text-white">
              {upcomingEvents.length} eventos programados
            </Badge>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-xl transition-shadow group">
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className={getCategoryColor(event.category)}>
                      {event.category}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 text-white text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(event.date).toLocaleDateString('es-CO', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}</span>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <h3 className="text-gray-900 mb-3">{event.title}</h3>
                  <p className="text-gray-600 mb-4">{event.description}</p>
                  
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-500" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-500" />
                      <span>{event.attendees}</span>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                    Inscribirse al Evento
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Past Events */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-gray-900">Eventos Realizados</h2>
            <Badge className="bg-gray-200 text-gray-700">
              Año 2023
            </Badge>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-white text-center">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                      <p>Ver {event.photos} fotos</p>
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
                    {event.date}
                  </div>
                </div>
                
                <CardContent className="p-5">
                  <h4 className="text-gray-900 mb-2">{event.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>{event.attendees}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-amber-500 to-emerald-500 rounded-2xl p-12 text-center text-white">
          <Calendar className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-white mb-4">¿Quieres Participar en Nuestros Eventos?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Únete a nuestra comunidad y sé parte de estas experiencias transformadoras. 
            Tu presencia hace la diferencia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-gray-900 hover:bg-gray-100 px-8">
              Suscribirse al Calendario
            </Button>
            <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10">
              Contactar Coordinador de Eventos
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

