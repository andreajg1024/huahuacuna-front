import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Search, Filter, X, Users, FolderOpen, Heart,
  Calendar, MapPin, Tag
} from 'lucide-react';
import { useProjects, type Project } from '../../contexts/ProjectsContext';
import { ProjectCard } from './ProjectCard';
import { ProjectDetailPage } from './ProjectDetailPage';
import { VolunteerRegistrationForm } from './VolunteerRegistrationForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type StatusFilter = 'all' | 'activo' | 'finalizado';

export const PublicProjectsPage: React.FC = () => {
  const { getPublishedProjects } = useProjects();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'starting' | 'alphabetical'>('recent');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [volunteerProject, setVolunteerProject] = useState<Project | null>(null);

  const publishedProjects = getPublishedProjects();

  // Get all unique tags
  const allTags = Array.from(
    new Set(publishedProjects.flatMap(p => p.tags))
  ).sort();

  // Filter and sort projects
  const filteredProjects = publishedProjects
    .filter(project => {
      // Status filter
      if (statusFilter !== 'all' && project.status !== statusFilter) {
        return false;
      }

      // Tag filter
      if (tagFilter !== 'all' && !project.tags.includes(tagFilter)) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          project.title.toLowerCase().includes(query) ||
          project.shortDescription.toLowerCase().includes(query) ||
          project.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'starting':
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  // Stats
  const stats = {
    active: publishedProjects.filter(p => p.status === 'activo').length,
    beneficiaries: publishedProjects.reduce((sum, p) => sum + p.beneficiaries.count, 0),
    volunteers: publishedProjects.reduce((sum, p) => sum + p.volunteersRegistered, 0)
  };

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project);
  };

  const handleVolunteer = (project: Project) => {
    setVolunteerProject(project);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTagFilter('all');
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || tagFilter !== 'all';

  if (selectedProject) {
    return (
      <ProjectDetailPage 
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onVolunteer={(project) => {
          setSelectedProject(null);
          setVolunteerProject(project);
        }}
      />
    );
  }

  if (volunteerProject) {
    return (
      <VolunteerRegistrationForm
        project={volunteerProject}
        onClose={() => setVolunteerProject(null)}
        onSuccess={() => setVolunteerProject(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div 
        className="relative bg-gradient-to-r from-[#4A9D5F] to-[#2B7A45] text-white py-20"
        style={{
          backgroundImage: `linear-gradient(rgba(74, 157, 95, 0.9), rgba(43, 122, 69, 0.9)), url('https://images.unsplash.com/photo-1643214410415-de1976ad74ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMHZvbHVudGVlcmluZyUyMGNvbW11bml0eXxlbnwxfHx8fDE3NjE2MjcyMzl8MA&ixlib=rb-4.1.0&q=80&w=1080')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl mb-4">Nuestros Proyectos</h1>
            <p className="text-xl text-gray-100 max-w-2xl mx-auto">
              Conoce las iniciativas que transforman vidas en Armenia y el Quindío
            </p>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="p-6 text-center">
                  <FolderOpen className="w-8 h-8 mx-auto mb-2 text-[#F4B223]" />
                  <p className="text-3xl mb-1">{stats.active}</p>
                  <p className="text-sm text-gray-100">Proyectos Activos</p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-[#F4B223]" />
                  <p className="text-3xl mb-1">{stats.beneficiaries}</p>
                  <p className="text-sm text-gray-100">Beneficiarios Alcanzados</p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="p-6 text-center">
                  <Heart className="w-8 h-8 mx-auto mb-2 text-[#F4B223]" />
                  <p className="text-3xl mb-1">{stats.volunteers}</p>
                  <p className="text-sm text-gray-100">Voluntarios Involucrados</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar proyectos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <div>
              <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="activo">Activos</SelectItem>
                  <SelectItem value="finalizado">Finalizados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Más recientes</SelectItem>
                  <SelectItem value="starting">Próximos a iniciar</SelectItem>
                  <SelectItem value="alphabetical">Alfabético</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tag Filter Pills */}
          {allTags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600">Categorías:</span>
              <Button
                variant={tagFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTagFilter('all')}
              >
                Todas
              </Button>
              {allTags.map(tag => (
                <Button
                  key={tag}
                  variant={tagFilter === tag ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTagFilter(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          )}

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">Filtros activos:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Búsqueda: "{searchQuery}"
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => setSearchQuery('')}
                  />
                </Badge>
              )}
              {statusFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Estado: {statusFilter}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => setStatusFilter('all')}
                  />
                </Badge>
              )}
              {tagFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Tag: {tagFilter}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => setTagFilter('all')}
                  />
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            </div>
          )}

          {/* Results Counter */}
          <div className="mt-4 text-sm text-gray-600">
            Mostrando {filteredProjects.length} {filteredProjects.length === 1 ? 'proyecto' : 'proyectos'}
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FolderOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl mb-2">
                {hasActiveFilters 
                  ? 'No encontramos proyectos con esos criterios'
                  : 'Próximamente publicaremos nuevos proyectos'
                }
              </h3>
              <p className="text-gray-600 mb-6">
                {hasActiveFilters 
                  ? 'Intenta ajustar tus filtros o limpiarlos para ver todos los proyectos disponibles'
                  : 'Mientras tanto, conoce otras formas de ayudar a la fundación'
                }
              </p>
              {hasActiveFilters ? (
                <Button onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              ) : (
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => window.location.href = '/#apadrinar'}>
                    Apadrinar un Niño
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = '/#donar'}>
                    Hacer una Donación
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onViewDetails={handleViewDetails}
                onVolunteer={handleVolunteer}
                variant="grid"
              />
            ))}
          </div>
        )}

        {/* CTA Section */}
        {filteredProjects.length > 0 && (
          <div className="mt-16 bg-gradient-to-r from-[#F4B223] to-[#E5A820] rounded-lg p-12 text-center">
            <h2 className="text-3xl text-gray-900 mb-4">
              ¿Listo para marcar la diferencia?
            </h2>
            <p className="text-lg text-gray-800 mb-6 max-w-2xl mx-auto">
              Únete a nuestra comunidad de voluntarios y ayúdanos a transformar vidas
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg" 
                variant="outline"
                className="bg-white hover:bg-gray-50"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Ver Todos los Proyectos
              </Button>
              <Button 
                size="lg"
                className="bg-[#4A9D5F] hover:bg-[#3D8A50] text-white"
                onClick={() => window.location.href = '/#contacto'}
              >
                Contáctanos
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

