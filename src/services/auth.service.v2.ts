/**
 * Authentication Service V2
 * 
 * Servicio completo para todos los endpoints de autenticación
 * Implementa todos los endpoints según la especificación del backend
 * 
 * Endpoints implementados:
 * - POST /auth/register
 * - POST /auth/login
 * - POST /auth/verify-email
 * - POST /auth/password/request-reset
 * - POST /auth/password/reset
 * - POST /auth/refresh
 * - POST /auth/logout
 * - GET /auth/profile
 * - PATCH /auth/profile
 * - POST /auth/admins
 * - PATCH /auth/admins/:adminId
 * - GET /auth/admins
 * - GET /auth/test
 */

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
  CreateAdminDTO,
  UpdateAdminDTO,
  UserResponse,
  AdminListItemResponse,
  AuthTestResponse,
  ApiResponse,
  ApiError,
} from '../types/api.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

// ============================================================================
// LOGGING HELPER
// ============================================================================

/**
 * Helper para logging durante las pruebas de integración
 */
const logger = {
  /**
   * Log de request HTTP
   */
  request: (method: string, url: string, body?: any) => {
    console.log(`\n🔵 [AUTH REQUEST] ${method} ${url}`);
    if (body) {
      console.log('📤 Body:', JSON.stringify(body, null, 2));
    }
    console.log('⏱️  Time:', new Date().toISOString());
  },

  /**
   * Log de response exitosa
   */
  response: (method: string, url: string, status: number, data: any) => {
    console.log(`\n✅ [AUTH RESPONSE] ${method} ${url}`);
    console.log('📊 Status:', status);
    console.log('📥 Data:', JSON.stringify(data, null, 2));
    console.log('⏱️  Time:', new Date().toISOString());
  },

  /**
   * Log de error
   */
  error: (method: string, url: string, error: any) => {
    console.error(`\n❌ [AUTH ERROR] ${method} ${url}`);
    console.error('⚠️  Error:', error);
    if (error.statusCode) {
      console.error('📊 Status Code:', error.statusCode);
    }
    if (error.message) {
      console.error('💬 Message:', error.message);
    }
    if (error.details) {
      console.error('🔍 Details:', JSON.stringify(error.details, null, 2));
    }
    console.error('⏱️  Time:', new Date().toISOString());
  },

  /**
   * Log de token operations
   */
  token: (operation: string, tokenType: 'access' | 'refresh', value?: string) => {
    console.log(`\n🔑 [TOKEN ${operation.toUpperCase()}] ${tokenType}`);
    if (value) {
      console.log('🔐 Token:', value.substring(0, 20) + '...');
    }
    console.log('⏱️  Time:', new Date().toISOString());
  },

  /**
   * Log de operación de localStorage
   */
  storage: (operation: 'SET' | 'GET' | 'REMOVE', key: string, value?: any) => {
    console.log(`\n💾 [STORAGE ${operation}] ${key}`);
    if (value && operation === 'SET') {
      console.log('📦 Value:', typeof value === 'string' ? value.substring(0, 50) + '...' : value);
    }
    console.log('⏱️  Time:', new Date().toISOString());
  },
};

export class AuthServiceV2 {
  private baseUrl = `${API_BASE_URL}/api/auth`;

  /**
   * Helper: obtener token de autorización
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  /**
   * Helper: construir headers con autorización
   */
  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Helper: manejar respuestas de la API
   */
  private async handleResponse<T>(response: Response, method: string, url: string): Promise<ApiResponse<T>> {
    const data = await response.json();

    if (!response.ok) {
      const errorResponse = {
        success: false,
        error: {
          message: data.message || `Error ${response.status}`,
          code: data.code || `HTTP_${response.status}`,
          statusCode: response.status,
          details: data,
        },
      } as ApiResponse<T>;

      // Log del error
      logger.error(method, url, errorResponse.error);

      return errorResponse;
    }

    // Log de respuesta exitosa
    logger.response(method, url, response.status, data);

    return {
      success: true,
      data,
    };
  }

  // ============================================================================
  // ENDPOINTS PÚBLICOS (No requieren autenticación)
  // ============================================================================

