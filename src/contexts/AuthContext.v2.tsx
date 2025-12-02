/**
 * AuthContext V2 - Contexto Actualizado
 * 
 * Contexto de autenticación integrado con useAuthV2
 * Proporciona estado global de autenticación para toda la aplicación
 * 
 * Features:
 * - Integración con useAuthV2
 * - Persistencia de sesión
 * - Refresh automático de perfil
 * - Protección de rutas
 * - Redirección automática
 */

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuthV2 } from '@/hooks';
import { UserResponse, LoginDTO, RegisterDTO } from '@/types/api.types';

// ============================================================================
// TYPES
// ============================================================================

interface AuthContextType {
  // Estado
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Métodos de autenticación
  login: (credentials: LoginDTO) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (data: RegisterDTO) => Promise<boolean>;

  // Gestión de perfil
  refreshProfile: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserResponse>) => void;

  // Verificaciones
  hasRole: (role: string | string[]) => boolean;
  isEmailVerified: () => boolean;
}

// ============================================================================
// CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProviderV2({ children }: AuthProviderProps) {
  const router = useRouter();
  const {
    login: authLogin,
    logout: authLogout,
    register: authRegister,
    getProfile,
    isAuthenticated: checkAuth,
  } = useAuthV2();

  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Cargar perfil del usuario al montar el componente
   */
  useEffect(() => {
    loadUserProfile();
  }, []);

  /**
   * Cargar perfil del usuario desde el servidor
   */
  const loadUserProfile = async () => {
    setIsLoading(true);

    try {
      // Verificar si hay token
      if (!checkAuth()) {
        setUser(null);
        return;
      }

      // Intentar cargar perfil
      const profile = await getProfile();

      if (profile) {
        setUser(profile);
        // Guardar en localStorage para persistencia
        localStorage.setItem('user_profile', JSON.stringify(profile));
      } else {
        // Si falla, limpiar sesión
        setUser(null);
        localStorage.removeItem('user_profile');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Iniciar sesión
   */
  const login = useCallback(async (credentials: LoginDTO): Promise<boolean> => {
    try {
      const result = await authLogin(credentials);

      if (result) {
        setUser(result.user);
        localStorage.setItem('user_profile', JSON.stringify(result.user));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    }
  }, [authLogin]);

  /**
   * Registrar nuevo usuario
   */
  const register = useCallback(async (data: RegisterDTO): Promise<boolean> => {
    try {
      const result = await authRegister(data);

      if (result) {
        // Registro exitoso - el usuario debe verificar su email
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error en registro:', error);
      return false;
    }
  }, [authRegister]);

  /**
   * Cerrar sesión
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        await authLogout({ refreshToken });
      }

      // Limpiar estado
      setUser(null);
      localStorage.removeItem('user_profile');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');

      // Redirigir a login
      router.push('/login');
    } catch (error) {
      console.error('Error en logout:', error);
      // Limpiar de todas formas
      setUser(null);
      localStorage.clear();
      router.push('/login');
    }
  }, [authLogout, router]);

  /**
   * Refrescar perfil del usuario
   */
  const refreshProfile = useCallback(async (): Promise<void> => {
    await loadUserProfile();
  }, []);

  /**
   * Actualizar perfil del usuario localmente
   * (sin llamar al servidor - útil después de una actualización)
   */
  const updateUserProfile = useCallback((updates: Partial<UserResponse>): void => {
    setUser((prev: UserResponse | null) => {
      if (!prev) return null;

      const updated = { ...prev, ...updates };
      localStorage.setItem('user_profile', JSON.stringify(updated));
      return updated;
    });
  }, []);

  /**
   * Verificar si el usuario tiene un rol específico
   */
  const hasRole = useCallback((role: string | string[]): boolean => {
    if (!user) return false;

    if (Array.isArray(role)) {
      return role.includes(user.role);
    }

    return user.role === role;
  }, [user]);

  /**
   * Verificar si el email está verificado
   */
  const isEmailVerified = useCallback((): boolean => {
    return user?.emailVerified ?? false;
  }, [user]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: AuthContextType = {
    // Estado
    user,
    isAuthenticated: !!user,
    isLoading,

    // Métodos de autenticación
    login,
    logout,
    register,

    // Gestión de perfil
    refreshProfile,
    updateUserProfile,

    // Verificaciones
    hasRole,
    isEmailVerified,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook para usar el contexto de autenticación
 */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuthContext must be used within AuthProviderV2');
  }

  return context;
}

// ============================================================================
// EXPORT ALIASES
// ============================================================================

export const AuthProvider = AuthProviderV2;
export const useAuth = useAuthContext;
