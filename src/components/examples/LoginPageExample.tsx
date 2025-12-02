/**
 * LoginPage Component - Ejemplo Completo
 * 
 * Componente de ejemplo que demuestra el uso completo del sistema de autenticación
 * con useAuthV2 hook
 * 
 * Features:
 * - Validación de formulario
 * - Manejo de estados de carga
 * - Manejo de errores
 * - Redirección según rol
 * - Persistencia de sesión
 */

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { useAuthV2 } from '@/hooks';

export default function LoginPageExample() {
  const router = useRouter();
  const { login, loading, error, clearError } = useAuthV2();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const [rememberMe, setRememberMe] = useState(false);

  /**
   * Validar formulario antes de enviar
   */
  const validateForm = (): boolean => {
    const errors: any = {};

    // Validar email
    if (!formData.email) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    // Validar password
    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres';
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

    // Validar
    if (!validateForm()) {
      return;
    }

    // Intentar login
    const result = await login({
      email: formData.email,
      password: formData.password,
    });

    if (result) {
      // Login exitoso
      console.log('✅ Login exitoso:', result.user);

      // Guardar información del usuario si se marcó "Recordarme"
      if (rememberMe) {
        localStorage.setItem('user_email', formData.email);
      }

      // Guardar usuario en localStorage para acceso rápido
      localStorage.setItem('user', JSON.stringify(result.user));

      // Redirigir según el rol del usuario
      redirectByRole(result.user.role);
    }
  };

  /**
   * Redirigir según el rol del usuario
   */
  const redirectByRole = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        router.push('/admin/super-dashboard');
        break;
      case 'ADMIN':
        router.push('/admin/dashboard');
        break;
      case 'PADRINO':
        router.push('/padrino/dashboard');
        break;
      default:
        router.push('/dashboard');
    }
  };

  /**
   * Obtener mensaje de error amigable
   */
  const getErrorMessage = () => {
    if (!error) return null;

    switch (error.statusCode) {
      case 401:
        return 'Email o contraseña incorrectos. Por favor verifica tus credenciales.';
      case 403:
        return 'Tu cuenta está bloqueada, inactiva o no verificada. Contacta al administrador.';
      case 503:
        return 'El servicio no está disponible en este momento. Intenta más tarde.';
      default:
        return error.message || 'Ha ocurrido un error al iniciar sesión.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Accede a tu cuenta de Huahuacuna
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

          <div className="rounded-md shadow-sm -space-y-px">
            {/* Email */}
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setValidationErrors({ ...validationErrors, email: undefined });
                }}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  validationErrors.email ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Email"
                disabled={loading}
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setValidationErrors({ ...validationErrors, password: undefined });
                }}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  validationErrors.password ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Contraseña"
                disabled={loading}
              />
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
              )}
            </div>
          </div>

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                disabled={loading}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Recordarme
              </label>
            </div>

            <div className="text-sm">
              <a
                href="/auth/password-recovery"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>

          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
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
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </div>

          {/* Register link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{' '}
              <a
                href="/auth/register"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Regístrate aquí
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
