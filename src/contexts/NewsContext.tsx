import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  addArticle: (article: Omit<NewsArticle, 'id' | 'createdAt' | 'updatedAt' | 'views'>) => string;
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

export const NewsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<NewsCategoryData[]>(defaultCategories);

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

  const addArticle = (articleData: Omit<NewsArticle, 'id' | 'createdAt' | 'updatedAt' | 'views'>) => {
    const id = `NEWS-${Date.now()}`;
    const now = new Date().toISOString();
    
    const newArticle: NewsArticle = {
      ...articleData,
      id,
      createdAt: now,
      updatedAt: now,
      views: 0
    };

    setArticles(prev => [...prev, newArticle]);
    
    // Update category counts
    updateCategoryCounts();
    
    return id;
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
