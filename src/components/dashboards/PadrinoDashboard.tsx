import { 
  User, 
  Heart, 
  BookOpen, 
  MessageCircle, 
  DollarSign,
  Calendar,
  FileText,
  ChevronRight,
  Gift,
  Award,
  Search
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { useSponsorship } from '../../contexts/SponsorshipContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Progress } from '../ui/progress';

interface PadrinoDashboardProps {
  onNavigate: (page: string) => void;
}

// PadrinoDashboard es la "home" del padrino dentro del sistema:
// - Resalta el niño apadrinado (si existe) con tarjeta hero y métricas.
// - Expone accesos rápidos a Bitácora, Mensajes, Mis Donaciones, Eventos y Documentos.
// - Si aún no tiene apadrinamiento, muestra un CTA para ir al catálogo de niños.
export function PadrinoDashboard({ onNavigate }: PadrinoDashboardProps) {
  const { user } = useAuth();
  const { mySponsoredChild, mySponsorship, children, unreadMessagesCount } = useSponsorship();

  const stats = [
    { label: 'Meses Apadrinando', value: '20', icon: Heart, color: 'from-pink-400 to-pink-500' },
    { label: 'Donaciones Realizadas', value: '20', icon: DollarSign, color: 'from-green-400 to-green-500' },
    { label: 'Eventos Asistidos', value: '8', icon: Calendar, color: 'from-purple-400 to-purple-500' },
    { label: 'Mensajes Enviados', value: '45', icon: MessageCircle, color: 'from-blue-400 to-blue-500' },
  ];

  // Accesos rápidos para el padrino a las secciones clave de su experiencia.
  const modules = [
    {
      title: 'Mi Perfil',
      description: 'Actualiza tu información personal',
      icon: User,
      color: 'from-blue-400 to-blue-500',
      onClick: () => onNavigate('profile'),
    },
    {
      title: 'Niños Apadrinados',
      description: 'Perfil e información de tu ahijado',
      icon: Heart,
      color: 'from-pink-400 to-pink-500',
      badge: '1',
      onClick: () => onNavigate('my-child'),
    },
    {
      title: 'Bitácora del Niño',
      description: 'Progreso y desarrollo académico',
      icon: BookOpen,
      color: 'from-amber-400 to-amber-500',
      onClick: () => {
        if (mySponsoredChild) {
          // In a real router setup, would navigate to /bitacora/:childId
          // For now, we'll use the navigate function
          window.location.hash = `bitacora-${mySponsoredChild.id}`;
          onNavigate('bitacora');
        }
      },
    },
    {
      title: 'Mensajes',
      description: 'Chat con coordinadores',
      icon: MessageCircle,
      color: 'from-blue-400 to-blue-500',
      badge: '3',
      onClick: () => onNavigate('messages'),
    },
    {
      title: 'Mis Donaciones',
      description: 'Historial de aportes',
      icon: DollarSign,
      color: 'from-green-400 to-green-500',
      onClick: () => onNavigate('my-donations'),
    },
    {
      title: 'Eventos',
      description: 'Próximas actividades',
      icon: Calendar,
      color: 'from-purple-400 to-purple-500',
      badge: '2',
      onClick: () => onNavigate('eventos'),
    },
    {
      title: 'Documentos',
      description: 'Certificados y reportes',
      icon: FileText,
      color: 'from-gray-400 to-gray-500',
      onClick: () => onNavigate('my-donations'),
    },
  ];

  const upcomingEvents = [
    { title: 'Celebración Día del Niño', date: '2024-04-28', type: 'Celebración' },
    { title: 'Encuentro de Padrinos', date: '2024-05-15', type: 'Encuentro' },
  ];

  const recentUpdates = [
    { title: 'Nueva bitácora disponible', date: 'Hace 2 días', type: 'update' },
    { title: 'Mensaje de la coordinadora', date: 'Hace 5 días', type: 'message' },
    { title: 'Informe académico trimestral', date: 'Hace 1 semana', type: 'document' },
  ];

  return (
    <div className="p-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Mi Espacio de Padrino</h1>
        <p className="text-gray-600">
          Bienvenido, <strong>{user?.nombre}</strong>. Gracias por transformar vidas.
        </p>
      </div>

      {/* Sponsored Child Highlight or CTA */}
      {mySponsoredChild && mySponsorship ? (
        <Card className="mb-8 overflow-hidden bg-gradient-to-br from-amber-50 to-white border-2 border-amber-200">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
              <div className="relative">
                <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-xl">
                  <ImageWithFallback
                    src={mySponsoredChild.foto}
                    alt={mySponsoredChild.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-3 -right-3 w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                  <Heart className="w-8 h-8 text-white fill-white" />
                </div>
              </div>

              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-amber-100 rounded-full px-3 py-1 mb-3">
                  <Award className="w-4 h-4 text-amber-700" />
                  <span className="text-sm text-amber-800">Tu Niño Apadrinado</span>
                </div>
                <h2 className="text-gray-900 mb-2">{mySponsoredChild.nombre}</h2>
                <div className="flex flex-col sm:flex-row gap-4 mb-6 text-gray-600 justify-center lg:justify-start">
                  <span>{mySponsoredChild.edad} años</span>
                  <span className="hidden sm:block">•</span>
                  <span>{mySponsoredChild.grado}</span>
                  <span className="hidden sm:block">•</span>
                  <span>Apadrinado desde {new Date(mySponsorship.fechaInicio).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}</span>
                </div>

                <p className="text-gray-700 mb-6 line-clamp-3">{mySponsoredChild.descripcionBreve}</p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={() => onNavigate('my-child')}
                    className="bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Ver Perfil Completo
                  </Button>
                  <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {unreadMessagesCount > 0 && (
                      <span className="mr-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {unreadMessagesCount}
                      </span>
                    )}
                    Enviar Mensaje
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8 overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
          <CardContent className="p-8 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-gray-900 mb-4">Comienza Tu Viaje de Apadrinamiento</h2>
              <p className="text-gray-600 mb-8">
                Hay {children.length} niños esperando por un padrino como tú. 
                Explora nuestro catálogo y encuentra un niño al que puedas apoyar en su desarrollo integral.
              </p>
              <Button
                onClick={() => onNavigate('catalog')}
                className="bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white"
              >
                <Heart className="w-4 h-4 mr-2" />
                Explorar Niños Disponibles
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl text-gray-900 mb-1" style={{ fontWeight: 700 }}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modules Grid */}
      <div className="mb-8">
        <h2 className="text-gray-900 mb-6">Accesos Rápidos</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {modules.map((module, index) => (
            <Card 
              key={index}
              className="hover:shadow-lg transition-all cursor-pointer group border-2 border-transparent hover:border-amber-200 relative"
              onClick={module.onClick}
            >
              {module.badge && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs z-10">
                  {module.badge}
                </div>
              )}
              <CardContent className="p-6">
                <div className={`w-14 h-14 bg-gradient-to-br ${module.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <module.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                  {module.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{module.description}</p>
                <div className="flex items-center text-sm text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Abrir</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upcoming Events */}
        <div>
          <h2 className="text-gray-900 mb-6">Próximos Eventos</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg">
                    <div className="w-14 h-14 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-gray-900 mb-1">{event.title}</h4>
                      <p className="text-sm text-gray-600">{new Date(event.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      <span className="inline-block text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded mt-2">
                        {event.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Button 
                variant="ghost" 
                className="w-full mt-4 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                onClick={() => onNavigate('eventos')}
              >
                Ver Todos los Eventos
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Updates */}
        <div>
          <h2 className="text-gray-900 mb-6">Actualizaciones Recientes</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {recentUpdates.map((update, index) => (
                  <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <h4 className="text-gray-900 mb-1">{update.title}</h4>
                      <p className="text-sm text-gray-500">{update.date}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button 
                variant="ghost" 
                className="w-full mt-4 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                onClick={() => onNavigate('bitacora')}
              >
                Ver Todas las Actualizaciones
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Impact Message */}
      {mySponsoredChild && (
        <Card className="mt-8 bg-gradient-to-r from-amber-500 to-emerald-500 text-white border-0">
          <CardContent className="p-8 text-center">
            <Gift className="w-16 h-16 mx-auto mb-4 opacity-90" />
            <h2 className="text-white mb-4">¡Gracias por Tu Compromiso!</h2>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              Tu apoyo ha permitido que {mySponsoredChild.nombre} tenga acceso a educación de calidad, 
              atención en salud y un futuro lleno de oportunidades.
            </p>
            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-sm mb-2 opacity-90">
                <span>Progreso del año</span>
                <span>85%</span>
              </div>
              <Progress value={85} className="h-3 bg-white/30" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

