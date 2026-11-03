import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Linking,
    Platform,
    StyleSheet,
    Text,
    View,
    Alert,
} from 'react-native';
import { ApiError, apiRequest, configuredApiUrl } from './api';
import { ActionButton, Card, Page, TextField } from './components';
import { colors } from './theme';
import type { Session, User } from './types';

type Props = {
    onAuthenticated: (session: Session) => Promise<void>;
};

type AuthResponse = {
    user: User;
    access_token: string;
    expires_at: string;
};

export default function AuthScreen({ onAuthenticated }: Props) {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [busy, setBusy] = useState(false);
    const webUrl = process.env.EXPO_PUBLIC_WEB_URL?.trim().replace(/\/+$/, '');

    const apiUrl = configuredApiUrl(false);
    const demoApiUrl = configuredApiUrl(true);

    async function openPasswordRecovery(): Promise<void> {
        if (!webUrl) {
            setErrorMessage(
                'Configure EXPO_PUBLIC_WEB_URL para abrir a recuperação de senha.',
            );
            return;
        }

        try {
            await Linking.openURL(`${webUrl}/forgot-password`);
        } catch {
            Alert.alert('Não foi possível abrir o site', 'Tente novamente mais tarde.');
        }
    }

    async function authenticate(isDemo = false): Promise<void> {
        const targetApiUrl = isDemo ? demoApiUrl : apiUrl;

        if (targetApiUrl === null) {
            setErrorMessage(
                isDemo
                    ? 'Configure EXPO_PUBLIC_API_URL_DEMO para conectar à demonstração.'
                    : 'Configure EXPO_PUBLIC_API_URL para conectar à API.',
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

            await onAuthenticated({
                accessToken: response.access_token,
                apiUrl: targetApiUrl,
                expiresAt: response.expires_at,
                isDemo,
                user: response.user,
            });
        } catch (error) {
            setErrorMessage(
                error instanceof ApiError
                    ? error.message
                    : 'Ocorreu um erro ao entrar. Tente novamente.',
            );
        } finally {
            setBusy(false);
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboard}
        >
            <Page>
                <View style={styles.brand}>
                    <View style={styles.logoMark}>
                        <Text style={styles.logoText}>S</Text>
                    </View>
                    <Text style={styles.brandName}>Saldoa</Text>
                    <Text style={styles.brandTagline}>
                        Suas finanças, com mais clareza.
                    </Text>
                </View>

                <Card>
                    <View style={styles.heading}>
                        <Text style={styles.title}>
                            {mode === 'login' ? 'Bem-vindo de volta' : 'Criar conta'}
                        </Text>
                        <Text style={styles.subtitle}>
                            {mode === 'login'
                                ? 'Entre para acompanhar seu dinheiro.'
                                : 'Organize suas finanças em um só lugar.'}
                        </Text>
                    </View>

                    {mode === 'register' && (
                        <TextField
                            label="Nome"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                            autoComplete="name"
                            placeholder="Seu nome"
                        />
                    )}
                    <TextField
                        label="E-mail"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        autoComplete="email"
                        keyboardType="email-address"
                        placeholder="voce@exemplo.com"
                    />
                    <TextField
                        label="Senha"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoComplete={
                            mode === 'login' ? 'current-password' : 'new-password'
                        }
                        placeholder="Sua senha"
                    />
                    {mode === 'register' && (
                        <TextField
                            label="Confirmar senha"
                            value={passwordConfirmation}
                            onChangeText={setPasswordConfirmation}
                            secureTextEntry
                            autoComplete="new-password"
                            placeholder="Repita sua senha"
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
                        {mode === 'login' ? 'Entrar' : 'Criar minha conta'}
                    </ActionButton>

                    <ActionButton
                        onPress={() =>
                            setMode((currentMode) =>
                                currentMode === 'login' ? 'register' : 'login',
                            )
                        }
                        variant="quiet"
                    >
                        {mode === 'login'
                            ? 'Ainda não tenho uma conta'
                            : 'Já tenho uma conta'}
                    </ActionButton>
                </Card>

                <Card style={styles.demoCard}>
                    <View style={styles.demoHeading}>
                        <View style={styles.demoDot} />
                        <Text style={styles.demoTitle}>Conheça o Saldoa</Text>
                    </View>
                    <Text style={styles.demoDescription}>
                        Explore uma demonstração isolada com dados de exemplo.
                        Ela usa uma API diferente da produção.
                    </Text>
                    <ActionButton
                        onPress={() => void authenticate(true)}
                        variant="secondary"
                        disabled={busy || demoApiUrl === null}
                        loading={busy}
                    >
                        Experimentar demo
                    </ActionButton>
                    <Text style={styles.environment}>
                        {demoApiUrl
                            ? 'Instância de demonstração configurada'
                            : 'Configure EXPO_PUBLIC_API_URL_DEMO para ativar'}
                    </Text>
                </Card>

                {mode === 'login' ? (
                    <ActionButton
                        onPress={() => void openPasswordRecovery()}
                        variant="quiet"
                    >
                        Esqueci minha senha
                    </ActionButton>
                ) : null}

                <Text style={styles.apiEnvironment}>
                    {apiUrl
                        ? `API principal: ${new URL(apiUrl).host}`
                        : 'Configure EXPO_PUBLIC_API_URL para desenvolvimento'}
                </Text>
            </Page>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    keyboard: { flex: 1 },
    brand: { alignItems: 'center', gap: 8, paddingVertical: 22 },
    logoMark: {
        alignItems: 'center',
        backgroundColor: colors.primary,
        borderRadius: 17,
        height: 54,
        justifyContent: 'center',
        width: 54,
    },
    logoText: { color: colors.surface, fontSize: 28, fontWeight: '800' },
    brandName: { color: colors.text, fontSize: 26, fontWeight: '800' },
    brandTagline: { color: colors.muted, fontSize: 14 },
    heading: { gap: 5, marginBottom: 4 },
    title: { color: colors.text, fontSize: 20, fontWeight: '700' },
    subtitle: { color: colors.muted, fontSize: 13, lineHeight: 19 },
    error: {
        backgroundColor: colors.expenseSoft,
        borderRadius: 10,
        color: colors.expense,
        fontSize: 13,
        lineHeight: 18,
        padding: 11,
    },
    demoCard: { backgroundColor: colors.primarySoft, borderColor: '#DDE2FF' },
    demoHeading: { alignItems: 'center', flexDirection: 'row', gap: 8 },
    demoDot: {
        backgroundColor: colors.primary,
        borderRadius: 10,
        height: 8,
        width: 8,
    },
    demoTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
    demoDescription: { color: colors.muted, fontSize: 13, lineHeight: 19 },
    environment: { color: colors.muted, fontSize: 11, textAlign: 'center' },
    apiEnvironment: {
        color: colors.muted,
        fontSize: 11,
        marginTop: 1,
        textAlign: 'center',
    },
});
