/**
 * Ejemplo de Uso del Hook useActivityLogs
 * 
 * Demuestra cómo usar el hook para crear y consultar activity logs
 */

import { useState, useEffect } from 'react';
import { useActivityLogs } from '@/hooks';
import { ActivityType } from '@/types/api.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ActivityLogsExample() {
  const {
    loading,
    error,
    createActivityLog,
    logChildUpdate,
    logSponsorshipCreated,
    getActivitiesByChild,
    getActivitiesBySponsorship,
    getRecentActivities,
  } = useActivityLogs();

  const [activities, setActivities] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  // ============================================================================
  // CREAR ACTIVITY LOG GENÉRICO
  // ============================================================================
  const ExampleCreateLog = () => {
    const [type, setType] = useState<ActivityType>(ActivityType.GENERAL_UPDATE);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [childId, setChildId] = useState('');

    const handleSubmit = async () => {
      const result = await createActivityLog(
        type,
        title,
        description,
        {
          childId: childId ? parseInt(childId) : undefined,
          metadata: {
            source: 'manual_entry',
            timestamp: new Date().toISOString(),
          },
        }
      );

      if (result.success) {
        console.log('Log creado:', result.data);
        setTitle('');
        setDescription('');
        setChildId('');
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>Crear Activity Log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Tipo de Actividad
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ActivityType)}
              className="w-full border rounded px-3 py-2"
            >
              {Object.values(ActivityType).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Título (5-200 caracteres)
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Actualización de datos"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {title.length}/200 caracteres
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Descripción (10-1000 caracteres)
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción detallada de la actividad..."
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {description.length}/1000 caracteres
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              ID del Niño (opcional)
            </label>
            <Input
              type="number"
              value={childId}
              onChange={(e) => setChildId(e.target.value)}
              placeholder="Ej: 123"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading || title.length < 5 || description.length < 10}
            className="w-full"
          >
            {loading ? 'Creando...' : 'Crear Activity Log'}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  // ============================================================================
  // HELPERS ESPECÍFICOS
  // ============================================================================
  const ExampleHelpers = () => {
    const handleLogChildUpdate = async () => {
      const result = await logChildUpdate(
        123,
        'Información actualizada',
        'Se actualizó la dirección y teléfono del niño',
        { field: 'contact_info' }
      );

      if (result.success) {
        console.log('Log de actualización creado');
      }
    };

    const handleLogSponsorship = async () => {
      const result = await logSponsorshipCreated(
        456, // sponsorshipId
        123, // childId
        'Juan Pérez',
        'María García',
        { notes: 'Primera reunión programada' }
      );

      if (result.success) {
        console.log('Log de apadrinamiento creado');
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>Helpers Específicos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={handleLogChildUpdate}
            disabled={loading}
            className="w-full"
          >
            Log: Actualización de Niño
          </Button>

          <Button
            onClick={handleLogSponsorship}
            disabled={loading}
            className="w-full"
          >
            Log: Apadrinamiento Creado
          </Button>

          <p className="text-sm text-gray-600 mt-4">
            Los helpers crean logs con formatos predefinidos para casos comunes.
          </p>
        </CardContent>
      </Card>
    );
  };

  // ============================================================================
  // VER ACTIVIDADES DE UN NIÑO
  // ============================================================================
  const ExampleChildActivities = () => {
    const [childId, setChildId] = useState('');

    const handleLoad = async () => {
      if (!childId) return;

      const result = await getActivitiesByChild(parseInt(childId), 1, 10);

      if (result.success) {
        setActivities(result.data);
        console.log('Paginación:', result.pagination);
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividades de un Niño</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="number"
              value={childId}
              onChange={(e) => setChildId(e.target.value)}
              placeholder="ID del niño"
            />
            <Button onClick={handleLoad} disabled={loading || !childId}>
              Cargar
            </Button>
          </div>

          {loading && <p className="text-sm text-gray-500">Cargando...</p>}

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="border p-3 rounded-lg bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{activity.type}</Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm">{activity.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.description}
                    </p>
                    {activity.performedByName && (
                      <p className="text-xs text-gray-500 mt-1">
                        Por: {activity.performedByName}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {activities.length === 0 && !loading && (
              <p className="text-center text-gray-500 text-sm py-4">
                No hay actividades para mostrar
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // ============================================================================
  // VER ACTIVIDADES RECIENTES
  // ============================================================================
  const ExampleRecentActivities = () => {
    const [filterType, setFilterType] = useState<ActivityType | undefined>();

    useEffect(() => {
      loadRecentActivities();
    }, []);

    const loadRecentActivities = async () => {
      const result = await getRecentActivities(1, 10, filterType);

      if (result.success) {
        setRecentActivities(result.data);
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividades Recientes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <select
              value={filterType || ''}
              onChange={(e) => setFilterType(e.target.value as ActivityType || undefined)}
              className="flex-1 border rounded px-3 py-2 text-sm"
            >
              <option value="">Todos los tipos</option>
              {Object.values(ActivityType).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <Button onClick={loadRecentActivities} disabled={loading}>
              Filtrar
            </Button>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="border-l-4 border-blue-500 pl-3 py-2 bg-blue-50"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge>{activity.type}</Badge>
                  <span className="text-xs text-gray-600">
                    {new Date(activity.createdAt).toLocaleString()}
                  </span>
                </div>
                <h4 className="font-semibold text-sm">{activity.title}</h4>
                <p className="text-sm text-gray-700 mt-1">
                  {activity.description.substring(0, 100)}
                  {activity.description.length > 100 && '...'}
                </p>
              </div>
            ))}

            {recentActivities.length === 0 && !loading && (
              <p className="text-center text-gray-500 py-4">
                No hay actividades recientes
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-6">
        Ejemplo de Hook useActivityLogs
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crear Log */}
        <ExampleCreateLog />

        {/* Helpers */}
        <ExampleHelpers />

        {/* Actividades de Niño */}
        <ExampleChildActivities />

        {/* Actividades Recientes */}
        <ExampleRecentActivities />
      </div>

      {/* Info Box */}
      <Card className="bg-green-50">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-green-900 mb-3">
            ℹ️ Funcionalidades del Hook useActivityLogs
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-green-800 mb-2">Crear Logs:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>✅ createActivityLog - Log genérico</li>
                <li>✅ logChildUpdate - Actualización de niño</li>
                <li>✅ logSponsorshipCreated - Nuevo apadrinamiento</li>
                <li>✅ logSponsorshipCancelled - Cancelación</li>
                <li>✅ logBitacoraEntry - Nueva entrada</li>
                <li>✅ logMessageSent - Mensaje enviado</li>
                <li>✅ logChildRegistered - Niño registrado</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-800 mb-2">Consultar Logs:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>✅ getActivitiesByChild - Por niño</li>
                <li>✅ getActivitiesBySponsorship - Por apadrinamiento</li>
                <li>✅ getRecentActivities - Actividades recientes</li>
                <li>✅ Paginación incluida</li>
                <li>✅ Filtros por tipo</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
