/**
 * Donations Service
 * 
 * Service layer for donations management
 */

import { apiClient } from '@/lib/api-client';
import { BaseService } from './base.service';
import {
  CreateDonationDTO,
  DonationResponse,
  CreateInKindDonationDTO,
  InKindDonationResponse,
  KafkaTopic,
  ApiResponse,
} from '@/types/api.types';

export class DonationsService extends BaseService {
  /**
   * Crear donación monetaria
   */
  async createDonation(
    dto: CreateDonationDTO
  ): Promise<ApiResponse<DonationResponse>> {
    this.validateDonationDTO(dto);
    
    return apiClient.sendToKafka<DonationResponse>(
      KafkaTopic.DONATION_CREATE,
      dto
    );
  }

  /**
   * Actualizar donación
   */
  async updateDonation(
    donationId: number,
    updates: Partial<CreateDonationDTO>
  ): Promise<ApiResponse<DonationResponse>> {
    this.validateRequired(donationId, 'donationId');
    
    return apiClient.sendToKafka<DonationResponse>(KafkaTopic.DONATION_UPDATE, {
      donationId,
      updates,
    });
  }

  /**
   * Listar donaciones
   */
  async listDonations(filters?: any): Promise<ApiResponse<DonationResponse[]>> {
    return apiClient.sendToKafka<DonationResponse[]>(
      KafkaTopic.DONATION_LIST,
      filters || {}
    );
  }

  /**
   * Crear donación en especie
   */
  async createInKindDonation(
    dto: CreateInKindDonationDTO
  ): Promise<ApiResponse<InKindDonationResponse>> {
    this.validateInKindDonationDTO(dto);
    
    return apiClient.sendToKafka<InKindDonationResponse>(
      KafkaTopic.IN_KIND_DONATION_CREATE,
      dto
    );
  }

  /**
   * Validar donación monetaria
   */
  private validateDonationDTO(dto: CreateDonationDTO): void {
    this.validateRequired(dto.amount, 'amount');
    
    if (dto.amount <= 0) {
      throw new Error('amount debe ser mayor a 0');
    }
    
    this.validateRequired(dto.currency, 'currency');
    this.validateRequired(dto.donorName, 'donorName');
    this.validateLength(dto.donorName, 'donorName', 2, 100);
    
    this.validateRequired(dto.donorIdType, 'donorIdType');
    this.validateRequired(dto.donorIdNumber, 'donorIdNumber');
    
    this.validateRequired(dto.donorEmail, 'donorEmail');
    if (!this.isValidEmail(dto.donorEmail)) {
      throw new Error('donorEmail debe ser válido');
    }
    
    this.validateRequired(dto.donorCountry, 'donorCountry');
    this.validateRequired(dto.paymentMethod, 'paymentMethod');
    
    const validPaymentMethods = ['pse', 'transfer', 'cash', 'check', 'other'];
    if (!validPaymentMethods.includes(dto.paymentMethod)) {
      throw new Error(`paymentMethod debe ser uno de: ${validPaymentMethods.join(', ')}`);
    }
  }

  /**
   * Validar donación en especie
   */
  private validateInKindDonationDTO(dto: CreateInKindDonationDTO): void {
    this.validateRequired(dto.donorName, 'donorName');
    this.validateLength(dto.donorName, 'donorName', 2, 100);
    
    this.validateRequired(dto.donorEmail, 'donorEmail');
    if (!this.isValidEmail(dto.donorEmail)) {
      throw new Error('donorEmail debe ser válido');
    }
    
    this.validateRequired(dto.donorPhone, 'donorPhone');
    this.validateRequired(dto.donationType, 'donationType');
    this.validateRequired(dto.description, 'description');
    this.validateLength(dto.description, 'description', 10, 1000);
    
    if (dto.requiresPickup && !dto.pickupAddress) {
      throw new Error('pickupAddress es requerido cuando requiresPickup es true');
    }
  }

  /**
   * Convertir donación local a API format
   */
  convertDonationToApiFormat(localDonation: any): CreateDonationDTO {
    return {
      amount: localDonation.amount,
      currency: localDonation.currency,
      donorName: localDonation.donorName,
      donorIdType: localDonation.donorIdType,
      donorIdNumber: localDonation.donorIdNumber,
      donorEmail: localDonation.donorEmail,
      donorPhone: localDonation.donorPhone,
      donorCountry: localDonation.donorCountry,
      isAnonymous: localDonation.isAnonymous || false,
      destination: localDonation.destination,
      isRecurring: localDonation.isRecurring || false,
      paymentMethod: this.mapPaymentMethod(localDonation.paymentMethod),
      pseReference: localDonation.pseReference,
      pseBank: localDonation.pseBank,
    };
  }

  /**
   * Convertir donación API a local format
   */
  convertDonationFromApiFormat(apiDonation: DonationResponse): any {
    return {
      id: String(apiDonation.id),
      transactionId: apiDonation.transactionId,
      amount: apiDonation.amount,
      currency: apiDonation.currency,
      donorId: apiDonation.donorId ? String(apiDonation.donorId) : undefined,
      donorName: apiDonation.donorName,
      donorIdType: apiDonation.donorIdType,
      donorIdNumber: apiDonation.donorIdNumber,
      donorEmail: apiDonation.donorEmail,
      donorPhone: apiDonation.donorPhone,
      donorCountry: apiDonation.donorCountry,
      isAnonymous: apiDonation.isAnonymous,
      destination: apiDonation.destination,
      donationType: 'monetaria',
      isRecurring: apiDonation.isRecurring,
      paymentMethod: this.mapPaymentMethodFromApi(apiDonation.paymentMethod),
      pseReference: apiDonation.pseReference,
      pseBank: apiDonation.pseBank,
      status: this.mapDonationStatus(apiDonation.status),
      receiptUrl: apiDonation.receiptUrl,
      certificateUrl: apiDonation.certificateUrl,
      createdAt: apiDonation.createdAt,
      updatedAt: apiDonation.updatedAt,
      confirmationEmailSent: !!apiDonation.receiptUrl,
    };
  }

  private mapPaymentMethod(method: string): any {
    const mapping: Record<string, any> = {
      'pse': 'pse',
      'transferencia': 'transfer',
      'efectivo': 'cash',
      'cheque': 'check',
      'otro': 'other',
    };
    return mapping[method] || method;
  }

  private mapPaymentMethodFromApi(method: string): string {
    const mapping: Record<string, string> = {
      'pse': 'pse',
      'transfer': 'transferencia',
      'cash': 'efectivo',
      'check': 'cheque',
      'other': 'otro',
    };
    return mapping[method] || method;
  }

  private mapDonationStatus(status: string): string {
    const mapping: Record<string, string> = {
      'pending': 'pendiente',
      'approved': 'aprobada',
      'rejected': 'rechazada',
      'cancelled': 'cancelada',
      'refunded': 'reembolsada',
    };
    return mapping[status] || status;
  }
}

export const donationsService = new DonationsService();
export default DonationsService;
