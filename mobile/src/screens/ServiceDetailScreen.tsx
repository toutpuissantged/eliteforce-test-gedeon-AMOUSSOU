import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    SafeAreaView,
    ActivityIndicator,
    Platform
} from 'react-native';
import { 
    ArrowLeft, 
    Star1, 
    Clock, 
    ShieldTick, 
    Money,
    CalendarTick
} from 'iconsax-react-native';
import { theme } from '../theme';
import { StackScreenProps } from '@react-navigation/stack';
import { MainStackParamList } from '../types/navigation';
import { useServices } from '../hooks/useServices';
import { useBookings } from '../hooks/useBookings';
import { useModal } from '../services/modalService';
import Skeleton from '../components/Skeleton';
import AddressAutocomplete from '../components/AddressAutocomplete';
import { createBooking } from '../store/bookingSlice';

type Props = StackScreenProps<MainStackParamList, 'ServiceDetail'>;

const DetailSkeleton = () => (
    <View style={styles.container}>
        <Skeleton width="100%" height={380} borderRadius={0} />
        <View style={styles.content}>
            <View style={{ marginBottom: 24 }}>
                <Skeleton width="30%" height={12} style={{ marginBottom: 8 }} />
                <Skeleton width="70%" height={26} />
            </View>
            <View style={styles.infoGrid}>
                <Skeleton width="25%" height={60} borderRadius={16} />
                <Skeleton width="25%" height={60} borderRadius={16} />
                <Skeleton width="25%" height={60} borderRadius={16} />
            </View>
            <Skeleton width="40%" height={20} style={{ marginBottom: 16 }} />
            <Skeleton width="100%" height={15} style={{ marginBottom: 8 }} />
            <Skeleton width="100%" height={15} style={{ marginBottom: 8 }} />
            <Skeleton width="80%" height={15} style={{ marginBottom: 24 }} />
            
            <Skeleton width="50%" height={20} style={{ marginBottom: 16 }} />
            <Skeleton width="100%" height={100} borderRadius={16} />
        </View>
    </View>
);

const ServiceDetailScreen: React.FC<Props> = ({ route, navigation }) => {
    const { serviceId } = route.params;
    const { services, loading: servicesLoading, loadServiceById } = useServices();
    const { loading: bookingLoading, makeBooking } = useBookings();
    const { showModal } = useModal();
    
    const service = services.find(s => s.id === serviceId);

    const [address, setAddress] = useState('');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const [scheduledAt] = useState(tomorrow.toISOString());

    useEffect(() => {
        if (!service) {
            loadServiceById(serviceId);
        }
    }, [serviceId, service, loadServiceById]);

    const handleBooking = async () => {
        if (!address) {
            showModal({
                title: 'Champ requis',
                message: 'Veuillez saisir une adresse pour la prestation.',
                type: 'warning'
            });
            return;
        }

        const resultAction: any = await makeBooking({
            serviceId,
            scheduledAt,
            address,
        });

        if (createBooking.fulfilled.match(resultAction)) {
            const newBooking = resultAction.payload;
            navigation.navigate('Payment', {
                bookingId: newBooking.id,
                amount: newBooking.totalPrice,
                serviceName: service?.name || 'Service'
            });
        } else {
            showModal({
                title: 'Erreur',
                message: resultAction.payload as string || 'Erreur lors de la réservation',
                type: 'error'
            });
        }
    };

    if (servicesLoading && !service) {
        return <DetailSkeleton />;
    }

    if (!service) {
        return (
            <View style={styles.loaderContainer}>
                <Text>Service non trouvé</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Image Section - Flat */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: (service as any).image || 'https://images.unsplash.com/photo-1582910832782-d9055ee1722e?w=800&q=80' }}
                        style={styles.serviceImage}
                    />
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <ArrowLeft size={24} color={theme.colors.text.primary} variant="Outline" />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <View style={styles.headerRow}>
                        <View style={styles.titleCol}>
                            <Text style={styles.serviceCategory}>{service.category}</Text>
                            <Text style={styles.serviceName}>{service.name}</Text>
                        </View>
                        <View style={styles.ratingBadge}>
                            <Star1 size={18} color="#FFD700" variant="Bold" />
                            <Text style={styles.ratingText}>{service.rating}</Text>
                        </View>
                    </View>

                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <Clock size={24} color={theme.colors.primary} variant="Outline" />
                            <Text style={styles.infoLabel}>Durée</Text>
                            <Text style={styles.infoValue}>{service.duration} min</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <ShieldTick size={24} color={theme.colors.primary} variant="Outline" />
                            <Text style={styles.infoLabel}>Sécurité</Text>
                            <Text style={styles.infoValue}>EliteForce</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Money size={24} color={theme.colors.primary} variant="Outline" />
                            <Text style={styles.infoLabel}>Prix</Text>
                            <Text style={styles.infoValue}>{service.basePrice} Dhs</Text>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>À propos du service</Text>
                    <Text style={styles.description}>
                        {service.description} EliteForce garantit une protection de haut niveau avec des agents certifiés et expérimentés.
                    </Text>

                    <Text style={styles.sectionTitle}>Adresse d'intervention</Text>
                    <AddressAutocomplete 
                        value={address}
                        onChangeText={setAddress}
                        placeholder="Rechercher l'adresse de l'intervention"
                    />

                    <Text style={styles.sectionTitle}>Date prévue</Text>
                    <View style={styles.dateBox}>
                        <CalendarTick size={24} color={theme.colors.primary} variant="Outline" />
                        <Text style={styles.dateText}>{new Date(scheduledAt).toLocaleString('fr-FR')}</Text>
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Footer - Flat minimalist */}
            <View style={styles.footer}>
                <View style={styles.priceContainer}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalPrice}>{service.basePrice} Dhs</Text>
                </View>
                <TouchableOpacity
                    style={[styles.bookBtn, bookingLoading && styles.btnDisabled]}
                    onPress={handleBooking}
                    disabled={bookingLoading}
                >
                    {bookingLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.bookBtnText}>Réserver maintenant</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        width: '100%',
        height: 380,
        backgroundColor: '#F3F4F6',
    },
    serviceImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    backBtn: {
        position: 'absolute',
        top: Platform.OS === 'android' ? 44 : 24,
        left: 24,
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    content: {
        padding: 24,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        marginTop: -32,
        backgroundColor: '#FFFFFF',
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    titleCol: {
        flex: 1,
    },
    serviceCategory: {
        fontSize: 12,
        color: theme.colors.secondary,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 4,
    },
    serviceName: {
        fontSize: 26,
        fontWeight: '800',
        color: theme.colors.text.primary,
        letterSpacing: -0.5,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    ratingText: {
        marginLeft: 4,
        fontWeight: '700',
        color: theme.colors.text.primary,
        fontSize: 14,
    },
    infoGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
        backgroundColor: '#F9FAFB',
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    infoItem: {
        alignItems: 'center',
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        marginTop: 8,
        marginBottom: 2,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.text.primary,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: theme.colors.text.primary,
        marginBottom: 16,
        marginTop: 8,
    },
    description: {
        fontSize: 15,
        color: theme.colors.text.secondary,
        lineHeight: 24,
        marginBottom: 24,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        padding: 24,
        paddingBottom: 40,
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    priceContainer: {
        flex: 1,
    },
    totalLabel: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        marginBottom: 2,
    },
    totalPrice: {
        fontSize: 22,
        fontWeight: '800',
        color: theme.colors.text.primary,
    },
    bookBtn: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 32,
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1.5,
    },
    btnDisabled: {
        opacity: 0.6,
    },
    bookBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default ServiceDetailScreen;
