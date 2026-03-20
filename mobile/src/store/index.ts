import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import servicesReducer from './servicesSlice';
import bookingReducer from './bookingSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        services: servicesReducer,
        bookings: bookingReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
