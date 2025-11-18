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
    return localStorage.getItem('token');
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
      
      const response = await fetch(url, {
        ...fetchConfig,
        headers: {
          ...this.buildHeaders(requiresAuth),
          ...fetchConfig.headers,
        },
      });

      // Parse response
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

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
    } catch (error) {
      console.error('API Request Error:', error);
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
    return this.post<T>(`/kafka/${topic}`, payload, config);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing/custom instances
export default ApiClient;
