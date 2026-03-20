import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Image,
    ScrollView,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { 
    ArrowLeft, 
    MessageQuestion, 
    Call, 
    TruckFast, 
    TickCircle,
    InfoCircle,
    Status
} from 'iconsax-react-native';
import { theme } from '../theme';
import { StackScreenProps } from '@react-navigation/stack';
import { MainStackParamList } from '../types/navigation';
import io from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '../hooks/store';
import { fetchBookingById } from '../store/bookingSlice';
import { BookingStatus } from '../types';
import { SOCKET_URL } from '../config';
import { useModal } from '../services/modalService';
import Skeleton from '../components/Skeleton';

type Props = StackScreenProps<MainStackParamList, 'Tracking'>;

const INITIAL_STEPS = [
    { id: '1', title: 'Commande confirmée', completed: false },
    { id: '2', title: 'Préparation en cours', completed: false },
    { id: '3', title: 'Prestataire en route', completed: false, active: false },
    { id: '4', title: 'Service terminé', completed: false },
];

const { width } = Dimensions.get('window');

const TrackingSkeleton = () => (
    <View style={styles.container}>
        <Skeleton width="100%" height={320} borderRadius={0} />
        <View style={styles.content}>
            <View style={styles.providerCard}>
                <Skeleton width={56} height={56} borderRadius={20} />
                <View style={{ flex: 1, marginLeft: 16 }}>
                    <Skeleton width="60%" height={18} style={{ marginBottom: 8 }} />
                    <Skeleton width="30%" height={14} />
                </View>
                <Skeleton width={48} height={48} borderRadius={16} />
            </View>
            <View style={{ marginTop: 24 }}>
                {[1, 2, 3, 4].map((i) => (
                    <View key={i} style={{ flexDirection: 'row', marginBottom: 32 }}>
                        <Skeleton width={20} height={20} borderRadius={10} />
                        <View style={{ flex: 1, marginLeft: 16 }}>
                            <Skeleton width="50%" height={16} style={{ marginBottom: 8 }} />
                            <Skeleton width="30%" height={12} />
                        </View>
                    </View>
                ))}
            </View>
        </View>
    </View>
);

