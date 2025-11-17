import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Heart } from 'lucide-react';
import { useSponsorship } from '../../contexts/SponsorshipContext';
import { useAuth } from '../../contexts/AuthContext';
import { ChatInterface } from './ChatInterface';

interface MessagesPageProps {
  // Navegador de alto nivel del App (cambia currentPage en App.tsx)
  onNavigate: (page: string) => void;
}

/**
 * Centro de mensajes para el padrino.
 * - Si ya tiene un apadrinamiento activo, abre el chat con la coordinadora
 *   reutilizando el componente ChatInterface (modal a pantalla completa).
 * - Si aún no tiene niño apadrinado, muestra un CTA para ir al catálogo.
 */
export const MessagesPage: React.FC<MessagesPageProps> = ({ onNavigate }) => {
  const { mySponsoredChild, mySponsorship, children } = useSponsorship();
  const { user } = useAuth();

  // Si por alguna razón no hay usuario autenticado, regresamos al inicio de sesión
  if (!user) {
    onNavigate('login');
    return null;
  }

  // Sin niño apadrinado: mostramos un panel informativo
  if (!mySponsoredChild || !mySponsorship) {
    return (
      <div className="p-8">
        <Card className="max-w-2xl mx-auto bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-gray-900 mb-4">Aún no tienes mensajes</h1>
            <p className="text-gray-600 mb-6">
              Para activar el módulo de mensajes primero necesitas apadrinar a un niño.
              Actualmente hay {children.length} niños disponibles esperando un padrino.
            </p>
            <Button
              onClick={() => onNavigate('catalog')}
              className="bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white"
            >
              Ir al catálogo de niños
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Con apadrinamiento activo: abrimos el chat con la coordinadora
  return (
    <div className="p-4">
      <ChatInterface
        sponsorshipId={mySponsorship.id}
        childName={mySponsoredChild.nombre}
        onClose={() => onNavigate('dashboard')}
      />
    </div>
  );
};
