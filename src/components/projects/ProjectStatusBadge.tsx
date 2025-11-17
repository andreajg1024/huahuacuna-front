import React from 'react';
import { Badge } from '../ui/badge';
import { CheckCircle2, Clock, Archive, FileText } from 'lucide-react';
import type { ProjectStatus } from '../../contexts/ProjectsContext';

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

export const ProjectStatusBadge: React.FC<ProjectStatusBadgeProps> = ({ status, className }) => {
  const statusConfig = {
    borrador: {
      label: 'Borrador',
      variant: 'secondary' as const,
      icon: FileText,
      className: 'bg-gray-100 text-gray-700 border-gray-300'
    },
    activo: {
      label: 'Activo',
      variant: 'default' as const,
      icon: Clock,
      className: 'bg-green-100 text-green-700 border-green-300'
    },
    finalizado: {
      label: 'Finalizado',
      variant: 'secondary' as const,
      icon: CheckCircle2,
      className: 'bg-blue-100 text-blue-700 border-blue-300'
    },
    archivado: {
      label: 'Archivado',
      variant: 'outline' as const,
      icon: Archive,
      className: 'bg-gray-50 text-gray-600 border-gray-400'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`${config.className} ${className || ''}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
};

