/**
 * useChat Hook
 * 
 * Custom hook para gestionar mensajes y chat
 * Módulo: Chat (6 endpoints Kafka)
 */

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { ApiResponse } from '@/types/api.types';

// ============================================================================
// TYPES
// ============================================================================

export interface SendMessageDTO {
  sponsorshipId: number;
  senderId: number;
  receiverId: number;
  message: string;
}

export interface MessageResponse {
  id: number;
  sponsorshipId: number;
  senderId: number;
  senderName: string;
  senderRole: 'padrino' | 'admin';
  receiverId: number;
  receiverName: string;
  message: string;
  timestamp: string;
  read: boolean;
  delivered: boolean;
  createdAt: string;
}

export interface GetMessagesParams {
  sponsorshipId: number;
  userId: number;
  page?: number;
  limit?: number;
}

export interface MessagesListResponse {
  data: MessageResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MarkAsReadDTO {
  sponsorshipId: number;
  userId: number;
  messageIds?: number[];
}

export interface GetUnreadCountParams {
  userId: number;
  sponsorshipId?: number;
}

export interface UnreadCountResponse {
  count: number;
  bySponsorshipId?: Record<number, number>;
}

export interface DeleteMessageDTO {
  messageId: number;
  userId: number;
}

export interface GetConversationParams {
  userId1: number;
  userId2: number;
  page?: number;
  limit?: number;
}

// ============================================================================
// KAFKA TOPICS
// ============================================================================

const CHAT_TOPICS = {
  SEND_MESSAGE: 'apadrinamiento_chat_send_message',
  GET_MESSAGES: 'apadrinamiento_chat_get_messages',
  MARK_AS_READ: 'apadrinamiento_chat_mark_as_read',
  GET_UNREAD_COUNT: 'apadrinamiento_chat_get_unread_count',
  DELETE_MESSAGE: 'apadrinamiento_chat_delete_message',
  GET_CONVERSATION: 'apadrinamiento_chat_get_conversation',
} as const;

// ============================================================================
// HOOK
// ============================================================================

export function useChat() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // ENVIAR MENSAJE
  // ============================================================================

  /**
   * Enviar mensaje
   * Topic: apadrinamiento_chat_send_message
   */
  const sendMessage = async (
    sponsorshipId: number,
    receiverId: number,
    message: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const senderId = user?.id ? parseInt(user.id, 10) : 0;
      if (!senderId) {
        throw new Error('Usuario no autenticado');
      }

      // Validaciones locales
      if (!sponsorshipId) {
        throw new Error('sponsorshipId es requerido');
      }

      if (!receiverId) {
        throw new Error('receiverId es requerido');
      }

      if (!message || message.trim().length === 0) {
        throw new Error('El mensaje no puede estar vacío');
      }

      if (message.length > 1000) {
        throw new Error('El mensaje no puede exceder 1000 caracteres');
      }

      const response = await apiClient.sendToKafka<MessageResponse>(
        CHAT_TOPICS.SEND_MESSAGE,
        {
          sponsorshipId,
          senderId,
          receiverId,
          message: message.trim(),
        }
      );

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al enviar el mensaje');
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

  // ============================================================================
  // OBTENER MENSAJES
  // ============================================================================

  /**
   * Obtener mensajes de un apadrinamiento
   * Topic: apadrinamiento_chat_get_messages
   */
  const getMessages = async (
    sponsorshipId: number,
    page: number = 1,
    limit: number = 50
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

      const response = await apiClient.sendToKafka<MessagesListResponse>(
        CHAT_TOPICS.GET_MESSAGES,
        {
          sponsorshipId,
          userId,
          page,
          limit,
        }
      );

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al cargar mensajes');
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
      const message = err instanceof Error ? err.message : 'Error al cargar mensajes';
      setError(message);
      return { success: false, error: message, data: [], pagination: null };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // MARCAR COMO LEÍDO
  // ============================================================================

  /**
   * Marcar mensajes como leídos
   * Topic: apadrinamiento_chat_mark_as_read
   */
  const markMessagesAsRead = async (
    sponsorshipId: number,
    messageIds?: number[]
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

      const response = await apiClient.sendToKafka<{ message: string; markedCount: number }>(
        CHAT_TOPICS.MARK_AS_READ,
        {
          sponsorshipId,
          userId,
          messageIds,
        }
      );

      if (!response.success) {
        throw new Error(response.error?.message || 'Error al marcar mensajes como leídos');
      }

      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al marcar como leído';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // OBTENER CONTEO DE NO LEÍDOS
  // ============================================================================

  /**
   * Obtener cantidad de mensajes no leídos
   * Topic: apadrinamiento_chat_get_unread_count
   */
  const getUnreadCount = async (sponsorshipId?: number) => {
    try {
      setLoading(true);
      setError(null);

      const userId = user?.id ? parseInt(user.id, 10) : 0;
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      const response = await apiClient.sendToKafka<UnreadCountResponse>(
        CHAT_TOPICS.GET_UNREAD_COUNT,
        {
          userId,
          sponsorshipId,
        }
      );

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al obtener contador');
      }

      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener contador';
      setError(message);
      return { success: false, error: message, data: { count: 0 } };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // ELIMINAR MENSAJE
  // ============================================================================

  /**
   * Eliminar mensaje
   * Topic: apadrinamiento_chat_delete_message
   */
  const deleteMessage = async (messageId: number) => {
    try {
      setLoading(true);
      setError(null);

      const userId = user?.id ? parseInt(user.id, 10) : 0;
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      if (!messageId) {
        throw new Error('messageId es requerido');
      }

      const response = await apiClient.sendToKafka<{ message: string }>(
        CHAT_TOPICS.DELETE_MESSAGE,
        {
          messageId,
          userId,
        }
      );

      if (!response.success) {
        throw new Error(response.error?.message || 'Error al eliminar mensaje');
      }

      toast.success('Mensaje eliminado');
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar mensaje';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // OBTENER CONVERSACIÓN
  // ============================================================================

  /**
   * Obtener conversación entre dos usuarios
   * Topic: apadrinamiento_chat_get_conversation
   */
  const getConversation = async (
    userId2: number,
    page: number = 1,
    limit: number = 50
  ) => {
    try {
      setLoading(true);
      setError(null);

      const userId1 = user?.id ? parseInt(user.id, 10) : 0;
      if (!userId1) {
        throw new Error('Usuario no autenticado');
      }

      if (!userId2) {
        throw new Error('userId2 es requerido');
      }

      const response = await apiClient.sendToKafka<MessagesListResponse>(
        CHAT_TOPICS.GET_CONVERSATION,
        {
          userId1,
          userId2,
          page,
          limit,
        }
      );

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al cargar conversación');
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
      const message = err instanceof Error ? err.message : 'Error al cargar conversación';
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

    // Acciones
    sendMessage,
    getMessages,
    markMessagesAsRead,
    getUnreadCount,
    deleteMessage,
    getConversation,
  };
}
