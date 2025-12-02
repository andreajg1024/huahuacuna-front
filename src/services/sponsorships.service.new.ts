/**
 * Sponsorships Service Extension
 * 
 * Service layer for sponsorship requests and management
 * Implements all 8 endpoints from Sponsorships module with comprehensive error handling
 */

import { apiClient } from '@/lib/api-client';
import { BaseService } from './base.service';
import { ApiResponse } from '@/types/api.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CreateSponsorshipRequestDTO {
  childId: number;
  reason: string;
}

export interface SponsorshipRequestResponse {
  id: number;
  childId: number;
  padrinoId: number;
  childName: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface ApproveSponsorshipRequestDTO {
  requestId: number;
}

export interface ApproveSponsorshipRequestResponse {
  requestId: number;
  sponsorshipId: number;
  status: string;
  approvedBy: number;
  approvedAt: string;
  message: string;
}

export interface RejectSponsorshipRequestDTO {
  requestId: number;
  rejectionReason: string;
}

export interface RejectSponsorshipRequestResponse {
  requestId: number;
  status: string;
  rejectedBy: number;
  rejectedAt: string;
  rejectionReason: string;
  message: string;
}

export interface PendingRequest {
  id: number;
  childId: number;
  childName: string;
  childAge: number;
  padrinoId: number;
  padrinoName: string;
  padrinoEmail: string;
  reason: string;
  status: string;
  createdAt: string;
}

export interface GetPendingRequestsParams {
  page?: number;
  limit?: number;
}

export interface GetPendingRequestsResponse {
  data: PendingRequest[];
  total: number;
  page: number;
  limit: number;
}

export interface MySponsorship {
  id: number;
  childId: number;
  childName: string;
  childAge: number;
  childPhoto: string;
  status: 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
  startDate: string;
  conversationId: number;
}

export interface GetMySponsorshipsParams {
  activeOnly?: boolean;
  page?: number;
  limit?: number;
}

export interface GetMySponsorshipsResponse {
  data: MySponsorship[];
  total: number;
  active: number;
  cancelled: number;
  completed: number;
}

export interface SponsorshipHistoryItem {
  id: number;
  childName: string;
  padrinoName: string;
  status: string;
  startDate: string;
  endDate: string | null;
  cancellationReason: string | null;
}

export interface GetSponsorshipHistoryParams {
  page?: number;
  limit?: number;
}

export interface GetSponsorshipHistoryResponse {
  data: SponsorshipHistoryItem[];
  total: number;
  page: number;
  limit: number;
}

export interface SponsorshipDetail {
  id: number;
  childId: number;
  childName: string;
  childAge: number;
  childPhoto: string;
  childMunicipality: string;
  padrinoId: number;
  padrinoName: string;
  padrinoEmail: string;
  status: string;
  startDate: string;
  endDate: string | null;
  conversationId: number;
  cancellationReason: string | null;
  createdAt: string;
}

export interface CancelSponsorshipDTO {
  cancellationReason: string;
}

export interface CancelSponsorshipResponse {
  id: number;
  status: string;
  endDate: string;
  cancellationReason: string;
  cancelledBy: number;
  message: string;
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class SponsorshipsService extends BaseService {

  // ============================================================================
  // PADRINO ENDPOINTS
  // ============================================================================

  /**
   * 1. POST /sponsorships/requests
   * Crear solicitud de apadrinamiento (Padrino)
   */
  async createSponsorshipRequest(
    data: CreateSponsorshipRequestDTO
  ): Promise<ApiResponse<SponsorshipRequestResponse>> {
    try {
      console.log('[SponsorshipsService] createSponsorshipRequest - Data:', data);

      // Validaciones
      if (!data.childId || data.childId <= 0) {
        console.error('[SponsorshipsService] createSponsorshipRequest - Invalid childId');
        return this.handleError('ID de niño inválido', 'INVALID_CHILD_ID');
      }

      if (!data.reason || data.reason.trim() === '') {
        console.error('[SponsorshipsService] createSponsorshipRequest - Reason required');
        return this.handleError('La razón es requerida', 'REASON_REQUIRED');
      }

      if (data.reason.length < 10) {
        return this.handleError('La razón debe tener al menos 10 caracteres', 'REASON_TOO_SHORT');
      }

      if (data.reason.length > 500) {
        return this.handleError('La razón no debe exceder 500 caracteres', 'REASON_TOO_LONG');
      }

      const response = await apiClient.post<SponsorshipRequestResponse>(
        '/sponsorships/requests',
        data
      );

      if (!response.success) {
        console.error('[SponsorshipsService] createSponsorshipRequest - Error:', response.error);
        
        if (response.error?.message?.includes('400') || response.error?.code === 'BAD_REQUEST') {
          return this.handleError('Datos de solicitud inválidos', 'INVALID_REQUEST_DATA', 400);
        }
        
        if (response.error?.message?.includes('401') || response.error?.code === 'UNAUTHORIZED') {
          return this.handleError('No autorizado. Inicia sesión nuevamente', 'UNAUTHORIZED', 401);
        }
        
        if (response.error?.message?.includes('403') || response.error?.code === 'FORBIDDEN') {
          return this.handleError('No tienes permisos de padrino', 'FORBIDDEN', 403);
        }
        
        if (response.error?.message?.includes('404') || response.error?.code === 'NOT_FOUND') {
          return this.handleError('Niño no encontrado o no disponible', 'CHILD_NOT_FOUND', 404);
        }

        if (response.error?.message?.includes('409') || response.error?.code === 'CONFLICT') {
          return this.handleError('Ya tienes una solicitud pendiente para este niño', 'DUPLICATE_REQUEST', 409);
        }
        
        return this.handleError(
          response.error?.message || 'Error al crear solicitud de apadrinamiento',
          'CREATE_REQUEST_ERROR'
        );
      }

      console.log('[SponsorshipsService] createSponsorshipRequest - Success:', response.data);
      return response;

    } catch (error: any) {
      console.error('[SponsorshipsService] createSponsorshipRequest - Exception:', error);
      return this.handleError(
        error.message || 'Error al crear solicitud de apadrinamiento',
        'CREATE_REQUEST_EXCEPTION'
      );
    }
  }

  /**
   * 5. GET /sponsorships/my
   * Obtener mis apadrinamientos (Padrino)
   */
  async getMySponsorships(
    params?: GetMySponsorshipsParams
  ): Promise<ApiResponse<GetMySponsorshipsResponse>> {
    try {
      console.log('[SponsorshipsService] getMySponsorships - Params:', params);

      const queryParams = new URLSearchParams();
      if (params?.activeOnly !== undefined) {
        queryParams.append('activeOnly', params.activeOnly.toString());
      }
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const url = `/sponsorships/my${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log('[SponsorshipsService] Request URL:', url);

      const response = await apiClient.get<GetMySponsorshipsResponse>(url);

      if (!response.success) {
        console.error('[SponsorshipsService] getMySponsorships - Error:', response.error);
        
        if (response.error?.message?.includes('401') || response.error?.code === 'UNAUTHORIZED') {
          return this.handleError('No autorizado. Inicia sesión nuevamente', 'UNAUTHORIZED', 401);
        }
        
        if (response.error?.message?.includes('403') || response.error?.code === 'FORBIDDEN') {
          return this.handleError('No tienes permisos de padrino', 'FORBIDDEN', 403);
        }
        
        return this.handleError(
          response.error?.message || 'Error al obtener apadrinamientos',
          'GET_MY_SPONSORSHIPS_ERROR'
        );
      }

      console.log('[SponsorshipsService] getMySponsorships - Success:', response.data);
      return response;

    } catch (error: any) {
      console.error('[SponsorshipsService] getMySponsorships - Exception:', error);
      return this.handleError(
        error.message || 'Error al obtener apadrinamientos',
        'GET_MY_SPONSORSHIPS_EXCEPTION'
      );
    }
  }

  /**
   * 7. GET /sponsorships/:id
   * Obtener detalle de apadrinamiento (Admin/Padrino)
   */
  async getSponsorshipDetails(id: number): Promise<ApiResponse<SponsorshipDetail>> {
    try {
      console.log('[SponsorshipsService] getSponsorshipDetails - ID:', id);

      if (!id || id <= 0) {
        console.error('[SponsorshipsService] getSponsorshipDetails - Invalid ID');
        return this.handleError('ID de apadrinamiento inválido', 'INVALID_SPONSORSHIP_ID');
      }

      const response = await apiClient.get<SponsorshipDetail>(`/sponsorships/${id}`);

      if (!response.success) {
        console.error('[SponsorshipsService] getSponsorshipDetails - Error:', response.error);
        
        if (response.error?.message?.includes('401') || response.error?.code === 'UNAUTHORIZED') {
          return this.handleError('No autorizado. Inicia sesión nuevamente', 'UNAUTHORIZED', 401);
        }
        
        if (response.error?.message?.includes('403') || response.error?.code === 'FORBIDDEN') {
          return this.handleError('No tienes permiso para ver este apadrinamiento', 'FORBIDDEN', 403);
        }
        
        if (response.error?.message?.includes('404') || response.error?.code === 'NOT_FOUND') {
          return this.handleError('Apadrinamiento no encontrado', 'SPONSORSHIP_NOT_FOUND', 404);
        }
        
        return this.handleError(
          response.error?.message || 'Error al obtener detalle de apadrinamiento',
          'GET_SPONSORSHIP_DETAILS_ERROR'
        );
      }

      console.log('[SponsorshipsService] getSponsorshipDetails - Success:', response.data);
      return response;

    } catch (error: any) {
      console.error('[SponsorshipsService] getSponsorshipDetails - Exception:', error);
      return this.handleError(
        error.message || 'Error al obtener detalle de apadrinamiento',
        'GET_SPONSORSHIP_DETAILS_EXCEPTION'
      );
    }
  }

  /**
   * 8. POST /sponsorships/:id/cancel
   * Cancelar apadrinamiento (Admin/Padrino)
   */
  async cancelSponsorship(
    id: number,
    data: CancelSponsorshipDTO
  ): Promise<ApiResponse<CancelSponsorshipResponse>> {
    try {
      console.log('[SponsorshipsService] cancelSponsorship - ID:', id, 'Data:', data);

      if (!id || id <= 0) {
        console.error('[SponsorshipsService] cancelSponsorship - Invalid ID');
        return this.handleError('ID de apadrinamiento inválido', 'INVALID_SPONSORSHIP_ID');
      }

      if (!data.cancellationReason || data.cancellationReason.trim() === '') {
        return this.handleError('La razón de cancelación es requerida', 'CANCELLATION_REASON_REQUIRED');
      }

      if (data.cancellationReason.length < 10) {
        return this.handleError('La razón debe tener al menos 10 caracteres', 'REASON_TOO_SHORT');
      }

      const response = await apiClient.post<CancelSponsorshipResponse>(
        `/sponsorships/${id}/cancel`,
        data
      );

      if (!response.success) {
        console.error('[SponsorshipsService] cancelSponsorship - Error:', response.error);
        
        if (response.error?.message?.includes('400') || response.error?.code === 'BAD_REQUEST') {
          return this.handleError('No se puede cancelar este apadrinamiento', 'CANNOT_CANCEL', 400);
        }
        
        if (response.error?.message?.includes('401') || response.error?.code === 'UNAUTHORIZED') {
          return this.handleError('No autorizado. Inicia sesión nuevamente', 'UNAUTHORIZED', 401);
        }
        
        if (response.error?.message?.includes('403') || response.error?.code === 'FORBIDDEN') {
          return this.handleError('No tienes permiso para cancelar este apadrinamiento', 'FORBIDDEN', 403);
        }
        
        if (response.error?.message?.includes('404') || response.error?.code === 'NOT_FOUND') {
          return this.handleError('Apadrinamiento no encontrado', 'SPONSORSHIP_NOT_FOUND', 404);
        }
        
        return this.handleError(
          response.error?.message || 'Error al cancelar apadrinamiento',
          'CANCEL_SPONSORSHIP_ERROR'
        );
      }

      console.log('[SponsorshipsService] cancelSponsorship - Success:', response.data);
      return response;

    } catch (error: any) {
      console.error('[SponsorshipsService] cancelSponsorship - Exception:', error);
      return this.handleError(
        error.message || 'Error al cancelar apadrinamiento',
        'CANCEL_SPONSORSHIP_EXCEPTION'
      );
    }
  }

  // ============================================================================
  // ADMIN ENDPOINTS
  // ============================================================================

  /**
   * 2. POST /sponsorships/requests/approve
   * Aprobar solicitud de apadrinamiento (Admin)
   */
  async approveSponsorshipRequest(
    data: ApproveSponsorshipRequestDTO
  ): Promise<ApiResponse<ApproveSponsorshipRequestResponse>> {
    try {
      console.log('[SponsorshipsService] approveSponsorshipRequest - Data:', data);

      if (!data.requestId || data.requestId <= 0) {
        console.error('[SponsorshipsService] approveSponsorshipRequest - Invalid requestId');
        return this.handleError('ID de solicitud inválido', 'INVALID_REQUEST_ID');
      }

      const response = await apiClient.post<ApproveSponsorshipRequestResponse>(
        '/sponsorships/requests/approve',
        data
      );

      if (!response.success) {
        console.error('[SponsorshipsService] approveSponsorshipRequest - Error:', response.error);
        
        if (response.error?.message?.includes('400') || response.error?.code === 'BAD_REQUEST') {
          return this.handleError('La solicitud no puede ser aprobada', 'CANNOT_APPROVE', 400);
        }
        
        if (response.error?.message?.includes('401') || response.error?.code === 'UNAUTHORIZED') {
          return this.handleError('No autorizado. Inicia sesión nuevamente', 'UNAUTHORIZED', 401);
        }
        
        if (response.error?.message?.includes('403') || response.error?.code === 'FORBIDDEN') {
          return this.handleError('No tienes permisos de administrador', 'FORBIDDEN', 403);
        }
        
        if (response.error?.message?.includes('404') || response.error?.code === 'NOT_FOUND') {
          return this.handleError('Solicitud no encontrada', 'REQUEST_NOT_FOUND', 404);
        }

        if (response.error?.message?.includes('409') || response.error?.code === 'CONFLICT') {
          return this.handleError('La solicitud ya fue procesada', 'ALREADY_PROCESSED', 409);
        }
        
        return this.handleError(
          response.error?.message || 'Error al aprobar solicitud',
          'APPROVE_REQUEST_ERROR'
        );
      }

      console.log('[SponsorshipsService] approveSponsorshipRequest - Success:', response.data);
      return response;

    } catch (error: any) {
      console.error('[SponsorshipsService] approveSponsorshipRequest - Exception:', error);
      return this.handleError(
        error.message || 'Error al aprobar solicitud',
        'APPROVE_REQUEST_EXCEPTION'
      );
    }
  }

  /**
   * 3. POST /sponsorships/requests/reject
   * Rechazar solicitud de apadrinamiento (Admin)
   */
  async rejectSponsorshipRequest(
    data: RejectSponsorshipRequestDTO
  ): Promise<ApiResponse<RejectSponsorshipRequestResponse>> {
    try {
      console.log('[SponsorshipsService] rejectSponsorshipRequest - Data:', data);

      if (!data.requestId || data.requestId <= 0) {
        console.error('[SponsorshipsService] rejectSponsorshipRequest - Invalid requestId');
        return this.handleError('ID de solicitud inválido', 'INVALID_REQUEST_ID');
      }

      if (!data.rejectionReason || data.rejectionReason.trim() === '') {
        return this.handleError('La razón de rechazo es requerida', 'REJECTION_REASON_REQUIRED');
      }

      if (data.rejectionReason.length < 10) {
        return this.handleError('La razón debe tener al menos 10 caracteres', 'REASON_TOO_SHORT');
      }

      const response = await apiClient.post<RejectSponsorshipRequestResponse>(
        '/sponsorships/requests/reject',
        data
      );

      if (!response.success) {
        console.error('[SponsorshipsService] rejectSponsorshipRequest - Error:', response.error);
        
        if (response.error?.message?.includes('400') || response.error?.code === 'BAD_REQUEST') {
          return this.handleError('La solicitud no puede ser rechazada', 'CANNOT_REJECT', 400);
        }
        
        if (response.error?.message?.includes('401') || response.error?.code === 'UNAUTHORIZED') {
          return this.handleError('No autorizado. Inicia sesión nuevamente', 'UNAUTHORIZED', 401);
        }
        
        if (response.error?.message?.includes('403') || response.error?.code === 'FORBIDDEN') {
          return this.handleError('No tienes permisos de administrador', 'FORBIDDEN', 403);
        }
        
        if (response.error?.message?.includes('404') || response.error?.code === 'NOT_FOUND') {
          return this.handleError('Solicitud no encontrada', 'REQUEST_NOT_FOUND', 404);
        }

        if (response.error?.message?.includes('409') || response.error?.code === 'CONFLICT') {
          return this.handleError('La solicitud ya fue procesada', 'ALREADY_PROCESSED', 409);
        }
        
        return this.handleError(
          response.error?.message || 'Error al rechazar solicitud',
          'REJECT_REQUEST_ERROR'
        );
      }

      console.log('[SponsorshipsService] rejectSponsorshipRequest - Success:', response.data);
      return response;

    } catch (error: any) {
      console.error('[SponsorshipsService] rejectSponsorshipRequest - Exception:', error);
      return this.handleError(
        error.message || 'Error al rechazar solicitud',
        'REJECT_REQUEST_EXCEPTION'
      );
    }
  }

  /**
   * 4. GET /sponsorships/requests/pending
   * Obtener solicitudes pendientes (Admin)
   */
  async getPendingRequests(
    params?: GetPendingRequestsParams
  ): Promise<ApiResponse<GetPendingRequestsResponse>> {
    try {
      console.log('[SponsorshipsService] getPendingRequests - Params:', params);

      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const url = `/sponsorships/requests/pending${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log('[SponsorshipsService] Request URL:', url);

      const response = await apiClient.get<GetPendingRequestsResponse>(url);

      if (!response.success) {
        console.error('[SponsorshipsService] getPendingRequests - Error:', response.error);
        
        if (response.error?.message?.includes('401') || response.error?.code === 'UNAUTHORIZED') {
          return this.handleError('No autorizado. Inicia sesión nuevamente', 'UNAUTHORIZED', 401);
        }
        
        if (response.error?.message?.includes('403') || response.error?.code === 'FORBIDDEN') {
          return this.handleError('No tienes permisos de administrador', 'FORBIDDEN', 403);
        }
        
        return this.handleError(
          response.error?.message || 'Error al obtener solicitudes pendientes',
          'GET_PENDING_REQUESTS_ERROR'
        );
      }

      console.log('[SponsorshipsService] getPendingRequests - Success:', response.data);
      return response;

    } catch (error: any) {
      console.error('[SponsorshipsService] getPendingRequests - Exception:', error);
      return this.handleError(
        error.message || 'Error al obtener solicitudes pendientes',
        'GET_PENDING_REQUESTS_EXCEPTION'
      );
    }
  }

  /**
   * 6. GET /sponsorships/history
   * Obtener historial de apadrinamientos (Admin)
   */
  async getSponsorshipHistory(
    params?: GetSponsorshipHistoryParams
  ): Promise<ApiResponse<GetSponsorshipHistoryResponse>> {
    try {
      console.log('[SponsorshipsService] getSponsorshipHistory - Params:', params);

      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const url = `/sponsorships/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log('[SponsorshipsService] Request URL:', url);

      const response = await apiClient.get<GetSponsorshipHistoryResponse>(url);

      if (!response.success) {
        console.error('[SponsorshipsService] getSponsorshipHistory - Error:', response.error);
        
        if (response.error?.message?.includes('401') || response.error?.code === 'UNAUTHORIZED') {
          return this.handleError('No autorizado. Inicia sesión nuevamente', 'UNAUTHORIZED', 401);
        }
        
        if (response.error?.message?.includes('403') || response.error?.code === 'FORBIDDEN') {
          return this.handleError('No tienes permisos de administrador', 'FORBIDDEN', 403);
        }
        
        return this.handleError(
          response.error?.message || 'Error al obtener historial de apadrinamientos',
          'GET_SPONSORSHIP_HISTORY_ERROR'
        );
      }

      console.log('[SponsorshipsService] getSponsorshipHistory - Success:', response.data);
      return response;

    } catch (error: any) {
      console.error('[SponsorshipsService] getSponsorshipHistory - Exception:', error);
      return this.handleError(
        error.message || 'Error al obtener historial de apadrinamientos',
        'GET_SPONSORSHIP_HISTORY_EXCEPTION'
      );
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private handleError(message: string, code: string, statusCode?: number): ApiResponse<never> {
    return {
      success: false,
      error: {
        message,
        code,
        statusCode,
      },
    };
  }
}

// Export singleton instance
export const sponsorshipsService = new SponsorshipsService();
