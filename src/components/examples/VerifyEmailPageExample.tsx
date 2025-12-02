/**
 * VerifyEmailPage Component - Ejemplo Completo
 * 
 * Componente para verificar email con token
 * Implementa el endpoint POST /auth/verify-email según especificación
 * 
 * Backend Endpoint: POST /auth/verify-email
 * Request Body (VerifyEmailDto):
 * - token: string
 * 
 * Response (200): { message: string }
 * Ejemplo: { "message": "Email verificado exitosamente. Ya puedes iniciar sesión." }
 * 
 * Errores:
 * - 400: Token inválido o expirado
 */

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { useAuthV2 } from '@/hooks';

export default function VerifyEmailPageExample() {
  const router = useRouter();
  const { verifyEmail, loading, error, clearError } = useAuthV2();
  
  const [token, setToken] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [tokenFromUrl, setTokenFromUrl] = useState(false);

  /**
   * Obtener token de la URL si existe
   * Ej: /auth/verify-email?token=abc123
   */
  useEffect(() => {
    if (router.query.token && typeof router.query.token === 'string') {
      setToken(router.query.token);
      setTokenFromUrl(true);
      console.log('🔵 [VERIFY EMAIL] Token obtenido de URL:', router.query.token.substring(0, 20) + '...');
    }
  }, [router.query]);

  /**
   * Auto-verificar si hay token en URL
   */
  useEffect(() => {
    if (tokenFromUrl && token && !isVerified && !loading) {
      handleVerify();
    }
  }, [tokenFromUrl, token]);

  /**
   * Manejar verificación de email
   */
  const handleVerify = async () => {
    clearError();

    if (!token) {
      console.warn('⚠️  [VERIFY EMAIL] Token vacío');
      return;
    }

    console.log('\n🔵 [VERIFY EMAIL] Iniciando verificación de email...');
    console.log('🔑 [VERIFY EMAIL] Token:', token.substring(0, 20) + '...');

    const result = await verifyEmail({ token });

    if (result) {
      console.log('✅ [VERIFY EMAIL] Email verificado exitosamente');
      console.log('📧 [VERIFY EMAIL] Mensaje:', result.message);
      setIsVerified(true);

      // Redirigir a login después de 3 segundos
      setTimeout(() => {
        console.log('🔀 [VERIFY EMAIL] Redirigiendo a login...');
        router.push('/auth/login');
      }, 3000);
    } else {
      console.error('❌ [VERIFY EMAIL] Verificación falló');
    }
  };

  /**
   * Manejar submit manual del formulario
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await handleVerify();
  };

  /**
   * Obtener mensaje de error amigable
   */
  const getErrorMessage = () => {
    if (!error) return null;

    console.error('🔴 [VERIFY EMAIL ERROR]', {
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
      details: error.details,
    });

    switch (error.statusCode) {
      case 400:
        if (error.message?.toLowerCase().includes('expirado')) {
          return 'El token de verificación ha expirado. Por favor solicita un nuevo email de verificación.';
        }
        if (error.message?.toLowerCase().includes('inválido')) {
          return 'El token de verificación es inválido. Por favor verifica el enlace o solicita un nuevo email.';
        }
        return 'Token de verificación inválido o expirado. Por favor solicita un nuevo email de verificación.';
      
      default:
        return error.message || 'Ha ocurrido un error al verificar el email. Por favor intenta nuevamente.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Verificar Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Verifica tu cuenta de Huahuacuna
          </p>
        </div>

        {/* Verificación exitosa */}
        {isVerified ? (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  ¡Email verificado exitosamente!
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Tu cuenta ha sido verificada. Serás redirigido a la página de inicio de sesión en 3 segundos...
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

            {/* Formulario */}
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {!tokenFromUrl && (
                <div>
                  <label htmlFor="token" className="block text-sm font-medium text-gray-700">
                    Token de verificación
                  </label>
                  <input
                    id="token"
                    name="token"
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Ingresa el token de verificación"
                    disabled={loading}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Revisa tu email y copia el token de verificación aquí.
                  </p>
                </div>
              )}

              {tokenFromUrl && (
                <div className="rounded-md bg-blue-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Verificando tu email...
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>Por favor espera mientras verificamos tu cuenta.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
                      Verificando...
                    </>
                  ) : (
                    'Verificar Email'
                  )}
                </button>
              </div>
            </form>

            {/* Links adicionales */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                ¿No recibiste el email?{' '}
                <a href="/auth/resend-verification" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Reenviar email de verificación
                </a>
              </p>
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
