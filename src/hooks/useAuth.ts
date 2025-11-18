/**
 * useAuth Hook
 * 
 * Hook personalizado para manejar autenticación
 * Proporciona todas las funcionalidades de auth con estados de carga y errores
 */

import { useState, useCallback } from 'react';
import { authService } from '../services/auth.service';
import {
  RegisterPadrinoDTO,
  LoginDTO,
  VerifyEmailDTO,
  RequestPasswordResetDTO,
  ResetPasswordDTO,
  RefreshTokenDTO,
  LogoutDTO,
  UpdateProfileDTO,
  CreateAdminDTO,
  UpdateAdminDTO,
  UserResponse,
  LoginResponse,
  ApiError,
} from '../types/api.types';

interface UseAuthReturn {
  // Estados
  loading: boolean;
  error: ApiError | null;

  // Métodos
  register: (dto: RegisterPadrinoDTO) => Promise<UserResponse | null>;
  login: (dto: LoginDTO) => Promise<LoginResponse | null>;
  verifyEmail: (dto: VerifyEmailDTO) => Promise<boolean>;
  requestPasswordReset: (dto: RequestPasswordResetDTO) => Promise<boolean>;
  resetPassword: (dto: ResetPasswordDTO) => Promise<boolean>;
  refreshToken: (dto: RefreshTokenDTO) => Promise<boolean>;
  logout: (dto: LogoutDTO) => Promise<boolean>;
  getProfile: () => Promise<UserResponse | null>;
  updateProfile: (dto: UpdateProfileDTO) => Promise<UserResponse | null>;
  createAdmin: (dto: CreateAdminDTO) => Promise<UserResponse | null>;
  updateAdmin: (adminId: number, dto: UpdateAdminDTO) => Promise<UserResponse | null>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Registrar nuevo padrino
   */
  const register = useCallback(async (dto: RegisterPadrinoDTO): Promise<UserResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.register(dto);
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
  }, []);

  /**
   * Iniciar sesión
   */
  const login = useCallback(async (dto: LoginDTO): Promise<LoginResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(dto);
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
  }, []);

  /**
   * Verificar email
   */
  const verifyEmail = useCallback(async (dto: VerifyEmailDTO): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await authService.verifyEmail(dto);
      return true;
    } catch (err: any) {
      const apiError: ApiError = {
        message: err.message || 'Error al verificar email',
        code: err.code || 'VERIFY_EMAIL_ERROR',
        statusCode: err.statusCode,
      };
      setError(apiError);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Solicitar reseteo de contraseña
   */
  const requestPasswordReset = useCallback(
    async (dto: RequestPasswordResetDTO): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        await authService.requestPasswordReset(dto);
        return true;
      } catch (err: any) {
        const apiError: ApiError = {
          message: err.message || 'Error al solicitar reseteo de contraseña',
          code: err.code || 'REQUEST_RESET_ERROR',
          statusCode: err.statusCode,
        };
        setError(apiError);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Resetear contraseña
   */
  const resetPassword = useCallback(async (dto: ResetPasswordDTO): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await authService.resetPassword(dto);
      return true;
    } catch (err: any) {
      const apiError: ApiError = {
        message: err.message || 'Error al resetear contraseña',
        code: err.code || 'RESET_PASSWORD_ERROR',
        statusCode: err.statusCode,
      };
      setError(apiError);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refrescar token
   */
  const refreshToken = useCallback(async (dto: RefreshTokenDTO): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await authService.refreshToken(dto);
      return true;
    } catch (err: any) {
      const apiError: ApiError = {
        message: err.message || 'Error al refrescar token',
        code: err.code || 'REFRESH_TOKEN_ERROR',
        statusCode: err.statusCode,
      };
      setError(apiError);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cerrar sesión
   */
  const logout = useCallback(async (dto: LogoutDTO): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await authService.logout(dto);
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
  }, []);

  /**
   * Obtener perfil
   */
  const getProfile = useCallback(async (): Promise<UserResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.getProfile();
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
  }, []);

  /**
   * Actualizar perfil
   */
  const updateProfile = useCallback(
    async (dto: UpdateProfileDTO): Promise<UserResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await authService.updateProfile(dto);
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
    },
    []
  );

  /**
   * Crear administrador (solo SUPER_ADMIN)
   */
  const createAdmin = useCallback(async (dto: CreateAdminDTO): Promise<UserResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.createAdmin(dto);
      return response.data || null;
    } catch (err: any) {
      const apiError: ApiError = {
        message: err.message || 'Error al crear administrador',
        code: err.code || 'CREATE_ADMIN_ERROR',
        statusCode: err.statusCode,
      };
      setError(apiError);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar administrador (solo SUPER_ADMIN)
   */
  const updateAdmin = useCallback(
    async (adminId: number, dto: UpdateAdminDTO): Promise<UserResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await authService.updateAdmin(adminId, dto);
        return response.data || null;
      } catch (err: any) {
        const apiError: ApiError = {
          message: err.message || 'Error al actualizar administrador',
          code: err.code || 'UPDATE_ADMIN_ERROR',
          statusCode: err.statusCode,
        };
        setError(apiError);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    register,
    login,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
    refreshToken,
    logout,
    getProfile,
    updateProfile,
    createAdmin,
    updateAdmin,
    clearError,
  };
}
