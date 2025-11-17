import { useState } from 'react';
import { Eye, EyeOff, Heart, Loader2, CheckCircle, XCircle, Shield } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { useAuth } from '../../contexts/AuthContext';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

export function RegisterPage({ onNavigate }: RegisterPageProps) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    documento: '',
    direccion: '',
    password: '',
    confirmPassword: '',
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (field: string) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field as keyof typeof formData]);
  };

  const validateField = (field: string, value: string) => {
    let error = '';

    switch (field) {
      case 'nombre':
        if (!value.trim()) error = 'El nombre es requerido';
        else if (value.trim().length < 3) error = 'El nombre debe tener al menos 3 caracteres';
        break;
      case 'email':
        if (!value) error = 'El email es requerido';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Email inválido';
        break;
      case 'telefono':
        if (!value) error = 'El teléfono es requerido';
        else if (!/^\+?57?\s?3\d{2}\s?\d{3}\s?\d{4}$/.test(value.replace(/\s/g, ''))) 
          error = 'Formato: +57 321 456 7890';
        break;
      case 'documento':
        if (!value) error = 'El documento es requerido';
        else if (value.length < 6) error = 'Documento debe tener al menos 6 caracteres';
        break;
      case 'direccion':
        if (!value.trim()) error = 'La dirección es requerida';
        break;
      case 'password':
        const passwordErrors = [];
        if (value.length < 8) passwordErrors.push('mínimo 8 caracteres');
        if (!/[A-Z]/.test(value)) passwordErrors.push('una mayúscula');
        if (!/[a-z]/.test(value)) passwordErrors.push('una minúscula');
        if (!/[0-9]/.test(value)) passwordErrors.push('un número');
        if (passwordErrors.length > 0) {
          error = `Falta: ${passwordErrors.join(', ')}`;
        }
        break;
      case 'confirmPassword':
        if (!value) error = 'Confirma tu contraseña';
        else if (value !== formData.password) error = 'Las contraseñas no coinciden';
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 10;

    if (strength < 40) return { strength, label: 'Débil', color: 'bg-red-500' };
    if (strength < 70) return { strength, label: 'Media', color: 'bg-yellow-500' };
    return { strength, label: 'Fuerte', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    let isValid = true;
    Object.keys(formData).forEach(field => {
      if (!validateField(field, formData[field as keyof typeof formData])) {
        isValid = false;
      }
    });

    if (!acceptTerms) {
      setErrors(prev => ({ ...prev, terms: 'Debes aceptar los términos y condiciones' }));
      isValid = false;
    }

    if (!isValid) return;

    setIsLoading(true);

    try {
      await register({
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        documento: formData.documento,
        direccion: formData.direccion,
        password: formData.password,
      });
      setSuccess(true);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Error al registrar' });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-amber-50 to-emerald-50">
        <Card className="max-w-lg w-full">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-gray-900 mb-4">¡Registro Exitoso!</h2>
            <p className="text-gray-600 mb-8">
              Hemos enviado un correo de confirmación a <strong>{formData.email}</strong>. 
              Por favor, revisa tu bandeja de entrada y sigue las instrucciones para activar tu cuenta.
            </p>
            <Button
              onClick={() => onNavigate('login')}
              className="bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white"
            >
              Ir a Iniciar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-emerald-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
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
          <h1 className="text-gray-900 mb-2">Conviértete en Padrino</h1>
          <p className="text-gray-600">
            Únete a nuestra comunidad y transforma la vida de un niño
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Side - Form */}
          <Card>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {errors.submit && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{errors.submit}</p>
                  </div>
                )}

                <div>
                  <Label htmlFor="nombre">
                    Nombre Completo <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    onBlur={() => handleBlur('nombre')}
                    placeholder="Juan Pérez García"
                    className="mt-2"
                  />
                  {touchedFields.nombre && errors.nombre && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      {errors.nombre}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">
                    Correo Electrónico <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur('email')}
                    placeholder="tu@email.com"
                    className="mt-2"
                  />
                  {touchedFields.email && errors.email && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="telefono">
                    Teléfono <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    onBlur={() => handleBlur('telefono')}
                    placeholder="+57 321 456 7890"
                    className="mt-2"
                  />
                  {touchedFields.telefono && errors.telefono && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      {errors.telefono}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="documento">
                    Documento de Identidad <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="documento"
                    name="documento"
                    value={formData.documento}
                    onChange={handleChange}
                    onBlur={() => handleBlur('documento')}
                    placeholder="Número de documento"
                    className="mt-2"
                  />
                  {touchedFields.documento && errors.documento && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      {errors.documento}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="direccion">
                    Dirección <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    onBlur={() => handleBlur('direccion')}
                    placeholder="Calle 123 #45-67, Ciudad, Departamento"
                    rows={3}
                    className="mt-2"
                  />
                  {touchedFields.direccion && errors.direccion && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      {errors.direccion}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password">
                    Contraseña <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={() => handleBlur('password')}
                      placeholder="••••••••"
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
                  
                  {formData.password && (
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

                  <div className="mt-2 text-xs text-gray-600 space-y-1">
                    <p className="flex items-center gap-1">
                      {formData.password.length >= 8 ? (
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      ) : (
                        <XCircle className="w-3 h-3 text-gray-400" />
                      )}
                      Mínimo 8 caracteres
                    </p>
                    <p className="flex items-center gap-1">
                      {/[A-Z]/.test(formData.password) ? (
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      ) : (
                        <XCircle className="w-3 h-3 text-gray-400" />
                      )}
                      Al menos una mayúscula
                    </p>
                    <p className="flex items-center gap-1">
                      {/[a-z]/.test(formData.password) ? (
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      ) : (
                        <XCircle className="w-3 h-3 text-gray-400" />
                      )}
                      Al menos una minúscula
                    </p>
                    <p className="flex items-center gap-1">
                      {/[0-9]/.test(formData.password) ? (
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      ) : (
                        <XCircle className="w-3 h-3 text-gray-400" />
                      )}
                      Al menos un número
                    </p>
                  </div>

                  {touchedFields.password && errors.password && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">
                    Confirmar Contraseña <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={() => handleBlur('confirmPassword')}
                      placeholder="••••••••"
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
                  {touchedFields.confirmPassword && errors.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => {
                        setAcceptTerms(checked as boolean);
                        if (errors.terms) setErrors(prev => ({ ...prev, terms: '' }));
                      }}
                    />
                    <Label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer leading-relaxed">
                      Acepto los{' '}
                      <a href="#" className="text-amber-600 hover:text-amber-700">
                        términos y condiciones
                      </a>{' '}
                      y la{' '}
                      <a href="#" className="text-amber-600 hover:text-amber-700">
                        política de privacidad
                      </a>
                    </Label>
                  </div>
                  {errors.terms && (
                    <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      {errors.terms}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    'Registrarse'
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-gray-600">
                    ¿Ya tienes cuenta?{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate('login')}
                      className="text-amber-600 hover:text-amber-700"
                      style={{ fontWeight: 600 }}
                    >
                      Inicia sesión
                    </button>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Right Side - Benefits */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
              <CardContent className="p-8">
                <h3 className="text-gray-900 mb-4">Como Padrino Tendrás Acceso A:</h3>
                <ul className="space-y-4">
                  {[
                    { emoji: '👦', title: 'Perfil del Niño Apadrinado', desc: 'Conoce su historia y progreso' },
                    { emoji: '📊', title: 'Bitácora de Desarrollo', desc: 'Seguimiento mensual detallado' },
                    { emoji: '💬', title: 'Comunicación Directa', desc: 'Chat con coordinadores' },
                    { emoji: '📄', title: 'Informes y Documentos', desc: 'Certificados y reportes' },
                    { emoji: '🎉', title: 'Invitación a Eventos', desc: 'Encuentra a tu ahijado' },
                    { emoji: '💳', title: 'Historial de Donaciones', desc: 'Control total de tus aportes' },
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-xl">{item.emoji}</span>
                      </div>
                      <div>
                        <p className="text-gray-900" style={{ fontWeight: 600 }}>{item.title}</p>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-blue-900 mb-2">Tus Datos Están Protegidos</h4>
                    <p className="text-sm text-blue-800">
                      Utilizamos encriptación de nivel bancario y cumplimos con todas las 
                      regulaciones de protección de datos personales.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

