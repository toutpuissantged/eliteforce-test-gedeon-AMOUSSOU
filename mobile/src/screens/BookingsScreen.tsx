import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    Image,
    RefreshControl,
    Dimensions
} from 'react-native';
import { 
    Calendar, 
    Clock, 
    ArrowRight2, 
    CalendarRemove
} from 'iconsax-react-native';
import { theme } from '../theme';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { StackScreenProps } from '@react-navigation/stack';
import { BottomTabParamList, MainStackParamList } from '../types/navigation';
import { useAppDispatch, useAppSelector } from '../hooks/store';
import { fetchMyBookings } from '../store/bookingSlice';
import { BookingStatus } from '../types';
import Skeleton from '../components/Skeleton';

type Props = CompositeScreenProps<
    BottomTabScreenProps<BottomTabParamList, 'Bookings'>,
    StackScreenProps<MainStackParamList>
>;

const { width } = Dimensions.get('window');

const BookingsSkeleton = () => (
    <View style={{ padding: 24 }}>
        {[1, 2, 3].map((i) => (
            <View key={i} style={styles.card}>
                <View style={styles.cardHeader}>
                    <Skeleton width={48} height={48} borderRadius={12} />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                        <Skeleton width="30%" height={10} style={{ marginBottom: 6 }} />
                        <Skeleton width="60%" height={16} />
                    </View>
                    <Skeleton width={80} height={24} borderRadius={8} />
                </View>
                <View style={styles.divider} />
                <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                    <Skeleton width={100} height={14} style={{ marginRight: 20 }} />
                    <Skeleton width={80} height={14} />
                </View>
                <Skeleton width="100%" height={40} borderRadius={12} />
            </View>
        ))}
    </View>
);

const BookingsScreen: React.FC<Props> = ({ navigation }) => {
    const dispatch = useAppDispatch();
    const { list: bookings, loading } = useAppSelector((state) => state.bookings);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        dispatch(fetchMyBookings());
    }, [dispatch]);

    const onRefresh = async () => {
        setRefreshing(true);
        await dispatch(fetchMyBookings());
        setRefreshing(false);
    };

    const getStatusStyle = (status: BookingStatus) => {
        switch (status) {
            case BookingStatus.IN_PROGRESS: return { bg: '#F9FAFB', text: theme.colors.primary, label: 'En Cours' };
            case BookingStatus.COMPLETED: return { bg: '#F0FDF4', text: '#15803D', label: 'Terminé' };
            case BookingStatus.CANCELLED: return { bg: '#FEF2F2', text: '#B91C1C', label: 'Annulé' };
            case BookingStatus.CONFIRMED: return { bg: '#EEF2FF', text: '#4F46E5', label: 'Confirmé' };
            default: return { bg: '#F9FAFB', text: '#4B5563', label: 'En Attente' };
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const statusStyle = getStatusStyle(item.status);
        const canTrack = [BookingStatus.IN_PROGRESS, BookingStatus.CONFIRMED].includes(item.status);

        return (
            <TouchableOpacity 
                style={styles.card}
                onPress={() => canTrack && navigation.navigate('Tracking', { bookingId: item.id })}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.serviceBox}>
                        <Image
                            source={{ uri: item.service?.image || 'https://images.unsplash.com/photo-1544022485-6bb04439c73d?w=200&q=80' }}
                            style={styles.serviceImage}
                        />
                        <View style={styles.serviceTexts}>
                            <Text style={styles.categoryName}>{item.service?.category}</Text>
                            <Text style={styles.serviceName} numberOfLines={1}>{item.service?.name}</Text>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.cardDetails}>
                    <View style={styles.detailItem}>
                        <Calendar size={18} color={theme.colors.text.muted} variant="Outline" />
                        <Text style={styles.detailText}>{new Date(item.scheduledAt).toLocaleDateString('fr-FR')}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Clock size={18} color={theme.colors.text.muted} variant="Outline" />
                        <Text style={styles.detailText}>{new Date(item.scheduledAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <View>
                        <Text style={styles.priceLabel}>Total payé</Text>
                        <Text style={styles.priceValue}>{item.totalPrice} Dhs</Text>
                    </View>
                    {canTrack && (
                        <View style={styles.trackAction}>
                            <Text style={styles.trackText}>Suivre</Text>
                            <ArrowRight2 size={16} color={theme.colors.primary} variant="Outline" />
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mes Réservations</Text>
            </View>

            {loading && !refreshing && bookings.length === 0 ? (
                <BookingsSkeleton />
            ) : (
                <FlatList
                    data={bookings}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
                    }
                    renderItem={renderItem}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyState}>
                            <CalendarRemove size={64} color={theme.colors.borderMedium} variant="Outline" />
                            <Text style={styles.emptyTitle}>Aucune réservation</Text>
                            <Text style={styles.emptyDesc}>Vous n'avez pas encore de réservations de services.</Text>
                            <TouchableOpacity 
                                style={styles.browseBtn}
                                onPress={() => navigation.navigate('Home')}
                            >
                                <Text style={styles.browseBtnText}>Découvrir les services</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: theme.colors.text.primary,
        letterSpacing: -0.5,
    },
    listContent: {
        padding: 24,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    serviceBox: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    serviceImage: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
    },
    serviceTexts: {
        marginLeft: 12,
        flex: 1,
    },
    categoryName: {
        fontSize: 10,
        fontWeight: '800',
        color: theme.colors.secondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    serviceName: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        marginLeft: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: 16,
    },
    cardDetails: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    detailText: {
        fontSize: 13,
        color: theme.colors.text.secondary,
        marginLeft: 6,
        fontWeight: '500',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 12,
    },
    priceLabel: {
        fontSize: 10,
        color: theme.colors.text.muted,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    priceValue: {
        fontSize: 16,
        fontWeight: '800',
        color: theme.colors.text.primary,
    },
    trackAction: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    trackText: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.primary,
        marginRight: 4,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 80,
    },
    emptyTitle: {
        fontSize: 20,
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
        lineHeight: 20,
    },
    browseBtn: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 16,
        marginTop: 24,
    },
    browseBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
});

export default BookingsScreen;
