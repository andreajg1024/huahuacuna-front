/**
 * News Service
 * 
 * Service layer for news/articles management
 */

import { apiClient } from '@/lib/api-client';
import { BaseService } from './base.service';
import {
  CreateNewsDTO,
  UpdateNewsDTO,
  NewsResponse,
  KafkaTopic,
  ApiResponse,
} from '@/types/api.types';

export class NewsService extends BaseService {
  /**
   * Crear artículo
   */
  async createArticle(
    dto: CreateNewsDTO,
    userId: number
  ): Promise<ApiResponse<NewsResponse>> {
    this.validateNewsDTO(dto);
    
    return apiClient.sendToKafka<NewsResponse>(KafkaTopic.NEWS_CREATE, {
      dto,
      userId,
    });
  }

  /**
   * Actualizar artículo
   */
  async updateArticle(
    dto: UpdateNewsDTO,
    userId: number
  ): Promise<ApiResponse<NewsResponse>> {
    this.validateRequired(dto.id, 'id');
    
    return apiClient.sendToKafka<NewsResponse>(KafkaTopic.NEWS_UPDATE, {
      dto,
      userId,
    });
  }

  /**
   * Eliminar artículo
   */
  async deleteArticle(
    articleId: number,
    userId: number
  ): Promise<ApiResponse<void>> {
    this.validateRequired(articleId, 'articleId');
    
    return apiClient.sendToKafka<void>(KafkaTopic.NEWS_DELETE, {
      articleId,
      userId,
    });
  }

  /**
   * Listar artículos
   */
  async listArticles(filters?: any): Promise<ApiResponse<NewsResponse[]>> {
    return apiClient.sendToKafka<NewsResponse[]>(
      KafkaTopic.NEWS_LIST,
      filters || {}
    );
  }

  /**
   * Validar DTO de noticia
   */
  private validateNewsDTO(dto: CreateNewsDTO): void {
    this.validateRequired(dto.title, 'title');
    this.validateLength(dto.title, 'title', 5, 200);
    
    this.validateRequired(dto.excerpt, 'excerpt');
    this.validateLength(dto.excerpt, 'excerpt', 20, 500);
    
    this.validateRequired(dto.content, 'content');
    this.validateRequired(dto.featuredImage, 'featuredImage');
    
    if (!this.isValidUrl(dto.featuredImage)) {
      throw new Error('featuredImage debe ser una URL válida');
    }
    
    this.validateRequired(dto.featuredImageAlt, 'featuredImageAlt');
    this.validateRequired(dto.primaryCategory, 'primaryCategory');
    this.validateRequired(dto.metaDescription, 'metaDescription');
    this.validateLength(dto.metaDescription, 'metaDescription', 20, 300);
    
    const validStatuses = ['draft', 'scheduled', 'published', 'archived'];
    if (!validStatuses.includes(dto.status)) {
      throw new Error(`status debe ser uno de: ${validStatuses.join(', ')}`);
    }
    
    const validVisibilities = ['public', 'private', 'protected'];
    if (!validVisibilities.includes(dto.visibility)) {
      throw new Error(`visibility debe ser uno de: ${validVisibilities.join(', ')}`);
    }
    
    if (dto.status === 'scheduled' && !dto.scheduledFor) {
      throw new Error('scheduledFor es requerido cuando status es "scheduled"');
    }
    
    if (dto.scheduledFor && !this.isValidISODate(dto.scheduledFor)) {
      throw new Error('scheduledFor debe estar en formato ISO 8601');
    }
  }

  /**
   * Convertir artículo local a API format
   */
  convertArticleToApiFormat(localArticle: any): CreateNewsDTO {
    return {
      title: localArticle.title,
      excerpt: localArticle.excerpt,
      content: localArticle.content,
      featuredImage: localArticle.featuredImage,
      featuredImageAlt: localArticle.featuredImageAlt,
      primaryCategory: localArticle.primaryCategory,
      additionalCategories: localArticle.additionalCategories,
      tags: localArticle.tags || [],
      metaDescription: localArticle.metaDescription,
      status: this.mapNewsStatus(localArticle.status),
      publishedAt: localArticle.publishedAt,
      scheduledFor: localArticle.scheduledFor,
      visibility: this.mapVisibility(localArticle.visibility),
      isFeatured: localArticle.isFeatured || false,
      allowComments: localArticle.allowComments !== false,
    };
  }

  /**
   * Convertir artículo API a local format
   */
  convertArticleFromApiFormat(apiArticle: NewsResponse): any {
    return {
      id: String(apiArticle.id),
      slug: apiArticle.slug,
      title: apiArticle.title,
      excerpt: apiArticle.excerpt,
      content: apiArticle.content,
      featuredImage: apiArticle.featuredImage,
      featuredImageAlt: apiArticle.featuredImageAlt,
      featuredImageCaption: undefined,
      galleryImages: [],
      primaryCategory: apiArticle.primaryCategory,
      additionalCategories: apiArticle.additionalCategories,
      tags: apiArticle.tags,
      metaDescription: apiArticle.metaDescription,
      metaKeywords: [],
      authorId: String(apiArticle.authorId),
      authorName: apiArticle.authorName,
      status: this.mapNewsStatusFromApi(apiArticle.status),
      publishedAt: apiArticle.publishedAt,
      scheduledFor: apiArticle.scheduledFor,
      visibility: this.mapVisibilityFromApi(apiArticle.visibility),
      isFeatured: apiArticle.isFeatured,
      allowComments: apiArticle.allowComments,
      views: apiArticle.views,
      createdAt: apiArticle.createdAt,
      updatedAt: apiArticle.updatedAt,
      createdBy: String(apiArticle.authorId),
      readingTime: Math.ceil(apiArticle.content.split(' ').length / 200),
      showToc: false,
      showUpdatedDate: true,
    };
  }

  private mapNewsStatus(status: string): 'draft' | 'scheduled' | 'published' | 'archived' {
    const mapping: Record<string, any> = {
      'borrador': 'draft',
      'programado': 'scheduled',
      'publicado': 'published',
      'archivado': 'archived',
    };
    return mapping[status] || 'draft';
  }

  private mapNewsStatusFromApi(status: string): string {
    const mapping: Record<string, string> = {
      'draft': 'borrador',
      'scheduled': 'programado',
      'published': 'publicado',
      'archived': 'archivado',
    };
    return mapping[status] || 'borrador';
  }

  private mapVisibility(visibility: string): 'public' | 'private' | 'protected' {
    const mapping: Record<string, any> = {
      'publico': 'public',
      'privado': 'private',
      'protegido': 'protected',
    };
    return mapping[visibility] || 'public';
  }

  private mapVisibilityFromApi(visibility: string): string {
    const mapping: Record<string, string> = {
      'public': 'publico',
      'private': 'privado',
      'protected': 'protegido',
    };
    return mapping[visibility] || 'publico';
  }
}

export const newsService = new NewsService();
export default NewsService;
