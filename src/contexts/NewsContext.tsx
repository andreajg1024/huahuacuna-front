import React, { createContext, useContext, useState, ReactNode } from 'react';
import { NewsService } from '@/services/news.service';
import { CreateNewsDTO, NewsResponse } from '@/types/api.types';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

const newsService = new NewsService();

// Types
export type NewsStatus = 'borrador' | 'programado' | 'publicado' | 'archivado';
export type NewsVisibility = 'publico' | 'privado' | 'protegido';
export type NewsCategory = 'Eventos' | 'Logros' | 'Testimonios' | 'Anuncios' | 'General';

export interface NewsArticle {
  id: string;
  slug: string;
  
  // Content
  title: string;
  excerpt: string;
  content: string;
  
  // Media
  featuredImage: string;
  featuredImageAlt: string;
  featuredImageCaption?: string;
  galleryImages?: string[];
  videoUrl?: string;
  
  // Categorization (RF-032)
  primaryCategory: NewsCategory;
  additionalCategories?: NewsCategory[];
  tags: string[];
  
  // SEO (RF-030)
  metaDescription: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
  
  // Social
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  
  // Author
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorBio?: string;
  coAuthors?: string[];
  source?: string;
  imageCredits?: string;
  
  // Publishing (RF-030)
  status: NewsStatus;
  publishedAt?: string;
  scheduledFor?: string;
  visibility: NewsVisibility;
  password?: string;
  
  // Features
  isFeatured: boolean;
  allowComments: boolean;
  sendNotification: boolean;
  
  // Advanced
  readingTime: number;
  showToc: boolean;
  showUpdatedDate: boolean;
  
  // Meta
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  
  // Analytics
  views: number;
  lastViewedAt?: string;
}

export interface NewsCategoryData {
  id: string;
  name: NewsCategory;
  slug: string;
  description?: string;
  color: string;
  icon: string;
  displayOrder: number;
  articleCount: number;
}

interface NewsContextType {
  articles: NewsArticle[];
  categories: NewsCategoryData[];
  addArticle: (article: CreateNewsDTO) => Promise<string>;
  updateArticle: (id: string, updates: Partial<NewsArticle>) => void;
  deleteArticle: (id: string) => void;
  getArticleById: (id: string) => NewsArticle | undefined;
  getArticleBySlug: (slug: string) => NewsArticle | undefined;
  getPublishedArticles: () => NewsArticle[];
  getArticlesByCategory: (category: NewsCategory) => NewsArticle[];
  getArticlesByTag: (tag: string) => NewsArticle[];
  getFeaturedArticles: () => NewsArticle[];
  searchArticles: (query: string) => NewsArticle[];
  incrementViews: (id: string) => void;
  generateSlug: (title: string) => string;
  calculateReadingTime: (content: string) => number;
  publishScheduledArticles: () => void;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

// Default categories (RF-032)
const defaultCategories: NewsCategoryData[] = [
  {
    id: '1',
    name: 'Eventos',
    slug: 'eventos',
    description: 'Recaps y destacados de eventos',
    color: '#8B5CF6',
    icon: '📅',
    displayOrder: 1,
    articleCount: 0
  },
  {
    id: '2',
    name: 'Logros',
    slug: 'logros',
    description: 'Hitos y historias de éxito',
    color: '#10B981',
    icon: '🏆',
    displayOrder: 2,
    articleCount: 0
  },
  {
    id: '3',
    name: 'Testimonios',
    slug: 'testimonios',
    description: 'Historias de beneficiarios, voluntarios y padrinos',
    color: '#F59E0B',
    icon: '💬',
    displayOrder: 3,
    articleCount: 0
  },
  {
    id: '4',
    name: 'Anuncios',
    slug: 'anuncios',
    description: 'Actualizaciones y noticias importantes',
    color: '#EF4444',
    icon: '📢',
    displayOrder: 4,
    articleCount: 0
  },
  {
    id: '5',
    name: 'General',
    slug: 'general',
    description: 'Contenido general relacionado con la fundación',
    color: '#6B7280',
    icon: '📰',
    displayOrder: 5,
    articleCount: 0
  }
];

// NewsProvider implementa un pequeño CMS de noticias/blog en memoria:
// - articles: listado de artículos con SEO, categorías, visibilidad y métricas básicas.
// - categories: metadatos de categorías (color, icono, orden, conteo).
// Exponer helpers para crear/editar/publicar artículos, generar slugs, calcular tiempo de lectura y filtrar por categoría/tag.
export const NewsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<NewsCategoryData[]>(defaultCategories);
  const { user } = useAuth();

