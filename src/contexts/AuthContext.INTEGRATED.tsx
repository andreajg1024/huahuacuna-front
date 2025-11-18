/**
 * Updated AuthContext using useAuth hook
 * 
 * Este contexto ahora usa el hook useAuth internamente
 * Mantiene la compatibilidad con componentes existentes
 */

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth as useAuthHook } from '../hooks/useAuth';
import { UserResponse, LoginDTO, RegisterPadrinoDTO, UpdateProfileDTO } from '../types/api.types';

// Tipos exportados para compatibilidad
export type UserRole = 'PADRINO' | 'ADMIN' | 'SUPER_ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';

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
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
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
 * AuthProvider mejorado con integración real al backend
 * Usa el hook useAuth internamente para todas las operaciones
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const authHook = useAuthHook();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Cargar sesión existente al montar
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(mapUserResponseToUser(parsedUser));
        setToken(storedToken);
      } catch (error) {
        // Si hay error al parsear, limpiar storage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
  }, []);

  /**
   * Login con integración real
   */
  const login = useCallback(async (email: string, password: string) => {
    const loginDTO: LoginDTO = { email, password };
    const result = await authHook.login(loginDTO);

    if (result) {
      const mappedUser = mapUserResponseToUser(result.user);
      setUser(mappedUser);
      setToken(result.accessToken);
    } else if (authHook.error) {
      throw new Error(authHook.error.message);
    }
  }, [authHook]);

  /**
   * Logout con integración real
   */
  const logout = useCallback(() => {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (refreshToken) {
      // Intentar logout en backend (no bloqueante)
      authHook.logout({ refreshToken }).catch(() => {
        // Ignorar errores del backend en logout
      });
    }

    // Limpiar estado local
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_user');
  }, [authHook]);

  /**
   * Registro con integración real
   */
  const register = useCallback(async (data: RegistrationData) => {
    const registerDTO: RegisterPadrinoDTO = {
      name: data.nombre,
      email: data.email,
      password: data.password,
      phone: data.telefono,
      documentId: data.documento,
      address: data.direccion,
    };

    const result = await authHook.register(registerDTO);

    if (!result && authHook.error) {
      throw new Error(authHook.error.message);
    }
  }, [authHook]);

  /**
   * Actualizar perfil con integración real
   */
  const updateProfile = useCallback(async (data: Partial<User>) => {
    const updateDTO: UpdateProfileDTO = {
      phone: data.telefono,
      address: data.direccion,
      avatar: data.foto,
    };

    const result = await authHook.updateProfile(updateDTO);

    if (result) {
      const updatedUser = mapUserResponseToUser(result);
      setUser(updatedUser);
    } else if (authHook.error) {
      throw new Error(authHook.error.message);
    }
  }, [authHook]);

  const value = {
    user,
    token,
    login,
    logout,
    register,
    updateProfile,
    isAuthenticated: !!user && !!token,
    loading: authHook.loading,
    error: authHook.error?.message || null,
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

/**
 * Helper: Mapear UserResponse del backend al User del contexto
 */
function mapUserResponseToUser(userResponse: UserResponse): User {
  return {
    id: userResponse.id.toString(),
    nombre: userResponse.name,
    email: userResponse.email,
    telefono: userResponse.phone || '',
    documento: userResponse.documentId || '',
    direccion: userResponse.address || '',
    role: userResponse.role,
    status: userResponse.status,
    foto: userResponse.avatar,
    fechaRegistro: new Date(userResponse.createdAt).toISOString().split('T')[0],
    permissions: undefined, // Puede agregarse si el backend lo devuelve
  };
}
