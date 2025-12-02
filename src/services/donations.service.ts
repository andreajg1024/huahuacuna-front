/**
 * Donations Service
 * 
 * Servicio para gestión de donaciones monetarias, en especie, testimonios e información
 * Implementa 12 endpoints del módulo DONATIONS con logging comprehensivo
 * 
 * Endpoints:
 * 1. POST /donations/monetary - Donación monetaria PSE (Público)
 * 2. POST /donations/in-kind - Donación en especie (Público)
 * 3. GET /donations/admin/all - Todas las donaciones (Admin)
 * 4. GET /donations/my-donations - Mis donaciones (Auth)
 * 5. POST /donations/:id/approve - Aprobar donación (Admin)
 * 6. GET /donations/info - Información pública (Público)
 * 7. POST /donations/admin/info - Crear información (Admin)
 * 8. PUT /donations/admin/info/:id - Actualizar información (Admin)
 * 9. GET /donations/testimonials - Testimonios publicados (Público)
 * 10. GET /donations/admin/testimonials - Todos testimonios (Admin)
 * 11. POST /donations/admin/testimonials - Crear testimonio (Admin)
 * 12. PUT /donations/admin/testimonials/:id - Actualizar testimonio (Admin)
 */

import { apiClient } from '@/lib/api-client';
import type {
  ApiResponse,
  CreateMonetaryDonationDTO,
  MonetaryDonationResponse,
  CreateInKindDonationDTO,
  InKindDonationResponse,
  GetDonationsQueryDTO,
  AllDonationsResponse,
  MyDonationsResponse,
  ApproveDonationResponse,
  DonationInfoResponse,
  CreateDonationInfoDTO,
  CreateDonationInfoResponse,
  UpdateDonationInfoDTO,
  UpdateDonationInfoResponse,
  TestimonialsResponse,
  AllTestimonialsResponse,
  CreateTestimonialDTO,
  CreateTestimonialResponse,
  UpdateTestimonialDTO,
  UpdateTestimonialResponse,
} from '@/types/api.types';

// ============================================================================
// LOGGER HELPER
// ============================================================================

const logger = {
  request: (endpoint: string, method: string, data?: any) => {
    console.log(`\n💰 [DONATIONS REQUEST] ${method} ${endpoint}`);
    if (data) {
      const sanitized = { ...data };
      if (sanitized.donorDocument) sanitized.donorDocument = '***';
      console.log('📤 [DONATIONS REQUEST DATA]', sanitized);
    }
  },

  response: (endpoint: string, data: any) => {
    console.log(`✅ [DONATIONS RESPONSE] ${endpoint}`);
    console.log('📥 [DONATIONS RESPONSE DATA]', data);
  },

  error: (endpoint: string, error: any) => {
    console.error(`❌ [DONATIONS ERROR] ${endpoint}`);
    console.error('🔴 [DONATIONS ERROR DETAILS]', {
      message: error?.response?.data?.message || error?.message,
      statusCode: error?.response?.status,
      code: error?.response?.data?.code,
      details: error?.response?.data?.details,
    });
  },

  token: (action: string, token?: string) => {
    if (token) {
      console.log(`🔑 [DONATIONS TOKEN] ${action}:`, token.substring(0, 20) + '...');
    }
  },
};

// ============================================================================
// DONATIONS SERVICE
// ============================================================================