  // ========== MAPPERS ==========
  
  /**
   * Mapear NewsResponse del backend a NewsArticle del frontend
   */
  const mapNewsResponseToArticle = (response: NewsResponse): NewsArticle => {
    return {
      id: response.id.toString(),
      slug: response.slug,
      title: response.title,
      excerpt: response.excerpt,
      content: response.content,
      featuredImage: response.featuredImage,
      featuredImageAlt: response.featuredImageAlt,
      featuredImageCaption: undefined,
      galleryImages: [],
      videoUrl: undefined,
      primaryCategory: response.primaryCategory as NewsCategory,
      additionalCategories: response.additionalCategories as NewsCategory[] | undefined,
      tags: response.tags,
      metaDescription: response.metaDescription,
      metaKeywords: undefined,
      canonicalUrl: undefined,
      ogTitle: undefined,
      ogDescription: undefined,
      ogImage: undefined,
      authorId: response.authorId.toString(),
      authorName: response.authorName,
      authorAvatar: undefined,
      authorBio: undefined,
      coAuthors: undefined,
      source: undefined,
      imageCredits: undefined,
      status: mapStatusFromBackend(response.status),
      publishedAt: response.publishedAt,
      scheduledFor: response.scheduledFor,
      visibility: mapVisibilityFromBackend(response.visibility),
      password: undefined,
      isFeatured: response.isFeatured,
      allowComments: response.allowComments,
      sendNotification: false,
      readingTime: calculateReadingTime(response.content),
      showToc: false,
      showUpdatedDate: false,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
      createdBy: response.authorId.toString(),
      views: response.views,
      lastViewedAt: undefined,
    };
  };

  const mapStatusFromBackend = (status: string): NewsStatus => {
    const statusMap: Record<string, NewsStatus> = {
      'draft': 'borrador',
      'scheduled': 'programado',
      'published': 'publicado',
      'archived': 'archivado',
    };
    return statusMap[status] || 'borrador';
  };

  const mapVisibilityFromBackend = (visibility: string): NewsVisibility => {
    const visibilityMap: Record<string, NewsVisibility> = {
      'public': 'publico',
      'private': 'privado',
      'protected': 'protegido',
    };
    return visibilityMap[visibility] || 'publico';
  };

  const generateSlug = (title: string): string => {
    let slug = title
      .toLowerCase()
      .trim()
      // Replace accented characters
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      // Replace spaces with hyphens
      .replace(/\s+/g, '-')
      // Remove special characters
      .replace(/[^\w\-]+/g, '')
      // Remove multiple hyphens
      .replace(/\-\-+/g, '-')
      // Remove leading/trailing hyphens
      .replace(/^-+/, '')
      .replace(/-+$/, '');

    // Ensure uniqueness
    let finalSlug = slug;
    let counter = 1;
    while (articles.some(a => a.slug === finalSlug)) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    return finalSlug;
  };

  const calculateReadingTime = (content: string): number => {
    // Remove HTML tags
    const text = content.replace(/<[^>]*>/g, '');
    const words = text.trim().split(/\s+/).length;
    const wordsPerMinute = 200; // Average reading speed
    return Math.ceil(words / wordsPerMinute);
  };

  const addArticle = async (dto: CreateNewsDTO): Promise<string> => {
    try {
      console.log('[NewsContext] addArticle - DTO recibido:', dto);
      console.log('[NewsContext] Tamaño del payload:', JSON.stringify({ dto, userId: user?.id || 0 }).length, 'bytes');

      // Llamar al servicio de la API
      const response = await newsService.createArticle(dto, user?.id || 0);
      
      if (!response.success || !response.data) {
        console.error('[NewsContext] addArticle - Error de API:', response.error);
        throw new Error(response.error?.message || 'Error al crear el artículo');
      }

      console.log('[NewsContext] addArticle - Respuesta de API:', response.data);

      // Convertir respuesta de la API al formato local
      const newArticle = mapNewsResponseToArticle(response.data);
      
      // Actualizar estado local
      setArticles((prev) => [...prev, newArticle]);
      
      // Update category counts
      updateCategoryCounts();
      
      toast.success('Artículo creado exitosamente');
      return newArticle.id;
    } catch (error) {
      console.error('[NewsContext] addArticle - Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al crear el artículo');
      
      // Fallback a mock para desarrollo
      const id = `NEWS-${Date.now()}`;
      const now = new Date().toISOString();
      
      const newArticle: NewsArticle = {
        id,
        slug: generateSlug(dto.title),
        title: dto.title,
        excerpt: dto.excerpt,
        content: dto.content,
        featuredImage: dto.featuredImage,
        featuredImageAlt: dto.featuredImageAlt,
        primaryCategory: dto.primaryCategory as NewsCategory,
        additionalCategories: dto.additionalCategories as NewsCategory[],
        tags: dto.tags,
        metaDescription: dto.metaDescription,
        authorId: user?.id?.toString() || '0',
        authorName: user?.name || 'Usuario',
        status: mapStatusFromBackend(dto.status),
        publishedAt: dto.publishedAt,
        scheduledFor: dto.scheduledFor,
        visibility: mapVisibilityFromBackend(dto.visibility),
        isFeatured: dto.isFeatured,
        allowComments: dto.allowComments,
        sendNotification: false,
        readingTime: calculateReadingTime(dto.content),
        showToc: false,
        showUpdatedDate: false,
        createdAt: now,
        updatedAt: now,
        createdBy: user?.id?.toString() || '0',
        views: 0,
      };

      setArticles(prev => [...prev, newArticle]);
      updateCategoryCounts();
      return id;
    }
  };

