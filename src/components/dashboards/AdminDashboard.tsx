import { 
  Users, 
  Heart, 
  BookOpen, 
  Calendar, 
  HandHeart, 
  DollarSign,
  ChevronRight,
  Lock,
  FileText,
  FolderOpen,
  TrendingUp,
  BarChart3,
  PieChart
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { user } = useAuth();

  // Admin permissions (from mock user data)
  const permissions = user?.permissions || [];

  const stats = [
    { label: 'Mis Casos Asignados', value: '28', icon: Heart, color: 'from-pink-400 to-pink-500' },
    { label: 'Bitácoras Pendientes', value: '5', icon: BookOpen, color: 'from-amber-400 to-amber-500' },
    { label: 'Eventos Próximos', value: '3', icon: Calendar, color: 'from-purple-400 to-purple-500' },
    { label: 'Consultas sin Resolver', value: '12', icon: FileText, color: 'from-blue-400 to-blue-500' },
  ];

  const modules = [
    {
      title: 'Gestión de Usuarios',
      description: 'Ver y gestionar padrinos',
      icon: Users,
      color: 'from-blue-400 to-blue-500',
      permission: 'usuarios',
      onClick: () => {},
    },
    {
      title: 'Gestión de Niños',
      description: 'Perfiles y seguimiento de niños',
      icon: Heart,
      color: 'from-pink-400 to-pink-500',
      permission: 'ninos',
      onClick: () => onNavigate('children-management'),
    },
    {
      title: 'Apadrinamientos',
      description: 'Ver y actualizar apadrinamientos',
      icon: HandHeart,
      color: 'from-green-400 to-green-500',
      permission: 'apadrinamientos',
      onClick: () => {},
    },
    {
      title: 'Bitácoras',
      description: 'Actualizar registros de progreso',
      icon: BookOpen,
      color: 'from-amber-400 to-amber-500',
      permission: 'bitacoras',
      onClick: () => onNavigate('children-management'),
    },
    {
      title: 'Eventos',
      description: 'Gestionar eventos y actividades',
      icon: Calendar,
      color: 'from-purple-400 to-purple-500',
      permission: 'eventos',
      onClick: () => {},
    },
    {
      title: 'Donaciones',
      description: 'Ver historial de donaciones',
      icon: DollarSign,
      color: 'from-emerald-400 to-emerald-500',
      permission: 'donaciones',
      onClick: () => {},
    },
    {
      title: 'Proyectos',
      description: 'Gestionar proyectos y voluntarios',
      icon: FolderOpen,
      color: 'from-orange-400 to-orange-500',
      permission: 'proyectos',
      onClick: () => onNavigate('project-management'),
    },
    {
      title: 'Solicitudes de Voluntarios',
      description: 'Revisar y aprobar voluntarios',
      icon: Users,
      color: 'from-cyan-400 to-cyan-500',
      permission: 'proyectos',
      onClick: () => onNavigate('volunteering-applications'),
    },
    {
      title: 'Noticias y Blog',
      description: 'Publicar noticias y actualizaciones',
      icon: FileText,
      color: 'from-indigo-400 to-indigo-500',
      permission: 'ninos',
      onClick: () => onNavigate('news-management'),
    },
    {
      title: 'Gestión de Donaciones',
      description: 'Administrar donaciones y reportes',
      icon: DollarSign,
      color: 'from-pink-400 to-pink-500',
      permission: 'ninos',
      onClick: () => onNavigate('donations-management'),
    },
    {
      title: 'Panel de Control',
      description: 'Dashboard con KPIs en tiempo real',
      icon: TrendingUp,
      color: 'from-cyan-400 to-cyan-500',
      permission: 'ninos',
      onClick: () => onNavigate('admin-dashboard'),
    },
    {
      title: 'Reportes de Apadrinamiento',
      description: 'Análisis del programa de apadrinamiento',
      icon: BarChart3,
      color: 'from-teal-400 to-teal-500',
      permission: 'ninos',
      onClick: () => onNavigate('sponsorship-reports'),
    },
    {
      title: 'Reportes de Donaciones',
      description: 'Análisis financiero de donaciones',
      icon: PieChart,
      color: 'from-lime-400 to-lime-500',
      permission: 'ninos',
      onClick: () => onNavigate('donation-reports'),
    },
  ];

  const hasPermission = (permission: string) => {
    return permissions.includes(permission);
  };

  const allowedModules = modules.filter(m => hasPermission(m.permission));
  const restrictedModules = modules.filter(m => !hasPermission(m.permission));

  const tasks = [
    { title: 'Actualizar bitácora de María Camila', priority: 'high', dueDate: 'Hoy' },
    { title: 'Revisar solicitud de apadrinamiento', priority: 'medium', dueDate: 'Mañana' },
    { title: 'Preparar informe mensual', priority: 'medium', dueDate: '3 días' },
    { title: 'Confirmar asistencia evento', priority: 'low', dueDate: '1 semana' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Panel de Administrador</h1>
        <p className="text-gray-600">
          Bienvenido, <strong>{user?.nombre}</strong>. Gestiona tus módulos asignados.
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

      {/* Modules Section */}
      <div className="mb-8">
        <h2 className="text-gray-900 mb-6">Módulos Disponibles</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {allowedModules.map((module, index) => (
            <Card 
              key={index}
              className="hover:shadow-lg transition-all cursor-pointer group border-2 border-transparent hover:border-green-200"
              onClick={module.onClick}
            >
              <CardContent className="p-6">
                <div className={`w-14 h-14 bg-gradient-to-br ${module.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <module.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                  {module.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{module.description}</p>
                <div className="flex items-center text-sm text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Abrir</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {restrictedModules.length > 0 && (
          <>
            <h3 className="text-gray-700 mb-4 text-sm">Módulos Restringidos</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {restrictedModules.map((module, index) => (
                <Card 
                  key={index}
                  className="opacity-60 cursor-not-allowed"
                >
                  <CardContent className="p-6">
                    <div className="relative">
                      <div className={`w-14 h-14 bg-gradient-to-br ${module.color} rounded-xl flex items-center justify-center mb-4 grayscale`}>
                        <module.icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="absolute top-0 right-0">
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <h3 className="text-gray-500 mb-2">{module.title}</h3>
                    <p className="text-sm text-gray-400 mb-4">{module.description}</p>
                    <div className="flex items-center text-xs text-gray-400">
                      <Lock className="w-3 h-3 mr-1" />
                      <span>Sin permisos</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Tasks */}
      <div>
        <h2 className="text-gray-900 mb-6">Tareas Pendientes</h2>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {tasks.map((task, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                    <div>
                      <p className="text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-500">Vence: {task.dueDate}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                  </span>
                </div>
              ))}
            </div>
            <Button 
              variant="ghost" 
              className="w-full mt-4 text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={() => {}}
            >
              Ver Todas las Tareas
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

