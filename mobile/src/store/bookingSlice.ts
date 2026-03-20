import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Booking, BookingStatus } from '../types';
import api from '../services/api';

interface BookingState {
    list: Booking[];
    loading: boolean;
    error: string | null;
}

const initialState: BookingState = {
    list: [],
    loading: false,
    error: null,
};

// Async Thunks
export const fetchMyBookings = createAsyncThunk(
    'bookings/fetchMyBookings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/bookings/me');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch bookings');
        }
    }
);

export const createBooking = createAsyncThunk(
    'bookings/createBooking',
    async (bookingData: { serviceId: number; scheduledAt: string; address: string }, { rejectWithValue }) => {
        try {
            const response = await api.post('/bookings', bookingData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to create booking');
        }
    }
);

export const cancelBooking = createAsyncThunk(
    'bookings/cancelBooking',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.put(`/bookings/${id}/cancel`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to cancel booking');
        }
    }
);

export const fetchBookingById = createAsyncThunk(
    'bookings/fetchBookingById',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.get(`/bookings/${id}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch booking');
        }
    }
);

const bookingSlice = createSlice({
    name: 'bookings',
    initialState,
    reducers: {
        clearBookingError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch My Bookings
            .addCase(fetchMyBookings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyBookings.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchMyBookings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create Booking
            .addCase(createBooking.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createBooking.fulfilled, (state, action) => {
                state.loading = false;
                state.list.unshift(action.payload);
            })
            .addCase(createBooking.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Cancel Booking
            .addCase(cancelBooking.fulfilled, (state, action) => {
                const index = state.list.findIndex(b => b.id === action.payload.id);
                if (index !== -1) {
                    state.list[index] = action.payload;
                }
            })
            // Fetch Booking By Id
            .addCase(fetchBookingById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBookingById.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.list.findIndex(b => b.id === action.payload.id);
                if (index !== -1) {
                    state.list[index] = action.payload;
                } else {
                    state.list.push(action.payload);
                }
            })
            .addCase(fetchBookingById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearBookingError } = bookingSlice.actions;

export default bookingSlice.reducer;