const TrackingScreen: React.FC<Props> = ({ navigation, route }) => {
    const dispatch = useAppDispatch();
    const { showModal } = useModal();
    const { bookingId } = route.params;
    const { list: bookings, loading } = useAppSelector(state => state.bookings);
    const booking = bookings.find(b => b.id === bookingId);

    const { token } = useAppSelector(state => state.auth);
    const [location, setLocation] = useState({ latitude: 33.5731, longitude: -7.5898 });
    const [steps, setSteps] = useState(INITIAL_STEPS);

    const updateTimeline = useCallback((newStatus: BookingStatus) => {
        setSteps(prevSteps => prevSteps.map(step => {
            if ([BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS, BookingStatus.COMPLETED].includes(newStatus) && step.id === '1')
                return { ...step, completed: true };
            if ([BookingStatus.IN_PROGRESS, BookingStatus.COMPLETED].includes(newStatus) && step.id === '2')
                return { ...step, completed: true };
            if (newStatus === BookingStatus.IN_PROGRESS && step.id === '3')
                return { ...step, active: true, completed: false };
            if (newStatus === BookingStatus.COMPLETED)
                return { ...step, completed: true, active: false };
            return step;
        }));
    }, []);

    useEffect(() => {
        dispatch(fetchBookingById(bookingId));
    }, [dispatch, bookingId]);

    useEffect(() => {
        if (booking) {
            updateTimeline(booking.status);
        }
    }, [booking, updateTimeline]);

    useEffect(() => {
        if (!token) return;

        const socket = io(SOCKET_URL, {
            auth: { token }
        });

        socket.on('connect', () => {
            socket.emit('join-booking-room', bookingId.toString());
        });

        socket.on('provider-location', (coords: { latitude: number, longitude: number }) => {
            setLocation(coords);
        });

        socket.on('booking-status-update', (data: { status: BookingStatus }) => {
            updateTimeline(data.status);
        });

        socket.on('mission-completed', () => {
            showModal({
                title: 'Mission Terminée',
                message: 'Votre prestation EliteForce est terminée. Merci de nous avoir fait confiance !',
                type: 'success',
                onConfirm: () => navigation.navigate('BottomTabs', { screen: 'Bookings' } as any)
            });
        });

        return () => {
            socket.disconnect();
        };
    }, [bookingId, token, updateTimeline, showModal, navigation]);

    if (loading && !booking) {
        return <TrackingSkeleton />;
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <ArrowLeft size={24} color={theme.colors.text.primary} variant="Outline" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Suivi du service</Text>
                <TouchableOpacity style={styles.iconBtn}>
                    <MessageQuestion size={24} color={theme.colors.text.primary} variant="Outline" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Map Section */}
                <View style={styles.mapWrapper}>
                    <MapView
                        provider={PROVIDER_GOOGLE}
                        style={styles.map}
                        region={{
                            latitude: location.latitude,
                            longitude: location.longitude,
                            latitudeDelta: 0.05,
                            longitudeDelta: 0.05,
                        }}
                    >
                        <Marker coordinate={location}>
                            <View style={styles.markerContainer}>
                                <View style={styles.markerInner}>
                                    <TruckFast size={24} color="#FFF" variant="Bold" />
                                </View>
                            </View>
                        </Marker>
                    </MapView>
                </View>

                {/* Content Panel */}
                <View style={styles.content}>
                    <View style={styles.providerCard}>
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&q=80' }}
                            style={styles.providerAvatar}
                        />
                        <View style={styles.providerDetails}>
                            <Text style={styles.providerName}>
                                {booking?.provider?.firstName || 'Agent'} {booking?.provider?.lastName || 'EliteForce'}
                            </Text>
                            <View style={styles.badgeRow}>
                                <Status size={12} color={theme.colors.success} variant="Bold" />
                                <Text style={styles.statusLabel}>En service</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.callBtn}>
                            <Call size={24} color={theme.colors.primary} variant="Bold" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.timelineHeader}>
                        <InfoCircle size={20} color={theme.colors.text.primary} variant="Outline" />
                        <Text style={styles.sectionTitle}>Progression</Text>
                    </View>

                    <View style={styles.timeline}>
                        {steps.map((step, index) => (
                            <View key={step.id} style={styles.stepWrapper}>
                                <View style={styles.indicatorCol}>
                                    <View style={[
                                        styles.dot,
                                        step.completed && styles.dotCompleted,
                                        step.active && styles.dotActive
                                    ]}>
                                        {step.completed && <TickCircle size={20} color={theme.colors.success} variant="Bold" />}
                                    </View>
                                    {index < steps.length - 1 && (
                                        <View style={[
                                            styles.line,
                                            step.completed && styles.lineCompleted
                                        ]} />
                                    )}
                                </View>
                                <View style={styles.stepContent}>
                                    <Text style={[
                                        styles.stepTitle,
                                        (step.active || step.completed) && styles.stepTitleActive
                                    ]}>{step.title}</Text>
                                    <Text style={styles.stepStatus}>
                                        {step.completed ? 'Terminé' : step.active ? 'En cours' : 'En attente'}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
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
    mapWrapper: {
        height: 320,
        backgroundColor: '#F3F4F6',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    markerContainer: {
        padding: 4,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 20,
    },
    markerInner: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    content: {
        padding: 24,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        backgroundColor: '#FFFFFF',
        marginTop: -32,
        minHeight: 400,
    },
    providerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: 32,
    },
    providerAvatar: {
        width: 56,
        height: 56,
        borderRadius: 20,
        backgroundColor: '#E5E7EB',
    },
    providerDetails: {
        flex: 1,
        marginLeft: 16,
    },
    providerName: {
        fontSize: 17,
        fontWeight: '800',
        color: theme.colors.text.primary,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    statusLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.success,
        marginLeft: 6,
    },
    callBtn: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    timelineHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: theme.colors.text.primary,
        marginLeft: 10,
    },
    timeline: {
        paddingLeft: 4,
    },
    stepWrapper: {
        flexDirection: 'row',
        minHeight: 80,
    },
    indicatorCol: {
        alignItems: 'center',
        width: 32,
    },
    dot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: theme.colors.borderMedium,
        zIndex: 1,
    },
    dotCompleted: {
        backgroundColor: 'transparent',
        width: 20,
        height: 20,
        borderRadius: 10,
        marginLeft: -3,
        marginTop: -3,
    },
    dotActive: {
        backgroundColor: theme.colors.primary,
        borderWidth: 4,
        borderColor: '#EEF2FF',
    },
    line: {
        width: 2,
        flex: 1,
        backgroundColor: theme.colors.border,
        marginVertical: 4,
    },
    lineCompleted: {
        backgroundColor: theme.colors.success,
    },
    stepContent: {
        flex: 1,
        marginLeft: 16,
        paddingTop: -2,
    },
    stepTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.text.muted,
    },
    stepTitleActive: {
        color: theme.colors.text.primary,
        fontWeight: '700',
    },
    stepStatus: {
        fontSize: 12,
        color: theme.colors.text.muted,
        marginTop: 4,
        fontWeight: '500',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
});

export default TrackingScreen;
