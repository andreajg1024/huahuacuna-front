/**
 * Bitacora Service
 * 
 * Service layer for bitacora/diary entries management
 */

import { apiClient } from '@/lib/api-client';
import { BaseService } from './base.service';
import {
  CreateBitacoraEntryDTO,
  UpdateBitacoraEntryDTO,
  BitacoraEntryResponse,
  KafkaTopic,
  ApiResponse,
} from '@/types/api.types';

export class BitacoraService extends BaseService {
  /**
   * Crear entrada de bitácora
   */
  async createEntry(
    dto: CreateBitacoraEntryDTO,
    userId: number
  ): Promise<ApiResponse<BitacoraEntryResponse>> {
    this.validateEntryDTO(dto);
    
    return apiClient.sendToKafka<BitacoraEntryResponse>(
      KafkaTopic.BITACORA_ENTRY_CREATE,
      {
        dto,
        userId,
      }
    );
  }

  /**
   * Actualizar entrada
   */
  async updateEntry(
    dto: UpdateBitacoraEntryDTO,
    userId: number
  ): Promise<ApiResponse<BitacoraEntryResponse>> {
    this.validateRequired(dto.id, 'id');
    
    return apiClient.sendToKafka<BitacoraEntryResponse>(
      KafkaTopic.BITACORA_ENTRY_UPDATE,
      {
        dto,
        userId,
      }
    );
  }

  /**
   * Eliminar entrada
   */
  async deleteEntry(
    entryId: number,
    userId: number,
    reason: string
  ): Promise<ApiResponse<void>> {
    this.validateRequired(entryId, 'entryId');
    this.validateRequired(reason, 'reason');
    
    return apiClient.sendToKafka<void>(KafkaTopic.BITACORA_ENTRY_DELETE, {
      entryId,
      userId,
      reason,
    });
  }

  /**
   * Listar entradas
   */
  async listEntries(filters?: any): Promise<ApiResponse<BitacoraEntryResponse[]>> {
    return apiClient.sendToKafka<BitacoraEntryResponse[]>(
      KafkaTopic.BITACORA_ENTRY_LIST,
      filters || {}
    );
  }

  /**
   * Validar DTO de entrada
   */
  private validateEntryDTO(dto: CreateBitacoraEntryDTO): void {
    this.validateRequired(dto.childId, 'childId');
    this.validateRequired(dto.type, 'type');
    
    if (!['photo', 'video'].includes(dto.type)) {
      throw new Error('type debe ser "photo" o "video"');
    }
    
    this.validateRequired(dto.url, 'url');
    if (!this.isValidUrl(dto.url)) {
      throw new Error('url debe ser una URL válida');
    }
    
    if (dto.thumbnailUrl && !this.isValidUrl(dto.thumbnailUrl)) {
      throw new Error('thumbnailUrl debe ser una URL válida');
    }
    
    this.validateRequired(dto.description, 'description');
    this.validateLength(dto.description, 'description', 10, 500);
    
    this.validateRequired(dto.activityDate, 'activityDate');
    if (!this.isValidISODate(dto.activityDate)) {
      throw new Error('activityDate debe estar en formato ISO 8601');
    }
    
    this.validateRequired(dto.category, 'category');
    this.validateRequired(dto.tags, 'tags');
    
    if (!Array.isArray(dto.tags) || dto.tags.length === 0) {
      throw new Error('tags debe ser un array con al menos un elemento');
    }
    
    this.validateRequired(dto.visibility, 'visibility');
    if (!['public', 'internal'].includes(dto.visibility)) {
      throw new Error('visibility debe ser "public" o "internal"');
    }
    
    if (dto.type === 'video' && dto.duration) {
      if (dto.duration <= 0) {
        throw new Error('duration debe ser mayor a 0');
      }
    }
    
    this.validateRequired(dto.size, 'size');
    if (dto.size <= 0) {
      throw new Error('size debe ser mayor a 0');
    }
  }

  /**
   * Convertir entrada local a API format
   */
  convertEntryToApiFormat(localEntry: any): CreateBitacoraEntryDTO {
    return {
      childId: parseInt(localEntry.childId, 10),
      type: localEntry.tipo === 'foto' ? 'photo' : 'video',
      url: localEntry.url,
      thumbnailUrl: localEntry.thumbnailUrl,
      description: localEntry.descripcion,
      activityDate: localEntry.fechaActividad,
      category: localEntry.categoria,
      tags: localEntry.etiquetas || [],
      visibility: localEntry.visibilidad === 'publico' ? 'public' : 'internal',
      duration: localEntry.duracion,
      size: localEntry.tamano,
      metadata: localEntry.metadata,
    };
  }

  /**
   * Convertir entrada API a local format
   */
  convertEntryFromApiFormat(apiEntry: BitacoraEntryResponse): any {
    return {
      id: String(apiEntry.id),
      childId: String(apiEntry.childId),
      tipo: apiEntry.type === 'photo' ? 'foto' : 'video',
      url: apiEntry.url,
      thumbnailUrl: apiEntry.thumbnailUrl,
      descripcion: apiEntry.description,
      fechaActividad: apiEntry.activityDate,
      fechaPublicacion: apiEntry.publishedAt,
      categoria: apiEntry.category,
      etiquetas: apiEntry.tags,
      visibilidad: apiEntry.visibility === 'public' ? 'publico' : 'interno',
      uploadedBy: String(apiEntry.uploadedBy),
      uploadedByName: apiEntry.uploadedByName,
      duracion: apiEntry.duration,
      tamano: apiEntry.size,
      metadata: apiEntry.metadata,
    };
  }
}

export const bitacoraService = new BitacoraService();
export default BitacoraService;
