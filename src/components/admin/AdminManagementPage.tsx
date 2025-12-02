import { useState } from 'react';
import { authService } from '@/services/auth.service';
import {
  Search,
  Plus,
  Edit,
  Power,
  PowerOff,
  Loader2,
  Eye,
  Shield,
  UserCog,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Switch } from '../ui/switch';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { UserAvatar } from '../shared/UserAvatar';
import { RoleBadge } from '../shared/RoleBadge';
import { StatusBadge } from '../shared/StatusBadge';
import { useAuth, UserRole, UserStatus } from '../../contexts/AuthContext';
import { toast } from 'sonner';

interface Admin {
  id: string;
  nombre: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  foto?: string;
  fechaCreacion: string;
  permissions: string[];
  creadoPor: string;
}

interface AdminManagementPageProps {
  onNavigate: (page: string) => void;
}

export function AdminManagementPage({ onNavigate }: AdminManagementPageProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [deactivateReason, setDeactivateReason] = useState('');

  // Mock admin data
  const [admins, setAdmins] = useState<Admin[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [newAdminForm, setNewAdminForm] = useState({
    nombre: '',
    email: '',
    password: '',
    role: 'admin' as UserRole,
    permissions: [] as string[],
    status: 'active' as UserStatus,
  });

  const availablePermissions = [
    { id: 'usuarios', label: 'Gestión de Usuarios' },
    { id: 'ninos', label: 'Gestión de Niños' },
    { id: 'apadrinamientos', label: 'Apadrinamientos' },
    { id: 'eventos', label: 'Eventos' },
    { id: 'donaciones', label: 'Donaciones' },
    { id: 'bitacoras', label: 'Bitácoras' },
    { id: 'voluntariado', label: 'Voluntariado' },
  ];

  useEffect(() => {
    const fetchAdmins = async () => {
      if (user?.role !== 'super_admin') return;
      setIsLoading(true);
      try {
        const resp = await authService.listAdmins();
        if (resp.success && Array.isArray(resp.data)) {
          const mapped: Admin[] = resp.data.map((u: any) => ({
            id: String(u.id),
            nombre: u.name,
            email: u.email,
            role: (u.role === 'SUPER_ADMIN' ? 'super_admin' : 'admin') as UserRole,
            status: (u.status === 'INACTIVE' ? 'inactive' : 'active') as UserStatus,
            foto: u.avatar,
            fechaCreacion: new Date(u.createdAt).toISOString().split('T')[0],
            permissions: [],
            creadoPor: u.createdBy?.name || 'Sistema',
          }));
          setAdmins(mapped);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error al listar administradores';
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdmins();
  }, [user?.role]);

  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = admin.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || admin.role === filterRole;
    const matchesStatus = filterStatus === 'all' || admin.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateAdmin = async () => {
    // Validate role
    if (user?.role !== 'super_admin') {
      toast.error('Solo super-admins pueden crear administradores');
      return;
    }

    // Validate form
    if (!newAdminForm.nombre || !newAdminForm.email || !newAdminForm.password) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      const dto = {
        name: newAdminForm.nombre,
        email: newAdminForm.email,
        password: newAdminForm.password,
        role: newAdminForm.role === 'super_admin' ? 'SUPER_ADMIN' : 'ADMIN',
      } as const;

      const resp = await authService.createAdmin(dto);

      if (resp.success && resp.data) {
        // Map API user to Admin row
        const apiUser = resp.data as any;
        const mapped: Admin = {
          id: String(apiUser.id || `${admins.length + 1}`),
          nombre: apiUser.name || newAdminForm.nombre,
          email: apiUser.email || newAdminForm.email,
          role: (apiUser.role === 'SUPER_ADMIN' ? 'super_admin' : apiUser.role === 'ADMIN' ? 'admin' : 'admin') as UserRole,
          status: (apiUser.status === 'INACTIVE' ? 'inactive' : 'active') as UserStatus,
          foto: apiUser.avatar,
          fechaCreacion: (apiUser.createdAt ? new Date(apiUser.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
          permissions: [],
          creadoPor: user?.nombre || 'Super Admin',
        };

        setAdmins([...admins, mapped]);
        toast.success('Administrador creado exitosamente');
        setShowCreateDialog(false);
        setNewAdminForm({
          nombre: '',
          email: '',
          password: '',
          role: 'admin',
          permissions: [],
          status: 'active',
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear administrador';
      toast.error(message);
    }
  };

  const handleEditAdmin = async () => {
    if (!selectedAdmin) return;

    await new Promise(resolve => setTimeout(resolve, 1000));

    setAdmins(admins.map(admin =>
      admin.id === selectedAdmin.id ? selectedAdmin : admin
    ));

    toast.success('Administrador actualizado correctamente');
    setShowEditDialog(false);
    setSelectedAdmin(null);
  };

  const handleToggleStatus = async (admin: Admin) => {
    setSelectedAdmin(admin);
    setShowDeactivateDialog(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedAdmin) return;

    await new Promise(resolve => setTimeout(resolve, 1000));

    const newStatus: UserStatus = selectedAdmin.status === 'active' ? 'inactive' : 'active';

    setAdmins(admins.map(admin =>
      admin.id === selectedAdmin.id
        ? { ...admin, status: newStatus }
        : admin
    ));

    toast.success(`Administrador ${newStatus === 'active' ? 'activado' : 'desactivado'} correctamente`);
    setShowDeactivateDialog(false);
    setSelectedAdmin(null);
    setDeactivateReason('');
  };

  const handlePermissionToggle = (permissionId: string) => {
    if (!selectedAdmin) return;

    const newPermissions = selectedAdmin.permissions.includes(permissionId)
      ? selectedAdmin.permissions.filter(p => p !== permissionId)
      : [...selectedAdmin.permissions, permissionId];

    setSelectedAdmin({ ...selectedAdmin, permissions: newPermissions });
  };

  const auditLog = [
    {
      fecha: '2024-01-28 14:30',
      accion: 'Creado',
      usuario: 'María González',
      realizadoPor: 'Admin Principal',
      detalles: 'Nuevo administrador con permisos limitados',
    },
    {
      fecha: '2024-01-25 10:15',
      accion: 'Editado',
      usuario: 'Carlos Ramírez',
      realizadoPor: 'Admin Principal',
      detalles: 'Actualización de permisos',
    },
    {
      fecha: '2024-01-20 16:45',
      accion: 'Desactivado',
      usuario: 'Ana López',
      realizadoPor: 'Admin Principal',
      detalles: 'Inactividad prolongada',
    },
  ];

  return (
    <div className="p-8">
      {/* Back button */}
      <button
        onClick={() => onNavigate('super-admin')}
        className="mb-4 text-sm text-gray-600 hover:text-blue-600 flex items-center gap-2"
      >
        ← Volver al panel
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Gestión de Administradores</h1>
        <p className="text-gray-600">Crear y gestionar cuentas de administradores del sistema</p>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">Lista de Administradores</TabsTrigger>
          <TabsTrigger value="audit">Registro de Auditoría</TabsTrigger>
        </TabsList>

        {/* Admin List Tab */}
        <TabsContent value="list" className="space-y-6">
          {/* Filters and Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Buscar por nombre o email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Filters */}
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="Filtrar por rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los roles</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>

                {/* Create Button */}
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Administrador
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Crear Nuevo Administrador</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="nombre">Nombre Completo *</Label>
                          <Input
                            id="nombre"
                            value={newAdminForm.nombre}
                            onChange={(e) => setNewAdminForm({ ...newAdminForm, nombre: e.target.value })}
                            placeholder="Juan Pérez"
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newAdminForm.email}
                            onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                            placeholder="juan@huahuacuna.org"
                            className="mt-2"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="password">Contraseña *</Label>
                          <Input
                            id="password"
                            type="password"
                            value={newAdminForm.password}
                            onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                            placeholder="AdminPass123"
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="role">Rol *</Label>
                          <Select
                            value={newAdminForm.role}
                            onValueChange={(value: UserRole) => setNewAdminForm({ ...newAdminForm, role: value })}
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="super_admin">Super Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="status">Estado Inicial *</Label>
                          <Select
                            value={newAdminForm.status}
                            onValueChange={(value: UserStatus) => setNewAdminForm({ ...newAdminForm, status: value })}
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Activo</SelectItem>
                              <SelectItem value="inactive">Inactivo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label className="mb-3 block">Permisos</Label>
                        <div className="grid grid-cols-2 gap-3">
                          {availablePermissions.map(permission => (
                            <div key={permission.id} className="flex items-center gap-2">
                              <Checkbox
                                id={`new-${permission.id}`}
                                checked={newAdminForm.permissions.includes(permission.id)}
                                onCheckedChange={(checked) => {
                                  setNewAdminForm({
                                    ...newAdminForm,
                                    permissions: checked
                                      ? [...newAdminForm.permissions, permission.id]
                                      : newAdminForm.permissions.filter(p => p !== permission.id),
                                  });
                                }}
                              />
                              <Label htmlFor={`new-${permission.id}`} className="cursor-pointer text-sm">
                                {permission.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                          ℹ️ Se generará una contraseña temporal y se enviará por email al nuevo administrador.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={handleCreateAdmin}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Crear Administrador
                        </Button>
                        <Button
                          onClick={() => setShowCreateDialog(false)}
                          variant="outline"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Admin Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Administrador</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha Creación</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAdmins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <UserAvatar name={admin.nombre} photo={admin.foto} size="sm" />
                            <span>{admin.nombre}</span>
                          </div>
                        </TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>
                          <RoleBadge role={admin.role} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={admin.status} />
                        </TableCell>
                        <TableCell>
                          {new Date(admin.fechaCreacion).toLocaleDateString('es-CO')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedAdmin(admin);
                                setShowEditDialog(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(admin)}
                              className={admin.status === 'active' ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}
                            >
                              {admin.status === 'active' ? (
                                <PowerOff className="w-4 h-4" />
                              ) : (
                                <Power className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredAdmins.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No se encontraron administradores</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-gray-900 mb-6">Registro de Auditoría</h3>
              <div className="space-y-4">
                {auditLog.map((log, index) => (
                  <div key={index} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-900">{log.accion}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-700">{log.usuario}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{log.detalles}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>{log.fecha}</span>
                        <span>•</span>
                        <span>Por: {log.realizadoPor}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Admin Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Administrador</DialogTitle>
          </DialogHeader>
          {selectedAdmin && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-nombre">Nombre Completo</Label>
                  <Input
                    id="edit-nombre"
                    value={selectedAdmin.nombre}
                    onChange={(e) => setSelectedAdmin({ ...selectedAdmin, nombre: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-500" />
                    Email (no editable)
                  </Label>
                  <Input
                    value={selectedAdmin.email}
                    disabled
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-role">Rol</Label>
                  <Select
                    value={selectedAdmin.role}
                    onValueChange={(value: UserRole) => setSelectedAdmin({ ...selectedAdmin, role: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-status">Estado</Label>
                  <Select
                    value={selectedAdmin.status}
                    onValueChange={(value: UserStatus) => setSelectedAdmin({ ...selectedAdmin, status: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Permisos</Label>
                <div className="grid grid-cols-2 gap-3">
                  {availablePermissions.map(permission => (
                    <div key={permission.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`edit-${permission.id}`}
                        checked={selectedAdmin.permissions.includes(permission.id)}
                        onCheckedChange={() => handlePermissionToggle(permission.id)}
                      />
                      <Label htmlFor={`edit-${permission.id}`} className="cursor-pointer text-sm">
                        {permission.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleEditAdmin}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
                <Button
                  onClick={() => {
                    setShowEditDialog(false);
                    setSelectedAdmin(null);
                  }}
                  variant="outline"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Deactivate/Activate Confirmation Dialog */}
      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedAdmin?.status === 'active' ? 'Desactivar' : 'Activar'} Administrador
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas {selectedAdmin?.status === 'active' ? 'desactivar' : 'activar'} a{' '}
              <strong>{selectedAdmin?.nombre}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedAdmin?.status === 'active' && (
            <div className="my-4">
              <Label htmlFor="reason">Motivo (opcional)</Label>
              <Input
                id="reason"
                value={deactivateReason}
                onChange={(e) => setDeactivateReason(e.target.value)}
                placeholder="Ej: Inactividad prolongada"
                className="mt-2"
              />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

