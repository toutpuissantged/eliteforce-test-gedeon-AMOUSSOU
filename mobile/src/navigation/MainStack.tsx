import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MainStackParamList } from '../types/navigation';
import BottomTabs from './BottomTabs';
import PaymentScreen from '../screens/PaymentScreen';
import ServiceDetailScreen from '../screens/ServiceDetailScreen';
import TrackingScreen from '../screens/TrackingScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

const Stack = createStackNavigator<MainStackParamList>();

export default function MainStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="BottomTabs" component={BottomTabs} />
            <Stack.Screen
                name="Payment"
                component={PaymentScreen}
                options={{ headerShown: true, title: 'Paiement' }}
            />
            <Stack.Screen
                name="ServiceDetail"
                component={ServiceDetailScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Tracking"
                component={TrackingScreen}
                options={{ headerShown: true, title: 'Suivi Prestataire' }}
            />
            <Stack.Screen
                name="Notifications"
                component={NotificationsScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}
