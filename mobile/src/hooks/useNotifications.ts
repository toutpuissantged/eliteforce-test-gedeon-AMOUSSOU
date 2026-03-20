import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useAppDispatch } from './store';
import { addNotification } from '../store/notificationSlice';
import { useModal } from '../services/modalService';

export const useNotifications = (isAuthenticated: boolean) => {
    const dispatch = useAppDispatch();
    const { showModal } = useModal();
    const notificationListener = useRef<any>();
    const responseListener = useRef<any>();

    useEffect(() => {
        if (!isAuthenticated) return;

        // Listener for foreground notifications
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            const { title, body, data } = notification.request.content;
            
            // Add to Redux state
            dispatch(addNotification({
                id: notification.request.identifier,
                title: title || 'Notification',
                body: body || '',
                data: data,
            }));

            // Show Custom Modal if app is in foreground
            showModal({
                title: title || 'Alerte EliteForce',
                message: body || '',
                type: 'info'
            });
        });

        // Listener for when user clicks on a notification
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            const { notification } = response;
            const { title, body, data } = notification.request.content;

            dispatch(addNotification({
                id: notification.request.identifier,
                title: title || 'Notification',
                body: body || '',
                data: data,
            }));
            
            // Logic to navigate can be added here if needed
        });

        return () => {
            Notifications.removeNotificationSubscription(notificationListener.current);
            Notifications.removeNotificationSubscription(responseListener.current);
        };
    }, [isAuthenticated, dispatch, showModal]);
};
