import * as Linking from 'expo-linking';
import { usePreferences, useThemeStyles } from './PreferencesContext';
import { t } from './i18n';
import { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Keyboard,
    useWindowDimensions,
    Platform,
    StyleSheet,
    Text,
    View,
    Alert,
} from 'react-native';
import { ApiError, apiRequest, configuredApiUrl } from './api';
import {
    ActionButton,
    Card,
    Page,
    PreferencesSheet,
    IconButton,
    TextField,
} from './components';
import { AppIcon } from './icons';
import { FinanceIllustration } from './FinanceIllustration';
import type { ThemeColors } from './theme';
import type { Session, User } from './types';
import { RegistrationSuccess } from './RegistrationSuccess';
import { SESSION_LIFETIME_MS } from './sessionLifetime';

type Props = {
    onAuthenticated: (session: Session) => Promise<void>;
};

type AuthResponse = {
    user: User;
    access_token: string;
    expires_at: string;
};

export default function AuthScreen({ onAuthenticated }: Props) {
    const { colors, styles } = useThemeStyles(createStyles);
    const { language } = usePreferences();
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [busy, setBusy] = useState(false);
    const [createdSession, setCreatedSession] = useState<Session | null>(null);
    const [preferencesOpen, setPreferencesOpen] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const { height } = useWindowDimensions();
    useEffect(() => {
        const show = Keyboard.addListener('keyboardDidShow', () =>
            setKeyboardVisible(true),
        );
        const hide = Keyboard.addListener('keyboardDidHide', () =>
            setKeyboardVisible(false),
        );
        return () => {
            show.remove();
            hide.remove();
        };
    }, []);
    const webUrl = process.env.EXPO_PUBLIC_WEB_URL?.trim().replace(/\/+$/, '');

    const apiUrl = configuredApiUrl(false);
    const demoApiUrl = configuredApiUrl(true);

    async function openPasswordRecovery(): Promise<void> {
        if (!webUrl) {
            setErrorMessage(
                t('A recuperação de senha está indisponível no momento.'),
            );
            return;
        }

        try {
            await Linking.openURL(`${webUrl}/forgot-password`);
        } catch {
            Alert.alert(
                t('Não foi possível abrir o site'),
                t('Tente novamente mais tarde.'),
            );
        }
    }

    async function authenticate(isDemo = false): Promise<void> {
        const targetApiUrl = isDemo ? demoApiUrl : apiUrl;

        if (targetApiUrl === null) {
            setErrorMessage(
                isDemo
                    ? t('A demonstração está indisponível no momento.')
                    : t(
                          'O serviço está indisponível no momento. Tente novamente mais tarde.',
                      ),
            );

            return;
        }

        setBusy(true);
        setErrorMessage('');

        try {
            const path = isDemo
                ? '/auth/demo'
                : mode === 'login'
                  ? '/auth/login'
                  : '/auth/register';
            const response = await apiRequest<AuthResponse>(
                targetApiUrl,
                path,
                {
                    method: 'POST',
                    body: isDemo
                        ? { device_name: 'Saldoa Android' }
                        : {
                              ...(mode === 'register' ? { name } : {}),
                              email: email.trim(),
                              password,
                              ...(mode === 'register'
                                  ? {
                                        password_confirmation:
                                            passwordConfirmation,
                                    }
                                  : {}),
                              device_name: 'Saldoa Android',
                          },
                },
            );

            const authenticatedAt = new Date();
            const nextSession: Session = {
                authenticatedAt: authenticatedAt.toISOString(),
                accessToken: response.access_token,
                apiUrl: targetApiUrl,
                expiresAt: new Date(
                    Math.min(
                        Date.parse(response.expires_at),
                        authenticatedAt.getTime() + SESSION_LIFETIME_MS,
                    ),
                ).toISOString(),
                isDemo,
                user: response.user,
            };
            setPassword('');
            setPasswordConfirmation('');
            if (!isDemo && mode === 'register') {
                setCreatedSession(nextSession);
            } else {
                await onAuthenticated(nextSession);
            }
        } catch (error) {
            setErrorMessage(
                error instanceof ApiError
                    ? error.message
                    : t('Ocorreu um erro ao entrar. Tente novamente.'),
            );
        } finally {
            setBusy(false);
        }
    }

    if (createdSession !== null) {
        return (
            <RegistrationSuccess
                busy={busy}
                error={errorMessage}
                onContinue={async () => {
                    setBusy(true);
                    setErrorMessage('');
                    try {
                        await onAuthenticated(createdSession);
                    } catch {
                        setErrorMessage(
                            t(
                                'Não foi possível salvar a sessão. Tente novamente.',
                            ),
                        );
                    } finally {
                        setBusy(false);
                    }
                }}
            />
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboard}
        >
            <Page contentStyle={styles.authContent}>
                <View style={styles.toolbar}>
                    <View style={styles.brand}>
                        <View style={styles.logoMark}>
                            <AppIcon
                                name="brand"
                                color={colors.primaryForeground}
                                size={24}
                            />
                        </View>
                        <Text style={styles.brandName}>Saldoa</Text>
                    </View>
                    <IconButton
                        icon="settings"
                        label={t('Abrir preferências')}
                        onPress={() => {
                            Keyboard.dismiss();
                            setPreferencesOpen(true);
                        }}
                    />
                </View>
                <FinanceIllustration
                    compact={
                        keyboardVisible || mode === 'register' || height < 700
                    }
                />
                <View style={styles.heading}>
                    <Text accessibilityRole="header" style={styles.title}>
                        {mode === 'login'
                            ? t('Bem-vindo de volta')
                            : t('Criar conta')}
                    </Text>
                    <Text style={styles.subtitle}>
                        {mode === 'login'
                            ? t('Suas finanças, com mais clareza.')
                            : t('Organize suas finanças em um só lugar.')}
                    </Text>
                </View>
                <Card style={styles.form}>
                    {mode === 'register' && (
                        <TextField
                            label={t('Nome')}
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                            autoComplete="name"
                            placeholder={t('Seu nome')}
                        />
                    )}
                    <TextField
                        label={t('E-mail')}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        autoComplete="email"
                        keyboardType="email-address"
                        placeholder="voce@exemplo.com"
                    />
                    <TextField
                        label={t('Senha')}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoComplete={
                            mode === 'login'
                                ? 'current-password'
                                : 'new-password'
                        }
                        placeholder={t('Sua senha')}
                    />
                    {mode === 'register' && (
                        <TextField
                            label={t('Confirmar senha')}
                            value={passwordConfirmation}
                            onChangeText={setPasswordConfirmation}
                            secureTextEntry
                            autoComplete="new-password"
                            placeholder={t('Repita sua senha')}
                        />
                    )}

                    {errorMessage ? (
                        <Text accessibilityRole="alert" style={styles.error}>
                            {errorMessage}
                        </Text>
                    ) : null}

                    <ActionButton
                        onPress={() => void authenticate()}
                        disabled={
                            busy ||
                            !email.trim() ||
                            !password ||
                            (mode === 'register' &&
                                (!name.trim() || !passwordConfirmation))
                        }
                        loading={busy}
                    >
                        {mode === 'login'
                            ? t('Entrar')
                            : t('Criar minha conta')}
                    </ActionButton>

                    <ActionButton
                        onPress={() => {
                            setMode((currentMode) =>
                                currentMode === 'login' ? 'register' : 'login',
                            );
                            setErrorMessage('');
                        }}
                        disabled={busy}
                        variant="quiet"
                    >
                        {mode === 'login'
                            ? t('Ainda não tenho uma conta')
                            : t('Já tenho uma conta')}
                    </ActionButton>
                </Card>

                {mode === 'login' ? (
                    <ActionButton
                        onPress={() => void openPasswordRecovery()}
                        variant="quiet"
                        compact
                    >
                        {t('Esqueci minha senha')}
                    </ActionButton>
                ) : null}
                {demoApiUrl !== null ? (
                    <ActionButton
                        onPress={() => void authenticate(true)}
                        variant="quiet"
                        disabled={busy}
                        loading={busy}
                        compact
                    >
                        {t('Experimentar sem criar conta')}
                    </ActionButton>
                ) : null}
                <ActionButton
                    onPress={() => void openPrivacyPolicy()}
                    variant="quiet"
                    compact
                >
                    {t('Política de Privacidade')}
                </ActionButton>
            </Page>
            <PreferencesSheet
                visible={preferencesOpen}
                onClose={() => setPreferencesOpen(false)}
            />
        </KeyboardAvoidingView>
    );

    async function openPrivacyPolicy(): Promise<void> {
        if (!webUrl) {
            Alert.alert(
                t('Não foi possível abrir o site'),
                t('Tente novamente mais tarde.'),
            );
            return;
        }

        try {
            await Linking.openURL(
                `${webUrl}/privacy-policy${language === 'en' ? '?lang=en' : ''}`,
            );
        } catch {
            Alert.alert(
                t('Não foi possível abrir o site'),
                t('Tente novamente mais tarde.'),
            );
        }
    }
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        keyboard: { flex: 1 },
        authContent: { maxWidth: 480, gap: 14, paddingBottom: 24 },
        toolbar: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 4,
        },
        brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
        logoMark: {
            backgroundColor: colors.primary,
            borderRadius: 13,
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
        },
        brandName: {
            fontFamily: 'SpaceGrotesk',
            color: colors.text,
            fontSize: 23,
            fontWeight: '700',
        },
        heading: { gap: 8, alignItems: 'center', marginBottom: 8 },
        title: {
            fontFamily: 'SpaceGrotesk',
            color: colors.text,
            fontSize: 28,
            fontWeight: '700',
            letterSpacing: -0.8,
            textAlign: 'center',
        },
        subtitle: {
            fontFamily: 'DMSans',
            color: colors.muted,
            fontSize: 14,
            lineHeight: 21,
            textAlign: 'center',
        },
        form: { padding: 22, gap: 18 },
        error: {
            fontFamily: 'DMSans',
            backgroundColor: colors.surfaceMuted,
            borderRadius: 12,
            color: colors.text,
            fontSize: 14,
            lineHeight: 20,
            padding: 12,
        },
    });
