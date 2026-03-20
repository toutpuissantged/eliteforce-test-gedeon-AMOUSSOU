import { Platform } from 'react-native';
import * as Device from 'expo-device';

const ENV_API_URL = process.env.API_URL || process.env.EXPO_PUBLIC_API_URL;
const BACKEND_PORT = 6000;

const getBaseUrl = () => {
    // Android emulator specific logic
    if (Platform.OS === 'android' && !Device.isDevice) {
        console.log('🤖 Android Emulator detected, using 10.0.2.2');
        return `http://10.0.2.2:${BACKEND_PORT}/api`;
    }

    if (ENV_API_URL) {
        return ENV_API_URL.endsWith('/api') ? ENV_API_URL : `${ENV_API_URL}/api`;
    }

    return Platform.OS === 'android'
        ? `http://10.0.2.2:${BACKEND_PORT}/api`
        : `http://localhost:${BACKEND_PORT}/api`;
};

const getSocketUrl = () => {
    if (Platform.OS === 'android' && !Device.isDevice) {
        return `http://10.0.2.2:${BACKEND_PORT}`;
    }
    return ENV_API_URL || `http://localhost:${BACKEND_PORT}`;
};

export const BASE_URL = getBaseUrl();
export const SOCKET_URL = getSocketUrl();
