import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Heart, Loader2, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { authService } from '@/services/auth.service';

interface VerifyEmailPageProps {
  onNavigate: (page: string) => void;
  token?: string;
}

export function VerifyEmailPage({ onNavigate, token }: VerifyEmailPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      // Obtener token desde URL si no se pasó como prop
      const urlParams = new URLSearchParams(window.location.search);
      const emailToken = token || urlParams.get('token');

      if (!emailToken) {
        setError('Token de verificación no encontrado');
        setIsLoading(false);
        return;
      }

      try {
        const response = await authService.verifyEmail({ token: emailToken });
        
        if (response.success) {
          setIsSuccess(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al verificar el email');
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-amber-50 to-emerald-50">
      <div className="max-w-lg w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <div className="text-2xl text-gray-900" style={{ fontWeight: 700 }}>
              Huahuacuna
            </div>
          </button>
        </div>

        <Card>
          <CardContent className="p-12 text-center">
            {isLoading ? (
              <>
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                </div>
                <h2 className="text-gray-900 mb-4">Verificando Email</h2>
                <p className="text-gray-600">
                  Por favor espera mientras verificamos tu correo electrónico...
                </p>
              </>
            ) : isSuccess ? (
              <>
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-gray-900 mb-4">¡Email Verificado!</h2>
                <p className="text-gray-600 mb-8">
                  Tu correo electrónico ha sido verificado exitosamente. 
                  Ahora puedes iniciar sesión con tu cuenta.
                </p>
                <Button
                  onClick={() => onNavigate('login')}
                  className="bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white"
                >
                  Ir a Iniciar Sesión
                </Button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <XCircle className="w-12 h-12 text-red-600" />
                </div>
                <h2 className="text-gray-900 mb-4">Error de Verificación</h2>
                <p className="text-gray-600 mb-8">
                  {error}
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={() => onNavigate('register')}
                    className="w-full bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white"
                  >
                    Registrarse Nuevamente
                  </Button>
                  <Button
                    onClick={() => onNavigate('login')}
                    variant="outline"
                    className="w-full"
                  >
                    Ir a Iniciar Sesión
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        {!isLoading && !isSuccess && (
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-blue-900 mb-2" style={{ fontWeight: 600 }}>
                    ¿Necesitas Ayuda?
                  </h4>
                  <p className="text-sm text-blue-800">
                    Si el token ha expirado, puedes registrarte nuevamente o 
                    contactar a soporte en{' '}
                    <a href="mailto:soporte@huahuacuna.org" className="underline">
                      soporte@huahuacuna.org
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