export const donationsService = {
  // 1. POST /donations/monetary
  async createMonetaryDonation(data: CreateMonetaryDonationDTO): Promise<ApiResponse<MonetaryDonationResponse>> {
    const endpoint = '/donations/monetary';
    logger.request(endpoint, 'POST', data);
    try {
      const response = await apiClient.post<MonetaryDonationResponse>(endpoint, data);
      logger.response(endpoint, response.data);
      return { data: response.data, success: true };
    } catch (error: any) {
      logger.error(endpoint, error);
      return {
        error: {
          message: error?.response?.data?.message || 'Error al crear donación monetaria',
          statusCode: error?.response?.status,
          code: error?.response?.data?.code,
          details: error?.response?.data?.details,
        },
        success: false,
      };
    }
  },

  // 2. POST /donations/in-kind
  async createInKindDonation(data: CreateInKindDonationDTO): Promise<ApiResponse<InKindDonationResponse>> {
    const endpoint = '/donations/in-kind';
    logger.request(endpoint, 'POST', data);
    try {
      const response = await apiClient.post<InKindDonationResponse>(endpoint, data);
      logger.response(endpoint, response.data);
      return { data: response.data, success: true };
    } catch (error: any) {
      logger.error(endpoint, error);
      return {
        error: {
          message: error?.response?.data?.message || 'Error al crear donación en especie',
          statusCode: error?.response?.status,
          code: error?.response?.data?.code,
          details: error?.response?.data?.details,
        },
        success: false,
      };
    }
  },

  // 3. GET /donations/admin/all
  async getAllDonations(params?: GetDonationsQueryDTO): Promise<ApiResponse<AllDonationsResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.take !== undefined) queryParams.append('take', params.take.toString());
    const endpoint = `/donations/admin/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    logger.request(endpoint, 'GET', params);
    try {
      const token = localStorage.getItem('accessToken');
      logger.token('usando token', token || undefined);
      const response = await apiClient.get<AllDonationsResponse>(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      logger.response(endpoint, response.data);
      return { data: response.data, success: true };
    } catch (error: any) {
      logger.error(endpoint, error);
      return {
        error: {
          message: error?.response?.data?.message || 'Error al obtener todas las donaciones',
          statusCode: error?.response?.status,
          code: error?.response?.data?.code,
          details: error?.response?.data?.details,
        },
        success: false,
      };
    }
  },

  // 4. GET /donations/my-donations
  async getMyDonations(params?: GetDonationsQueryDTO): Promise<ApiResponse<MyDonationsResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.take !== undefined) queryParams.append('take', params.take.toString());
    const endpoint = `/donations/my-donations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    logger.request(endpoint, 'GET', params);
    try {
      const token = localStorage.getItem('accessToken');
      logger.token('usando token', token || undefined);
      const response = await apiClient.get<MyDonationsResponse>(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      logger.response(endpoint, response.data);
      return { data: response.data, success: true };
    } catch (error: any) {
      logger.error(endpoint, error);
      return {
        error: {
          message: error?.response?.data?.message || 'Error al obtener mis donaciones',
          statusCode: error?.response?.status,
          code: error?.response?.data?.code,
          details: error?.response?.data?.details,
        },
        success: false,
      };
    }
  },

  // 5. POST /donations/:id/approve
  async approveDonation(id: number): Promise<ApiResponse<ApproveDonationResponse>> {
    const endpoint = `/donations/${id}/approve`;
    logger.request(endpoint, 'POST');
    try {
      const token = localStorage.getItem('accessToken');
      logger.token('usando token', token || undefined);
      const response = await apiClient.post<ApproveDonationResponse>(endpoint, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      logger.response(endpoint, response.data);
      return { data: response.data, success: true };
    } catch (error: any) {
      logger.error(endpoint, error);
      return {
        error: {
          message: error?.response?.data?.message || 'Error al aprobar donación',
          statusCode: error?.response?.status,
          code: error?.response?.data?.code,
          details: error?.response?.data?.details,
        },
        success: false,
      };
    }
  },

  // 6. GET /donations/info
  async getDonationInfo(): Promise<ApiResponse<DonationInfoResponse>> {
    const endpoint = '/donations/info';
    logger.request(endpoint, 'GET');
    try {
      const response = await apiClient.get<DonationInfoResponse>(endpoint);
      logger.response(endpoint, response.data);
      return { data: response.data, success: true };
    } catch (error: any) {
      logger.error(endpoint, error);
      return {
        error: {
          message: error?.response?.data?.message || 'Error al obtener información de donaciones',
          statusCode: error?.response?.status,
          code: error?.response?.data?.code,
          details: error?.response?.data?.details,
        },
        success: false,
      };
    }
  },

  // 7. POST /donations/admin/info
  async createDonationInfo(data: CreateDonationInfoDTO): Promise<ApiResponse<CreateDonationInfoResponse>> {
    const endpoint = '/donations/admin/info';
    logger.request(endpoint, 'POST', data);
    try {
      const token = localStorage.getItem('accessToken');
      logger.token('usando token', token || undefined);
      const response = await apiClient.post<CreateDonationInfoResponse>(endpoint, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      logger.response(endpoint, response.data);
      return { data: response.data, success: true };
    } catch (error: any) {
      logger.error(endpoint, error);
      return {
        error: {
          message: error?.response?.data?.message || 'Error al crear información de donaciones',
          statusCode: error?.response?.status,
          code: error?.response?.data?.code,
          details: error?.response?.data?.details,
        },
        success: false,
      };
    }
  },

  // 8. PUT /donations/admin/info/:id
  async updateDonationInfo(id: number, data: UpdateDonationInfoDTO): Promise<ApiResponse<UpdateDonationInfoResponse>> {
    const endpoint = `/donations/admin/info/${id}`;
    logger.request(endpoint, 'PUT', data);
    try {
      const token = localStorage.getItem('accessToken');
      logger.token('usando token', token || undefined);
      const response = await apiClient.put<UpdateDonationInfoResponse>(endpoint, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      logger.response(endpoint, response.data);
      return { data: response.data, success: true };
    } catch (error: any) {
      logger.error(endpoint, error);
      return {
        error: {
          message: error?.response?.data?.message || 'Error al actualizar información de donaciones',
          statusCode: error?.response?.status,
          code: error?.response?.data?.code,
          details: error?.response?.data?.details,
        },
        success: false,
      };
    }
  },

  // 9. GET /donations/testimonials
  async getTestimonials(limit?: number): Promise<ApiResponse<TestimonialsResponse>> {
    const endpoint = `/donations/testimonials${limit ? `?limit=${limit}` : ''}`;
    logger.request(endpoint, 'GET', { limit });
    try {
      const response = await apiClient.get<TestimonialsResponse>(endpoint);
      logger.response(endpoint, response.data);
      return { data: response.data, success: true };
    } catch (error: any) {
      logger.error(endpoint, error);
      return {
        error: {
          message: error?.response?.data?.message || 'Error al obtener testimonios',
          statusCode: error?.response?.status,
          code: error?.response?.data?.code,
          details: error?.response?.data?.details,
        },
        success: false,
      };
    }
  },

  // 10. GET /donations/admin/testimonials
  async getAllTestimonials(params?: { skip?: number; take?: number }): Promise<ApiResponse<AllTestimonialsResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.take !== undefined) queryParams.append('take', params.take.toString());
    const endpoint = `/donations/admin/testimonials${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    logger.request(endpoint, 'GET', params);
    try {
      const token = localStorage.getItem('accessToken');
      logger.token('usando token', token || undefined);
      const response = await apiClient.get<AllTestimonialsResponse>(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      logger.response(endpoint, response.data);
      return { data: response.data, success: true };
    } catch (error: any) {
      logger.error(endpoint, error);
      return {
        error: {
          message: error?.response?.data?.message || 'Error al obtener todos los testimonios',
          statusCode: error?.response?.status,
          code: error?.response?.data?.code,
          details: error?.response?.data?.details,
        },
        success: false,
      };
    }
  },

  // 11. POST /donations/admin/testimonials
  async createTestimonial(data: CreateTestimonialDTO): Promise<ApiResponse<CreateTestimonialResponse>> {
    const endpoint = '/donations/admin/testimonials';
    logger.request(endpoint, 'POST', data);
    try {
      const token = localStorage.getItem('accessToken');
      logger.token('usando token', token || undefined);
      const response = await apiClient.post<CreateTestimonialResponse>(endpoint, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      logger.response(endpoint, response.data);
      return { data: response.data, success: true };
    } catch (error: any) {
      logger.error(endpoint, error);
      return {
        error: {
          message: error?.response?.data?.message || 'Error al crear testimonio',
          statusCode: error?.response?.status,
          code: error?.response?.data?.code,
          details: error?.response?.data?.details,
        },
        success: false,
      };
    }
  },

  // 12. PUT /donations/admin/testimonials/:id
  async updateTestimonial(id: number, data: UpdateTestimonialDTO): Promise<ApiResponse<UpdateTestimonialResponse>> {
    const endpoint = `/donations/admin/testimonials/${id}`;
    logger.request(endpoint, 'PUT', data);
    try {
      const token = localStorage.getItem('accessToken');
      logger.token('usando token', token || undefined);
      const response = await apiClient.put<UpdateTestimonialResponse>(endpoint, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      logger.response(endpoint, response.data);
      return { data: response.data, success: true };
    } catch (error: any) {
      logger.error(endpoint, error);
      return {
        error: {
          message: error?.response?.data?.message || 'Error al actualizar testimonio',
          statusCode: error?.response?.status,
          code: error?.response?.data?.code,
          details: error?.response?.data?.details,
        },
        success: false,
      };
    }
  },
};
