/**
 * Activity Logs Service
 * 
 * Service layer for activity logs endpoints
 * Manages activity tracking and logs
 */

import { apiClient } from '@/lib/api-client';
import { BaseService } from './base.service';
import {
  CreateActivityLogDTO,
  ActivityLogResponse,
  GetActivitiesByChildParams,
  GetActivitiesBySponsorshipParams,
  GetRecentActivitiesParams,
  ActivitiesResponse,
  ActivityType,
  KafkaTopic,
  ApiResponse,
} from '@/types/api.types';

export class ActivityLogsService extends BaseService {
  /**
   * Crear registro de actividad
   */
  async createActivityLog(
    dto: CreateActivityLogDTO
  ): Promise<ApiResponse<ActivityLogResponse>> {
    // Validaciones
    this.validateRequired(dto.type, 'type');
    this.validateRequired(dto.title, 'title');
    this.validateRequired(dto.description, 'description');

    this.validateLength(dto.title, 'title', 5, 200);
    this.validateLength(dto.description, 'description', 10, 1000);

    // Validar que el type sea un ActivityType válido
    const validTypes = Object.values(ActivityType);
    if (!validTypes.includes(dto.type)) {
      throw new Error(`type debe ser uno de: ${validTypes.join(', ')}`);
    }

    // Validar IDs opcionales si están presentes
    if (dto.childId !== undefined) {
      this.validateRequired(dto.childId, 'childId');
    }

    if (dto.sponsorshipId !== undefined) {
      this.validateRequired(dto.sponsorshipId, 'sponsorshipId');
    }

    if (dto.performedBy !== undefined) {
      this.validateRequired(dto.performedBy, 'performedBy');
    }

    try {
      const response = await apiClient.post<ActivityLogResponse>(
        '/api/activity-logs',
        dto
      );

      // Manejo específico de códigos de error HTTP
      if (!response.success && response.error) {
        const errorMessage = response.error.message || 'Error al crear registro de actividad';

        if (errorMessage.includes('HTTP 400') || errorMessage.includes('400')) {
          return {
            success: false,
            error: {
              message: 'Datos inválidos',
              code: 'INVALID_DATA',
              details: response.error.details
            }
          };
        }

        if (errorMessage.includes('HTTP 401') || errorMessage.includes('401')) {
          return {
            success: false,
            error: {
              message: 'No autorizado',
              code: 'UNAUTHORIZED',
              details: response.error.details
            }
          };
        }

        if (errorMessage.includes('HTTP 403') || errorMessage.includes('403')) {
          return {
            success: false,
            error: {
              message: 'Sin permisos',
              code: 'FORBIDDEN',
              details: response.error.details
            }
          };
        }
      }

      return response;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Error al crear registro de actividad',
          code: 'CREATE_ACTIVITY_LOG_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Obtener actividades de un niño
   */
  async getActivitiesByChild(
    params: GetActivitiesByChildParams
  ): Promise<ApiResponse<ActivitiesResponse>> {
    this.validateRequired(params.childId, 'childId');

    const { childId, page = 1, limit = 12 } = params;

    try {
      // Construir query string
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await apiClient.get<ActivitiesResponse>(
        `/api/activity-logs/child/${childId}?${queryParams.toString()}`
      );

      // Manejo específico de códigos de error HTTP
      if (!response.success && response.error) {
        const errorMessage = response.error.message || 'Error al obtener actividades del niño';

        if (errorMessage.includes('HTTP 401') || errorMessage.includes('401')) {
          return {
            success: false,
            error: {
              message: 'No autorizado',
              code: 'UNAUTHORIZED',
              details: response.error.details
            }
          };
        }

        if (errorMessage.includes('HTTP 403') || errorMessage.includes('403')) {
          return {
            success: false,
            error: {
              message: 'Sin permisos',
              code: 'FORBIDDEN',
              details: response.error.details
            }
          };
        }

        if (errorMessage.includes('HTTP 404') || errorMessage.includes('404')) {
          return {
            success: false,
            error: {
              message: 'Niño no encontrado',
              code: 'NOT_FOUND',
              details: response.error.details
            }
          };
        }
      }

      return response;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Error al obtener actividades del niño',
          code: 'GET_ACTIVITIES_BY_CHILD_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Obtener actividades de un apadrinamiento
   */
  async getActivitiesBySponsorship(
    params: GetActivitiesBySponsorshipParams
  ): Promise<ApiResponse<ActivitiesResponse>> {
    this.validateRequired(params.sponsorshipId, 'sponsorshipId');

    const { sponsorshipId, page = 1, limit = 12 } = params;

    try {
      // Construir query string
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await apiClient.get<ActivitiesResponse>(
        `/api/activity-logs/sponsorship/${sponsorshipId}?${queryParams.toString()}`
      );

      // Manejo específico de códigos de error HTTP
      if (!response.success && response.error) {
        const errorMessage = response.error.message || 'Error al obtener actividades del apadrinamiento';

        if (errorMessage.includes('HTTP 401') || errorMessage.includes('401')) {
          return {
            success: false,
            error: {
              message: 'No autorizado',
              code: 'UNAUTHORIZED',
              details: response.error.details
            }
          };
        }

        if (errorMessage.includes('HTTP 403') || errorMessage.includes('403')) {
          return {
            success: false,
            error: {
              message: 'Sin permisos',
              code: 'FORBIDDEN',
              details: response.error.details
            }
          };
        }

        if (errorMessage.includes('HTTP 404') || errorMessage.includes('404')) {
          return {
            success: false,
            error: {
              message: 'Apadrinamiento no encontrado',
              code: 'NOT_FOUND',
              details: response.error.details
            }
          };
        }
      }

      return response;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Error al obtener actividades del apadrinamiento',
          code: 'GET_ACTIVITIES_BY_SPONSORSHIP_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Obtener actividades recientes
   */
  async getRecentActivities(
    params?: GetRecentActivitiesParams
  ): Promise<ApiResponse<ActivitiesResponse>> {
    const { page = 1, limit = 12, type } = params || {};

    // Si se proporciona type, validarlo
    if (type) {
      const validTypes = Object.values(ActivityType);
      if (!validTypes.includes(type)) {
        throw new Error(`type debe ser uno de: ${validTypes.join(', ')}`);
      }
    }

    try {
      // Construir query string
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (type) {
        queryParams.append('type', type);
      }

      const response = await apiClient.get<ActivitiesResponse>(
        `/api/activity-logs/recent?${queryParams.toString()}`
      );

      // Manejo específico de códigos de error HTTP
      if (!response.success && response.error) {
        const errorMessage = response.error.message || 'Error al obtener actividades recientes';

        if (errorMessage.includes('HTTP 401') || errorMessage.includes('401')) {
          return {
            success: false,
            error: {
              message: 'No autorizado',
              code: 'UNAUTHORIZED',
              details: response.error.details
            }
          };
        }

        if (errorMessage.includes('HTTP 403') || errorMessage.includes('403')) {
          return {
            success: false,
            error: {
              message: 'Sin permisos',
              code: 'FORBIDDEN',
              details: response.error.details
            }
          };
        }
      }

      return response;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Error al obtener actividades recientes',
          code: 'GET_RECENT_ACTIVITIES_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Helper: Crear log de actualización de niño
   */
  async logChildUpdate(
    childId: number,
    title: string,
    description: string,
    performedBy?: number,
    metadata?: Record<string, any>
  ): Promise<ApiResponse<ActivityLogResponse>> {
    return this.createActivityLog({
      type: ActivityType.CHILD_UPDATE,
      title,
      description,
      childId,
      performedBy,
      metadata,
    });
  }

  /**
   * Helper: Crear log de creación de apadrinamiento
   */
  async logSponsorshipCreated(
    sponsorshipId: number,
    childId: number,
    title: string,
    description: string,
    performedBy?: number,
    metadata?: Record<string, any>
  ): Promise<ApiResponse<ActivityLogResponse>> {
    return this.createActivityLog({
      type: ActivityType.SPONSORSHIP_CREATED,
      title,
      description,
      childId,
      sponsorshipId,
      performedBy,
      metadata,
    });
  }

  /**
   * Helper: Crear log de cancelación de apadrinamiento
   */
  async logSponsorshipCancelled(
    sponsorshipId: number,
    childId: number,
    title: string,
    description: string,
    performedBy?: number,
    metadata?: Record<string, any>
  ): Promise<ApiResponse<ActivityLogResponse>> {
    return this.createActivityLog({
      type: ActivityType.SPONSORSHIP_CANCELLED,
      title,
      description,
      childId,
      sponsorshipId,
      performedBy,
      metadata,
    });
  }

  /**
   * Helper: Crear log de entrada de bitácora
   */
  async logBitacoraEntry(
    childId: number,
    title: string,
    description: string,
    performedBy?: number,
    metadata?: Record<string, any>
  ): Promise<ApiResponse<ActivityLogResponse>> {
    return this.createActivityLog({
      type: ActivityType.BITACORA_ENTRY_ADDED,
      title,
      description,
      childId,
      performedBy,
      metadata,
    });
  }

  /**
   * Helper: Crear log de mensaje enviado
   */
  async logMessageSent(
    sponsorshipId: number,
    title: string,
    description: string,
    performedBy?: number,
    metadata?: Record<string, any>
  ): Promise<ApiResponse<ActivityLogResponse>> {
    return this.createActivityLog({
      type: ActivityType.MESSAGE_SENT,
      title,
      description,
      sponsorshipId,
      performedBy,
      metadata,
    });
  }
}

export const activityLogsService = new ActivityLogsService();
