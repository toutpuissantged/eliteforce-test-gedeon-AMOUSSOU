import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { Location, Gps } from 'iconsax-react-native';
import { theme } from '../theme';
import { LocationService, AddressSuggestion } from '../services/locationService';

interface Props {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    onAddressSelect?: (address: string) => void;
}

const AddressAutocomplete: React.FC<Props> = ({ 
    value, 
    onChangeText, 
    placeholder = "Entrez l'adresse...", 
    onAddressSelect 
}) => {
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const fetchSuggestions = useCallback(async (query: string) => {
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }

        setLoading(true);
        const results = await LocationService.searchAddress(query);
        setSuggestions(results);
        setLoading(false);
        setShowSuggestions(true);
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (showSuggestions) {
                fetchSuggestions(value);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [value, fetchSuggestions]);

    const handleSelect = (suggestion: AddressSuggestion) => {
        const fullAddress = suggestion.display_name;
        onChangeText(fullAddress);
        onAddressSelect?.(fullAddress);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.inputWrapper}>
                <Location size={20} color={theme.colors.text.muted} style={styles.inputIcon} variant="Outline" />
                <TextInput
                    style={styles.addressInput}
                    placeholder={placeholder}
                    placeholderTextColor={theme.colors.text.muted}
                    value={value}
                    onChangeText={(text) => {
                        onChangeText(text);
                        setShowSuggestions(true);
                    }}
                    multiline
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                {loading && <ActivityIndicator size="small" color={theme.colors.primary} style={styles.loader} />}
            </View>

            {showSuggestions && suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                    {suggestions.map((item) => (
                        <TouchableOpacity
                            key={item.place_id}
                            style={styles.suggestionItem}
                            onPress={() => handleSelect(item)}
                        >
                            <Gps size={18} color={theme.colors.text.muted} variant="Outline" />
                            <Text style={styles.suggestionText} numberOfLines={2}>
                                {item.display_name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        zIndex: 1000,
    },
    inputWrapper: {
        flexDirection: 'row',
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingHorizontal: 16,
        alignItems: 'flex-start',
        paddingVertical: 12,
    },
    inputIcon: {
        marginTop: 4,
    },
    addressInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 15,
        color: theme.colors.text.primary,
        minHeight: 60,
        textAlignVertical: 'top',
    },
    loader: {
        marginTop: 4,
    },
    suggestionsContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginTop: 8,
        overflow: 'hidden',
        // No shadow as per minimalist design
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F9FAFB',
    },
    suggestionText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        color: theme.colors.text.secondary,
    },
});

export default AddressAutocomplete;
