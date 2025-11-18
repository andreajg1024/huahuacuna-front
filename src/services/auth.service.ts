/**
 * Authentication Service
 * 
 * Maneja todas las operaciones de autenticación con el backend
 * Endpoints REST (no Kafka)
 */

import { BaseService } from './base.service';
import {
  RegisterPadrinoDTO,
  LoginDTO,
  LoginResponse,
  VerifyEmailDTO,
  RequestPasswordResetDTO,
  ResetPasswordDTO,
  RefreshTokenDTO,
  RefreshTokenResponse,
  LogoutDTO,
  UpdateProfileDTO,
  CreateAdminDTO,
  UpdateAdminDTO,
  UserResponse,
  ApiResponse,
  ApiError,
} from '../types/api.types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export class AuthService extends BaseService {
  private baseUrl = `${API_BASE_URL}/auth`;

  /**
   * POST /auth/register
   * Registro de padrinos
   */
  async register(dto: RegisterPadrinoDTO): Promise<ApiResponse<UserResponse>> {
    this.validateRegisterDTO(dto);

    try {
      const response = await fetch(`${this.baseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dto),
      });

      const data = await response.json();

      if (!response.ok) {
        throw this.handleError(data, response.status);
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * POST /auth/login
   * Iniciar sesión
   */
  async login(dto: LoginDTO): Promise<ApiResponse<LoginResponse>> {
    this.validateLoginDTO(dto);

    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dto),
      });

      const data = await response.json();

      if (!response.ok) {
        throw this.handleError(data, response.status);
      }

      // Guardar tokens en localStorage
      if (data.accessToken) {
        localStorage.setItem('auth_token', data.accessToken);
      }
      if (data.refreshToken) {
        localStorage.setItem('refresh_token', data.refreshToken);
      }
      if (data.user) {
        localStorage.setItem('auth_user', JSON.stringify(data.user));
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * POST /auth/verify-email
   * Verificar email con token
   */
  async verifyEmail(dto: VerifyEmailDTO): Promise<ApiResponse<{ message: string }>> {
    this.validateRequired(dto.token, 'Token');

    try {
      const response = await fetch(`${this.baseUrl}/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dto),
      });

      const data = await response.json();

      if (!response.ok) {
        throw this.handleError(data, response.status);
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * POST /auth/password/request-reset
   * Solicitar reseteo de contraseña
   */
  async requestPasswordReset(
    dto: RequestPasswordResetDTO
  ): Promise<ApiResponse<{ message: string }>> {
    this.validateRequired(dto.email, 'Email');
    
    if (!this.isValidEmail(dto.email)) {
      throw new Error('Email inválido');
    }

    try {
      const response = await fetch(`${this.baseUrl}/password/request-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dto),
      });

      const data = await response.json();

      if (!response.ok) {
        throw this.handleError(data, response.status);
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * POST /auth/password/reset
   * Resetear contraseña con token
   */
  async resetPassword(dto: ResetPasswordDTO): Promise<ApiResponse<{ message: string }>> {
    this.validateRequired(dto.token, 'Token');
    this.validateRequired(dto.newPassword, 'Nueva contraseña');
    this.validatePasswordStrength(dto.newPassword);

    try {
      const response = await fetch(`${this.baseUrl}/password/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dto),
      });

      const data = await response.json();

      if (!response.ok) {
        throw this.handleError(data, response.status);
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * POST /auth/refresh
   * Refrescar access token
   */
  async refreshToken(dto: RefreshTokenDTO): Promise<ApiResponse<RefreshTokenResponse>> {
    this.validateRequired(dto.refreshToken, 'Refresh token');

    try {
      const response = await fetch(`${this.baseUrl}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dto),
      });

      const data = await response.json();

      if (!response.ok) {
        throw this.handleError(data, response.status);
      }

      // Actualizar tokens
      if (data.accessToken) {
        localStorage.setItem('auth_token', data.accessToken);
      }
      if (data.refreshToken) {
        localStorage.setItem('refresh_token', data.refreshToken);
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * POST /auth/logout
   * Cerrar sesión (requiere autenticación)
   */
  async logout(dto: LogoutDTO): Promise<ApiResponse<{ message: string }>> {
    const token = this.getAuthToken();

    try {
      const response = await fetch(`${this.baseUrl}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dto),
      });

      const data = await response.json();

      // Limpiar tokens localmente independientemente del resultado
      this.clearAuthData();

      if (!response.ok) {
        throw this.handleError(data, response.status);
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      this.clearAuthData();
      throw this.handleError(error);
    }
  }

  /**
   * GET /auth/profile
   * Obtener perfil del usuario autenticado
   */
  async getProfile(): Promise<ApiResponse<UserResponse>> {
    const token = this.getAuthToken();

    try {
      const response = await fetch(`${this.baseUrl}/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw this.handleError(data, response.status);
      }

      // Actualizar user en localStorage
      localStorage.setItem('auth_user', JSON.stringify(data));

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * PATCH /auth/profile
   * Actualizar perfil (solo PADRINO)
   */
  async updateProfile(dto: UpdateProfileDTO): Promise<ApiResponse<UserResponse>> {
    const token = this.getAuthToken();

    try {
      const response = await fetch(`${this.baseUrl}/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dto),
      });

      const data = await response.json();

      if (!response.ok) {
        throw this.handleError(data, response.status);
      }

      // Actualizar user en localStorage
      localStorage.setItem('auth_user', JSON.stringify(data));

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * POST /auth/admins
   * Crear administrador (solo SUPER_ADMIN)
   */
  async createAdmin(dto: CreateAdminDTO): Promise<ApiResponse<UserResponse>> {
    const token = this.getAuthToken();
    this.validateCreateAdminDTO(dto);

    try {
      const response = await fetch(`${this.baseUrl}/admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dto),
      });

      const data = await response.json();

      if (!response.ok) {
        throw this.handleError(data, response.status);
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * PATCH /auth/admins/:adminId
   * Actualizar administrador (solo SUPER_ADMIN)
   */
  async updateAdmin(
    adminId: number,
    dto: UpdateAdminDTO
  ): Promise<ApiResponse<UserResponse>> {
    const token = this.getAuthToken();

    try {
      const response = await fetch(`${this.baseUrl}/admins/${adminId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dto),
      });

      const data = await response.json();

      if (!response.ok) {
        throw this.handleError(data, response.status);
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============================================================================
  // VALIDATION METHODS
  // ============================================================================

  private validateRegisterDTO(dto: RegisterPadrinoDTO): void {
    this.validateRequired(dto.name, 'Nombre');
    this.validateLength(dto.name, 'Nombre', 3, 100);

    this.validateRequired(dto.email, 'Email');
    if (!this.isValidEmail(dto.email)) {
      throw new Error('Email inválido');
    }

    this.validateRequired(dto.password, 'Contraseña');
    this.validatePasswordStrength(dto.password);

    this.validateRequired(dto.phone, 'Teléfono');
    this.validateLength(dto.phone, 'Teléfono', 7, 20);

    this.validateRequired(dto.documentId, 'Documento de identidad');
    this.validateLength(dto.documentId, 'Documento de identidad', 5, 20);

    this.validateRequired(dto.address, 'Dirección');
    this.validateLength(dto.address, 'Dirección', 5, 200);
  }

  private validateLoginDTO(dto: LoginDTO): void {
    this.validateRequired(dto.email, 'Email');
    this.validateRequired(dto.password, 'Contraseña');
  }

  private validateCreateAdminDTO(dto: CreateAdminDTO): void {
    this.validateRequired(dto.name, 'Nombre');
    this.validateRequired(dto.email, 'Email');
    this.validateRequired(dto.password, 'Contraseña');
    this.validateRequired(dto.role, 'Rol');

    if (!this.isValidEmail(dto.email)) {
      throw new Error('Email inválido');
    }

    this.validatePasswordStrength(dto.password);

    if (!['ADMIN', 'SUPER_ADMIN'].includes(dto.role)) {
      throw new Error('Rol inválido');
    }
  }

  private validatePasswordStrength(password: string): void {
    if (password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUppercase || !hasLowercase || !hasNumber) {
      throw new Error(
        'La contraseña debe contener mayúsculas, minúsculas y números'
      );
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private getAuthToken(): string {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No estás autenticado. Por favor inicia sesión.');
    }
    return token;
  }

  private clearAuthData(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_user');
  }

  private handleError(error: any, statusCode?: number): ApiError {
    if (error instanceof Error) {
      return {
        message: error.message,
        code: 'CLIENT_ERROR',
        statusCode,
      };
    }

    if (error?.message) {
      return {
        message: error.message,
        code: error.code || 'API_ERROR',
        statusCode: statusCode || error.statusCode,
        details: error.details,
      };
    }

    return {
      message: 'Error desconocido',
      code: 'UNKNOWN_ERROR',
      statusCode,
    };
  }
}

export const authService = new AuthService();
