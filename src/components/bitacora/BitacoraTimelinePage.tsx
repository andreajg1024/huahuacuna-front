import { useState, useMemo } from 'react';
import {
  Calendar,
  Filter,
  Download,
  Plus,
  FileImage,
  FileVideo,
  Edit,
  Trash2,
  X,
  Play,
  Tag,
  User,
  Clock,
  Grid3x3,
  List,
  CalendarDays
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import { useBitacora } from '../../contexts/BitacoraContext';
import { useAuth } from '../../contexts/AuthContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { MultimediaUploadModal } from './MultimediaUploadModal';
import { MediaLightbox } from './MediaLightbox';
import { PDFGenerationModal } from './PDFGenerationModal';
import { EditEntryModal } from './EditEntryModal';
import { DeleteEntryModal } from './DeleteEntryModal';
import { toast } from 'sonner';

type ViewMode = 'timeline' | 'gallery' | 'list';

interface BitacoraTimelinePageProps {
  childId?: string;
}

// BitacoraTimelinePage muestra la línea de tiempo multimedia de un niño:
// - Trae niño, entradas y estadísticas desde BitacoraContext.
// - Permite filtrar por fechas, tipo, categoría y cambiar entre vistas (timeline, galería, lista).
// - Admin puede agregar/editar/eliminar entradas y generar PDF; padrino solo ve contenido público.
export function BitacoraTimelinePage({ childId }: BitacoraTimelinePageProps) {
  const { user } = useAuth();
  const { getChildById, getChildEntries, getChildStats } = useBitacora();

  // If no childId is provided, try to get the first sponsored child for padrino users
  const effectiveChildId = childId || (user?.role === 'padrino' ? (user as any)?.apadrinados?.[0] : undefined);

  const child = effectiveChildId ? getChildById(effectiveChildId) : null;
  const allEntries = effectiveChildId ? getChildEntries(effectiveChildId) : [];
  const stats = effectiveChildId ? getChildStats(effectiveChildId) : {
    totalEntradas: 0,
    totalFotos: 0,
    totalVideos: 0,
    mesesDocumentados: 0,
    ultimaActualizacion: '',
  } as any;

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    dateFrom: '',
    dateTo: '',
    types: { foto: true, video: true },
    categoria: 'all',
  });

  // Filter entries
  const filteredEntries = useMemo(() => {
    return allEntries.filter((entry) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesDescription = entry.descripcion.toLowerCase().includes(searchLower);
        const matchesTags = entry.etiquetas.some((tag) =>
          tag.toLowerCase().includes(searchLower)
        );
        if (!matchesDescription && !matchesTags) return false;
      }

      // Date filters
      if (filters.dateFrom && new Date(entry.fechaActividad) < new Date(filters.dateFrom)) {
        return false;
      }
      if (filters.dateTo && new Date(entry.fechaActividad) > new Date(filters.dateTo)) {
        return false;
      }

      // Type filters
      if (!filters.types[entry.tipo]) return false;

      // Category filter
      if (filters.categoria !== 'all' && entry.categoria !== filters.categoria) {
        return false;
      }

      // Visibility filter (padrinos only see public)
      if (!isAdmin && entry.visibilidad === 'interno') return false;

      return true;
    });
  }, [allEntries, filters, isAdmin]);

  // Group entries by year and month
  const groupedEntries = useMemo(() => {
    const groups: { [year: string]: { [month: string]: typeof filteredEntries } } = {};

    filteredEntries.forEach((entry) => {
      const date = new Date(entry.fechaActividad);
      const year = date.getFullYear().toString();
      const month = date.toLocaleString('es-ES', { month: 'long' });

      if (!groups[year]) groups[year] = {};
      if (!groups[year][month]) groups[year][month] = [];
      groups[year][month].push(entry);
    });

    return groups;
  }, [filteredEntries]);

  const activeFiltersCount =
    (filters.search ? 1 : 0) +
    (filters.dateFrom || filters.dateTo ? 1 : 0) +
    (!filters.types.foto || !filters.types.video ? 1 : 0) +
    (filters.categoria !== 'all' ? 1 : 0);

  const clearFilters = () => {
    setFilters({
      search: '',
      dateFrom: '',
      dateTo: '',
      types: { foto: true, video: true },
      categoria: 'all',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Hoy';
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`;
    if (diffInDays < 365) return `Hace ${Math.floor(diffInDays / 30)} meses`;
    return `Hace ${Math.floor(diffInDays / 365)} años`;
  };

  const getCategoryColor = (categoria: string) => {
    const colors: { [key: string]: string } = {
      'Actividad Educativa': 'bg-blue-100 text-blue-800',
      'Evento Especial': 'bg-purple-100 text-purple-800',
      'Salud y Bienestar': 'bg-green-100 text-green-800',
      'Arte y Creatividad': 'bg-pink-100 text-pink-800',
      'Deportes y Recreación': 'bg-orange-100 text-orange-800',
      'Familia': 'bg-amber-100 text-amber-800',
      'Logro o Hito': 'bg-emerald-100 text-emerald-800',
      'Otro': 'bg-gray-100 text-gray-800',
    };
    return colors[categoria] || colors['Otro'];
  };

  if (!child) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Niño no encontrado</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start gap-6 mb-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-amber-200">
            <ImageWithFallback
              src={child.foto}
              alt={child.nombre}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-gray-900 mb-2">Bitácora de {child.nombre}</h1>
            <p className="text-gray-600 mb-4">
              Sigue su crecimiento y desarrollo
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{child.edad} años</span>
              <span>•</span>
              <span>{child.municipio}</span>
              <span>•</span>
              <span>{child.grado}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {isAdmin && (
              <Button
                onClick={() => setShowUploadModal(true)}
                className="bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Entrada
              </Button>
            )}
            <Button
              onClick={() => setShowPDFModal(true)}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar PDF
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Fotos</p>
                  <p className="text-3xl text-gray-900" style={{ fontWeight: 700 }}>
                    {stats.totalFotos}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <FileImage className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Videos</p>
                  <p className="text-3xl text-gray-900" style={{ fontWeight: 700 }}>
                    {stats.totalVideos}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <FileVideo className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Última Actualización</p>
                  <p className="text-lg text-gray-900">
                    {stats.ultimaActualizacion
                      ? formatRelativeTime(stats.ultimaActualizacion)
                      : 'N/A'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Meses Documentados</p>
                  <p className="text-3xl text-gray-900" style={{ fontWeight: 700 }}>
                    {stats.mesesDocumentados}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg flex items-center justify-center">
                  <CalendarDays className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters and View Options */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2 bg-amber-500">{activeFiltersCount}</Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="search">Buscar</Label>
                  <Input
                    id="search"
                    placeholder="Buscar en descripciones y etiquetas..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Rango de Fechas</Label>
                  <div className="space-y-2">
                    <Input
                      type="date"
                      placeholder="Desde"
                      value={filters.dateFrom}
                      onChange={(e) =>
                        setFilters({ ...filters, dateFrom: e.target.value })
                      }
                    />
                    <Input
                      type="date"
                      placeholder="Hasta"
                      value={filters.dateTo}
                      onChange={(e) =>
                        setFilters({ ...filters, dateTo: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Contenido</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="foto"
                        checked={filters.types.foto}
                        onCheckedChange={(checked) =>
                          setFilters({
                            ...filters,
                            types: { ...filters.types, foto: !!checked },
                          })
                        }
                      />
                      <Label htmlFor="foto" className="cursor-pointer">
                        Fotos
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="video"
                        checked={filters.types.video}
                        onCheckedChange={(checked) =>
                          setFilters({
                            ...filters,
                            types: { ...filters.types, video: !!checked },
                          })
                        }
                      />
                      <Label htmlFor="video" className="cursor-pointer">
                        Videos
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría</Label>
                  <Select
                    value={filters.categoria}
                    onValueChange={(value) =>
                      setFilters({ ...filters, categoria: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="Actividad Educativa">
                        Actividad Educativa
                      </SelectItem>
                      <SelectItem value="Evento Especial">
                        Evento Especial
                      </SelectItem>
                      <SelectItem value="Salud y Bienestar">
                        Salud y Bienestar
                      </SelectItem>
                      <SelectItem value="Arte y Creatividad">
                        Arte y Creatividad
                      </SelectItem>
                      <SelectItem value="Deportes y Recreación">
                        Deportes y Recreación
                      </SelectItem>
                      <SelectItem value="Familia">Familia</SelectItem>
                      <SelectItem value="Logro o Hito">Logro o Hito</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button onClick={clearFilters} variant="outline" className="flex-1">
                    Limpiar
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {activeFiltersCount > 0 && (
            <Button onClick={clearFilters} variant="ghost" size="sm">
              <X className="w-4 h-4 mr-1" />
              Limpiar filtros
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <Button
            variant={viewMode === 'timeline' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('timeline')}
          >
            <CalendarDays className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'gallery' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('gallery')}
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-400 via-emerald-400 to-blue-400" />

          {Object.entries(groupedEntries).reverse().map(([year, months]) => (
            <div key={year} className="mb-12">
              {/* Year Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="relative z-10 bg-gradient-to-r from-amber-500 to-emerald-500 text-white px-6 py-2 rounded-full shadow-lg">
                  <span className="text-lg" style={{ fontWeight: 700 }}>
                    {year}
                  </span>
                </div>
                <div className="flex-1 h-0.5 bg-gradient-to-r from-amber-200 to-transparent" />
              </div>

              {Object.entries(months).reverse().map(([month, entries]) => (
                <div key={month} className="mb-8">
                  {/* Month Header */}
                  <div className="flex items-center gap-4 mb-6 ml-16">
                    <h3 className="text-gray-900 capitalize">{month}</h3>
                    <Badge variant="secondary">{entries.length} entradas</Badge>
                  </div>

                  {/* Entries */}
                  <div className="space-y-6">
                    {entries.map((entry, index) => (
                      <div key={entry.id} className="flex gap-6 ml-4">
                        {/* Timeline Dot */}
                        <div className="relative flex-shrink-0">
                          <div className="w-8 h-8 bg-white border-4 border-amber-400 rounded-full" />
                        </div>

                        {/* Entry Card */}
                        <Card className="flex-1 hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            {/* Card Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Calendar className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-900">
                                    {formatDate(entry.fechaActividad)}
                                  </span>
                                  <Badge className={getCategoryColor(entry.categoria)}>
                                    {entry.categoria}
                                  </Badge>
                                </div>
                              </div>
                              {isAdmin && (
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingEntry(entry.id)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDeletingEntry(entry.id)}
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </Button>
                                </div>
                              )}
                            </div>

                            {/* Media */}
                            <div
                              className="mb-4 rounded-lg overflow-hidden cursor-pointer group relative"
                              onClick={() => setSelectedMedia(entry.id)}
                            >
                              {entry.tipo === 'foto' ? (
                                <ImageWithFallback
                                  src={entry.url}
                                  alt={entry.descripcion}
                                  className="w-full h-auto"
                                />
                              ) : (
                                <div className="relative aspect-video bg-gray-900">
                                  <ImageWithFallback
                                    src={entry.thumbnailUrl || entry.url}
                                    alt={entry.descripcion}
                                    className="w-full h-full object-cover opacity-80"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                      <Play className="w-8 h-8 text-gray-900 ml-1" />
                                    </div>
                                  </div>
                                  {entry.duracion && (
                                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                                      {Math.floor(entry.duracion / 60)}:
                                      {String(entry.duracion % 60).padStart(2, '0')}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Description */}
                            <p className="text-gray-700 mb-4">{entry.descripcion}</p>

                            {/* Tags */}
                            {entry.etiquetas.length > 0 && (
                              <div className="flex items-center gap-2 flex-wrap mb-4">
                                <Tag className="w-4 h-4 text-gray-400" />
                                {entry.etiquetas.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>Subido por {entry.uploadedByName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{formatRelativeTime(entry.fechaPublicacion)}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Empty State */}
          {filteredEntries.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-gray-900 mb-2">
                  {allEntries.length === 0
                    ? 'Aún no hay entradas en la bitácora'
                    : 'No se encontraron entradas'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {allEntries.length === 0
                    ? isAdmin
                      ? 'Agrega la primera entrada para comenzar a documentar el progreso'
                      : 'Pronto comenzaremos a documentar el progreso'
                    : 'Intenta ajustar los filtros para ver más resultados'}
                </p>
                {isAdmin && allEntries.length === 0 && (
                  <Button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Primera Entrada
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Gallery View */}
      {viewMode === 'gallery' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer"
              onClick={() => setSelectedMedia(entry.id)}
            >
              <ImageWithFallback
                src={entry.tipo === 'foto' ? entry.url : entry.thumbnailUrl || entry.url}
                alt={entry.descripcion}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white text-sm line-clamp-2">{entry.descripcion}</p>
                </div>
              </div>
              {entry.tipo === 'video' && (
                <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  <Play className="w-3 h-3" />
                  Video
                </div>
              )}
              <Badge className={`absolute top-2 left-2 ${getCategoryColor(entry.categoria)}`}>
                {entry.categoria}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredEntries.map((entry) => (
            <Card
              key={entry.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedMedia(entry.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={entry.tipo === 'foto' ? entry.url : entry.thumbnailUrl || entry.url}
                      alt={entry.descripcion}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-600">
                        {formatDate(entry.fechaActividad)}
                      </span>
                      <Badge className={getCategoryColor(entry.categoria)}>
                        {entry.categoria}
                      </Badge>
                    </div>
                    <p className="text-gray-900 mb-2 line-clamp-2">{entry.descripcion}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      {entry.tipo === 'foto' ? (
                        <FileImage className="w-4 h-4" />
                      ) : (
                        <FileVideo className="w-4 h-4" />
                      )}
                      <span>{entry.tipo === 'foto' ? 'Foto' : 'Video'}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(entry.fechaPublicacion)}</span>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingEntry(entry.id);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingEntry(entry.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      {showUploadModal && (
        <MultimediaUploadModal
          childId={child.id}
          childName={child.nombre}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            toast.success('Entrada agregada exitosamente');
          }}
        />
      )}

      {showPDFModal && (
        <PDFGenerationModal
          childId={child.id}
          childName={child.nombre}
          onClose={() => setShowPDFModal(false)}
        />
      )}

      {selectedMedia && (
        <MediaLightbox
          entryId={selectedMedia}
          onClose={() => setSelectedMedia(null)}
        />
      )}

      {editingEntry && (
        <EditEntryModal
          entryId={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSuccess={() => {
            setEditingEntry(null);
            toast.success('Entrada actualizada');
          }}
        />
      )}

      {deletingEntry && (
        <DeleteEntryModal
          entryId={deletingEntry}
          onClose={() => setDeletingEntry(null)}
          onConfirm={() => {
            setDeletingEntry(null);
            toast.success('Entrada eliminada');
          }}
        />
      )}
    </div>
  );
}


