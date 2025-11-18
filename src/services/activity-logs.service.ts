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

    return apiClient.sendToKafka<ActivityLogResponse>(
      KafkaTopic.ACTIVITY_LOG_CREATE,
      dto
    );
  }

  /**
   * Obtener actividades de un niño
   */
  async getActivitiesByChild(
    params: GetActivitiesByChildParams
  ): Promise<ApiResponse<ActivitiesResponse>> {
    this.validateRequired(params.childId, 'childId');

    const { childId, page = 1, limit = 12 } = params;

    return apiClient.sendToKafka<ActivitiesResponse>(
      KafkaTopic.ACTIVITY_LOG_GET_BY_CHILD,
      { childId, page, limit }
    );
  }

  /**
   * Obtener actividades de un apadrinamiento
   */
  async getActivitiesBySponsorship(
    params: GetActivitiesBySponsorshipParams
  ): Promise<ApiResponse<ActivitiesResponse>> {
    this.validateRequired(params.sponsorshipId, 'sponsorshipId');
    this.validateRequired(params.userId, 'userId');
    this.validateRequired(params.userRole, 'userRole');

    const validRoles = ['PADRINO', 'ADMIN', 'SUPER_ADMIN'];
    if (!validRoles.includes(params.userRole)) {
      throw new Error('userRole debe ser PADRINO, ADMIN o SUPER_ADMIN');
    }

    const { sponsorshipId, userId, userRole, page = 1, limit = 12 } = params;

    return apiClient.sendToKafka<ActivitiesResponse>(
      KafkaTopic.ACTIVITY_LOG_GET_BY_SPONSORSHIP,
      { sponsorshipId, userId, userRole, page, limit }
    );
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

    return apiClient.sendToKafka<ActivitiesResponse>(
      KafkaTopic.ACTIVITY_LOG_GET_RECENT,
      { page, limit, type }
    );
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
