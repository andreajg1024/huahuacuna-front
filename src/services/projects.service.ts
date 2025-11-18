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

    return apiClient.sendToKafka<ProjectResponse>(
      KafkaTopic.PROJECT_CREATE,
      { dto, userId }
    );
  }

  /**
   * Actualizar proyecto
   * Topic: apadrinamiento_projects_update
   */
  async updateProject(
    dto: UpdateProjectDTO,
    userId: number
  ): Promise<ApiResponse<ProjectResponse>> {
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

    return apiClient.sendToKafka<ProjectResponse>(
      KafkaTopic.PROJECT_UPDATE,
      { dto, userId }
    );
  }

  /**
   * Eliminar proyecto
   * Topic: apadrinamiento_projects_delete
   */
  async deleteProject(
    dto: DeleteProjectDTO
  ): Promise<ApiResponse<{ success: boolean }>> {
    this.validateRequired(dto.projectId, 'projectId');
    this.validateRequired(dto.userId, 'userId');

    return apiClient.sendToKafka<{ success: boolean }>(
      KafkaTopic.PROJECT_DELETE,
      dto
    );
  }

  /**
   * Listar proyectos
   * Topic: apadrinamiento_projects_list
   */
  async listProjects(
    params?: ListProjectsParams
  ): Promise<ApiResponse<ProjectsListResponse>> {
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

    return apiClient.sendToKafka<ProjectsListResponse>(
      KafkaTopic.PROJECT_LIST,
      { page, limit, status, type }
    );
  }

  /**
   * Obtener proyecto por ID
   * Topic: apadrinamiento_projects_get_by_id
   */
  async getProjectById(
    projectId: number
  ): Promise<ApiResponse<ProjectResponse>> {
    this.validateRequired(projectId, 'projectId');

    return apiClient.sendToKafka<ProjectResponse>(
      KafkaTopic.PROJECT_GET_BY_ID,
      { projectId }
    );
  }

  /**
   * Agregar niño a proyecto
   * Topic: apadrinamiento_projects_add_child
   */
  async addChildToProject(
    dto: AddChildToProjectDTO
  ): Promise<ApiResponse<ProjectResponse>> {
    this.validateRequired(dto.projectId, 'projectId');
    this.validateRequired(dto.childId, 'childId');
    this.validateRequired(dto.userId, 'userId');

    return apiClient.sendToKafka<ProjectResponse>(
      KafkaTopic.PROJECT_ADD_CHILD,
      dto
    );
  }

  /**
   * Remover niño de proyecto
   * Topic: apadrinamiento_projects_remove_child
   */
  async removeChildFromProject(
    dto: RemoveChildFromProjectDTO
  ): Promise<ApiResponse<ProjectResponse>> {
    this.validateRequired(dto.projectId, 'projectId');
    this.validateRequired(dto.childId, 'childId');
    this.validateRequired(dto.userId, 'userId');

    return apiClient.sendToKafka<ProjectResponse>(
      KafkaTopic.PROJECT_REMOVE_CHILD,
      dto
    );
  }

  /**
   * Actualizar estado del proyecto
   * Topic: apadrinamiento_projects_update_status
   */
  async updateProjectStatus(
    dto: UpdateProjectStatusDTO
  ): Promise<ApiResponse<ProjectResponse>> {
    this.validateRequired(dto.projectId, 'projectId');
    this.validateRequired(dto.status, 'status');
    this.validateRequired(dto.userId, 'userId');

    const validStatuses = Object.values(ProjectStatus);
    if (!validStatuses.includes(dto.status)) {
      throw new Error(`status debe ser uno de: ${validStatuses.join(', ')}`);
    }

    return apiClient.sendToKafka<ProjectResponse>(
      KafkaTopic.PROJECT_UPDATE_STATUS,
      dto
    );
  }
}

export const projectsService = new ProjectsService();
