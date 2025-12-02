/**
 * useDonations Hook
 * Hook para gestión de donaciones con estados loading/error
 */

import { useState } from 'react';
import { donationsService } from '@/services/donations.service';
import type {
  ApiError,
  CreateMonetaryDonationDTO,
  MonetaryDonationResponse,
  CreateInKindDonationDTO,
  InKindDonationResponse,
  GetDonationsQueryDTO,
  AllDonationsResponse,
  MyDonationsResponse,
  ApproveDonationResponse,
  DonationInfoResponse,
  CreateDonationInfoDTO,
  CreateDonationInfoResponse,
  UpdateDonationInfoDTO,
  UpdateDonationInfoResponse,
  TestimonialsResponse,
  AllTestimonialsResponse,
  CreateTestimonialDTO,
  CreateTestimonialResponse,
  UpdateTestimonialDTO,
  UpdateTestimonialResponse,
} from '@/types/api.types';

interface UseDonationsState {
  loading: boolean;
  error: ApiError | null;
}

export const useDonations = () => {
  const [state, setState] = useState<UseDonationsState>({ loading: false, error: null });

  const clearError = () => setState((s: UseDonationsState) => ({ ...s, error: null }));

  const createMonetaryDonation = async (data: CreateMonetaryDonationDTO) => {
    setState({ loading: true, error: null });
    const result = await donationsService.createMonetaryDonation(data);
    setState({ loading: false, error: result.error || null });
    return result.data || null;
  };

  const createInKindDonation = async (data: CreateInKindDonationDTO) => {
    setState({ loading: true, error: null });
    const result = await donationsService.createInKindDonation(data);
    setState({ loading: false, error: result.error || null });
    return result.data || null;
  };

  const getAllDonations = async (params?: GetDonationsQueryDTO) => {
    setState({ loading: true, error: null });
    const result = await donationsService.getAllDonations(params);
    setState({ loading: false, error: result.error || null });
    return result.data || null;
  };

  const getMyDonations = async (params?: GetDonationsQueryDTO) => {
    setState({ loading: true, error: null });
    const result = await donationsService.getMyDonations(params);
    setState({ loading: false, error: result.error || null });
    return result.data || null;
  };

  const approveDonation = async (id: number) => {
    setState({ loading: true, error: null });
    const result = await donationsService.approveDonation(id);
    setState({ loading: false, error: result.error || null });
    return result.data || null;
  };

  const getDonationInfo = async () => {
    setState({ loading: true, error: null });
    const result = await donationsService.getDonationInfo();
    setState({ loading: false, error: result.error || null });
    return result.data || null;
  };

  const createDonationInfo = async (data: CreateDonationInfoDTO) => {
    setState({ loading: true, error: null });
    const result = await donationsService.createDonationInfo(data);
    setState({ loading: false, error: result.error || null });
    return result.data || null;
  };

  const updateDonationInfo = async (id: number, data: UpdateDonationInfoDTO) => {
    setState({ loading: true, error: null });
    const result = await donationsService.updateDonationInfo(id, data);
    setState({ loading: false, error: result.error || null });
    return result.data || null;
  };

  const getTestimonials = async (limit?: number) => {
    setState({ loading: true, error: null });
    const result = await donationsService.getTestimonials(limit);
    setState({ loading: false, error: result.error || null });
    return result.data || null;
  };

  const getAllTestimonials = async (params?: { skip?: number; take?: number }) => {
    setState({ loading: true, error: null });
    const result = await donationsService.getAllTestimonials(params);
    setState({ loading: false, error: result.error || null });
    return result.data || null;
  };

  const createTestimonial = async (data: CreateTestimonialDTO) => {
    setState({ loading: true, error: null });
    const result = await donationsService.createTestimonial(data);
    setState({ loading: false, error: result.error || null });
    return result.data || null;
  };

  const updateTestimonial = async (id: number, data: UpdateTestimonialDTO) => {
    setState({ loading: true, error: null });
    const result = await donationsService.updateTestimonial(id, data);
    setState({ loading: false, error: result.error || null });
    return result.data || null;
  };

  return {
    ...state,
    clearError,
    createMonetaryDonation,
    createInKindDonation,
    getAllDonations,
    getMyDonations,
    approveDonation,
    getDonationInfo,
    createDonationInfo,
    updateDonationInfo,
    getTestimonials,
    getAllTestimonials,
    createTestimonial,
    updateTestimonial,
  };
};
