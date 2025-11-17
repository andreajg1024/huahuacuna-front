import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface UserAvatarProps {
  name: string;
  photo?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  isOnline?: boolean;
}

export function UserAvatar({ 
  name, 
  photo, 
  size = 'md',
  showStatus = false,
  isOnline = false 
}: UserAvatarProps) {
  const getInitials = (fullName: string) => {
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16 text-lg',
  };

  const statusSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  return (
    <div className="relative inline-block">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={photo} alt={name} />
        <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-500 text-white">
          {photo ? <User className="w-1/2 h-1/2" /> : getInitials(name)}
        </AvatarFallback>
      </Avatar>
      {showStatus && (
        <span 
          className={`absolute bottom-0 right-0 ${statusSizes[size]} rounded-full border-2 border-white ${
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
      )}
    </div>
  );
}
