/**
 * withAuth HOC - Higher Order Component
 * 
 * HOC para proteger rutas y verificar autenticación
 * 
 * Uso:
 * ```typescript
 * export default withAuth(MyPage, {
 *   requireAuth: true,
 *   requiredRole: 'ADMIN',
 *   requireEmailVerified: true
 * });
 * ```
 */

import { useEffect, ComponentType } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '@/contexts/AuthContext.v2';
import { UserRole } from '@/types/api.types';

// ============================================================================
// TYPES
// ============================================================================

interface WithAuthOptions {
  /**
   * Si la página requiere autenticación
   * @default true
   */
  requireAuth?: boolean;

  /**
   * Rol requerido para acceder (o array de roles permitidos)
   */
  requiredRole?: UserRole | UserRole[];

  /**
   * Si requiere email verificado
   * @default false
   */
  requireEmailVerified?: boolean;

  /**
   * Ruta a la que redirigir si no está autenticado
   * @default '/login'
   */
  redirectTo?: string;

  /**
   * Ruta a la que redirigir si no tiene permisos
   * @default '/unauthorized'
   */
  unauthorizedRedirect?: string;
}

// ============================================================================
// HOC
// ============================================================================

/**
 * Higher Order Component para protección de rutas
 */
export function withAuth<P extends object>(
  Component: ComponentType<P>,
  options: WithAuthOptions = {}
): ComponentType<P> {
  const {
    requireAuth = true,
    requiredRole,
    requireEmailVerified = false,
    redirectTo = '/login',
    unauthorizedRedirect = '/unauthorized',
  } = options;

  const WithAuthComponent = (props: P): JSX.Element | null => {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuthContext();

    useEffect(() => {
      // Esperar a que termine de cargar
      if (isLoading) return;

      // Verificar autenticación
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      // Verificar email verificado
      if (requireEmailVerified && user && !user.emailVerified) {
        router.push('/verify-email');
        return;
      }

      // Verificar rol
      if (requiredRole && user) {
        const hasRequiredRole = Array.isArray(requiredRole)
          ? requiredRole.includes(user.role)
          : user.role === requiredRole;

        if (!hasRequiredRole) {
          router.push(unauthorizedRedirect);
          return;
        }
      }
    }, [isAuthenticated, isLoading, user, router]);

    // Mostrar loading mientras verifica
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        </div>
      );
    }

    // No mostrar nada si no está autenticado (se está redirigiendo)
    if (requireAuth && !isAuthenticated) {
      return null;
    }

    // Verificar rol
    if (requiredRole && user) {
      const hasRequiredRole = Array.isArray(requiredRole)
        ? requiredRole.includes(user.role)
        : user.role === requiredRole;

      if (!hasRequiredRole) {
        return null;
      }
    }

    // Verificar email verificado
    if (requireEmailVerified && user && !user.emailVerified) {
      return null;
    }

    // Renderizar componente
    return <Component {...props} />;
  };

  return WithAuthComponent;
}

// ============================================================================
// PRESETS DE USO COMÚN
// ============================================================================

/**
 * Protección básica - Solo requiere autenticación
 */
export function withAuthBasic<P extends object>(Component: ComponentType<P>): ComponentType<P> {
  return withAuth(Component, {
    requireAuth: true,
  });
}

/**
 * Protección para padrinos
 */
export function withPadrinoAuth<P extends object>(Component: ComponentType<P>): ComponentType<P> {
  return withAuth(Component, {
    requireAuth: true,
    requiredRole: 'PADRINO',
    requireEmailVerified: true,
  });
}

/**
 * Protección para administradores
 */
export function withAdminAuth<P extends object>(Component: ComponentType<P>): ComponentType<P> {
  return withAuth(Component, {
    requireAuth: true,
    requiredRole: ['ADMIN', 'SUPER_ADMIN'],
  });
}

/**
 * Protección para super administradores
 */
export function withSuperAdminAuth<P extends object>(Component: ComponentType<P>): ComponentType<P> {
  return withAuth(Component, {
    requireAuth: true,
    requiredRole: 'SUPER_ADMIN',
  });
}

/**
 * Protección para páginas públicas (redirige a dashboard si ya está autenticado)
 */
export function withGuest<P extends object>(Component: ComponentType<P>): ComponentType<P> {
  const WithGuestComponent = (props: P): JSX.Element | null => {
    const router = useRouter();
    const { isAuthenticated, isLoading, user } = useAuthContext();

    useEffect(() => {
      if (isLoading) return;

      if (isAuthenticated && user) {
        // Redirigir al dashboard apropiado según el rol
        switch (user.role) {
          case 'SUPER_ADMIN':
          case 'ADMIN':
            router.push('/admin/dashboard');
            break;
          case 'PADRINO':
            router.push('/padrino/dashboard');
            break;
          default:
            router.push('/dashboard');
        }
      }
    }, [isAuthenticated, isLoading, user, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    if (isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };

  return WithGuestComponent;
}
