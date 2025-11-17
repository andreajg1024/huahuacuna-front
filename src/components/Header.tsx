import { useState } from 'react';
import { Menu, X, UserCircle, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface HeaderProps {
  onNavigate: (section: string) => void;
  currentSection: string;
}

// Header es la barra superior del sitio público (landing):
// - Muestra el logo principal (logo.png) y el nombre de la fundación.
// - Controla la navegación entre secciones públicas usando onNavigate.
// - Tiene versión desktop con menú "Más" y un menú colapsable para móviles.
export function Header({ onNavigate, currentSection }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const primaryLinks = [
    { id: 'nosotros', label: 'Nosotros' },
    { id: 'programas', label: 'Programas' },
    { id: 'impacto', label: 'Impacto' },
  ];

  const moreLinks = [
    { id: 'proyectos', label: 'Proyectos' },
    { id: 'voluntariado', label: 'Voluntariado' },
    { id: 'noticias', label: 'Noticias' },
    { id: 'eventos', label: 'Eventos' },
    { id: 'contacto', label: 'Contacto' },
  ];

  const allNavLinks = [...primaryLinks, ...moreLinks];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Name */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            {/* Logo cuadrado corregido */}
            <div className="w-12 h-12 flex items-center justify-center !rounded-none">
              <img
                src="/logo.png"
                alt="Fundación Huahuacuna"
                className="w-full h-full object-contain !rounded-none"
                style={{ borderRadius: 0 }}
              />
            </div>

            <div className="hidden sm:block">
              <div className="text-gray-900" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                Fundación Huahuacuna
              </div>
            </div>
          </button>

          {/* Desktop Navigation - Compact */}
          <nav className="hidden lg:flex items-center gap-6">
            {primaryLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`text-sm transition-colors whitespace-nowrap ${
                  currentSection === link.id
                    ? 'text-amber-600 font-medium'
                    : 'text-gray-700 hover:text-amber-600'
                }`}
              >
                {link.label}
              </button>
            ))}

            {/* More Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-sm text-gray-700 hover:text-amber-600 transition-colors flex items-center gap-1">
                  Más
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {moreLinks.map((link) => (
                  <DropdownMenuItem
                    key={link.id}
                    onClick={() => onNavigate(link.id)}
                    className={`cursor-pointer ${
                      currentSection === link.id ? 'bg-amber-50 text-amber-600' : ''
                    }`}
                  >
                    {link.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* CTA Buttons - Desktop */}
          <div className="hidden lg:flex items-center gap-2">
            <Button
              onClick={() => onNavigate('donaciones')}
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              Donar
            </Button>
            <Button
              onClick={() => onNavigate('apadrinar')}
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Apadrinar
            </Button>
            <Button
              onClick={() => onNavigate('login')}
              size="sm"
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <UserCircle className="w-4 h-4 mr-2" />
              Iniciar Sesión
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700 hover:text-amber-600"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-3">
            {allNavLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left py-2 transition-colors ${
                  currentSection === link.id ? 'text-amber-600 font-medium' : 'text-gray-700'
                }`}
              >
                {link.label}
              </button>
            ))}
            <div className="pt-4 space-y-3 border-t border-gray-200">
              <Button
                onClick={() => {
                  onNavigate('donaciones');
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
              >
                Donar
              </Button>
              <Button
                onClick={() => {
                  onNavigate('apadrinar');
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Apadrinar
              </Button>
              <Button
                onClick={() => {
                  onNavigate('login');
                  setMobileMenuOpen(false);
                }}
                variant="outline"
                className="w-full border-gray-300 text-gray-700"
              >
                <UserCircle className="w-4 h-4 mr-2" />
                Iniciar Sesión
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
