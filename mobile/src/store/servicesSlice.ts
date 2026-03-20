import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Service } from '../types';
import api from '../services/api';

interface ServicesState {
    list: Service[];
    loading: boolean;
    error: string | null;
    filters: {
        search: string;
        category: string;
        minPrice: number | null;
        maxPrice: number | null;
        rating: number | null;
    };
}

const initialState: ServicesState = {
    list: [],
    loading: false,
    error: null,
    filters: {
        search: '',
        category: '',
        minPrice: null,
        maxPrice: null,
        rating: null,
    },
};

// Async Thunks
export const fetchServices = createAsyncThunk(
    'services/fetchServices',
    async (filters: Partial<ServicesState['filters']>, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.category) params.append('category', filters.category);
            if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
            if (filters.rating) params.append('rating', filters.rating.toString());

            const response = await api.get(`/services?${params.toString()}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch services');
        }
    }
);

export const fetchServiceById = createAsyncThunk(
    'services/fetchServiceById',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.get(`/services/${id}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch service');
        }
    }
);

const servicesSlice = createSlice({
    name: 'services',
    initialState,
    reducers: {
        setServicesFilters: (state, action: PayloadAction<Partial<ServicesState['filters']>>) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearServicesFilters: (state) => {
            state.filters = initialState.filters;
        },
        clearServicesError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Services
            .addCase(fetchServices.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchServices.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchServices.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch Service By Id
            .addCase(fetchServiceById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchServiceById.fulfilled, (state, action) => {
                state.loading = false;
                // You might want to store a single selected service here if needed
            })
            .addCase(fetchServiceById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    setServicesFilters,
    clearServicesFilters,
    clearServicesError,
} = servicesSlice.actions;

export default servicesSlice.reducer;
