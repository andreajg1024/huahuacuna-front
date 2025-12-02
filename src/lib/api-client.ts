/**
 * API Client - Base HTTP client for backend communication
 * 
 * Features:
 * - Automatic token injection from localStorage
 * - Error handling and response transformation
 * - Support for Kafka-based endpoints
 */

import { ApiResponse } from '@/types/api.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

interface RequestConfig extends RequestInit {
  requiresAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get authorization token from localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    // Intentar obtener el token de diferentes keys por compatibilidad
    const token = localStorage.getItem('auth_token') || localStorage.getItem('accessToken') || localStorage.getItem('token');
    console.log('[ApiClient] getAuthToken - Token encontrado:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
    return token;
  }

  /**
   * Build request headers
   */
  private buildHeaders(requiresAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (requiresAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('[ApiClient] buildHeaders - Authorization header agregado');
      } else {
        console.warn('[ApiClient] buildHeaders - NO SE ENCONTRÓ TOKEN, Authorization header NO agregado');
      }
    }

    return headers;
  }

  /**
   * Generic request method
   */
  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const { requiresAuth = true, ...fetchConfig } = config;

    try {
      const url = `${this.baseUrl}${endpoint}`;
      
      const headers = {
        ...this.buildHeaders(requiresAuth),
        ...fetchConfig.headers,
      };

      console.log('[ApiClient] Request:', {
        method: fetchConfig.method || 'GET',
        url,
        hasAuthHeader: !!headers['Authorization'],
        headers
      });
      
      // Crear AbortController para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos
      
      try {
        const response = await fetch(url, {
          ...fetchConfig,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Parse response
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        console.log('[ApiClient] Response:', {
          status: response.status,
          ok: response.ok,
          contentType,
          data: typeof data === 'object' ? JSON.stringify(data).substring(0, 200) : data
        });

        // Handle HTTP errors
        if (!response.ok) {
          return {
            success: false,
            error: {
              message: data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`,
              code: data?.code || `HTTP_${response.status}`,
              details: data,
            },
          };
        }

        return {
          success: true,
          data,
        };
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          console.error('[ApiClient] Request timeout after 30s');
          return {
            success: false,
            error: {
              message: 'La petición tardó demasiado tiempo. El servidor puede estar procesando la solicitud.',
              code: 'TIMEOUT',
              details: { timeout: 30000 },
            },
          };
        }
        
        throw fetchError;
      }
    } catch (error) {
      console.error('[ApiClient] Request Error:', error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          code: 'NETWORK_ERROR',
          details: error,
        },
      };
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    body?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    body?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    body?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'DELETE',
    });
  }

  /**
   * POST to Kafka topic (assuming backend exposes /kafka/:topic endpoint)
   */
  async sendToKafka<T>(
    topic: string,
    payload: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    console.log(`[ApiClient] sendToKafka - Topic: ${topic}`);
    console.log('[ApiClient] sendToKafka - Payload:', payload);
    console.log('[ApiClient] sendToKafka - Payload size:', JSON.stringify(payload).length, 'bytes');
    
    const response = await this.post<T>(`/kafka/${topic}`, payload, config);
    
    // Si hay error, enviarlo al backend para logging
    if (!response.success && response.error) {
      this.logErrorToBackend({
        topic,
        payload,
        error: response.error,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      }).catch(err => {
        console.error('[ApiClient] Failed to log error to backend:', err);
      });
    }
    
    return response;
  }

  /**
   * Log frontend errors to backend for monitoring
   */
  private async logErrorToBackend(errorData: {
    topic: string;
    payload: any;
    error: any;
    timestamp: string;
    userAgent: string;
  }): Promise<void> {
    try {
      // Enviar error al endpoint de logging del backend
      await this.post('/api/logs/frontend-error', errorData, { requiresAuth: false });
    } catch (error) {
      // Silently fail - no queremos crear un loop infinito de errores
      console.error('[ApiClient] Error logging to backend:', error);
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing/custom instances
export default ApiClient;
