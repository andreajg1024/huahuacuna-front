import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Search, Clock, Eye, Tag, ChevronRight, TrendingUp
} from 'lucide-react';
import { useNews, type NewsCategory } from '../../contexts/NewsContext';
import { NewsArticleDetail } from './NewsArticleDetail';

export const PublicNewsPage: React.FC = () => {
  const { getPublishedArticles, getArticlesByCategory, searchArticles, categories, getFeaturedArticles } = useNews();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | 'all'>('all');
  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');

  // Get articles based on filters
  let articles = selectedCategory === 'all' 
    ? getPublishedArticles() 
    : getArticlesByCategory(selectedCategory);

  if (searchQuery) {
    articles = searchArticles(searchQuery);
  }

  if (sortBy === 'popular') {
    articles = [...articles].sort((a, b) => b.views - a.views);
  }

  const featuredArticles = getFeaturedArticles();
  const popularTags = Array.from(
    new Set(getPublishedArticles().flatMap(a => a.tags))
  ).slice(0, 15);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is reactive based on searchQuery state
  };

  if (selectedArticleSlug) {
    return <NewsArticleDetail slug={selectedArticleSlug} onBack={() => setSelectedArticleSlug(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#4A9D5F] to-[#3B7D4D] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-5xl mb-4 text-white">Blog Huahuacuna</h1>
            <p className="text-xl text-white/90 mb-8">
              Mantente informado sobre nuestras actividades e impacto
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Buscar noticias..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg bg-white"
                />
              </div>
            </form>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className={selectedCategory === 'all' ? 'bg-white text-[#4A9D5F]' : 'bg-white/10 text-white hover:bg-white/20'}
            >
              Todas ({getPublishedArticles().length})
            </Button>
            {categories.map(cat => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.name ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat.name)}
                className={selectedCategory === cat.name ? 'bg-white text-[#4A9D5F]' : 'bg-white/10 text-white hover:bg-white/20'}
              >
                {cat.icon} {cat.name} ({cat.articleCount})
              </Button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Articles */}
            {featuredArticles.length > 0 && !searchQuery && selectedCategory === 'all' && (
              <div className="mb-12">
                <h2 className="text-2xl mb-6">Noticias Destacadas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredArticles.map(article => (
                    <Card 
                      key={article.id} 
                      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedArticleSlug(article.slug)}
                    >
                      <div className="relative">
                        <img 
                          src={article.featuredImage} 
                          alt={article.featuredImageAlt}
                          className="w-full h-64 object-cover"
                        />
                        <Badge 
                          className="absolute top-4 left-4"
                          style={{ 
                            backgroundColor: categories.find(c => c.name === article.primaryCategory)?.color 
                          }}
                        >
                          {article.primaryCategory}
                        </Badge>
                        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {article.readingTime} min
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <p className="text-sm text-gray-600 mb-2">
                          {new Date(article.publishedAt!).toLocaleDateString('es-CO', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <h3 className="text-2xl mb-3 line-clamp-2">{article.title}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">{article.excerpt}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Por {article.authorName}</span>
                          </div>
                          <Button variant="ghost" className="text-[#4A9D5F]">
                            Leer Más <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Filters Bar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Mostrando {articles.length} noticia{articles.length !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-2">
                <Button
                  variant={sortBy === 'recent' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('recent')}
                >
                  Más Recientes
                </Button>
                <Button
                  variant={sortBy === 'popular' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('popular')}
                >
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Más Leídos
                </Button>
              </div>
            </div>

            {/* Articles Grid */}
            {articles.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl mb-2">No se encontraron noticias</h3>
                  <p className="text-gray-600">
                    {searchQuery ? 'Intenta con otros términos de búsqueda' : 'Próximamente publicaremos contenido'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles.map(article => {
                  const categoryData = categories.find(c => c.name === article.primaryCategory);
                  
                  return (
                    <Card 
                      key={article.id}
                      className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer"
                      onClick={() => setSelectedArticleSlug(article.slug)}
                    >
                      <div className="relative">
                        <img 
                          src={article.featuredImage} 
                          alt={article.featuredImageAlt}
                          className="w-full h-48 object-cover"
                        />
                        <Badge 
                          className="absolute top-3 left-3"
                          style={{ 
                            backgroundColor: `${categoryData?.color}`,
                            color: 'white'
                          }}
                        >
                          {categoryData?.icon} {article.primaryCategory}
                        </Badge>
                        <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.readingTime} min
                        </div>
                      </div>
                      
                      <CardContent className="p-5">
                        <p className="text-sm text-gray-500 mb-2">
                          {new Date(article.publishedAt!).toLocaleDateString('es-CO', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        
                        <h3 className="text-xl mb-2 line-clamp-2 hover:text-[#4A9D5F] transition-colors">
                          {article.title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {article.excerpt}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {article.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Por {article.authorName}</span>
                          <div className="flex items-center gap-3 text-gray-500">
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {article.views}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Pagination placeholder */}
            {articles.length > 12 && (
              <div className="flex justify-center mt-8 gap-2">
                <Button variant="outline" disabled>Anterior</Button>
                <Button variant="outline">1</Button>
                <Button variant="outline">2</Button>
                <Button variant="outline">3</Button>
                <Button variant="outline">Siguiente</Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Popular Posts */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#4A9D5F]" />
                  Más Leídas
                </h3>
                <div className="space-y-4">
                  {[...getPublishedArticles()]
                    .sort((a, b) => b.views - a.views)
                    .slice(0, 5)
                    .map(article => (
                      <div 
                        key={article.id}
                        className="flex gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                        onClick={() => setSelectedArticleSlug(article.slug)}
                      >
                        <img 
                          src={article.featuredImage} 
                          alt={article.featuredImageAlt}
                          className="w-20 h-16 object-cover rounded flex-shrink-0"
                        />
                        <div>
                          <p className="text-sm line-clamp-2 mb-1">{article.title}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(article.publishedAt!).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Tags Cloud */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-[#4A9D5F]" />
                  Etiquetas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map(tag => (
                    <Badge 
                      key={tag} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-[#4A9D5F] hover:text-white transition-colors"
                      onClick={() => setSearchQuery(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Newsletter */}
            <Card className="bg-gradient-to-br from-[#4A9D5F] to-[#3B7D4D] text-white">
              <CardContent className="p-6">
                <h3 className="text-lg mb-2">Recibe Noticias por Email</h3>
                <p className="text-sm text-white/90 mb-4">
                  Suscríbete para recibir nuestras últimas actualizaciones
                </p>
                <Input 
                  type="email" 
                  placeholder="tu@email.com"
                  className="mb-3 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
                <Button className="w-full bg-white text-[#4A9D5F] hover:bg-white/90">
                  Suscribirme
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

