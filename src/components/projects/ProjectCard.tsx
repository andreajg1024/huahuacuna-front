import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Calendar, MapPin, Users, Tag } from 'lucide-react';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import type { Project } from '../../contexts/ProjectsContext';

interface ProjectCardProps {
  project: Project;
  onViewDetails: (project: Project) => void;
  onVolunteer?: (project: Project) => void;
  variant?: 'grid' | 'list' | 'featured';
  showAdminActions?: boolean;
  onEdit?: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onViewDetails,
  onVolunteer,
  variant = 'grid',
  showAdminActions = false,
  onEdit
}) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CO', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDuration = () => {
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    return months > 0 ? `${months} ${months === 1 ? 'mes' : 'meses'}` : `${days} días`;
  };

  const volunteersProgress = project.volunteersNeeded 
    ? (project.volunteersRegistered / project.volunteersNeeded) * 100 
    : 0;

  if (variant === 'list') {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-64 h-48 md:h-auto relative">
            <ImageWithFallback
              src={project.mainImage}
              alt={project.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3">
              <ProjectStatusBadge status={project.status} />
            </div>
          </div>
          <div className="flex-1 p-6">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl mb-2 line-clamp-1">{project.title}</h3>
              {showAdminActions && onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(project)}>
                  Editar
                </Button>
              )}
            </div>
            <p className="text-gray-600 mb-4 line-clamp-2">{project.shortDescription}</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                {formatDate(project.startDate)} - {formatDate(project.endDate)}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2" />
                {project.beneficiaries.count} beneficiarios
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                {project.location.join(', ')}
              </div>
              {project.needsVolunteers && (
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  {project.volunteersRegistered} / {project.volunteersNeeded} voluntarios
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {project.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onViewDetails(project)}>
                  Ver Detalles
                </Button>
                {project.needsVolunteers && onVolunteer && (
                  <Button onClick={() => onVolunteer(project)}>
                    Ser Voluntario
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02] h-full flex flex-col">
      <div className="relative h-48 overflow-hidden group">
        <ImageWithFallback
          src={project.mainImage}
          alt={project.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-110"
        />
        <div className="absolute top-3 right-3">
          <ProjectStatusBadge status={project.status} />
        </div>
      </div>

      <CardHeader className="flex-none">
        <h3 
          className="text-xl mb-2 line-clamp-2 cursor-pointer hover:text-[#F4B223]" 
          onClick={() => onViewDetails(project)}
        >
          {project.title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-3">{project.shortDescription}</p>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-2 flex-shrink-0" />
            {project.beneficiaries.count} beneficiarios
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{project.location.join(', ')}</span>
          </div>
        </div>

        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {project.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {project.needsVolunteers && project.volunteersNeeded && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Voluntarios</span>
              <span className="text-gray-900">
                {project.volunteersRegistered} / {project.volunteersNeeded}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#4A9D5F] h-2 rounded-full transition-all"
                style={{ width: `${Math.min(volunteersProgress, 100)}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex-none flex flex-col gap-2">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => onViewDetails(project)}
        >
          Ver Detalles
        </Button>
        {project.needsVolunteers && onVolunteer && (
          <Button 
            className="w-full bg-[#F4B223] hover:bg-[#E5A820] text-gray-900" 
            onClick={() => onVolunteer(project)}
          >
            Ser Voluntario
          </Button>
        )}
        {showAdminActions && onEdit && (
          <Button 
            variant="secondary" 
            className="w-full" 
            onClick={() => onEdit(project)}
          >
            Editar Proyecto
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
