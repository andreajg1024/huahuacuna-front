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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
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
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  Search, Download, Mail, Phone, Eye, Trash2, 
  Users, Clock, CheckCircle2, XCircle, AlertCircle,
  FileText, Calendar, User, Filter
} from 'lucide-react';
import { useVolunteering, type VolunteerApplication, type VolunteerStatus } from '../../contexts/VolunteeringContext';
import { VolunteerDetailView } from './VolunteerDetailView';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  pendiente_revision: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  en_revision: { label: 'En Revisión', color: 'bg-blue-100 text-blue-800', icon: Eye },
  contactado: { label: 'Contactado', color: 'bg-purple-100 text-purple-800', icon: Phone },
  aprobado: { label: 'Aprobado', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  rechazado: { label: 'Rechazado', color: 'bg-red-100 text-red-800', icon: XCircle },
  activo: { label: 'Activo', color: 'bg-emerald-100 text-emerald-800', icon: Users },
  inactivo: { label: 'Inactivo', color: 'bg-gray-100 text-gray-800', icon: XCircle }
};

interface AdminVolunteerManagementProps {
  onNavigate?: (page: string) => void;
}

export const AdminVolunteerManagement: React.FC<AdminVolunteerManagementProps> = ({ onNavigate }) => {
  const { applications, deleteApplication } = useVolunteering();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState<'all' | VolunteerStatus>('all');
  const [selectedVolunteer, setSelectedVolunteer] = useState<VolunteerApplication | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [volunteerToDelete, setVolunteerToDelete] = useState<string | null>(null);

  const filteredApplications = applications.filter(app => {
    const matchesTab = currentTab === 'all' || app.status === currentTab;
    const matchesSearch = !searchQuery || 
      app.nombreCompleto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.numeroDocumento.includes(searchQuery);
    
    return matchesTab && matchesSearch;
  });

  const stats = {
    total: applications.length,
    pendiente_revision: applications.filter(a => a.status === 'pendiente_revision').length,
    en_revision: applications.filter(a => a.status === 'en_revision').length,
    aprobado: applications.filter(a => a.status === 'aprobado').length,
    activo: applications.filter(a => a.status === 'activo').length,
    contactado: applications.filter(a => a.status === 'contactado').length,
    rechazado: applications.filter(a => a.status === 'rechazado').length,
  };

  const approvalRate = stats.total > 0 
    ? Math.round(((stats.aprobado + stats.activo) / stats.total) * 100)
    : 0;

  const getDaysSinceApplication = (fechaSolicitud: string) => {
    const days = Math.floor((Date.now() - new Date(fechaSolicitud).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleViewDetails = (volunteer: VolunteerApplication) => {
    setSelectedVolunteer(volunteer);
    setDetailDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setVolunteerToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (volunteerToDelete) {
      deleteApplication(volunteerToDelete);
      toast.success('Solicitud eliminada');
      setDeleteDialogOpen(false);
      setVolunteerToDelete(null);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Nombre', 'Email', 'Teléfono', 'Áreas', 'Estado', 'Fecha Solicitud'].join(','),
      ...filteredApplications.map(app => [
        app.id,
        app.nombreCompleto,
        app.email,
        app.telefono,
        app.areasInteres.join(';'),
        app.status,
        new Date(app.fechaSolicitud).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voluntarios-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast.success('Exportación completada');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="p-6">
      {/* Back button */}
      <button
        onClick={() => onNavigate?.('dashboard')}
        className="mb-4 text-sm text-gray-600 hover:text-amber-600"
      >
        ← Volver al panel
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl mb-2">Gestión de Voluntarios</h1>
          <p className="text-gray-600">Administra las solicitudes de voluntariado</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Solicitudes</p>
                <p className="text-2xl">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl">{stats.pendiente_revision}</p>
                {stats.pendiente_revision > 10 && (
                  <Badge variant="destructive" className="mt-1">¡Requiere atención!</Badge>
                )}
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-2xl">{stats.activo}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tasa de Aprobación</p>
                <p className="text-2xl">{approvalRate}%</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-[#4A9D5F]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar por nombre, email o documento..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as any)}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">Todos ({stats.total})</TabsTrigger>
          <TabsTrigger value="pendiente_revision">
            Pendientes ({stats.pendiente_revision})
            {stats.pendiente_revision > 10 && (
              <span className="ml-2 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </TabsTrigger>
          <TabsTrigger value="en_revision">
            En Revisión ({stats.en_revision})
          </TabsTrigger>
          <TabsTrigger value="contactado">
            Contactados ({stats.contactado})
          </TabsTrigger>
          <TabsTrigger value="aprobado">
            Aprobados ({stats.aprobado})
          </TabsTrigger>
          <TabsTrigger value="activo">
            Activos ({stats.activo})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={currentTab}>
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl mb-2">No hay solicitudes</h3>
                <p className="text-gray-600">
                  {searchQuery ? 'No se encontraron resultados' : 'No hay solicitudes en esta categoría'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Voluntario</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Edad</TableHead>
                      <TableHead>Áreas de Interés</TableHead>
                      <TableHead>Disponibilidad</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha Solicitud</TableHead>
                      <TableHead>Días Pendientes</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredApplications.map((app) => {
                      const daysPending = getDaysSinceApplication(app.fechaSolicitud);
                      const StatusIcon = STATUS_CONFIG[app.status].icon;

                      return (
                        <TableRow key={app.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={app.foto} />
                                <AvatarFallback>{getInitials(app.nombreCompleto)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{app.nombreCompleto}</p>
                                <p className="text-sm text-gray-600">{app.id}</p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="text-sm">
                              <div className="flex items-center gap-1 text-gray-600">
                                <Mail className="w-3 h-3" />
                                <a href={`mailto:${app.email}`} className="hover:text-[#4A9D5F]">
                                  {app.email}
                                </a>
                              </div>
                              <div className="flex items-center gap-1 text-gray-600 mt-1">
                                <Phone className="w-3 h-3" />
                                <a href={`tel:${app.telefono}`} className="hover:text-[#4A9D5F]">
                                  {app.telefono}
                                </a>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <span className="text-sm">{app.edad} años</span>
                          </TableCell>

                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {app.areasInteres.slice(0, 2).map((area, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {area}
                                </Badge>
                              ))}
                              {app.areasInteres.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{app.areasInteres.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="text-sm text-gray-600">
                              <div>{app.diasDisponibles.slice(0, 3).join(', ')}</div>
                              <div className="text-xs">{app.horasPorSemana}h/semana</div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge className={STATUS_CONFIG[app.status].color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {STATUS_CONFIG[app.status].label}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <div className="text-sm text-gray-600">
                              {new Date(app.fechaSolicitud).toLocaleDateString('es-CO')}
                            </div>
                          </TableCell>

                          <TableCell>
                            {app.status === 'pendiente_revision' && (
                              <div className={`text-sm ${daysPending > 7 ? 'text-red-600' : 'text-gray-600'}`}>
                                {daysPending} días
                                {daysPending > 7 && (
                                  <AlertCircle className="w-3 h-3 inline ml-1" />
                                )}
                              </div>
                            )}
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(app)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.location.href = `mailto:${app.email}`}
                              >
                                <Mail className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(app.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Alert for pending */}
      {stats.pendiente_revision > 0 && (
        <div className="mt-6">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-900">
                    {stats.pendiente_revision} solicitud{stats.pendiente_revision !== 1 ? 'es' : ''} pendiente{stats.pendiente_revision !== 1 ? 's' : ''} de revisión
                  </p>
                  <p className="text-sm text-yellow-700">
                    Algunas solicitudes llevan más de 7 días sin revisar
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          {selectedVolunteer && (
            <VolunteerDetailView 
              volunteer={selectedVolunteer} 
              onClose={() => setDetailDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar solicitud?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La solicitud será eliminada permanentemente.
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
