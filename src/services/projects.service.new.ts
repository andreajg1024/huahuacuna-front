/**
 * Projects Service
 * 
 * Service layer for projects management
 * Implements all 10 endpoints from Projects module with comprehensive error handling
 */

import { apiClient } from '@/lib/api-client';
import { BaseService } from './base.service';
import { ApiResponse } from '@/types/api.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PublicProject {
  id: number;
  title: string;
  slug: string;
  description: string;
  objective: string;
  beneficiaries: string;
  startDate: string;
  endDate: string;
  coverImage: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  volunteerCount: number;
}

export interface PublicProjectDetail extends PublicProject {
  images: string[];
  metaDescription: string;
  metaKeywords: string[];
}

export interface VolunteerRegistration {
  fullName: string;
  email: string;
  phone: string;
  skills: string;
  availability: string;
  message: string;
}

export interface VolunteerRegistrationResponse {
  id: number;
  projectId: number;
  fullName: string;
  email: string;
  phone: string;
  skills: string;
  availability: string;
  contacted: boolean;
  registeredAt: string;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  objective: string;
  beneficiaries: string;
  startDate: string;
  endDate: string;
  coverImage: string;
  images?: string[];
  metaDescription?: string;
  metaKeywords?: string[];
}

export interface CreateProjectResponse {
  id: number;
  title: string;
  slug: string;
  description: string;
  status: string;
  createdBy: number;
  createdAt: string;
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  objective?: string;
  beneficiaries?: string;
  startDate?: string;
  endDate?: string;
  coverImage?: string;
  images?: string[];
  metaDescription?: string;
  metaKeywords?: string[];
}

export interface UpdateProjectResponse {
  id: number;
  title: string;
  updatedAt: string;
}

export interface PublishProjectResponse {
  id: number;
  status: string;
  publishedAt: string;
  publishedBy: number;
}

export interface AdminProjectListItem {
  id: number;
  title: string;
  slug: string;
  status: string;
  startDate: string;
  volunteerCount: number;
  createdAt: string;
}

export interface VolunteerRecord {
  id: number;
  projectId: number;
  projectTitle: string;
  fullName: string;
  email: string;
  phone: string;
  skills: string;
  availability: string;
  contacted: boolean;
  registeredAt: string;
}

export interface ContactedVolunteerRequest {
  notes: string;
}

export interface ContactedVolunteerResponse {
  id: number;
  contacted: boolean;
  contactedAt: string;
  contactedBy: number;
  notes: string;
}

