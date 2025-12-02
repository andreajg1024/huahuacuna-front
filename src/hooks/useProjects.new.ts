/**
 * useProjects Hook
 * 
 * Custom hook para gestionar proyectos
 * Implementa todos los 10 endpoints del módulo Projects con logging completo
 */

import { useState } from 'react';
import { 
  projectsService,
  PublicProject,
  PublicProjectDetail,
  VolunteerRegistration,
  CreateProjectRequest,
  UpdateProjectRequest,
  GetPublicProjectsParams,
  GetAdminProjectsParams,
  GetVolunteersParams,
  ContactedVolunteerRequest,
} from '@/services/projects.service.new';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export function useProjects() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // ENDPOINTS PÚBLICOS
  // ============================================================================

  /**
   * 1. GET /projects/public
   * Lista proyectos públicos con paginación y búsqueda
   */
  const getPublicProjects = async (params?: GetPublicProjectsParams) => {
    try {
      console.log('[useProjects] getPublicProjects - Start', params);
      setLoading(true);
      setError(null);

      const response = await projectsService.getPublicProjects(params);

      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Error al obtener proyectos';
        console.error('[useProjects] getPublicProjects - Error:', response.error);
        setError(errorMsg);
        
        // No mostrar toast en errores de listado público para no molestar al usuario
        return { success: false, error: errorMsg, data: { data: [], total: 0 } };
      }

      console.log('[useProjects] getPublicProjects - Success:', response.data);
      return { success: true, data: response.data };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener proyectos';
      console.error('[useProjects] getPublicProjects - Exception:', err);
      setError(message);
      return { success: false, error: message, data: { data: [], total: 0 } };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 2. GET /projects/public/:slug
   * Obtiene detalle de proyecto público por slug
   */
  const getPublicProjectBySlug = async (slug: string) => {
    try {
      console.log('[useProjects] getPublicProjectBySlug - Start:', slug);
      setLoading(true);
      setError(null);

      const response = await projectsService.getPublicProjectBySlug(slug);

      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Error al obtener proyecto';
        console.error('[useProjects] getPublicProjectBySlug - Error:', response.error);
        setError(errorMsg);
        
        // Mostrar toast solo en errores específicos
        if (response.error?.code === 'PROJECT_NOT_FOUND') {
          toast.error('Proyecto no encontrado');
        }
        
        return { success: false, error: errorMsg };
      }

      console.log('[useProjects] getPublicProjectBySlug - Success:', response.data);
      return { success: true, data: response.data };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener proyecto';
      console.error('[useProjects] getPublicProjectBySlug - Exception:', err);
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 3. POST /projects/:id/volunteers
   * Registra un voluntario para un proyecto
   */
  const registerVolunteer = async (projectId: number, data: VolunteerRegistration) => {
    try {
      console.log('[useProjects] registerVolunteer - Start:', { projectId, data });
      setLoading(true);
      setError(null);

      const response = await projectsService.registerVolunteer(projectId, data);

      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Error al registrar voluntario';
        console.error('[useProjects] registerVolunteer - Error:', response.error);
        setError(errorMsg);
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      console.log('[useProjects] registerVolunteer - Success:', response.data);
      toast.success('¡Te has registrado como voluntario exitosamente!');
      return { success: true, data: response.data };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al registrar voluntario';
      console.error('[useProjects] registerVolunteer - Exception:', err);
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // ENDPOINTS ADMIN
  // ============================================================================

  /**
   * 4. POST /projects
   * Crear nuevo proyecto (Admin)
   */
  const createProject = async (data: CreateProjectRequest) => {
    try {
      console.log('[useProjects] createProject - Start:', data);
      setLoading(true);
      setError(null);

      // Verificar autenticación
      if (!user) {
        const errorMsg = 'Debes iniciar sesión para crear proyectos';
        console.error('[useProjects] createProject - Not authenticated');
        setError(errorMsg);
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      const response = await projectsService.createProject(data);

      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Error al crear proyecto';
        console.error('[useProjects] createProject - Error:', response.error);
        setError(errorMsg);
        
        // Mensajes específicos según el error
        if (response.error?.code === 'UNAUTHORIZED') {
          toast.error('Tu sesión ha expirado. Inicia sesión nuevamente');
        } else if (response.error?.code === 'FORBIDDEN') {
          toast.error('No tienes permisos para crear proyectos');
        } else {
          toast.error(errorMsg);
        }
        
        return { success: false, error: errorMsg };
      }

      console.log('[useProjects] createProject - Success:', response.data);
      toast.success('Proyecto creado exitosamente');
      return { success: true, data: response.data };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear proyecto';
      console.error('[useProjects] createProject - Exception:', err);
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 5. GET /projects
   * Listar proyectos (Admin)
   */
  const getAdminProjects = async (params?: GetAdminProjectsParams) => {
    try {
      console.log('[useProjects] getAdminProjects - Start:', params);
      setLoading(true);
      setError(null);

      // Verificar autenticación
      if (!user) {
        const errorMsg = 'Debes iniciar sesión';
        console.error('[useProjects] getAdminProjects - Not authenticated');
        setError(errorMsg);
        return { success: false, error: errorMsg, data: { data: [], total: 0, skip: 0, take: 10 } };
      }

      const response = await projectsService.getAdminProjects(params);

      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Error al obtener proyectos';
        console.error('[useProjects] getAdminProjects - Error:', response.error);
        setError(errorMsg);
        
        if (response.error?.code === 'UNAUTHORIZED') {
          toast.error('Tu sesión ha expirado. Inicia sesión nuevamente');
        } else if (response.error?.code === 'FORBIDDEN') {
          toast.error('No tienes permisos para ver proyectos');
        }
        
        return { success: false, error: errorMsg, data: { data: [], total: 0, skip: 0, take: 10 } };
      }

      console.log('[useProjects] getAdminProjects - Success:', response.data);
      return { success: true, data: response.data };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener proyectos';
      console.error('[useProjects] getAdminProjects - Exception:', err);
      setError(message);
      return { success: false, error: message, data: { data: [], total: 0, skip: 0, take: 10 } };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 6. PUT /projects/:id
   * Actualizar proyecto (Admin)
   */
  const updateProject = async (id: number, data: UpdateProjectRequest) => {
    try {
      console.log('[useProjects] updateProject - Start:', { id, data });
      setLoading(true);
      setError(null);

      // Verificar autenticación
      if (!user) {
        const errorMsg = 'Debes iniciar sesión';
        console.error('[useProjects] updateProject - Not authenticated');
        setError(errorMsg);
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      const response = await projectsService.updateProject(id, data);

      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Error al actualizar proyecto';
        console.error('[useProjects] updateProject - Error:', response.error);
        setError(errorMsg);
        
        if (response.error?.code === 'UNAUTHORIZED') {
          toast.error('Tu sesión ha expirado. Inicia sesión nuevamente');
        } else if (response.error?.code === 'FORBIDDEN') {
          toast.error('No tienes permisos para actualizar proyectos');
        } else if (response.error?.code === 'PROJECT_NOT_FOUND') {
          toast.error('Proyecto no encontrado');
        } else {
          toast.error(errorMsg);
        }
        
        return { success: false, error: errorMsg };
      }

      console.log('[useProjects] updateProject - Success:', response.data);
      toast.success('Proyecto actualizado exitosamente');
      return { success: true, data: response.data };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar proyecto';
      console.error('[useProjects] updateProject - Exception:', err);
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 7. POST /projects/:id/publish
   * Publicar proyecto (Admin)
   */
  const publishProject = async (id: number) => {
    try {
      console.log('[useProjects] publishProject - Start:', id);
      setLoading(true);
      setError(null);

      // Verificar autenticación
      if (!user) {
        const errorMsg = 'Debes iniciar sesión';
        console.error('[useProjects] publishProject - Not authenticated');
        setError(errorMsg);
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      const response = await projectsService.publishProject(id);

      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Error al publicar proyecto';
        console.error('[useProjects] publishProject - Error:', response.error);
        setError(errorMsg);
        
        if (response.error?.code === 'UNAUTHORIZED') {
          toast.error('Tu sesión ha expirado. Inicia sesión nuevamente');
        } else if (response.error?.code === 'FORBIDDEN') {
          toast.error('No tienes permisos para publicar proyectos');
        } else if (response.error?.code === 'PROJECT_NOT_FOUND') {
          toast.error('Proyecto no encontrado');
        } else if (response.error?.code === 'CANNOT_PUBLISH') {
          toast.error('El proyecto no puede ser publicado en su estado actual');
        } else {
          toast.error(errorMsg);
        }
        
        return { success: false, error: errorMsg };
      }

      console.log('[useProjects] publishProject - Success:', response.data);
      toast.success('Proyecto publicado exitosamente');
      return { success: true, data: response.data };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al publicar proyecto';
      console.error('[useProjects] publishProject - Exception:', err);
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 8. DELETE /projects/:id
   * Eliminar proyecto (Admin)
   */
  const deleteProject = async (id: number) => {
    try {
      console.log('[useProjects] deleteProject - Start:', id);
      setLoading(true);
      setError(null);

      // Verificar autenticación
      if (!user) {
        const errorMsg = 'Debes iniciar sesión';
        console.error('[useProjects] deleteProject - Not authenticated');
        setError(errorMsg);
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      const response = await projectsService.deleteProject(id);

      if (!response.success) {
        const errorMsg = response.error?.message || 'Error al eliminar proyecto';
        console.error('[useProjects] deleteProject - Error:', response.error);
        setError(errorMsg);
        
        if (response.error?.code === 'UNAUTHORIZED') {
          toast.error('Tu sesión ha expirado. Inicia sesión nuevamente');
        } else if (response.error?.code === 'FORBIDDEN') {
          toast.error('No tienes permisos para eliminar proyectos');
        } else if (response.error?.code === 'PROJECT_NOT_FOUND') {
          toast.error('Proyecto no encontrado');
        } else if (response.error?.code === 'CANNOT_DELETE') {
          toast.error('El proyecto no puede ser eliminado');
        } else {
          toast.error(errorMsg);
        }
        
        return { success: false, error: errorMsg };
      }

      console.log('[useProjects] deleteProject - Success');
      toast.success('Proyecto eliminado exitosamente');
      return { success: true };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar proyecto';
      console.error('[useProjects] deleteProject - Exception:', err);
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 9. GET /projects/volunteers
   * Listar voluntarios registrados (Admin)
   */
  const getVolunteers = async (params?: GetVolunteersParams) => {
    try {
      console.log('[useProjects] getVolunteers - Start:', params);
      setLoading(true);
      setError(null);

      // Verificar autenticación
      if (!user) {
        const errorMsg = 'Debes iniciar sesión';
        console.error('[useProjects] getVolunteers - Not authenticated');
        setError(errorMsg);
        return { success: false, error: errorMsg, data: { data: [], total: 0, skip: 0, take: 10 } };
      }

      const response = await projectsService.getVolunteers(params);

      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Error al obtener voluntarios';
        console.error('[useProjects] getVolunteers - Error:', response.error);
        setError(errorMsg);
        
        if (response.error?.code === 'UNAUTHORIZED') {
          toast.error('Tu sesión ha expirado. Inicia sesión nuevamente');
        } else if (response.error?.code === 'FORBIDDEN') {
          toast.error('No tienes permisos para ver voluntarios');
        }
        
        return { success: false, error: errorMsg, data: { data: [], total: 0, skip: 0, take: 10 } };
      }

      console.log('[useProjects] getVolunteers - Success:', response.data);
      return { success: true, data: response.data };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener voluntarios';
      console.error('[useProjects] getVolunteers - Exception:', err);
      setError(message);
      return { success: false, error: message, data: { data: [], total: 0, skip: 0, take: 10 } };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 10. POST /projects/volunteers/:id/contacted
   * Marcar voluntario como contactado (Admin)
   */
  const markVolunteerContacted = async (id: number, notes: string) => {
    try {
      console.log('[useProjects] markVolunteerContacted - Start:', { id, notes });
      setLoading(true);
      setError(null);

      // Verificar autenticación
      if (!user) {
        const errorMsg = 'Debes iniciar sesión';
        console.error('[useProjects] markVolunteerContacted - Not authenticated');
        setError(errorMsg);
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      const response = await projectsService.markVolunteerContacted(id, { notes });

      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Error al marcar voluntario como contactado';
        console.error('[useProjects] markVolunteerContacted - Error:', response.error);
        setError(errorMsg);
        
        if (response.error?.code === 'UNAUTHORIZED') {
          toast.error('Tu sesión ha expirado. Inicia sesión nuevamente');
        } else if (response.error?.code === 'FORBIDDEN') {
          toast.error('No tienes permisos para esta acción');
        } else if (response.error?.code === 'VOLUNTEER_NOT_FOUND') {
          toast.error('Voluntario no encontrado');
        } else {
          toast.error(errorMsg);
        }
        
        return { success: false, error: errorMsg };
      }

      console.log('[useProjects] markVolunteerContacted - Success:', response.data);
      toast.success('Voluntario marcado como contactado');
      return { success: true, data: response.data };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al marcar voluntario como contactado';
      console.error('[useProjects] markVolunteerContacted - Exception:', err);
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    
    // Públicos
    getPublicProjects,
    getPublicProjectBySlug,
    registerVolunteer,
    
    // Admin
    createProject,
    getAdminProjects,
    updateProject,
    publishProject,
    deleteProject,
    getVolunteers,
    markVolunteerContacted,
  };
}
