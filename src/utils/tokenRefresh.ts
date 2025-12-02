/**
 * Token Refresh Utility
 * 
 * Maneja automáticamente el refresh del access token cuando expira
 * Se puede usar como interceptor para requests HTTP
 */

import { authService } from '@/services/auth.service';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

/**
 * Suscribe un callback para ser ejecutado cuando el token se refresque
 */
function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

/**
 * Ejecuta todos los callbacks suscritos con el nuevo token
 */
function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
}

/**
 * Verifica si el access token está expirado o próximo a expirar
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convertir a milisegundos
    const now = Date.now();
    
    // Considerar expirado si quedan menos de 5 minutos
    return exp - now < 5 * 60 * 1000;
  } catch (error) {
    return true;
  }
}

/**
 * Intenta refrescar el access token usando el refresh token
 */
export async function attemptTokenRefresh(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    console.warn('[TokenRefresh] No refresh token available');
    return null;
  }

  console.log('[TokenRefresh] Iniciando refresh de token...');

  // Si ya se está refrescando, esperar al resultado
  if (isRefreshing) {
    console.log('[TokenRefresh] Ya hay un refresh en curso, esperando...');
    return new Promise((resolve) => {
      subscribeTokenRefresh((token: string) => {
        resolve(token);
      });
    });
  }

  isRefreshing = true;

  try {
    const response = await authService.refreshToken({ refreshToken });
    
    if (response.success && response.data.accessToken) {
      const newAccessToken = response.data.accessToken;
      console.log('[TokenRefresh] Token refrescado exitosamente');
      
      // Notificar a todos los suscriptores
      onTokenRefreshed(newAccessToken);
      isRefreshing = false;
      
      return newAccessToken;
    }
    
    console.warn('[TokenRefresh] Respuesta de refresh sin éxito:', response);
    isRefreshing = false;
    return null;
  } catch (error) {
    console.error('[TokenRefresh] Error al refrescar token:', error);
    isRefreshing = false;
    
    // IMPORTANTE: Solo limpiar tokens si es un error de autenticación real (401/403)
    // No limpiar si es un error de red temporal
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('Unauthorized')) {
      console.error('[TokenRefresh] Error de autenticación, limpiando sesión');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth_user');
      
      // Redirigir a login (esto debe ser manejado por el contexto de Auth)
      window.location.href = '/#login';
    } else {
      console.warn('[TokenRefresh] Error temporal, manteniendo sesión');
    }
    
    return null;
  }
}

/**
 * Interceptor para fetch que refresca automáticamente el token
 * Uso: await fetchWithAuth(url, options)
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem('auth_token');
  
  // Si no hay token, hacer request normal
  if (!token) {
    return fetch(url, options);
  }
  
  // Si el token está expirado o próximo a expirar, refrescarlo
  if (isTokenExpired(token)) {
    const newToken = await attemptTokenRefresh();
    
    if (!newToken) {
      throw new Error('No se pudo refrescar el token');
    }
  }
  
  // Agregar token al header
  const authToken = localStorage.getItem('auth_token');
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${authToken}`,
  };
  
  // Hacer el request
  const response = await fetch(url, { ...options, headers });
  
  // Si obtenemos 401, intentar refrescar y reintentar
  if (response.status === 401) {
    const newToken = await attemptTokenRefresh();
    
    if (newToken) {
      // Reintentar con el nuevo token
      const retryHeaders = {
        ...options.headers,
        'Authorization': `Bearer ${newToken}`,
      };
      
      return fetch(url, { ...options, headers: retryHeaders });
    }
  }
  
  return response;
}

/**
 * Hook personalizado para verificar y refrescar tokens en intervalos
 * Uso en componentes React
 */
export function setupTokenRefreshInterval() {
  console.log('[TokenRefresh] Configurando intervalo de verificación de token');
  
  // Verificar cada 4 minutos si el token necesita refresh
  const interval = setInterval(async () => {
    const token = localStorage.getItem('auth_token');
    
    if (token && isTokenExpired(token)) {
      console.log('[TokenRefresh] Token próximo a expirar, refrescando...');
      await attemptTokenRefresh();
    }
  }, 4 * 60 * 1000); // 4 minutos
  
  return () => {
    console.log('[TokenRefresh] Limpiando intervalo de verificación de token');
    clearInterval(interval);
  };
}
