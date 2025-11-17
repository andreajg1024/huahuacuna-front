import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Save, ArrowLeft } from 'lucide-react';

interface SystemSettingsPageProps {
  // Permite volver a otra vista del dashboard (por ejemplo 'dashboard')
  onNavigate: (page: string) => void;
}

/**
 * Página de configuración del sistema pensada para el SUPER ADMIN.
 * No persiste datos en backend (todo es local/mock), pero deja la UI lista
 * para conectar APIs en el futuro.
 */
export const SystemSettingsPage: React.FC<SystemSettingsPageProps> = ({ onNavigate }) => {
  const [maintenanceMode, setMaintenanceMode] = React.useState(false);
  const [allowNewSponsors, setAllowNewSponsors] = React.useState(true);
  const [allowNewVolunteers, setAllowNewVolunteers] = React.useState(true);
  const [defaultEmail, setDefaultEmail] = React.useState('contacto@huahuacuna.org');
  const [apiBaseUrl, setApiBaseUrl] = React.useState(process.env.NEXT_PUBLIC_API_BASE_URL ?? '');

  const handleSave = () => {
    // Aquí en el futuro se podría llamar a un endpoint de configuración.
    // Por ahora solo dejamos un console.log como referencia.
    // eslint-disable-next-line no-console
    console.log({ maintenanceMode, allowNewSponsors, allowNewVolunteers, defaultEmail, apiBaseUrl });
  };

  return (
    <div className="p-8 space-y-6">
      {/* Breadcrumb / Volver */}
      <button
        onClick={() => onNavigate('dashboard')}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-amber-600 mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al panel
      </button>

      {/* Título principal */}
      <div className="mb-4">
        <h1 className="text-3xl mb-2">Configuración del Sistema</h1>
        <p className="text-gray-600">
          Ajusta parámetros generales de la plataforma. Estos cambios afectan a todos los usuarios.
        </p>
      </div>

      {/* Configuración general */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-medium mb-2">Parámetros generales</h2>
          <Separator />

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900">Modo mantenimiento</p>
              <p className="text-sm text-gray-600">
                Muestra un mensaje de mantenimiento a los visitantes no autenticados.
              </p>
            </div>
            <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900">Aceptar nuevos padrinos</p>
              <p className="text-sm text-gray-600">
                Controla si el formulario de apadrinamiento está disponible.
              </p>
            </div>
            <Switch checked={allowNewSponsors} onCheckedChange={setAllowNewSponsors} />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900">Aceptar nuevos voluntarios</p>
              <p className="text-sm text-gray-600">
                Activa o desactiva las solicitudes de voluntariado.
              </p>
            </div>
            <Switch checked={allowNewVolunteers} onCheckedChange={setAllowNewVolunteers} />
          </div>
        </CardContent>
      </Card>

      {/* Comunicación y backend */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-medium mb-2">Comunicación y backend</h2>
          <Separator />

          <div className="space-y-2">
            <Label htmlFor="default-email">Correo de contacto público</Label>
            <Input
              id="default-email"
              type="email"
              value={defaultEmail}
              onChange={(e) => setDefaultEmail(e.target.value)}
              placeholder="correo@fundacion.org"
            />
            <p className="text-xs text-gray-500">
              Este correo se puede mostrar en el pie de página o formularios de contacto.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-base-url">NEXT_PUBLIC_API_BASE_URL</Label>
            <Input
              id="api-base-url"
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrl(e.target.value)}
              placeholder="https://api.tu-backend.com"
            />
            <p className="text-xs text-gray-500">
              URL base que usará el frontend para llamadas al backend. Se puede sobreescribir con variables de entorno.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          Guardar cambios (solo UI)
        </Button>
      </div>
    </div>
  );
};
