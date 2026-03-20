import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import storage from '../services/storage';
import { fetchMe, setToken, setInitializing } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../hooks/store';

import AuthStack from './AuthStack';
import MainStack from './MainStack';

export default function AppNavigator() {
  const { isAuthenticated, isInitializing } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await storage.getItem('token');
        if (token) {
          dispatch(setToken(token));
          await dispatch(fetchMe()).unwrap();
        }
      } catch (e) {
        console.log('Error restoring token:', e);
        await storage.removeItem('token');
      } finally {
        dispatch(setInitializing(false));
      }
    };

    bootstrapAsync();
  }, [dispatch]);

  if (isInitializing) {
    // We could render a splash screen here
    return null;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}