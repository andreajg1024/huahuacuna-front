/**
 * useNews Hook
 * 
 * Custom hook para gestionar artículos y noticias
 * Incluye CRUD completo con estados de carga y errores
 */

import { useState } from 'react';
import { newsService } from '@/services/news.service';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import type {
  CreateNewsDTO,
  UpdateNewsDTO,
  NewsResponse,
} from '@/types/api.types';

export function useNews() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // CREAR ARTÍCULO
  // ============================================================================

  /**
   * Crear nuevo artículo
   * Topic: apadrinamiento_news_create
   */
  const createArticle = async (articleData: CreateNewsDTO) => {
    try {
      setLoading(true);
      setError(null);

      const userId = user?.id ? parseInt(user.id, 10) : 0;
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      const response = await newsService.createArticle(articleData, userId);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al crear el artículo');
      }

      toast.success('Artículo creado exitosamente');
      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear el artículo';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // ACTUALIZAR ARTÍCULO
  // ============================================================================

  /**
   * Actualizar artículo existente
   * Topic: apadrinamiento_news_update
   */
  const updateArticle = async (articleData: UpdateNewsDTO) => {
    try {
      setLoading(true);
      setError(null);

      const userId = user?.id ? parseInt(user.id, 10) : 0;
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      if (!articleData.id) {
        throw new Error('ID del artículo es requerido');
      }

      const response = await newsService.updateArticle(articleData, userId);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al actualizar el artículo');
      }

      toast.success('Artículo actualizado exitosamente');
      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar el artículo';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // ELIMINAR ARTÍCULO
  // ============================================================================

  /**
   * Eliminar artículo
   * Topic: apadrinamiento_news_delete
   */
  const deleteArticle = async (articleId: number) => {
    try {
      setLoading(true);
      setError(null);

      const userId = user?.id ? parseInt(user.id, 10) : 0;
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      const response = await newsService.deleteArticle(articleId, userId);

      if (!response.success) {
        throw new Error(response.error?.message || 'Error al eliminar el artículo');
      }

      toast.success('Artículo eliminado exitosamente');
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar el artículo';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // LISTAR ARTÍCULOS
  // ============================================================================

  /**
   * Listar artículos con filtros opcionales
   * Topic: apadrinamiento_news_list
   */
  const listArticles = async (filters?: {
    status?: 'draft' | 'scheduled' | 'published' | 'archived';
    category?: string;
    tag?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await newsService.listArticles(filters);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al cargar artículos');
      }

      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar artículos';
      setError(message);
      return { success: false, error: message, data: [] };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // OBTENER ARTÍCULO POR ID
  // ============================================================================

  /**
   * Obtener artículo por ID
   */
  const getArticleById = async (articleId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await newsService.listArticles({ id: articleId });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al cargar el artículo');
      }

      const article = response.data.find((a: NewsResponse) => a.id === articleId);
      
      if (!article) {
        throw new Error('Artículo no encontrado');
      }

      return { success: true, data: article };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar el artículo';
      setError(message);
      return { success: false, error: message, data: null };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // PUBLICAR ARTÍCULO
  // ============================================================================

  /**
   * Publicar artículo (cambiar status a published)
   */
  const publishArticle = async (articleId: number) => {
    try {
      setLoading(true);
      setError(null);

      const userId = user?.id ? parseInt(user.id, 10) : 0;
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      const response = await newsService.updateArticle(
        {
          id: articleId,
          status: 'published',
          publishedAt: new Date().toISOString(),
        },
        userId
      );

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al publicar el artículo');
      }

      toast.success('Artículo publicado exitosamente');
      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al publicar el artículo';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // ARCHIVAR ARTÍCULO
  // ============================================================================

  /**
   * Archivar artículo (cambiar status a archived)
   */
  const archiveArticle = async (articleId: number) => {
    try {
      setLoading(true);
      setError(null);

      const userId = user?.id ? parseInt(user.id, 10) : 0;
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      const response = await newsService.updateArticle(
        {
          id: articleId,
          status: 'archived',
        },
        userId
      );

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al archivar el artículo');
      }

      toast.success('Artículo archivado exitosamente');
      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al archivar el artículo';
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
    createArticle,
    updateArticle,
    deleteArticle,
    listArticles,
    getArticleById,
    
    // Acciones especiales
    publishArticle,
    archiveArticle,
  };
}
