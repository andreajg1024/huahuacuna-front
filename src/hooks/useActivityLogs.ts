/**
 * useActivityLogs Hook
 * 
 * Custom hook para gestionar registros de actividad
 * Incluye creación y consulta de activity logs
 */

import { useState } from 'react';
import { activityLogsService } from '@/services/activity-logs.service';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityType } from '@/types/api.types';

export function useActivityLogs() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // CREAR ACTIVITY LOG
  // ============================================================================

  /**
   * Crear registro de actividad genérico
   * Topic: apadrinamiento_activity_logs_create
   */
  const createActivityLog = async (
    type: ActivityType,
    title: string,
    description: string,
    options?: {
      childId?: number;
      sponsorshipId?: number;
      metadata?: Record<string, any>;
      performedBy?: number;
      showToast?: boolean;
    }
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Validaciones locales
      if (title.length < 5 || title.length > 200) {
        throw new Error('El título debe tener entre 5 y 200 caracteres');
      }

      if (description.length < 10 || description.length > 1000) {
        throw new Error('La descripción debe tener entre 10 y 1000 caracteres');
      }

      // Si no se proporciona performedBy, usar el usuario actual
      const performedBy = options?.performedBy || (user?.id ? parseInt(user.id, 10) : undefined);

      const response = await activityLogsService.createActivityLog({
        type,
        title,
        description,
        childId: options?.childId,
        sponsorshipId: options?.sponsorshipId,
        metadata: options?.metadata,
        performedBy,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al crear el registro de actividad');
      }

      if (options?.showToast !== false) {
        toast.success('Actividad registrada exitosamente');
      }

      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear el registro';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // HELPERS ESPECÍFICOS POR TIPO
  // ============================================================================

  /**
   * Registrar actualización de niño
   */
  const logChildUpdate = async (
    childId: number,
    title: string,
    description: string,
    metadata?: Record<string, any>
  ) => {
    return createActivityLog(
      ActivityType.CHILD_UPDATE,
      title,
      description,
      { childId, metadata, showToast: false }
    );
  };

  /**
   * Registrar creación de apadrinamiento
   */
  const logSponsorshipCreated = async (
    sponsorshipId: number,
    childId: number,
    childName: string,
    sponsorName: string,
    metadata?: Record<string, any>
  ) => {
    return createActivityLog(
      ActivityType.SPONSORSHIP_CREATED,
      `Nuevo apadrinamiento creado`,
      `${sponsorName} ha apadrinado a ${childName}`,
      { 
        sponsorshipId, 
        childId, 
        metadata: { ...metadata, childName, sponsorName },
        showToast: false 
      }
    );
  };

  /**
   * Registrar cancelación de apadrinamiento
   */
  const logSponsorshipCancelled = async (
    sponsorshipId: number,
    childId: number,
    reason: string,
    metadata?: Record<string, any>
  ) => {
    return createActivityLog(
      ActivityType.SPONSORSHIP_CANCELLED,
      'Apadrinamiento cancelado',
      `Motivo: ${reason}`,
      { sponsorshipId, childId, metadata, showToast: false }
    );
  };

  /**
   * Registrar entrada de bitácora
   */
  const logBitacoraEntry = async (
    childId: number,
    entryType: string,
    description: string,
    metadata?: Record<string, any>
  ) => {
    return createActivityLog(
      ActivityType.BITACORA_ENTRY_ADDED,
      `Nueva entrada: ${entryType}`,
      description,
      { childId, metadata, showToast: false }
    );
  };

  /**
   * Registrar mensaje enviado
   */
  const logMessageSent = async (
    sponsorshipId: number,
    senderName: string,
    messagePreview: string,
    metadata?: Record<string, any>
  ) => {
    return createActivityLog(
      ActivityType.MESSAGE_SENT,
      `Mensaje de ${senderName}`,
      messagePreview.substring(0, 200),
      { sponsorshipId, metadata, showToast: false }
    );
  };

  /**
   * Registrar registro de niño
   */
  const logChildRegistered = async (
    childId: number,
    childName: string,
    metadata?: Record<string, any>
  ) => {
    return createActivityLog(
      ActivityType.CHILD_REGISTERED,
      'Niño registrado',
      `${childName} ha sido registrado en el sistema`,
      { childId, metadata, showToast: false }
    );
  };

  // ============================================================================
  // CONSULTAR ACTIVITY LOGS
  // ============================================================================

  /**
   * Obtener actividades de un niño
   * Topic: apadrinamiento_activity_logs_get_by_child
   */
  const getActivitiesByChild = async (
    childId: number,
    page: number = 1,
    limit: number = 12
  ) => {
    try {
      setLoading(true);
      setError(null);

      if (!childId) {
        throw new Error('childId es requerido');
      }

      const response = await activityLogsService.getActivitiesByChild({
        childId,
        page,
        limit,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al cargar actividades');
      }

      return {
        success: true,
        data: response.data.data,
        pagination: {
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit,
          totalPages: response.data.totalPages,
        },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar actividades';
      setError(message);
      return { success: false, error: message, data: [], pagination: null };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener actividades de un apadrinamiento
   * Topic: apadrinamiento_activity_logs_get_by_sponsorship
   */
  const getActivitiesBySponsorship = async (
    sponsorshipId: number,
    page: number = 1,
    limit: number = 12
  ) => {
    try {
      setLoading(true);
      setError(null);

      const userId = user?.id ? parseInt(user.id, 10) : 0;
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      if (!sponsorshipId) {
        throw new Error('sponsorshipId es requerido');
      }

      // Mapear role del contexto al formato esperado
      const userRole = user?.role === 'padrino' ? 'PADRINO' :
                       user?.role === 'admin' ? 'ADMIN' :
                       user?.role === 'super_admin' ? 'SUPER_ADMIN' :
                       'PADRINO';

      const response = await activityLogsService.getActivitiesBySponsorship({
        sponsorshipId,
        userId,
        userRole: userRole as 'PADRINO' | 'ADMIN' | 'SUPER_ADMIN',
        page,
        limit,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al cargar actividades');
      }

      return {
        success: true,
        data: response.data.data,
        pagination: {
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit,
          totalPages: response.data.totalPages,
        },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar actividades';
      setError(message);
      return { success: false, error: message, data: [], pagination: null };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener actividades recientes
   * Topic: apadrinamiento_activity_logs_get_recent
   */
  const getRecentActivities = async (
    page: number = 1,
    limit: number = 12,
    type?: ActivityType
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await activityLogsService.getRecentActivities({
        page,
        limit,
        type,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al cargar actividades');
      }

      return {
        success: true,
        data: response.data.data,
        pagination: {
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit,
          totalPages: response.data.totalPages,
        },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar actividades';
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

    // Crear actividades
    createActivityLog,

    // Helpers específicos
    logChildUpdate,
    logSponsorshipCreated,
    logSponsorshipCancelled,
    logBitacoraEntry,
    logMessageSent,
    logChildRegistered,

    // Consultar actividades
    getActivitiesByChild,
    getActivitiesBySponsorship,
    getRecentActivities,
  };
}
