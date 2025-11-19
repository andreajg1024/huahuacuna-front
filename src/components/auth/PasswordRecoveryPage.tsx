import { useState, useEffect } from 'react';
import { Heart, Mail, Loader2, CheckCircle, ArrowLeft, Eye, EyeOff, XCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { authService } from '@/services/auth.service';

interface PasswordRecoveryPageProps {
  onNavigate: (page: string) => void;
  token?: string;
}

export function PasswordRecoveryPage({ onNavigate, token: propToken }: PasswordRecoveryPageProps) {
  const [step, setStep] = useState<'request' | 'sent' | 'reset' | 'success'>('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [tokenExpired, setTokenExpired] = useState(false);

  // Check for reset token in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = propToken || urlParams.get('token');
    
    if (resetToken) {
      setToken(resetToken);
      setStep('reset');
    }
  }, [propToken]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.requestPasswordReset({ email });
      
      if (response.success) {
        setStep('sent');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al solicitar recuperación');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string): { strength: number; label: string } => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 10;

    if (strength < 40) return { strength, label: 'Débil' };
    if (strength < 70) return { strength, label: 'Media' };
    return { strength, label: 'Fuerte' };
  };

  const validatePassword = () => {
    const errors = [];
    if (newPassword.length < 8) errors.push('mínimo 8 caracteres');
    if (!/[A-Z]/.test(newPassword)) errors.push('una mayúscula');
    if (!/[a-z]/.test(newPassword)) errors.push('una minúscula');
    if (!/[0-9]/.test(newPassword)) errors.push('un número');
    return errors;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const passwordErrors = validatePassword();
    if (passwordErrors.length > 0) {
      setError(`Contraseña inválida. Falta: ${passwordErrors.join(', ')}`);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!token) {
      setError('Token de verificación no encontrado');
      setTokenExpired(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.resetPassword({
        token,
        newPassword,
      });

      if (response.success) {
        setIsLoading(false);
        setStep('success');

        // Auto redirect to login after 3 seconds
        setTimeout(() => {
          onNavigate('login');
        }, 3000);
      }
    } catch (err) {
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'Error al restablecer contraseña';
      setError(errorMessage);
      
      // Si el error es por token expirado, marcarlo
      if (errorMessage.includes('expirado') || errorMessage.includes('inválido')) {
        setTokenExpired(true);
      }
    }
  };

  const passwordStrength = getPasswordStrength(newPassword);

  // Step 1: Request Reset
  if (step === 'request') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-amber-50 to-emerald-50">
        <Card className="max-w-md w-full">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white fill-white" />
                </div>
                <div className="text-2xl text-gray-900" style={{ fontWeight: 700 }}>
                  Huahuacuna
                </div>
              </div>
              <h2 className="text-gray-900 mb-2">Recuperar Contraseña</h2>
              <p className="text-gray-600">
                Ingresa tu email y te enviaremos un enlace de recuperación
              </p>
            </div>

            <form onSubmit={handleRequestReset} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div>
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Enlace de Recuperación'
                )}
              </Button>

              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver a Iniciar Sesión
              </button>
            </form>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 Si el email existe en nuestro sistema, recibirás un enlace de recuperación. 
                El enlace es válido por <strong>1 hora</strong>.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 2: Email Sent Confirmation
  if (step === 'sent') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-amber-50 to-emerald-50">
        <Card className="max-w-md w-full">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-gray-900 mb-4">Revisa tu Correo</h2>
            <p className="text-gray-600 mb-8">
              Si el correo <strong>{email}</strong> existe en nuestro sistema, 
              recibirás un enlace de recuperación en los próximos minutos.
            </p>
            
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
                <p className="text-sm text-blue-900 mb-2" style={{ fontWeight: 600 }}>
                  📧 Instrucciones:
                </p>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Revisa tu bandeja de entrada</li>
                  <li>También revisa la carpeta de spam</li>
                  <li>El enlace es válido por 1 hora</li>
                  <li>Haz clic en el enlace para restablecer tu contraseña</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Button
                onClick={() => setStep('request')}
                variant="outline"
                className="w-full"
              >
                Intentar con Otro Email
              </Button>
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver a Iniciar Sesión
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 3: Reset Password
  if (step === 'reset') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-amber-50 to-emerald-50">
        <Card className="max-w-md w-full">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white fill-white" />
                </div>
                <div className="text-2xl text-gray-900" style={{ fontWeight: 700 }}>
                  Huahuacuna
                </div>
              </div>
              <h2 className="text-gray-900 mb-2">Restablecer Contraseña</h2>
              <p className="text-gray-600">
                Crea una contraseña nueva y segura
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                  {tokenExpired && (
                    <Button
                      type="button"
                      onClick={() => setStep('request')}
                      variant="outline"
                      className="w-full mt-3 border-red-300 text-red-700 hover:bg-red-50"
                    >
                      Solicitar Nuevo Enlace
                    </Button>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <div className="relative mt-2">
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Fortaleza:</span>
                      <span className={`text-xs ${
                        passwordStrength.strength < 40 ? 'text-red-600' :
                        passwordStrength.strength < 70 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <Progress value={passwordStrength.strength} className="h-2" />
                  </div>
                )}

                <div className="mt-3 text-xs text-gray-600 space-y-1">
                  <p className="flex items-center gap-1">
                    {newPassword.length >= 8 ? (
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    ) : (
                      <XCircle className="w-3 h-3 text-gray-400" />
                    )}
                    Mínimo 8 caracteres
                  </p>
                  <p className="flex items-center gap-1">
                    {/[A-Z]/.test(newPassword) ? (
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    ) : (
                      <XCircle className="w-3 h-3 text-gray-400" />
                    )}
                    Al menos una mayúscula
                  </p>
                  <p className="flex items-center gap-1">
                    {/[a-z]/.test(newPassword) ? (
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    ) : (
                      <XCircle className="w-3 h-3 text-gray-400" />
                    )}
                    Al menos una minúscula
                  </p>
                  <p className="flex items-center gap-1">
                    {/[0-9]/.test(newPassword) ? (
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    ) : (
                      <XCircle className="w-3 h-3 text-gray-400" />
                    )}
                    Al menos un número
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                <div className="relative mt-2">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    Las contraseñas no coinciden
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading || tokenExpired}
                className="w-full bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Restableciendo...
                  </>
                ) : (
                  'Restablecer Contraseña'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 4: Success
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-amber-50 to-emerald-50">
      <Card className="max-w-md w-full">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-gray-900 mb-4">¡Contraseña Actualizada!</h2>
          <p className="text-gray-600 mb-8">
            Tu contraseña ha sido restablecida exitosamente. Serás redirigido al inicio de sesión 
            en unos momentos...
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Redirigiendo...</span>
          </div>
          <Button
            onClick={() => onNavigate('login')}
            variant="outline"
            className="mt-6"
          >
            Ir a Iniciar Sesión Ahora
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

