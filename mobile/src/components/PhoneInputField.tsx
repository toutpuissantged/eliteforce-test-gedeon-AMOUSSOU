import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Modal,
    FlatList,
    SafeAreaView
} from 'react-native';
import { theme } from '../theme';
import { ArrowDown2, CloseCircle } from 'iconsax-react-native';

interface Country {
    code: string;
    flag: string;
    name: string;
}

const COUNTRIES: Country[] = [
    { code: '+212', flag: '🇲🇦', name: 'Maroc' },
    { code: '+33', flag: '🇫🇷', name: 'France' },
    { code: '+1', flag: '🇺🇸', name: 'USA' },
    { code: '+44', flag: '🇬🇧', name: 'UK' },
    { code: '+971', flag: '🇦🇪', name: 'UAE' },
];

interface Props {
    value: string;
    onChangeText: (text: string) => void;
    onFormattedChange: (formatted: string) => void;
    error?: string;
}

const PhoneInputField: React.FC<Props> = ({ value, onChangeText, onFormattedChange, error }) => {
    const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
    const [showPicker, setShowPicker] = useState(false);

    const handleCountrySelect = (country: Country) => {
        setSelectedCountry(country);
        setShowPicker(false);
        onFormattedChange(country.code + value);
    };

    const handleTextChange = (text: string) => {
        onChangeText(text);
        onFormattedChange(selectedCountry.code + text);
    };

    return (
        <View style={styles.container}>
            <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
                <TouchableOpacity
                    style={styles.countryPicker}
                    onPress={() => setShowPicker(true)}
                >
                    <Text style={styles.flag}>{selectedCountry.flag}</Text>
                    <Text style={styles.countryCode}>{selectedCountry.code}</Text>
                    <ArrowDown2 size={16} color={theme.colors.text.muted} variant="Outline" />
                </TouchableOpacity>

                <View style={styles.divider} />

                <TextInput
                    style={styles.input}
                    placeholder="Numéro de téléphone"
                    keyboardType="phone-pad"
                    value={value}
                    onChangeText={handleTextChange}
                    placeholderTextColor={theme.colors.text.muted}
                />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Modal
                visible={showPicker}
                animationType="fade"
                transparent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Pays</Text>
                            <TouchableOpacity onPress={() => setShowPicker(false)}>
                                <CloseCircle size={24} color={theme.colors.text.primary} variant="Outline" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={COUNTRIES}
                            keyExtractor={(item) => item.code}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.countryItem}
                                    onPress={() => handleCountrySelect(item)}
                                >
                                    <Text style={styles.itemFlag}>{item.flag}</Text>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <Text style={styles.itemCode}>{item.code}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        height: 60,
        paddingHorizontal: 16,
    },
    inputError: {
        borderColor: theme.colors.error,
        backgroundColor: '#FFF5F5',
    },
    countryPicker: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 10,
    },
    flag: {
        fontSize: 20,
        marginRight: 8,
    },
    countryCode: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginRight: 4,
    },
    divider: {
        width: 1,
        height: 24,
        backgroundColor: theme.colors.borderMedium,
        marginHorizontal: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: theme.colors.text.primary,
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 12,
        marginTop: 6,
        marginLeft: 4,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        width: '100%',
        maxHeight: '60%',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: theme.colors.text.primary,
    },
    countryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F9FAFB',
    },
    itemFlag: {
        fontSize: 24,
        marginRight: 16,
    },
    itemName: {
        flex: 1,
        fontSize: 15,
        color: theme.colors.text.primary,
        fontWeight: '600',
    },
    itemCode: {
        fontSize: 14,
        color: theme.colors.text.muted,
        fontWeight: '700',
    },
});

export default PhoneInputField;
