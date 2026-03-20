import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './store';
import { fetchServices, fetchServiceById, setServicesFilters } from '../store/servicesSlice';

export const useServices = () => {
  const dispatch = useAppDispatch();
  const { list, loading, error, filters } = useAppSelector((state) => state.services);

  const loadServices = useCallback(async (newFilters?: any) => {
    if (newFilters) {
      dispatch(setServicesFilters(newFilters));
    }
    return dispatch(fetchServices(newFilters || filters));
  }, [dispatch, filters]);

  const loadServiceById = useCallback(async (id: number) => {
    return dispatch(fetchServiceById(id));
  }, [dispatch]);

  const updateFilters = useCallback((newFilters: any) => {
    dispatch(setServicesFilters(newFilters));
  }, [dispatch]);

  return {
    services: list,
    loading,
    error,
    filters,
    loadServices,
    loadServiceById,
    updateFilters,
  };
};
