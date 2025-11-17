import { useState } from 'react';
import { Plus, Search, Edit, Eye, Upload, AlertCircle, Calendar } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useBitacora } from '../../contexts/BitacoraContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';

// ChildrenManagementPage es la vista de administración de niños/bitácoras:
// - Lista niños con filtros por nombre, estado de apadrinamiento y municipio.
// - Muestra métricas rápidas (totales, apadrinados, disponibles, en alerta).
// - Desde aquí se navega al formulario de registro y a la Bitácora de cada niño.
export function ChildrenManagementPage({ onNavigate }: { onNavigate: (page: string, id?: string) => void }) {
  const { children, getChildStats } = useBitacora();
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('all');
  const [municipioFilter, setMunicipioFilter] = useState('all');

  const filteredChildren = children.filter((child) => {
    const matchesSearch =
      search === '' ||
      child.nombre.toLowerCase().includes(search.toLowerCase()) ||
      child.apellidos.toLowerCase().includes(search.toLowerCase());

    const matchesEstado =
      estadoFilter === 'all' || child.estadoApadrinamiento === estadoFilter;

    const matchesMunicipio =
      municipioFilter === 'all' || child.municipio === municipioFilter;

    return matchesSearch && matchesEstado && matchesMunicipio;
  });

  const municipios = Array.from(new Set(children.map((c) => c.municipio)));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
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

  const getAlertLevel = (stats: any) => {
    if (!stats.ultimaActualizacion) return 'red';
    
    const date = new Date(stats.ultimaActualizacion);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays > 30) return 'red';
    if (diffInDays > 14) return 'yellow';
    return 'green';
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">Gestión de Bitácoras</h1>
          <p className="text-gray-600">
            Administra la información y bitácoras de todos los niños
          </p>
        </div>

        <Button
          onClick={() => onNavigate('child-form')}
          className="bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Registrar Nuevo Niño
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Total Niños</p>
            <p className="text-3xl text-gray-900" style={{ fontWeight: 700 }}>
              {children.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Apadrinados</p>
            <p className="text-3xl text-gray-900" style={{ fontWeight: 700 }}>
              {children.filter((c) => c.estadoApadrinamiento === 'apadrinado').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Disponibles</p>
            <p className="text-3xl text-gray-900" style={{ fontWeight: 700 }}>
              {children.filter((c) => c.estadoApadrinamiento === 'disponible').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Requieren Atención</p>
            <p className="text-3xl text-red-600" style={{ fontWeight: 700 }}>
              {children.filter((c) => {
                const stats = getChildStats(c.id);
                return getAlertLevel(stats) === 'red';
              }).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="apadrinado">Apadrinado</SelectItem>
                <SelectItem value="disponible">Disponible</SelectItem>
              </SelectContent>
            </Select>

            <Select value={municipioFilter} onValueChange={setMunicipioFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Municipio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los municipios</SelectItem>
                {municipios.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Niño</TableHead>
                <TableHead>Edad</TableHead>
                <TableHead>Municipio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Total Entradas</TableHead>
                <TableHead>Última Actualización</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChildren.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    No se encontraron niños
                  </TableCell>
                </TableRow>
              ) : (
                filteredChildren.map((child) => {
                  const stats = getChildStats(child.id);
                  const alertLevel = getAlertLevel(stats);

                  return (
                    <TableRow key={child.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden">
                            <ImageWithFallback
                              src={child.foto}
                              alt={child.nombre}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-gray-900">
                              {child.nombre} {child.apellidos}
                            </p>
                            <p className="text-sm text-gray-500">{child.grado}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{child.edad} años</TableCell>
                      <TableCell>{child.municipio}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            child.estadoApadrinamiento === 'apadrinado'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }
                        >
                          {child.estadoApadrinamiento === 'apadrinado'
                            ? 'Apadrinado'
                            : 'Disponible'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900">
                            {stats.totalFotos + stats.totalVideos}
                          </span>
                          {alertLevel === 'red' && (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                          {alertLevel === 'yellow' && (
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {stats.ultimaActualizacion ? (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {formatRelativeTime(stats.ultimaActualizacion)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-red-600">Sin entradas</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              window.location.hash = `bitacora-${child.id}`;
                              onNavigate('bitacora', child.id);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // In real app would navigate to upload modal with childId
                              window.location.hash = `bitacora-${child.id}`;
                              onNavigate('bitacora', child.id);
                            }}
                          >
                            <Upload className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              window.location.hash = `child-form-${child.id}`;
                              onNavigate('child-form', child.id);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Alerts Section */}
      {children.filter((c) => {
        const stats = getChildStats(c.id);
        return getAlertLevel(stats) !== 'green';
      }).length > 0 && (
        <Card className="mt-6 border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <h3 className="text-yellow-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Niños que Requieren Atención
            </h3>
            <div className="space-y-2">
              {children
                .filter((c) => {
                  const stats = getChildStats(c.id);
                  return getAlertLevel(stats) !== 'green';
                })
                .map((child) => {
                  const stats = getChildStats(child.id);
                  const alertLevel = getAlertLevel(stats);

                  return (
                    <div
                      key={child.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                          <ImageWithFallback
                            src={child.foto}
                            alt={child.nombre}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-gray-900">
                            {child.nombre} {child.apellidos}
                          </p>
                          <p className="text-sm text-gray-600">
                            {stats.ultimaActualizacion
                              ? `Última actualización: ${formatRelativeTime(
                                  stats.ultimaActualizacion
                                )}`
                              : 'Sin entradas en la bitácora'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          window.location.hash = `bitacora-${child.id}`;
                          onNavigate('bitacora', child.id);
                        }}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Agregar Entrada
                      </Button>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

