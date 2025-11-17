import { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  BookOpen, 
  Download, 
  Share2,
  MapPin,
  Calendar,
  GraduationCap,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useSponsorship } from '../../contexts/SponsorshipContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ChatInterface } from './ChatInterface';

interface SponsoredChildProfilePageProps {
  onNavigate: (page: string) => void;
}

export function SponsoredChildProfilePage({ onNavigate }: SponsoredChildProfilePageProps) {
  const { mySponsoredChild, mySponsorship } = useSponsorship();
  const [showChat, setShowChat] = useState(false);

  if (!mySponsoredChild || !mySponsorship) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-gray-900 mb-2">Aún no apadrinas a un niño</h2>
            <p className="text-gray-600 mb-6">
              Explora nuestro catálogo y encuentra un niño al que puedas apoyar
            </p>
            <Button
              onClick={() => onNavigate('catalog')}
              className="bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white"
            >
              Ver Niños Disponibles
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const child = mySponsoredChild;
  const sponsorship = mySponsorship;

  const calculateDuration = () => {
    const start = new Date(sponsorship.fechaInicio);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
    return diffMonths;
  };

  const monthsSponsored = calculateDuration();

  const benefits = [
    { label: 'Educación completa', completed: true },
    { label: 'Salud asegurada', completed: true },
    { label: 'Vestido y calzado', completed: true },
    { label: 'Implementos de aseo', completed: true },
    { label: 'Actividades de esparcimiento', completed: true },
  ];

  const recentActivity = [
    { 
      date: '2024-01-25', 
      title: 'Bitácora actualizada',
      description: 'Nueva actualización sobre progreso académico'
    },
    { 
      date: '2024-01-15', 
      title: 'Participó en evento',
      description: 'Día del Niño - Actividades recreativas'
    },
    { 
      date: '2024-01-10', 
      title: 'Actualización médica',
      description: 'Control de crecimiento y desarrollo'
    },
  ];

  return (
    <div className="p-8">
      {/* Header Banner */}
      <div className="relative h-64 rounded-2xl overflow-hidden mb-8">
        <ImageWithFallback
          src={child.foto}
          alt={child.nombreCompleto || child.nombre}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <Badge className="bg-white/20 text-white backdrop-blur-sm border-white/30 mb-3">
            Tu Niño Apadrinado
          </Badge>
          <h1 className="text-white mb-2">{child.nombreCompleto || child.nombre}</h1>
          <p className="text-white/90">
            Apadrinando desde {new Date(sponsorship.fechaInicio).toLocaleDateString('es-CO', { 
              month: 'long', 
              year: 'numeric' 
            })} • {monthsSponsored} {monthsSponsored === 1 ? 'mes' : 'meses'}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Button
          onClick={() => setShowChat(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white h-auto py-4"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          <div className="text-left">
            <div>Enviar Mensaje</div>
            <div className="text-xs opacity-90">Chat con coordinador</div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto py-4 border-2"
        >
          <BookOpen className="w-5 h-5 mr-2" />
          <div className="text-left">
            <div>Ver Bitácora</div>
            <div className="text-xs text-gray-500">Progreso completo</div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto py-4 border-2"
        >
          <Download className="w-5 h-5 mr-2" />
          <div className="text-left">
            <div>Descargar PDF</div>
            <div className="text-xs text-gray-500">Informe mensual</div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto py-4 border-2"
        >
          <Share2 className="w-5 h-5 mr-2" />
          <div className="text-left">
            <div>Compartir</div>
            <div className="text-xs text-gray-500">Con familia</div>
          </div>
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Information */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-gray-900 mb-6">Información Personal</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
                    <p className="text-gray-900">
                      {new Date(child.fechaNacimiento).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Edad Actual</p>
                    <p className="text-gray-900">{child.edad} años</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Municipio</p>
                    <p className="text-gray-900">{child.municipio}, Quindío</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Institución Educativa</p>
                    <p className="text-gray-900">{child.institucion}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Grado Escolar</p>
                    <p className="text-gray-900">{child.grado}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Child's Story */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-gray-900 mb-4">Su Historia</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {child.historia}
              </p>
              
              {child.suenos && (
                <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-emerald-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-gray-600 mb-2">💫 Sus Sueños</p>
                  <p className="text-gray-900 italic">"{child.suenos}"</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Benefits Program */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-gray-900 mb-6">Programa de Beneficios</h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      benefit.completed ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}>
                      {benefit.completed && <CheckCircle className="w-4 h-4 text-white" />}
                    </div>
                    <span className="text-gray-700">{benefit.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Photo Gallery */}
          {child.fotos && child.fotos.length > 0 && (
            <Card>
              <CardContent className="p-8">
                <h2 className="text-gray-900 mb-6">Galería de Fotos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {child.fotos.map((foto, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden">
                      <ImageWithFallback
                        src={foto}
                        alt={`${child.nombre} - Foto ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress Card */}
          <Card className="bg-gradient-to-br from-amber-500 to-emerald-500 text-white border-0">
            <CardContent className="p-6">
              <h3 className="text-white mb-4">Progreso del Año 2024</h3>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-2 opacity-90">
                  <span>Objetivos Cumplidos</span>
                  <span>85%</span>
                </div>
                <Progress value={85} className="h-2 bg-white/30" />
              </div>
              <p className="text-sm opacity-90">
                {child.nombre} está progresando excelentemente en su desarrollo académico y personal.
              </p>
            </CardContent>
          </Card>

          {/* Quick Facts */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-gray-900 mb-4">Datos Rápidos</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Inicio de Apadrinamiento</span>
                  <span className="text-gray-900">
                    {new Date(sponsorship.fechaInicio).toLocaleDateString('es-CO', {
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tiempo Apadrinado</span>
                  <span className="text-gray-900">{monthsSponsored} meses</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Próxima Actualización</span>
                  <span className="text-gray-900">15 Feb 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado</span>
                  <Badge className="bg-emerald-100 text-emerald-800">Activo</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-gray-900 mb-4">Actividad Reciente</h3>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(activity.date).toLocaleDateString('es-CO')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-gray-900 mb-4">Próximos Eventos</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Encuentro de Padrinos</p>
                    <p className="text-xs text-gray-600">15 de Febrero, 2024</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chat Modal */}
      {showChat && (
        <ChatInterface
          sponsorshipId={sponsorship.id}
          childName={child.nombre}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}
