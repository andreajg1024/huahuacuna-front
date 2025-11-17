import { Badge } from '../ui/badge';
import { UserStatus } from '../../contexts/AuthContext';
import { CheckCircle, Clock, XCircle, Ban } from 'lucide-react';

interface StatusBadgeProps {
  status: UserStatus;
  showIcon?: boolean;
}

export function StatusBadge({ status, showIcon = true }: StatusBadgeProps) {
  const statusConfig = {
    active: {
      label: 'Activo',
      className: 'bg-green-100 text-green-800 hover:bg-green-200',
      icon: CheckCircle,
    },
    inactive: {
      label: 'Inactivo',
      className: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      icon: XCircle,
    },
    pending: {
      label: 'Pendiente',
      className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      icon: Clock,
    },
    blocked: {
      label: 'Bloqueado',
      className: 'bg-red-100 text-red-800 hover:bg-red-200',
      icon: Ban,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge className={config.className}>
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {config.label}
    </Badge>
  );
}
