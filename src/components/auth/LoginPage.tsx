import { useState } from 'react';
import { Eye, EyeOff, Heart, Loader2, Shield } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent } from '../ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { BackButton } from '../shared/BackButton';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const { login, failedAttempts, isBlocked, blockTimeRemaining } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCaptcha, setShowCaptcha] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      // Navigation will be handled by App.tsx based on user role
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
      if (failedAttempts >= 2) {
        setShowCaptcha(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <BackButton onBack={() => onNavigate('home')} />
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white fill-white" />
              </div>
              <div className="text-2xl text-gray-900" style={{ fontWeight: 700 }}>
                Huahuacuna
              </div>
            </div>
            <h1 className="text-gray-900 mb-2">Iniciar Sesión</h1>
            <p className="text-gray-600">
              Bienvenido de nuevo a nuestra comunidad
            </p>
          </div>

          {/* Demo Credentials */}
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-900 mb-2" style={{ fontWeight: 600 }}>
                    Credenciales de Prueba:
                  </p>
                  <div className="text-xs text-blue-800 space-y-1">
                    <p>Super Admin: admin@huahuacuna.org / Admin123</p>
                    <p>Admin: maria@huahuacuna.org / Admin123</p>
                    <p>Padrino: carlos@example.com / Padrino123</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Block Timer */}
          {isBlocked && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800 mb-2" style={{ fontWeight: 600 }}>
                Cuenta bloqueada temporalmente
              </p>
              <p className="text-sm text-orange-700">
                Tiempo restante: {formatTime(blockTimeRemaining)}
              </p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                disabled={isBlocked}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative mt-2">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isBlocked}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isBlocked}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {showCaptcha && failedAttempts >= 3 && (
              <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-2">Verificación requerida</p>
                <div className="h-20 bg-white border border-gray-300 rounded flex items-center justify-center">
                  <p className="text-sm text-gray-500">CAPTCHA simulado</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={isBlocked}
                />
                <Label 
                  htmlFor="remember" 
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  Recordarme
                </Label>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('password-recovery')}
                className="text-sm text-amber-600 hover:text-amber-700"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading || isBlocked}
              className="w-full bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => onNavigate('register')}
                className="text-amber-600 hover:text-amber-700"
                style={{ fontWeight: 600 }}
              >
                Regístrate como padrino
              </button>
            </p>
          </div>

          {/* Social Proof */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-gray-500">
              <Heart className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Únete a 542 padrinos que ya apoyan a un niño</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Image & Message */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-amber-500 to-emerald-500 p-12 items-center justify-center">
        <div className="max-w-lg text-white">
          <div className="relative rounded-2xl overflow-hidden mb-8 shadow-2xl">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1565373086464-c8af0d586c0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGNoaWxkcmVuJTIwbGVhcm5pbmd8ZW58MXx8fHwxNzYxNTUwNzAwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Children learning"
              className="w-full h-96 object-cover"
            />
          </div>
          <h2 className="text-3xl mb-4" style={{ fontWeight: 700 }}>
            Transformando Vidas Juntos
          </h2>
          <p className="text-lg opacity-90 mb-6">
            Tu compromiso hace la diferencia en la vida de niños y niñas del Quindío. 
            Juntos construimos un futuro lleno de oportunidades.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <p style={{ fontWeight: 600 }}>Educación de Calidad</p>
                <p className="text-sm opacity-80">Apoyo académico completo</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">❤️</span>
              </div>
              <div>
                <p style={{ fontWeight: 600 }}>Salud Integral</p>
                <p className="text-sm opacity-80">Atención médica y nutricional</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎨</span>
              </div>
              <div>
                <p style={{ fontWeight: 600 }}>Desarrollo Integral</p>
                <p className="text-sm opacity-80">Arte, música y recreación</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

