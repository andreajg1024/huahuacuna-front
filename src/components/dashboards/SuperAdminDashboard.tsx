import { 
  Users, 
  UserCog, 
  Heart, 
  BookOpen, 
  Calendar, 
  HandHeart, 
  DollarSign,
  Settings,
  BarChart3,
  FileText,
  ChevronRight,
  FolderOpen,
  TrendingUp,
  PieChart
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { useAuth } from '../../contexts/AuthContext';

interface SuperAdminDashboardProps {
  onNavigate: (page: string) => void;
}

export function SuperAdminDashboard({ onNavigate }: SuperAdminDashboardProps) {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Usuarios', value: '623', icon: Users, color: 'from-blue-400 to-blue-500' },
    { label: 'Niños Registrados', value: '542', icon: Heart, color: 'from-pink-400 to-pink-500' },
    { label: 'Apadrinamientos Activos', value: '487', icon: HandHeart, color: 'from-green-400 to-green-500' },
    { label: 'Eventos este Mes', value: '12', icon: Calendar, color: 'from-purple-400 to-purple-500' },
  ];

  // Definición de los módulos principales del panel de SUPER ADMIN.
  // Cada módulo navega a una "page" manejada por App.tsx mediante onNavigate.
  const modules = [
    {
      title: 'Gestión de Usuarios',
      description: 'Administrar padrinos y usuarios del sistema',
      icon: Users,
      color: 'from-blue-400 to-blue-500',
      onClick: () => onNavigate('admin-management'),
    },
    {
      title: 'Gestión de Administradores',
      description: 'Crear y gestionar cuentas de administradores',
      icon: UserCog,
      color: 'from-indigo-400 to-indigo-500',
      onClick: () => onNavigate('admin-management'),
    },
    {
      title: 'Gestión de Niños',
      description: 'Perfiles y seguimiento de niños beneficiarios',
      icon: Heart,
      color: 'from-pink-400 to-pink-500',
      onClick: () => onNavigate('children-management'),
    },
    {
      title: 'Apadrinamientos',
      description: 'Asignar y gestionar relaciones padrino-ahijado',
      icon: HandHeart,
      color: 'from-green-400 to-green-500',
      onClick: () => onNavigate('catalog'),
    },
    {
      title: 'Bitácoras',
      description: 'Registros de progreso y desarrollo',
      icon: BookOpen,
      color: 'from-amber-400 to-amber-500',
      onClick: () => onNavigate('bitacora'),
    },
    {
      title: 'Eventos',
      description: 'Planificar y gestionar eventos',
      icon: Calendar,
      color: 'from-purple-400 to-purple-500',
      onClick: () => onNavigate('eventos'),
    },
    {
      title: 'Proyectos',
      description: 'Gestionar proyectos y voluntarios',
      icon: FolderOpen,
      color: 'from-orange-400 to-orange-500',
      onClick: () => onNavigate('project-management'),
    },
    {
      title: 'Solicitudes de Voluntarios',
      description: 'Revisar y aprobar voluntarios',
      icon: Users,
      color: 'from-cyan-400 to-cyan-500',
      onClick: () => onNavigate('volunteering-applications'),
    },
    {
      title: 'Noticias y Blog',
      description: 'Publicar noticias y actualizaciones',
      icon: FileText,
      color: 'from-indigo-400 to-indigo-500',
      onClick: () => onNavigate('news-management'),
    },
    {
      title: 'Gestión de Donaciones',
      description: 'Administrar donaciones y reportes',
      icon: DollarSign,
      color: 'from-pink-400 to-pink-500',
      onClick: () => onNavigate('donations-management'),
    },
    {
      title: 'Panel de Control',
      description: 'Dashboard con KPIs en tiempo real',
      icon: TrendingUp,
      color: 'from-cyan-400 to-cyan-500',
      onClick: () => onNavigate('admin-dashboard'),
    },
    {
      title: 'Reportes de Apadrinamiento',
      description: 'Análisis del programa de apadrinamiento',
      icon: BarChart3,
      color: 'from-teal-400 to-teal-500',
      onClick: () => onNavigate('sponsorship-reports'),
    },
    {
      title: 'Reportes de Donaciones',
      description: 'Análisis financiero de donaciones',
      icon: PieChart,
      color: 'from-lime-400 to-lime-500',
      onClick: () => onNavigate('donation-reports'),
    },
    {
      title: 'Reportes y Estadísticas',
      description: 'Análisis y métricas del sistema',
      icon: BarChart3,
      color: 'from-orange-400 to-orange-500',
      onClick: () => onNavigate('admin-dashboard'),
    },
    {
      title: 'Configuración del Sistema',
      description: 'Parámetros y ajustes generales',
      icon: Settings,
      color: 'from-gray-400 to-gray-500',
      onClick: () => onNavigate('system-settings'),
    },
  ];

  const recentActivity = [
    { action: 'Nuevo padrino registrado', user: 'Ana María López', time: 'Hace 15 min' },
    { action: 'Bitácora actualizada', user: 'Carlos Admin', time: 'Hace 1 hora' },
    { action: 'Evento creado', user: 'María González', time: 'Hace 2 horas' },
    { action: 'Donación recibida', user: 'Juan Pérez', time: 'Hace 3 horas' },
    { action: 'Nuevo niño registrado', user: 'Admin Principal', time: 'Hace 5 horas' },
  ];

  return (
    <div className="p-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Panel de Super Administrador</h1>
        <p className="text-gray-600">
          Bienvenido, <strong>{user?.nombre}</strong>. Tienes acceso completo al sistema.
        </p>
      </div>

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
        <h2 className="text-gray-900 mb-6">Módulos del Sistema</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {modules.map((module, index) => (
            <Card 
              key={index}
              className="hover:shadow-lg transition-all cursor-pointer group border-2 border-transparent hover:border-blue-200"
              onClick={module.onClick}
            >
              <CardContent className="p-6">
                <div className={`w-14 h-14 bg-gradient-to-br ${module.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <module.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {module.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{module.description}</p>
                <div className="flex items-center text-sm text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Abrir</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-gray-900 mb-6">Actividad Reciente</h2>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">por {activity.user}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
            <Button 
              variant="ghost" 
              className="w-full mt-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => onNavigate('admin-dashboard')}
            >
              Ver Toda la Actividad
              <FileText className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Import Button at the top (add this to imports)
import { Button } from '../ui/button';

