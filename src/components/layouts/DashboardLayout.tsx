import { ReactNode } from 'react';
import { Bell, LogOut, Settings, User, Heart, Menu, X } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useAuth } from '../../contexts/AuthContext';
import { UserAvatar } from '../shared/UserAvatar';
import { RoleBadge } from '../shared/RoleBadge';
import { useState } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
  onNavigate?: (page: string) => void;
}

export function DashboardLayout({ children, onNavigate }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    if (onNavigate) {
      onNavigate('home');
    }
  };

  if (!user) return null;

  const getRoleTheme = () => {
    switch (user.role) {
      case 'super_admin':
        return { primary: 'from-blue-500 to-blue-600', secondary: 'bg-blue-50', text: 'text-blue-600' };
      case 'admin':
        return { primary: 'from-green-500 to-green-600', secondary: 'bg-green-50', text: 'text-green-600' };
      case 'padrino':
        return { primary: 'from-amber-500 to-amber-600', secondary: 'bg-amber-50', text: 'text-amber-600' };
      default:
        return { primary: 'from-gray-500 to-gray-600', secondary: 'bg-gray-50', text: 'text-gray-600' };
    }
  };

  const theme = getRoleTheme();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo and Dashboard Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <button
                onClick={() => onNavigate?.('dashboard')}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${theme.primary} rounded-full flex items-center justify-center`}>
                  <Heart className="w-5 h-5 text-white fill-white" />
                </div>
                <div className="hidden sm:block">
                  <div className="text-gray-900" style={{ fontWeight: 700 }}>
                    Fundación Huahuacuna
                  </div>
                </div>
              </button>
            </div>

            {/* Right: Notifications and User Menu */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <UserAvatar name={user.nombre} photo={user.foto} size="sm" />
                    <div className="hidden md:block text-left">
                      <div className="text-sm text-gray-900" style={{ fontWeight: 600 }}>
                        {user.nombre}
                      </div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col gap-2">
                      <span>{user.nombre}</span>
                      <RoleBadge role={user.role} />
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onNavigate?.('profile')}>
                    <User className="w-4 h-4 mr-2" />
                    Mi Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Configuración
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="relative">
        {children}
      </main>
    </div>
  );
}

