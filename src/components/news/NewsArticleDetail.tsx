import React, { useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  ArrowLeft, Clock, Eye, Share2, Facebook, 
  Mail, Link as LinkIcon, Calendar, ChevronRight
} from 'lucide-react';
import { useNews } from '../../contexts/NewsContext';
import { toast } from 'sonner';

interface NewsArticleDetailProps {
  slug: string;
  onBack?: () => void;
}

export const NewsArticleDetail: React.FC<NewsArticleDetailProps> = ({ slug, onBack }) => {
  const { getArticleBySlug, incrementViews, getPublishedArticles, categories } = useNews();
  
  const article = getArticleBySlug(slug);

  useEffect(() => {
    if (article) {
      incrementViews(article.id);
    }
  }, [article?.id]);

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl mb-4">Noticia no encontrada</h2>
            <Button onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Blog
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const categoryData = categories.find(c => c.name === article.primaryCategory);
  
  // Get related articles (same category, exclude current)
  const relatedArticles = getPublishedArticles()
    .filter(a => 
      a.id !== article.id && 
      (a.primaryCategory === article.primaryCategory || 
       a.tags.some(tag => article.tags.includes(tag)))
    )
    .slice(0, 3);

  const shareUrl = `https://fundacion-huahuacuna.org/noticias/${article.slug}`;

  const handleShare = (platform: string) => {
    let url = '';
    
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(article.title + ' ' + shareUrl)}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent(shareUrl)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        toast.success('Enlace copiado al portapapeles');
        return;
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Blog
          </Button>
        </div>
      </div>

      <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Article Header */}
        <header className="mb-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Inicio</span>
            <ChevronRight className="w-4 h-4" />
            <span>Noticias</span>
            <ChevronRight className="w-4 h-4" />
            <span>{article.primaryCategory}</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">{article.title}</span>
          </div>

          {/* Category Badge */}
          <Badge 
            className="mb-4"
            style={{ 
              backgroundColor: categoryData?.color,
              color: 'white'
            }}
          >
            {categoryData?.icon} {article.primaryCategory}
          </Badge>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl mb-6 text-gray-900">
            {article.title}
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <Avatar className="w-10 h-10">
                <AvatarImage src={article.authorAvatar} />
                <AvatarFallback>{article.authorName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-gray-900">{article.authorName}</p>
                <p className="text-xs text-gray-500">Autor</p>
              </div>
            </div>
            
            <Separator orientation="vertical" className="h-10" />
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{formatDate(article.publishedAt!)}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{article.readingTime} min de lectura</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span className="text-sm">{article.views} vistas</span>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <span className="text-sm text-gray-600">Compartir:</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleShare('facebook')}
              className="bg-[#1877F2] text-white hover:bg-[#1877F2]/90 border-0"
            >
              <Facebook className="w-4 h-4 mr-1" />
              Facebook
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleShare('whatsapp')}
              className="bg-[#25D366] text-white hover:bg-[#25D366]/90 border-0"
            >
              <Share2 className="w-4 h-4 mr-1" />
              WhatsApp
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleShare('email')}
            >
              <Mail className="w-4 h-4 mr-1" />
              Email
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleShare('copy')}
            >
              <LinkIcon className="w-4 h-4 mr-1" />
              Copiar
            </Button>
          </div>
        </header>

        {/* Featured Image */}
        <div className="mb-8">
          <img 
            src={article.featuredImage} 
            alt={article.featuredImageAlt}
            className="w-full h-auto rounded-lg shadow-lg"
          />
          {article.featuredImageCaption && (
            <p className="text-sm text-gray-600 mt-2 text-center italic">
              {article.featuredImageCaption}
            </p>
          )}
          {article.imageCredits && (
            <p className="text-xs text-gray-500 mt-1 text-center">
              Foto: {article.imageCredits}
            </p>
          )}
        </div>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none mb-12">
          {/* In a real app, this would be rendered HTML from rich text editor */}
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {article.content}
          </div>
        </div>

        {/* Video if exists */}
        {article.videoUrl && (
          <div className="mb-12">
            <div className="aspect-video">
              <iframe
                src={article.videoUrl}
                className="w-full h-full rounded-lg"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="mb-8">
            <p className="text-sm text-gray-600 mb-3">Temas:</p>
            <div className="flex flex-wrap gap-2">
              {article.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-gray-300">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator className="my-8" />

        {/* Author Bio */}
        <div className="bg-gray-100 rounded-lg p-6 mb-12">
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={article.authorAvatar} />
              <AvatarFallback className="text-xl">{article.authorName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl mb-2">Sobre el Autor</h3>
              <p className="font-medium mb-2">{article.authorName}</p>
              <p className="text-gray-600 text-sm">
                {article.authorBio || 'Miembro del equipo de Fundación Huahuacuna dedicado a compartir historias que inspiran y transforman vidas.'}
              </p>
            </div>
          </div>
        </div>

        {/* Share Again */}
        <div className="bg-[#4A9D5F]/10 rounded-lg p-6 mb-12 text-center">
          <p className="text-lg mb-4">¿Te gustó este artículo? Compártelo</p>
          <div className="flex justify-center flex-wrap gap-3">
            <Button 
              size="sm"
              onClick={() => handleShare('facebook')}
              className="bg-[#1877F2] hover:bg-[#1877F2]/90"
            >
              <Facebook className="w-4 h-4 mr-1" />
              Facebook
            </Button>
            <Button 
              size="sm"
              onClick={() => handleShare('whatsapp')}
              className="bg-[#25D366] hover:bg-[#25D366]/90"
            >
              <Share2 className="w-4 h-4 mr-1" />
              WhatsApp
            </Button>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div>
            <h2 className="text-2xl mb-6">Noticias Relacionadas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map(related => (
                <Card 
                  key={related.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => window.location.href = `/noticias/${related.slug}`}
                >
                  <img 
                    src={related.featuredImage} 
                    alt={related.featuredImageAlt}
                    className="w-full h-40 object-cover"
                  />
                  <CardContent className="p-4">
                    <Badge 
                      className="mb-2"
                      style={{ 
                        backgroundColor: categories.find(c => c.name === related.primaryCategory)?.color 
                      }}
                    >
                      {related.primaryCategory}
                    </Badge>
                    <h3 className="text-lg mb-2 line-clamp-2">{related.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{related.excerpt}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDate(related.publishedAt!)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Back to Top */}
      <div className="bg-white border-t">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <Button onClick={onBack} size="lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Blog
          </Button>
        </div>
      </div>
    </div>
  );
};

