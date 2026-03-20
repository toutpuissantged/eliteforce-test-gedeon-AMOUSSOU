import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './store';
import { fetchMyBookings, fetchBookingById, createBooking, cancelBooking } from '../store/bookingSlice';

export const useBookings = () => {
  const dispatch = useAppDispatch();
  const { list, loading, error } = useAppSelector((state) => state.bookings);

  const loadMyBookings = useCallback(async () => {
    return dispatch(fetchMyBookings());
  }, [dispatch]);

  const loadBookingById = useCallback(async (id: number) => {
    return dispatch(fetchBookingById(id));
  }, [dispatch]);

  const makeBooking = useCallback(async (bookingData: any) => {
    return dispatch(createBooking(bookingData));
  }, [dispatch]);

  const abortBooking = useCallback(async (id: number) => {
    return dispatch(cancelBooking(id));
  }, [dispatch]);

  return {
    bookings: list,
    loading,
    error,
    loadMyBookings,
    loadBookingById,
    makeBooking,
    abortBooking,
  };
};
