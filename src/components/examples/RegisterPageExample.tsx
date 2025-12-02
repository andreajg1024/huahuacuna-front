/**
 * RegisterPage Component - Ejemplo Completo
 * 
 * Componente de ejemplo para registro de padrinos integrado con el backend
 * Implementa el endpoint POST /auth/register según especificación
 * 
 * Backend Endpoint: POST /auth/register
 * Request Body (RegisterDto):
 * - name: string (min 3, max 100)
 * - email: string (email válido)
 * - password: string (min 8, mayúscula + minúscula + número)
 * - phone: string (min 7, max 20)
 * - documentId: string (min 5, max 20)
 * - address: string (min 5, max 200)
 * 
 * Response (201): { message: string, userId: number }
 * 
 * Errores:
 * - 409: Email o documento ya registrado
 * - 503: Servicio de auth no disponible
 * - 400: Validación de campos
 * 
 * Nota: IP y User-Agent son capturados automáticamente por el gateway
 */

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import { useAuthV2 } from '@/hooks';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  documentId: string;
  address: string;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  documentId?: string;
  address?: string;
}

export default function RegisterPageExample() {
  const router = useRouter();
  const { register, loading, error, clearError } = useAuthV2();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    documentId: '',
    address: '',
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /**
   * Validar formulario según especificación del backend
   */
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Validar nombre (min 3, max 100)
    if (!formData.name) {
      errors.name = 'El nombre es requerido';
    } else if (formData.name.length < 3) {
      errors.name = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.name.length > 100) {
      errors.name = 'El nombre no puede exceder 100 caracteres';
    }

    // Validar email
    if (!formData.email) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Formato de email inválido';
    }

    // Validar password (min 8, mayúscula + minúscula + número)
    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'La contraseña debe incluir mayúscula, minúscula y número';
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Debes confirmar la contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Validar teléfono (min 7, max 20)
    if (!formData.phone) {
      errors.phone = 'El teléfono es requerido';
    } else if (formData.phone.length < 7) {
      errors.phone = 'El teléfono debe tener al menos 7 caracteres';
    } else if (formData.phone.length > 20) {
      errors.phone = 'El teléfono no puede exceder 20 caracteres';
    }

    // Validar documento (min 5, max 20)
    if (!formData.documentId) {
      errors.documentId = 'El documento es requerido';
    } else if (formData.documentId.length < 5) {
      errors.documentId = 'El documento debe tener al menos 5 caracteres';
    } else if (formData.documentId.length > 20) {
      errors.documentId = 'El documento no puede exceder 20 caracteres';
    }

    // Validar dirección (min 5, max 200)
    if (!formData.address) {
      errors.address = 'La dirección es requerida';
    } else if (formData.address.length < 5) {
      errors.address = 'La dirección debe tener al menos 5 caracteres';
    } else if (formData.address.length > 200) {
      errors.address = 'La dirección no puede exceder 200 caracteres';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Manejar submit del formulario
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    console.log('\n🔵 [REGISTER] Iniciando proceso de registro de padrino...');

    // Validar
    if (!validateForm()) {
      console.warn('⚠️  [REGISTER] Validación de formulario falló');
      return;
    }

    console.log('📤 [REGISTER] Enviando datos al backend...');
    console.log('📋 [REGISTER] Datos:', {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      documentId: formData.documentId,
      address: formData.address.substring(0, 50) + '...',
    });

    // Intentar registro (sin confirmPassword)
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      documentId: formData.documentId,
      address: formData.address,
    });

    if (result) {
      // Registro exitoso
      console.log('✅ [REGISTER] Registro exitoso');
      console.log('🆔 [REGISTER] User ID:', result.userId);
      console.log('📧 [REGISTER] Email de verificación enviado a:', formData.email);

      // Mostrar mensaje de éxito y redirigir a login o página de verificación
      alert(result.message || 'Usuario registrado exitosamente. Por favor verifica tu email.');
      
      // Redirigir a página de verificación de email o login
      router.push('/auth/verify-email-notice');
    } else {
      console.error('❌ [REGISTER] Registro falló - verificar logs del servicio');
    }
  };

  /**
   * Obtener mensaje de error amigable según código del backend
   */
  const getErrorMessage = () => {
    if (!error) return null;

    console.error('🔴 [REGISTER ERROR]', {
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
      details: error.details,
    });

    // Mapear errores según especificación del backend
    switch (error.statusCode) {
      case 409:
        // Email o documento ya registrado
        if (error.message?.toLowerCase().includes('email')) {
          return 'Este email ya está registrado. Por favor usa otro email o inicia sesión.';
        }
        if (error.message?.toLowerCase().includes('documento')) {
          return 'Este número de documento ya está registrado.';
        }
        return 'El email o documento ya están registrados en el sistema.';
      
      case 503:
        return 'El servicio de registro no está disponible en este momento. Por favor intenta más tarde.';
      
      case 400:
        return error.message || 'Los datos enviados no son válidos. Por favor verifica tu información.';
      
      default:
        return error.message || 'Ha ocurrido un error al registrar. Por favor intenta nuevamente.';
    }
  };

  /**
   * Manejar cambio en campos del formulario
   */
  const handleChange = (field: keyof FormData) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
    setValidationErrors({ ...validationErrors, [field]: undefined });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Registro de Padrino
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Completa el formulario para crear tu cuenta en Huahuacuna
          </p>
        </div>

        {/* Formulario */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Error de API */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {getErrorMessage()}
                  </h3>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    type="button"
                    onClick={clearError}
                    className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100"
                  >
                    <span className="sr-only">Cerrar</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Nombre completo */}
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nombre completo *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange('name')}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  validationErrors.name ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="Juan Pérez González"
                disabled={loading}
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="sm:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange('email')}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  validationErrors.email ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="juan@ejemplo.com"
                disabled={loading}
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña *
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange('password')}
                  className={`appearance-none relative block w-full px-3 py-2 border ${
                    validationErrors.password ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Min 8 caracteres"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Debe incluir mayúscula, minúscula y número
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar contraseña *
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  className={`appearance-none relative block w-full px-3 py-2 border ${
                    validationErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Repite tu contraseña"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Teléfono *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange('phone')}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  validationErrors.phone ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="+51 987654321"
                disabled={loading}
              />
              {validationErrors.phone && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
              )}
            </div>

            {/* Documento */}
            <div>
              <label htmlFor="documentId" className="block text-sm font-medium text-gray-700">
                Documento de identidad *
              </label>
              <input
                id="documentId"
                name="documentId"
                type="text"
                required
                value={formData.documentId}
                onChange={handleChange('documentId')}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  validationErrors.documentId ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="DNI, Pasaporte, etc."
                disabled={loading}
              />
              {validationErrors.documentId && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.documentId}</p>
              )}
            </div>

            {/* Dirección */}
            <div className="sm:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Dirección *
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                required
                value={formData.address}
                onChange={handleChange('address')}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  validationErrors.address ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="Av. Principal 123, Distrito, Ciudad"
                disabled={loading}
              />
              {validationErrors.address && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.address}</p>
              )}
            </div>
          </div>

          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Registrando...
                </>
              ) : (
                'Registrarse como Padrino'
              )}
            </button>
          </div>

          {/* Login link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <a
                href="/auth/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Inicia sesión aquí
              </a>
            </p>
          </div>
        </form>

        {/* Nota de privacidad */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Al registrarte, aceptas nuestros{' '}
            <a href="/terminos" className="text-indigo-600 hover:text-indigo-500">
              términos y condiciones
            </a>{' '}
            y{' '}
            <a href="/privacidad" className="text-indigo-600 hover:text-indigo-500">
              política de privacidad
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
