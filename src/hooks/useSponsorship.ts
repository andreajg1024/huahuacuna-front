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
      console.log('[useSponsorship] createSponsorship - Start', { childId });
      setLoading(true);
      setError(null);

      const userId = user?.id ? parseInt(user.id, 10) : 0;
      if (!userId) {
        console.error('[useSponsorship] createSponsorship - Usuario no autenticado');
        throw new Error('Usuario no autenticado');
      }

      const response = await apadrinamientoService.createSponsorship({
        childId,
        sponsorId: userId,
        startDate: new Date().toISOString(),
      });

      if (!response.success || !response.data) {
        console.error('[useSponsorship] createSponsorship - Error del servicio:', response.error);
        throw new Error(response.error?.message || 'Error al crear apadrinamiento');
      }

      console.log('[useSponsorship] createSponsorship - Success:', response.data);
      toast.success('¡Apadrinamiento creado exitosamente!');
      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear apadrinamiento';
      console.error('[useSponsorship] createSponsorship - Exception:', err);
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
      console.log('[useSponsorship] endSponsorship - Start', { sponsorshipId, reason });
      setLoading(true);
      setError(null);

      const response = await apadrinamientoService.endSponsorship({
        sponsorshipId,
        endDate: new Date().toISOString(),
        reason,
      });

      if (!response.success) {
        console.error('[useSponsorship] endSponsorship - Error del servicio:', response.error);
        throw new Error(response.error?.message || 'Error al finalizar apadrinamiento');
      }

      console.log('[useSponsorship] endSponsorship - Success');
      toast.success('Apadrinamiento finalizado');
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al finalizar apadrinamiento';
      console.error('[useSponsorship] endSponsorship - Exception:', err);
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
      console.log('[useSponsorship] listSponsorships - Start', { filters });
      setLoading(true);
      setError(null);

      const response = await apadrinamientoService.listSponsorships(filters);

      if (!response.success || !response.data) {
        console.error('[useSponsorship] listSponsorships - Error del servicio:', response.error);
        throw new Error(response.error?.message || 'Error al cargar apadrinamientos');
      }

      console.log('[useSponsorship] listSponsorships - Success:', response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar apadrinamientos';
      console.error('[useSponsorship] listSponsorships - Exception:', err);
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
      console.log('[useSponsorship] sendMessage - Start', { sponsorshipId, message });
      setLoading(true);
      setError(null);

      const userId = user?.id ? parseInt(user.id, 10) : 0;
      if (!userId) {
        console.error('[useSponsorship] sendMessage - Usuario no autenticado');
        throw new Error('Usuario no autenticado');
      }

      const response = await apadrinamientoService.sendMessage({
        sponsorshipId,
        senderId: userId,
        message,
      });

      if (!response.success || !response.data) {
        console.error('[useSponsorship] sendMessage - Error del servicio:', response.error);
        throw new Error(response.error?.message || 'Error al enviar mensaje');
      }

      console.log('[useSponsorship] sendMessage - Success:', response.data);
      toast.success('Mensaje enviado');
      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al enviar mensaje';
      console.error('[useSponsorship] sendMessage - Exception:', err);
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
      console.log('[useSponsorship] listMessages - Start', { sponsorshipId });
      setLoading(true);
      setError(null);

      const response = await apadrinamientoService.listMessages(sponsorshipId);

      if (!response.success || !response.data) {
        console.error('[useSponsorship] listMessages - Error del servicio:', response.error);
        throw new Error(response.error?.message || 'Error al cargar mensajes');
      }

      console.log('[useSponsorship] listMessages - Success:', response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar mensajes';
      console.error('[useSponsorship] listMessages - Exception:', err);
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
      console.log('[useSponsorship] markMessagesAsRead - Start', { sponsorshipId });
      
      const userId = user?.id ? parseInt(user.id, 10) : 0;
      if (!userId) {
        console.error('[useSponsorship] markMessagesAsRead - Usuario no autenticado');
        throw new Error('Usuario no autenticado');
      }

      await apadrinamientoService.markMessagesAsRead(sponsorshipId, userId);
      console.log('[useSponsorship] markMessagesAsRead - Success');
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al marcar mensajes';
      console.error('[useSponsorship] markMessagesAsRead - Exception:', err);
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
