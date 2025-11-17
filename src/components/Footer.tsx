import { Heart, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

interface FooterProps {
  onNavigate: (section: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Foundation Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <div className="text-white" style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                Huahuacuna
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Sembrando futuro en la niñez vulnerable de Armenia, Quindío.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-amber-500 flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-amber-500 flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-amber-500 flex items-center justify-center transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('nosotros')} className="text-sm hover:text-amber-400 transition-colors">
                  Nosotros
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('programas')} className="text-sm hover:text-amber-400 transition-colors">
                  Programas
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('impacto')} className="text-sm hover:text-amber-400 transition-colors">
                  Impacto
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('eventos')} className="text-sm hover:text-amber-400 transition-colors">
                  Eventos
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contacto')} className="text-sm hover:text-amber-400 transition-colors">
                  Contacto
                </button>
              </li>
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h3 className="text-white mb-4">Nuestros Programas</h3>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-amber-400 transition-colors cursor-pointer">
                Apadrinamiento Integral
              </li>
              <li className="hover:text-amber-400 transition-colors cursor-pointer">
                Escuela de Música
              </li>
              <li className="hover:text-amber-400 transition-colors cursor-pointer">
                Escuela de Inglés
              </li>
              <li className="hover:text-amber-400 transition-colors cursor-pointer">
                Ropero y Moda Circular
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span>Armenia, Quindío, Colombia</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>+57 (6) 746 1234</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>info@huahuacuna.org</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400 text-center md:text-left">
              Hecho con <Heart className="w-4 h-4 inline text-red-500 fill-red-500" /> para la niñez vulnerable
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-amber-400 transition-colors">
                Política de Privacidad
              </a>
              <a href="#" className="hover:text-amber-400 transition-colors">
                Términos y Condiciones
              </a>
            </div>
          </div>
          <p className="text-sm text-gray-500 text-center mt-4">
            © {new Date().getFullYear()} Fundación Huahuacuna. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

