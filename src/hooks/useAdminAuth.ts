/**
 * useAdminAuth Hook
 * 
 * Hook especializado para operaciones de administración
 * Solo disponible para usuarios con rol SUPER_ADMIN
 * 
 * Features:
 * - Crear administradores
 * - Actualizar administradores
 * - Listar administradores
 * - Gestión de estados de carga y errores
 */

import { useState, useCallback } from 'react';
import { authServiceV2 } from '../services/auth.service.v2';
import {
  CreateAdminDTO,
  UpdateAdminDTO,
  UserResponse,
  AdminListItemResponse,
  ApiError,
} from '../types/api.types';

interface UseAdminAuthState {
  loading: boolean;
  error: ApiError | null;
  admins: AdminListItemResponse[];
}

interface UseAdminAuthReturn extends UseAdminAuthState {
  // Métodos
  createAdmin: (dto: CreateAdminDTO) => Promise<UserResponse | null>;
  updateAdmin: (adminId: number, dto: UpdateAdminDTO) => Promise<UserResponse | null>;
  getAdmins: () => Promise<AdminListItemResponse[]>;
  refreshAdmins: () => Promise<void>;

  // Utilidades
  clearError: () => void;
}

export function useAdminAuth(): UseAdminAuthReturn {
  const [state, setState] = useState<UseAdminAuthState>({
    loading: false,
    error: null,
    admins: [],
  });

  const setLoading = useCallback((loading: boolean) => {
    setState((prev: UseAdminAuthState) => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: ApiError | null) => {
    setState((prev: UseAdminAuthState) => ({ ...prev, error }));
  }, []);

  const setAdmins = useCallback((admins: AdminListItemResponse[]) => {
    setState((prev: UseAdminAuthState) => ({ ...prev, admins }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  /**
   * POST /auth/admins
   * Crear nuevo administrador
   * 
   * Requiere: Rol SUPER_ADMIN
   */
  const createAdmin = useCallback(async (dto: CreateAdminDTO): Promise<UserResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authServiceV2.createAdmin(dto);
      
      if (!response.success) {
        setError(response.error || { message: 'Error desconocido', code: 'UNKNOWN_ERROR' });
        return null;
      }

      return response.data || null;
    } catch (err: any) {
      const apiError: ApiError = {
        message: err.message || 'Error al crear administrador',
        code: err.code || 'CREATE_ADMIN_ERROR',
        statusCode: err.statusCode,
      };
      setError(apiError);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  /**
   * PATCH /auth/admins/:adminId
   * Actualizar administrador existente
   * 
   * Requiere: Rol SUPER_ADMIN
   */
  const updateAdmin = useCallback(async (
    adminId: number,
    dto: UpdateAdminDTO
  ): Promise<UserResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authServiceV2.updateAdmin(adminId, dto);
      
      if (!response.success) {
        setError(response.error || { message: 'Error desconocido', code: 'UNKNOWN_ERROR' });
        return null;
      }

      return response.data || null;
    } catch (err: any) {
      const apiError: ApiError = {
        message: err.message || 'Error al actualizar administrador',
        code: err.code || 'UPDATE_ADMIN_ERROR',
        statusCode: err.statusCode,
      };
      setError(apiError);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  /**
   * GET /auth/admins
   * Obtener lista de administradores
   * 
   * Requiere: Rol SUPER_ADMIN
   */
  const getAdmins = useCallback(async (): Promise<AdminListItemResponse[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authServiceV2.getAdmins();
      
      if (!response.success) {
        setError(response.error || { message: 'Error desconocido', code: 'UNKNOWN_ERROR' });
        return [];
      }

      const adminsList = response.data || [];
      setAdmins(adminsList);
      return adminsList;
    } catch (err: any) {
      const apiError: ApiError = {
        message: err.message || 'Error al obtener administradores',
        code: err.code || 'GET_ADMINS_ERROR',
        statusCode: err.statusCode,
      };
      setError(apiError);
      return [];
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setAdmins]);

  /**
   * Refrescar lista de administradores
   * Útil después de crear o actualizar un admin
   */
  const refreshAdmins = useCallback(async (): Promise<void> => {
    await getAdmins();
  }, [getAdmins]);

  return {
    // Estado
    loading: state.loading,
    error: state.error,
    admins: state.admins,

    // Métodos
    createAdmin,
    updateAdmin,
    getAdmins,
    refreshAdmins,

    // Utilidades
    clearError,
  };
}
