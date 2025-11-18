/**
 * useBitacoraEntries Hook
 * 
 * Custom hook para manejar operaciones de bitácora
 */

import { useState } from 'react';
import { bitacoraService } from '@/services/bitacora.service';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export function useBitacoraEntries() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Crear entrada de bitácora
   */
  const createEntry = async (entryData: any) => {
    try {
      setLoading(true);
      setError(null);

      const userId = user?.id ? parseInt(user.id, 10) : 0;
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      const dto = bitacoraService.convertEntryToApiFormat(entryData);
      const response = await bitacoraService.createEntry(dto, userId);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al crear la entrada');
      }

      const newEntry = bitacoraService.convertEntryFromApiFormat(response.data);
      
      toast.success('Entrada creada exitosamente');
      return { success: true, data: newEntry };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear la entrada';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualizar entrada
   */
  const updateEntry = async (id: string, updates: any) => {
    try {
      setLoading(true);
      setError(null);

      const userId = user?.id ? parseInt(user.id, 10) : 0;
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      const dto: any = { 
        id: parseInt(id, 10), 
        ...bitacoraService.convertEntryToApiFormat(updates) 
      };
      
      const response = await bitacoraService.updateEntry(dto, userId);

      if (!response.success) {
        throw new Error(response.error?.message || 'Error al actualizar la entrada');
      }

      toast.success('Entrada actualizada exitosamente');
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar la entrada';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Eliminar entrada
   */
  const deleteEntry = async (id: string, reason: string) => {
    try {
      setLoading(true);
      setError(null);

      const userId = user?.id ? parseInt(user.id, 10) : 0;
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      const response = await bitacoraService.deleteEntry(parseInt(id, 10), userId, reason);

      if (!response.success) {
        throw new Error(response.error?.message || 'Error al eliminar la entrada');
      }

      toast.success('Entrada eliminada exitosamente');
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar la entrada';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Listar entradas de un niño
   */
  const listEntries = async (childId?: string) => {
    try {
      setLoading(true);
      setError(null);

      const filters = childId ? { childId: parseInt(childId, 10) } : {};
      const response = await bitacoraService.listEntries(filters);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al cargar las entradas');
      }

      const entries = response.data.map(entry => 
        bitacoraService.convertEntryFromApiFormat(entry)
      );

      return { success: true, data: entries };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar las entradas';
      setError(message);
      return { success: false, error: message, data: [] };
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    loading,
    error,
    
    // Actions
    createEntry,
    updateEntry,
    deleteEntry,
    listEntries,
  };
}