export interface GetPublicProjectsParams {
  skip?: number;
  take?: number;
  searchTerm?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface GetPublicProjectsResponse {
  data: PublicProject[];
  total: number;
}

export interface GetAdminProjectsParams {
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  skip?: number;
  take?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface GetAdminProjectsResponse {
  data: AdminProjectListItem[];
  total: number;
  skip: number;
  take: number;
}

export interface GetVolunteersParams {
  projectId?: number;
  contacted?: boolean;
  skip?: number;
  take?: number;
}

export interface GetVolunteersResponse {
  data: VolunteerRecord[];
  total: number;
  skip: number;
  take: number;
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class ProjectsService extends BaseService {
  
  // ============================================================================
  // PUBLIC ENDPOINTS
  // ============================================================================

  /**
   * 1. GET /projects/public
   * Lista proyectos públicos con paginación y búsqueda
   */
  async getPublicProjects(
    params?: GetPublicProjectsParams
  ): Promise<ApiResponse<GetPublicProjectsResponse>> {
    try {
      console.log('[ProjectsService] getPublicProjects - Params:', params);

      const queryParams = new URLSearchParams();
      if (params?.skip) queryParams.append('skip', params.skip.toString());
      if (params?.take) queryParams.append('take', params.take.toString());
      if (params?.searchTerm) queryParams.append('searchTerm', params.searchTerm);
      if (params?.orderBy) queryParams.append('orderBy', params.orderBy);
      if (params?.orderDirection) queryParams.append('orderDirection', params.orderDirection);

      const url = `/projects/public${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log('[ProjectsService] Request URL:', url);

      const response = await apiClient.get<GetPublicProjectsResponse>(url);

      if (!response.success) {
        console.error('[ProjectsService] getPublicProjects - Error:', response.error);
        return this.handleError(response.error?.message || 'Error al obtener proyectos públicos', 'GET_PUBLIC_PROJECTS_ERROR');
      }

      console.log('[ProjectsService] getPublicProjects - Success:', response.data);
      return response;

    } catch (error: any) {
      console.error('[ProjectsService] getPublicProjects - Exception:', error);
      return this.handleError(error.message || 'Error al obtener proyectos públicos', 'GET_PUBLIC_PROJECTS_EXCEPTION');
    }
  }

  /**
   * 2. GET /projects/public/:slug
   * Obtiene detalle de proyecto público por slug
   */
  async getPublicProjectBySlug(slug: string): Promise<ApiResponse<PublicProjectDetail>> {
    try {
      console.log('[ProjectsService] getPublicProjectBySlug - Slug:', slug);

      if (!slug || slug.trim() === '') {
        console.error('[ProjectsService] getPublicProjectBySlug - Slug vacío');
        return this.handleError('El slug del proyecto es requerido', 'INVALID_SLUG');
      }

      const response = await apiClient.get<PublicProjectDetail>(`/projects/public/${slug}`);

      if (!response.success) {
        console.error('[ProjectsService] getPublicProjectBySlug - Error:', response.error);
        
        // Manejo específico de errores
        if (response.error?.message?.includes('404') || response.error?.code === 'NOT_FOUND') {
          return this.handleError('Proyecto no encontrado', 'PROJECT_NOT_FOUND', 404);
        }
        
        return this.handleError(response.error?.message || 'Error al obtener proyecto', 'GET_PROJECT_BY_SLUG_ERROR');
      }

      console.log('[ProjectsService] getPublicProjectBySlug - Success:', response.data);
      return response;

    } catch (error: any) {
      console.error('[ProjectsService] getPublicProjectBySlug - Exception:', error);
      return this.handleError(error.message || 'Error al obtener proyecto', 'GET_PROJECT_BY_SLUG_EXCEPTION');
    }
  }

  /**
   * 3. POST /projects/:id/volunteers
   * Registra un voluntario para un proyecto
   */
  async registerVolunteer(
    projectId: number,
    data: VolunteerRegistration
  ): Promise<ApiResponse<VolunteerRegistrationResponse>> {
    try {
      console.log('[ProjectsService] registerVolunteer - ProjectID:', projectId, 'Data:', data);

      // Validaciones
      if (!projectId || projectId <= 0) {
        console.error('[ProjectsService] registerVolunteer - ID de proyecto inválido');
        return this.handleError('ID de proyecto inválido', 'INVALID_PROJECT_ID');
      }

      if (!data.fullName || data.fullName.trim() === '') {
        return this.handleError('El nombre completo es requerido', 'FULLNAME_REQUIRED');
      }

      if (!data.email || !this.isValidEmail(data.email)) {
        return this.handleError('Email inválido', 'INVALID_EMAIL');
      }

      if (!data.phone || data.phone.trim() === '') {
        return this.handleError('El teléfono es requerido', 'PHONE_REQUIRED');
      }

      const response = await apiClient.post<VolunteerRegistrationResponse>(
        `/projects/${projectId}/volunteers`,
        data
      );

      if (!response.success) {
        console.error('[ProjectsService] registerVolunteer - Error:', response.error);
        
        // Manejo específico de errores
        if (response.error?.message?.includes('400') || response.error?.code === 'BAD_REQUEST') {
          return this.handleError('Datos de registro inválidos', 'INVALID_REGISTRATION_DATA', 400);
        }
        
        if (response.error?.message?.includes('404') || response.error?.code === 'NOT_FOUND') {
          return this.handleError('Proyecto no encontrado', 'PROJECT_NOT_FOUND', 404);
        }

        if (response.error?.message?.includes('409') || response.error?.code === 'CONFLICT') {
          return this.handleError('Ya estás registrado como voluntario en este proyecto', 'ALREADY_REGISTERED', 409);
        }
        
        return this.handleError(response.error?.message || 'Error al registrar voluntario', 'REGISTER_VOLUNTEER_ERROR');
      }

      console.log('[ProjectsService] registerVolunteer - Success:', response.data);
      return response;

    } catch (error: any) {
      console.error('[ProjectsService] registerVolunteer - Exception:', error);
      return this.handleError(error.message || 'Error al registrar voluntario', 'REGISTER_VOLUNTEER_EXCEPTION');
    }
  }

  // ============================================================================
  // ADMIN ENDPOINTS
  // ============================================================================

  /**
   * 4. POST /projects
   * Crear nuevo proyecto (Admin)
   */
  async createProject(data: CreateProjectRequest): Promise<ApiResponse<CreateProjectResponse>> {
    try {
      console.log('[ProjectsService] createProject - Data:', data);

      // Validaciones
      if (!data.title || data.title.trim() === '') {
        return this.handleError('El título es requerido', 'TITLE_REQUIRED');
      }

      if (!data.description || data.description.trim() === '') {
        return this.handleError('La descripción es requerida', 'DESCRIPTION_REQUIRED');
      }

      if (!data.objective || data.objective.trim() === '') {
        return this.handleError('El objetivo es requerido', 'OBJECTIVE_REQUIRED');
      }

      if (!data.beneficiaries || data.beneficiaries.trim() === '') {
        return this.handleError('Los beneficiarios son requeridos', 'BENEFICIARIES_REQUIRED');
      }

      if (!data.startDate || !this.isValidISODate(data.startDate)) {
        return this.handleError('Fecha de inicio inválida', 'INVALID_START_DATE');
      }

      if (!data.endDate || !this.isValidISODate(data.endDate)) {
        return this.handleError('Fecha de fin inválida', 'INVALID_END_DATE');
      }

      if (new Date(data.startDate) >= new Date(data.endDate)) {
        return this.handleError('La fecha de fin debe ser posterior a la fecha de inicio', 'INVALID_DATE_RANGE');
      }

      const response = await apiClient.post<CreateProjectResponse>('/projects', data);

      if (!response.success) {
        console.error('[ProjectsService] createProject - Error:', response.error);
        
        // Manejo específico de errores
        if (response.error?.message?.includes('400') || response.error?.code === 'BAD_REQUEST') {
          return this.handleError('Datos del proyecto inválidos', 'INVALID_PROJECT_DATA', 400);
        }
        
        if (response.error?.message?.includes('401') || response.error?.code === 'UNAUTHORIZED') {
          return this.handleError('No autorizado. Inicia sesión nuevamente', 'UNAUTHORIZED', 401);
        }
        
        if (response.error?.message?.includes('403') || response.error?.code === 'FORBIDDEN') {
          return this.handleError('No tienes permisos para crear proyectos', 'FORBIDDEN', 403);
        }
        
        return this.handleError(response.error?.message || 'Error al crear proyecto', 'CREATE_PROJECT_ERROR');
      }

      console.log('[ProjectsService] createProject - Success:', response.data);
      return response;

    } catch (error: any) {
      console.error('[ProjectsService] createProject - Exception:', error);
      return this.handleError(error.message || 'Error al crear proyecto', 'CREATE_PROJECT_EXCEPTION');
    }
  }

  /**
   * 5. GET /projects
   * Listar proyectos (Admin)
   */
  async getAdminProjects(params?: GetAdminProjectsParams): Promise<ApiResponse<GetAdminProjectsResponse>> {
    try {
      console.log('[ProjectsService] getAdminProjects - Params:', params);

      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.skip) queryParams.append('skip', params.skip.toString());
      if (params?.take) queryParams.append('take', params.take.toString());
      if (params?.orderBy) queryParams.append('orderBy', params.orderBy);
      if (params?.orderDirection) queryParams.append('orderDirection', params.orderDirection);

      const url = `/projects${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log('[ProjectsService] Request URL:', url);

      const response = await apiClient.get<GetAdminProjectsResponse>(url);

      if (!response.success) {
        console.error('[ProjectsService] getAdminProjects - Error:', response.error);
        
        if (response.error?.message?.includes('401') || response.error?.code === 'UNAUTHORIZED') {
          return this.handleError('No autorizado. Inicia sesión nuevamente', 'UNAUTHORIZED', 401);
        }
        
        if (response.error?.message?.includes('403') || response.error?.code === 'FORBIDDEN') {
          return this.handleError('No tienes permisos para ver proyectos', 'FORBIDDEN', 403);
        }
        
        return this.handleError(response.error?.message || 'Error al obtener proyectos', 'GET_ADMIN_PROJECTS_ERROR');
      }

      console.log('[ProjectsService] getAdminProjects - Success:', response.data);
      return response;

    } catch (error: any) {
      console.error('[ProjectsService] getAdminProjects - Exception:', error);
      return this.handleError(error.message || 'Error al obtener proyectos', 'GET_ADMIN_PROJECTS_EXCEPTION');
    }
  }

  /**
   * 6. PUT /projects/:id
   * Actualizar proyecto (Admin)
   */
  async updateProject(id: number, data: UpdateProjectRequest): Promise<ApiResponse<UpdateProjectResponse>> {
    try {
      console.log('[ProjectsService] updateProject - ID:', id, 'Data:', data);

      if (!id || id <= 0) {
        return this.handleError('ID de proyecto inválido', 'INVALID_PROJECT_ID');
      }

      // Validaciones opcionales
      if (data.startDate && data.endDate) {
        if (!this.isValidISODate(data.startDate) || !this.isValidISODate(data.endDate)) {
          return this.handleError('Fechas inválidas', 'INVALID_DATES');
        }
        
        if (new Date(data.startDate) >= new Date(data.endDate)) {
          return this.handleError('La fecha de fin debe ser posterior a la fecha de inicio', 'INVALID_DATE_RANGE');
        }
      }

      const response = await apiClient.put<UpdateProjectResponse>(`/projects/${id}`, data);

      if (!response.success) {
        console.error('[ProjectsService] updateProject - Error:', response.error);
        
        if (response.error?.message?.includes('400') || response.error?.code === 'BAD_REQUEST') {
          return this.handleError('Datos de actualización inválidos', 'INVALID_UPDATE_DATA', 400);
        }
        
        if (response.error?.message?.includes('401') || response.error?.code === 'UNAUTHORIZED') {
          return this.handleError('No autorizado. Inicia sesión nuevamente', 'UNAUTHORIZED', 401);
        }
        
        if (response.error?.message?.includes('403') || response.error?.code === 'FORBIDDEN') {
          return this.handleError('No tienes permisos para actualizar proyectos', 'FORBIDDEN', 403);
        }
        
        if (response.error?.message?.includes('404') || response.error?.code === 'NOT_FOUND') {
          return this.handleError('Proyecto no encontrado', 'PROJECT_NOT_FOUND', 404);
        }
        
        return this.handleError(response.error?.message || 'Error al actualizar proyecto', 'UPDATE_PROJECT_ERROR');
      }

      console.log('[ProjectsService] updateProject - Success:', response.data);
      return response;

    } catch (error: any) {
      console.error('[ProjectsService] updateProject - Exception:', error);
      return this.handleError(error.message || 'Error al actualizar proyecto', 'UPDATE_PROJECT_EXCEPTION');
    }
  }

  /**
   * 7. POST /projects/:id/publish
   * Publicar proyecto (Admin)
   */
  async publishProject(id: number): Promise<ApiResponse<PublishProjectResponse>> {
    try {
      console.log('[ProjectsService] publishProject - ID:', id);

      if (!id || id <= 0) {
        return this.handleError('ID de proyecto inválido', 'INVALID_PROJECT_ID');
      }

      const response = await apiClient.post<PublishProjectResponse>(`/projects/${id}/publish`, {});

      if (!response.success) {
        console.error('[ProjectsService] publishProject - Error:', response.error);
        
        if (response.error?.message?.includes('400') || response.error?.code === 'BAD_REQUEST') {
          return this.handleError('El proyecto no puede ser publicado en su estado actual', 'CANNOT_PUBLISH', 400);
        }
        
        if (response.error?.message?.includes('401') || response.error?.code === 'UNAUTHORIZED') {
          return this.handleError('No autorizado. Inicia sesión nuevamente', 'UNAUTHORIZED', 401);
        }
        
        if (response.error?.message?.includes('403') || response.error?.code === 'FORBIDDEN') {
          return this.handleError('No tienes permisos para publicar proyectos', 'FORBIDDEN', 403);
        }
        
        if (response.error?.message?.includes('404') || response.error?.code === 'NOT_FOUND') {
          return this.handleError('Proyecto no encontrado', 'PROJECT_NOT_FOUND', 404);
        }
        
        return this.handleError(response.error?.message || 'Error al publicar proyecto', 'PUBLISH_PROJECT_ERROR');
      }

      console.log('[ProjectsService] publishProject - Success:', response.data);
      return response;

    } catch (error: any) {
      console.error('[ProjectsService] publishProject - Exception:', error);
      return this.handleError(error.message || 'Error al publicar proyecto', 'PUBLISH_PROJECT_EXCEPTION');
    }
  }

  /**
   * 8. DELETE /projects/:id
   * Eliminar proyecto (Admin)
   */
  async deleteProject(id: number): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('[ProjectsService] deleteProject - ID:', id);

      if (!id || id <= 0) {
        return this.handleError('ID de proyecto inválido', 'INVALID_PROJECT_ID');
      }

      const response = await apiClient.delete<{ message: string }>(`/projects/${id}`);

      if (!response.success) {
        console.error('[ProjectsService] deleteProject - Error:', response.error);
        
        if (response.error?.message?.includes('400') || response.error?.code === 'BAD_REQUEST') {
          return this.handleError('El proyecto no puede ser eliminado', 'CANNOT_DELETE', 400);
        }
        
        if (response.error?.message?.includes('401') || response.error?.code === 'UNAUTHORIZED') {
          return this.handleError('No autorizado. Inicia sesión nuevamente', 'UNAUTHORIZED', 401);
        }
        
        if (response.error?.message?.includes('403') || response.error?.code === 'FORBIDDEN') {
          return this.handleError('No tienes permisos para eliminar proyectos', 'FORBIDDEN', 403);
        }
        
        if (response.error?.message?.includes('404') || response.error?.code === 'NOT_FOUND') {
          return this.handleError('Proyecto no encontrado', 'PROJECT_NOT_FOUND', 404);
        }
        
        return this.handleError(response.error?.message || 'Error al eliminar proyecto', 'DELETE_PROJECT_ERROR');
      }

      console.log('[ProjectsService] deleteProject - Success:', response.data);
      return response;

    } catch (error: any) {
      console.error('[ProjectsService] deleteProject - Exception:', error);
      return this.handleError(error.message || 'Error al eliminar proyecto', 'DELETE_PROJECT_EXCEPTION');
    }
  }

