import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  Save, Eye, X, Upload, Image as ImageIcon, Video, 
  Clock, CheckCircle2, AlertCircle, ExternalLink, Calendar
} from 'lucide-react';
import { useNews, type NewsCategory, type NewsStatus, type NewsVisibility } from '../../contexts/NewsContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

interface NewsFormPageProps {
  articleId?: string;
  onNavigate?: (page: string) => void;
}

const CATEGORIES: NewsCategory[] = ['Eventos', 'Logros', 'Testimonios', 'Anuncios', 'General'];

export const NewsFormPage: React.FC<NewsFormPageProps> = ({ articleId, onNavigate }) => {
  const { user } = useAuth();
  const { addArticle, updateArticle, getArticleById, generateSlug, calculateReadingTime } = useNews();
  
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    // Basic Info
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    
    // Media
    featuredImage: '',
    featuredImageAlt: '',
    featuredImageCaption: '',
    videoUrl: '',
    
    // Categorization (RF-032)
    primaryCategory: 'General' as NewsCategory,
    additionalCategories: [] as NewsCategory[],
    tags: [] as string[],
    tagInput: '',
    
    // SEO (RF-030)
    metaDescription: '',
    metaKeywords: [] as string[],
    canonicalUrl: '',
    
    // Social
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    
    // Author
    source: '',
    imageCredits: '',
    
    // Publishing (RF-030)
    status: 'borrador' as NewsStatus,
    publishedAt: '',
    scheduledFor: '',
    visibility: 'publico' as NewsVisibility,
    
    // Features
    isFeatured: false,
    allowComments: false,
    sendNotification: false,
    showToc: false,
    showUpdatedDate: true
  });

  // Load existing article if editing
  useEffect(() => {
    if (articleId) {
      const article = getArticleById(articleId);
      if (article) {
        setFormData({
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          content: article.content,
          featuredImage: article.featuredImage,
          featuredImageAlt: article.featuredImageAlt,
          featuredImageCaption: article.featuredImageCaption || '',
          videoUrl: article.videoUrl || '',
          primaryCategory: article.primaryCategory,
          additionalCategories: article.additionalCategories || [],
          tags: article.tags,
          tagInput: '',
          metaDescription: article.metaDescription,
          metaKeywords: article.metaKeywords || [],
          canonicalUrl: article.canonicalUrl || '',
          ogTitle: article.ogTitle || '',
          ogDescription: article.ogDescription || '',
          ogImage: article.ogImage || '',
          source: article.source || '',
          imageCredits: article.imageCredits || '',
          status: article.status,
          publishedAt: article.publishedAt || '',
          scheduledFor: article.scheduledFor || '',
          visibility: article.visibility,
          isFeatured: article.isFeatured,
          allowComments: article.allowComments,
          sendNotification: article.sendNotification,
          showToc: article.showToc,
          showUpdatedDate: article.showUpdatedDate
        });
      }
    }
  }, [articleId, getArticleById]);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !articleId) {
      const newSlug = generateSlug(formData.title);
      setFormData(prev => ({ ...prev, slug: newSlug }));
    }
  }, [formData.title, articleId, generateSlug]);

  // Auto-save
  useEffect(() => {
    if (hasUnsavedChanges) {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }
      
      autoSaveTimeout.current = setTimeout(() => {
        handleSave(true);
      }, 30000); // Auto-save every 30 seconds
    }

    return () => {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }
    };
  }, [hasUnsavedChanges, formData]);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe exceder 5MB');
      return;
    }

    // Simulate upload - in real app would upload to cloud storage
    const fakeUrl = URL.createObjectURL(file);
    updateField('featuredImage', fakeUrl);
    toast.success('Imagen cargada exitosamente');
  };

  const handleAddTag = () => {
    const tag = formData.tagInput.trim();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 8) {
      updateField('tags', [...formData.tags, tag]);
      updateField('tagInput', '');
    } else if (formData.tags.length >= 8) {
      toast.error('Máximo 8 etiquetas');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateField('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const toggleAdditionalCategory = (category: NewsCategory) => {
    if (formData.additionalCategories.includes(category)) {
      updateField('additionalCategories', formData.additionalCategories.filter(c => c !== category));
    } else if (formData.additionalCategories.length < 2) {
      updateField('additionalCategories', [...formData.additionalCategories, category]);
    } else {
      toast.error('Máximo 2 categorías adicionales');
    }
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast.error('El título es requerido');
      return false;
    }
    if (!formData.excerpt.trim()) {
      toast.error('El resumen es requerido');
      return false;
    }
    if (!formData.content.trim()) {
      toast.error('El contenido es requerido');
      return false;
    }
    if (!formData.featuredImage) {
      toast.error('La imagen destacada es requerida');
      return false;
    }
    if (!formData.featuredImageAlt.trim()) {
      toast.error('El texto alternativo de la imagen es requerido');
      return false;
    }
    if (!formData.metaDescription.trim()) {
      toast.error('La meta descripción es requerida');
      return false;
    }
    return true;
  };

  const handleSave = async (isAutoSave = false) => {
    if (!validateForm() && !isAutoSave) return;

    setIsSaving(true);

    try {
      const readingTime = calculateReadingTime(formData.content);
      
      const articleData = {
        slug: formData.slug,
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        featuredImage: formData.featuredImage,
        featuredImageAlt: formData.featuredImageAlt,
        featuredImageCaption: formData.featuredImageCaption,
        videoUrl: formData.videoUrl,
        primaryCategory: formData.primaryCategory,
        additionalCategories: formData.additionalCategories,
        tags: formData.tags,
        metaDescription: formData.metaDescription,
        metaKeywords: formData.metaKeywords,
        canonicalUrl: formData.canonicalUrl,
        ogTitle: formData.ogTitle || formData.title,
        ogDescription: formData.ogDescription || formData.metaDescription,
        ogImage: formData.ogImage || formData.featuredImage,
        authorId: user?.id || '',
        authorName: user?.nombre || '',
        authorAvatar: (user as any)?.avatar,
        source: formData.source,
        imageCredits: formData.imageCredits,
        status: formData.status,
        publishedAt: formData.status === 'publicado' ? (formData.publishedAt || new Date().toISOString()) : undefined,
        scheduledFor: formData.scheduledFor,
        visibility: formData.visibility,
        isFeatured: formData.isFeatured,
        allowComments: formData.allowComments,
        sendNotification: formData.sendNotification,
        readingTime,
        showToc: formData.showToc,
        showUpdatedDate: formData.showUpdatedDate,
        createdBy: user?.id || ''
      };

      if (articleId) {
        updateArticle(articleId, articleData);
        if (!isAutoSave) toast.success('Noticia actualizada');
      } else {
        const newId = addArticle(articleData);
        if (!isAutoSave) {
          toast.success('Noticia creada');
          if (onNavigate) onNavigate('news-management');
        }
      }

      setLastSaved(new Date());
      setHasUnsavedChanges(false);

    } catch (error) {
      if (!isAutoSave) toast.error('Error al guardar la noticia');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = () => {
    if (!validateForm()) return;
    
    updateField('status', 'publicado');
    setTimeout(() => handleSave(), 100);
  };

  const handleSchedule = () => {
    if (!formData.scheduledFor) {
      toast.error('Selecciona una fecha y hora');
      return;
    }

    if (new Date(formData.scheduledFor) <= new Date()) {
      toast.error('La fecha debe ser en el futuro');
      return;
    }

    updateField('status', 'programado');
    setTimeout(() => handleSave(), 100);
  };

  const getMetaDescriptionQuality = () => {
    const length = formData.metaDescription.length;
    if (length >= 120 && length <= 160) return { color: 'text-green-600', label: 'Óptimo' };
    if ((length >= 100 && length < 120) || (length > 160 && length <= 180)) return { color: 'text-yellow-600', label: 'Aceptable' };
    return { color: 'text-red-600', label: 'No óptimo' };
  };

  const metaQuality = getMetaDescriptionQuality();

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl mb-2">
              {articleId ? 'Editar Noticia' : 'Crear Noticia'}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 animate-spin" />
                  Guardando...
                </span>
              ) : lastSaved ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Guardado hace {Math.floor((Date.now() - lastSaved.getTime()) / 60000)} min
                </span>
              ) : hasUnsavedChanges ? (
                <span className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  Sin guardar
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.open(`/noticias/${formData.slug}`, '_blank')}>
              <Eye className="w-4 h-4 mr-2" />
              Vista Previa
            </Button>
            <Button variant="outline" onClick={() => handleSave()}>
              <Save className="w-4 h-4 mr-2" />
              Guardar Borrador
            </Button>
            <Button className="bg-[#4A9D5F] hover:bg-[#3B7D4D]" onClick={handlePublish}>
              Publicar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Información Básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="Ej: ¡150 Niños Graduaron de Nuestro Programa de Lectura!"
                    maxLength={100}
                  />
                  <p className="text-sm text-gray-500 mt-1">{formData.title.length}/100</p>
                </div>

                <div>
                  <Label htmlFor="slug">Slug (URL) *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => updateField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                      placeholder="titulo-de-la-noticia"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    fundacion.com/noticias/{formData.slug}
                  </p>
                </div>

                <div>
                  <Label htmlFor="excerpt">Resumen/Extracto *</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => updateField('excerpt', e.target.value)}
                    placeholder="Resumen breve que aparecerá en las tarjetas de noticias"
                    rows={3}
                    maxLength={200}
                  />
                  <p className="text-sm text-gray-500 mt-1">{formData.excerpt.length}/200</p>
                </div>

                <div>
                  <Label htmlFor="content">Contenido * (Editor de Texto Enriquecido)</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => updateField('content', e.target.value)}
                    placeholder="Escribe el contenido de la noticia aquí. En una implementación real, esto sería un editor WYSIWYG completo con formato, imágenes, y más..."
                    rows={15}
                    maxLength={20000}
                    className="font-mono text-sm"
                  />
                  <div className="flex justify-between mt-1 text-sm text-gray-500">
                    <span>{formData.content.length}/20,000 caracteres</span>
                    <span>~{calculateReadingTime(formData.content)} min de lectura</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 En producción, aquí iría un editor WYSIWYG como TinyMCE o Quill con formato completo
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Media */}
            <Card>
              <CardHeader>
                <CardTitle>Multimedia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Imagen Destacada *</Label>
                  {!formData.featuredImage ? (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 text-gray-400 mb-3" />
                        <p className="text-sm text-gray-600">Click para subir imagen</p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP (máx. 5MB)</p>
                        <p className="text-xs text-gray-500">Recomendado: 1200x630px</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  ) : (
                    <div className="relative">
                      <img 
                        src={formData.featuredImage} 
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => updateField('featuredImage', '')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {formData.featuredImage && (
                  <>
                    <div>
                      <Label htmlFor="featuredImageAlt">Texto Alternativo (Alt) *</Label>
                      <Input
                        id="featuredImageAlt"
                        value={formData.featuredImageAlt}
                        onChange={(e) => updateField('featuredImageAlt', e.target.value)}
                        placeholder="Describe la imagen para SEO y accesibilidad"
                        maxLength={125}
                      />
                      <p className="text-sm text-gray-500 mt-1">{formData.featuredImageAlt.length}/125</p>
                    </div>

                    <div>
                      <Label htmlFor="featuredImageCaption">Pie de Imagen (opcional)</Label>
                      <Input
                        id="featuredImageCaption"
                        value={formData.featuredImageCaption}
                        onChange={(e) => updateField('featuredImageCaption', e.target.value)}
                        placeholder="Texto que aparecerá debajo de la imagen"
                        maxLength={150}
                      />
                    </div>

                    <div>
                      <Label htmlFor="imageCredits">Créditos de Imagen (opcional)</Label>
                      <Input
                        id="imageCredits"
                        value={formData.imageCredits}
                        onChange={(e) => updateField('imageCredits', e.target.value)}
                        placeholder="Fotógrafo o fuente de la imagen"
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="videoUrl">Video (URL de YouTube/Vimeo)</Label>
                  <Input
                    id="videoUrl"
                    value={formData.videoUrl}
                    onChange={(e) => updateField('videoUrl', e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* SEO */}
            <Card>
              <CardHeader>
                <CardTitle>SEO y Meta Datos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="metaDescription">Meta Descripción *</Label>
                  <Textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) => updateField('metaDescription', e.target.value)}
                    placeholder="Descripción que aparecerá en Google"
                    rows={3}
                    maxLength={180}
                  />
                  <div className="flex justify-between mt-1 text-sm">
                    <span className={metaQuality.color}>
                      {formData.metaDescription.length}/160 - {metaQuality.label}
                    </span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="canonicalUrl">URL Canónica (opcional)</Label>
                  <Input
                    id="canonicalUrl"
                    value={formData.canonicalUrl}
                    onChange={(e) => updateField('canonicalUrl', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publishing */}
            <Card>
              <CardHeader>
                <CardTitle>Publicación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Estado</Label>
                  <Select value={formData.status} onValueChange={(v) => updateField('status', v as NewsStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="borrador">📝 Borrador</SelectItem>
                      <SelectItem value="programado">⏰ Programado</SelectItem>
                      <SelectItem value="publicado">✅ Publicado</SelectItem>
                      <SelectItem value="archivado">📦 Archivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="scheduledFor">Programar Publicación</Label>
                  <Input
                    id="scheduledFor"
                    type="datetime-local"
                    value={formData.scheduledFor}
                    onChange={(e) => updateField('scheduledFor', e.target.value)}
                  />
                  {formData.scheduledFor && (
                    <Button 
                      className="w-full mt-2" 
                      variant="outline"
                      onClick={handleSchedule}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Programar
                    </Button>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isFeatured">Destacar en Inicio</Label>
                    <Switch
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onCheckedChange={(checked) => updateField('isFeatured', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="sendNotification">Enviar Notificación</Label>
                    <Switch
                      id="sendNotification"
                      checked={formData.sendNotification}
                      onCheckedChange={(checked) => updateField('sendNotification', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Categorización</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="primaryCategory">Categoría Principal *</Label>
                  <Select value={formData.primaryCategory} onValueChange={(v) => updateField('primaryCategory', v as NewsCategory)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Categorías Adicionales (máx. 2)</Label>
                  <div className="space-y-2 mt-2">
                    {CATEGORIES.filter(c => c !== formData.primaryCategory).map(cat => (
                      <div key={cat} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`cat-${cat}`}
                          checked={formData.additionalCategories.includes(cat)}
                          onChange={() => toggleAdditionalCategory(cat)}
                          className="rounded"
                        />
                        <Label htmlFor={`cat-${cat}`} className="cursor-pointer">{cat}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="tagInput">Etiquetas (máx. 8)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tagInput"
                      value={formData.tagInput}
                      onChange={(e) => updateField('tagInput', e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="Agregar etiqueta"
                    />
                    <Button type="button" variant="outline" onClick={handleAddTag}>
                      Agregar
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                        {tag} <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

