import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { 
    ArrowLeft, 
    Lock, 
    Sms, 
    ShieldTick
} from 'iconsax-react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from '../types/navigation';
import { theme } from '../theme';
import { useModal } from '../services/modalService';

type Props = StackScreenProps<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { showModal } = useModal();

    const handleReset = async () => {
        if (!email) {
            showModal({
                title: 'Champ requis',
                message: 'Veuillez saisir votre adresse email.',
                type: 'warning'
            });
            return;
        }

        setLoading(true);
        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            showModal({
                title: 'E-mail envoyé',
                message: 'Si un compte existe pour cet e-mail, vous recevrez des instructions de réinitialisation.',
                type: 'success',
                onConfirm: () => navigation.navigate('Login')
            });
        } catch (error) {
            showModal({
                title: 'Erreur',
                message: 'Une erreur est survenue. Veuillez réessayer.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.content}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <ArrowLeft size={24} color={theme.colors.text.primary} variant="Outline" />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Lock size={40} color={theme.colors.primary} variant="Bold" />
                        </View>
                        <Text style={styles.title}>Récupération</Text>
                        <Text style={styles.subtitle}>Entrez votre email pour réinitialiser votre mot de passe.</Text>
                    </View>

                    <View style={styles.formContainer}>
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
                        </View>

                        <TouchableOpacity
                            style={[styles.resetBtn, loading && styles.resetBtnDisabled]}
                            onPress={handleReset}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.resetBtnText}>Envoyer le lien</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => navigation.navigate('Login')}
                            style={styles.footer}
                        >
                            <Text style={styles.footerText}>Vous vous en souvenez ? </Text>
                            <Text style={styles.signInText}>Connexion</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    backBtn: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    header: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 40,
    },
    iconContainer: {
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
        marginBottom: 12,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 15,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    formContainer: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: 32,
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
    resetBtn: {
        backgroundColor: theme.colors.primary,
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resetBtnDisabled: {
        opacity: 0.6,
    },
    resetBtnText: {
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

export default ForgotPasswordScreen;
