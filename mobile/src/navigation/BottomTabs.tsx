import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home2, SearchNormal1, Calendar, User } from 'iconsax-react-native';
import { BottomTabParamList } from '../types/navigation';
import { theme } from '../theme';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import BookingsScreen from '../screens/BookingsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    const iconSize = 24;
                    const variant = focused ? "Bold" : "Outline";

                    if (route.name === 'Home') return <Home2 size={iconSize} color={color} variant={variant} />;
                    if (route.name === 'Search') return <SearchNormal1 size={iconSize} color={color} variant={variant} />;
                    if (route.name === 'Bookings') return <Calendar size={iconSize} color={color} variant={variant} />;
                    if (route.name === 'Profile') return <User size={iconSize} color={color} variant={variant} />;
                    
                    return null;
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.text.muted,
                tabBarShowLabel: true,
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 1,
                    borderTopColor: theme.colors.border,
                    height: 85,
                    paddingBottom: 25,
                    paddingTop: 10,
                    elevation: 0, // No shadow for Android
                    shadowOpacity: 0, // No shadow for iOS
                },
                headerShown: false,
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Accueil' }} />
            <Tab.Screen name="Search" component={SearchScreen} options={{ title: 'Recherche' }} />
            <Tab.Screen name="Bookings" component={BookingsScreen} options={{ title: 'Réservations' }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
        </Tab.Navigator>
    );
}
