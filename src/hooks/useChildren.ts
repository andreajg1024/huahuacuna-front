/**
 * useChildren Hook
 * 
 * Custom hook para manejar operaciones de niños
 * Maneja loading, errores y llamadas a la API
 */

import { useState } from 'react';
import { apadrinamientoService } from '@/services/apadrinamiento.service';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export function useChildren() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Crear un niño
   */
  const createChild = async (childData: any) => {
    try {
      setLoading(true);
      setError(null);

      const userId = user?.id ? parseInt(user.id, 10) : 0;
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      const dto = apadrinamientoService.convertToApiFormat(childData);
      const response = await apadrinamientoService.createChild(dto, userId);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al crear el niño');
      }

      const newChild = apadrinamientoService.convertFromApiFormat(response.data);
      
      toast.success('Niño registrado exitosamente');
      return { success: true, data: newChild };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear el niño';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualizar un niño
   */
  const updateChild = async (id: string, updates: any) => {
    try {
      setLoading(true);
      setError(null);

      const userId = user?.id ? parseInt(user.id, 10) : 0;
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      const dto: any = { 
        id: parseInt(id, 10), 
        ...apadrinamientoService.convertToApiFormat(updates) 
      };
      
      const response = await apadrinamientoService.updateChild(dto, userId);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al actualizar el niño');
      }

      toast.success('Niño actualizado exitosamente');
      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar el niño';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Eliminar un niño
   */
  const deleteChild = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const userId = user?.id ? parseInt(user.id, 10) : 0;
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      const response = await apadrinamientoService.deleteChild(parseInt(id, 10), userId);

      if (!response.success) {
        throw new Error(response.error?.message || 'Error al eliminar el niño');
      }

      toast.success('Niño eliminado exitosamente');
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar el niño';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener lista de niños
   */
  const listChildren = async (filters?: any) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apadrinamientoService.listChildren(filters);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al cargar los niños');
      }

      const children = response.data.map(child => 
        apadrinamientoService.convertFromApiFormat(child)
      );

      return { success: true, data: children };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar los niños';
      setError(message);
      return { success: false, error: message, data: [] };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener un niño por ID
   */
  const getChild = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apadrinamientoService.getChild(parseInt(id, 10));

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al cargar el niño');
      }

      const child = apadrinamientoService.convertFromApiFormat(response.data);

      return { success: true, data: child };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar el niño';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    loading,
    error,
    
    // Actions
    createChild,
    updateChild,
    deleteChild,
    listChildren,
    getChild,
  };
}
