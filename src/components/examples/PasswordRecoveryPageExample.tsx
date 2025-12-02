/**
 * PasswordRecoveryPage Component - Ejemplo Completo
 * 
 * Componente para solicitar restablecimiento de contraseña
 * Implementa el endpoint POST /auth/password/request-reset según especificación
 * 
 * Backend Endpoint: POST /auth/password/request-reset
 * Request Body (ResetPasswordRequestDto):
 * - email: string
 * 
 * Response (200): { message: string }
 * Ejemplo: { "message": "Si el email existe, recibirás instrucciones para restablecer tu contraseña." }
 * 
 * Nota: El mensaje es siempre el mismo por seguridad (no revela si el email existe)
 */

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import { useAuthV2 } from '@/hooks';

export default function PasswordRecoveryPageExample() {
  const router = useRouter();
  const { requestPasswordReset, loading, error, clearError } = useAuthV2();
  
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [validationError, setValidationError] = useState('');

  /**
   * Validar email
   */
  const validateEmail = (): boolean => {
    if (!email) {
      setValidationError('El email es requerido');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError('Formato de email inválido');
      return false;
    }
    setValidationError('');
    return true;
  };

  /**
   * Manejar submit del formulario
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    console.log('\n🔵 [PASSWORD RECOVERY] Iniciando solicitud de restablecimiento...');

    // Validar
    if (!validateEmail()) {
      console.warn('⚠️  [PASSWORD RECOVERY] Validación de email falló');
      return;
    }

    console.log('📤 [PASSWORD RECOVERY] Enviando solicitud para:', email);

    const result = await requestPasswordReset({ email });

    if (result) {
      console.log('✅ [PASSWORD RECOVERY] Solicitud enviada exitosamente');
      console.log('📧 [PASSWORD RECOVERY] Mensaje:', result.message);
      setEmailSent(true);
    } else {
      console.error('❌ [PASSWORD RECOVERY] Solicitud falló');
    }
  };

  /**
   * Manejar cambio en el email
   */
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setValidationError('');
  };

  /**
   * Obtener mensaje de error amigable
   */
  const getErrorMessage = () => {
    if (!error) return null;

    console.error('🔴 [PASSWORD RECOVERY ERROR]', {
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
      details: error.details,
    });

    return error.message || 'Ha ocurrido un error al procesar tu solicitud. Por favor intenta nuevamente.';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Recuperar Contraseña
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa tu email para recibir instrucciones de restablecimiento
          </p>
        </div>

        {/* Email enviado exitosamente */}
        {emailSent ? (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  ¡Solicitud enviada!
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Si el email <strong>{email}</strong> existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña.
                  </p>
                  <p className="mt-2">
                    Por favor revisa tu bandeja de entrada y la carpeta de spam.
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => router.push('/auth/login')}
                    className="text-sm font-medium text-green-800 hover:text-green-900"
                  >
                    Volver a inicio de sesión →
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

            {/* Formulario */}
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                    validationError ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="tu@email.com"
                  disabled={loading}
                />
                {validationError && (
                  <p className="mt-1 text-sm text-red-600">{validationError}</p>
                )}
              </div>

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
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enviando...
                    </>
                  ) : (
                    'Enviar instrucciones'
                  )}
                </button>
              </div>
            </form>

            {/* Links adicionales */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                ¿Recordaste tu contraseña?{' '}
                <a href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Iniciar sesión
                </a>
              </p>
              <p className="text-sm text-gray-600">
                ¿No tienes cuenta?{' '}
                <a href="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Registrarse
                </a>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
