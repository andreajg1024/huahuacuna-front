import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { 
  Search, Download, Mail, Phone, Eye, Trash2, 
  Users, UserCheck, UserX, Clock, FileText, Home
} from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';
import { useProjects, type Volunteer } from '../../contexts/ProjectsContext';
import { toast } from 'sonner';

type VolunteerStatus = 'pendiente' | 'contactado' | 'activo' | 'inactivo';

interface VolunteerManagementPageProps {
  onNavigate?: (page: string) => void;
}

export const VolunteerManagementPage: React.FC<VolunteerManagementPageProps> = ({ onNavigate }) => {
  const { volunteers, projects, updateVolunteer, deleteVolunteer } = useProjects();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState<'all' | VolunteerStatus>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [volunteerToDelete, setVolunteerToDelete] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  // Filter volunteers
  const filteredVolunteers = volunteers.filter(volunteer => {
    // Tab filter
    if (currentTab !== 'all' && volunteer.status !== currentTab) {
      return false;
    }

    // Project filter
    if (projectFilter !== 'all' && volunteer.projectId !== projectFilter) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        volunteer.fullName.toLowerCase().includes(query) ||
        volunteer.email.toLowerCase().includes(query) ||
        volunteer.projectTitle.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Stats
  const stats = {
    total: volunteers.length,
    pendiente: volunteers.filter(v => v.status === 'pendiente').length,
    contactado: volunteers.filter(v => v.status === 'contactado').length,
    activo: volunteers.filter(v => v.status === 'activo').length,
    inactivo: volunteers.filter(v => v.status === 'inactivo').length
  };

  const handleViewDetails = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setAdminNotes(volunteer.notes || '');
    setDetailDialogOpen(true);
  };

  const handleStatusChange = (volunteerId: string, newStatus: VolunteerStatus) => {
    updateVolunteer(volunteerId, { status: newStatus });
    toast.success('Estado actualizado');
  };

  const handleSaveNotes = () => {
    if (selectedVolunteer) {
      updateVolunteer(selectedVolunteer.id, { notes: adminNotes });
      toast.success('Notas guardadas');
      setDetailDialogOpen(false);
    }
  };

  const handleDeleteClick = (volunteerId: string) => {
    setVolunteerToDelete(volunteerId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (volunteerToDelete) {
      deleteVolunteer(volunteerToDelete);
      toast.success('Voluntario eliminado');
      setDeleteDialogOpen(false);
      setVolunteerToDelete(null);
    }
  };

  const handleExportCSV = () => {
    // Simple CSV export
    const headers = ['Nombre', 'Email', 'Teléfono', 'Proyecto', 'Estado', 'Fecha de Registro'];
    const rows = filteredVolunteers.map(v => [
      v.fullName,
      v.email,
      v.phone,
      v.projectTitle,
      v.status,
      new Date(v.registrationDate).toLocaleDateString('es-CO')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voluntarios-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    toast.success('CSV exportado');
  };

  const getStatusBadgeVariant = (status: VolunteerStatus) => {
    switch (status) {
      case 'pendiente':
        return 'secondary';
      case 'contactado':
        return 'outline';
      case 'activo':
        return 'default';
      case 'inactivo':
        return 'destructive';
    }
  };

  const getStatusLabel = (status: VolunteerStatus) => {
    switch (status) {
      case 'pendiente':
        return 'Pendiente de Contacto';
      case 'contactado':
        return 'Contactado';
      case 'activo':
        return 'Activo';
      case 'inactivo':
        return 'Inactivo';
    }
  };

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
              <BreadcrumbPage>Gestión de Voluntarios</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl mb-2">Gestión de Voluntarios</h1>
          <p className="text-gray-600">Gestiona las solicitudes y participación de voluntarios</p>
        </div>
        <Button onClick={handleExportCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl mt-1">{stats.total}</p>
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
                  <p className="text-2xl mt-1">{stats.pendiente}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Contactados</p>
                  <p className="text-2xl mt-1">{stats.contactado}</p>
                </div>
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Activos</p>
                  <p className="text-2xl mt-1">{stats.activo}</p>
                </div>
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inactivos</p>
                  <p className="text-2xl mt-1">{stats.inactivo}</p>
                </div>
                <UserX className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, email o proyecto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Filtrar por proyecto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los proyectos</SelectItem>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={currentTab} onValueChange={(value: any) => setCurrentTab(value)}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">
              Todos ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="pendiente">
              Pendientes ({stats.pendiente})
            </TabsTrigger>
            <TabsTrigger value="contactado">
              Contactados ({stats.contactado})
            </TabsTrigger>
            <TabsTrigger value="activo">
              Activos ({stats.activo})
            </TabsTrigger>
            <TabsTrigger value="inactivo">
              Inactivos ({stats.inactivo})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={currentTab} className="mt-0">
            {filteredVolunteers.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl mb-2">
                    {searchQuery || projectFilter !== 'all' 
                      ? 'No se encontraron voluntarios'
                      : 'Aún no hay voluntarios registrados'
                    }
                  </h3>
                  <p className="text-gray-600">
                    {searchQuery || projectFilter !== 'all' 
                      ? 'Intenta ajustar los filtros'
                      : 'Los voluntarios aparecerán aquí cuando se registren'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Proyecto</TableHead>
                      <TableHead>Habilidades</TableHead>
                      <TableHead>Disponibilidad</TableHead>
                      <TableHead>Fecha Registro</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVolunteers.map(volunteer => (
                      <TableRow key={volunteer.id}>
                        <TableCell>{volunteer.fullName}</TableCell>
                        <TableCell>
                          <a 
                            href={`mailto:${volunteer.email}`} 
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Mail className="w-3 h-3" />
                            {volunteer.email}
                          </a>
                        </TableCell>
                        <TableCell>
                          <a 
                            href={`tel:${volunteer.phone}`} 
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            {volunteer.phone}
                          </a>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{volunteer.projectTitle}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {volunteer.skills.slice(0, 2).map(skill => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {volunteer.skills.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{volunteer.skills.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm line-clamp-1">
                            {volunteer.availability.join(', ')}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(volunteer.registrationDate).toLocaleDateString('es-CO')}
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={volunteer.status} 
                            onValueChange={(value: VolunteerStatus) => handleStatusChange(volunteer.id, value)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <Badge variant={getStatusBadgeVariant(volunteer.status)}>
                                {getStatusLabel(volunteer.status)}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pendiente">Pendiente</SelectItem>
                              <SelectItem value="contactado">Contactado</SelectItem>
                              <SelectItem value="activo">Activo</SelectItem>
                              <SelectItem value="inactivo">Inactivo</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(volunteer)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteClick(volunteer.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Detail Dialog */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalles del Voluntario</DialogTitle>
              <DialogDescription>
                {selectedVolunteer?.fullName}
              </DialogDescription>
            </DialogHeader>

            {selectedVolunteer && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm">{selectedVolunteer.email}</p>
                  </div>
                  <div>
                    <Label>Teléfono</Label>
                    <p className="text-sm">{selectedVolunteer.phone}</p>
                  </div>
                  {selectedVolunteer.documentId && (
                    <div>
                      <Label>Documento</Label>
                      <p className="text-sm">{selectedVolunteer.documentId}</p>
                    </div>
                  )}
                  {selectedVolunteer.age && (
                    <div>
                      <Label>Edad</Label>
                      <p className="text-sm">{selectedVolunteer.age} años</p>
                    </div>
                  )}
                  <div>
                    <Label>Ciudad</Label>
                    <p className="text-sm">{selectedVolunteer.city || 'No especificada'}</p>
                  </div>
                  <div>
                    <Label>Proyecto</Label>
                    <p className="text-sm">{selectedVolunteer.projectTitle}</p>
                  </div>
                </div>

                <div>
                  <Label>Habilidades</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedVolunteer.skills.map(skill => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {selectedVolunteer.previousExperience && (
                  <div>
                    <Label>Experiencia Previa</Label>
                    <p className="text-sm text-gray-700 mt-1">{selectedVolunteer.previousExperience}</p>
                  </div>
                )}

                <div>
                  <Label>Motivación</Label>
                  <p className="text-sm text-gray-700 mt-1">{selectedVolunteer.motivation}</p>
                </div>

                <div>
                  <Label>Disponibilidad</Label>
                  <p className="text-sm text-gray-700 mt-1">{selectedVolunteer.availability.join(', ')}</p>
                </div>

                <div>
                  <Label>Compromiso de Tiempo</Label>
                  <p className="text-sm text-gray-700 mt-1">
                    {selectedVolunteer.timeCommitment}
                    {selectedVolunteer.hoursPerWeek && ` - ${selectedVolunteer.hoursPerWeek} horas/semana`}
                  </p>
                </div>

                {selectedVolunteer.additionalComments && (
                  <div>
                    <Label>Comentarios Adicionales</Label>
                    <p className="text-sm text-gray-700 mt-1">{selectedVolunteer.additionalComments}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <Label htmlFor="admin-notes">Notas del Administrador</Label>
                  <Textarea
                    id="admin-notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Agrega notas internas sobre este voluntario..."
                    rows={4}
                    className="mt-2"
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <div className="flex gap-2">
                    <Button variant="outline" asChild>
                      <a href={`mailto:${selectedVolunteer.email}`}>
                        <Mail className="w-4 h-4 mr-2" />
                        Enviar Email
                      </a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href={`tel:${selectedVolunteer.phone}`}>
                        <Phone className="w-4 h-4 mr-2" />
                        Llamar
                      </a>
                    </Button>
                  </div>
                  <Button onClick={handleSaveNotes}>
                    Guardar Notas
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar voluntario?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El registro del voluntario será eliminado permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </div>
  );
};

