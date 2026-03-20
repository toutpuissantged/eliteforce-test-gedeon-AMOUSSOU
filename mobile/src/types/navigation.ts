import { Service } from './index';

export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
};

export type BottomTabParamList = {
    Home: undefined;
    Search: undefined;
    Bookings: undefined;
    Profile: undefined;
};

export type MainStackParamList = {
    BottomTabs: { screen?: keyof BottomTabParamList; params?: any };
    ServiceDetail: { serviceId: number };
    Payment: { bookingId: number; amount: number; serviceName: string };
    Tracking: { bookingId: number };
    Notifications: undefined;
};
