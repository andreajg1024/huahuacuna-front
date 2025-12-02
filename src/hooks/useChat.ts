/**
 * useChat Hook
 * Hook para gestión de chat con estados loading/error
 */

import { useState } from 'react';
import { chatService } from '@/services/chat.service';
import type {
  ApiError,
  CreateConversationDTO,
  ConversationResponse,
  PaginationDTO,
  ConversationsListResponse,
  MessagesListResponse,
  SendMessageDTO,
  SendMessageResponse,
  MarkAsReadResponse,
  UnreadCountResponse,
} from '@/types/api.types';

interface UseChatState {
  loading: boolean;
  error: ApiError | null;
}

export const useChat = () => {
  const [state, setState] = useState<UseChatState>({ loading: false, error: null });

  const clearError = () => setState((s: UseChatState) => ({ ...s, error: null }));

  const createConversation = async (data: CreateConversationDTO) => {
    setState({ loading: true, error: null });
    const result = await chatService.createConversation(data);
    setState({ loading: false, error: result.error || null });
    return result.data || null;
  };

  const getConversations = async (params?: PaginationDTO) => {
    setState({ loading: true, error: null });
    const result = await chatService.getConversations(params);
    setState({ loading: false, error: result.error || null });
    return result.data || null;
  };

  const getMessages = async (conversationId: number, params?: PaginationDTO) => {
    setState({ loading: true, error: null });
    const result = await chatService.getMessages(conversationId, params);
    setState({ loading: false, error: result.error || null });
    return result.data || null;
  };

  const sendMessage = async (data: SendMessageDTO) => {
    setState({ loading: true, error: null });
    const result = await chatService.sendMessage(data);
    setState({ loading: false, error: result.error || null });
    return result.data || null;
  };

  const markAsRead = async (conversationId: number) => {
    setState({ loading: true, error: null });
    const result = await chatService.markAsRead(conversationId);
    setState({ loading: false, error: result.error || null });
    return result.data || null;
  };

  const getUnreadCount = async () => {
    setState({ loading: true, error: null });
    const result = await chatService.getUnreadCount();
    setState({ loading: false, error: result.error || null });
    return result.data || null;
  };

  return {
    ...state,
    clearError,
    createConversation,
    getConversations,
    getMessages,
    sendMessage,
    markAsRead,
    getUnreadCount,
  };
};
        setConversations(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setError(response.error?.message || 'Error al obtener conversaciones');
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado al obtener conversaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener una conversación por ID
   */
  const getConversationById = useCallback(async (conversationId: number): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await chatService.getConversationById(conversationId);

      if (response.success && response.data) {
        setCurrentConversation(response.data);
      } else {
        setError(response.error?.message || 'Error al obtener conversación');
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado al obtener conversación');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener conversación por sponsorshipId
   */
  const getConversationBySponsorship = useCallback(async (sponsorshipId: number): Promise<ConversationResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await chatService.getConversationBySponsorship(sponsorshipId);

      if (response.success && response.data) {
        setCurrentConversation(response.data);
        return response.data;
      } else {
        setError(response.error?.message || 'Error al obtener conversación');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado al obtener conversación');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Enviar un mensaje
   */
  const sendMessage = useCallback(async (conversationId: number, content: string): Promise<ChatMessageResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await chatService.sendMessage({ conversationId, content });

      if (response.success && response.data) {
        // Agregar el mensaje a la lista
        setMessages(prev => [...prev, response.data!]);
        return response.data;
      } else {
        setError(response.error?.message || 'Error al enviar mensaje');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado al enviar mensaje');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener mensajes de una conversación
   */
  const getMessages = useCallback(async (params: GetMessagesParams): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await chatService.getMessages(params);

      if (response.success && response.data) {
        setMessages(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setError(response.error?.message || 'Error al obtener mensajes');
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado al obtener mensajes');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener conteo de mensajes no leídos de una conversación específica
   */
  const getUnreadCount = useCallback(async (conversationId: number): Promise<void> => {
    try {
      const response = await chatService.getUnreadCount(conversationId);

      if (response.success && response.data) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (err: any) {
      console.error('Error al obtener conteo de mensajes no leídos:', err);
    }
  }, []);

  /**
   * Obtener total de mensajes no leídos de todas las conversaciones
   */
  const getTotalUnreadCount = useCallback(async (): Promise<void> => {
    try {
      const response = await chatService.getTotalUnreadCount();

      if (response.success && response.data) {
        setTotalUnreadCount(response.data.totalUnread);
      }
    } catch (err: any) {
      console.error('Error al obtener total de mensajes no leídos:', err);
    }
  }, []);

  /**
   * Marcar mensajes como leídos
   */
  const markAsRead = useCallback(async (conversationId: number): Promise<void> => {
    try {
      const response = await chatService.markMessagesAsRead({ conversationId });

      if (response.success) {
        // Actualizar el estado de los mensajes a leídos
        setMessages(prev =>
          prev.map(msg =>
            msg.conversationId === conversationId ? { ...msg, read: true } : msg
          )
        );

        // Resetear el contador de no leídos para esta conversación
        setUnreadCount(0);

        // Actualizar el total de mensajes no leídos
        await getTotalUnreadCount();
      }
    } catch (err: any) {
      console.error('Error al marcar mensajes como leídos:', err);
    }
  }, [getTotalUnreadCount]);

  /**
   * Limpiar error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    conversations,
    currentConversation,
    messages,
    loading,
    error,
    unreadCount,
    totalUnreadCount,
    pagination,

    // Actions
    createConversation,
    getConversations,
    getConversationById,
    getConversationBySponsorship,
    sendMessage,
    getMessages,
    getUnreadCount,
    getTotalUnreadCount,
    markAsRead,
    clearError,
    setCurrentConversation,
  };
};
