import { useState } from 'react';
import { Heart, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import { useSponsorship } from '../../contexts/SponsorshipContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner';

interface SponsorshipConfirmationModalProps {
  childId: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function SponsorshipConfirmationModal({ 
  childId, 
  onClose, 
  onConfirm 
}: SponsorshipConfirmationModalProps) {
  const { getChildById, sponsorChild } = useSponsorship();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const child = getChildById(childId);

  if (!child) return null;

  const handleConfirm = async () => {
    if (!acceptTerms) {
      toast.error('Debes aceptar los términos del apadrinamiento');
      return;
    }

    setIsLoading(true);

    try {
      await sponsorChild(childId);
      setShowSuccess(true);
      
      // Auto close after 5 seconds
      setTimeout(() => {
        onConfirm();
      }, 5000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al confirmar apadrinamiento');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  // Success Screen
  if (showSuccess) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogTitle className="sr-only">Apadrinamiento Exitoso</DialogTitle>
          <DialogDescription className="sr-only">
            Confirmación de apadrinamiento de {child.nombre}
          </DialogDescription>
          <div className="text-center py-8">
            {/* Celebration Animation */}
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <CheckCircle className="w-16 h-16 text-white" />
              </div>
              <Sparkles className="w-8 h-8 text-amber-500 absolute top-0 right-1/3 animate-bounce" />
              <Sparkles className="w-6 h-6 text-emerald-500 absolute bottom-0 left-1/3 animate-bounce delay-100" />
            </div>

            <h2 className="text-gray-900 mb-4">¡Felicitaciones!</h2>
            <p className="text-lg text-gray-700 mb-2">
              Ahora apadrinas a <strong>{child.nombre}</strong>
            </p>
            <p className="text-gray-600 mb-8">
              Tu compromiso transformará su vida y le brindará un futuro lleno de oportunidades.
            </p>

            <Card className="bg-blue-50 border-blue-200 mb-8">
              <CardContent className="p-4">
                <p className="text-sm text-blue-800">
                  ✉️ Recibirás un email de confirmación con toda la información sobre el apadrinamiento 
                  y los próximos pasos.
                </p>
              </CardContent>
            </Card>

            <Button
              onClick={onConfirm}
              className="w-full bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white"
            >
              Ir a Mi Niño Apadrinado
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Confirmation Screen
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogTitle className="sr-only">Confirmación de Apadrinamiento</DialogTitle>
        <DialogDescription className="sr-only">
          Revisa y confirma el apadrinamiento de {child.nombre}
        </DialogDescription>
        <div className="py-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-gray-900 mb-2">
              ¿Estás seguro de que deseas apadrinar a {child.nombre}?
            </h2>
            <p className="text-gray-600">
              Este es un compromiso importante que transformará la vida de este niño
            </p>
          </div>

          {/* Child Summary Card */}
          <Card className="mb-8 overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row gap-6 p-6">
                <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
                  <ImageWithFallback
                    src={child.foto}
                    alt={child.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-gray-900 mb-3">{child.nombre}</h3>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <span className="text-sm">Edad:</span>
                      <span className="text-sm">{child.edad} años</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <span className="text-sm">Municipio:</span>
                      <span className="text-sm">{child.municipio}</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <span className="text-sm">Grado:</span>
                      <span className="text-sm">{child.grado}</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <span className="text-sm">Fecha de inicio:</span>
                      <span className="text-sm">{new Date().toLocaleDateString('es-CO')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Commitment Information */}
          <Card className="mb-6 bg-gradient-to-br from-amber-50 to-white border-amber-200">
            <CardContent className="p-6">
              <h4 className="text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-amber-600" />
                Al apadrinar te comprometes a:
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-700">
                    Apoyar económicamente el desarrollo integral del niño
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-700">
                    Mantener comunicación regular a través de nuestra plataforma
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-700">
                    Respetar los protocolos de comunicación y privacidad establecidos
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-700">
                    Recibir y revisar las actualizaciones mensuales sobre el progreso del niño
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-700">
                    Participar en eventos de la fundación cuando sea posible (opcional pero recomendado)
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Terms Acceptance */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg mb-6">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
              className="mt-0.5"
            />
            <Label htmlFor="terms" className="cursor-pointer leading-relaxed text-gray-700">
              He leído y acepto los{' '}
              <a href="#" className="text-amber-600 hover:text-amber-700 underline">
                términos y condiciones del apadrinamiento
              </a>
              {' '}y la{' '}
              <a href="#" className="text-amber-600 hover:text-amber-700 underline">
                política de privacidad
              </a>
              {' '}de la Fundación Huahuacuna.
            </Label>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!acceptTerms || isLoading}
              className="flex-1 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2 fill-white" />
                  Confirmar Apadrinamiento
                </>
              )}
            </Button>
          </div>

          {/* Additional Info */}
          <p className="text-sm text-gray-500 text-center mt-6">
            Al confirmar, recibirás un correo electrónico con los detalles del apadrinamiento 
            y acceso completo al perfil de {child.nombre}.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

