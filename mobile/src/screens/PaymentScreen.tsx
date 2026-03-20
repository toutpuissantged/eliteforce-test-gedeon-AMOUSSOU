import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
} from 'react-native';
import { 
    ArrowLeft, 
    CardPos, 
    SecuritySafe, 
    Lock1, 
    InfoCircle
} from 'iconsax-react-native';
import { theme } from '../theme';
import { StackScreenProps } from '@react-navigation/stack';
import { MainStackParamList } from '../types/navigation';
import { useStripe, CardField } from '@stripe/stripe-react-native';
import api from '../services/api';
import { useModal } from '../services/modalService';
import Skeleton from '../components/Skeleton';

type Props = StackScreenProps<MainStackParamList, 'Payment'>;

const PaymentSkeleton = () => (
    <View style={styles.scrollContent}>
        <Skeleton width="100%" height={200} borderRadius={24} style={{ marginBottom: 32 }} />
        <Skeleton width="40%" height={20} style={{ marginBottom: 16 }} />
        <Skeleton width="100%" height={150} borderRadius={24} />
    </View>
);

const PaymentScreen: React.FC<Props> = ({ route, navigation }) => {
    const { amount, serviceName, bookingId } = route.params;
    const [loading, setLoading] = useState(false);
    const { confirmPayment } = useStripe();
    const [cardDetails, setCardDetails] = useState<any>(null);
    const { showModal } = useModal();

    const handlePayment = async () => {
        if (!cardDetails?.complete) {
            showModal({
                title: 'Détails manquants',
                message: 'Veuillez saisir les détails complets de votre carte bancaire.',
                type: 'warning'
            });
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/payments/create-intent', { bookingId });
            const { clientSecret } = response.data;

            const { error, paymentIntent } = await confirmPayment(clientSecret, {
                paymentMethodType: 'Card',
            });

            if (error) {
                showModal({
                    title: 'Paiement échoué',
                    message: error.message || 'Une erreur est survenue lors du paiement.',
                    type: 'error'
                });
            } else if (paymentIntent) {
                showModal({
                    title: 'Succès',
                    message: 'Votre paiement a été validé avec succès !',
                    type: 'success',
                    onConfirm: () => navigation.navigate('Tracking', { bookingId })
                });
            }
        } catch (error: any) {
            console.error(error);
            showModal({
                title: 'Erreur Serveur',
                message: error.response?.data?.message || 'Impossible de traiter le paiement pour le moment.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <ArrowLeft size={24} color={theme.colors.text.primary} variant="Outline" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Paiement</Text>
                <View style={{ width: 48 }} />
            </View>

            {loading ? (
                <PaymentSkeleton />
            ) : (
                <>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {/* Order Summary - Flat box */}
                        <View style={styles.summaryCard}>
                            <View style={styles.summaryHeader}>
                                <InfoCircle size={20} color={theme.colors.text.primary} variant="Outline" />
                                <Text style={styles.summaryTitle}>Résumé de la commande</Text>
                            </View>
                            
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>{serviceName}</Text>
                                <Text style={styles.summaryValue}>{amount.toFixed(2)} Dhs</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Frais de service</Text>
                                <Text style={styles.summaryValue}>0.00 Dhs</Text>
                            </View>
                            
                            <View style={styles.divider} />
                            
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Montant Total</Text>
                                <Text style={styles.totalValue}>{amount.toFixed(2)} Dhs</Text>
                            </View>
                        </View>

                        {/* Card Input Section */}
                        <Text style={styles.sectionTitle}>Détails de la carte</Text>
                        <View style={styles.cardWrapper}>
                            <View style={styles.cardHeader}>
                                <CardPos size={24} color={theme.colors.text.primary} variant="Outline" />
                                <Text style={styles.cardHeaderText}>Carte Bancaire</Text>
                            </View>
                            
                            <CardField
                                postalCodeEnabled={false}
                                onCardChange={(details) => setCardDetails(details)}
                                style={styles.cardField}
                                cardStyle={{
                                    backgroundColor: '#FFFFFF',
                                    textColor: '#000000',
                                    borderRadius: 12,
                                }}
                            />

                            <View style={styles.secureNote}>
                                <Lock1 size={14} color={theme.colors.success} variant="Bold" />
                                <Text style={styles.secureNoteText}>Paiement chiffré et sécurisé</Text>
                            </View>
                        </View>

                        {/* Stripe Trust Badge */}
                        <View style={styles.trustBadge}>
                            <SecuritySafe size={24} color={theme.colors.text.muted} variant="Outline" />
                            <Text style={styles.trustText}>Propulsé par Stripe</Text>
                        </View>
                    </ScrollView>

                    {/* Bottom Button - Flat and minimalist */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.payBtn, (loading || !cardDetails?.complete) && styles.payBtnDisabled]}
                            onPress={handlePayment}
                            disabled={loading || !cardDetails?.complete}
                        >
                            <Text style={styles.payBtnText}>Payer {amount.toFixed(2)} Dhs</Text>
                            <Lock1 size={18} color="#FFF" variant="Outline" style={{ marginLeft: 8 }} />
                        </TouchableOpacity>
                    </View>
                </>
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
    scrollContent: {
        padding: 24,
    },
    summaryCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: 32,
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginLeft: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 14,
        color: theme.colors.text.secondary,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text.primary,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.borderMedium,
        marginVertical: 16,
        borderStyle: 'dashed',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '800',
        color: theme.colors.text.primary,
    },
    totalValue: {
        fontSize: 20,
        fontWeight: '900',
        color: theme.colors.primary,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: theme.colors.text.primary,
        marginBottom: 16,
    },
    cardWrapper: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardHeaderText: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginLeft: 12,
    },
    cardField: {
        width: '100%',
        height: 50,
        marginBottom: 20,
    },
    secureNote: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 8,
    },
    secureNoteText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.success,
        marginLeft: 6,
    },
    trustBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
    },
    trustText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.text.muted,
        marginLeft: 10,
    },
    footer: {
        padding: 24,
        paddingBottom: 40,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    payBtn: {
        backgroundColor: theme.colors.primary,
        height: 60,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    payBtnDisabled: {
        opacity: 0.5,
    },
    payBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default PaymentScreen;
