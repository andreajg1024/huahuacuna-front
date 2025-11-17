import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Badge } from '../ui/badge';
import { 
  Plus, Search, Filter, MoreVertical, Edit, Copy, 
  Archive, Trash2, Grid3x3, List, Users, Calendar,
  FolderOpen, CheckCircle2, Clock, LayoutGrid, ArrowLeft, Home
} from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';
import { useProjects, type Project, type ProjectStatus } from '../../contexts/ProjectsContext';
import { ProjectCard } from './ProjectCard';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import { ProjectFormPage } from './ProjectFormPage';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type ViewMode = 'grid' | 'list';

interface ProjectManagementPageProps {
  onNavigate?: (page: string) => void;
}

export const ProjectManagementPage: React.FC<ProjectManagementPageProps> = ({ onNavigate }) => {
  const { projects, deleteProject, duplicateProject, updateProject } = useProjects();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState<'all' | ProjectStatus>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<'created' | 'start' | 'title' | 'volunteers'>('created');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [projectToArchive, setProjectToArchive] = useState<{ id: string; isArchived: boolean } | null>(null);

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => {
      // Tab filter
      if (currentTab !== 'all' && project.status !== currentTab) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          project.title.toLowerCase().includes(query) ||
          project.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'start':
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'volunteers':
          return b.volunteersRegistered - a.volunteersRegistered;
        default:
          return 0;
      }
    });

  // Stats
  const stats = {
    total: projects.length,
    activos: projects.filter(p => p.status === 'activo').length,
    borradores: projects.filter(p => p.status === 'borrador').length,
    finalizados: projects.filter(p => p.status === 'finalizado').length,
    archivados: projects.filter(p => p.status === 'archivado').length,
    totalVolunteers: projects.reduce((sum, p) => sum + p.volunteersRegistered, 0),
    proximosIniciar: projects.filter(p => {
      const startDate = new Date(p.startDate);
      const today = new Date();
      const diff = startDate.getTime() - today.getTime();
      const days = diff / (1000 * 60 * 60 * 24);
      return days > 0 && days <= 30;
    }).length
  };

  const handleEdit = (projectId: string) => {
    setEditingProjectId(projectId);
  };

  const handleDuplicate = (projectId: string) => {
    duplicateProject(projectId);
    toast.success('Proyecto duplicado exitosamente');
  };

  const handleArchiveClick = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setProjectToArchive({ 
        id: projectId, 
        isArchived: project.status === 'archivado' 
      });
      setArchiveDialogOpen(true);
    }
  };

  const handleArchiveConfirm = () => {
    if (projectToArchive) {
      const newStatus = projectToArchive.isArchived ? 'borrador' : 'archivado';
      updateProject(projectToArchive.id, { status: newStatus });
      toast.success(projectToArchive.isArchived ? 'Proyecto desarchivado' : 'Proyecto archivado');
      setArchiveDialogOpen(false);
      setProjectToArchive(null);
    }
  };

  const handleDeleteClick = (projectId: string) => {
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete);
      toast.success('Proyecto eliminado');
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleViewDetails = (project: Project) => {
    // Navigate to project detail page
    toast.info('Vista de detalles - en desarrollo');
  };

  if (showCreateForm) {
    return (
      <ProjectFormPage 
        onClose={() => setShowCreateForm(false)}
        onSave={() => setShowCreateForm(false)}
      />
    );
  }

  if (editingProjectId) {
    return (
      <ProjectFormPage 
        projectId={editingProjectId}
        onClose={() => setEditingProjectId(null)}
        onSave={() => setEditingProjectId(null)}
      />
    );
  }

  return (
    <div className="p-6">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <button 
                  onClick={() => onNavigate?.('dashboard')}
                  className="flex items-center gap-1 hover:text-amber-600 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Dashboard
                </button>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Gestión de Proyectos</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl mb-2">Gestión de Proyectos</h1>
          <p className="text-gray-600">Administra y supervisa todos los proyectos de la fundación</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="bg-[#F4B223] hover:bg-[#E5A820] text-gray-900">
          <Plus className="w-4 h-4 mr-2" />
          Crear Nuevo Proyecto
        </Button>
      </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Proyectos</p>
                  <p className="text-2xl mt-1">{stats.total}</p>
                </div>
                <FolderOpen className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Activos</p>
                  <p className="text-2xl mt-1">{stats.activos}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Voluntarios Totales</p>
                  <p className="text-2xl mt-1">{stats.totalVolunteers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Próximos a Iniciar</p>
                  <p className="text-2xl mt-1">{stats.proximosIniciar}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar proyectos por título o tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Ordenar por..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created">Más recientes</SelectItem>
              <SelectItem value="start">Fecha de inicio</SelectItem>
              <SelectItem value="title">Alfabético</SelectItem>
              <SelectItem value="volunteers">Más voluntarios</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={currentTab} onValueChange={(value: any) => setCurrentTab(value)}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">
              Todos ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="borrador">
              Borradores ({stats.borradores})
            </TabsTrigger>
            <TabsTrigger value="activo">
              Activos ({stats.activos})
            </TabsTrigger>
            <TabsTrigger value="finalizado">
              Finalizados ({stats.finalizados})
            </TabsTrigger>
            <TabsTrigger value="archivado">
              Archivados ({stats.archivados})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={currentTab} className="mt-0">
            {filteredProjects.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FolderOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl mb-2">
                    {searchQuery ? 'No se encontraron proyectos' : 'Aún no hay proyectos'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery 
                      ? 'Intenta con otros términos de búsqueda'
                      : 'Crea tu primer proyecto para comenzar'
                    }
                  </p>
                  {searchQuery ? (
                    <Button variant="outline" onClick={() => setSearchQuery('')}>
                      Limpiar búsqueda
                    </Button>
                  ) : (
                    <Button onClick={() => setShowCreateForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Primer Proyecto
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onViewDetails={handleViewDetails}
                    onEdit={handleEdit}
                    showAdminActions
                    variant="grid"
                  />
                ))}
              </div>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Imagen</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha Inicio</TableHead>
                      <TableHead>Fecha Fin</TableHead>
                      <TableHead className="text-center">Beneficiarios</TableHead>
                      <TableHead className="text-center">Voluntarios</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjects.map(project => (
                      <TableRow key={project.id}>
                        <TableCell>
                          <ImageWithFallback
                            src={project.mainImage}
                            alt={project.title}
                            className="w-20 h-14 object-cover rounded"
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="line-clamp-1">{project.title}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {project.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <ProjectStatusBadge status={project.status} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(project.startDate).toLocaleDateString('es-CO', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(project.endDate).toLocaleDateString('es-CO', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {project.beneficiaries.count}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <span>
                              {project.volunteersRegistered}
                              {project.volunteersNeeded ? ` / ${project.volunteersNeeded}` : ''}
                            </span>
                            {project.volunteersRegistered > 0 && (
                              <Button 
                                variant="link" 
                                size="sm" 
                                className="h-auto p-0 text-xs"
                                onClick={() => toast.info('Ver voluntarios - en desarrollo')}
                              >
                                Ver voluntarios
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(project.id)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicate(project.id)}>
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleArchiveClick(project.id)}>
                                <Archive className="w-4 h-4 mr-2" />
                                {project.status === 'archivado' ? 'Desarchivar' : 'Archivar'}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteClick(project.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Archive Dialog */}
        <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {projectToArchive?.isArchived ? '¿Desarchivar proyecto?' : '¿Archivar proyecto?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {projectToArchive?.isArchived
                  ? 'El proyecto volverá a estar disponible en la gestión.'
                  : 'El proyecto se ocultará de la vista pública, pero podrás recuperarlo después.'
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleArchiveConfirm}>
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar proyecto permanentemente?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El proyecto y todos los voluntarios registrados serán eliminados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </div>
  );
};
