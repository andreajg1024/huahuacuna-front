import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';
import { 
  Search, Plus, Eye, Edit, Trash2, Copy, Archive,
  Download, Clock, CheckCircle2, FileText, TrendingUp, Home
} from 'lucide-react';
import { useNews, type NewsStatus } from '../../contexts/NewsContext';
import { NewsFormPage } from './NewsFormPage';
import { toast } from 'sonner';

interface AdminNewsManagementProps {
  onNavigate?: (page: string) => void;
}

export const AdminNewsManagement: React.FC<AdminNewsManagementProps> = ({ onNavigate }) => {
  const { articles, categories, deleteArticle, updateArticle } = useNews();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState<'all' | NewsStatus>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);

  // Filter articles
  const filteredArticles = articles.filter(article => {
    const matchesTab = currentTab === 'all' || article.status === currentTab;
    const matchesSearch = !searchQuery || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  // Calculate stats
  const stats = {
    total: articles.length,
    publicado: articles.filter(a => a.status === 'publicado').length,
    borrador: articles.filter(a => a.status === 'borrador').length,
    programado: articles.filter(a => a.status === 'programado').length,
    archivado: articles.filter(a => a.status === 'archivado').length,
    totalViews: articles.reduce((sum, a) => sum + a.views, 0)
  };

  const handleDelete = (id: string) => {
    setArticleToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (articleToDelete) {
      deleteArticle(articleToDelete);
      toast.success('Noticia eliminada');
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
    }
  };

  const handleDuplicate = (id: string) => {
    const article = articles.find(a => a.id === id);
    if (article) {
      // In a real app, would create a copy
      toast.success('Noticia duplicada (funcionalidad pendiente)');
    }
  };

  const handleArchive = (id: string) => {
    updateArticle(id, { status: 'archivado' });
    toast.success('Noticia archivada');
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Título', 'Categoría', 'Estado', 'Fecha Publicación', 'Vistas'].join(','),
      ...filteredArticles.map(a => [
        a.id,
        `"${a.title}"`,
        a.primaryCategory,
        a.status,
        a.publishedAt || '',
        a.views
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `noticias-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast.success('Exportación completada');
  };

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: NewsStatus) => {
    const config = {
      borrador: { label: 'Borrador', className: 'bg-gray-100 text-gray-800' },
      programado: { label: 'Programado', className: 'bg-blue-100 text-blue-800' },
      publicado: { label: 'Publicado', className: 'bg-green-100 text-green-800' },
      archivado: { label: 'Archivado', className: 'bg-gray-100 text-gray-600' }
    };
    const { label, className } = config[status];
    return <Badge className={className}>{label}</Badge>;
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.name === category);
    return cat?.color || '#6B7280';
  };

  if (showForm) {
    return (
      <NewsFormPage 
        articleId={editingId}
        onNavigate={() => {
          setShowForm(false);
          setEditingId(undefined);
        }}
      />
    );
  }

  return (
    <div className="p-6">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <button 
                  onClick={() => onNavigate?.('dashboard')}
                  className="flex items-center gap-1 hover:text-amber-600 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Dashboard
                </button>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Gestión de Noticias</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl mb-2">Gestión de Noticias</h1>
            <p className="text-gray-600">Administra el blog de la fundación</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button 
              className="bg-[#4A9D5F] hover:bg-[#3B7D4D]"
              onClick={() => {
                setEditingId(undefined);
                setShowForm(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Nueva Noticia
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Noticias</p>
                  <p className="text-2xl">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Publicadas</p>
                  <p className="text-2xl">{stats.publicado}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Borradores</p>
                  <p className="text-2xl">{stats.borrador}</p>
                </div>
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Programadas</p>
                  <p className="text-2xl">{stats.programado}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Vistas Totales</p>
                  <p className="text-2xl">{stats.totalViews}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por título o contenido..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as any)}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">
              Todas ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="publicado">
              Publicadas ({stats.publicado})
            </TabsTrigger>
            <TabsTrigger value="borrador">
              Borradores ({stats.borrador})
            </TabsTrigger>
            <TabsTrigger value="programado">
              Programadas ({stats.programado})
            </TabsTrigger>
            <TabsTrigger value="archivado">
              Archivadas ({stats.archivado})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={currentTab}>
            {filteredArticles.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl mb-2">No hay noticias</h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery ? 'No se encontraron resultados' : 'Comienza creando tu primera noticia'}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setShowForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Noticia
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Imagen</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Autor</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha Pub.</TableHead>
                        <TableHead>Vistas</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredArticles.map((article) => (
                        <TableRow key={article.id} className="hover:bg-gray-50">
                          <TableCell>
                            <img 
                              src={article.featuredImage} 
                              alt={article.featuredImageAlt}
                              className="w-20 h-12 object-cover rounded"
                            />
                          </TableCell>
                          
                          <TableCell>
                            <div>
                              <p className="font-medium">{article.title}</p>
                              <p className="text-sm text-gray-600 line-clamp-1">
                                {article.excerpt}
                              </p>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="text-sm">
                              <p>{article.authorName}</p>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge 
                              style={{ 
                                backgroundColor: `${getCategoryColor(article.primaryCategory)}15`,
                                color: getCategoryColor(article.primaryCategory)
                              }}
                            >
                              {article.primaryCategory}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            {getStatusBadge(article.status)}
                            {article.status === 'programado' && article.scheduledFor && (
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDate(article.scheduledFor)}
                              </p>
                            )}
                          </TableCell>

                          <TableCell>
                            <span className="text-sm text-gray-600">
                              {formatDate(article.publishedAt)}
                            </span>
                          </TableCell>

                          <TableCell>
                            <span className="text-sm">{article.views}</span>
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(`/noticias/${article.slug}`, '_blank')}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingId(article.id);
                                  setShowForm(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDuplicate(article.id)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              {article.status !== 'archivado' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleArchive(article.id)}
                                >
                                  <Archive className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(article.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Scheduled Articles Alert */}
        {stats.programado > 0 && (
          <div className="mt-6">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">
                      {stats.programado} noticia{stats.programado !== 1 ? 's' : ''} programada{stats.programado !== 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-blue-700">
                      Se publicarán automáticamente en las fechas programadas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar noticia?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. La noticia será eliminada permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </div>
  );
};

