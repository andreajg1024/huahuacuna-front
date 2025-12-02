/**
 * Events Service
 * 
 * Servicio para gestión de eventos
 * Implementa 11 endpoints del módulo EVENTS con logging comprehensivo
 * 
 * Endpoints:
 * 1. POST /events - Crear evento (Admin)
 * 2. PUT /events/:id - Actualizar evento (Admin)
 * 3. POST /events/:id/publish - Publicar evento (Admin)
 * 4. DELETE /events/:id - Eliminar evento (Admin)
 * 5. GET /events/admin/all - Todos los eventos (Admin)
 * 6. GET /events/published - Eventos publicados (Público)
 * 7. GET /events/:slug - Detalle por slug (Público)
 * 8. POST /events/register - Inscribirse (Público)
 * 9. GET /events/:id/registrations - Inscritos (Admin)
 * 10. POST /events/registrations/:id/check-in - Check-in (Admin)
 * 11. GET /events/:id/statistics - Estadísticas (Admin)
 */

import { apiClient } from '@/lib/api-client';
import type {
  ApiResponse,
  CreateEventDTO,
  EventResponse,
  UpdateEventDTO,
  PublishEventResponse,
  DeleteEventResponse,
  GetEventsQueryDTO,
  AdminEventsListResponse,
  GetPublishedEventsQueryDTO,
  PublishedEventsListResponse,
  RegisterToEventDTO,
  EventRegistrationResponse,
  GetRegistrationsQueryDTO,
  EventRegistrationsListResponse,
  CheckInDTO,
  CheckInResponse,
  EventStatisticsResponse,
} from '@/types/api.types';

// ============================================================================
// LOGGER HELPER
// ============================================================================

const logger = {
  request: (endpoint: string, method: string, data?: any) => {
    console.log(`\n🔵 [EVENTS REQUEST] ${method} ${endpoint}`);
    if (data) {
      const sanitized = { ...data };
      console.log('📤 [EVENTS REQUEST DATA]', sanitized);
    }
  },

  response: (endpoint: string, data: any) => {
    console.log(`✅ [EVENTS RESPONSE] ${endpoint}`);
    console.log('📥 [EVENTS RESPONSE DATA]', data);
  },

  error: (endpoint: string, error: any) => {
    console.error(`❌ [EVENTS ERROR] ${endpoint}`);
    console.error('🔴 [EVENTS ERROR DETAILS]', {
      message: error?.response?.data?.message || error?.message,
      statusCode: error?.response?.status,
      code: error?.response?.data?.code,
      details: error?.response?.data?.details,
    });
  },

  token: (action: string, token?: string) => {
    if (token) {
      console.log(`🔑 [EVENTS TOKEN] ${action}:`, token.substring(0, 20) + '...');
    }
  },
};

// ============================================================================
// EVENTS SERVICE
// ============================================================================

