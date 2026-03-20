import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    SafeAreaView,
    Dimensions,
    RefreshControl
} from 'react-native';
import { 
    Notification, 
    SearchNormal1, 
    Filter, 
    ShieldTick, 
    Video, 
    Car, 
    Monitor, 
    ClipboardText, 
    Star1,
    ArrowRight
} from 'iconsax-react-native';
import { theme } from '../theme';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { StackScreenProps } from '@react-navigation/stack';
import { BottomTabParamList, MainStackParamList } from '../types/navigation';
import { useAppDispatch, useAppSelector } from '../hooks/store';
import { setServicesFilters, fetchServices } from '../store/servicesSlice';
import Skeleton from '../components/Skeleton';

type Props = CompositeScreenProps<
    BottomTabScreenProps<BottomTabParamList, 'Home'>,
    StackScreenProps<MainStackParamList>
>;

const CATEGORIES = [
    { id: '1', name: 'Protection VIP', icon: ShieldTick, color: '#F9FAFB' },
    { id: '2', name: 'Événementiel', icon: ClipboardText, color: '#F9FAFB' },
    { id: '3', name: 'Vidéosurveillance', icon: Video, color: '#F9FAFB' },
    { id: '4', name: 'Transport Sécurisé', icon: Car, color: '#F9FAFB' },
    { id: '5', name: 'Cybersécurité', icon: Monitor, color: '#F9FAFB' },
    { id: '6', name: 'Audit & Conseil', icon: ClipboardText, color: '#F9FAFB' },
];

const { width } = Dimensions.get('window');

const HomeSkeleton = () => (
    <View style={styles.skeletonContainer}>
        <View style={styles.categoriesGrid}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <View key={i} style={styles.categoryItem}>
                    <Skeleton height={110} borderRadius={20} />
                </View>
            ))}
        </View>
        <View style={styles.sectionHeader}>
            <Skeleton width={150} height={24} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredList}>
            {[1, 2, 3].map((i) => (
                <View key={i} style={[styles.featuredCard, { borderWeight: 0 }]}>
                    <Skeleton height={140} borderRadius={0} />
                    <View style={{ padding: 16 }}>
                        <Skeleton width="40%" height={12} style={{ marginBottom: 8 }} />
                        <Skeleton width="80%" height={18} style={{ marginBottom: 12 }} />
                        <Skeleton width="100%" height={20} />
                    </View>
                </View>
            ))}
        </ScrollView>
    </View>
);

const HomeScreen: React.FC<Props> = ({ navigation }) => {
    const dispatch = useAppDispatch();
    const { list, loading } = useAppSelector((state) => state.services);
    const { user } = useAppSelector((state) => state.auth);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        await dispatch(fetchServices({}));
    };

    useEffect(() => {
        loadData();
    }, [dispatch]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleSearch = () => {
        if (searchQuery.trim()) {
            dispatch(setServicesFilters({ search: searchQuery }));
            navigation.navigate('Search');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.userContainer}>
                        <Image 
                            source={require('../../assets/images/profile.png')} 
                            style={styles.avatar} 
                        />
                        <View style={styles.userInfo}>
                            <Text style={styles.greeting}>Bonjour,</Text>
                            <Text style={styles.userName}>{user?.firstName || 'Utilisateur'}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Notification size={24} color={theme.colors.text.primary} variant="Outline" />
                    </TouchableOpacity>
                </View>

                {/* Title */}
                <View style={styles.titleSection}>
                    <Text style={styles.mainTitle}>Sécurisez Votre Monde</Text>
                    <Text style={styles.subTitle}>avec EliteForce Security.</Text>
                </View>

                {/* Search Bar */}
                <View style={styles.searchSection}>
                    <View style={styles.searchBar}>
                        <SearchNormal1 size={20} color={theme.colors.text.muted} variant="Outline" />
                        <TextInput
                            placeholder="Rechercher une protection..."
                            style={styles.searchInput}
                            placeholderTextColor={theme.colors.text.muted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearch}
                        />
                        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                            <Filter size={20} color={theme.colors.primary} variant="Outline" />
                        </TouchableOpacity>
                    </View>
                </View>

                {loading && !refreshing ? (
                    <HomeSkeleton />
                ) : (
                    <>
                        {/* Categories Grid */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Services Spécialisés</Text>
                        </View>

                        <View style={styles.categoriesGrid}>
                            {CATEGORIES.map((category) => (
                                <TouchableOpacity
                                    key={category.id}
                                    style={styles.categoryItem}
                                    onPress={() => {
                                        dispatch(setServicesFilters({ category: category.name }));
                                        navigation.navigate('Search');
                                    }}
                                >
                                    <View style={styles.categoryCard}>
                                        <category.icon size={28} color={theme.colors.primary} variant="Outline" />
                                        <Text style={styles.categoryName}>{category.name}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Featured Section */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Recommandé pour vous</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Search')} style={styles.seeAllBtn}>
                                <Text style={styles.seeAll}>Voir tout</Text>
                                <ArrowRight size={14} color={theme.colors.primary} variant="Outline" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.featuredList}
                        >
                            {list.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.featuredCard}
                                    onPress={() => navigation.navigate('ServiceDetail', { serviceId: item.id })}
                                >
                                    <Image
                                        source={{ uri: item.image || 'https://images.unsplash.com/photo-1544022485-6bb04439c73d?w=800&q=80' }}
                                        style={styles.featuredImage}
                                    />
                                    <View style={styles.featuredInfo}>
                                        <Text style={styles.itemCategory}>{item.category}</Text>
                                        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                                        <View style={styles.itemFooter}>
                                            <Text style={styles.itemPrice}>{item.basePrice} Dhs</Text>
                                            <View style={styles.ratingRow}>
                                                <Star1 size={14} color="#FFD700" variant="Bold" />
                                                <Text style={styles.ratingText}>{item.rating}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </>
                )}

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
    skeletonContainer: {
        marginTop: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.surface,
    },
    userInfo: {
        marginLeft: 12,
    },
    greeting: {
        fontSize: 12,
        color: theme.colors.text.secondary,
    },
    userName: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text.primary,
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    titleSection: {
        paddingHorizontal: 24,
        marginTop: 32,
    },
    mainTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: theme.colors.text.primary,
        letterSpacing: -0.5,
    },
    subTitle: {
        fontSize: 24,
        fontWeight: '400',
        color: theme.colors.text.secondary,
        marginTop: 2,
    },
    searchSection: {
        paddingHorizontal: 24,
        marginTop: 24,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 15,
        color: theme.colors.text.primary,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: 24,
        marginTop: 40,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: theme.colors.text.primary,
    },
    seeAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    seeAll: {
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: '600',
        marginRight: 4,
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
    },
    categoryItem: {
        width: '50%',
        padding: 8,
    },
    categoryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        height: 110,
    },
    categoryName: {
        fontSize: 11,
        fontWeight: '700',
        color: theme.colors.text.primary,
        textAlign: 'center',
        marginTop: 10,
    },
    featuredList: {
        paddingLeft: 24,
        paddingRight: 8,
    },
    featuredCard: {
        width: width * 0.65,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        marginRight: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
    },
    featuredImage: {
        width: '100%',
        height: 140,
        backgroundColor: '#F3F4F6',
    },
    featuredInfo: {
        padding: 16,
    },
    itemCategory: {
        fontSize: 10,
        fontWeight: '800',
        color: theme.colors.secondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginTop: 4,
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },
    itemPrice: {
        fontSize: 15,
        fontWeight: '800',
        color: theme.colors.text.primary,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginLeft: 4,
    },
});

export default HomeScreen;
