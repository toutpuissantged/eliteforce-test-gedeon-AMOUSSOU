import React, { useState, useEffect } from 'react';
import Slider from '@react-native-community/slider';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    TextInput,
    SafeAreaView,
    Platform
} from 'react-native';
import { 
    SearchNormal1, 
    ArrowLeft, 
    Setting4, 
    Star1, 
    AddSquare,
    CloseCircle
} from 'iconsax-react-native';
import { theme } from '../theme';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { StackScreenProps } from '@react-navigation/stack';
import { BottomTabParamList, MainStackParamList } from '../types/navigation';
import { useServices } from '../hooks/useServices';
import Skeleton from '../components/Skeleton';

type Props = CompositeScreenProps<
    BottomTabScreenProps<BottomTabParamList, 'Home'>,
    StackScreenProps<MainStackParamList>
>;

const CATEGORIES = ['All', 'Protection VIP', 'Sécurité Événementielle', 'Vidéosurveillance', 'Cybersécurité', 'Transport Sécurisé', 'Audit et Conseil'];

const SearchSkeleton = () => (
    <View style={{ paddingHorizontal: 24 }}>
        {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={styles.resultCard}>
                <Skeleton width={100} height={100} borderRadius={16} />
                <View style={{ flex: 1, marginLeft: 16, justifyContent: 'center' }}>
                    <Skeleton width="40%" height={12} style={{ marginBottom: 8 }} />
                    <Skeleton width="80%" height={18} style={{ marginBottom: 12 }} />
                    <Skeleton width="60%" height={16} />
                </View>
            </View>
        ))}
    </View>
);

const SearchScreen: React.FC<Props> = ({ navigation }) => {
    const { services, loading, filters, loadServices, updateFilters } = useServices();
    const [searchQuery, setSearchQuery] = useState(filters.search);
    const [priceRange, setPriceRange] = useState(filters.maxPrice || 1000);
    const [rating, setRating] = useState(filters.rating || 0);
    const [refreshing, setRefreshing] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            updateFilters({ search: searchQuery });
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery, updateFilters]);

    useEffect(() => {
        loadServices();
    }, [loadServices]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadServices();
        setRefreshing(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <ArrowLeft size={24} color={theme.colors.text.primary} variant="Outline" />
                </TouchableOpacity>
                <View style={styles.searchBar}>
                    <SearchNormal1 size={20} color={theme.colors.text.muted} variant="Outline" />
                    <TextInput
                        placeholder="Rechercher..."
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={theme.colors.text.muted}
                    />
                </View>
                <TouchableOpacity onPress={() => setShowFilters(!showFilters)} style={[styles.iconBtn, showFilters && styles.iconBtnActive]}>
                    <Setting4 size={24} color={showFilters ? '#FFF' : theme.colors.text.primary} variant="Outline" />
                </TouchableOpacity>
            </View>

            {showFilters && (
                <View style={styles.filtersPanel}>
                    <View style={styles.filterSection}>
                        <Text style={styles.filterTitle}>Prix Maximum: {priceRange} Dhs</Text>
                        <Slider
                            style={{ width: '100%', height: 40 }}
                            minimumValue={0}
                            maximumValue={5000}
                            step={100}
                            value={priceRange}
                            onSlidingComplete={(value: number) => {
                                setPriceRange(value);
                                updateFilters({ maxPrice: value });
                            }}
                            minimumTrackTintColor={theme.colors.primary}
                            maximumTrackTintColor={theme.colors.border}
                            thumbTintColor={theme.colors.primary}
                        />
                    </View>

                    <View style={styles.filterSection}>
                        <Text style={styles.filterTitle}>Note Minimum</Text>
                        <View style={styles.starsRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity
                                    key={star}
                                    onPress={() => {
                                        const newRating = rating === star ? 0 : star;
                                        setRating(newRating);
                                        updateFilters({ rating: newRating });
                                    }}
                                    style={styles.starTouch}
                                >
                                    <Star1
                                        size={28}
                                        color={star <= rating ? "#FFD700" : theme.colors.borderMedium}
                                        variant={star <= rating ? "Bold" : "Outline"}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            )}

            <View style={styles.categoryContainer}>
                <FlatList
                    data={CATEGORIES}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryList}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.categoryChip,
                                (filters.category === item || (item === 'All' && !filters.category)) && styles.categoryChipSelected
                            ]}
                            onPress={() => updateFilters({ category: item === 'All' ? '' : item })}
                        >
                            <Text style={[
                                styles.categoryText,
                                (filters.category === item || (item === 'All' && !filters.category)) && styles.categoryTextSelected
                            ]}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {loading && !refreshing ? (
                <SearchSkeleton />
            ) : (
                <FlatList
                    data={services}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.resultsList}
                    showsVerticalScrollIndicator={false}
                    onRefresh={onRefresh}
                    refreshing={refreshing}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.resultCard}
                            onPress={() => navigation.navigate('ServiceDetail', { serviceId: item.id })}
                        >
                            <Image
                                source={{ uri: (item as any).image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6954?w=800&q=80' }}
                                style={styles.resultImage}
                            />
                            <View style={styles.resultInfo}>
                                <View style={styles.resultHeader}>
                                    <Text style={styles.resultCategory}>{item.category}</Text>
                                    <View style={styles.ratingBox}>
                                        <Star1 size={12} color="#FFD700" variant="Bold" />
                                        <Text style={styles.ratingText}>{item.rating}</Text>
                                    </View>
                                </View>
                                <Text style={styles.resultName}>{item.name}</Text>
                                <View style={styles.resultFooter}>
                                    <Text style={styles.resultPrice}>{item.basePrice} Dhs</Text>
                                    <View style={styles.addBtn}>
                                        <AddSquare size={24} color={theme.colors.primary} variant="Outline" />
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyState}>
                            <CloseCircle size={60} color={theme.colors.borderMedium} variant="Outline" />
                            <Text style={styles.emptyText}>Aucun résultat trouvé</Text>
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'android' ? 40 : 16,
        paddingBottom: 16,
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
    iconBtnActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 48,
        marginHorizontal: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        color: theme.colors.text.primary,
    },
    filtersPanel: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    filterSection: {
        marginTop: 16,
    },
    filterTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginBottom: 8,
    },
    starsRow: {
        flexDirection: 'row',
    },
    starTouch: {
        marginRight: 12,
    },
    categoryContainer: {
        paddingVertical: 16,
    },
    categoryList: {
        paddingHorizontal: 24,
    },
    categoryChip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        marginRight: 10,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    categoryChipSelected: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    categoryText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.text.secondary,
    },
    categoryTextSelected: {
        color: '#FFFFFF',
    },
    resultsList: {
        paddingHorizontal: 24,
    },
    resultCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    resultImage: {
        width: 100,
        height: 100,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
    },
    resultInfo: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'center',
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    resultCategory: {
        fontSize: 10,
        fontWeight: '800',
        color: theme.colors.secondary,
        textTransform: 'uppercase',
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    ratingText: {
        fontSize: 11,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginLeft: 3,
    },
    resultName: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginVertical: 4,
    },
    resultFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    resultPrice: {
        fontSize: 15,
        fontWeight: '800',
        color: theme.colors.text.primary,
    },
    addBtn: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 15,
        color: theme.colors.text.muted,
        marginTop: 16,
        fontWeight: '500',
    },
});

export default SearchScreen;