export const eventsService = {
  /**
   * 1. POST /events
   * Crear nuevo evento (Solo Admin)
   */
  async createEvent(data: CreateEventDTO): Promise<ApiResponse<EventResponse>> {
    const endpoint = '/events';
    logger.request(endpoint, 'POST', data);

    try {
      const token = localStorage.getItem('accessToken');
      logger.token('usando token', token || undefined);

      const response = await apiClient.post<EventResponse>(endpoint, data, {
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
          message: error?.response?.data?.message || 'Error al crear evento',
          statusCode: error?.response?.status,
          code: error?.response?.data?.code,
          details: error?.response?.data?.details,
        },
        success: false,
      };
    }
  },

  /**
   * 2. PUT /events/:id
   * Actualizar evento (Solo Admin)
   */
  async updateEvent(id: number, data: UpdateEventDTO): Promise<ApiResponse<EventResponse>> {
    const endpoint = `/events/${id}`;
    logger.request(endpoint, 'PUT', data);

    try {
      const token = localStorage.getItem('accessToken');
      logger.token('usando token', token || undefined);

      const response = await apiClient.put<EventResponse>(endpoint, data, {
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
          message: error?.response?.data?.message || 'Error al actualizar evento',
          statusCode: error?.response?.status,
          code: error?.response?.data?.code,
          details: error?.response?.data?.details,
        },
        success: false,
      };
    }
  },

  /**
   * 3. POST /events/:id/publish
   * Publicar evento (Solo Admin)
   */
  async publishEvent(id: number): Promise<ApiResponse<PublishEventResponse>> {
    const endpoint = `/events/${id}/publish`;
    logger.request(endpoint, 'POST');

    try {
      const token = localStorage.getItem('accessToken');
      logger.token('usando token', token || undefined);

      const response = await apiClient.post<PublishEventResponse>(endpoint, null, {
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
          message: error?.response?.data?.message || 'Error al publicar evento',
          statusCode: error?.response?.status,
          code: error?.response?.data?.code,
          details: error?.response?.data?.details,
        },
        success: false,
      };
    }
  },

  /**
   * 4. DELETE /events/:id
   * Eliminar evento (Solo Admin)
   */
  async deleteEvent(id: number): Promise<ApiResponse<DeleteEventResponse>> {
    const endpoint = `/events/${id}`;
    logger.request(endpoint, 'DELETE');

    try {
      const token = localStorage.getItem('accessToken');
      logger.token('usando token', token || undefined);

      const response = await apiClient.delete<DeleteEventResponse>(endpoint, {
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
          message: error?.response?.data?.message || 'Error al eliminar evento',
          statusCode: error?.response?.status,
          code: error?.response?.data?.code,
          details: error?.response?.data?.details,
        },
        success: false,
      };
    }
  },

  /**
   * 5. GET /events/admin/all
   * Obtener todos los eventos (Solo Admin)
   */
  async getAllEvents(params?: GetEventsQueryDTO): Promise<ApiResponse<AdminEventsListResponse>> {
    const endpoint = '/events/admin/all';
    logger.request(endpoint, 'GET', params);

    try {
      const token = localStorage.getItem('accessToken');
      logger.token('usando token', token || undefined);

      const response = await apiClient.get<AdminEventsListResponse>(endpoint, {
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
          message: error?.response?.data?.message || 'Error al obtener eventos',
          statusCode: error?.response?.status,
          code: error?.response?.data?.code,
          details: error?.response?.data?.details,
        },
        success: false,
      };
    }
  },

  /**
   * 6. GET /events/published
   * Obtener eventos publicados (Público)
   */
  async getPublishedEvents(params?: GetPublishedEventsQueryDTO): Promise<ApiResponse<PublishedEventsListResponse>> {
    const endpoint = '/events/published';
    logger.request(endpoint, 'GET', params);

    try {
      const response = await apiClient.get<PublishedEventsListResponse>(endpoint, {
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
          message: error?.response?.data?.message || 'Error al obtener eventos publicados',
          statusCode: error?.response?.status,
          code: error?.response?.data?.code,
          details: error?.response?.data?.details,
        },
        success: false,
      };
    }
  },

  /**
   * 7. GET /events/:slug
   * Obtener detalle de evento por slug (Público)
   */
  async getEventBySlug(slug: string): Promise<ApiResponse<EventResponse>> {
    const endpoint = `/events/${slug}`;
    logger.request(endpoint, 'GET');

    try {
      const response = await apiClient.get<EventResponse>(endpoint);

      logger.response(endpoint, response.data);

      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      logger.error(endpoint, error);

      return {
        error: {
          message: error?.response?.data?.message || 'Error al obtener detalle del evento',
          statusCode: error?.response?.status,
          code: error?.response?.data?.code,
          details: error?.response?.data?.details,
        },
        success: false,
      };
    }
  },

  /**
   * 8. POST /events/register
   * Inscribirse a un evento (Público)
   */
  async registerToEvent(data: RegisterToEventDTO): Promise<ApiResponse<EventRegistrationResponse>> {
    const endpoint = '/events/register';
    logger.request(endpoint, 'POST', data);

    try {
      const response = await apiClient.post<EventRegistrationResponse>(endpoint, data);

      logger.response(endpoint, response.data);

      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      logger.error(endpoint, error);

      return {
        error: {
          message: error?.response?.data?.message || 'Error al inscribirse al evento',
          statusCode: error?.response?.status,
          code: error?.response?.data?.code,
          details: error?.response?.data?.details,
        },
        success: false,
      };
    }
  },

  /**
   * 9. GET /events/:id/registrations
   * Obtener inscritos a un evento (Solo Admin)
   */
  async getEventRegistrations(id: number, params?: GetRegistrationsQueryDTO): Promise<ApiResponse<EventRegistrationsListResponse>> {
    const endpoint = `/events/${id}/registrations`;
    logger.request(endpoint, 'GET', params);

    try {
      const token = localStorage.getItem('accessToken');
      logger.token('usando token', token || undefined);

      const response = await apiClient.get<EventRegistrationsListResponse>(endpoint, {
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
          message: error?.response?.data?.message || 'Error al obtener inscripciones',
          statusCode: error?.response?.status,
          code: error?.response?.data?.code,
          details: error?.response?.data?.details,
        },
        success: false,
      };
    }
  },

  /**
   * 10. POST /events/registrations/:id/check-in
   * Hacer check-in de una inscripción (Solo Admin)
   */
  async checkInRegistration(id: number, data: CheckInDTO): Promise<ApiResponse<CheckInResponse>> {
    const endpoint = `/events/registrations/${id}/check-in`;
    logger.request(endpoint, 'POST', data);

    try {
      const token = localStorage.getItem('accessToken');
      logger.token('usando token', token || undefined);

      const response = await apiClient.post<CheckInResponse>(endpoint, data, {
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
          message: error?.response?.data?.message || 'Error al hacer check-in',
          statusCode: error?.response?.status,
          code: error?.response?.data?.code,
          details: error?.response?.data?.details,
        },
        success: false,
      };
    }
  },

  /**
   * 11. GET /events/:id/statistics
   * Obtener estadísticas de un evento (Solo Admin)
   */
  async getEventStatistics(id: number): Promise<ApiResponse<EventStatisticsResponse>> {
    const endpoint = `/events/${id}/statistics`;
    logger.request(endpoint, 'GET');

    try {
      const token = localStorage.getItem('accessToken');
      logger.token('usando token', token || undefined);

      const response = await apiClient.get<EventStatisticsResponse>(endpoint, {
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
          message: error?.response?.data?.message || 'Error al obtener estadísticas',
          statusCode: error?.response?.status,
          code: error?.response?.data?.code,
          details: error?.response?.data?.details,
        },
        success: false,
      };
    }
  },
};
