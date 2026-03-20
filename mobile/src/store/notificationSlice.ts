import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NotificationItem {
    id: string;
    title: string;
    body: string;
    data?: any;
    receivedAt: string;
    isRead: boolean;
}

interface NotificationState {
    list: NotificationItem[];
    unreadCount: number;
}

const initialState: NotificationState = {
    list: [],
    unreadCount: 0,
};

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        addNotification: (state, action: PayloadAction<Omit<NotificationItem, 'isRead' | 'receivedAt'>>) => {
            const newNotif: NotificationItem = {
                ...action.payload,
                receivedAt: new Date().toISOString(),
                isRead: false,
            };
            state.list.unshift(newNotif);
            state.unreadCount += 1;
        },
        markAsRead: (state, action: PayloadAction<string>) => {
            const notif = state.list.find(n => n.id === action.payload);
            if (notif && !notif.isRead) {
                notif.isRead = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        },
        markAllAsRead: (state) => {
            state.list.forEach(n => { n.isRead = true; });
            state.unreadCount = 0;
        },
        clearNotifications: (state) => {
            state.list = [];
            state.unreadCount = 0;
        }
    },
});

export const { addNotification, markAsRead, markAllAsRead, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
