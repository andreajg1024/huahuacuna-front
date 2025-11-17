import { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  Users, 
  Heart, 
  MapPin,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { useSponsorship, ChildFilters } from '../../contexts/SponsorshipContext';
import { ChildCard } from './ChildCard';
import { ChildDetailModal } from './ChildDetailModal';
import { SponsorshipConfirmationModal } from './SponsorshipConfirmationModal';

const MUNICIPALITIES = [
  'Armenia',
  'Calarcá',
  'Circasia',
  'Córdoba',
  'Filandia',
  'La Tebaida',
  'Montenegro',
  'Pijao',
  'Quimbaya',
  'Salento',
];

const ITEMS_PER_PAGE = 12;

export function ChildrenCatalogPage() {
  const { children, filterChildren } = useSponsorship();
  
  const [filters, setFilters] = useState<ChildFilters>({
    ageRange: [5, 18],
    genero: 'todos',
    municipios: [],
    searchTerm: '',
  });

  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [sponsorChild, setSponsorChild] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Apply filters
  const filteredChildren = useMemo(() => {
    return filterChildren(filters);
  }, [filters, filterChildren]);

  // Pagination
  const totalPages = Math.ceil(filteredChildren.length / ITEMS_PER_PAGE);
  const paginatedChildren = filteredChildren.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.ageRange && (filters.ageRange[0] !== 5 || filters.ageRange[1] !== 18)) count++;
    if (filters.genero && filters.genero !== 'todos') count++;
    if (filters.municipios && filters.municipios.length > 0) count += filters.municipios.length;
    if (filters.searchTerm) count++;
    return count;
  }, [filters]);

  const handleFilterChange = (key: keyof ChildFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page
  };

  const clearFilters = () => {
    setFilters({
      ageRange: [5, 18],
      genero: 'todos',
      municipios: [],
      searchTerm: '',
    });
    setCurrentPage(1);
  };

  const removeFilter = (key: keyof ChildFilters, value?: string) => {
    if (key === 'municipios' && value) {
      setFilters(prev => ({
        ...prev,
        municipios: prev.municipios?.filter(m => m !== value) || [],
      }));
    } else if (key === 'genero') {
      setFilters(prev => ({ ...prev, genero: 'todos' }));
    } else if (key === 'ageRange') {
      setFilters(prev => ({ ...prev, ageRange: [5, 18] }));
    } else if (key === 'searchTerm') {
      setFilters(prev => ({ ...prev, searchTerm: '' }));
    }
  };

  const handleMunicipalityToggle = (municipality: string) => {
    const current = filters.municipios || [];
    if (current.includes(municipality)) {
      handleFilterChange('municipios', current.filter(m => m !== municipality));
    } else {
      handleFilterChange('municipios', [...current, municipality]);
    }
  };

  const stats = [
    { 
      label: 'Niños Disponibles', 
      value: children.length, 
      icon: Users, 
      color: 'from-blue-400 to-blue-500' 
    },
    { 
      label: 'Apadrinados Este Mes', 
      value: 8, 
      icon: Heart, 
      color: 'from-pink-400 to-pink-500' 
    },
    { 
      label: 'Municipios', 
      value: MUNICIPALITIES.length, 
      icon: MapPin, 
      color: 'from-emerald-400 to-emerald-500' 
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Niños Disponibles para Apadrinamiento</h1>
        <p className="text-gray-600">
          Encuentra un niño que puedas apoyar en su desarrollo integral
        </p>
      </div>

      {/* Statistics */}
      <div className="grid sm:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-3xl text-gray-900" style={{ fontWeight: 700 }}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar por nombre..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filter Toggle Button */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="border-gray-300 lg:w-auto"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge className="ml-2 bg-amber-500 text-white">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {filters.searchTerm && (
              <Badge 
                variant="secondary" 
                className="cursor-pointer hover:bg-gray-200"
                onClick={() => removeFilter('searchTerm')}
              >
                Búsqueda: "{filters.searchTerm}"
                <X className="w-3 h-3 ml-1" />
              </Badge>
            )}
            {filters.genero && filters.genero !== 'todos' && (
              <Badge 
                variant="secondary"
                className="cursor-pointer hover:bg-gray-200"
                onClick={() => removeFilter('genero')}
              >
                {filters.genero === 'masculino' ? 'Niños' : 'Niñas'}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            )}
            {filters.ageRange && (filters.ageRange[0] !== 5 || filters.ageRange[1] !== 18) && (
              <Badge 
                variant="secondary"
                className="cursor-pointer hover:bg-gray-200"
                onClick={() => removeFilter('ageRange')}
              >
                Edad: {filters.ageRange[0]}-{filters.ageRange[1]} años
                <X className="w-3 h-3 ml-1" />
              </Badge>
            )}
            {filters.municipios?.map(m => (
              <Badge 
                key={m}
                variant="secondary"
                className="cursor-pointer hover:bg-gray-200"
                onClick={() => removeFilter('municipios', m)}
              >
                {m}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Limpiar Todo
            </Button>
          </div>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Age Range */}
              <div>
                <Label className="mb-4 block">Rango de Edad</Label>
                <Slider
                  min={5}
                  max={18}
                  step={1}
                  value={filters.ageRange}
                  onValueChange={(value) => handleFilterChange('ageRange', value as [number, number])}
                  className="mb-2"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{filters.ageRange?.[0]} años</span>
                  <span>{filters.ageRange?.[1]} años</span>
                </div>
              </div>

              {/* Gender */}
              <div>
                <Label className="mb-4 block">Género</Label>
                <RadioGroup
                  value={filters.genero}
                  onValueChange={(value) => handleFilterChange('genero', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="todos" id="todos" />
                    <Label htmlFor="todos" className="cursor-pointer">Todos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="masculino" id="masculino" />
                    <Label htmlFor="masculino" className="cursor-pointer">Masculino</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="femenino" id="femenino" />
                    <Label htmlFor="femenino" className="cursor-pointer">Femenino</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Municipalities */}
              <div className="md:col-span-2">
                <Label className="mb-4 block">Municipio</Label>
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2">
                  {MUNICIPALITIES.map(municipality => (
                    <div key={municipality} className="flex items-center space-x-2">
                      <Checkbox
                        id={municipality}
                        checked={filters.municipios?.includes(municipality)}
                        onCheckedChange={() => handleMunicipalityToggle(municipality)}
                      />
                      <Label htmlFor={municipality} className="cursor-pointer text-sm">
                        {municipality}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
              <Button
                onClick={() => setShowFilters(false)}
                className="bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white"
              >
                Aplicar Filtros
              </Button>
              <Button
                variant="outline"
                onClick={clearFilters}
              >
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          Mostrando {paginatedChildren.length} de {filteredChildren.length} niños
        </p>
      </div>

      {/* Children Grid */}
      {isLoading ? (
        <div className={viewMode === 'grid' 
          ? 'grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
        }>
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="w-full aspect-square mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : paginatedChildren.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? 'grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
        }>
          {paginatedChildren.map(child => (
            <ChildCard
              key={child.id}
              child={child}
              variant={viewMode}
              onViewProfile={setSelectedChild}
              onSponsor={setSponsorChild}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-gray-900 mb-2">No se encontraron niños</h3>
              <p className="text-gray-600 mb-6">
                {activeFiltersCount > 0 
                  ? 'No hay niños disponibles con estos filtros. Intenta ajustar tus criterios de búsqueda.'
                  : 'Actualmente no hay niños disponibles para apadrinamiento.'
                }
              </p>
              {activeFiltersCount > 0 && (
                <Button onClick={clearFilters} variant="outline">
                  Limpiar Filtros
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
            // Show first, last, current, and adjacent pages
            if (
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
            ) {
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  onClick={() => setCurrentPage(page)}
                  className="w-10"
                >
                  {page}
                </Button>
              );
            } else if (page === currentPage - 2 || page === currentPage + 2) {
              return <span key={page} className="px-2">...</span>;
            }
            return null;
          })}

          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Modals */}
      {selectedChild && (
        <ChildDetailModal
          childId={selectedChild}
          onClose={() => setSelectedChild(null)}
          onSponsor={(childId) => {
            setSelectedChild(null);
            setSponsorChild(childId);
          }}
        />
      )}

      {sponsorChild && (
        <SponsorshipConfirmationModal
          childId={sponsorChild}
          onClose={() => setSponsorChild(null)}
          onConfirm={() => setSponsorChild(null)}
        />
      )}
    </div>
  );
}

