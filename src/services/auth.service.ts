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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export class AuthService extends BaseService {
  private baseUrl = `${API_BASE_URL}/api/auth`;

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
        // Manejar error 409 (Email o documento ya registrado)
        if (response.status === 409) {
          throw new Error('El email o documento ya está registrado');
        }
        throw new Error(data.message || 'Error al registrar usuario');
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al registrar usuario. Intenta nuevamente.');
    }
  }

  /**
   * POST /auth/login
   * Iniciar sesión
   */
  async login(dto: LoginDTO): Promise<ApiResponse<LoginResponse>> {
    this.validateLoginDTO(dto);

    try {
      console.log('🔐 Intentando login con:', { email: dto.email });

      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dto),
      });

      console.log('📡 Status de respuesta:', response.status);

      const rawData = await response.json();
      console.log('📦 Datos recibidos del backend:', rawData);
      console.log('📦 Estructura completa:', JSON.stringify(rawData, null, 2));
      console.log('📦 Claves del objeto:', Object.keys(rawData));

      if (!response.ok) {
        // Manejar error 401 (Credenciales inválidas)
        if (response.status === 401) {
          return {
            success: false,
            error: {
              message: 'Credenciales inválidas',
              code: 'INVALID_CREDENTIALS'
            }
          };
        }
        
        // Manejar error 403 (Cuenta bloqueada o inactiva)
        if (response.status === 403) {
          return {
            success: false,
            error: {
              message: 'Cuenta bloqueada o inactiva. Contacta al administrador.',
              code: 'ACCOUNT_BLOCKED'
            }
          };
        }
        
        return {
          success: false,
          error: {
            message: rawData.message || 'Error al iniciar sesión',
            code: 'LOGIN_ERROR'
          }
        };
      }

      // El backend puede devolver los datos directamente o dentro de un objeto "data"
      // Intentar ambas estructuras
      let loginData = rawData;

      // Si los datos están dentro de rawData.data, usar esos
      if (rawData.data && typeof rawData.data === 'object') {
        console.log('📦 Datos están anidados en rawData.data');
        loginData = rawData.data;
      }

      // Validar que la respuesta tenga los campos necesarios
      console.log('🔍 Validando estructura de respuesta...');
      console.log('  - loginData.user existe?', !!loginData.user);
      console.log('  - loginData.accessToken existe?', !!loginData.accessToken);
      console.log('  - loginData.user completo:', JSON.stringify(loginData.user, null, 2));

      if (!loginData.user || !loginData.accessToken) {
        console.error('❌ Respuesta del backend sin estructura esperada:', rawData);
        console.error('❌ loginData procesado:', loginData);
        return {
          success: false,
          error: {
            message: 'Respuesta del servidor inválida',
            code: 'INVALID_RESPONSE'
          }
        };
      }

      // Guardar tokens en localStorage
      if (loginData.accessToken) {
        localStorage.setItem('auth_token', loginData.accessToken);
      }
      if (loginData.refreshToken) {
        localStorage.setItem('refresh_token', loginData.refreshToken);
      }

      console.log('✅ Login exitoso, retornando datos');

      return {
        success: true,
        data: {
          user: loginData.user,
          accessToken: loginData.accessToken,
          refreshToken: loginData.refreshToken
        }
      };
    } catch (error) {
      console.error('💥 Error en login:', error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Error al iniciar sesión. Intenta nuevamente.',
          code: 'NETWORK_ERROR'
        }
      };
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
        // Manejar error 400 (Token inválido o expirado)
        if (response.status === 400) {
          throw new Error('Token inválido o expirado');
        }
        
        throw new Error(data.message || 'Error al verificar email');
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al verificar email. Intenta nuevamente.');
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
        throw new Error(data.message || 'Error al solicitar reseteo de contraseña');
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al solicitar reseteo de contraseña. Intenta nuevamente.');
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
        // Manejar error 400 (Token inválido o expirado)
        if (response.status === 400) {
          throw new Error('El enlace ha expirado o es inválido. Solicita uno nuevo.');
        }
        
        throw new Error(data.message || 'Error al restablecer contraseña');
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al restablecer contraseña. Intenta nuevamente.');
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
        // Manejar error 401 (Refresh token inválido o expirado)
        if (response.status === 401) {
          // Limpiar tokens y forzar re-login
          this.clearAuthData();
          throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
        }
        
        throw new Error(data.message || 'Error al refrescar token');
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
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al refrescar token. Intenta nuevamente.');
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

      // Limpiar tokens localmente independientemente del resultado
      this.clearAuthData();

      if (!response.ok) {
        // Si el logout falla en el backend, registrar pero no fallar
        console.warn('Logout en backend falló, pero tokens locales fueron limpiados');
        return {
          success: true,
          data: { message: 'Sesión cerrada localmente' },
        };
      }

      const data = await response.json();

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      // Asegurar limpieza de tokens incluso si hay error
      this.clearAuthData();
      
      // No lanzar error para logout, solo loguear
      console.error('Error en logout:', error);
      
      return {
        success: true,
        data: { message: 'Sesión cerrada localmente' },
      };
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
        // Manejar error 401 (Token inválido o expirado)
        if (response.status === 401) {
          throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
        }
        
        throw new Error(data.message || 'Error al obtener perfil');
      }

      // Actualizar user en localStorage
      localStorage.setItem('auth_user', JSON.stringify(data));

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al obtener perfil. Intenta nuevamente.');
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
        // Manejar error 403 (Solo padrinos pueden actualizar)
        if (response.status === 403) {
          throw new Error('Solo los padrinos pueden actualizar su perfil');
        }
        
        // Manejar error 401 (Sesión expirada)
        if (response.status === 401) {
          throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
        }
        
        throw new Error(data.message || 'Error al actualizar perfil');
      }

      // Actualizar user en localStorage
      localStorage.setItem('auth_user', JSON.stringify(data));

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al actualizar perfil. Intenta nuevamente.');
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
        // 403: Solo super-admins pueden crear administradores
        if (response.status === 403) {
          throw new Error('Solo super-admins pueden crear administradores');
        }
        // 409: Email ya registrado
        if (response.status === 409) {
          throw new Error('Email ya registrado');
        }
        throw new Error(data.message || 'Error al crear administrador');
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al crear administrador. Intenta nuevamente.');
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

  /**
   * GET /auth/admins
   * Listar administradores (solo SUPER_ADMIN)
   */
  async listAdmins(): Promise<ApiResponse<UserResponse[]>> {
    const token = this.getAuthToken();

    try {
      const response = await fetch(`${this.baseUrl}/admins`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Solo super-admins pueden listar administradores');
        }
        if (response.status === 401) {
          throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
        }
        throw new Error(data.message || 'Error al listar administradores');
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al listar administradores. Intenta nuevamente.');
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
