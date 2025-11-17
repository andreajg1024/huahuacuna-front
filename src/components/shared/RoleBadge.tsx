import { Badge } from '../ui/badge';
import { UserRole } from '../../contexts/AuthContext';
import { Shield, UserCog, Heart } from 'lucide-react';

interface RoleBadgeProps {
  role: UserRole;
  showIcon?: boolean;
}

export function RoleBadge({ role, showIcon = true }: RoleBadgeProps) {
  const roleConfig = {
    super_admin: {
      label: 'Super Admin',
      className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      icon: Shield,
    },
    admin: {
      label: 'Admin',
      className: 'bg-green-100 text-green-800 hover:bg-green-200',
      icon: UserCog,
    },
    padrino: {
      label: 'Padrino',
      className: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
      icon: Heart,
    },
  };

  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <Badge className={config.className}>
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {config.label}
    </Badge>
  );
}

