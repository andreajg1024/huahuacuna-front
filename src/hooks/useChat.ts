/**
 * useChat Hook
 *
 * Custom hook for managing chat conversations and messages
 */

import { useState, useCallback, useEffect } from 'react';
import { chatService } from '@/services/chat.service';
import {
  ConversationResponse,
  ChatMessageResponse,
  CreateConversationDTO,
  SendChatMessageDTO,
  GetConversationsParams,
  GetMessagesParams,
  PaginatedResponse,
} from '@/types/api.types';

interface UseChatReturn {
  // State
  conversations: ConversationResponse[];
  currentConversation: ConversationResponse | null;
  messages: ChatMessageResponse[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  totalUnreadCount: number;
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  } | null;

  // Actions
  createConversation: (sponsorshipId: number) => Promise<ConversationResponse | null>;
  getConversations: (params?: GetConversationsParams) => Promise<void>;
  getConversationById: (conversationId: number) => Promise<void>;
  getConversationBySponsorship: (sponsorshipId: number) => Promise<ConversationResponse | null>;
  sendMessage: (conversationId: number, content: string) => Promise<ChatMessageResponse | null>;
  getMessages: (params: GetMessagesParams) => Promise<void>;
  getUnreadCount: (conversationId: number) => Promise<void>;
  getTotalUnreadCount: () => Promise<void>;
  markAsRead: (conversationId: number) => Promise<void>;
  clearError: () => void;
  setCurrentConversation: (conversation: ConversationResponse | null) => void;
}

export const useChat = (): UseChatReturn => {
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ConversationResponse | null>(null);
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [pagination, setPagination] = useState<{
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  } | null>(null);

  /**
   * Crear una nueva conversación
   */
  const createConversation = useCallback(async (sponsorshipId: number): Promise<ConversationResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await chatService.createConversation({ sponsorshipId });

      if (response.success && response.data) {
        // Agregar la nueva conversación a la lista
        setConversations(prev => [response.data!, ...prev]);
        return response.data;
      } else {
        setError(response.error?.message || 'Error al crear conversación');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado al crear conversación');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener todas las conversaciones
   */
  const getConversations = useCallback(async (params?: GetConversationsParams): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await chatService.getConversations(params);

      if (response.success && response.data) {
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
