/**
 * useEvents Hook
 * Hook para gestión de eventos con estados loading/error
 */

import { useState } from 'react';
import { eventsService } from '@/services/events.service';
import type {
  ApiError,
  CreateEventDTO,
  EventResponse,
  UpdateEventDTO,
  PublishEventResponse,
  DeleteEventResponse,
  GetEventsQueryDTO,
  AdminEventsListResponse,
  GetPublishedEventsQueryDTO,
  PublishedEventsListResponse,
  RegisterToEventDTO,
  EventRegistrationResponse,
  GetRegistrationsQueryDTO,
  EventRegistrationsListResponse,
  CheckInDTO,
  CheckInResponse,
  EventStatisticsResponse,
} from '@/types/api.types';

interface UseEventsState {
  loading: boolean;
  error: ApiError | null;
}

export const useEvents = () => {
  const [state, setState] = useState<UseEventsState>({ loading: false, error: null });

  const clearError = () => setState((s: UseEventsState) => ({ ...s, error: null }));

  const createEvent = async (data: CreateEventDTO) => {
    setState({ loading: true, error: null });
    const result = await eventsService.createEvent(data);
    setState({ loading: false, error: result.error || null });
    return result.data || null;
  };

  const updateEvent = async (id: number, data: UpdateEventDTO) => {
    setState({ loading: true, error: null });
    const result = await eventsService.updateEvent(id, data);
    setState({ loading: false, error: result.error || null });
    return result.data || null;
  };

  const publishEvent = async (id: number) => {
    setState({ loading: true, error: null });
    const result = await eventsService.publishEvent(id);
    setState({ loading: false, error: result.error || null });
    return result.data || null;
  };

  const deleteEvent = async (id: number) => {
    setState({ loading: true, error: null });
    const result = await eventsService.deleteEvent(id);
    setState({ loading: false, error: result.error || null });
    return result.data || null;
  };

  const getAllEvents = async (params?: GetEventsQueryDTO) => {
    setState({ loading: true, error: null });
    const result = await eventsService.getAllEvents(params);
    setState({ loading: false, error: result.error || null });
    return result.data || null;
  };

  const getPublishedEvents = async (params?: GetPublishedEventsQueryDTO) => {
    setState({ loading: true, error: null });
    const result = await eventsService.getPublishedEvents(params);
    setState({ loading: false, error: result.error || null });
    return result.data || null;
  };

  const getEventBySlug = async (slug: string) => {
    setState({ loading: true, error: null });
    const result = await eventsService.getEventBySlug(slug);
    setState({ loading: false, error: result.error || null });
    return result.data || null;
  };

  const registerToEvent = async (data: RegisterToEventDTO) => {
    setState({ loading: true, error: null });
    const result = await eventsService.registerToEvent(data);
    setState({ loading: false, error: result.error || null });
    return result.data || null;
  };

  const getEventRegistrations = async (id: number, params?: GetRegistrationsQueryDTO) => {
    setState({ loading: true, error: null });
    const result = await eventsService.getEventRegistrations(id, params);
    setState({ loading: false, error: result.error || null });
    return result.data || null;
  };

  const checkInRegistration = async (id: number, data: CheckInDTO) => {
    setState({ loading: true, error: null });
    const result = await eventsService.checkInRegistration(id, data);
    setState({ loading: false, error: result.error || null });
    return result.data || null;
  };

  const getEventStatistics = async (id: number) => {
    setState({ loading: true, error: null });
    const result = await eventsService.getEventStatistics(id);
    setState({ loading: false, error: result.error || null });
    return result.data || null;
  };

  return {
    ...state,
    clearError,
    createEvent,
    updateEvent,
    publishEvent,
    deleteEvent,
    getAllEvents,
    getPublishedEvents,
    getEventBySlug,
    registerToEvent,
    getEventRegistrations,
    checkInRegistration,
    getEventStatistics,
  };
};
