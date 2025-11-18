/**
 * Context Helpers
 * 
 * Utility functions for integrating contexts with API services
 */

import { toast } from 'sonner';

export interface ApiCallOptions {
  successMessage?: string;
  errorMessage?: string;
  fallbackValue?: any;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  skipSuccessToast?: boolean;
  skipErrorToast?: boolean;
}

/**
 * Wrapper genérico para llamadas a API con manejo de errores
 */
export async function withApiCall<T>(
  apiCall: () => Promise<T>,
  options: ApiCallOptions = {}
): Promise<T | null> {
  const {
    successMessage,
    errorMessage = 'Ocurrió un error',
    fallbackValue = null,
    onSuccess,
    onError,
    skipSuccessToast = false,
    skipErrorToast = false,
  } = options;

  try {
    const result = await apiCall();
    
    if (successMessage && !skipSuccessToast) {
      toast.success(successMessage);
    }
    
    if (onSuccess) {
      onSuccess(result);
    }
    
    return result;
  } catch (error) {
    console.error('API Call Error:', error);
    
    const message = error instanceof Error ? error.message : errorMessage;
    if (!skipErrorToast) {
      toast.error(message);
    }
    
    if (onError) {
      onError(error);
    }
    
    return fallbackValue;
  }
}

/**
 * Wrapper para respuestas de API que tienen success/error
 */
export async function withApiResponse<T>(
  apiCall: () => Promise<{ success: boolean; data?: T; error?: any }>,
  options: ApiCallOptions = {}
): Promise<T | null> {
  return withApiCall(async () => {
    const response = await apiCall();
    
    if (!response.success) {
      throw new Error(response.error?.message || options.errorMessage || 'Error en la petición');
    }
    
    if (!response.data && options.fallbackValue === undefined) {
      throw new Error('No se recibieron datos del servidor');
    }
    
    return response.data!;
  }, options);
}

/**
 * Helper para obtener userId desde el contexto de autenticación
 */
export function getUserId(user: any): number {
  if (!user || !user.id) {
    throw new Error('Usuario no autenticado');
  }
  
  const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
  
  if (isNaN(userId) || userId === 0) {
    throw new Error('ID de usuario inválido');
  }
  
  return userId;
}

/**
 * Helper para ejecutar una función con fallback
 */
export async function withFallback<T>(
  primary: () => Promise<T>,
  fallback: () => T,
  options: { logError?: boolean } = {}
): Promise<T> {
  try {
    return await primary();
  } catch (error) {
    if (options.logError !== false) {
      console.error('Primary function failed, using fallback:', error);
    }
    return fallback();
  }
}

/**
 * Helper para batch operations
 */
export async function batchApiCalls<T>(
  calls: Array<() => Promise<T>>,
  options: {
    parallel?: boolean;
    stopOnError?: boolean;
    onProgress?: (completed: number, total: number) => void;
  } = {}
): Promise<Array<T | null>> {
  const { parallel = false, stopOnError = false, onProgress } = options;
  const results: Array<T | null> = [];

  if (parallel) {
    const promises = calls.map((call) =>
      withApiCall(call, { skipSuccessToast: true, skipErrorToast: true })
    );
    return Promise.all(promises);
  } else {
    for (let i = 0; i < calls.length; i++) {
      try {
        const result = await withApiCall(calls[i], {
          skipSuccessToast: true,
          skipErrorToast: true,
        });
        results.push(result);
        
        if (onProgress) {
          onProgress(i + 1, calls.length);
        }
      } catch (error) {
        results.push(null);
        
        if (stopOnError) {
          break;
        }
      }
    }
    
    return results;
  }
}

/**
 * Helper para retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delayMs?: number;
    backoff?: boolean;
  } = {}
): Promise<T> {
  const { maxRetries = 3, delayMs = 1000, backoff = true } = options;
  
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        const delay = backoff ? delayMs * Math.pow(2, attempt - 1) : delayMs;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}
