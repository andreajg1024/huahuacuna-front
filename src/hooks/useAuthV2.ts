/**
 * useAuthV2 Hook
 * 
 * Hook completo para manejar todas las operaciones de autenticación
 * Proporciona estados de carga, errores y métodos para todos los endpoints
 * 
 * Features:
 * - Gestión automática de estados de carga
 * - Manejo de errores centralizado
 * - Soporte para todos los endpoints de auth
 * - Type-safe con TypeScript
 */

import { useState, useCallback } from 'react';
import { authServiceV2 } from '../services/auth.service.v2';
import {
  RegisterDTO,
  RegisterResponse,
  LoginDTO,
  LoginResponse,
  VerifyEmailDTO,
  VerifyEmailResponse,
  RequestPasswordResetDTO,
  RequestPasswordResetResponse,
  ResetPasswordDTO,
  ResetPasswordResponse,
  RefreshTokenDTO,
  RefreshTokenResponse,
  LogoutDTO,
  LogoutResponse,
  UpdateProfileDTO,
  UserResponse,
  ApiError,
} from '../types/api.types';

interface UseAuthV2State {
  loading: boolean;
  error: ApiError | null;
}

interface UseAuthV2Return extends UseAuthV2State {
  // Métodos públicos (sin autenticación)
  register: (dto: RegisterDTO) => Promise<RegisterResponse | null>;
  login: (dto: LoginDTO) => Promise<LoginResponse | null>;
  verifyEmail: (dto: VerifyEmailDTO) => Promise<VerifyEmailResponse | null>;
  requestPasswordReset: (dto: RequestPasswordResetDTO) => Promise<RequestPasswordResetResponse | null>;
  resetPassword: (dto: ResetPasswordDTO) => Promise<ResetPasswordResponse | null>;
  refreshToken: (dto: RefreshTokenDTO) => Promise<RefreshTokenResponse | null>;
  testAuth: () => Promise<boolean>;

  // Métodos protegidos (requieren autenticación)
  logout: (dto: LogoutDTO) => Promise<boolean>;
  getProfile: () => Promise<UserResponse | null>;
  updateProfile: (dto: UpdateProfileDTO) => Promise<UserResponse | null>;

  // Utilidades
  clearError: () => void;
  isAuthenticated: () => boolean;
}