  /**
   * POST /auth/register
   * Registro de nuevos padrinos
   * 
   * @param dto - Datos de registro
   * @returns { message: string, userId: number }
   * 
   * Errores:
   * - 409: Email o documento ya registrado
   * - 503: Servicio de auth no disponible
   */
  async register(dto: RegisterDTO): Promise<ApiResponse<RegisterResponse>> {
    try {
      const url = `${this.baseUrl}/register`;
      logger.request('POST', url, dto);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dto),
      });

      return this.handleResponse<RegisterResponse>(response, 'POST', url);
    } catch (error) {
      const errorObj = {
        message: error instanceof Error ? error.message : 'Error de red al registrar',
        code: 'NETWORK_ERROR',
      };
      logger.error('POST', `${this.baseUrl}/register`, errorObj);
      return {
        success: false,
        error: errorObj,
      };
    }
  }

  /**
   * POST /auth/login
   * Iniciar sesión
   * 
   * @param dto - Credenciales de acceso
   * @returns { accessToken, refreshToken, user }
   * 
   * Errores:
   * - 401: Credenciales inválidas
   * - 403: Cuenta bloqueada/inactiva/no verificada
   * - 503: Microservicio no responde
   */
  async login(dto: LoginDTO): Promise<ApiResponse<LoginResponse>> {
    try {
      const url = `${this.baseUrl}/login`;
      logger.request('POST', url, { email: dto.email, password: '***' });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dto),
      });

      const result = await this.handleResponse<LoginResponse>(response, 'POST', url);

      // Si el login es exitoso, guardar tokens
      if (result.success && result.data) {
        logger.token('SAVE', 'access', result.data.accessToken);
        logger.token('SAVE', 'refresh', result.data.refreshToken);
        logger.storage('SET', 'auth_token', result.data.accessToken);
        logger.storage('SET', 'refresh_token', result.data.refreshToken);

        localStorage.setItem('auth_token', result.data.accessToken);
        localStorage.setItem('refresh_token', result.data.refreshToken);
      }

      return result;
    } catch (error) {
      const errorObj = {
        message: error instanceof Error ? error.message : 'Error de red al iniciar sesión',
        code: 'NETWORK_ERROR',
      };
      logger.error('POST', `${this.baseUrl}/login`, errorObj);
      return {
        success: false,
        error: errorObj,
      };
    }
  }

  /**
   * POST /auth/verify-email
   * Verificar email con token
   * 
   * @param dto - { token }
   * @returns { message }
   * 
   * Errores:
   * - 400: Token inválido o expirado
   */
  async verifyEmail(dto: VerifyEmailDTO): Promise<ApiResponse<VerifyEmailResponse>> {
    try {
      const url = `${this.baseUrl}/verify-email`;
      logger.request('POST', url, dto);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dto),
      });

      return this.handleResponse<VerifyEmailResponse>(response, 'POST', url);
    } catch (error) {
      const errorObj = {
        message: error instanceof Error ? error.message : 'Error al verificar email',
        code: 'NETWORK_ERROR',
      };
      logger.error('POST', `${this.baseUrl}/verify-email`, errorObj);
      return {
        success: false,
        error: errorObj,
      };
    }
  }

  /**
   * POST /auth/password/request-reset
   * Solicitar restablecimiento de contraseña
   * 
   * @param dto - { email }
   * @returns { message } - Siempre retorna el mismo mensaje por seguridad
   */
  async requestPasswordReset(dto: RequestPasswordResetDTO): Promise<ApiResponse<RequestPasswordResetResponse>> {
    try {
      const url = `${this.baseUrl}/password/request-reset`;
      logger.request('POST', url, dto);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dto),
      });

      return this.handleResponse<RequestPasswordResetResponse>(response, 'POST', url);
    } catch (error) {
      const errorObj = {
        message: error instanceof Error ? error.message : 'Error al solicitar restablecimiento',
        code: 'NETWORK_ERROR',
      };
      logger.error('POST', `${this.baseUrl}/password/request-reset`, errorObj);
      return {
        success: false,
        error: errorObj,
      };
    }
  }

  /**
   * POST /auth/password/reset
   * Restablecer contraseña con token
   * 
   * @param dto - { token, newPassword }
   * @returns { message }
   * 
   * Errores:
   * - 400: Token inválido o expirado
   */
  async resetPassword(dto: ResetPasswordDTO): Promise<ApiResponse<ResetPasswordResponse>> {
    try {
      const url = `${this.baseUrl}/password/reset`;
      logger.request('POST', url, { token: dto.token, password: '***' });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dto),
      });

      return this.handleResponse<ResetPasswordResponse>(response, 'POST', url);
    } catch (error) {
      const errorObj = {
        message: error instanceof Error ? error.message : 'Error al restablecer contraseña',
        code: 'NETWORK_ERROR',
      };
      logger.error('POST', `${this.baseUrl}/password/reset`, errorObj);
      return {
        success: false,
        error: errorObj,
      };
    }
  }

  /**
   * POST /auth/refresh
   * Refrescar access token
   * 
   * @param dto - { refreshToken }
   * @returns { accessToken }
   * 
   * Errores:
   * - 401: Refresh token inválido o revocado
   */
  async refreshToken(dto: RefreshTokenDTO): Promise<ApiResponse<RefreshTokenResponse>> {
    try {
      const url = `${this.baseUrl}/refresh`;
      logger.request('POST', url, { refreshToken: dto.refreshToken.substring(0, 20) + '...' });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dto),
      });

      const result = await this.handleResponse<RefreshTokenResponse>(response, 'POST', url);

      // Si el refresh es exitoso, actualizar el access token
      if (result.success && result.data) {
        logger.token('UPDATE', 'access', result.data.accessToken);
        logger.storage('SET', 'auth_token', result.data.accessToken);
        localStorage.setItem('auth_token', result.data.accessToken);
      }

      return result;
    } catch (error) {
      const errorObj = {
        message: error instanceof Error ? error.message : 'Error al refrescar token',
        code: 'NETWORK_ERROR',
      };
      logger.error('POST', `${this.baseUrl}/refresh`, errorObj);
      return {
        success: false,
        error: errorObj,
      };
    }
  }

  /**
   * GET /auth/test
   * Verificar que el servicio de auth está funcionando
   * 
   * @returns { message, timestamp }
   */
  async testAuth(): Promise<ApiResponse<AuthTestResponse>> {
    try {
      const url = `${this.baseUrl}/test`;
      logger.request('GET', url);

      const response = await fetch(url, {
        method: 'GET',
      });

      return this.handleResponse<AuthTestResponse>(response, 'GET', url);
    } catch (error) {
      const errorObj = {
        message: error instanceof Error ? error.message : 'Error al conectar con el servicio',
        code: 'NETWORK_ERROR',
      };
      logger.error('GET', `${this.baseUrl}/test`, errorObj);
      return {
        success: false,
        error: errorObj,
      };
    }
  }

  // ============================================================================
  // ENDPOINTS PROTEGIDOS (Requieren autenticación)
  // ============================================================================

  /**
   * POST /auth/logout
   * Cerrar sesión
   * 
   * Requiere: Authorization Bearer token
   * 
   * @param dto - { refreshToken }
   * @returns { message }
   */
  async logout(dto: LogoutDTO): Promise<ApiResponse<LogoutResponse>> {
    try {
      const url = `${this.baseUrl}/logout`;
      logger.request('POST', url, { refreshToken: dto.refreshToken.substring(0, 20) + '...' });

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(dto),
      });

      const result = await this.handleResponse<LogoutResponse>(response, 'POST', url);

      // Limpiar tokens locales sin importar el resultado
      logger.storage('REMOVE', 'auth_token');
      logger.storage('REMOVE', 'refresh_token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');

      return result;
    } catch (error) {
      // Limpiar tokens incluso si hay error de red
      logger.storage('REMOVE', 'auth_token');
      logger.storage('REMOVE', 'refresh_token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');

      const errorObj = {
        message: error instanceof Error ? error.message : 'Error al cerrar sesión',
        code: 'NETWORK_ERROR',
      };
      logger.error('POST', `${this.baseUrl}/logout`, errorObj);
      return {
        success: false,
        error: errorObj,
      };
    }
  }

  /**
   * GET /auth/profile
   * Obtener perfil del usuario autenticado
   * 
   * Requiere: Authorization Bearer token
   * 
   * @returns Usuario completo (sin password)
   */
  async getProfile(): Promise<ApiResponse<UserResponse>> {
    try {
      const url = `${this.baseUrl}/profile`;
      logger.request('GET', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<UserResponse>(response, 'GET', url);
    } catch (error) {
      const errorObj = {
        message: error instanceof Error ? error.message : 'Error al obtener perfil',
        code: 'NETWORK_ERROR',
      };
      logger.error('GET', `${this.baseUrl}/profile`, errorObj);
      return {
        success: false,
        error: errorObj,
      };
    }
  }

  /**
   * PATCH /auth/profile
   * Actualizar perfil del usuario (solo PADRINO)
   * 
   * Requiere: Authorization Bearer token
   * Rol requerido: PADRINO
   * 
   * @param dto - { phone?, address?, avatar? }
   * @returns Usuario actualizado
   * 
   * Errores:
   * - 403: Si el usuario no es PADRINO
   * - 404: Usuario no encontrado
   */
  async updateProfile(dto: UpdateProfileDTO): Promise<ApiResponse<UserResponse>> {
    try {
      const url = `${this.baseUrl}/profile`;
      logger.request('PATCH', url, dto);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(dto),
      });

      return this.handleResponse<UserResponse>(response, 'PATCH', url);
    } catch (error) {
      const errorObj = {
        message: error instanceof Error ? error.message : 'Error al actualizar perfil',
        code: 'NETWORK_ERROR',
      };
      logger.error('PATCH', `${this.baseUrl}/profile`, errorObj);
      return {
        success: false,
        error: errorObj,
      };
    }
  }

  // ============================================================================
  // ENDPOINTS DE ADMINISTRACIÓN (Solo SUPER_ADMIN)
  // ============================================================================

  /**
   * POST /auth/admins
   * Crear nuevo administrador
   * 
   * Requiere: Authorization Bearer token
   * Rol requerido: SUPER_ADMIN
   * 
   * @param dto - { name, email, password, role }
   * @returns Admin creado (sin password)
   * 
   * Errores:
   * - 403: Solo super-admins
   * - 409: Email ya registrado
   */
  async createAdmin(dto: CreateAdminDTO): Promise<ApiResponse<UserResponse>> {
    try {
      const url = `${this.baseUrl}/admins`;
      logger.request('POST', url, { ...dto, password: '***' });

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(dto),
      });

      return this.handleResponse<UserResponse>(response, 'POST', url);
    } catch (error) {
      const errorObj = {
        message: error instanceof Error ? error.message : 'Error al crear administrador',
        code: 'NETWORK_ERROR',
      };
      logger.error('POST', `${this.baseUrl}/admins`, errorObj);
      return {
        success: false,
        error: errorObj,
      };
    }
  }

  /**
   * PATCH /auth/admins/:adminId
   * Actualizar administrador
   * 
   * Requiere: Authorization Bearer token
   * Rol requerido: SUPER_ADMIN
   * 
   * @param adminId - ID del administrador
   * @param dto - { name?, status? }
   * @returns Admin actualizado (sin password)
   * 
   * Errores:
   * - 403: Solo super-admins o intentar actualizarse a sí mismo
   * - 404: Administrador no encontrado
   */
  async updateAdmin(adminId: number, dto: UpdateAdminDTO): Promise<ApiResponse<UserResponse>> {
    try {
      const url = `${this.baseUrl}/admins/${adminId}`;
      logger.request('PATCH', url, dto);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(dto),
      });

      return this.handleResponse<UserResponse>(response, 'PATCH', url);
    } catch (error) {
      const errorObj = {
        message: error instanceof Error ? error.message : 'Error al actualizar administrador',
        code: 'NETWORK_ERROR',
      };
      logger.error('PATCH', `${this.baseUrl}/admins/${adminId}`, errorObj);
      return {
        success: false,
        error: errorObj,
      };
    }
  }

  /**
   * GET /auth/admins
   * Listar todos los administradores
   * 
   * Requiere: Authorization Bearer token
   * Rol requerido: SUPER_ADMIN
   * 
   * @returns Array de administradores con información detallada
   * 
   * Errores:
   * - 403: Solo super-admins
   */
  async getAdmins(): Promise<ApiResponse<AdminListItemResponse[]>> {
    try {
      const url = `${this.baseUrl}/admins`;
      logger.request('GET', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<AdminListItemResponse[]>(response, 'GET', url);
    } catch (error) {
      const errorObj = {
        message: error instanceof Error ? error.message : 'Error al obtener administradores',
        code: 'NETWORK_ERROR',
      };
      logger.error('GET', `${this.baseUrl}/admins`, errorObj);
      return {
        success: false,
        error: errorObj,
      };
    }
  }

  // ============================================================================
  // MÉTODOS AUXILIARES
  // ============================================================================

  /**
   * Verificar si hay una sesión activa
   */
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  /**
   * Obtener tokens actuales
   */
  getTokens(): { accessToken: string | null; refreshToken: string | null } {
    return {
      accessToken: this.getAuthToken(),
      refreshToken: typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null,
    };
  }

  /**
   * Limpiar todos los tokens
   */
  clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    }
  }
}

// Exportar instancia singleton
export const authServiceV2 = new AuthServiceV2();