  /**
   * 9. GET /projects/volunteers
   * Listar voluntarios registrados (Admin)
   */
  async getVolunteers(params?: GetVolunteersParams): Promise<ApiResponse<GetVolunteersResponse>> {
    try {
      console.log('[ProjectsService] getVolunteers - Params:', params);

      const queryParams = new URLSearchParams();
      if (params?.projectId) queryParams.append('projectId', params.projectId.toString());
      if (params?.contacted !== undefined) queryParams.append('contacted', params.contacted.toString());
      if (params?.skip) queryParams.append('skip', params.skip.toString());
      if (params?.take) queryParams.append('take', params.take.toString());

      const url = `/projects/volunteers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log('[ProjectsService] Request URL:', url);

      const response = await apiClient.get<GetVolunteersResponse>(url);

      if (!response.success) {
        console.error('[ProjectsService] getVolunteers - Error:', response.error);
        
        if (response.error?.message?.includes('401') || response.error?.code === 'UNAUTHORIZED') {
          return this.handleError('No autorizado. Inicia sesión nuevamente', 'UNAUTHORIZED', 401);
        }
        
        if (response.error?.message?.includes('403') || response.error?.code === 'FORBIDDEN') {
          return this.handleError('No tienes permisos para ver voluntarios', 'FORBIDDEN', 403);
        }
        
        return this.handleError(response.error?.message || 'Error al obtener voluntarios', 'GET_VOLUNTEERS_ERROR');
      }

      console.log('[ProjectsService] getVolunteers - Success:', response.data);
      return response;

    } catch (error: any) {
      console.error('[ProjectsService] getVolunteers - Exception:', error);
      return this.handleError(error.message || 'Error al obtener voluntarios', 'GET_VOLUNTEERS_EXCEPTION');
    }
  }

  /**
   * 10. POST /projects/volunteers/:id/contacted
   * Marcar voluntario como contactado (Admin)
   */
  async markVolunteerContacted(
    id: number,
    data: ContactedVolunteerRequest
  ): Promise<ApiResponse<ContactedVolunteerResponse>> {
    try {
      console.log('[ProjectsService] markVolunteerContacted - ID:', id, 'Data:', data);

      if (!id || id <= 0) {
        return this.handleError('ID de voluntario inválido', 'INVALID_VOLUNTEER_ID');
      }

      if (!data.notes || data.notes.trim() === '') {
        return this.handleError('Las notas son requeridas', 'NOTES_REQUIRED');
      }

      const response = await apiClient.post<ContactedVolunteerResponse>(
        `/projects/volunteers/${id}/contacted`,
        data
      );

      if (!response.success) {
        console.error('[ProjectsService] markVolunteerContacted - Error:', response.error);
        
        if (response.error?.message?.includes('400') || response.error?.code === 'BAD_REQUEST') {
          return this.handleError('Datos inválidos', 'INVALID_DATA', 400);
        }
        
        if (response.error?.message?.includes('401') || response.error?.code === 'UNAUTHORIZED') {
          return this.handleError('No autorizado. Inicia sesión nuevamente', 'UNAUTHORIZED', 401);
        }
        
        if (response.error?.message?.includes('403') || response.error?.code === 'FORBIDDEN') {
          return this.handleError('No tienes permisos para esta acción', 'FORBIDDEN', 403);
        }
        
        if (response.error?.message?.includes('404') || response.error?.code === 'NOT_FOUND') {
          return this.handleError('Voluntario no encontrado', 'VOLUNTEER_NOT_FOUND', 404);
        }
        
        return this.handleError(response.error?.message || 'Error al marcar voluntario como contactado', 'MARK_CONTACTED_ERROR');
      }

      console.log('[ProjectsService] markVolunteerContacted - Success:', response.data);
      return response;

    } catch (error: any) {
      console.error('[ProjectsService] markVolunteerContacted - Exception:', error);
      return this.handleError(error.message || 'Error al marcar voluntario como contactado', 'MARK_CONTACTED_EXCEPTION');
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private handleError(message: string, code: string, statusCode?: number): ApiResponse<never> {
    return {
      success: false,
      error: {
        message,
        code,
        statusCode,
      },
    };
  }
}

// Export singleton instance
export const projectsService = new ProjectsService();
