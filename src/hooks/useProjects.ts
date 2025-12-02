/**
 * useProjects Hook
 * 
 * Custom hook para gestionar proyectos
 * Incluye CRUD completo y gestión de niños en proyectos
 */

import { useState } from 'react';
import { projectsService } from '@/services/projects.service';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectStatus, ProjectType } from '@/types/api.types';

export function useProjects() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // CREAR PROYECTO
  // ============================================================================

  /**
   * Crear nuevo proyecto
   * Topic: apadrinamiento_projects_create
   */
  const createProject = async (
    name: string,
    description: string,
    type: ProjectType,
    options?: {
      status?: ProjectStatus;
      startDate?: string;
      endDate?: string;
      budget?: number;
      location?: string;
      objectives?: string[];
      childrenIds?: number[];
      metadata?: Record<string, any>;
    }
  ) => {
    try {
      console.log('[useProjects] createProject - Start', { name, description, type, options });
      setLoading(true);
      setError(null);

      const userId = user?.id ? parseInt(user.id, 10) : 0;
      if (!userId) {
        console.error('[useProjects] createProject - Usuario no autenticado');
        throw new Error('Usuario no autenticado');
      }

      // Validaciones locales
      if (name.length < 3 || name.length > 200) {
        console.error('[useProjects] createProject - Nombre con longitud inválida');
        throw new Error('El nombre debe tener entre 3 y 200 caracteres');
      }

      if (description.length < 10 || description.length > 2000) {
        console.error('[useProjects] createProject - Descripción con longitud inválida');
        throw new Error('La descripción debe tener entre 10 y 2000 caracteres');
      }

      const response = await projectsService.createProject(
        {
          name,
          description,
          type,
          status: options?.status || ProjectStatus.PLANNED,
          startDate: options?.startDate,
          endDate: options?.endDate,
          budget: options?.budget,
          location: options?.location,
          objectives: options?.objectives,
          childrenIds: options?.childrenIds,
          metadata: options?.metadata,
        },
        userId
      );

      if (!response.success || !response.data) {
        console.error('[useProjects] createProject - Error del servicio:', response.error);
        throw new Error(response.error?.message || 'Error al crear el proyecto');
      }

      console.log('[useProjects] createProject - Success:', response.data);
      toast.success('Proyecto creado exitosamente');
      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear el proyecto';
      console.error('[useProjects] createProject - Exception:', err);
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // ACTUALIZAR PROYECTO
  // ============================================================================

  /**
   * Actualizar proyecto existente
   * Topic: apadrinamiento_projects_update
   */
  const updateProject = async (
    projectId: number,
    updates: {
      name?: string;
      description?: string;
      type?: ProjectType;
      status?: ProjectStatus;
      startDate?: string;
      endDate?: string;
      budget?: number;
      location?: string;
      objectives?: string[];
      metadata?: Record<string, any>;
    }
  ) => {
    try {
      console.log('[useProjects] updateProject - Start', { projectId, updates });
      setLoading(true);
      setError(null);

      const userId = user?.id ? parseInt(user.id, 10) : 0;
      if (!userId) {
        console.error('[useProjects] updateProject - Usuario no autenticado');
        throw new Error('Usuario no autenticado');
      }

      if (!projectId) {
        console.error('[useProjects] updateProject - projectId requerido');
        throw new Error('projectId es requerido');
      }

      // Validaciones locales
      if (updates.name && (updates.name.length < 3 || updates.name.length > 200)) {
        console.error('[useProjects] updateProject - Nombre con longitud inválida');
        throw new Error('El nombre debe tener entre 3 y 200 caracteres');
      }

      if (updates.description && (updates.description.length < 10 || updates.description.length > 2000)) {
        console.error('[useProjects] updateProject - Descripción con longitud inválida');
        throw new Error('La descripción debe tener entre 10 y 2000 caracteres');
      }

      const response = await projectsService.updateProject(
        {
          id: projectId,
          ...updates,
        },
        userId
      );

      if (!response.success || !response.data) {
        console.error('[useProjects] updateProject - Error del servicio:', response.error);
        throw new Error(response.error?.message || 'Error al actualizar el proyecto');
      }

      console.log('[useProjects] updateProject - Success:', response.data);
      toast.success('Proyecto actualizado exitosamente');
      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar el proyecto';
      console.error('[useProjects] updateProject - Exception:', err);
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // ELIMINAR PROYECTO
  // ============================================================================

  /**
   * Eliminar proyecto
   * Topic: apadrinamiento_projects_delete
   */
  const deleteProject = async (projectId: number) => {
    try {
      console.log('[useProjects] deleteProject - Start', { projectId });
      setLoading(true);
      setError(null);

      const userId = user?.id ? parseInt(user.id, 10) : 0;
      if (!userId) {
        console.error('[useProjects] deleteProject - Usuario no autenticado');
        throw new Error('Usuario no autenticado');
      }

      if (user?.role !== 'admin' && user?.role !== 'super_admin') {
        console.error('[useProjects] deleteProject - Permisos insuficientes');
        throw new Error('No tienes permisos para eliminar proyectos');
      }

      if (!projectId) {
        console.error('[useProjects] deleteProject - projectId requerido');
        throw new Error('projectId es requerido');
      }

      const response = await projectsService.deleteProject({
        projectId,
        userId,
      });

      if (!response.success) {
        throw new Error(response.error?.message || 'Error al eliminar el proyecto');
      }

      toast.success('Proyecto eliminado exitosamente');
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar el proyecto';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // LISTAR PROYECTOS
  // ============================================================================

  /**
   * Listar proyectos con filtros
   * Topic: apadrinamiento_projects_list
   */
  const listProjects = async (
    page: number = 1,
    limit: number = 12,
    filters?: {
      status?: ProjectStatus;
      type?: ProjectType;
    }
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await projectsService.listProjects({
        page,
        limit,
        status: filters?.status,
        type: filters?.type,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al cargar proyectos');
      }

      return {
        success: true,
        data: response.data.data,
        pagination: {
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit,
          totalPages: response.data.totalPages,
        },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar proyectos';
      setError(message);
      return { success: false, error: message, data: [], pagination: null };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener proyecto por ID
   * Topic: apadrinamiento_projects_get_by_id
   */
  const getProjectById = async (projectId: number) => {
    try {
      setLoading(true);
      setError(null);

      if (!projectId) {
        throw new Error('projectId es requerido');
      }

      const response = await projectsService.getProjectById(projectId);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al cargar el proyecto');
      }

      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar el proyecto';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // GESTIÓN DE NIÑOS EN PROYECTOS
  // ============================================================================

  /**
   * Agregar niño a proyecto
   * Topic: apadrinamiento_projects_add_child
   */
  const addChildToProject = async (projectId: number, childId: number) => {
    try {
      setLoading(true);
      setError(null);

      const userId = user?.id ? parseInt(user.id, 10) : 0;
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      if (!projectId || !childId) {
        throw new Error('projectId y childId son requeridos');
      }

      const response = await projectsService.addChildToProject({
        projectId,
        childId,
        userId,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al agregar niño al proyecto');
      }

      toast.success('Niño agregado al proyecto exitosamente');
      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al agregar niño';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Remover niño de proyecto
   * Topic: apadrinamiento_projects_remove_child
   */
  const removeChildFromProject = async (projectId: number, childId: number) => {
    try {
      setLoading(true);
      setError(null);

      const userId = user?.id ? parseInt(user.id, 10) : 0;
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      if (!projectId || !childId) {
        throw new Error('projectId y childId son requeridos');
      }

      const response = await projectsService.removeChildFromProject({
        projectId,
        childId,
        userId,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al remover niño del proyecto');
      }

      toast.success('Niño removido del proyecto exitosamente');
      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al remover niño';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // ACTUALIZAR ESTADO
  // ============================================================================

  /**
   * Actualizar estado del proyecto
   * Topic: apadrinamiento_projects_update_status
   */
  const updateProjectStatus = async (
    projectId: number,
    status: ProjectStatus,
    reason?: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const userId = user?.id ? parseInt(user.id, 10) : 0;
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      if (!projectId) {
        throw new Error('projectId es requerido');
      }

      const response = await projectsService.updateProjectStatus({
        projectId,
        status,
        userId,
        reason,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al actualizar estado');
      }

      toast.success('Estado del proyecto actualizado');
      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar estado';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Estado
    loading,
    error,

    // CRUD
    createProject,
    updateProject,
    deleteProject,
    listProjects,
    getProjectById,

    // Gestión de niños
    addChildToProject,
    removeChildFromProject,

    // Estado
    updateProjectStatus,
  };
}
