import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Mail, Phone, MapPin, Calendar, Clock, FileText,
  User, CheckCircle2, XCircle, Edit, Download,
  MessageSquare, PhoneCall, Video, ExternalLink
} from 'lucide-react';
import { useVolunteering, type VolunteerApplication, type VolunteerStatus } from '../../contexts/VolunteeringContext';
import { toast } from 'sonner';

interface VolunteerDetailViewProps {
  volunteer: VolunteerApplication;
  onClose: () => void;
}

const STATUS_OPTIONS = [
  { value: 'pendiente_revision', label: 'Pendiente de Revisión' },
  { value: 'en_revision', label: 'En Revisión' },
  { value: 'contactado', label: 'Contactado' },
  { value: 'aprobado', label: 'Aprobado' },
  { value: 'rechazado', label: 'Rechazado' },
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' }
];

export const VolunteerDetailView: React.FC<VolunteerDetailViewProps> = ({ volunteer, onClose }) => {
  const { changeStatus, updateApplication } = useVolunteering();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<VolunteerStatus>(volunteer.status);
  const [statusNotes, setStatusNotes] = useState('');
  const [adminNotes, setAdminNotes] = useState(volunteer.notasInternas || '');

  const handleStatusChange = () => {
    if (newStatus === volunteer.status) {
      toast.info('El estado no ha cambiado');
      setShowStatusModal(false);
      return;
    }

    changeStatus(volunteer.id, newStatus, statusNotes, 'Admin User');
    toast.success('Estado actualizado exitosamente');
    setShowStatusModal(false);
    setStatusNotes('');
    onClose();
  };

  const handleApprove = () => {
    changeStatus(volunteer.id, 'aprobado', 'Aprobado automáticamente', 'Admin User');
    toast.success('Voluntario aprobado');
    onClose();
  };

  const handleReject = () => {
    setNewStatus('rechazado');
    setShowStatusModal(true);
  };

  const handleSaveNotes = () => {
    updateApplication(volunteer.id, { notasInternas: adminNotes });
    toast.success('Notas guardadas');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div>
      <DialogHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <DialogTitle className="text-2xl">{volunteer.nombreCompleto}</DialogTitle>
            <p className="text-gray-600 mt-1">Solicitud: {volunteer.id}</p>
          </div>
          <Badge className="text-lg px-4 py-1">
            {STATUS_OPTIONS.find(s => s.value === volunteer.status)?.label}
          </Badge>
        </div>
      </DialogHeader>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="volunteering">Voluntariado</TabsTrigger>
              <TabsTrigger value="availability">Disponibilidad</TabsTrigger>
              <TabsTrigger value="documents">Documentos</TabsTrigger>
            </TabsList>

            {/* Tab 1 - Personal Info */}
            <TabsContent value="personal" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-6 mb-6">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={volunteer.foto} />
                      <AvatarFallback className="text-2xl">{getInitials(volunteer.nombreCompleto)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl mb-4">Datos Personales</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Tipo de Documento</p>
                          <p>{volunteer.tipoDocumento}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Número</p>
                          <p>{volunteer.numeroDocumento}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Fecha de Nacimiento</p>
                          <p>{formatDate(volunteer.fechaNacimiento)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Edad</p>
                          <p>{volunteer.edad} años</p>
                        </div>
                        {volunteer.genero && (
                          <div>
                            <p className="text-sm text-gray-600">Género</p>
                            <p>{volunteer.genero}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <h3 className="text-xl mb-4">Contacto</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <a href={`mailto:${volunteer.email}`} className="text-[#4A9D5F] hover:underline">
                          {volunteer.email}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Teléfono</p>
                        <a href={`tel:${volunteer.telefono}`} className="text-[#4A9D5F] hover:underline">
                          {volunteer.telefono}
                        </a>
                      </div>
                    </div>
                    {volunteer.whatsapp && volunteer.whatsapp !== volunteer.telefono && (
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">WhatsApp</p>
                          <a href={`https://wa.me/${volunteer.whatsapp}`} className="text-[#4A9D5F] hover:underline">
                            {volunteer.whatsapp}
                          </a>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Dirección</p>
                        <p>{volunteer.direccion}</p>
                        <p className="text-sm text-gray-500">{volunteer.ciudad}, {volunteer.departamento}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2 - Volunteering Info */}
            <TabsContent value="volunteering" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl mb-4">Áreas de Interés</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {volunteer.areasInteres.map((area, idx) => (
                      <Badge key={idx} variant="secondary" className="text-sm px-3 py-1">
                        {area}
                      </Badge>
                    ))}
                  </div>

                  <Separator className="my-6" />

                  <h3 className="text-xl mb-4">Habilidades y Experiencia</h3>
                  <div className="p-4 bg-gray-50 rounded-lg mb-6">
                    <p className="text-gray-700 whitespace-pre-wrap">{volunteer.habilidades}</p>
                  </div>

                  {volunteer.experienciaPrevia && (
                    <>
                      <h3 className="text-xl mb-4">Experiencia Previa como Voluntario</h3>
                      <div className="p-4 bg-blue-50 rounded-lg mb-6">
                        <p className="text-gray-700 whitespace-pre-wrap">{volunteer.experienciaPrevia}</p>
                      </div>
                    </>
                  )}

                  <h3 className="text-xl mb-4">Motivación</h3>
                  <div className="p-4 bg-green-50 border-l-4 border-[#4A9D5F] rounded">
                    <p className="text-gray-700 whitespace-pre-wrap">{volunteer.motivacion}</p>
                  </div>

                  {volunteer.queEsperaAportar && (
                    <>
                      <Separator className="my-6" />
                      <h3 className="text-xl mb-4">Qué Espera Aportar</h3>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">{volunteer.queEsperaAportar}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3 - Availability */}
            <TabsContent value="availability" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl mb-4">Días Disponibles</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {volunteer.diasDisponibles.map((dia, idx) => (
                      <Badge key={idx} variant="outline" className="px-4 py-2">
                        {dia}
                      </Badge>
                    ))}
                  </div>

                  <Separator className="my-6" />

                  <h3 className="text-xl mb-4">Horarios Disponibles</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {volunteer.horariosDisponibles.map((horario, idx) => (
                      <Badge key={idx} variant="outline" className="px-4 py-2">
                        {horario}
                      </Badge>
                    ))}
                  </div>

                  <Separator className="my-6" />

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Horas por Semana</p>
                      <p className="text-2xl">{volunteer.horasPorSemana} horas</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Compromiso de Tiempo</p>
                      <p className="text-2xl">{volunteer.compromisoTiempo}</p>
                    </div>
                  </div>

                  {volunteer.fechaInicioPreferida && (
                    <>
                      <Separator className="my-6" />
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Fecha de Inicio Preferida</p>
                          <p>{formatDate(volunteer.fechaInicioPreferida)}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {volunteer.restriccionesHorario && (
                    <>
                      <Separator className="my-6" />
                      <h3 className="text-xl mb-4">Restricciones de Horario</h3>
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <p className="text-gray-700">{volunteer.restriccionesHorario}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 4 - Documents & References */}
            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl mb-4">Referencias Personales</h3>
                  {volunteer.referencias.map((ref, idx) => (
                    <Card key={idx} className="mb-4">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-medium">{ref.nombre}</p>
                            <p className="text-sm text-gray-600">{ref.relacion}</p>
                          </div>
                          {ref.verificado && (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Verificado
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <a href={`tel:${ref.telefono}`} className="text-[#4A9D5F] hover:underline">
                              {ref.telefono}
                            </a>
                          </div>
                          {ref.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <a href={`mailto:${ref.email}`} className="text-[#4A9D5F] hover:underline">
                                {ref.email}
                              </a>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Separator className="my-6" />

                  <h3 className="text-xl mb-4">Documentos</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-red-600" />
                        <div>
                          <p className="font-medium">Hoja de Vida / CV</p>
                          <p className="text-sm text-gray-600">PDF</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={volunteer.cvUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Ver
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <a href={volunteer.cvUrl} download>
                            <Download className="w-4 h-4 mr-1" />
                            Descargar
                          </a>
                        </Button>
                      </div>
                    </div>

                    {volunteer.cartaMotivacionUrl && (
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-blue-600" />
                          <div>
                            <p className="font-medium">Carta de Motivación</p>
                            <p className="text-sm text-gray-600">PDF</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <a href={volunteer.cartaMotivacionUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Ver
                            </a>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <a href={volunteer.cartaMotivacionUrl} download>
                              <Download className="w-4 h-4 mr-1" />
                              Descargar
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {volunteer.comoSeEntero && (
                    <>
                      <Separator className="my-6" />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">¿Cómo se enteró?</p>
                        <p>{volunteer.comoSeEntero}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="mb-4">Acciones Rápidas</h3>
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => setShowStatusModal(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Cambiar Estado
                </Button>
                
                <Button 
                  className="w-full bg-[#4A9D5F] hover:bg-[#3B7D4D]"
                  onClick={handleApprove}
                  disabled={volunteer.status === 'aprobado' || volunteer.status === 'activo'}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Aprobar
                </Button>

                <Button 
                  className="w-full"
                  variant="destructive"
                  onClick={handleReject}
                  disabled={volunteer.status === 'rechazado'}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rechazar
                </Button>

                <Separator className="my-4" />

                <Button className="w-full" variant="outline" asChild>
                  <a href={`mailto:${volunteer.email}`}>
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar Email
                  </a>
                </Button>

                <Button className="w-full" variant="outline" asChild>
                  <a href={`tel:${volunteer.telefono}`}>
                    <PhoneCall className="w-4 h-4 mr-2" />
                    Llamar
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="mb-4">Información</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Fecha de Solicitud</p>
                  <p>{formatDate(volunteer.fechaSolicitud)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Última Actualización</p>
                  <p>{formatDate(volunteer.ultimaActualizacion)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Días desde solicitud</p>
                  <p>{Math.floor((Date.now() - new Date(volunteer.fechaSolicitud).getTime()) / (1000 * 60 * 60 * 24))} días</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="mb-4">Notas Internas</h3>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Agrega notas sobre este voluntario..."
                rows={4}
              />
              <Button className="w-full mt-2" size="sm" onClick={handleSaveNotes}>
                Guardar Notas
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Change Modal */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Estado del Voluntario</DialogTitle>
            <DialogDescription>
              Actualiza el estado de la solicitud y agrega notas si es necesario
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="newStatus">Nuevo Estado</Label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as VolunteerStatus)}>
                <SelectTrigger id="newStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="statusNotes">Notas / Motivo</Label>
              <Textarea
                id="statusNotes"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Agrega notas sobre el cambio de estado..."
                rows={4}
              />
            </div>

            {(newStatus === 'aprobado' || newStatus === 'rechazado') && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-900">
                  Se enviará un email automático al voluntario notificándole el cambio de estado
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleStatusChange} className="bg-[#4A9D5F] hover:bg-[#3B7D4D]">
              Actualizar Estado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
