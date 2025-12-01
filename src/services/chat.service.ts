/**
 * Chat Service
 *
 * Service layer for chat and conversations management
 */

import { apiClient } from '@/lib/api-client';
import {
  CreateConversationDTO,
  ConversationResponse,
  GetConversationsParams,
  SendChatMessageDTO,
  ChatMessageResponse,
  GetMessagesParams,
  MarkMessagesAsReadDTO,
  ApiResponse,
  PaginatedResponse,
} from '@/types/api.types';

export class ChatService {
  /**
   * Crear una nueva conversación
   */
  async createConversation(
    dto: CreateConversationDTO
  ): Promise<ApiResponse<ConversationResponse>> {
    try {
      const response = await apiClient.post<ConversationResponse>(
        '/api/chat/conversations',
        dto
      );

      return response;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Error al crear conversación',
          code: 'CREATE_CONVERSATION_ERROR',
          details: error,
        },
      };
    }
  }

  /**
   * Obtener todas las conversaciones del usuario
   */
  async getConversations(
    params?: GetConversationsParams
  ): Promise<ApiResponse<PaginatedResponse<ConversationResponse>>> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const url = `/api/chat/conversations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await apiClient.get<PaginatedResponse<ConversationResponse>>(url);

      return response;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Error al obtener conversaciones',
          code: 'GET_CONVERSATIONS_ERROR',
          details: error,
        },
      };
    }
  }

  /**
   * Obtener una conversación por ID
   */
  async getConversationById(
    conversationId: number
  ): Promise<ApiResponse<ConversationResponse>> {
    try {
      const response = await apiClient.get<ConversationResponse>(
        `/api/chat/conversations/${conversationId}`
      );

      return response;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Error al obtener conversación',
          code: 'GET_CONVERSATION_ERROR',
          details: error,
        },
      };
    }
  }

  /**
   * Enviar un mensaje en una conversación
   */
  async sendMessage(
    dto: SendChatMessageDTO
  ): Promise<ApiResponse<ChatMessageResponse>> {
    try {
      const response = await apiClient.post<ChatMessageResponse>(
        `/api/chat/conversations/${dto.conversationId}/messages`,
        { content: dto.content }
      );

      return response;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Error al enviar mensaje',
          code: 'SEND_MESSAGE_ERROR',
          details: error,
        },
      };
    }
  }

  /**
   * Obtener mensajes de una conversación
   */
  async getMessages(
    params: GetMessagesParams
  ): Promise<ApiResponse<PaginatedResponse<ChatMessageResponse>>> {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const url = `/api/chat/conversations/${params.conversationId}/messages${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await apiClient.get<PaginatedResponse<ChatMessageResponse>>(url);

      return response;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Error al obtener mensajes',
          code: 'GET_MESSAGES_ERROR',
          details: error,
        },
      };
    }
  }

  /**
   * Obtener conteo de mensajes no leídos en una conversación
   */
  async getUnreadCount(
    conversationId: number
  ): Promise<ApiResponse<{ unreadCount: number }>> {
    try {
      const response = await apiClient.get<{ unreadCount: number }>(
        `/api/chat/conversations/${conversationId}/unread-count`
      );

      return response;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Error al obtener conteo de mensajes no leídos',
          code: 'GET_UNREAD_COUNT_ERROR',
          details: error,
        },
      };
    }
  }

  /**
   * Obtener total de mensajes no leídos de todas las conversaciones del usuario
   */
  async getTotalUnreadCount(): Promise<ApiResponse<{ totalUnread: number }>> {
    try {
      const response = await apiClient.get<{ totalUnread: number }>(
        '/api/chat/conversations/unread-count'
      );

      return response;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Error al obtener total de mensajes no leídos',
          code: 'GET_TOTAL_UNREAD_ERROR',
          details: error,
        },
      };
    }
  }

  /**
   * Marcar mensajes como leídos
   */
  async markMessagesAsRead(
    dto: MarkMessagesAsReadDTO
  ): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const response = await apiClient.put<{ success: boolean }>(
        `/api/chat/conversations/${dto.conversationId}/read`,
        {}
      );

      return response;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Error al marcar mensajes como leídos',
          code: 'MARK_READ_ERROR',
          details: error,
        },
      };
    }
  }

  /**
   * Obtener conversación por sponsorshipId
   */
  async getConversationBySponsorship(
    sponsorshipId: number
  ): Promise<ApiResponse<ConversationResponse>> {
    try {
      const response = await apiClient.get<ConversationResponse>(
        `/api/chat/conversations/sponsorship/${sponsorshipId}`
      );

      return response;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Error al obtener conversación',
          code: 'GET_CONVERSATION_BY_SPONSORSHIP_ERROR',
          details: error,
        },
      };
    }
  }
}

export const chatService = new ChatService();
