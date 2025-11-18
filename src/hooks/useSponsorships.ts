/**
 * useSponsorships Hook
 * 
 * Hook completo para gestionar el módulo de Apadrinamientos (Sponsorships)
 * Incluye todas las operaciones: solicitudes, aprobaciones, cancelaciones, etc.
 */

import { useState } from 'react';
import { apadrinamientoService } from '@/services/apadrinamiento.service';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export function useSponsorships() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // SOLICITUDES DE APADRINAMIENTO
  // ============================================================================

  /**
   * Crear solicitud de apadrinamiento
   * Topic: apadrinamiento_sponsorships_create_request
   */
  const createSponsorshipRequest = async (childId: number, reason?: string) => {
    try {
      setLoading(true);
      setError(null);

      const userId = user?.id ? parseInt(user.id, 10) : 0;
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      const response = await apadrinamientoService.createSponsorshipRequest({
        childId,
        userId,
        reason,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al crear la solicitud');
      }

      toast.success('Solicitud de apadrinamiento enviada exitosamente');
      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear la solicitud';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Aprobar solicitud de apadrinamiento
   * Topic: apadrinamiento_sponsorships_approve_request
   */
  const approveSponsorshipRequest = async (requestId: number) => {
    try {
      setLoading(true);
      setError(null);

      const reviewerId = user?.id ? parseInt(user.id, 10) : 0;
      if (!reviewerId) {
        throw new Error('Usuario no autenticado');
      }

      if (user?.role !== 'admin' && user?.role !== 'super_admin') {
        throw new Error('No tienes permisos para aprobar solicitudes');
      }

      const response = await apadrinamientoService.approveSponsorshipRequest({
        requestId,
        reviewerId,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al aprobar la solicitud');
      }

      toast.success('Solicitud aprobada exitosamente');
      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al aprobar la solicitud';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Rechazar solicitud de apadrinamiento
   * Topic: apadrinamiento_sponsorships_reject_request
   */
  const rejectSponsorshipRequest = async (requestId: number, rejectionReason: string) => {
    try {
      setLoading(true);
      setError(null);

      const reviewerId = user?.id ? parseInt(user.id, 10) : 0;
      if (!reviewerId) {
        throw new Error('Usuario no autenticado');
      }

      if (user?.role !== 'admin' && user?.role !== 'super_admin') {
        throw new Error('No tienes permisos para rechazar solicitudes');
      }

      if (!rejectionReason || rejectionReason.length < 10) {
        throw new Error('El motivo del rechazo debe tener al menos 10 caracteres');
      }

      const response = await apadrinamientoService.rejectSponsorshipRequest({
        requestId,
        reviewerId,
        rejectionReason,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al rechazar la solicitud');
      }

      toast.success('Solicitud rechazada');
      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al rechazar la solicitud';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener solicitudes pendientes
   * Topic: apadrinamiento_sponsorships_get_pending_requests
   */
  const getPendingRequests = async (page: number = 1, limit: number = 12) => {
    try {
      setLoading(true);
      setError(null);

      if (user?.role !== 'admin' && user?.role !== 'super_admin') {
        throw new Error('No tienes permisos para ver solicitudes pendientes');
      }

      const response = await apadrinamientoService.getPendingRequests({
        page,
        limit,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al cargar solicitudes');
      }

      return { 
        success: true, 
        data: response.data.data,
        pagination: {
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit,
          totalPages: response.data.totalPages,
        }
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar solicitudes';
      setError(message);
      return { success: false, error: message, data: [], pagination: null };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // MIS APADRINAMIENTOS
  // ============================================================================

  /**
   * Obtener mis apadrinamientos
   * Topic: apadrinamiento_sponsorships_get_my_sponsorships
   */
  const getMySponsorships = async (
    page: number = 1, 
    limit: number = 12, 
    activeOnly: boolean = false
  ) => {
    try {
      setLoading(true);
      setError(null);

      const padrinoId = user?.id ? parseInt(user.id, 10) : 0;
      if (!padrinoId) {
        throw new Error('Usuario no autenticado');
      }

      const response = await apadrinamientoService.getMySponsorships({
        padrinoId,
        page,
        limit,
        activeOnly,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al cargar apadrinamientos');
      }

      return { 
        success: true, 
        data: response.data.data,
        pagination: {
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit,
          totalPages: response.data.totalPages,
        }
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar apadrinamientos';
      setError(message);
      return { success: false, error: message, data: [], pagination: null };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener detalles de un apadrinamiento
   * Topic: apadrinamiento_sponsorships_get_details
   */
  const getSponsorshipDetails = async (sponsorshipId: number) => {
    try {
      setLoading(true);
      setError(null);

      const userId = user?.id ? parseInt(user.id, 10) : 0;
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      // Mapear role del contexto al formato esperado por la API
      const userRole = user?.role === 'padrino' ? 'PADRINO' : 
                       user?.role === 'admin' ? 'ADMIN' : 
                       user?.role === 'super_admin' ? 'SUPER_ADMIN' : 
                       'PADRINO';

      const response = await apadrinamientoService.getSponsorshipDetails({
        sponsorshipId,
        userId,
        userRole: userRole as 'PADRINO' | 'ADMIN' | 'SUPER_ADMIN',
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al cargar detalles');
      }

      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar detalles';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // CANCELACIÓN
  // ============================================================================

  /**
   * Cancelar apadrinamiento
   * Topic: apadrinamiento_sponsorships_cancel
   */
  const cancelSponsorship = async (sponsorshipId: number, cancellationReason: string) => {
    try {
      setLoading(true);
      setError(null);

      const userId = user?.id ? parseInt(user.id, 10) : 0;
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      if (!cancellationReason || cancellationReason.length < 10) {
        throw new Error('El motivo de cancelación debe tener al menos 10 caracteres');
      }

      // Mapear role del contexto al formato esperado por la API
      const userRole = user?.role === 'padrino' ? 'PADRINO' : 
                       user?.role === 'admin' ? 'ADMIN' : 
                       user?.role === 'super_admin' ? 'SUPER_ADMIN' : 
                       'PADRINO';

      const response = await apadrinamientoService.cancelSponsorship({
        sponsorshipId,
        userId,
        userRole: userRole as 'PADRINO' | 'ADMIN' | 'SUPER_ADMIN',
        cancellationReason,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al cancelar apadrinamiento');
      }

      toast.success('Apadrinamiento cancelado exitosamente');
      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cancelar apadrinamiento';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // HISTORIAL (ADMIN)
  // ============================================================================

  /**
   * Obtener historial de apadrinamientos (Solo Admin)
   * Topic: apadrinamiento_sponsorships_get_history
   */
  const getSponsorshipHistory = async (page: number = 1, limit: number = 12) => {
    try {
      setLoading(true);
      setError(null);

      if (user?.role !== 'admin' && user?.role !== 'super_admin') {
        throw new Error('No tienes permisos para ver el historial');
      }

      const response = await apadrinamientoService.getSponsorshipHistory({
        page,
        limit,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al cargar historial');
      }

      return { 
        success: true, 
        data: response.data.data,
        pagination: {
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit,
          totalPages: response.data.totalPages,
        }
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar historial';
      setError(message);
      return { success: false, error: message, data: [], pagination: null };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Estado
    loading,
    error,
    
    // Solicitudes
    createSponsorshipRequest,
    approveSponsorshipRequest,
    rejectSponsorshipRequest,
    getPendingRequests,
    
    // Mis Apadrinamientos
    getMySponsorships,
    getSponsorshipDetails,
    
    // Cancelación
    cancelSponsorship,
    
    // Historial (Admin)
    getSponsorshipHistory,
  };
}
