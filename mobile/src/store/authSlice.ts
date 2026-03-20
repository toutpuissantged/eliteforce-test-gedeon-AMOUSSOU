import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../types';
import api from '../services/api';
import storage from '../services/storage';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    isInitializing: boolean;
    error: string | null;
    fieldErrors: Record<string, string>;
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    isInitializing: true,
    error: null,
    fieldErrors: {},
};

// Async Thunks
export const login = createAsyncThunk(
    'auth/login',
    async (credentials: any, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/login', credentials);
            await storage.setItem('token', response.data.token);
            return response.data;
        } catch (error: any) {
            if (error.response?.data?.errors) {
                return rejectWithValue(error.response.data.errors);
            }
            return rejectWithValue(error.message || 'Login failed');
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (userData: any, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/register', userData);
            await storage.setItem('token', response.data.token);
            return response.data;
        } catch (error: any) {
            if (error.response?.data?.errors) {
                return rejectWithValue(error.response.data.errors);
            }
            return rejectWithValue(error.message || 'Registration failed');
        }
    }
);

export const fetchMe = createAsyncThunk(
    'auth/fetchMe',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/auth/me');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch user');
        }
    }
);

export const logout = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
    await storage.removeItem('token');
    dispatch(authSlice.actions.clearAuthState());
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setToken: (state, action: PayloadAction<string | null>) => {
            state.token = action.payload;
            state.isAuthenticated = !!action.payload;
        },
        clearAuthState: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
        },
        clearError: (state) => {
            state.error = null;
            state.fieldErrors = {};
        },
        setInitializing: (state, action: PayloadAction<boolean>) => {
            state.isInitializing = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.fieldErrors = {};
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                if (Array.isArray(action.payload)) {
                    state.fieldErrors = action.payload.reduce((acc: any, curr: any) => {
                        if (curr.path) acc[curr.path] = curr.msg;
                        return acc;
                    }, {});
                    state.error = 'Please check the errors below';
                } else {
                    state.error = action.payload as string;
                }
            })
            // Register
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.fieldErrors = {};
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                if (Array.isArray(action.payload)) {
                    state.fieldErrors = action.payload.reduce((acc: any, curr: any) => {
                        if (curr.path) acc[curr.path] = curr.msg;
                        return acc;
                    }, {});
                    state.error = 'Registration failed. Please check the fields.';
                } else {
                    state.error = action.payload as string;
                }
            })
            // Fetch Me
            .addCase(fetchMe.pending, (state) => {
                state.isInitializing = true;
            })
            .addCase(fetchMe.fulfilled, (state, action) => {
                state.isInitializing = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(fetchMe.rejected, (state) => {
                state.isInitializing = false;
                state.isAuthenticated = false;
                state.token = null;
                state.user = null;
            });
    },
});

export const { setToken, clearAuthState, clearError, setInitializing } = authSlice.actions;

export default authSlice.reducer;
