import { X, Heart, MapPin, User, Calendar, GraduationCap, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { useSponsorship } from '../../contexts/SponsorshipContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface ChildDetailModalProps {
  childId: string;
  onClose: () => void;
  onSponsor: (childId: string) => void;
}

export function ChildDetailModal({ childId, onClose, onSponsor }: ChildDetailModalProps) {
  const { getChildById } = useSponsorship();
  const child = getChildById(childId);

  if (!child) return null;

  const calculateAge = () => {
    const birth = new Date(child.fechaNacimiento);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    return { years, months: months < 0 ? 12 + months : months };
  };

  const age = calculateAge();

  const benefits = [
    'Educación completa (matrícula, útiles, uniformes)',
    'Atención en salud (médica, odontológica, nutricional)',
    'Vestido y calzado adecuados',
    'Implementos de aseo personal',
    'Actividades recreativas y culturales',
    'Acompañamiento psicosocial',
    'Desarrollo de habilidades y talentos',
  ];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogTitle className="sr-only">Perfil de {child.nombre}</DialogTitle>
        <DialogDescription className="sr-only">
          Información detallada sobre {child.nombre}, {child.edad} años, de {child.municipio}
        </DialogDescription>
        {/* Header with Photo */}
        <div className="relative">
          <div className="h-80 overflow-hidden">
            <ImageWithFallback
              src={child.foto}
              alt={child.nombre}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>

          <div className="absolute bottom-6 left-6 right-6 text-white">
            <h2 className="text-white mb-2">{child.nombre}</h2>
            <div className="flex flex-wrap items-center gap-4">
              <Badge className="bg-white/20 text-white backdrop-blur-sm border-white/30">
                <User className="w-3 h-3 mr-1" />
                {child.edad} años
              </Badge>
              <Badge className="bg-white/20 text-white backdrop-blur-sm border-white/30">
                <MapPin className="w-3 h-3 mr-1" />
                {child.municipio}
              </Badge>
              <Badge className="bg-white/20 text-white backdrop-blur-sm border-white/30">
                <GraduationCap className="w-3 h-3 mr-1" />
                {child.grado}
              </Badge>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="p-8">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="info">Información</TabsTrigger>
              <TabsTrigger value="historia">Historia</TabsTrigger>
              <TabsTrigger value="necesidades">Apadrinamiento</TabsTrigger>
            </TabsList>

            {/* Tab 1: Basic Information */}
            <TabsContent value="info" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-500">Edad Completa</Label>
                    <p className="text-gray-900">{age.years} años, {age.months} meses</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Fecha de Nacimiento</Label>
                    <p className="text-gray-900">
                      {new Date(child.fechaNacimiento).toLocaleDateString('es-CO', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Municipio de Residencia</Label>
                    <p className="text-gray-900">{child.municipio}, Quindío</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-500">Institución Educativa</Label>
                    <p className="text-gray-900">{child.institucion}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Escolaridad Actual</Label>
                    <p className="text-gray-900">{child.grado}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Género</Label>
                    <p className="text-gray-900 capitalize">{child.genero}</p>
                  </div>
                </div>
              </div>

              {/* Photo Gallery */}
              {child.fotos && child.fotos.length > 0 && (
                <div>
                  <Label className="text-gray-500 mb-3 block">Galería de Fotos</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {child.fotos.slice(0, 3).map((foto, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden">
                        <ImageWithFallback
                          src={foto}
                          alt={`${child.nombre} - Foto ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Tab 2: Story */}
            <TabsContent value="historia" className="space-y-6">
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {child.historia}
                </p>
              </div>

              {child.suenos && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <Star className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-amber-900 mb-2">Sus Sueños</h4>
                      <p className="text-amber-800">{child.suenos}</p>
                    </div>
                  </div>
                </div>
              )}

              {child.frase && (
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-6 rounded-lg border border-emerald-200">
                  <div className="flex items-start gap-3">
                    <div className="text-4xl text-emerald-600">"</div>
                    <div className="flex-1">
                      <p className="text-gray-700 italic mb-2">{child.frase}</p>
                      <p className="text-sm text-gray-600">— {child.nombre}</p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Tab 3: Sponsorship Needs */}
            <TabsContent value="necesidades" className="space-y-6">
              <div>
                <h4 className="text-gray-900 mb-4">Necesidades Específicas</h4>
                <div className="flex flex-wrap gap-2">
                  {child.necesidades.map((necesidad, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {necesidad}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-emerald-50 p-6 rounded-lg border border-amber-200">
                <h4 className="text-gray-900 mb-4">¿Qué Incluye el Apadrinamiento?</h4>
                <ul className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Heart className="w-3 h-3 text-white fill-white" />
                      </div>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                <h4 className="text-blue-900 mb-3">Impacto Esperado</h4>
                <p className="text-blue-800 mb-3">
                  Al apadrinar a {child.nombre}, estarás contribuyendo directamente a:
                </p>
                <ul className="space-y-2 text-blue-800">
                  <li>✓ Su desarrollo académico y permanencia en el sistema educativo</li>
                  <li>✓ Su bienestar físico y emocional</li>
                  <li>✓ La construcción de su proyecto de vida</li>
                  <li>✓ El fortalecimiento de sus capacidades y talentos</li>
                  <li>✓ Un futuro lleno de oportunidades</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer Actions */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Volver
            </Button>
            <Button
              onClick={() => onSponsor(child.id)}
              className="flex-1 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white"
            >
              <Heart className="w-4 h-4 mr-2 fill-white" />
              Apadrinar a {child.nombre}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <label className={`block text-sm ${className}`}>{children}</label>;
}

