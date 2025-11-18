/**
 * Projects Service
 * 
 * Service layer for project and volunteer management
 */

import { apiClient } from '@/lib/api-client';
import { BaseService } from './base.service';
import {
  CreateProjectDTO,
  UpdateProjectDTO,
  ProjectResponse,
  RegisterVolunteerDTO,
  VolunteerResponse,
  KafkaTopic,
  ApiResponse,
} from '@/types/api.types';

export class ProjectsService extends BaseService {
  /**
   * Crear nuevo proyecto
   */
  async createProject(
    dto: CreateProjectDTO,
    userId: number
  ): Promise<ApiResponse<ProjectResponse>> {
    this.validateProjectDTO(dto);
    
    return apiClient.sendToKafka<ProjectResponse>(KafkaTopic.PROJECT_CREATE, {
      dto,
      userId,
    });
  }

  /**
   * Actualizar proyecto
   */
  async updateProject(
    dto: UpdateProjectDTO,
    userId: number
  ): Promise<ApiResponse<ProjectResponse>> {
    this.validateRequired(dto.id, 'id');
    
    return apiClient.sendToKafka<ProjectResponse>(KafkaTopic.PROJECT_UPDATE, {
      dto,
      userId,
    });
  }

  /**
   * Eliminar proyecto
   */
  async deleteProject(
    projectId: number,
    userId: number
  ): Promise<ApiResponse<void>> {
    this.validateRequired(projectId, 'projectId');
    
    return apiClient.sendToKafka<void>(KafkaTopic.PROJECT_DELETE, {
      projectId,
      userId,
    });
  }

  /**
   * Listar proyectos
   */
  async listProjects(filters?: any): Promise<ApiResponse<ProjectResponse[]>> {
    return apiClient.sendToKafka<ProjectResponse[]>(
      KafkaTopic.PROJECT_LIST,
      filters || {}
    );
  }

  /**
   * Registrar voluntario
   */
  async registerVolunteer(
    dto: RegisterVolunteerDTO
  ): Promise<ApiResponse<VolunteerResponse>> {
    this.validateVolunteerDTO(dto);
    
    return apiClient.sendToKafka<VolunteerResponse>(
      KafkaTopic.VOLUNTEER_REGISTER,
      dto
    );
  }

  /**
   * Actualizar voluntario
   */
  async updateVolunteer(
    volunteerId: number,
    updates: Partial<RegisterVolunteerDTO>
  ): Promise<ApiResponse<VolunteerResponse>> {
    this.validateRequired(volunteerId, 'volunteerId');
    
    return apiClient.sendToKafka<VolunteerResponse>(KafkaTopic.VOLUNTEER_UPDATE, {
      volunteerId,
      updates,
    });
  }

  /**
   * Listar voluntarios
   */
  async listVolunteers(filters?: any): Promise<ApiResponse<VolunteerResponse[]>> {
    return apiClient.sendToKafka<VolunteerResponse[]>(
      KafkaTopic.VOLUNTEER_LIST,
      filters || {}
    );
  }

  /**
   * Validar DTO de proyecto
   */
  private validateProjectDTO(dto: CreateProjectDTO): void {
    this.validateRequired(dto.title, 'title');
    this.validateLength(dto.title, 'title', 3, 200);
    
    this.validateRequired(dto.shortDescription, 'shortDescription');
    this.validateLength(dto.shortDescription, 'shortDescription', 10, 500);
    
    this.validateRequired(dto.fullDescription, 'fullDescription');
    this.validateRequired(dto.mainGoal, 'mainGoal');
    this.validateRequired(dto.startDate, 'startDate');
    this.validateRequired(dto.endDate, 'endDate');
    
    if (!this.isValidISODate(dto.startDate)) {
      throw new Error('startDate debe estar en formato ISO 8601');
    }
    
    if (!this.isValidISODate(dto.endDate)) {
      throw new Error('endDate debe estar en formato ISO 8601');
    }
    
    if (new Date(dto.startDate) >= new Date(dto.endDate)) {
      throw new Error('endDate debe ser posterior a startDate');
    }
    
    if (dto.mainImage && !this.isValidUrl(dto.mainImage)) {
      throw new Error('mainImage debe ser una URL válida');
    }
  }

  /**
   * Validar DTO de voluntario
   */
  private validateVolunteerDTO(dto: RegisterVolunteerDTO): void {
    this.validateRequired(dto.projectId, 'projectId');
    this.validateRequired(dto.fullName, 'fullName');
    this.validateLength(dto.fullName, 'fullName', 3, 100);
    
    this.validateRequired(dto.email, 'email');
    if (!this.isValidEmail(dto.email)) {
      throw new Error('email debe ser válido');
    }
    
    this.validateRequired(dto.phone, 'phone');
    this.validateRequired(dto.motivation, 'motivation');
    this.validateLength(dto.motivation, 'motivation', 10, 1000);
    
    if (!dto.acceptedTerms) {
      throw new Error('Debe aceptar los términos y condiciones');
    }
  }

  /**
   * Convertir proyecto local a API format
   */
  convertProjectToApiFormat(localProject: any): CreateProjectDTO {
    return {
      title: localProject.title,
      shortDescription: localProject.shortDescription,
      fullDescription: localProject.fullDescription,
      mainGoal: localProject.mainGoal,
      specificObjectives: localProject.specificObjectives || [],
      beneficiaries: localProject.beneficiaries,
      startDate: localProject.startDate,
      endDate: localProject.endDate,
      status: this.mapProjectStatus(localProject.status),
      mainImage: localProject.mainImage,
      gallery: localProject.gallery,
      needsVolunteers: localProject.needsVolunteers,
      volunteersNeeded: localProject.volunteersNeeded,
      requiredSkills: localProject.requiredSkills || [],
      location: localProject.location || [],
      tags: localProject.tags || [],
    };
  }

  /**
   * Convertir proyecto API a local format
   */
  convertProjectFromApiFormat(apiProject: ProjectResponse): any {
    return {
      id: String(apiProject.id),
      title: apiProject.title,
      slug: apiProject.slug,
      shortDescription: apiProject.shortDescription,
      fullDescription: apiProject.fullDescription,
      mainGoal: apiProject.mainGoal,
      specificObjectives: apiProject.specificObjectives,
      beneficiaries: apiProject.beneficiaries,
      startDate: apiProject.startDate,
      endDate: apiProject.endDate,
      status: this.mapProjectStatusFromApi(apiProject.status),
      isPublished: apiProject.status === 'active',
      mainImage: apiProject.mainImage,
      gallery: apiProject.gallery || [],
      needsVolunteers: apiProject.needsVolunteers,
      volunteersNeeded: apiProject.volunteersNeeded,
      volunteersRegistered: apiProject.volunteersRegistered,
      requiredSkills: apiProject.requiredSkills,
      location: apiProject.location,
      tags: apiProject.tags,
      createdAt: apiProject.createdAt,
      updatedAt: apiProject.updatedAt,
      createdBy: String(apiProject.createdBy),
    };
  }

  private mapProjectStatus(status: string): 'draft' | 'active' | 'completed' | 'archived' {
    const mapping: Record<string, any> = {
      'borrador': 'draft',
      'activo': 'active',
      'finalizado': 'completed',
      'archivado': 'archived',
    };
    return mapping[status] || 'draft';
  }

  private mapProjectStatusFromApi(status: string): string {
    const mapping: Record<string, string> = {
      'draft': 'borrador',
      'active': 'activo',
      'completed': 'finalizado',
      'archived': 'archivado',
    };
    return mapping[status] || 'borrador';
  }
}

export const projectsService = new ProjectsService();
export default ProjectsService;
