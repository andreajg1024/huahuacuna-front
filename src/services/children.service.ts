/**
 * Children Service
 * 
 * Servicio para gestión de niños disponibles para apadrinamiento
 * Implementa 7 endpoints del módulo CHILDREN con logging comprehensivo
 * 
 * Endpoints:
 * 1. POST /children - Crear niño (Admin)
 * 2. GET /children/available - Niños disponibles (Público)
 * 3. GET /children/filter - Filtrar niños (Público)
 * 4. GET /children - Todos los niños (Admin)
 * 5. GET /children/:id - Detalle de niño (Público)
 * 6. PATCH /children/:id - Actualizar niño (Admin)
 * 7. DELETE /children/:id - Eliminar niño (Admin)
 */

import { apiClient } from '@/lib/api-client';
import type {
  ApiResponse,
  CreateChildDTO,
  ChildResponse,
  AvailableChildrenResponse,
  FilterChildrenDTO,
  FilteredChildrenResponse,
  AllChildrenResponse,
  UpdateChildDTO,
  PaginationDTO,
} from '@/types/api.types';

// ============================================================================
// LOGGER HELPER
// ============================================================================

const logger = {
  request: (endpoint: string, method: string, data?: any) => {
    console.log(`\n👶 [CHILDREN REQUEST] ${method} ${endpoint}`);
    if (data) {
      console.log('📤 [CHILDREN REQUEST DATA]', data);
    }
  },

  response: (endpoint: string, data: any) => {
    console.log(`✅ [CHILDREN RESPONSE] ${endpoint}`);
    console.log('📥 [CHILDREN RESPONSE DATA]', data);
  },

  error: (endpoint: string, error: any) => {
    console.error(`❌ [CHILDREN ERROR] ${endpoint}`);
    console.error('🔴 [CHILDREN ERROR DETAILS]', {
      message: error?.response?.data?.message || error?.message,
      statusCode: error?.response?.status,
      code: error?.response?.data?.code,
      details: error?.response?.data?.details,
    });
  },

  token: (action: string, token?: string) => {
    if (token) {
      console.log(`🔑 [CHILDREN TOKEN] ${action}:`, token.substring(0, 20) + '...');
    }
  },
};

// ============================================================================
// CHILDREN SERVICE
// ============================================================================

export const childrenService = {
  /**
   * 1. POST /children
   * Crear nuevo niño (Solo Admin)
   */
  async createChild(data: CreateChildDTO): Promise<ApiResponse<ChildResponse>> {
    const endpoint = '/children';
    logger.request(endpoint, 'POST', data);

    try {
      const token = localStorage.getItem('accessToken');
      logger.token('usando token', token || undefined);

      const response = await apiClient.post<ChildResponse>(endpoint, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      logger.response(endpoint, response.data);

      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      logger.error(endpoint, error);

      return {
        error: {
          message: error?.response?.data?.message || 'Error al crear niño',
          statusCode: error?.response?.status,
          code: error?.response?.data?.code,
          details: error?.response?.data?.details,
        },
        success: false,
      };
    }
  },

  /**
   * 2. GET /children/available
   * Obtener niños disponibles para apadrinar (Público)
   */
  async getAvailableChildren(params?: PaginationDTO): Promise<ApiResponse<AvailableChildrenResponse>> {
    const endpoint = '/children/available';
    logger.request(endpoint, 'GET', params);

    try {
      const response = await apiClient.get<AvailableChildrenResponse>(endpoint, {
        params,
      });

      logger.response(endpoint, response.data);

      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      logger.error(endpoint, error);

      return {
        error: {
          message: error?.response?.data?.message || 'Error al obtener niños disponibles',
          statusCode: error?.response?.status,
          code: error?.response?.data?.code,
          details: error?.response?.data?.details,
        },
        success: false,
      };
    }
  },

  /**
   * 3. GET /children/filter
   * Filtrar niños disponibles (Público)
   */
  async filterChildren(filters: FilterChildrenDTO): Promise<ApiResponse<FilteredChildrenResponse>> {
    const endpoint = '/children/filter';
    logger.request(endpoint, 'GET', filters);

    try {
      const response = await apiClient.get<FilteredChildrenResponse>(endpoint, {
        params: filters,
      });

      logger.response(endpoint, response.data);

      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      logger.error(endpoint, error);

      return {
        error: {
          message: error?.response?.data?.message || 'Error al filtrar niños',
          statusCode: error?.response?.status,
          code: error?.response?.data?.code,
          details: error?.response?.data?.details,
        },
        success: false,
      };
    }
  },

  /**
   * 4. GET /children
   * Obtener todos los niños (Solo Admin)
   */
  async getAllChildren(params?: PaginationDTO): Promise<ApiResponse<AllChildrenResponse>> {
    const endpoint = '/children';
    logger.request(endpoint, 'GET', params);

    try {
      const token = localStorage.getItem('accessToken');
      logger.token('usando token', token || undefined);

      const response = await apiClient.get<AllChildrenResponse>(endpoint, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      logger.response(endpoint, response.data);

      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      logger.error(endpoint, error);

      return {
        error: {
          message: error?.response?.data?.message || 'Error al obtener todos los niños',
          statusCode: error?.response?.status,
          code: error?.response?.data?.code,
          details: error?.response?.data?.details,
        },
        success: false,
      };
    }
  },

  /**
   * 5. GET /children/:id
   * Obtener niño por ID (Público)
   */
  async getChildById(id: number): Promise<ApiResponse<ChildResponse>> {
    const endpoint = `/children/${id}`;
    logger.request(endpoint, 'GET');

    try {
      const response = await apiClient.get<ChildResponse>(endpoint);

      logger.response(endpoint, response.data);

      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      logger.error(endpoint, error);

      return {
        error: {
          message: error?.response?.data?.message || 'Error al obtener detalle del niño',
          statusCode: error?.response?.status,
          code: error?.response?.data?.code,
          details: error?.response?.data?.details,
        },
        success: false,
      };
    }
  },

  /**
   * 6. PATCH /children/:id
   * Actualizar información de un niño (Solo Admin)
   */
  async updateChild(id: number, data: UpdateChildDTO): Promise<ApiResponse<ChildResponse>> {
    const endpoint = `/children/${id}`;
    logger.request(endpoint, 'PATCH', data);

    try {
      const token = localStorage.getItem('accessToken');
      logger.token('usando token', token || undefined);

      const response = await apiClient.patch<ChildResponse>(endpoint, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      logger.response(endpoint, response.data);

      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      logger.error(endpoint, error);

      return {
        error: {
          message: error?.response?.data?.message || 'Error al actualizar niño',
          statusCode: error?.response?.status,
          code: error?.response?.data?.code,
          details: error?.response?.data?.details,
        },
        success: false,
      };
    }
  },

  /**
   * 7. DELETE /children/:id
   * Eliminar niño (Solo Admin)
   */
  async deleteChild(id: number): Promise<ApiResponse<void>> {
    const endpoint = `/children/${id}`;
    logger.request(endpoint, 'DELETE');

    try {
      const token = localStorage.getItem('accessToken');
      logger.token('usando token', token || undefined);

      await apiClient.delete(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      logger.response(endpoint, { message: 'Niño eliminado exitosamente' });

      return {
        success: true,
      };
    } catch (error: any) {
      logger.error(endpoint, error);

      return {
        error: {
          message: error?.response?.data?.message || 'Error al eliminar niño',
          statusCode: error?.response?.status,
          code: error?.response?.data?.code,
          details: error?.response?.data?.details,
        },
        success: false,
      };
    }
  },
};
