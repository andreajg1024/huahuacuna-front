import { Heart, MapPin, User } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Child } from '../../contexts/SponsorshipContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface ChildCardProps {
  child: Child;
  variant?: 'grid' | 'list' | 'compact';
  onViewProfile: (childId: string) => void;
  onSponsor: (childId: string) => void;
}

export function ChildCard({ child, variant = 'grid', onViewProfile, onSponsor }: ChildCardProps) {
  if (variant === 'list') {
    return (
      <Card className="hover:shadow-lg transition-all">
        <CardContent className="p-6">
          <div className="flex gap-6">
            <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
              <ImageWithFallback
                src={child.foto}
                alt={child.nombre}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-gray-900 mb-2">{child.nombre}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {child.edad} años
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {child.municipio}
                    </span>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800">
                    {child.grado}
                  </Badge>
                </div>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-2">{child.descripcionBreve}</p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => onViewProfile(child.id)}
                  className="border-gray-300"
                >
                  Ver Perfil
                </Button>
                <Button
                  onClick={() => onSponsor(child.id)}
                  className="bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Apadrinar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid variant (default)
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardContent className="p-0">
        <div className="relative aspect-square overflow-hidden">
          <ImageWithFallback
            src={child.foto}
            alt={child.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3">
            <Badge className="bg-white/90 text-gray-900 backdrop-blur-sm">
              {child.grado}
            </Badge>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-gray-900 mb-2">{child.nombre}</h3>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {child.edad} años
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {child.municipio}
            </span>
          </div>

          <p className="text-gray-600 mb-6 line-clamp-3 min-h-[4.5rem]">
            {child.descripcionBreve}
          </p>

          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={() => onViewProfile(child.id)}
              className="w-full border-gray-300"
            >
              Ver Perfil
            </Button>
            <Button
              onClick={() => onSponsor(child.id)}
              className="w-full bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white"
            >
              <Heart className="w-4 h-4 mr-2 fill-white" />
              Apadrinar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

