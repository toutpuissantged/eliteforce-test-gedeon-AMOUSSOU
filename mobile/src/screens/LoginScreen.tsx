import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { login, clearError } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../hooks/store';
import { registerForPushNotificationsAsync } from '../utils/notifications';
import { 
    ShieldTick, 
    Sms, 
    Lock, 
    Eye, 
    EyeSlash, 
    InfoCircle,
    Warning2
} from 'iconsax-react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from '../types/navigation';
import { theme } from '../theme';
import { useModal } from '../services/modalService';

type Props = StackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const dispatch = useAppDispatch();
    const { showModal } = useModal();
    const { loading, error, fieldErrors } = useAppSelector((state) => state.auth);

    useEffect(() => {
        dispatch(clearError());
    }, [dispatch]);

    const handleLogin = async () => {
        if (!email || !password) {
            showModal({
                title: 'Champs requis',
                message: 'Veuillez remplir tous les champs pour vous connecter.',
                type: 'warning'
            });
            return;
        }

        const pushToken = await registerForPushNotificationsAsync();
        const resultAction = await dispatch(login({ email, password, pushToken }));
        if (login.rejected.match(resultAction)) {
            const payload = resultAction.payload;
            if (!Array.isArray(payload)) {
                showModal({
                    title: 'Échec de connexion',
                    message: payload as string || 'Identifiants invalides ou erreur serveur.',
                    type: 'error'
                });
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <ShieldTick size={48} color={theme.colors.primary} variant="Bold" />
                        </View>
                        <Text style={styles.title}>EliteForce</Text>
                        <Text style={styles.subtitle}>Connectez-vous pour accéder à vos services de sécurité</Text>
                    </View>

                    <View style={styles.formContainer}>
                        {error && (
                            <View style={styles.errorBanner}>
                                <InfoCircle size={20} color={theme.colors.error} variant="Bold" />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Adresse Email</Text>
                            <View style={styles.inputWrapper}>
                                <Sms size={20} color={theme.colors.text.muted} variant="Outline" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="votre@email.com"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholderTextColor={theme.colors.text.muted}
                                />
                            </View>
                            {fieldErrors && fieldErrors.email && <Text style={styles.fieldErrorText}>{fieldErrors.email}</Text>}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Mot de passe</Text>
                            <View style={styles.inputWrapper}>
                                <Lock size={20} color={theme.colors.text.muted} variant="Outline" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="••••••••"
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholderTextColor={theme.colors.text.muted}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                                    {showPassword ? 
                                        <EyeSlash size={20} color={theme.colors.text.muted} variant="Outline" /> : 
                                        <Eye size={20} color={theme.colors.text.muted} variant="Outline" />
                                    }
                                </TouchableOpacity>
                            </View>
                            {fieldErrors && fieldErrors.password && <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text>}
                        </View>

                        <TouchableOpacity
                            onPress={() => navigation.navigate('ForgotPassword')}
                            style={styles.forgotBtn}
                        >
                            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.loginBtnText}>Se connecter</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Pas encore de compte ? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.signUpText}>S'inscrire</Text>
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
    header: {
        alignItems: 'center',
        marginTop: 80,
        marginBottom: 48,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
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
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 22,
    },
    formContainer: {
        width: '100%',
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
    errorText: {
        color: theme.colors.error,
        fontSize: 14,
        marginLeft: 10,
        fontWeight: '600',
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginBottom: 8,
        marginLeft: 4,
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
    eyeBtn: {
        padding: 8,
    },
    forgotBtn: {
        alignSelf: 'flex-end',
        marginBottom: 32,
    },
    forgotText: {
        color: theme.colors.primary,
        fontWeight: '700',
        fontSize: 14,
    },
    loginBtn: {
        backgroundColor: theme.colors.primary,
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginBtnDisabled: {
        opacity: 0.6,
    },
    loginBtnText: {
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
    signUpText: {
        color: theme.colors.primary,
        fontWeight: '800',
        fontSize: 14,
    },
    fieldErrorText: {
        color: theme.colors.error,
        fontSize: 12,
        marginTop: 6,
        marginLeft: 4,
        fontWeight: '600',
    },
});

export default LoginScreen;
