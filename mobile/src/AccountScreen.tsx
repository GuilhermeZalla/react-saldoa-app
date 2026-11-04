import { useState } from 'react';
import { Alert, Share, StyleSheet, Text, View } from 'react-native';
import { ApiError, apiTextRequest, sessionRequest } from './api';
import { ActionButton, Card, Page, PageTitle, TextField } from './components';
import { colors } from './theme';
import type { Session } from './types';

type Props = {
    session: Session;
    onLogout: () => Promise<void>;
    onAccountDeleted: () => Promise<void>;
};

export default function AccountScreen({
    session,
    onLogout,
    onAccountDeleted,
}: Props) {
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    async function shareExport(path: string, title: string): Promise<void> {
        setBusy(true);
        setErrorMessage('');

        try {
            const exportedData = await apiTextRequest(session, path);
            await Share.share({ message: exportedData, title });
        } catch (error) {
            setErrorMessage(errorMessageFor(error));
        } finally {
            setBusy(false);
        }
    }

    async function deleteAccount(): Promise<void> {
        setBusy(true);
        setErrorMessage('');

        try {
            await sessionRequest(session, '/account', {
                method: 'DELETE',
                body: { password },
            });
            setPassword('');
            await onAccountDeleted();
        } catch (error) {
            setErrorMessage(errorMessageFor(error));
            setBusy(false);
        }
    }

    function confirmAccountDeletion(): void {
        if (!password) {
            setErrorMessage('Informe sua senha para confirmar a exclusão.');
            return;
        }

        Alert.alert(
            'Excluir sua conta?',
            'Essa ação é permanente. Seu perfil, lançamentos, categorias, metas e recorrências serão removidos.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir permanentemente',
                    style: 'destructive',
                    onPress: () => void deleteAccount(),
                },
            ],
        );
    }

    async function revokeAllTokens(): Promise<void> {
        setBusy(true);

        try {
            await sessionRequest(session, '/auth/logout-all', {
                method: 'POST',
            });
        } catch (error) {
            setErrorMessage(errorMessageFor(error));
        } finally {
            await onLogout();
            setBusy(false);
        }
    }

    return (
        <Page>
            <PageTitle
                title="Conta"
                subtitle="Perfil e segurança da sua sessão."
            />

            {session.isDemo ? (
                <View style={styles.demoBanner}>
                    <Text style={styles.demoBannerText}>
                        Conta de demonstração em instância isolada
                    </Text>
                </View>
            ) : null}

            <Card>
                <Text style={styles.name}>{session.user.name}</Text>
                <Text style={styles.email}>{session.user.email}</Text>
                <Text style={styles.sessionInfo}>
                    Token válido até{' '}
                    {new Intl.DateTimeFormat('pt-BR', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                    }).format(new Date(session.expiresAt))}
                </Text>
                <Text style={styles.sessionInfo}>
                    Ambiente: {session.isDemo ? 'Demonstração' : 'Produção'}
                </Text>
            </Card>

            {!session.isDemo ? (
                <Card>
                    <Text style={styles.sectionTitle}>Seus dados</Text>
                    <Text style={styles.description}>
                        Compartilhe um arquivo JSON com seu perfil e dados
                        financeiros.
                    </Text>
                    <ActionButton
                        onPress={() =>
                            void shareExport(
                                '/account/export',
                                'Exportação Saldoa',
                            )
                        }
                        variant="secondary"
                        disabled={busy}
                        loading={busy}
                    >
                        Exportar todos os dados
                    </ActionButton>
                    <ActionButton
                        onPress={() =>
                            void shareExport(
                                `/transactions/export?month=${new Date().toISOString().slice(0, 7)}`,
                                'Lançamentos Saldoa',
                            )
                        }
                        variant="secondary"
                        disabled={busy}
                    >
                        Exportar CSV do mês
                    </ActionButton>
                </Card>
            ) : null}

            {errorMessage ? (
                <Text accessibilityRole="alert" style={styles.error}>
                    {errorMessage}
                </Text>
            ) : null}

            <Card>
                <Text style={styles.sectionTitle}>Segurança</Text>
                {!session.isDemo ? (
                    <ActionButton
                        onPress={() =>
                            Alert.alert(
                                'Encerrar todas as sessões?',
                                'Todos os dispositivos serão desconectados.',
                                [
                                    { text: 'Cancelar', style: 'cancel' },
                                    {
                                        text: 'Encerrar sessões',
                                        onPress: () => void revokeAllTokens(),
                                    },
                                ],
                            )
                        }
                        variant="secondary"
                        disabled={busy}
                    >
                        Encerrar sessões em outros dispositivos
                    </ActionButton>
                ) : null}
                <ActionButton
                    onPress={() => void onLogout()}
                    variant="secondary"
                    disabled={busy}
                >
                    Sair desta conta
                </ActionButton>
            </Card>

            {!session.isDemo ? (
                <Card style={styles.dangerCard}>
                    <Text style={styles.dangerTitle}>Excluir conta</Text>
                    <Text style={styles.description}>
                        A exclusão remove permanentemente sua conta e os dados
                        associados. Também é possível solicitar pelo site, sem o
                        app.
                    </Text>
                    <TextField
                        label="Confirme sua senha"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoComplete="current-password"
                        placeholder="Senha atual"
                    />
                    <ActionButton
                        onPress={confirmAccountDeletion}
                        variant="danger"
                        disabled={busy}
                    >
                        Excluir minha conta
                    </ActionButton>
                </Card>
            ) : null}
        </Page>
    );
}

function errorMessageFor(error: unknown): string {
    return error instanceof ApiError
        ? error.message
        : 'Não foi possível concluir a solicitação.';
}

const styles = StyleSheet.create({
    demoBanner: {
        backgroundColor: colors.primarySoft,
        borderRadius: 10,
        padding: 11,
    },
    demoBannerText: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: '700',
        textAlign: 'center',
    },
    name: { color: colors.text, fontSize: 18, fontWeight: '700' },
    email: { color: colors.muted, fontSize: 13 },
    sessionInfo: { color: colors.muted, fontSize: 11 },
    sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
    description: { color: colors.muted, fontSize: 13, lineHeight: 19 },
    error: {
        backgroundColor: colors.expenseSoft,
        borderRadius: 10,
        color: colors.expense,
        fontSize: 13,
        padding: 12,
    },
    dangerCard: { borderColor: '#F1D1D1' },
    dangerTitle: { color: colors.expense, fontSize: 15, fontWeight: '700' },
});
