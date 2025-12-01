import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/auth.service';
import { UserResponse, RegisterPadrinoDTO } from '@/types/api.types';
import { setupTokenRefreshInterval } from '@/utils/tokenRefresh';

export type UserRole = 'super_admin' | 'admin' | 'padrino';
export type UserStatus = 'pending' | 'active' | 'blocked' | 'inactive';

export interface User {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  documento: string;
  direccion: string;
  role: UserRole;
  status: UserStatus;
  foto?: string;
  fechaRegistro: string;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegistrationData) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAuthenticated: boolean;
  failedAttempts: number;
  isBlocked: boolean;
  blockTimeRemaining: number;
}

interface RegistrationData {
  nombre: string;
  email: string;
  telefono: string;
  documento: string;
  direccion: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Convertir UserResponse de la API al formato User del contexto
 */
function mapApiUserToContextUser(apiUser: UserResponse): User {
  // Validación adicional para debugging
  if (!apiUser) {
    console.error('mapApiUserToContextUser recibió apiUser undefined o null');
    throw new Error('Datos de usuario inválidos');
  }

  if (!apiUser.id) {
    console.error('apiUser sin propiedad id:', apiUser);
    throw new Error('Usuario sin ID');
  }

  // Manejar createdAt que puede no existir
  let fechaRegistro = new Date().toISOString().split('T')[0]; // Fecha actual por defecto
  if (apiUser.createdAt) {
    try {
      fechaRegistro = new Date(apiUser.createdAt).toISOString().split('T')[0];
    } catch (error) {
      console.warn('Error al parsear createdAt, usando fecha actual:', error);
    }
  }

  return {
    id: String(apiUser.id),
    nombre: apiUser.name,
    email: apiUser.email,
    telefono: apiUser.phone || '',
    documento: apiUser.documentId || '',
    direccion: apiUser.address || '',
    role: mapApiRoleToContextRole(apiUser.role),
    status: mapApiStatusToContextStatus(apiUser.status),
    foto: apiUser.avatar,
    fechaRegistro,
    permissions: undefined, // TODO: Si el backend envía permisos, mapearlos aquí
  };
}

function mapApiRoleToContextRole(apiRole: 'PADRINO' | 'ADMIN' | 'SUPER_ADMIN'): UserRole {
  const roleMap: Record<string, UserRole> = {
    'PADRINO': 'padrino',
    'ADMIN': 'admin',
    'SUPER_ADMIN': 'super_admin',
  };
  return roleMap[apiRole] || 'padrino';
}

function mapApiStatusToContextStatus(apiStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING'): UserStatus {
  const statusMap: Record<string, UserStatus> = {
    'ACTIVE': 'active',
    'INACTIVE': 'inactive',
    'SUSPENDED': 'blocked',
    'PENDING': 'pending',
  };
  return statusMap[apiStatus] || 'pending';
}

/**
 * AuthProvider con integración real al backend mediante authService
 * - Login con endpoint REST /auth/login
 * - Registro con endpoint REST /auth/register
 * - Actualización de perfil con endpoint REST /auth/profile
 * - Bloqueo temporal por intentos fallidos (manejado en el frontend)
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [blockUntil, setBlockUntil] = useState<number | null>(null);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);

  // Check for existing session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    const storedBlockUntil = localStorage.getItem('block_until');

    if (storedBlockUntil) {
      const blockTime = parseInt(storedBlockUntil);
      if (blockTime > Date.now()) {
        setBlockUntil(blockTime);
      } else {
        localStorage.removeItem('block_until');
      }
    }

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
      } catch (error) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
  }, []);

  // Block timer countdown
  useEffect(() => {
    if (blockUntil) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, blockUntil - Date.now());
        setBlockTimeRemaining(Math.ceil(remaining / 1000));

        if (remaining <= 0) {
          setBlockUntil(null);
          setFailedAttempts(0);
          localStorage.removeItem('block_until');
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [blockUntil]);

  // Setup automatic token refresh when user is authenticated
  useEffect(() => {
    if (token && user) {
      // Iniciar verificación periódica de token refresh
      const cleanup = setupTokenRefreshInterval();
      return cleanup;
    }
  }, [token, user]);

  const login = async (email: string, password: string) => {
    // Check if blocked
    if (blockUntil && blockUntil > Date.now()) {
      throw new Error('Cuenta bloqueada temporalmente. Intenta más tarde.');
    }

    try {
      console.log('🔑 Iniciando proceso de login...');

      // Llamar al servicio real de autenticación
      const response = await authService.login({ email, password });

      if (!response.success || !response.data) {
        // Incrementar intentos fallidos
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);

        if (newAttempts >= 5) {
          const blockTime = Date.now() + 15 * 60 * 1000; // 15 minutes
          setBlockUntil(blockTime);
          localStorage.setItem('block_until', blockTime.toString());
          throw new Error('Cuenta bloqueada temporalmente por 15 minutos');
        }

        throw new Error(response.error?.message || `Credenciales incorrectas. Te quedan ${5 - newAttempts} intentos.`);
      }

      // Validar que la respuesta tenga los datos necesarios
      if (!response.data.user || !response.data.accessToken) {
        throw new Error('Respuesta del servidor inválida. Por favor, intenta nuevamente.');
      }

      console.log('✅ Login exitoso, procesando usuario...');

      // Login exitoso
      setFailedAttempts(0);
      localStorage.removeItem('block_until');

      // Convertir usuario de la API al formato del contexto
      const contextUser = mapApiUserToContextUser(response.data.user);

      console.log('👤 Usuario convertido:', contextUser);
      console.log('🔐 Token:', response.data.accessToken.substring(0, 20) + '...');

      setUser(contextUser);
      setToken(response.data.accessToken);
      
      // authService ya guarda los tokens en localStorage, 
      // pero guardamos también el usuario en formato del contexto
      localStorage.setItem('auth_user', JSON.stringify(contextUser));

      console.log('💾 Estado actualizado - user:', !!contextUser, 'token:', !!response.data.accessToken);
      console.log('🎯 isAuthenticated debería ser:', !!(contextUser && response.data.accessToken));

    } catch (error) {
      console.error('❌ Error en login:', error);
      // Manejar errores de red o del servicio
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al iniciar sesión. Intenta nuevamente.');
    }
  };

  const logout = async () => {
    try {
      // Intentar logout en el backend
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken && token) {
        await authService.logout({ refreshToken });
      }
    } catch (error) {
      console.error('Error al cerrar sesión en el backend:', error);
      // Continuar con el logout local incluso si falla el backend
    } finally {
      // Limpiar estado local
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth_user');
    }
  };

  const register = async (data: RegistrationData) => {
    try {
      // Mapear datos del formulario al formato de la API
      const registerDTO: RegisterPadrinoDTO = {
        name: data.nombre,
        email: data.email,
        password: data.password,
        phone: data.telefono,
        documentId: data.documento,
        address: data.direccion,
      };

      const response = await authService.register(registerDTO);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al registrar usuario');
      }

      // Registro exitoso - el usuario quedará en estado 'pending' hasta verificar email
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al registrar usuario. Intenta nuevamente.');
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      // Mapear solo los campos que la API permite actualizar
      const updateDTO: any = {};
      if (data.telefono !== undefined) updateDTO.phone = data.telefono;
      if (data.direccion !== undefined) updateDTO.address = data.direccion;
      if (data.foto !== undefined) updateDTO.avatar = data.foto;

      const response = await authService.updateProfile(updateDTO);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al actualizar perfil');
      }

      // Actualizar usuario en el contexto
      const updatedContextUser = mapApiUserToContextUser(response.data);
      setUser(updatedContextUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedContextUser));

    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al actualizar perfil. Intenta nuevamente.');
    }
  };

  const refreshProfile = async () => {
    if (!user || !token) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const response = await authService.getProfile();

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al obtener perfil');
      }

      // Actualizar usuario en el contexto
      const updatedContextUser = mapApiUserToContextUser(response.data);
      setUser(updatedContextUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedContextUser));

    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al obtener perfil. Intenta nuevamente.');
    }
  };

  const value = {
    user,
    token,
    login,
    logout,
    register,
    updateProfile,
    refreshProfile,
    isAuthenticated: !!user && !!token,
    failedAttempts,
    isBlocked: blockUntil ? blockUntil > Date.now() : false,
    blockTimeRemaining,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
