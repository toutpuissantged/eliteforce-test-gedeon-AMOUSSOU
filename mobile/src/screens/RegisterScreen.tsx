import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import PhoneInputField from '../components/PhoneInputField';
import { register, clearError } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../hooks/store';
import { registerForPushNotificationsAsync } from '../utils/notifications';
import { 
    ArrowLeft, 
    User, 
    Sms, 
    Lock, 
    TickCircle,
    InfoCircle,
    ShieldSearch
} from 'iconsax-react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from '../types/navigation';
import { theme } from '../theme';
import { useModal } from '../services/modalService';

type Props = StackScreenProps<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [formattedPhone, setFormattedPhone] = useState('');
    const [agreeCGU, setAgreeCGU] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const dispatch = useAppDispatch();
    const { showModal } = useModal();
    const { loading, error, fieldErrors } = useAppSelector((state) => state.auth);

    React.useEffect(() => {
        if (fieldErrors && Object.keys(fieldErrors).length > 0) {
            setValidationErrors(prev => ({ ...prev, ...fieldErrors }));
        }
    }, [fieldErrors]);

    const validateField = (name: string, value: string) => {
        let error = '';
        switch (name) {
            case 'firstName': if (!value) error = 'Prénom requis'; break;
            case 'lastName': if (!value) error = 'Nom requis'; break;
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) error = 'Email invalide';
                break;
            case 'phone': if (!value) error = 'Téléphone requis'; break;
            case 'password':
                if (!value) {
                    error = 'Mot de passe requis';
                } else if (value.length < 8) {
                    error = 'Minimum 8 caractères';
                } else if (!/[A-Z]/.test(value)) {
                    error = 'Au moins une majuscule';
                } else if (!/[0-9]/.test(value)) {
                    error = 'Au moins un chiffre';
                }
                break;
            case 'confirmPassword': if (value !== formData.password) error = 'Les mots de passe ne correspondent pas'; break;
        }
        setValidationErrors(prev => ({ ...prev, [name]: error }));
        return !error;
    };

    const validate = () => {
        const fields = ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword'];
        let isValid = true;
        fields.forEach(field => {
            if (!validateField(field, (formData as any)[field])) isValid = false;
        });
        if (!agreeCGU) {
            setValidationErrors(prev => ({ ...prev, cgu: 'Veuillez accepter les conditions' }));
            isValid = false;
        }
        return isValid;
    };

    const handleRegister = async () => {
        if (!validate()) return;

        const pushToken = await registerForPushNotificationsAsync();

        const resultAction = await dispatch(register({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formattedPhone || formData.phone,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            acceptTerms: agreeCGU,
            pushToken: pushToken,
        }));

        if (register.rejected.match(resultAction)) {
            const payload = resultAction.payload;
            if (!Array.isArray(payload)) {
                showModal({
                    title: 'Erreur d\'inscription',
                    message: payload as string || 'Une erreur est survenue lors de la création du compte.',
                    type: 'error'
                });
            }
        }
    };

    const handleChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
        if (name !== 'phone') validateField(name, value);
    };

    const renderInput = (
        name: keyof typeof formData,
        placeholder: string,
        icon: any,
        keyboardType: any = 'default',
        secureTextEntry: boolean = false
    ) => (
        <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, validationErrors[name] && styles.inputError]}>
                {icon}
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    keyboardType={keyboardType}
                    autoCapitalize={name === 'email' ? 'none' : 'words'}
                    value={formData[name]}
                    onChangeText={(val) => handleChange(name, val)}
                    secureTextEntry={secureTextEntry}
                    placeholderTextColor={theme.colors.text.muted}
                />
            </View>
            {validationErrors[name] && <Text style={styles.errorText}>{validationErrors[name]}</Text>}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <ArrowLeft size={24} color={theme.colors.text.primary} variant="Outline" />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text style={styles.title}>Inscription</Text>
                        <Text style={styles.subtitle}>Créez votre compte pour accéder aux services EliteForce</Text>
                    </View>

                    <View style={styles.formContainer}>
                        {error && (
                            <View style={styles.errorBanner}>
                                <InfoCircle size={20} color={theme.colors.error} variant="Bold" />
                                <Text style={styles.serverErrorText}>{error}</Text>
                            </View>
                        )}

                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                                {renderInput('firstName', 'Prénom', <User size={20} color={theme.colors.text.muted} variant="Outline" style={styles.inputIcon} />)}
                            </View>
                            <View style={{ flex: 1, marginLeft: 8 }}>
                                {renderInput('lastName', 'Nom', <User size={20} color={theme.colors.text.muted} variant="Outline" style={styles.inputIcon} />)}
                            </View>
                        </View>

                        {renderInput('email', 'Adresse Email', <Sms size={20} color={theme.colors.text.muted} variant="Outline" style={styles.inputIcon} />, 'email-address')}

                        <View style={styles.inputContainer}>
                            <PhoneInputField
                                value={formData.phone}
                                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                onFormattedChange={(text) => setFormattedPhone(text)}
                                error={validationErrors.phone}
                            />
                        </View>

                        {renderInput('password', 'Mot de passe', <Lock size={20} color={theme.colors.text.muted} variant="Outline" style={styles.inputIcon} />, 'default', true)}
                        {renderInput('confirmPassword', 'Confirmer', <ShieldSearch size={20} color={theme.colors.text.muted} variant="Outline" style={styles.inputIcon} />, 'default', true)}

                        <TouchableOpacity
                            style={styles.checkboxContainer}
                            onPress={() => {
                                setAgreeCGU(!agreeCGU);
                                if (!agreeCGU) setValidationErrors(prev => ({ ...prev, cgu: '' }));
                            }}
                        >
                            <View style={[styles.checkbox, agreeCGU && styles.checkboxActive]}>
                                {agreeCGU && <TickCircle size={16} color="#fff" variant="Bold" />}
                            </View>
                            <Text style={styles.checkboxLabel}>
                                J'accepte les <Text style={styles.linkText}>Conditions Générales</Text>
                            </Text>
                        </TouchableOpacity>
                        {validationErrors.cgu && <Text style={[styles.errorText, { marginBottom: 16 }]}>{validationErrors.cgu}</Text>}

                        <TouchableOpacity
                            style={[styles.registerBtn, (!agreeCGU || loading || Object.values(validationErrors).some(e => !!e)) && styles.registerBtnDisabled]}
                            onPress={handleRegister}
                            disabled={!agreeCGU || loading || Object.values(validationErrors).some(e => !!e)}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.registerBtnText}>Créer mon compte</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Déjà inscrit ? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.signInText}>Se connecter</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    backBtn: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Platform.OS === 'android' ? 44 : 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    header: {
        marginTop: 24,
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: theme.colors.text.primary,
        marginBottom: 8,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 15,
        color: theme.colors.text.secondary,
        lineHeight: 22,
    },
    formContainer: {
        width: '100%',
    },
    row: {
        flexDirection: 'row',
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#FEE2E2',
    },
    serverErrorText: {
        color: theme.colors.error,
        fontSize: 14,
        marginLeft: 10,
        fontWeight: '600',
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingHorizontal: 16,
        height: 60,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: theme.colors.text.primary,
    },
    inputError: {
        borderColor: theme.colors.error,
        backgroundColor: '#FFF5F5',
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 12,
        marginTop: 6,
        marginLeft: 4,
        fontWeight: '600',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 16,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: theme.colors.borderMedium,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    checkboxLabel: {
        fontSize: 14,
        color: theme.colors.text.secondary,
    },
    linkText: {
        color: theme.colors.primary,
        fontWeight: '700',
    },
    registerBtn: {
        backgroundColor: theme.colors.primary,
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerBtnDisabled: {
        opacity: 0.6,
    },
    registerBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
    },
    footerText: {
        color: theme.colors.text.secondary,
        fontSize: 14,
    },
    signInText: {
        color: theme.colors.primary,
        fontWeight: '800',
        fontSize: 14,
    },
});

export default RegisterScreen;
