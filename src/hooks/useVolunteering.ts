/**
 * useVolunteering Hook
 * 
 * Custom hook para gestionar aplicaciones de voluntariado
 * Incluye creación, actualización y listado con estados de carga y errores
 */

import { useState } from 'react';
import { volunteeringService } from '@/services/volunteering.service';
import { toast } from 'sonner';
import type {
  CreateVolunteeringApplicationDTO,
  VolunteeringApplicationResponse,
} from '@/types/api.types';

export function useVolunteering() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // CREAR APLICACIÓN
  // ============================================================================

  /**
   * Crear nueva aplicación de voluntariado
   * Topic: apadrinamiento_volunteering_application_create
   */
  const createApplication = async (applicationData: CreateVolunteeringApplicationDTO) => {
    try {
      setLoading(true);
      setError(null);

      // Validaciones locales
      if (!applicationData.fullName || applicationData.fullName.trim().length < 3) {
        throw new Error('El nombre completo debe tener al menos 3 caracteres');
      }

      if (!applicationData.email || !applicationData.email.includes('@')) {
        throw new Error('Debe proporcionar un email válido');
      }

      if (!applicationData.phone) {
        throw new Error('El teléfono es requerido');
      }

      if (!applicationData.areas || applicationData.areas.length === 0) {
        throw new Error('Debe seleccionar al menos un área de interés');
      }

      if (!applicationData.motivation || applicationData.motivation.trim().length < 20) {
        throw new Error('La motivación debe tener al menos 20 caracteres');
      }

      if (!applicationData.availability || applicationData.availability.length === 0) {
        throw new Error('Debe seleccionar al menos una disponibilidad');
      }

      if (!applicationData.acceptedTerms) {
        throw new Error('Debe aceptar los términos y condiciones');
      }

      if (!applicationData.privacyConsent) {
        throw new Error('Debe aceptar el consentimiento de privacidad');
      }

      const response = await volunteeringService.createApplication(applicationData);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al enviar la aplicación');
      }

      toast.success('¡Aplicación enviada exitosamente! Pronto nos pondremos en contacto.');
      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al enviar la aplicación';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // ACTUALIZAR APLICACIÓN
  // ============================================================================

  /**
   * Actualizar aplicación existente (para admins)
   * Topic: apadrinamiento_volunteering_application_update
   */
  const updateApplication = async (
    applicationId: number,
    updates: Partial<CreateVolunteeringApplicationDTO>
  ) => {
    try {
      setLoading(true);
      setError(null);

      if (!applicationId) {
        throw new Error('ID de aplicación es requerido');
      }

      const response = await volunteeringService.updateApplication(applicationId, updates);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al actualizar la aplicación');
      }

      toast.success('Aplicación actualizada exitosamente');
      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar la aplicación';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // LISTAR APLICACIONES
  // ============================================================================

  /**
   * Listar aplicaciones con filtros opcionales (para admins)
   * Topic: apadrinamiento_volunteering_application_list
   */
  const listApplications = async (filters?: {
    status?: 'pending' | 'approved' | 'rejected' | 'under_review';
    areas?: string[];
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await volunteeringService.listApplications(filters);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al cargar aplicaciones');
      }

      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar aplicaciones';
      setError(message);
      return { success: false, error: message, data: [] };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // OBTENER APLICACIÓN POR ID
  // ============================================================================

  /**
   * Obtener aplicación específica por ID
   */
  const getApplicationById = async (applicationId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await volunteeringService.listApplications({ id: applicationId });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al cargar la aplicación');
      }

      const application = response.data.find(
        (app: VolunteeringApplicationResponse) => app.id === applicationId
      );
      
      if (!application) {
        throw new Error('Aplicación no encontrada');
      }

      return { success: true, data: application };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar la aplicación';
      setError(message);
      return { success: false, error: message, data: null };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // APROBAR APLICACIÓN
  // ============================================================================

  /**
   * Aprobar aplicación de voluntariado (para admins)
   */
  const approveApplication = async (applicationId: number, notes?: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await volunteeringService.updateApplication(applicationId, {
        notes,
      } as any);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al aprobar la aplicación');
      }

      toast.success('Aplicación aprobada exitosamente');
      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al aprobar la aplicación';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // RECHAZAR APLICACIÓN
  // ============================================================================

  /**
   * Rechazar aplicación de voluntariado (para admins)
   */
  const rejectApplication = async (applicationId: number, reason?: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await volunteeringService.updateApplication(applicationId, {
        notes: reason,
      } as any);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al rechazar la aplicación');
      }

      toast.success('Aplicación rechazada');
      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al rechazar la aplicación';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // MARCAR EN REVISIÓN
  // ============================================================================

  /**
   * Marcar aplicación como en revisión (para admins)
   */
  const markAsUnderReview = async (applicationId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await volunteeringService.updateApplication(applicationId, {} as any);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al actualizar la aplicación');
      }

      toast.success('Aplicación marcada como en revisión');
      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar la aplicación';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // UTILIDADES
  // ============================================================================

  /**
   * Limpiar error
   */
  const clearError = () => {
    setError(null);
  };

  return {
    loading,
    error,
    clearError,
    
    // CRUD
    createApplication,
    updateApplication,
    listApplications,
    getApplicationById,
    
    // Acciones de estado
    approveApplication,
    rejectApplication,
    markAsUnderReview,
  };
}