  const updateArticle = (id: string, updates: Partial<NewsArticle>) => {
    setArticles(prev => prev.map(article => 
      article.id === id 
        ? { ...article, ...updates, updatedAt: new Date().toISOString() }
        : article
    ));
    
    // Update category counts
    updateCategoryCounts();
  };

  const deleteArticle = (id: string) => {
    setArticles(prev => prev.filter(article => article.id !== id));
    updateCategoryCounts();
  };

  const getArticleById = (id: string) => {
    return articles.find(article => article.id === id);
  };

  const getArticleBySlug = (slug: string) => {
    return articles.find(article => article.slug === slug);
  };

  const getPublishedArticles = () => {
    const now = new Date();
    return articles
      .filter(article => 
        article.status === 'publicado' && 
        article.visibility === 'publico' &&
        article.publishedAt &&
        new Date(article.publishedAt) <= now
      )
      .sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime());
  };

  const getArticlesByCategory = (category: NewsCategory) => {
    return getPublishedArticles().filter(article => 
      article.primaryCategory === category || 
      article.additionalCategories?.includes(category)
    );
  };

  const getArticlesByTag = (tag: string) => {
    return getPublishedArticles().filter(article => 
      article.tags.some(t => t.toLowerCase() === tag.toLowerCase())
    );
  };

  const getFeaturedArticles = () => {
    return getPublishedArticles()
      .filter(article => article.isFeatured)
      .slice(0, 3);
  };

  const searchArticles = (query: string) => {
    const searchTerm = query.toLowerCase();
    return getPublishedArticles().filter(article =>
      article.title.toLowerCase().includes(searchTerm) ||
      article.excerpt.toLowerCase().includes(searchTerm) ||
      article.content.toLowerCase().includes(searchTerm) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  };

  const incrementViews = (id: string) => {
    setArticles(prev => prev.map(article =>
      article.id === id
        ? { 
            ...article, 
            views: article.views + 1,
            lastViewedAt: new Date().toISOString()
          }
        : article
    ));
  };

  const publishScheduledArticles = () => {
    const now = new Date();
    setArticles(prev => prev.map(article => {
      if (
        article.status === 'programado' &&
        article.scheduledFor &&
        new Date(article.scheduledFor) <= now
      ) {
        return {
          ...article,
          status: 'publicado' as NewsStatus,
          publishedAt: article.scheduledFor,
          updatedAt: new Date().toISOString()
        };
      }
      return article;
    }));
  };

  const updateCategoryCounts = () => {
    setCategories(prev => prev.map(cat => ({
      ...cat,
      articleCount: articles.filter(a => 
        a.status === 'publicado' && 
        (a.primaryCategory === cat.name || a.additionalCategories?.includes(cat.name))
      ).length
    })));
  };

  const value: NewsContextType = {
    articles,
    categories,
    addArticle,
    updateArticle,
    deleteArticle,
    getArticleById,
    getArticleBySlug,
    getPublishedArticles,
    getArticlesByCategory,
    getArticlesByTag,
    getFeaturedArticles,
    searchArticles,
    incrementViews,
    generateSlug,
    calculateReadingTime,
    publishScheduledArticles
  };

  return (
    <NewsContext.Provider value={value}>
      {children}
    </NewsContext.Provider>
  );
};

export const useNews = () => {
  const context = useContext(NewsContext);
  if (context === undefined) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
};