export function useAuthV2(): UseAuthV2Return {
  const [state, setState] = useState<UseAuthV2State>({
    loading: false,
    error: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState((prev: UseAuthV2State) => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: ApiError | null) => {
    setState((prev: UseAuthV2State) => ({ ...prev, error }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  // ============================================================================
  // MÉTODOS PÚBLICOS
  // ============================================================================

  /**
   * POST /auth/register
   * Registrar nuevo padrino
   */
  const register = useCallback(async (dto: RegisterDTO): Promise<RegisterResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authServiceV2.register(dto);
      
      if (!response.success) {
        setError(response.error || { message: 'Error desconocido', code: 'UNKNOWN_ERROR' });
        return null;
      }

      return response.data || null;
    } catch (err: any) {
      const apiError: ApiError = {
        message: err.message || 'Error al registrar usuario',
        code: err.code || 'REGISTER_ERROR',
        statusCode: err.statusCode,
      };
      setError(apiError);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  /**
   * POST /auth/login
   * Iniciar sesión
   */
  const login = useCallback(async (dto: LoginDTO): Promise<LoginResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authServiceV2.login(dto);
      
      if (!response.success) {
        setError(response.error || { message: 'Error desconocido', code: 'UNKNOWN_ERROR' });
        return null;
      }

      return response.data || null;
    } catch (err: any) {
      const apiError: ApiError = {
        message: err.message || 'Error al iniciar sesión',
        code: err.code || 'LOGIN_ERROR',
        statusCode: err.statusCode,
      };
      setError(apiError);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  /**
   * POST /auth/verify-email
   * Verificar email con token
   */
  const verifyEmail = useCallback(async (dto: VerifyEmailDTO): Promise<VerifyEmailResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authServiceV2.verifyEmail(dto);
      
      if (!response.success) {
        setError(response.error || { message: 'Error desconocido', code: 'UNKNOWN_ERROR' });
        return null;
      }

      return response.data || null;
    } catch (err: any) {
      const apiError: ApiError = {
        message: err.message || 'Error al verificar email',
        code: err.code || 'VERIFY_EMAIL_ERROR',
        statusCode: err.statusCode,
      };
      setError(apiError);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  /**
   * POST /auth/password/request-reset
   * Solicitar restablecimiento de contraseña
   */
  const requestPasswordReset = useCallback(async (dto: RequestPasswordResetDTO): Promise<RequestPasswordResetResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authServiceV2.requestPasswordReset(dto);
      
      if (!response.success) {
        setError(response.error || { message: 'Error desconocido', code: 'UNKNOWN_ERROR' });
        return null;
      }

      return response.data || null;
    } catch (err: any) {
      const apiError: ApiError = {
        message: err.message || 'Error al solicitar restablecimiento',
        code: err.code || 'REQUEST_RESET_ERROR',
        statusCode: err.statusCode,
      };
      setError(apiError);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  /**
   * POST /auth/password/reset
   * Restablecer contraseña con token
   */
  const resetPassword = useCallback(async (dto: ResetPasswordDTO): Promise<ResetPasswordResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authServiceV2.resetPassword(dto);
      
      if (!response.success) {
        setError(response.error || { message: 'Error desconocido', code: 'UNKNOWN_ERROR' });
        return null;
      }

      return response.data || null;
    } catch (err: any) {
      const apiError: ApiError = {
        message: err.message || 'Error al restablecer contraseña',
        code: err.code || 'RESET_PASSWORD_ERROR',
        statusCode: err.statusCode,
      };
      setError(apiError);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  /**
   * POST /auth/refresh
   * Refrescar access token
   */
  const refreshToken = useCallback(async (dto: RefreshTokenDTO): Promise<RefreshTokenResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authServiceV2.refreshToken(dto);
      
      if (!response.success) {
        setError(response.error || { message: 'Error desconocido', code: 'UNKNOWN_ERROR' });
        return null;
      }

      return response.data || null;
    } catch (err: any) {
      const apiError: ApiError = {
        message: err.message || 'Error al refrescar token',
        code: err.code || 'REFRESH_TOKEN_ERROR',
        statusCode: err.statusCode,
      };
      setError(apiError);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  /**
   * GET /auth/test
   * Verificar que el servicio está funcionando
   */
  const testAuth = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authServiceV2.testAuth();
      
      if (!response.success) {
        setError(response.error || { message: 'Error desconocido', code: 'UNKNOWN_ERROR' });
        return false;
      }

      return true;
    } catch (err: any) {
      const apiError: ApiError = {
        message: err.message || 'Error al conectar con el servicio',
        code: err.code || 'TEST_ERROR',
        statusCode: err.statusCode,
      };
      setError(apiError);
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // ============================================================================
  // MÉTODOS PROTEGIDOS
  // ============================================================================

  /**
   * POST /auth/logout
   * Cerrar sesión
   */
  const logout = useCallback(async (dto: LogoutDTO): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authServiceV2.logout(dto);
      
      if (!response.success) {
        setError(response.error || { message: 'Error desconocido', code: 'UNKNOWN_ERROR' });
        return false;
      }

      return true;
    } catch (err: any) {
      const apiError: ApiError = {
        message: err.message || 'Error al cerrar sesión',
        code: err.code || 'LOGOUT_ERROR',
        statusCode: err.statusCode,
      };
      setError(apiError);
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  /**
   * GET /auth/profile
   * Obtener perfil del usuario autenticado
   */
  const getProfile = useCallback(async (): Promise<UserResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authServiceV2.getProfile();
      
      if (!response.success) {
        setError(response.error || { message: 'Error desconocido', code: 'UNKNOWN_ERROR' });
        return null;
      }

      return response.data || null;
    } catch (err: any) {
      const apiError: ApiError = {
        message: err.message || 'Error al obtener perfil',
        code: err.code || 'GET_PROFILE_ERROR',
        statusCode: err.statusCode,
      };
      setError(apiError);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  /**
   * PATCH /auth/profile
   * Actualizar perfil del usuario
   */
  const updateProfile = useCallback(async (dto: UpdateProfileDTO): Promise<UserResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authServiceV2.updateProfile(dto);
      
      if (!response.success) {
        setError(response.error || { message: 'Error desconocido', code: 'UNKNOWN_ERROR' });
        return null;
      }

      return response.data || null;
    } catch (err: any) {
      const apiError: ApiError = {
        message: err.message || 'Error al actualizar perfil',
        code: err.code || 'UPDATE_PROFILE_ERROR',
        statusCode: err.statusCode,
      };
      setError(apiError);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // ============================================================================
  // UTILIDADES
  // ============================================================================

  const isAuthenticated = useCallback((): boolean => {
    return authServiceV2.isAuthenticated();
  }, []);

  return {
    // Estado
    loading: state.loading,
    error: state.error,

    // Métodos públicos
    register,
    login,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
    refreshToken,
    testAuth,

    // Métodos protegidos
    logout,
    getProfile,
    updateProfile,

    // Utilidades
    clearError,
    isAuthenticated,
  };
}
