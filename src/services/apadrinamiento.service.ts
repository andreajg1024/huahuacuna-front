/**
 * Apadrinamiento Service
 * 
 * Service layer for sponsorship/child management endpoints
 * Integrates with Kafka-based backend microservices
 */

import { apiClient } from '@/lib/api-client';
import { BaseService } from './base.service';
import {
  CreateChildRequest,
  CreateChildDTO,
  UpdateChildDTO,
  UpdateChildRequest,
  ChildResponse,
  CreateSponsorshipDTO,
  EndSponsorshipDTO,
  SponsorshipResponse,
  SendMessageDTO,
  MessageResponse,
  KafkaTopic,
  ApiResponse,
  // Nuevos tipos de Sponsorship
  CreateSponsorshipRequestDTO,
  SponsorshipRequestResponse,
  ApproveSponsorshipRequestDTO,
  RejectSponsorshipRequestDTO,
  GetPendingRequestsParams,
  PendingRequestsResponse,
  GetMySponsorshipsParams,
  MySponsorshipsResponse,
  GetSponsorshipDetailsParams,
  SponsorshipDetailResponse,
  CancelSponsorshipDTO,
  GetSponsorshipHistoryParams,
  SponsorshipHistoryResponse,
} from '@/types/api.types';

export class ApadrinamientoService extends BaseService {
  /**
   * Crear un nuevo niño
   */
  async createChild(
    dto: CreateChildDTO,
    userId: number
  ): Promise<ApiResponse<ChildResponse>> {
    this.validateCreateChildDTO(dto);

    // Usar endpoint REST en lugar de Kafka
    try {
      const response = await apiClient.post<ChildResponse>('/api/children', dto);

      // Manejo específico de códigos de error HTTP
      if (!response.success && response.error) {
        const errorMessage = response.error.message || 'Error al crear niño';

        // Mapear mensajes según código HTTP
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
              message: 'No tiene permisos suficientes',
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
          message: error.message || 'Error al crear niño',
          code: 'CREATE_CHILD_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Actualizar un niño existente
   */
  async updateChild(
    dto: UpdateChildDTO,
    userId: number
  ): Promise<ApiResponse<ChildResponse>> {
    this.validateRequired(dto.id, 'id');
    
    try {
      const { id, ...updateData } = dto;
      const response = await apiClient.patch<ChildResponse>(`/api/children/${id}`, updateData);

      // Manejo específico de códigos de error HTTP
      if (!response.success && response.error) {
        const errorMessage = response.error.message || 'Error al actualizar niño';

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
              message: 'No tiene permisos suficientes',
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
          message: error.message || 'Error al actualizar niño',
          code: 'UPDATE_CHILD_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Eliminar un niño
   */
  async deleteChild(
    childId: number,
    userId: number
  ): Promise<ApiResponse<void>> {
    this.validateRequired(childId, 'childId');
    
    try {
      const response = await apiClient.delete<void>(`/api/children/${childId}`);

      // Manejo específico de códigos de error HTTP
      if (!response.success && response.error) {
        const errorMessage = response.error.message || 'Error al eliminar niño';

        if (errorMessage.includes('HTTP 400') || errorMessage.includes('400')) {
          return {
            success: false,
            error: {
              message: 'No se puede eliminar niño en estado PENDING o SPONSORED',
              code: 'INVALID_STATE',
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
              message: 'No tiene permisos suficientes',
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
          message: error.message || 'Error al eliminar niño',
          code: 'DELETE_CHILD_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Obtener lista de niños
   */
  async listChildren(filters?: { page?: number; limit?: number }): Promise<ApiResponse<ChildResponse[]>> {
    try {
      const { page = 1, limit = 12 } = filters || {};

      // Construir query string
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await apiClient.get<ChildResponse[]>(`/api/children?${queryParams.toString()}`);

      // Manejo específico de códigos de error HTTP
      if (!response.success && response.error) {
        const errorMessage = response.error.message || 'Error al obtener lista de niños';

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
              message: 'No tiene permisos suficientes',
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
          message: error.message || 'Error al obtener lista de niños',
          code: 'LIST_CHILDREN_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Obtener lista de niños disponibles para apadrinar
   */
  async getAvailableChildren(filters?: { page?: number; limit?: number }): Promise<ApiResponse<ChildResponse[]>> {
    try {
      const { page = 1, limit = 12 } = filters || {};

      // Construir query string
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await apiClient.get<ChildResponse[]>(`/api/children/available?${queryParams.toString()}`);

      // Manejo específico de códigos de error HTTP
      if (!response.success && response.error) {
        const errorMessage = response.error.message || 'Error al obtener niños disponibles';

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
              message: 'No tiene permisos suficientes',
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
          message: error.message || 'Error al obtener niños disponibles',
          code: 'GET_AVAILABLE_CHILDREN_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Filtrar niños por rango de edad, género y municipio
   */
  async filterChildren(filters?: {
    gender?: 'MALE' | 'FEMALE';
    minAge?: number;
    maxAge?: number;
    municipality?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<ChildResponse[]>> {
    try {
      const {
        gender,
        minAge,
        maxAge,
        municipality,
        page = 1,
        limit = 12
      } = filters || {};

      // Construir query string solo con parámetros definidos
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (gender) {
        queryParams.append('gender', gender);
      }

      if (minAge !== undefined) {
        queryParams.append('minAge', minAge.toString());
      }

      if (maxAge !== undefined) {
        queryParams.append('maxAge', maxAge.toString());
      }

      if (municipality) {
        queryParams.append('municipality', municipality);
      }

      const response = await apiClient.get<ChildResponse[]>(`/api/children/filter?${queryParams.toString()}`);

      // Manejo específico de códigos de error HTTP
      if (!response.success && response.error) {
        const errorMessage = response.error.message || 'Error al filtrar niños';

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
              message: 'No tiene permisos suficientes',
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
          message: error.message || 'Error al filtrar niños',
          code: 'FILTER_CHILDREN_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Obtener un niño por ID
   */
  async getChild(childId: number): Promise<ApiResponse<ChildResponse>> {
    this.validateRequired(childId, 'childId');
    
    try {
      const response = await apiClient.get<ChildResponse>(`/api/children/${childId}`);

      // Manejo específico de códigos de error HTTP
      if (!response.success && response.error) {
        const errorMessage = response.error.message || 'Error al obtener el niño';

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
              message: 'No tiene permisos suficientes',
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
          message: error.message || 'Error al obtener el niño',
          code: 'GET_CHILD_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Crear un apadrinamiento
   */
  async createSponsorship(
    dto: CreateSponsorshipDTO
  ): Promise<ApiResponse<SponsorshipResponse>> {
    this.validateRequired(dto.childId, 'childId');
    this.validateRequired(dto.sponsorId, 'sponsorId');
    this.validateRequired(dto.startDate, 'startDate');
    
    if (!this.isValidISODate(dto.startDate)) {
      throw new Error('startDate debe estar en formato ISO 8601');
    }
    
    return apiClient.sendToKafka<SponsorshipResponse>(KafkaTopic.SPONSORSHIP_CREATE, dto);
  }

  /**
   * Finalizar un apadrinamiento
   */
  async endSponsorship(
    dto: EndSponsorshipDTO
  ): Promise<ApiResponse<SponsorshipResponse>> {
    this.validateRequired(dto.sponsorshipId, 'sponsorshipId');
    this.validateRequired(dto.endDate, 'endDate');
    this.validateRequired(dto.reason, 'reason');
    
    if (!this.isValidISODate(dto.endDate)) {
      throw new Error('endDate debe estar en formato ISO 8601');
    }
    
    return apiClient.sendToKafka<SponsorshipResponse>(KafkaTopic.SPONSORSHIP_END, dto);
  }

  /**
   * Obtener lista de apadrinamientos
   */
  async listSponsorships(filters?: any): Promise<ApiResponse<SponsorshipResponse[]>> {
    return apiClient.sendToKafka<SponsorshipResponse[]>(
      KafkaTopic.SPONSORSHIP_LIST,
      filters || {}
    );
  }

  /**
   * Crear solicitud de apadrinamiento
   */
  async createSponsorshipRequest(
    dto: CreateSponsorshipRequestDTO
  ): Promise<ApiResponse<SponsorshipRequestResponse>> {
    this.validateRequired(dto.childId, 'childId');
    this.validateRequired(dto.userId, 'userId');
    
    if (dto.reason) {
      this.validateLength(dto.reason, 'reason', 10, 500);
    }
    
    try {
      // Usar endpoint REST en lugar de Kafka
      const requestBody = {
        childId: dto.childId,
        reason: dto.reason
      };

      const response = await apiClient.post<SponsorshipRequestResponse>(
        '/api/sponsorships/requests',
        requestBody
      );

      // Manejo específico de códigos de error HTTP
      if (!response.success && response.error) {
        const errorMessage = response.error.message || 'Error al crear solicitud de apadrinamiento';

        if (errorMessage.includes('HTTP 400') || errorMessage.includes('400')) {
          return {
            success: false,
            error: {
              message: 'El niño no está disponible',
              code: 'CHILD_NOT_AVAILABLE',
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
      }

      return response;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Error al crear solicitud de apadrinamiento',
          code: 'CREATE_SPONSORSHIP_REQUEST_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Aprobar solicitud de apadrinamiento
   */
  async approveSponsorshipRequest(
    dto: ApproveSponsorshipRequestDTO
  ): Promise<ApiResponse<SponsorshipRequestResponse>> {
    this.validateRequired(dto.requestId, 'requestId');
    this.validateRequired(dto.reviewerId, 'reviewerId');
    
    return apiClient.sendToKafka<SponsorshipRequestResponse>(
      KafkaTopic.SPONSORSHIP_REQUEST_APPROVE,
      dto
    );
  }

  /**
   * Rechazar solicitud de apadrinamiento
   */
  async rejectSponsorshipRequest(
    dto: RejectSponsorshipRequestDTO
  ): Promise<ApiResponse<SponsorshipRequestResponse>> {
    this.validateRequired(dto.requestId, 'requestId');
    this.validateRequired(dto.reviewerId, 'reviewerId');
    this.validateRequired(dto.rejectionReason, 'rejectionReason');
    this.validateLength(dto.rejectionReason, 'rejectionReason', 10, 500);
    
    try {
      // Usar endpoint REST en lugar de Kafka
      const requestBody = {
        requestId: dto.requestId,
        rejectionReason: dto.rejectionReason
      };

      const response = await apiClient.post<SponsorshipRequestResponse>(
        '/api/sponsorships/requests/reject',
        requestBody
      );

      // Manejo específico de códigos de error HTTP
      if (!response.success && response.error) {
        const errorMessage = response.error.message || 'Error al rechazar solicitud';

        if (errorMessage.includes('HTTP 400') || errorMessage.includes('400')) {
          return {
            success: false,
            error: {
              message: 'Solicitud no válida',
              code: 'INVALID_REQUEST',
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
          message: error.message || 'Error al rechazar solicitud',
          code: 'REJECT_REQUEST_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Obtener solicitudes pendientes
   */
  async getPendingRequests(
    params?: GetPendingRequestsParams
  ): Promise<ApiResponse<PendingRequestsResponse>> {
    const { page = 1, limit = 12 } = params || {};
    
    try {
      // Construir query string
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await apiClient.get<PendingRequestsResponse>(
        `/api/sponsorships/requests/pending?${queryParams.toString()}`
      );

      // Manejo específico de códigos de error HTTP
      if (!response.success && response.error) {
        const errorMessage = response.error.message || 'Error al obtener solicitudes pendientes';

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
          message: error.message || 'Error al obtener solicitudes pendientes',
          code: 'GET_PENDING_REQUESTS_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Obtener mis apadrinamientos
   */
  async getMySponsorships(
    params: GetMySponsorshipsParams
  ): Promise<ApiResponse<MySponsorshipsResponse>> {
    this.validateRequired(params.padrinoId, 'padrinoId');
    
    const { padrinoId, page = 1, limit = 12, activeOnly = false } = params;
    
    try {
      // Construir query string
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        activeOnly: activeOnly.toString(),
      });

      const response = await apiClient.get<MySponsorshipsResponse>(
        `/api/sponsorships/my?${queryParams.toString()}`
      );

      // Manejo específico de códigos de error HTTP
      if (!response.success && response.error) {
        const errorMessage = response.error.message || 'Error al obtener mis apadrinamientos';

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
      }

      return response;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Error al obtener mis apadrinamientos',
          code: 'GET_MY_SPONSORSHIPS_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Obtener detalles de apadrinamiento
   */
  async getSponsorshipDetails(
    sponsorshipId: number
  ): Promise<ApiResponse<SponsorshipDetailResponse>> {
    this.validateRequired(sponsorshipId, 'sponsorshipId');

    try {
      const response = await apiClient.get<SponsorshipDetailResponse>(
        `/api/sponsorships/${sponsorshipId}`
      );

      // Manejo específico de códigos de error HTTP
      if (!response.success && response.error) {
        const errorMessage = response.error.message || 'Error al obtener detalles del apadrinamiento';

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
          message: error.message || 'Error al obtener detalles del apadrinamiento',
          code: 'GET_SPONSORSHIP_DETAILS_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Cancelar apadrinamiento
   */
  async cancelSponsorship(
    sponsorshipId: number,
    cancellationReason: string
  ): Promise<ApiResponse<SponsorshipDetailResponse>> {
    this.validateRequired(sponsorshipId, 'sponsorshipId');
    this.validateRequired(cancellationReason, 'cancellationReason');
    this.validateLength(cancellationReason, 'cancellationReason', 10, 500);

    try {
      const requestBody = {
        cancellationReason
      };

      const response = await apiClient.post<SponsorshipDetailResponse>(
        `/api/sponsorships/${sponsorshipId}/cancel`,
        requestBody
      );

      // Manejo específico de códigos de error HTTP
      if (!response.success && response.error) {
        const errorMessage = response.error.message || 'Error al cancelar apadrinamiento';

        if (errorMessage.includes('HTTP 400') || errorMessage.includes('400')) {
          return {
            success: false,
            error: {
              message: 'Apadrinamiento no válido',
              code: 'INVALID_SPONSORSHIP',
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
          message: error.message || 'Error al cancelar apadrinamiento',
          code: 'CANCEL_SPONSORSHIP_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Obtener historial de apadrinamientos (Admin)
   */
  async getSponsorshipHistory(
    params?: GetSponsorshipHistoryParams
  ): Promise<ApiResponse<SponsorshipHistoryResponse>> {
    const { page = 1, limit = 12 } = params || {};
    
    try {
      // Construir query string
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await apiClient.get<SponsorshipHistoryResponse>(
        `/api/sponsorships/history?${queryParams.toString()}`
      );

      // Manejo específico de códigos de error HTTP
      if (!response.success && response.error) {
        const errorMessage = response.error.message || 'Error al obtener historial de apadrinamientos';

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
          message: error.message || 'Error al obtener historial de apadrinamientos',
          code: 'GET_SPONSORSHIP_HISTORY_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Enviar mensaje
   */
  async sendMessage(dto: SendMessageDTO): Promise<ApiResponse<MessageResponse>> {
    this.validateRequired(dto.sponsorshipId, 'sponsorshipId');
    this.validateRequired(dto.senderId, 'senderId');
    this.validateRequired(dto.message, 'message');
    this.validateLength(dto.message, 'message', 1, 1000);
    
    return apiClient.sendToKafka<MessageResponse>(KafkaTopic.MESSAGE_SEND, dto);
  }

  /**
   * Obtener mensajes
   */
  async listMessages(sponsorshipId: number): Promise<ApiResponse<MessageResponse[]>> {
    this.validateRequired(sponsorshipId, 'sponsorshipId');
    
    return apiClient.sendToKafka<MessageResponse[]>(KafkaTopic.MESSAGE_LIST, {
      sponsorshipId,
    });
  }

  /**
   * Marcar mensajes como leídos
   */
  async markMessagesAsRead(
    sponsorshipId: number,
    userId: number
  ): Promise<ApiResponse<void>> {
    this.validateRequired(sponsorshipId, 'sponsorshipId');
    this.validateRequired(userId, 'userId');
    
    return apiClient.sendToKafka<void>(KafkaTopic.MESSAGE_MARK_READ, {
      sponsorshipId,
      userId,
    });
  }

  /**
   * Validar DTO de creación de niño
   */
  private validateCreateChildDTO(dto: CreateChildDTO): void {
    const errors: string[] = [];

    // firstName: 2-50 caracteres
    if (!dto.firstName || dto.firstName.length < 2 || dto.firstName.length > 50) {
      errors.push('firstName debe tener entre 2 y 50 caracteres');
    }

    // lastName: 2-50 caracteres
    if (!dto.lastName || dto.lastName.length < 2 || dto.lastName.length > 50) {
      errors.push('lastName debe tener entre 2 y 50 caracteres');
    }

    // dateOfBirth: formato ISO 8601
    if (!dto.dateOfBirth || !this.isValidISODate(dto.dateOfBirth)) {
      errors.push('dateOfBirth debe estar en formato ISO 8601 (ej: 2015-05-20)');
    }

    // gender: MALE | FEMALE
    if (!dto.gender || !['MALE', 'FEMALE'].includes(dto.gender)) {
      errors.push('gender debe ser "MALE" o "FEMALE"');
    }

    // municipality: 2-100 caracteres
    if (!dto.municipality || dto.municipality.length < 2 || dto.municipality.length > 100) {
      errors.push('municipality debe tener entre 2 y 100 caracteres');
    }

    // shortDescription: máx 200 caracteres
    if (!dto.shortDescription || dto.shortDescription.length > 200) {
      errors.push('shortDescription es requerido y debe tener máximo 200 caracteres');
    }

    // fullStory: requerido
    if (!dto.fullStory) {
      errors.push('fullStory es requerido');
    }

    // Optional fields validation
    if (dto.ethnicity && dto.ethnicity.length > 50) {
      errors.push('ethnicity debe tener máximo 50 caracteres');
    }

    if (dto.specialCondition && dto.specialCondition.length > 200) {
      errors.push('specialCondition debe tener máximo 200 caracteres');
    }

    if (dto.address && dto.address.length > 200) {
      errors.push('address debe tener máximo 200 caracteres');
    }

    if (dto.photo && !this.isValidUrl(dto.photo)) {
      errors.push('photo debe ser una URL válida');
    }

    if (dto.photos) {
      const invalidPhotos = dto.photos.filter(url => !this.isValidUrl(url));
      if (invalidPhotos.length > 0) {
        errors.push('Todas las URLs en photos deben ser válidas');
      }
    }

    if (errors.length > 0) {
      throw new Error(`Errores de validación:\n${errors.join('\n')}`);
    }
  }

  /**
   * Convertir datos del contexto local al formato de la API
   */
  convertToApiFormat(localChild: any): CreateChildDTO {
    return {
      firstName: localChild.nombre,
      lastName: localChild.apellidos,
      dateOfBirth: localChild.fechaNacimiento,
      gender: localChild.genero === 'masculino' ? 'MALE' : 'FEMALE',
      municipality: localChild.municipio,
      address: localChild.direccion,
      photo: localChild.foto,
      photos: localChild.fotos || [],
      needs: localChild.necesidades || [],
      ethnicity: localChild.etnia,
      specialCondition: localChild.condicionEspecial,
      shortDescription: localChild.suenos || localChild.descripcionCorta || '',
      fullStory: [
        localChild.historia,
        localChild.situacionFamiliar,
      ].filter(Boolean).join('\n\n'),
      institution: localChild.institucion,
      grade: localChild.grado,
      schedule: localChild.jornada,
    };
  }

  /**
   * Convertir datos de la API al formato del contexto local
   */
  convertFromApiFormat(apiChild: ChildResponse): any {
    return {
      id: String(apiChild.id),
      nombre: apiChild.firstName,
      apellidos: apiChild.lastName,
      fechaNacimiento: apiChild.dateOfBirth,
      edad: this.calculateAge(apiChild.dateOfBirth),
      genero: apiChild.gender === 'MALE' ? 'masculino' : 'femenino',
      municipio: apiChild.municipality,
      direccion: apiChild.address || '',
      foto: apiChild.photo || '',
      fotos: apiChild.photos || [],
      historia: apiChild.fullStory,
      suenos: apiChild.shortDescription,
      situacionFamiliar: '',
      necesidades: [],
      estadoApadrinamiento: apiChild.sponsorshipStatus === 'sponsored' ? 'apadrinado' : 'disponible',
      padrinoId: apiChild.sponsorId ? String(apiChild.sponsorId) : undefined,
      fechaCreacion: apiChild.createdAt,
      institucion: apiChild.institution || '',
      grado: apiChild.grade || '',
      jornada: apiChild.schedule as any,
    };
  }
}

// Export singleton instance
export const apadrinamientoService = new ApadrinamientoService();

// Export class for testing
export default ApadrinamientoService;
