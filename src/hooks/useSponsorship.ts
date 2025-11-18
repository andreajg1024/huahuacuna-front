/**
 * useSponsorship Hook
 * 
 * Custom hook para manejar operaciones de apadrinamiento
 */

import { useState } from 'react';
import { apadrinamientoService } from '@/services/apadrinamiento.service';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export function useSponsorship() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Crear apadrinamiento
   */
  const createSponsorship = async (childId: number) => {
    try {
      setLoading(true);
      setError(null);

      const userId = user?.id ? parseInt(user.id, 10) : 0;
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      const response = await apadrinamientoService.createSponsorship({
        childId,
        sponsorId: userId,
        startDate: new Date().toISOString(),
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al crear apadrinamiento');
      }

      toast.success('¡Apadrinamiento creado exitosamente!');
      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear apadrinamiento';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Finalizar apadrinamiento
   */
  const endSponsorship = async (sponsorshipId: number, reason: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apadrinamientoService.endSponsorship({
        sponsorshipId,
        endDate: new Date().toISOString(),
        reason,
      });

      if (!response.success) {
        throw new Error(response.error?.message || 'Error al finalizar apadrinamiento');
      }

      toast.success('Apadrinamiento finalizado');
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al finalizar apadrinamiento';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Listar apadrinamientos
   */
  const listSponsorships = async (filters?: any) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apadrinamientoService.listSponsorships(filters);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al cargar apadrinamientos');
      }

      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar apadrinamientos';
      setError(message);
      return { success: false, error: message, data: [] };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Enviar mensaje
   */
  const sendMessage = async (sponsorshipId: number, message: string) => {
    try {
      setLoading(true);
      setError(null);

      const userId = user?.id ? parseInt(user.id, 10) : 0;
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      const response = await apadrinamientoService.sendMessage({
        sponsorshipId,
        senderId: userId,
        message,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al enviar mensaje');
      }

      toast.success('Mensaje enviado');
      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al enviar mensaje';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Listar mensajes
   */
  const listMessages = async (sponsorshipId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apadrinamientoService.listMessages(sponsorshipId);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al cargar mensajes');
      }

      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar mensajes';
      setError(message);
      return { success: false, error: message, data: [] };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Marcar mensajes como leídos
   */
  const markMessagesAsRead = async (sponsorshipId: number) => {
    try {
      const userId = user?.id ? parseInt(user.id, 10) : 0;
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      await apadrinamientoService.markMessagesAsRead(sponsorshipId, userId);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al marcar mensajes';
      return { success: false, error: message };
    }
  };

  return {
    // State
    loading,
    error,
    
    // Actions
    createSponsorship,
    endSponsorship,
    listSponsorships,
    sendMessage,
    listMessages,
    markMessagesAsRead,
  };
}
