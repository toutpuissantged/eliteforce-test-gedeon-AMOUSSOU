import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { 
    ArrowLeft, 
    Notification, 
    NotificationStatus,
    TickCircle,
    Trash
} from 'iconsax-react-native';
import { theme } from '../theme';
import { StackScreenProps } from '@react-navigation/stack';
import { MainStackParamList } from '../types/navigation';
import { useAppDispatch, useAppSelector } from '../hooks/store';
import { markAllAsRead, markAsRead, clearNotifications } from '../store/notificationSlice';

type Props = StackScreenProps<MainStackParamList, 'Notifications'>;

const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
    const dispatch = useAppDispatch();
    const { list: notifications } = useAppSelector((state) => state.notifications);

    useEffect(() => {
        // Mark all as read when entering screen (optional)
        // dispatch(markAllAsRead());
    }, []);

    const handleMarkAsRead = (id: string) => {
        dispatch(markAsRead(id));
    };

    const handleClearAll = () => {
        dispatch(clearNotifications());
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity 
            style={[styles.notifCard, !item.isRead && styles.unreadCard]}
            onPress={() => handleMarkAsRead(item.id)}
        >
            <View style={styles.iconContainer}>
                <Notification size={24} color={item.isRead ? theme.colors.text.muted : theme.colors.primary} variant="Outline" />
                {!item.isRead && <View style={styles.unreadDot} />}
            </View>
            <View style={styles.content}>
                <Text style={[styles.title, !item.isRead && styles.unreadText]}>{item.title}</Text>
                <Text style={styles.body}>{item.body}</Text>
                <Text style={styles.time}>{new Date(item.receivedAt).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <ArrowLeft size={24} color={theme.colors.text.primary} variant="Outline" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <TouchableOpacity onPress={handleClearAll} style={styles.iconBtn}>
                    <Trash size={24} color={theme.colors.error} variant="Outline" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={renderItem}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <NotificationStatus size={64} color={theme.colors.borderMedium} variant="Outline" />
                        <Text style={styles.emptyTitle}>Boîte de réception vide</Text>
                        <Text style={styles.emptyDesc}>Vous n'avez pas de nouvelles notifications pour le moment.</Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    iconBtn: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: theme.colors.text.primary,
    },
    listContent: {
        padding: 24,
    },
    notifCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 20,
        backgroundColor: '#F9FAFB',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    unreadCard: {
        backgroundColor: '#FFFFFF',
        borderColor: theme.colors.primary,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    unreadDot: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.primary,
    },
    content: {
        flex: 1,
        marginLeft: 16,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.text.secondary,
        marginBottom: 4,
    },
    unreadText: {
        fontWeight: '800',
        color: theme.colors.text.primary,
    },
    body: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        lineHeight: 20,
    },
    time: {
        fontSize: 12,
        color: theme.colors.text.muted,
        marginTop: 8,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: theme.colors.text.primary,
        marginTop: 16,
    },
    emptyDesc: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 40,
    },
});

export default NotificationsScreen;
