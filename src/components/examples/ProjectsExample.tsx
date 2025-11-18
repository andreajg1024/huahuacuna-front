/**
 * Ejemplo de Uso del Hook useProjects
 * 
 * Demuestra cómo usar el hook para gestionar proyectos
 */

import { useState, useEffect } from 'react';
import { useProjects } from '@/hooks';
import { ProjectStatus, ProjectType } from '@/types/api.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ProjectsExample() {
  const {
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    listProjects,
    getProjectById,
    addChildToProject,
    removeChildFromProject,
    updateProjectStatus,
  } = useProjects();

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  // ============================================================================
  // CREAR PROYECTO
  // ============================================================================
  const ExampleCreateProject = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<ProjectType>(ProjectType.EDUCATION);
    const [budget, setBudget] = useState('');
    const [location, setLocation] = useState('');

    const handleSubmit = async () => {
      const result = await createProject(
        name,
        description,
        type,
        {
          status: ProjectStatus.PLANNED,
          budget: budget ? parseFloat(budget) : undefined,
          location: location || undefined,
          objectives: [
            'Mejorar la calidad educativa',
            'Aumentar la asistencia escolar',
          ],
        }
      );

      if (result.success) {
        console.log('Proyecto creado:', result.data);
        setName('');
        setDescription('');
        setBudget('');
        setLocation('');
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>Crear Proyecto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Nombre del Proyecto (3-200 caracteres)
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Mejora de Infraestructura Escolar"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {name.length}/200
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Descripción (10-2000 caracteres)
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción detallada del proyecto..."
              rows={4}
              maxLength={2000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {description.length}/2000
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Tipo de Proyecto
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ProjectType)}
              className="w-full border rounded px-3 py-2"
            >
              {Object.values(ProjectType).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Presupuesto (opcional)
              </label>
              <Input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Ej: 50000"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Ubicación (opcional)
              </label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej: Armenia, Quindío"
              />
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading || name.length < 3 || description.length < 10}
            className="w-full"
          >
            {loading ? 'Creando...' : 'Crear Proyecto'}
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
  // LISTAR PROYECTOS
  // ============================================================================
  const ExampleListProjects = () => {
    const [filterStatus, setFilterStatus] = useState<ProjectStatus | undefined>();
    const [filterType, setFilterType] = useState<ProjectType | undefined>();

    useEffect(() => {
      loadProjects();
    }, []);

    const loadProjects = async () => {
      const result = await listProjects(1, 10, {
        status: filterStatus,
        type: filterType,
      });

      if (result.success) {
        setProjects(result.data);
        console.log('Paginación:', result.pagination);
      }
    };

    const handleFilter = () => {
      loadProjects();
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>Lista de Proyectos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="flex gap-2">
            <select
              value={filterStatus || ''}
              onChange={(e) => setFilterStatus(e.target.value as ProjectStatus || undefined)}
              className="flex-1 border rounded px-3 py-2 text-sm"
            >
              <option value="">Todos los estados</option>
              {Object.values(ProjectStatus).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={filterType || ''}
              onChange={(e) => setFilterType(e.target.value as ProjectType || undefined)}
              className="flex-1 border rounded px-3 py-2 text-sm"
            >
              <option value="">Todos los tipos</option>
              {Object.values(ProjectType).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <Button onClick={handleFilter} disabled={loading} size="sm">
              Filtrar
            </Button>
          </div>

          {loading && <p className="text-sm text-gray-500">Cargando...</p>}

          {/* Lista de proyectos */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {projects.map((project) => (
              <div
                key={project.id}
                className="border p-4 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{project.name}</h4>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{project.type}</Badge>
                      <Badge>{project.status}</Badge>
                    </div>
                    {project.budget && (
                      <p className="text-xs text-gray-500 mt-2">
                        Presupuesto: ${project.budget.toLocaleString()}
                      </p>
                    )}
                    {project.childrenCount !== undefined && (
                      <p className="text-xs text-gray-500">
                        Niños: {project.childrenCount}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {projects.length === 0 && !loading && (
              <p className="text-center text-gray-500 py-8">
                No hay proyectos para mostrar
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // ============================================================================
  // ACTUALIZAR PROYECTO
  // ============================================================================
  const ExampleUpdateProject = () => {
    const [projectId, setProjectId] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleUpdate = async () => {
      if (!projectId) return;

      const updates: any = {};
      if (name) updates.name = name;
      if (description) updates.description = description;

      const result = await updateProject(parseInt(projectId), updates);

      if (result.success) {
        console.log('Proyecto actualizado:', result.data);
        setProjectId('');
        setName('');
        setDescription('');
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>Actualizar Proyecto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              ID del Proyecto
            </label>
            <Input
              type="number"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="Ej: 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Nuevo Nombre (opcional)
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nuevo nombre del proyecto"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Nueva Descripción (opcional)
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nueva descripción"
              rows={3}
            />
          </div>

          <Button
            onClick={handleUpdate}
            disabled={loading || !projectId || (!name && !description)}
            className="w-full"
          >
            {loading ? 'Actualizando...' : 'Actualizar Proyecto'}
          </Button>
        </CardContent>
      </Card>
    );
  };

  // ============================================================================
  // GESTIÓN DE NIÑOS
  // ============================================================================
  const ExampleManageChildren = () => {
    const [projectId, setProjectId] = useState('');
    const [childId, setChildId] = useState('');

    const handleAddChild = async () => {
      if (!projectId || !childId) return;

      const result = await addChildToProject(
        parseInt(projectId),
        parseInt(childId)
      );

      if (result.success) {
        console.log('Niño agregado al proyecto');
        setChildId('');
      }
    };

    const handleRemoveChild = async () => {
      if (!projectId || !childId) return;

      const result = await removeChildFromProject(
        parseInt(projectId),
        parseInt(childId)
      );

      if (result.success) {
        console.log('Niño removido del proyecto');
        setChildId('');
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestionar Niños en Proyecto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              ID del Proyecto
            </label>
            <Input
              type="number"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="Ej: 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              ID del Niño
            </label>
            <Input
              type="number"
              value={childId}
              onChange={(e) => setChildId(e.target.value)}
              placeholder="Ej: 123"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleAddChild}
              disabled={loading || !projectId || !childId}
            >
              Agregar Niño
            </Button>

            <Button
              onClick={handleRemoveChild}
              disabled={loading || !projectId || !childId}
              variant="destructive"
            >
              Remover Niño
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ============================================================================
  // ACTUALIZAR ESTADO
  // ============================================================================
  const ExampleUpdateStatus = () => {
    const [projectId, setProjectId] = useState('');
    const [status, setStatus] = useState<ProjectStatus>(ProjectStatus.IN_PROGRESS);

    const handleUpdateStatus = async () => {
      if (!projectId) return;

      const result = await updateProjectStatus(
        parseInt(projectId),
        status,
        'Cambio de estado desde ejemplo'
      );

      if (result.success) {
        console.log('Estado actualizado');
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>Actualizar Estado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              ID del Proyecto
            </label>
            <Input
              type="number"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="Ej: 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Nuevo Estado
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="w-full border rounded px-3 py-2"
            >
              {Object.values(ProjectStatus).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleUpdateStatus}
            disabled={loading || !projectId}
            className="w-full"
          >
            Actualizar Estado
          </Button>
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
        Ejemplo de Hook useProjects
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crear */}
        <ExampleCreateProject />

        {/* Listar */}
        <ExampleListProjects />

        {/* Actualizar */}
        <ExampleUpdateProject />

        {/* Gestionar Niños */}
        <ExampleManageChildren />

        {/* Actualizar Estado */}
        <ExampleUpdateStatus />
      </div>

      {/* Proyecto Seleccionado */}
      {selectedProject && (
        <Card className="bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-lg">Proyecto Seleccionado</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedProject(null)}
              >
                Cerrar
              </Button>
            </div>
            <pre className="text-xs overflow-auto max-h-96 bg-white p-4 rounded">
              {JSON.stringify(selectedProject, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Info Box */}
      <Card className="bg-purple-50">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-purple-900 mb-3">
            ℹ️ Funcionalidades del Hook useProjects
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-purple-800 mb-2">CRUD:</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>✅ createProject - Crear proyecto</li>
                <li>✅ updateProject - Actualizar proyecto</li>
                <li>✅ deleteProject - Eliminar proyecto</li>
                <li>✅ listProjects - Listar con filtros</li>
                <li>✅ getProjectById - Obtener por ID</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-800 mb-2">Gestión:</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>✅ addChildToProject - Agregar niño</li>
                <li>✅ removeChildFromProject - Remover niño</li>
                <li>✅ updateProjectStatus - Cambiar estado</li>
                <li>✅ Paginación incluida</li>
                <li>✅ Filtros por estado y tipo</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
