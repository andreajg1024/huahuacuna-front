/**
 * Chat Service
 * 
 * Servicio para sistema de mensajería entre padrinos y admins
 * Implementa 6 endpoints del módulo CHAT con logging comprehensivo
 * 
 * Endpoints:
 * 1. POST /chat/conversations - Crear conversación (Padrino)
 * 2. GET /chat/conversations - Obtener mis conversaciones
 * 3. GET /chat/conversations/:conversationId/messages - Obtener mensajes
 * 4. POST /chat/messages - Enviar mensaje
 * 5. POST /chat/conversations/:conversationId/read - Marcar como leído
 * 6. GET /chat/unread-count - Conteo de no leídos
 */

import { apiClient } from '@/lib/api-client';
import type {
  ApiResponse,
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

// ============================================================================
// LOGGER HELPER
// ============================================================================

const logger = {
  request: (endpoint: string, method: string, data?: any) => {
    console.log(`\n💬 [CHAT REQUEST] ${method} ${endpoint}`);
    if (data) {
      const sanitized = { ...data };
      // Truncar contenido largo de mensajes
      if (sanitized.content && sanitized.content.length > 100) {
        sanitized.content = sanitized.content.substring(0, 100) + '...';
      }
      console.log('📤 [CHAT REQUEST DATA]', sanitized);
    }
  },

  response: (endpoint: string, data: any) => {
    console.log(`✅ [CHAT RESPONSE] ${endpoint}`);
    console.log('📥 [CHAT RESPONSE DATA]', data);
  },

  error: (endpoint: string, error: any) => {
    console.error(`❌ [CHAT ERROR] ${endpoint}`);
    console.error('🔴 [CHAT ERROR DETAILS]', {
      message: error?.response?.data?.message || error?.message,
      statusCode: error?.response?.status,
      code: error?.response?.data?.code,
      details: error?.response?.data?.details,
    });
  },

  token: (action: string, token?: string) => {
    if (token) {
      console.log(`🔑 [CHAT TOKEN] ${action}:`, token.substring(0, 20) + '...');
    }
  },
};

// ============================================================================
// CHAT SERVICE
// ============================================================================

export const chatService = {
  /**
   * 1. POST /chat/conversations
   * Crear conversación para un apadrinamiento (Solo Padrino)
   */
  async createConversation(data: CreateConversationDTO): Promise<ApiResponse<ConversationResponse>> {
    const endpoint = '/chat/conversations';
    logger.request(endpoint, 'POST', data);

    try {
      const token = localStorage.getItem('accessToken');
      logger.token('usando token', token || undefined);

      const response = await apiClient.post<ConversationResponse>(endpoint, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      logger.response(endpoint, response.data);

      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      logger.error(endpoint, error);

      return {
        error: {
          message: error?.response?.data?.message || 'Error al crear conversación',
          statusCode: error?.response?.status,
          code: error?.response?.data?.code,
          details: error?.response?.data?.details,
        },
        success: false,
      };
    }
  },

  /**
   * 2. GET /chat/conversations
   * Obtener mis conversaciones
   */
  async getConversations(params?: PaginationDTO): Promise<ApiResponse<ConversationsListResponse>> {
    const endpoint = '/chat/conversations';
    logger.request(endpoint, 'GET', params);

    try {
      const token = localStorage.getItem('accessToken');
      logger.token('usando token', token || undefined);

      const response = await apiClient.get<ConversationsListResponse>(endpoint, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      logger.response(endpoint, response.data);

      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      logger.error(endpoint, error);

      return {
        error: {
          message: error?.response?.data?.message || 'Error al obtener conversaciones',
          statusCode: error?.response?.status,
          code: error?.response?.data?.code,
          details: error?.response?.data?.details,
        },
        success: false,
      };
    }
  },

  /**
   * 3. GET /chat/conversations/:conversationId/messages
   * Obtener mensajes de una conversación
   */
  async getMessages(conversationId: number, params?: PaginationDTO): Promise<ApiResponse<MessagesListResponse>> {
    const endpoint = `/chat/conversations/${conversationId}/messages`;
    logger.request(endpoint, 'GET', params);

    try {
      const token = localStorage.getItem('accessToken');
      logger.token('usando token', token || undefined);

      const response = await apiClient.get<MessagesListResponse>(endpoint, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      logger.response(endpoint, response.data);

      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      logger.error(endpoint, error);

      return {
        error: {
          message: error?.response?.data?.message || 'Error al obtener mensajes',
          statusCode: error?.response?.status,
          code: error?.response?.data?.code,
          details: error?.response?.data?.details,
        },
        success: false,
      };
    }
  },

  /**
   * 4. POST /chat/messages
   * Enviar mensaje
   */
  async sendMessage(data: SendMessageDTO): Promise<ApiResponse<SendMessageResponse>> {
    const endpoint = '/chat/messages';
    logger.request(endpoint, 'POST', data);

    try {
      const token = localStorage.getItem('accessToken');
      logger.token('usando token', token || undefined);

      const response = await apiClient.post<SendMessageResponse>(endpoint, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      logger.response(endpoint, response.data);

      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      logger.error(endpoint, error);

      return {
        error: {
          message: error?.response?.data?.message || 'Error al enviar mensaje',
          statusCode: error?.response?.status,
          code: error?.response?.data?.code,
          details: error?.response?.data?.details,
        },
        success: false,
      };
    }
  },

  /**
   * 5. POST /chat/conversations/:conversationId/read
   * Marcar mensajes como leídos
   */
  async markAsRead(conversationId: number): Promise<ApiResponse<MarkAsReadResponse>> {
    const endpoint = `/chat/conversations/${conversationId}/read`;
    logger.request(endpoint, 'POST');

    try {
      const token = localStorage.getItem('accessToken');
      logger.token('usando token', token || undefined);

      const response = await apiClient.post<MarkAsReadResponse>(endpoint, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      logger.response(endpoint, response.data);

      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      logger.error(endpoint, error);

      return {
        error: {
          message: error?.response?.data?.message || 'Error al marcar como leído',
          statusCode: error?.response?.status,
          code: error?.response?.data?.code,
          details: error?.response?.data?.details,
        },
        success: false,
      };
    }
  },

  /**
   * 6. GET /chat/unread-count
   * Obtener conteo de mensajes no leídos
   */
  async getUnreadCount(): Promise<ApiResponse<UnreadCountResponse>> {
    const endpoint = '/chat/unread-count';
    logger.request(endpoint, 'GET');

    try {
      const token = localStorage.getItem('accessToken');
      logger.token('usando token', token || undefined);

      const response = await apiClient.get<UnreadCountResponse>(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      logger.response(endpoint, response.data);

      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      logger.error(endpoint, error);

      return {
        error: {
          message: error?.response?.data?.message || 'Error al obtener conteo de no leídos',
          statusCode: error?.response?.status,
          code: error?.response?.data?.code,
          details: error?.response?.data?.details,
        },
        success: false,
      };
    }
  },
};

        },
        success: false,
      };
    }
  },
};

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
