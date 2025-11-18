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

    const request: CreateChildRequest = { dto, userId };
    return apiClient.sendToKafka<ChildResponse>(KafkaTopic.CHILDREN_CREATE, request);
  }

  /**
   * Actualizar un niño existente
   */
  async updateChild(
    dto: UpdateChildDTO,
    userId: number
  ): Promise<ApiResponse<ChildResponse>> {
    this.validateRequired(dto.id, 'id');
    
    const request: UpdateChildRequest = { dto, userId };
    return apiClient.sendToKafka<ChildResponse>(KafkaTopic.CHILDREN_UPDATE, request);
  }

  /**
   * Eliminar un niño
   */
  async deleteChild(
    childId: number,
    userId: number
  ): Promise<ApiResponse<void>> {
    this.validateRequired(childId, 'childId');
    
    return apiClient.sendToKafka<void>(KafkaTopic.CHILDREN_DELETE, {
      childId,
      userId,
    });
  }

  /**
   * Obtener lista de niños
   */
  async listChildren(filters?: any): Promise<ApiResponse<ChildResponse[]>> {
    return apiClient.sendToKafka<ChildResponse[]>(KafkaTopic.CHILDREN_LIST, filters || {});
  }

  /**
   * Obtener un niño por ID
   */
  async getChild(childId: number): Promise<ApiResponse<ChildResponse>> {
    this.validateRequired(childId, 'childId');
    
    return apiClient.sendToKafka<ChildResponse>(KafkaTopic.CHILDREN_GET, { childId });
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
    
    return apiClient.sendToKafka<SponsorshipRequestResponse>(
      KafkaTopic.SPONSORSHIP_REQUEST_CREATE,
      dto
    );
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
    
    return apiClient.sendToKafka<SponsorshipRequestResponse>(
      KafkaTopic.SPONSORSHIP_REQUEST_REJECT,
      dto
    );
  }

  /**
   * Obtener solicitudes pendientes
   */
  async getPendingRequests(
    params?: GetPendingRequestsParams
  ): Promise<ApiResponse<PendingRequestsResponse>> {
    const { page = 1, limit = 12 } = params || {};
    
    return apiClient.sendToKafka<PendingRequestsResponse>(
      KafkaTopic.SPONSORSHIP_GET_PENDING_REQUESTS,
      { page, limit }
    );
  }

  /**
   * Obtener mis apadrinamientos
   */
  async getMySponsorships(
    params: GetMySponsorshipsParams
  ): Promise<ApiResponse<MySponsorshipsResponse>> {
    this.validateRequired(params.padrinoId, 'padrinoId');
    
    const { padrinoId, page = 1, limit = 12, activeOnly = false } = params;
    
    return apiClient.sendToKafka<MySponsorshipsResponse>(
      KafkaTopic.SPONSORSHIP_GET_MY_SPONSORSHIPS,
      { padrinoId, page, limit, activeOnly }
    );
  }

  /**
   * Obtener detalles de apadrinamiento
   */
  async getSponsorshipDetails(
    params: GetSponsorshipDetailsParams
  ): Promise<ApiResponse<SponsorshipDetailResponse>> {
    this.validateRequired(params.sponsorshipId, 'sponsorshipId');
    this.validateRequired(params.userId, 'userId');
    this.validateRequired(params.userRole, 'userRole');
    
    const validRoles = ['PADRINO', 'ADMIN', 'SUPER_ADMIN'];
    if (!validRoles.includes(params.userRole)) {
      throw new Error('userRole debe ser PADRINO, ADMIN o SUPER_ADMIN');
    }
    
    return apiClient.sendToKafka<SponsorshipDetailResponse>(
      KafkaTopic.SPONSORSHIP_GET_DETAILS,
      params
    );
  }

  /**
   * Cancelar apadrinamiento
   */
  async cancelSponsorship(
    dto: CancelSponsorshipDTO
  ): Promise<ApiResponse<SponsorshipDetailResponse>> {
    this.validateRequired(dto.sponsorshipId, 'sponsorshipId');
    this.validateRequired(dto.userId, 'userId');
    this.validateRequired(dto.userRole, 'userRole');
    this.validateRequired(dto.cancellationReason, 'cancellationReason');
    this.validateLength(dto.cancellationReason, 'cancellationReason', 10, 500);
    
    const validRoles = ['PADRINO', 'ADMIN', 'SUPER_ADMIN'];
    if (!validRoles.includes(dto.userRole)) {
      throw new Error('userRole debe ser PADRINO, ADMIN o SUPER_ADMIN');
    }
    
    return apiClient.sendToKafka<SponsorshipDetailResponse>(
      KafkaTopic.SPONSORSHIP_CANCEL,
      dto
    );
  }

  /**
   * Obtener historial de apadrinamientos (Admin)
   */
  async getSponsorshipHistory(
    params?: GetSponsorshipHistoryParams
  ): Promise<ApiResponse<SponsorshipHistoryResponse>> {
    const { page = 1, limit = 12 } = params || {};
    
    return apiClient.sendToKafka<SponsorshipHistoryResponse>(
      KafkaTopic.SPONSORSHIP_GET_HISTORY,
      { page, limit }
    );
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
      photos: localChild.fotos,
      shortDescription: localChild.suenos || '',
      fullStory: [
        localChild.historia,
        localChild.situacionFamiliar,
        localChild.necesidades?.join(', ')
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
