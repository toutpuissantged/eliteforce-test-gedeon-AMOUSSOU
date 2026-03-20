import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    SafeAreaView,
    Dimensions,
    Platform
} from 'react-native';
import { 
    User, 
    Card, 
    Location, 
    Notification, 
    ShieldSecurity, 
    MessageQuestion,
    Logout,
    Camera,
    ArrowRight2
} from 'iconsax-react-native';
import { useAppDispatch, useAppSelector } from '../hooks/store';
import { logout } from '../store/authSlice';
import { theme } from '../theme';
import { useModal } from '../services/modalService';
import Skeleton from '../components/Skeleton';

const { width } = Dimensions.get('window');

const ProfileSkeleton = () => (
    <View style={styles.container}>
        <View style={styles.header}>
            <Skeleton width={100} height={100} borderRadius={32} style={{ marginBottom: 16 }} />
            <Skeleton width={150} height={24} style={{ marginBottom: 8 }} />
            <Skeleton width={200} height={14} />
        </View>
        <View style={styles.statsRow}>
            <Skeleton width={60} height={40} />
            <Skeleton width={60} height={40} />
            <Skeleton width={60} height={40} />
        </View>
        <View style={{ paddingHorizontal: 24, marginTop: 40 }}>
            <Skeleton width="40%" height={20} style={{ marginBottom: 16 }} />
            <View style={styles.menuList}>
                {[1, 2, 3, 4].map((i) => (
                    <View key={i} style={[styles.menuItem, { borderBottomWidth: 0 }]}>
                        <Skeleton width={40} height={40} borderRadius={12} />
                        <Skeleton width="60%" height={16} style={{ marginLeft: 16 }} />
                    </View>
                ))}
            </View>
        </View>
    </View>
);

const ProfileScreen = () => {
    const { user, initializing } = useAppSelector((state) => state.auth);
    const { list: bookings } = useAppSelector((state) => state.bookings);
    const dispatch = useAppDispatch();
    const { showModal } = useModal();

    const handleLogout = () => {
        showModal({
            title: 'Déconnexion',
            message: 'Êtes-vous sûr de vouloir vous déconnecter de votre compte EliteForce ?',
            type: 'confirm',
            confirmText: 'Déconnexion',
            onConfirm: () => {
                dispatch(logout());
            }
        });
    };

    const MENU_ITEMS = [
        { id: '1', title: 'Informations Personnelles', icon: User, color: '#F9FAFB' },
        { id: '2', title: 'Modes de Paiement', icon: Card, color: '#F9FAFB' },
        { id: '3', title: 'Mes Adresses', icon: Location, color: '#F9FAFB' },
        { id: '4', title: 'Notifications', icon: Notification, color: '#F9FAFB' },
        { id: '5', title: 'Sécurité & Confidentialité', icon: ShieldSecurity, color: '#F9FAFB' },
        { id: '6', title: 'Aide & Support', icon: MessageQuestion, color: '#F9FAFB' },
    ];

    if (initializing) {
        return <ProfileSkeleton />;
    }

    const totalSpent = bookings.reduce((acc, curr) => acc + curr.totalPrice, 0);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Profile - Using local profile image */}
                <View style={styles.header}>
                    <View style={styles.profileImageContainer}>
                        <Image
                            source={require('../../assets/images/profile.png')}
                            style={styles.profileImage}
                        />
                        <TouchableOpacity style={styles.editBtn}>
                            <Camera size={18} color="#FFFFFF" variant="Outline" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                </View>

                {/* Stats Section */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{bookings.length}</Text>
                        <Text style={styles.statLabel}>Missions</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{totalSpent}</Text>
                        <Text style={styles.statLabel}>Dhs Payés</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>VIP</Text>
                        <Text style={styles.statLabel}>Statut</Text>
                    </View>
                </View>

                {/* Menu Section */}
                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Paramètres</Text>
                    <View style={styles.menuList}>
                        {MENU_ITEMS.map((item, index) => (
                            <TouchableOpacity 
                                key={item.id} 
                                style={[
                                    styles.menuItem,
                                    index === MENU_ITEMS.length - 1 && { borderBottomWidth: 0 }
                                ]}
                            >
                                <View style={styles.menuIconBox}>
                                    <item.icon size={22} color={theme.colors.text.primary} variant="Outline" />
                                </View>
                                <Text style={styles.menuText}>{item.title}</Text>
                                <ArrowRight2 size={16} color={theme.colors.borderMedium} variant="Outline" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Logout size={22} color="#EF4444" variant="Outline" />
                    <Text style={styles.logoutText}>Se déconnecter</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.version}>EliteForce v1.0.4</Text>
                    <Text style={styles.copyright}>© 2026 EliteForce Security</Text>
                </View>

                <View style={{ height: 100 }} />
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
        alignItems: 'center',
        paddingVertical: 40,
        paddingTop: Platform.OS === 'android' ? 60 : 40,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    profileImageContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 32,
        backgroundColor: '#F3F4F6',
    },
    editBtn: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: theme.colors.primary,
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    userName: {
        fontSize: 24,
        fontWeight: '800',
        color: theme.colors.text.primary,
        letterSpacing: -0.5,
    },
    userEmail: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        marginTop: 4,
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 24,
        marginTop: 24,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statBox: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800',
        color: theme.colors.text.primary,
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        marginTop: 4,
        fontWeight: '600',
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: theme.colors.border,
    },
    menuSection: {
        paddingHorizontal: 24,
        marginTop: 40,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: theme.colors.text.primary,
        marginBottom: 16,
    },
    menuList: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingVertical: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F9FAFB',
    },
    menuIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.text.primary,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 24,
        marginTop: 32,
        height: 60,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FEE2E2',
    },
    logoutText: {
        marginLeft: 10,
        fontSize: 16,
        fontWeight: '700',
        color: '#EF4444',
    },
    footer: {
        alignItems: 'center',
        marginTop: 48,
    },
    version: {
        fontSize: 12,
        color: theme.colors.text.muted,
        fontWeight: '700',
    },
    copyright: {
        fontSize: 11,
        color: theme.colors.text.muted,
        marginTop: 4,
    },
});

export default ProfileScreen;
