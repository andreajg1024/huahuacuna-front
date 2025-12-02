/**
 * PasswordResetPage Component - Ejemplo Completo
 * 
 * Componente para confirmar restablecimiento de contraseña con token
 * Implementa el endpoint POST /auth/password/reset según especificación
 * 
 * Backend Endpoint: POST /auth/password/reset
 * Request Body (ResetPasswordDto):
 * - token: string
 * - newPassword: string (min 8, requiere mayúscula/minúscula/número)
 * 
 * Response (200): { message: string }
 * Ejemplo: { "message": "Contraseña restablecida exitosamente" }
 * 
 * Errores:
 * - 400: Token inválido o expirado
 */

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import { useAuthV2 } from '@/hooks';

interface ValidationErrors {
  newPassword?: string;
  confirmPassword?: string;
}

export default function PasswordResetPageExample() {
  const router = useRouter();
  const { resetPassword, loading, error, clearError } = useAuthV2();
  
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isReset, setIsReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /**
   * Obtener token de la URL
   * Ej: /auth/password-reset?token=abc123
   */
  useEffect(() => {
    if (router.query.token && typeof router.query.token === 'string') {
      setToken(router.query.token);
      console.log('🔵 [PASSWORD RESET] Token obtenido de URL:', router.query.token.substring(0, 20) + '...');
    }
  }, [router.query]);

  /**
   * Validar formulario
   */
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Validar newPassword (min 8, mayúscula + minúscula + número)
    if (!newPassword) {
      errors.newPassword = 'La nueva contraseña es requerida';
    } else if (newPassword.length < 8) {
      errors.newPassword = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      errors.newPassword = 'La contraseña debe incluir mayúscula, minúscula y número';
    }

    // Validar confirmación
    if (!confirmPassword) {
      errors.confirmPassword = 'Debes confirmar la contraseña';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
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

    console.log('\n🔵 [PASSWORD RESET] Iniciando restablecimiento de contraseña...');

    // Validar token
    if (!token) {
      console.error('❌ [PASSWORD RESET] Token no encontrado');
      alert('Token de restablecimiento no encontrado. Por favor usa el enlace del email.');
      return;
    }

    // Validar formulario
    if (!validateForm()) {
      console.warn('⚠️  [PASSWORD RESET] Validación de formulario falló');
      return;
    }

    console.log('🔑 [PASSWORD RESET] Token:', token.substring(0, 20) + '...');
    console.log('📤 [PASSWORD RESET] Enviando nueva contraseña al backend...');

    const result = await resetPassword({
      token,
      newPassword,
    });

    if (result) {
      console.log('✅ [PASSWORD RESET] Contraseña restablecida exitosamente');
      console.log('📧 [PASSWORD RESET] Mensaje:', result.message);
      setIsReset(true);

      // Redirigir a login después de 3 segundos
      setTimeout(() => {
        console.log('🔀 [PASSWORD RESET] Redirigiendo a login...');
        router.push('/auth/login');
      }, 3000);
    } else {
      console.error('❌ [PASSWORD RESET] Restablecimiento falló');
    }
  };

  /**
   * Obtener mensaje de error amigable
   */
  const getErrorMessage = () => {
    if (!error) return null;

    console.error('🔴 [PASSWORD RESET ERROR]', {
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
      details: error.details,
    });

    switch (error.statusCode) {
      case 400:
        if (error.message?.toLowerCase().includes('expirado')) {
          return 'El enlace de restablecimiento ha expirado. Por favor solicita uno nuevo.';
        }
        if (error.message?.toLowerCase().includes('inválido')) {
          return 'El enlace de restablecimiento es inválido. Por favor solicita uno nuevo.';
        }
        return 'Token de restablecimiento inválido o expirado. Por favor solicita uno nuevo.';
      
      default:
        return error.message || 'Ha ocurrido un error al restablecer la contraseña. Por favor intenta nuevamente.';
    }
  };

  /**
   * Manejar cambio en nueva contraseña
   */
  const handleNewPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    setValidationErrors({ ...validationErrors, newPassword: undefined });
  };

  /**
   * Manejar cambio en confirmar contraseña
   */
  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setValidationErrors({ ...validationErrors, confirmPassword: undefined });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Restablecer Contraseña
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa tu nueva contraseña
          </p>
        </div>

        {/* Restablecimiento exitoso */}
        {isReset ? (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  ¡Contraseña restablecida exitosamente!
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Tu contraseña ha sido actualizada. Serás redirigido a la página de inicio de sesión en 3 segundos...
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => router.push('/auth/login')}
                    className="text-sm font-medium text-green-800 hover:text-green-900"
                  >
                    Ir a inicio de sesión ahora →
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
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
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Advertencia si no hay token */}
            {!token && (
              <div className="rounded-md bg-yellow-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Token no encontrado
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Por favor usa el enlace completo que recibiste en tu email para restablecer la contraseña.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Formulario */}
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {/* Nueva contraseña */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  Nueva contraseña
                </label>
                <div className="mt-1 relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={newPassword}
                    onChange={handleNewPasswordChange}
                    className={`appearance-none relative block w-full px-3 py-2 border ${
                      validationErrors.newPassword ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Min 8 caracteres"
                    disabled={loading || !token}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {validationErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.newPassword}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Debe incluir mayúscula, minúscula y número
                </p>
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar contraseña
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    className={`appearance-none relative block w-full px-3 py-2 border ${
                      validationErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Repite tu nueva contraseña"
                    disabled={loading || !token}
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

              <div>
                <button
                  type="submit"
                  disabled={loading || !token}
                  className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                    loading || !token
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
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Restableciendo...
                    </>
                  ) : (
                    'Restablecer contraseña'
                  )}
                </button>
              </div>
            </form>

            {/* Links adicionales */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                <a href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Volver a inicio de sesión
                </a>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
