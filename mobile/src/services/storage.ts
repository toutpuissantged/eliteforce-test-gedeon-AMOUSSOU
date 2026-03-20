import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, NativeModules } from 'react-native';

const storage = {
    getItem: async (key: string): Promise<string | null> => {
        try {
            // Check for web environment or lack of native AsyncStorage
            if (Platform.OS === 'web' || typeof window !== 'undefined') {
                if (typeof localStorage !== 'undefined') {
                    return localStorage.getItem(key);
                }
            }

            // On native, check if the native module actually exists to avoid the "Native module is null" error
            const isNativeModuleAvailable =
                NativeModules.RNCAsyncStorage ||
                NativeModules.RCTAsyncStorage ||
                NativeModules.AsyncStorage;

            if (isNativeModuleAvailable && AsyncStorage && typeof AsyncStorage.getItem === 'function') {
                return await AsyncStorage.getItem(key);
            }

            // Fallback for environments with broken native modules
            return null;
        } catch (error) {
            console.error('Storage getItem error:', error);
            return null;
        }
    },
    setItem: async (key: string, value: string): Promise<void> => {
        try {
            if (Platform.OS === 'web' || typeof window !== 'undefined') {
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem(key, value);
                    return;
                }
            }

            const isNativeModuleAvailable =
                NativeModules.RNCAsyncStorage ||
                NativeModules.RCTAsyncStorage ||
                NativeModules.AsyncStorage;

            if (isNativeModuleAvailable && AsyncStorage && typeof AsyncStorage.setItem === 'function') {
                await AsyncStorage.setItem(key, value);
            }
        } catch (error) {
            console.error('Storage setItem error:', error);
        }
    },
    removeItem: async (key: string): Promise<void> => {
        try {
            if (Platform.OS === 'web' || typeof window !== 'undefined') {
                if (typeof localStorage !== 'undefined') {
                    localStorage.removeItem(key);
                    return;
                }
            }

            const isNativeModuleAvailable =
                NativeModules.RNCAsyncStorage ||
                NativeModules.RCTAsyncStorage ||
                NativeModules.AsyncStorage;

            if (isNativeModuleAvailable && AsyncStorage && typeof AsyncStorage.removeItem === 'function') {
                await AsyncStorage.removeItem(key);
            }
        } catch (error) {
            console.error('Storage removeItem error:', error);
        }
    }
};

export default storage;
