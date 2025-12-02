/**
 * useChildren Hook
 * Hook para gestión de niños con estados loading/error
 */

import { useState } from 'react';
import { childrenService } from '@/services/children.service';
import type {
  ApiError,
  CreateChildDTO,
  ChildResponse,
  FilterChildrenDTO,
  UpdateChildDTO,
} from '@/types/api.types';

interface UseChildrenState {
  loading: boolean;
  error: ApiError | null;
}

export const useChildren = () => {
  const [state, setState] = useState<UseChildrenState>({ loading: false, error: null });

  const clearError = () => setState((s: UseChildrenState) => ({ ...s, error: null }));

  const createChild = async (data: CreateChildDTO) => {
    setState({ loading: true, error: null });
    const result = await childrenService.createChild(data);
    setState({ loading: false, error: result.error || null });
    return result.data || null;
  };

  const getAvailableChildren = async (params?: { page?: number; limit?: number }) => {
    setState({ loading: true, error: null });
    const result = await childrenService.getAvailableChildren(params);
    setState({ loading: false, error: result.error || null });
    return result.data || null;
  };

  const filterChildren = async (filters: FilterChildrenDTO) => {
    setState({ loading: true, error: null });
    const result = await childrenService.filterChildren(filters);
    setState({ loading: false, error: result.error || null });
    return result.data || null;
  };

  const getAllChildren = async () => {
    setState({ loading: true, error: null });
    const result = await childrenService.getAllChildren();
    setState({ loading: false, error: result.error || null });
    return result.data || null;
  };

  const getChildById = async (id: number) => {
    setState({ loading: true, error: null });
    const result = await childrenService.getChildById(id);
    setState({ loading: false, error: result.error || null });
    return result.data || null;
  };

  const updateChild = async (id: number, data: UpdateChildDTO) => {
    setState({ loading: true, error: null });
    const result = await childrenService.updateChild(id, data);
    setState({ loading: false, error: result.error || null });
    return result.data || null;
  };

  const deleteChild = async (id: number) => {
    setState({ loading: true, error: null });
    const result = await childrenService.deleteChild(id);
    setState({ loading: false, error: result.error || null });
    return result.data || null;
  };

  return {
    ...state,
    clearError,
    createChild,
    getAvailableChildren,
    filterChildren,
    getAllChildren,
    getChildById,
    updateChild,
    deleteChild,
  };
};

