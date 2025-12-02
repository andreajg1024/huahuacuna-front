/**
 * useSponsorship Hook
 * 
 * Custom hook para manejar operaciones de apadrinamiento
 * Implementa todos los 8 endpoints del módulo Sponsorships con logging completo
 */

import { useState } from 'react';
import {
  sponsorshipsService,
  CreateSponsorshipRequestDTO,
  ApproveSponsorshipRequestDTO,
  RejectSponsorshipRequestDTO,
  GetPendingRequestsParams,
  GetMySponsorshipsParams,
  GetSponsorshipHistoryParams,
  CancelSponsorshipDTO,
} from '@/services/sponsorships.service.new';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export function useSponsorship() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // ENDPOINTS PADRINO
  // ============================================================================

  /**
   * 1. POST /sponsorships/requests
   * Crear solicitud de apadrinamiento (Padrino)
   */
  const createSponsorshipRequest = async (childId: number, reason: string) => {
    try {
      console.log('[useSponsorship] createSponsorshipRequest - Start:', { childId, reason });
      setLoading(true);
      setError(null);

      // Verificar autenticación
      if (!user) {
        const errorMsg = 'Debes iniciar sesión para solicitar un apadrinamiento';
        console.error('[useSponsorship] createSponsorshipRequest - Not authenticated');
        setError(errorMsg);
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      const response = await sponsorshipsService.createSponsorshipRequest({
        childId,
        reason,
      });

      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Error al crear solicitud de apadrinamiento';
        console.error('[useSponsorship] createSponsorshipRequest - Error:', response.error);
        setError(errorMsg);
        
        // Mensajes específicos según el error
        if (response.error?.code === 'UNAUTHORIZED') {
          toast.error('Tu sesión ha expirado. Inicia sesión nuevamente');
        } else if (response.error?.code === 'FORBIDDEN') {
          toast.error('No tienes permisos de padrino');
        } else if (response.error?.code === 'CHILD_NOT_FOUND') {
          toast.error('Niño no encontrado o no disponible');
        } else if (response.error?.code === 'DUPLICATE_REQUEST') {
          toast.error('Ya tienes una solicitud pendiente para este niño');
        } else {
          toast.error(errorMsg);
        }
        
        return { success: false, error: errorMsg };
      }

      console.log('[useSponsorship] createSponsorshipRequest - Success:', response.data);
      toast.success('Solicitud de apadrinamiento creada exitosamente');
      return { success: true, data: response.data };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear solicitud de apadrinamiento';
      console.error('[useSponsorship] createSponsorshipRequest - Exception:', err);
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 5. GET /sponsorships/my
   * Obtener mis apadrinamientos (Padrino)
   */
  const getMySponsorships = async (params?: GetMySponsorshipsParams) => {
    try {
      console.log('[useSponsorship] getMySponsorships - Start:', params);
      setLoading(true);
      setError(null);

      // Verificar autenticación
      if (!user) {
        const errorMsg = 'Debes iniciar sesión';
        console.error('[useSponsorship] getMySponsorships - Not authenticated');
        setError(errorMsg);
        return {
          success: false,
          error: errorMsg,
          data: { data: [], total: 0, active: 0, cancelled: 0, completed: 0 },
        };
      }

      const response = await sponsorshipsService.getMySponsorships(params);

      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Error al obtener apadrinamientos';
        console.error('[useSponsorship] getMySponsorships - Error:', response.error);
        setError(errorMsg);
        
        if (response.error?.code === 'UNAUTHORIZED') {
          toast.error('Tu sesión ha expirado. Inicia sesión nuevamente');
        } else if (response.error?.code === 'FORBIDDEN') {
          toast.error('No tienes permisos de padrino');
        }
        
        return {
          success: false,
          error: errorMsg,
          data: { data: [], total: 0, active: 0, cancelled: 0, completed: 0 },
        };
      }

      console.log('[useSponsorship] getMySponsorships - Success:', response.data);
      return { success: true, data: response.data };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener apadrinamientos';
      console.error('[useSponsorship] getMySponsorships - Exception:', err);
      setError(message);
      return {
        success: false,
        error: message,
        data: { data: [], total: 0, active: 0, cancelled: 0, completed: 0 },
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 7. GET /sponsorships/:id
   * Obtener detalle de apadrinamiento (Admin/Padrino)
   */
  const getSponsorshipDetails = async (id: number) => {
    try {
      console.log('[useSponsorship] getSponsorshipDetails - Start:', id);
      setLoading(true);
      setError(null);

      // Verificar autenticación
      if (!user) {
        const errorMsg = 'Debes iniciar sesión';
        console.error('[useSponsorship] getSponsorshipDetails - Not authenticated');
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      const response = await sponsorshipsService.getSponsorshipDetails(id);

      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Error al obtener detalle de apadrinamiento';
        console.error('[useSponsorship] getSponsorshipDetails - Error:', response.error);
        setError(errorMsg);
        
        if (response.error?.code === 'UNAUTHORIZED') {
          toast.error('Tu sesión ha expirado. Inicia sesión nuevamente');
        } else if (response.error?.code === 'FORBIDDEN') {
          toast.error('No tienes permiso para ver este apadrinamiento');
        } else if (response.error?.code === 'SPONSORSHIP_NOT_FOUND') {
          toast.error('Apadrinamiento no encontrado');
        }
        
        return { success: false, error: errorMsg };
      }

      console.log('[useSponsorship] getSponsorshipDetails - Success:', response.data);
      return { success: true, data: response.data };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener detalle de apadrinamiento';
      console.error('[useSponsorship] getSponsorshipDetails - Exception:', err);
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 8. POST /sponsorships/:id/cancel
   * Cancelar apadrinamiento (Admin/Padrino)
   */
  const cancelSponsorship = async (id: number, cancellationReason: string) => {
    try {
      console.log('[useSponsorship] cancelSponsorship - Start:', { id, cancellationReason });
      setLoading(true);
      setError(null);

      // Verificar autenticación
      if (!user) {
        const errorMsg = 'Debes iniciar sesión';
        console.error('[useSponsorship] cancelSponsorship - Not authenticated');
        setError(errorMsg);
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      const response = await sponsorshipsService.cancelSponsorship(id, {
        cancellationReason,
      });

      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Error al cancelar apadrinamiento';
        console.error('[useSponsorship] cancelSponsorship - Error:', response.error);
        setError(errorMsg);
        
        if (response.error?.code === 'UNAUTHORIZED') {
          toast.error('Tu sesión ha expirado. Inicia sesión nuevamente');
        } else if (response.error?.code === 'FORBIDDEN') {
          toast.error('No tienes permiso para cancelar este apadrinamiento');
        } else if (response.error?.code === 'SPONSORSHIP_NOT_FOUND') {
          toast.error('Apadrinamiento no encontrado');
        } else if (response.error?.code === 'CANNOT_CANCEL') {
          toast.error('No se puede cancelar este apadrinamiento');
        } else {
          toast.error(errorMsg);
        }
        
        return { success: false, error: errorMsg };
      }

      console.log('[useSponsorship] cancelSponsorship - Success:', response.data);
      toast.success('Apadrinamiento cancelado exitosamente');
      return { success: true, data: response.data };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cancelar apadrinamiento';
      console.error('[useSponsorship] cancelSponsorship - Exception:', err);
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // ENDPOINTS ADMIN
  // ============================================================================

  /**
   * 2. POST /sponsorships/requests/approve
   * Aprobar solicitud de apadrinamiento (Admin)
   */
  const approveSponsorshipRequest = async (requestId: number) => {
    try {
      console.log('[useSponsorship] approveSponsorshipRequest - Start:', requestId);
      setLoading(true);
      setError(null);

      // Verificar autenticación
      if (!user) {
        const errorMsg = 'Debes iniciar sesión';
        console.error('[useSponsorship] approveSponsorshipRequest - Not authenticated');
        setError(errorMsg);
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      const response = await sponsorshipsService.approveSponsorshipRequest({
        requestId,
      });

      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Error al aprobar solicitud';
        console.error('[useSponsorship] approveSponsorshipRequest - Error:', response.error);
        setError(errorMsg);
        
        if (response.error?.code === 'UNAUTHORIZED') {
          toast.error('Tu sesión ha expirado. Inicia sesión nuevamente');
        } else if (response.error?.code === 'FORBIDDEN') {
          toast.error('No tienes permisos de administrador');
        } else if (response.error?.code === 'REQUEST_NOT_FOUND') {
          toast.error('Solicitud no encontrada');
        } else if (response.error?.code === 'ALREADY_PROCESSED') {
          toast.error('La solicitud ya fue procesada');
        } else if (response.error?.code === 'CANNOT_APPROVE') {
          toast.error('La solicitud no puede ser aprobada');
        } else {
          toast.error(errorMsg);
        }
        
        return { success: false, error: errorMsg };
      }

      console.log('[useSponsorship] approveSponsorshipRequest - Success:', response.data);
      toast.success('Solicitud aprobada exitosamente');
      return { success: true, data: response.data };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al aprobar solicitud';
      console.error('[useSponsorship] approveSponsorshipRequest - Exception:', err);
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 3. POST /sponsorships/requests/reject
   * Rechazar solicitud de apadrinamiento (Admin)
   */
  const rejectSponsorshipRequest = async (requestId: number, rejectionReason: string) => {
    try {
      console.log('[useSponsorship] rejectSponsorshipRequest - Start:', { requestId, rejectionReason });
      setLoading(true);
      setError(null);

      // Verificar autenticación
      if (!user) {
        const errorMsg = 'Debes iniciar sesión';
        console.error('[useSponsorship] rejectSponsorshipRequest - Not authenticated');
        setError(errorMsg);
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      const response = await sponsorshipsService.rejectSponsorshipRequest({
        requestId,
        rejectionReason,
      });

      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Error al rechazar solicitud';
        console.error('[useSponsorship] rejectSponsorshipRequest - Error:', response.error);
        setError(errorMsg);
        
        if (response.error?.code === 'UNAUTHORIZED') {
          toast.error('Tu sesión ha expirado. Inicia sesión nuevamente');
        } else if (response.error?.code === 'FORBIDDEN') {
          toast.error('No tienes permisos de administrador');
        } else if (response.error?.code === 'REQUEST_NOT_FOUND') {
          toast.error('Solicitud no encontrada');
        } else if (response.error?.code === 'ALREADY_PROCESSED') {
          toast.error('La solicitud ya fue procesada');
        } else if (response.error?.code === 'CANNOT_REJECT') {
          toast.error('La solicitud no puede ser rechazada');
        } else {
          toast.error(errorMsg);
        }
        
        return { success: false, error: errorMsg };
      }

      console.log('[useSponsorship] rejectSponsorshipRequest - Success:', response.data);
      toast.success('Solicitud rechazada');
      return { success: true, data: response.data };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al rechazar solicitud';
      console.error('[useSponsorship] rejectSponsorshipRequest - Exception:', err);
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 4. GET /sponsorships/requests/pending
   * Obtener solicitudes pendientes (Admin)
   */
  const getPendingRequests = async (params?: GetPendingRequestsParams) => {
    try {
      console.log('[useSponsorship] getPendingRequests - Start:', params);
      setLoading(true);
      setError(null);

      // Verificar autenticación
      if (!user) {
        const errorMsg = 'Debes iniciar sesión';
        console.error('[useSponsorship] getPendingRequests - Not authenticated');
        setError(errorMsg);
        return {
          success: false,
          error: errorMsg,
          data: { data: [], total: 0, page: 1, limit: 50 },
        };
      }

      const response = await sponsorshipsService.getPendingRequests(params);

      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Error al obtener solicitudes pendientes';
        console.error('[useSponsorship] getPendingRequests - Error:', response.error);
        setError(errorMsg);
        
        if (response.error?.code === 'UNAUTHORIZED') {
          toast.error('Tu sesión ha expirado. Inicia sesión nuevamente');
        } else if (response.error?.code === 'FORBIDDEN') {
          toast.error('No tienes permisos de administrador');
        }
        
        return {
          success: false,
          error: errorMsg,
          data: { data: [], total: 0, page: 1, limit: 50 },
        };
      }

      console.log('[useSponsorship] getPendingRequests - Success:', response.data);
      return { success: true, data: response.data };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener solicitudes pendientes';
      console.error('[useSponsorship] getPendingRequests - Exception:', err);
      setError(message);
      return {
        success: false,
        error: message,
        data: { data: [], total: 0, page: 1, limit: 50 },
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 6. GET /sponsorships/history
   * Obtener historial de apadrinamientos (Admin)
   */
  const getSponsorshipHistory = async (params?: GetSponsorshipHistoryParams) => {
    try {
      console.log('[useSponsorship] getSponsorshipHistory - Start:', params);
      setLoading(true);
      setError(null);

      // Verificar autenticación
      if (!user) {
        const errorMsg = 'Debes iniciar sesión';
        console.error('[useSponsorship] getSponsorshipHistory - Not authenticated');
        setError(errorMsg);
        return {
          success: false,
          error: errorMsg,
          data: { data: [], total: 0, page: 1, limit: 50 },
        };
      }

      const response = await sponsorshipsService.getSponsorshipHistory(params);

      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Error al obtener historial de apadrinamientos';
        console.error('[useSponsorship] getSponsorshipHistory - Error:', response.error);
        setError(errorMsg);
        
        if (response.error?.code === 'UNAUTHORIZED') {
          toast.error('Tu sesión ha expirado. Inicia sesión nuevamente');
        } else if (response.error?.code === 'FORBIDDEN') {
          toast.error('No tienes permisos de administrador');
        }
        
        return {
          success: false,
          error: errorMsg,
          data: { data: [], total: 0, page: 1, limit: 50 },
        };
      }

      console.log('[useSponsorship] getSponsorshipHistory - Success:', response.data);
      return { success: true, data: response.data };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener historial de apadrinamientos';
      console.error('[useSponsorship] getSponsorshipHistory - Exception:', err);
      setError(message);
      return {
        success: false,
        error: message,
        data: { data: [], total: 0, page: 1, limit: 50 },
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    
    // Padrino
    createSponsorshipRequest,
    getMySponsorships,
    getSponsorshipDetails,
    cancelSponsorship,
    
    // Admin
    approveSponsorshipRequest,
    rejectSponsorshipRequest,
    getPendingRequests,
    getSponsorshipHistory,
  };
}
