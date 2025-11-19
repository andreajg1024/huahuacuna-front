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
    console.warn('No refresh token available');
    return null;
  }

  // Si ya se está refrescando, esperar al resultado
  if (isRefreshing) {
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
      
      // Notificar a todos los suscriptores
      onTokenRefreshed(newAccessToken);
      isRefreshing = false;
      
      return newAccessToken;
    }
    
    isRefreshing = false;
    return null;
  } catch (error) {
    console.error('Error refreshing token:', error);
    isRefreshing = false;
    
    // Si el refresh falla, limpiar tokens y redirigir a login
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_user');
    
    // Redirigir a login (esto debe ser manejado por el contexto de Auth)
    window.location.href = '/#login';
    
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
  // Verificar cada 4 minutos si el token necesita refresh
  const interval = setInterval(async () => {
    const token = localStorage.getItem('auth_token');
    
    if (token && isTokenExpired(token)) {
      await attemptTokenRefresh();
    }
  }, 4 * 60 * 1000); // 4 minutos
  
  return () => clearInterval(interval);
}
