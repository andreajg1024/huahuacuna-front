/**
 * Projects Service
 * 
 * Service layer for projects management
 * Handles project CRUD operations and child assignments
 */

import { apiClient } from '@/lib/api-client';
import { BaseService } from './base.service';
import {
  CreateProjectDTO,
  UpdateProjectDTO,
  ProjectResponse,
  ProjectsListResponse,
  ListProjectsParams,
  AddChildToProjectDTO,
  RemoveChildFromProjectDTO,
  UpdateProjectStatusDTO,
  DeleteProjectDTO,
  ProjectStatus,
  ProjectType,
  KafkaTopic,
  ApiResponse,
} from '@/types/api.types';

export class ProjectsService extends BaseService {
  /**
   * Crear nuevo proyecto
   * Topic: apadrinamiento_projects_create
   */
  async createProject(
    dto: CreateProjectDTO,
    userId: number
  ): Promise<ApiResponse<ProjectResponse>> {
    try {
      console.log('[ProjectsService] createProject - Start', { dto, userId });
      
      // Validaciones
      this.validateRequired(dto.name, 'name');
      this.validateLength(dto.name, 'name', 3, 200);
      
      this.validateRequired(dto.description, 'description');
      this.validateLength(dto.description, 'description', 10, 2000);
      
      this.validateRequired(dto.type, 'type');
      
      // Validar que type sea válido
      const validTypes = Object.values(ProjectType);
      if (!validTypes.includes(dto.type)) {
        throw new Error(`type debe ser uno de: ${validTypes.join(', ')}`);
      }

      // Validar fechas si se proporcionan
      if (dto.startDate && !this.isValidISODate(dto.startDate)) {
        throw new Error('startDate debe estar en formato ISO 8601');
      }

      if (dto.endDate && !this.isValidISODate(dto.endDate)) {
        throw new Error('endDate debe estar en formato ISO 8601');
      }

      if (dto.startDate && dto.endDate) {
        if (new Date(dto.startDate) >= new Date(dto.endDate)) {
          throw new Error('endDate debe ser posterior a startDate');
        }
      }

      // Validar budget si se proporciona
      if (dto.budget !== undefined && dto.budget < 0) {
        throw new Error('budget debe ser un número positivo');
      }

      this.validateRequired(userId, 'userId');

      const response = await apiClient.sendToKafka<ProjectResponse>(
        KafkaTopic.PROJECT_CREATE,
        { dto, userId }
      );
      
      console.log('[ProjectsService] createProject - Response:', response);
      return response;
    } catch (error: any) {
      console.error('[ProjectsService] createProject - Error:', error);
      return {
        success: false,
        error: {
          message: error.message || 'Error al crear proyecto',
          code: 'CREATE_PROJECT_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Actualizar proyecto
   * Topic: apadrinamiento_projects_update
   */
  async updateProject(
    dto: UpdateProjectDTO,
    userId: number
  ): Promise<ApiResponse<ProjectResponse>> {
    try {
      console.log('[ProjectsService] updateProject - Start', { dto, userId });
      
      this.validateRequired(dto.id, 'id');
      this.validateRequired(userId, 'userId');

      // Validaciones opcionales
      if (dto.name) {
        this.validateLength(dto.name, 'name', 3, 200);
      }

      if (dto.description) {
        this.validateLength(dto.description, 'description', 10, 2000);
      }

      if (dto.type) {
        const validTypes = Object.values(ProjectType);
        if (!validTypes.includes(dto.type)) {
          throw new Error(`type debe ser uno de: ${validTypes.join(', ')}`);
        }
      }

      if (dto.status) {
        const validStatuses = Object.values(ProjectStatus);
        if (!validStatuses.includes(dto.status)) {
          throw new Error(`status debe ser uno de: ${validStatuses.join(', ')}`);
        }
      }

      if (dto.startDate && !this.isValidISODate(dto.startDate)) {
        throw new Error('startDate debe estar en formato ISO 8601');
      }

      if (dto.endDate && !this.isValidISODate(dto.endDate)) {
        throw new Error('endDate debe estar en formato ISO 8601');
      }

      if (dto.budget !== undefined && dto.budget < 0) {
        throw new Error('budget debe ser un número positivo');
      }

      const response = await apiClient.sendToKafka<ProjectResponse>(
        KafkaTopic.PROJECT_UPDATE,
        { dto, userId }
      );
      
      console.log('[ProjectsService] updateProject - Response:', response);
      return response;
    } catch (error: any) {
      console.error('[ProjectsService] updateProject - Error:', error);
      return {
        success: false,
        error: {
          message: error.message || 'Error al actualizar proyecto',
          code: 'UPDATE_PROJECT_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Eliminar proyecto
   * Topic: apadrinamiento_projects_delete
   */
  async deleteProject(
    dto: DeleteProjectDTO
  ): Promise<ApiResponse<{ success: boolean }>> {
    try {
      console.log('[ProjectsService] deleteProject - Start', { dto });
      
      this.validateRequired(dto.projectId, 'projectId');
      this.validateRequired(dto.userId, 'userId');

      const response = await apiClient.sendToKafka<{ success: boolean }>(
        KafkaTopic.PROJECT_DELETE,
        dto
      );
      
      console.log('[ProjectsService] deleteProject - Response:', response);
      return response;
    } catch (error: any) {
      console.error('[ProjectsService] deleteProject - Error:', error);
      return {
        success: false,
        error: {
          message: error.message || 'Error al eliminar proyecto',
          code: 'DELETE_PROJECT_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Listar proyectos
   * Topic: apadrinamiento_projects_list
   */
  async listProjects(
    params?: ListProjectsParams
  ): Promise<ApiResponse<ProjectsListResponse>> {
    try {
      console.log('[ProjectsService] listProjects - Start', { params });
      
      const { page = 1, limit = 12, status, type } = params || {};

      // Validar status si se proporciona
      if (status) {
        const validStatuses = Object.values(ProjectStatus);
        if (!validStatuses.includes(status)) {
          throw new Error(`status debe ser uno de: ${validStatuses.join(', ')}`);
        }
      }

      // Validar type si se proporciona
      if (type) {
        const validTypes = Object.values(ProjectType);
        if (!validTypes.includes(type)) {
          throw new Error(`type debe ser uno de: ${validTypes.join(', ')}`);
        }
      }

      const response = await apiClient.sendToKafka<ProjectsListResponse>(
        KafkaTopic.PROJECT_LIST,
        { page, limit, status, type }
      );
      
      console.log('[ProjectsService] listProjects - Response:', response);
      return response;
    } catch (error: any) {
      console.error('[ProjectsService] listProjects - Error:', error);
      return {
        success: false,
        error: {
          message: error.message || 'Error al listar proyectos',
          code: 'LIST_PROJECTS_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Obtener proyecto por ID
   * Topic: apadrinamiento_projects_get_by_id
   */
  async getProjectById(
    projectId: number
  ): Promise<ApiResponse<ProjectResponse>> {
    try {
      console.log('[ProjectsService] getProjectById - Start', { projectId });
      
      this.validateRequired(projectId, 'projectId');

      const response = await apiClient.sendToKafka<ProjectResponse>(
        KafkaTopic.PROJECT_GET_BY_ID,
        { projectId }
      );
      
      console.log('[ProjectsService] getProjectById - Response:', response);
      return response;
    } catch (error: any) {
      console.error('[ProjectsService] getProjectById - Error:', error);
      return {
        success: false,
        error: {
          message: error.message || 'Error al obtener proyecto',
          code: 'GET_PROJECT_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Agregar niño a proyecto
   * Topic: apadrinamiento_projects_add_child
   */
  async addChildToProject(
    dto: AddChildToProjectDTO
  ): Promise<ApiResponse<ProjectResponse>> {
    try {
      console.log('[ProjectsService] addChildToProject - Start', { dto });
      
      this.validateRequired(dto.projectId, 'projectId');
      this.validateRequired(dto.childId, 'childId');
      this.validateRequired(dto.userId, 'userId');

      const response = await apiClient.sendToKafka<ProjectResponse>(
        KafkaTopic.PROJECT_ADD_CHILD,
        dto
      );
      
      console.log('[ProjectsService] addChildToProject - Response:', response);
      return response;
    } catch (error: any) {
      console.error('[ProjectsService] addChildToProject - Error:', error);
      return {
        success: false,
        error: {
          message: error.message || 'Error al agregar niño al proyecto',
          code: 'ADD_CHILD_TO_PROJECT_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Remover niño de proyecto
   * Topic: apadrinamiento_projects_remove_child
   */
  async removeChildFromProject(
    dto: RemoveChildFromProjectDTO
  ): Promise<ApiResponse<ProjectResponse>> {
    try {
      console.log('[ProjectsService] removeChildFromProject - Start', { dto });
      
      this.validateRequired(dto.projectId, 'projectId');
      this.validateRequired(dto.childId, 'childId');
      this.validateRequired(dto.userId, 'userId');

      const response = await apiClient.sendToKafka<ProjectResponse>(
        KafkaTopic.PROJECT_REMOVE_CHILD,
        dto
      );
      
      console.log('[ProjectsService] removeChildFromProject - Response:', response);
      return response;
    } catch (error: any) {
      console.error('[ProjectsService] removeChildFromProject - Error:', error);
      return {
        success: false,
        error: {
          message: error.message || 'Error al remover niño del proyecto',
          code: 'REMOVE_CHILD_FROM_PROJECT_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Actualizar estado del proyecto
   * Topic: apadrinamiento_projects_update_status
   */
  async updateProjectStatus(
    dto: UpdateProjectStatusDTO
  ): Promise<ApiResponse<ProjectResponse>> {
    try {
      console.log('[ProjectsService] updateProjectStatus - Start', { dto });
      
      this.validateRequired(dto.projectId, 'projectId');
      this.validateRequired(dto.status, 'status');
      this.validateRequired(dto.userId, 'userId');

      const validStatuses = Object.values(ProjectStatus);
      if (!validStatuses.includes(dto.status)) {
        throw new Error(`status debe ser uno de: ${validStatuses.join(', ')}`);
      }

      const response = await apiClient.sendToKafka<ProjectResponse>(
        KafkaTopic.PROJECT_UPDATE_STATUS,
        dto
      );
      
      console.log('[ProjectsService] updateProjectStatus - Response:', response);
      return response;
    } catch (error: any) {
      console.error('[ProjectsService] updateProjectStatus - Error:', error);
      return {
        success: false,
        error: {
          message: error.message || 'Error al actualizar estado del proyecto',
          code: 'UPDATE_PROJECT_STATUS_ERROR',
          details: error
        }
      };
    }
  }
}

export const projectsService = new ProjectsService();
