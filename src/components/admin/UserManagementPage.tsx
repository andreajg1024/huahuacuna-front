import { useState, useEffect } from 'react';
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
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
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

interface User {
  id: string;
  nombre: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  foto?: string;
  fechaCreacion: string;
  phone?: string;
  documentId?: string;
  address?: string;
  emailVerified: boolean;
}

interface UserManagementPageProps {
  onNavigate: (page: string) => void;
}

export function UserManagementPage({ onNavigate }: UserManagementPageProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [newUserForm, setNewUserForm] = useState({
    nombre: '',
    email: '',
    password: '',
    phone: '',
    documentId: '',
    address: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const resp = await authService.listUsers();
      if (resp.success && Array.isArray(resp.data)) {
        const mapped: User[] = resp.data
          .filter((u: any) => u.role === 'PADRINO')
          .map((u: any) => ({
            id: String(u.id),
            nombre: u.name,
            email: u.email,
            role: 'padrino' as UserRole,
            status: (u.status === 'INACTIVE' ? 'inactive' : u.status === 'PENDING' ? 'pending' : 'active') as UserStatus,
            foto: u.avatar,
            fechaCreacion: new Date(u.createdAt).toISOString().split('T')[0],
            phone: u.phone,
            documentId: u.documentId,
            address: u.address,
            emailVerified: u.emailVerified || false,
          }));
        setUsers(mapped);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al listar usuarios';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateUser = async () => {
    if (!newUserForm.nombre || !newUserForm.email || !newUserForm.password) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      const dto = {
        name: newUserForm.nombre,
        email: newUserForm.email,
        password: newUserForm.password,
        phone: newUserForm.phone,
        documentId: newUserForm.documentId,
        address: newUserForm.address,
      };

      const resp = await authService.registerPadrino(dto);
      if (resp.success) {
        toast.success('Usuario creado exitosamente');
        setShowCreateDialog(false);
        setNewUserForm({
          nombre: '',
          email: '',
          password: '',
          phone: '',
          documentId: '',
          address: '',
        });
        fetchUsers();
      } else {
        toast.error(resp.error?.message || 'Error al crear usuario');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al crear usuario';
      toast.error(msg);
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      const resp = await authService.activateUser(Number(userId));
      if (resp.success) {
        toast.success('Usuario activado exitosamente');
        fetchUsers();
      } else {
        toast.error(resp.error?.message || 'Error al activar usuario');
      }
    } catch (err) {
      toast.error('Error al activar usuario');
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    try {
      const resp = await authService.deactivateUser(Number(userId));
      if (resp.success) {
        toast.success('Usuario desactivado exitosamente');
        fetchUsers();
      } else {
        toast.error(resp.error?.message || 'Error al desactivar usuario');
      }
    } catch (err) {
      toast.error('Error al desactivar usuario');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const resp = await authService.deleteUser(Number(userId));
      if (resp.success) {
        toast.success('Usuario eliminado exitosamente');
        fetchUsers();
      } else {
        toast.error(resp.error?.message || 'Error al eliminar usuario');
      }
    } catch (err) {
      toast.error('Error al eliminar usuario');
    }
  };

  const handleVerifyEmail = async (userId: string) => {
    toast.info('Función de verificación de email en desarrollo');
  };

  const stats = [
    { label: 'Total Usuarios', value: users.length.toString(), icon: UserCog, color: 'from-blue-400 to-blue-500' },
    { label: 'Activos', value: users.filter(u => u.status === 'active').length.toString(), icon: CheckCircle, color: 'from-green-400 to-green-500' },
    { label: 'Pendientes', value: users.filter(u => u.status === 'pending').length.toString(), icon: Shield, color: 'from-yellow-400 to-yellow-500' },
    { label: 'Inactivos', value: users.filter(u => u.status === 'inactive').length.toString(), icon: XCircle, color: 'from-red-400 to-red-500' },
  ];

  return (
    <div className="p-8">
      {/* Header with back button */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('super-admin')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-gray-900 mb-2">Gestión de Usuarios (Padrinos)</h1>
            <p className="text-gray-600">Crear, aprobar y administrar cuentas de padrinos</p>
          </div>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-500">
              <Plus className="w-4 h-4 mr-2" />
              Crear Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario (Padrino)</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Completo *</Label>
                <Input
                  id="nombre"
                  value={newUserForm.nombre}
                  onChange={(e) => setNewUserForm({ ...newUserForm, nombre: e.target.value })}
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="usuario@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                  placeholder="3001234567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="documentId">Documento</Label>
                <Input
                  id="documentId"
                  value={newUserForm.documentId}
                  onChange={(e) => setNewUserForm({ ...newUserForm, documentId: e.target.value })}
                  placeholder="123456789"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={newUserForm.address}
                  onChange={(e) => setNewUserForm({ ...newUserForm, address: e.target.value })}
                  placeholder="Calle 123 #45-67"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateUser}>
                Crear Usuario
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl text-gray-900 mb-1" style={{ fontWeight: 700 }}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Verificado</TableHead>
                  <TableHead>Fecha Registro</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <UserAvatar name={user.nombre} avatarUrl={user.foto} size="sm" />
                        <div>
                          <div className="font-medium text-gray-900">{user.nombre}</div>
                          <div className="text-sm text-gray-500">{user.documentId || 'Sin documento'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{user.email}</TableCell>
                    <TableCell className="text-gray-600">{user.phone || '-'}</TableCell>
                    <TableCell>
                      <StatusBadge status={user.status} />
                    </TableCell>
                    <TableCell>
                      {user.emailVerified ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </TableCell>
                    <TableCell className="text-gray-600">{user.fechaCreacion}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditDialog(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {user.status === 'active' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeactivateUser(user.id)}
                          >
                            <PowerOff className="w-4 h-4 text-red-500" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleActivateUser(user.id)}
                          >
                            <Power className="w-4 h-4 text-green-500" />
                          </Button>
                        )}
                        {!user.emailVerified && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVerifyEmail(user.id)}
                          >
                            <UserCheck className="w-4 h-4 text-blue-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
