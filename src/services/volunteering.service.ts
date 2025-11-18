/**
 * Volunteering Service
 * 
 * Service layer for volunteering applications management
 */

import { apiClient } from '@/lib/api-client';
import { BaseService } from './base.service';
import {
  CreateVolunteeringApplicationDTO,
  VolunteeringApplicationResponse,
  KafkaTopic,
  ApiResponse,
} from '@/types/api.types';

export class VolunteeringService extends BaseService {
  /**
   * Crear aplicación de voluntariado
   */
  async createApplication(
    dto: CreateVolunteeringApplicationDTO
  ): Promise<ApiResponse<VolunteeringApplicationResponse>> {
    this.validateApplicationDTO(dto);
    
    return apiClient.sendToKafka<VolunteeringApplicationResponse>(
      KafkaTopic.VOLUNTEERING_APPLICATION_CREATE,
      dto
    );
  }

  /**
   * Actualizar aplicación
   */
  async updateApplication(
    applicationId: number,
    updates: Partial<CreateVolunteeringApplicationDTO>
  ): Promise<ApiResponse<VolunteeringApplicationResponse>> {
    this.validateRequired(applicationId, 'applicationId');
    
    return apiClient.sendToKafka<VolunteeringApplicationResponse>(
      KafkaTopic.VOLUNTEERING_APPLICATION_UPDATE,
      {
        applicationId,
        updates,
      }
    );
  }

  /**
   * Listar aplicaciones
   */
  async listApplications(filters?: any): Promise<ApiResponse<VolunteeringApplicationResponse[]>> {
    return apiClient.sendToKafka<VolunteeringApplicationResponse[]>(
      KafkaTopic.VOLUNTEERING_APPLICATION_LIST,
      filters || {}
    );
  }

  /**
   * Validar DTO de aplicación
   */
  private validateApplicationDTO(dto: CreateVolunteeringApplicationDTO): void {
    this.validateRequired(dto.fullName, 'fullName');
    this.validateLength(dto.fullName, 'fullName', 3, 100);
    
    this.validateRequired(dto.email, 'email');
    if (!this.isValidEmail(dto.email)) {
      throw new Error('email debe ser válido');
    }
    
    this.validateRequired(dto.phone, 'phone');
    this.validateRequired(dto.areas, 'areas');
    
    if (!Array.isArray(dto.areas) || dto.areas.length === 0) {
      throw new Error('areas debe ser un array con al menos un elemento');
    }
    
    this.validateRequired(dto.motivation, 'motivation');
    this.validateLength(dto.motivation, 'motivation', 20, 1000);
    
    this.validateRequired(dto.availability, 'availability');
    if (!Array.isArray(dto.availability) || dto.availability.length === 0) {
      throw new Error('availability debe ser un array con al menos un elemento');
    }
    
    if (!dto.acceptedTerms) {
      throw new Error('Debe aceptar los términos y condiciones');
    }
    
    if (!dto.privacyConsent) {
      throw new Error('Debe aceptar el consentimiento de privacidad');
    }
    
    // Validar referencias si existen
    if (dto.references) {
      dto.references.forEach((ref, index) => {
        if (!ref.name || !ref.phone || !ref.relationship) {
          throw new Error(`Referencia ${index + 1}: nombre, teléfono y relación son requeridos`);
        }
        if (ref.email && !this.isValidEmail(ref.email)) {
          throw new Error(`Referencia ${index + 1}: email no es válido`);
        }
      });
    }
  }

  /**
   * Convertir aplicación local a API format
   */
  convertApplicationToApiFormat(localApp: any): CreateVolunteeringApplicationDTO {
    return {
      fullName: localApp.fullName,
      email: localApp.email,
      phone: localApp.phone,
      areas: localApp.areas || [],
      experience: localApp.experience,
      motivation: localApp.motivation,
      availability: localApp.availability || [],
      references: localApp.references,
      hasWorkPermit: localApp.hasWorkPermit || false,
      acceptedTerms: localApp.acceptedTerms || false,
      privacyConsent: localApp.privacyConsent || false,
    };
  }

  /**
   * Convertir aplicación API a local format
   */
  convertApplicationFromApiFormat(
    apiApp: VolunteeringApplicationResponse
  ): any {
    return {
      id: String(apiApp.id),
      fullName: apiApp.fullName,
      email: apiApp.email,
      phone: apiApp.phone,
      areas: apiApp.areas,
      experience: apiApp.experience,
      motivation: apiApp.motivation,
      availability: apiApp.availability,
      references: apiApp.references,
      hasWorkPermit: apiApp.hasWorkPermit,
      acceptedTerms: apiApp.acceptedTerms,
      privacyConsent: apiApp.privacyConsent,
      status: this.mapApplicationStatus(apiApp.status),
      submittedAt: apiApp.submittedAt,
      reviewedAt: apiApp.reviewedAt,
      reviewNotes: apiApp.reviewNotes,
    };
  }

  private mapApplicationStatus(status: string): string {
    const mapping: Record<string, string> = {
      'pending': 'pendiente',
      'in_review': 'en_revision',
      'approved': 'aprobado',
      'rejected': 'rechazado',
      'in_training': 'en_capacitacion',
      'active': 'activo',
      'inactive': 'inactivo',
    };
    return mapping[status] || status;
  }
}

export const volunteeringService = new VolunteeringService();
export default VolunteeringService;
