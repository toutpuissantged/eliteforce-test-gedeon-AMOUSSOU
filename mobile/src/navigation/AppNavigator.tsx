import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAppDispatch, useAppSelector } from '../hooks/store';
import { setInitializing, fetchMe } from '../store/authSlice';
import storage from '../services/storage';

import AuthStack from './AuthStack';
import MainStack from './MainStack';
import { ActivityIndicator, View } from 'react-native';
import { theme } from '../theme';
import { useNotifications } from '../hooks/useNotifications';

const Stack = createStackNavigator();

export default function AppNavigator() {
    const dispatch = useAppDispatch();
    const { isAuthenticated, isInitializing } = useAppSelector((state) => state.auth);

    // Initialize Push Notifications Hook
    useNotifications(isAuthenticated);

    useEffect(() => {
        const initializeAuth = async () => {
            const token = await storage.getItem('token');
            if (token) {
                await dispatch(fetchMe());
            } else {
                dispatch(setInitializing(false));
            }
        };

        initializeAuth();
    }, [dispatch]);

    if (isInitializing) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isAuthenticated ? (
                    <Stack.Screen name="Main" component={MainStack} />
                ) : (
                    <Stack.Screen name="Auth" component={AuthStack} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
