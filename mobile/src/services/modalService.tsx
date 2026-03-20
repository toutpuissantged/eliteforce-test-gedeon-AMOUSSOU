import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { theme } from '../theme';
import { TickCircle, CloseCircle, InfoCircle, Warning2 } from 'iconsax-react-native';

type ModalType = 'success' | 'error' | 'info' | 'warning' | 'confirm';

interface ModalOptions {
    title: string;
    message: string;
    type?: ModalType;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
}

interface ModalContextType {
    showModal: (options: ModalOptions) => void;
    hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

const { width } = Dimensions.get('window');

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const [options, setOptions] = useState<ModalOptions | null>(null);

    const showModal = (opts: ModalOptions) => {
        setOptions(opts);
        setVisible(true);
    };

    const hideModal = () => {
        setVisible(false);
        // Delay clearing options to avoid flicker during closing animation
        setTimeout(() => setOptions(null), 300);
    };

    const renderIcon = () => {
        if (!options?.type) return null;
        const size = 64;
        switch (options.type) {
            case 'success': return <TickCircle size={size} color={theme.colors.success} variant="Bold" />;
            case 'error': return <CloseCircle size={size} color={theme.colors.error} variant="Bold" />;
            case 'warning': return <Warning2 size={size} color={theme.colors.warning} variant="Bold" />;
            default: return <InfoCircle size={size} color={theme.colors.primary} variant="Bold" />;
        }
    };

    return (
        <ModalContext.Provider value={{ showModal, hideModal }}>
            {children}
            <Modal
                transparent
                visible={visible}
                animationType="fade"
                onRequestClose={hideModal}
            >
                <View style={styles.overlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.iconContainer}>
                            {renderIcon()}
                        </View>
                        <Text style={styles.title}>{options?.title}</Text>
                        <Text style={styles.message}>{options?.message}</Text>
                        
                        <View style={styles.buttonContainer}>
                            {(options?.type === 'confirm' || options?.onCancel) && (
                                <TouchableOpacity 
                                    style={[styles.button, styles.cancelButton]} 
                                    onPress={() => {
                                        options?.onCancel?.();
                                        hideModal();
                                    }}
                                >
                                    <Text style={styles.cancelButtonText}>{options?.cancelText || 'Annuler'}</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity 
                                style={[styles.button, styles.confirmButton]} 
                                onPress={() => {
                                    options?.onConfirm?.();
                                    hideModal();
                                }}
                            >
                                <Text style={styles.confirmButtonText}>{options?.confirmText || 'OK'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) throw new Error('useModal must be used within a ModalProvider');
    return context;
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)', // Slightly dark for focus, but minimalist
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContainer: {
        width: width - 48,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        // No shadows as requested
    },
    iconContainer: {
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: theme.colors.text.primary,
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    message: {
        fontSize: 15,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        gap: 12,
    },
    button: {
        flex: 1,
        height: 54,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: 160,
    },
    confirmButton: {
        backgroundColor: theme.colors.primary,
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    cancelButton: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    cancelButtonText: {
        color: theme.colors.text.primary,
        fontSize: 15,
        fontWeight: '600',
    },
});
