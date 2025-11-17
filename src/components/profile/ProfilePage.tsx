import { useState } from 'react';
import { Camera, Lock, Save, X, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAuth } from '../../contexts/AuthContext';
import { UserAvatar } from '../shared/UserAvatar';
import { toast } from 'sonner';

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [formData, setFormData] = useState({
    telefono: user?.telefono || '',
    direccion: user?.direccion || '',
    fechaNacimiento: '',
    foto: user?.foto || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    whatsapp: true,
    bitacoras: true,
    eventos: true,
    donaciones: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        telefono: formData.telefono,
        direccion: formData.direccion,
        foto: formData.foto,
      });
      toast.success('Perfil actualizado correctamente');
      setIsEditing(false);
    } catch (error) {
      toast.error('Error al actualizar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      telefono: user?.telefono || '',
      direccion: user?.direccion || '',
      fechaNacimiento: '',
      foto: user?.foto || '',
    });
    setIsEditing(false);
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    // Simulate password change
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Contraseña actualizada correctamente');
    setShowChangePassword(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handlePhotoUpload = () => {
    // In a real app, this would open a file picker and upload the image
    toast.info('Funcionalidad de carga de foto próximamente');
  };

  if (!user) return null;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Mi Perfil</h1>
        <p className="text-gray-600">Gestiona tu información personal y preferencias</p>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="personal">Información Personal</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal">
          <Card>
            <CardContent className="p-8">
              {/* Profile Photo Section */}
              <div className="flex flex-col items-center mb-8 pb-8 border-b border-gray-200">
                <div className="relative group">
                  <UserAvatar 
                    name={user.nombre}
                    photo={formData.foto}
                    size="xl"
                  />
                  {isEditing && (
                    <button
                      onClick={handlePhotoUpload}
                      className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <Camera className="w-6 h-6 text-white" />
                    </button>
                  )}
                </div>
                <h2 className="text-gray-900 mt-4 mb-1">{user.nombre}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>

              {/* Form */}
              <div className="space-y-6">
                {/* Read-only fields */}
                <div className="grid md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="flex items-center gap-2 text-gray-500">
                      <Lock className="w-4 h-4" />
                      Nombre Completo
                    </Label>
                    <Input
                      value={user.nombre}
                      disabled
                      className="mt-2 bg-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">No editable</p>
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 text-gray-500">
                      <Lock className="w-4 h-4" />
                      Email
                    </Label>
                    <Input
                      value={user.email}
                      disabled
                      className="mt-2 bg-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">No editable</p>
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 text-gray-500">
                      <Lock className="w-4 h-4" />
                      Documento de Identidad
                    </Label>
                    <Input
                      value={user.documento}
                      disabled
                      className="mt-2 bg-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">No editable</p>
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 text-gray-500">
                      <Lock className="w-4 h-4" />
                      Fecha de Registro
                    </Label>
                    <Input
                      value={new Date(user.fechaRegistro).toLocaleDateString('es-CO')}
                      disabled
                      className="mt-2 bg-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">No editable</p>
                  </div>
                </div>

                {/* Editable fields */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="+57 321 456 7890"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="fechaNacimiento">Fecha de Nacimiento (opcional)</Label>
                    <Input
                      id="fechaNacimiento"
                      name="fechaNacimiento"
                      type="date"
                      value={formData.fechaNacimiento}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="direccion">Dirección</Label>
                  <Textarea
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={3}
                    className="mt-2"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white"
                    >
                      Editar Perfil
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Guardar Cambios
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        disabled={isSaving}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="space-y-6">
            {/* Change Password Card */}
            <Card>
              <CardContent className="p-8">
                <h3 className="text-gray-900 mb-4">Seguridad de la Cuenta</h3>
                <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-gray-300">
                      <Lock className="w-4 h-4 mr-2" />
                      Cambiar Contraseña
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cambiar Contraseña</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="currentPassword">Contraseña Actual</Label>
                        <div className="relative mt-2">
                          <Input
                            id="currentPassword"
                            type={showPasswords.current ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                          >
                            {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="newPassword">Nueva Contraseña</Label>
                        <div className="relative mt-2">
                          <Input
                            id="newPassword"
                            type={showPasswords.new ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                          >
                            {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                        <div className="relative mt-2">
                          <Input
                            id="confirmPassword"
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                          >
                            {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={handleChangePassword}
                          className="bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Actualizar
                        </Button>
                        <Button
                          onClick={() => setShowChangePassword(false)}
                          variant="outline"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Notifications Card */}
            <Card>
              <CardContent className="p-8">
                <h3 className="text-gray-900 mb-6">Preferencias de Notificaciones</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-gray-900 mb-4">Canales de Comunicación</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-900">Notificaciones por Email</p>
                          <p className="text-sm text-gray-500">Recibir actualizaciones por correo electrónico</p>
                        </div>
                        <Switch
                          checked={notifications.email}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-900">Notificaciones por SMS</p>
                          <p className="text-sm text-gray-500">Recibir mensajes de texto importantes</p>
                        </div>
                        <Switch
                          checked={notifications.sms}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, sms: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-900">Notificaciones por WhatsApp</p>
                          <p className="text-sm text-gray-500">Recibir actualizaciones por WhatsApp</p>
                        </div>
                        <Switch
                          checked={notifications.whatsapp}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, whatsapp: checked }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h4 className="text-gray-900 mb-4">Tipo de Notificaciones</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-900">Actualizaciones de Bitácoras</p>
                          <p className="text-sm text-gray-500">Cuando se publique una nueva bitácora</p>
                        </div>
                        <Switch
                          checked={notifications.bitacoras}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, bitacoras: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-900">Invitaciones a Eventos</p>
                          <p className="text-sm text-gray-500">Recibir invitaciones a actividades</p>
                        </div>
                        <Switch
                          checked={notifications.eventos}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, eventos: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-900">Recordatorios de Donaciones</p>
                          <p className="text-sm text-gray-500">Recordatorios mensuales de aportes</p>
                        </div>
                        <Switch
                          checked={notifications.donaciones}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, donaciones: checked }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <Button
                      onClick={() => toast.success('Preferencias guardadas correctamente')}
                      className="bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Preferencias
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

