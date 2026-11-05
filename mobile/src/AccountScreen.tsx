import { usePreferences, useThemeStyles } from './PreferencesContext';
import { getLocale, t } from './i18n';
import { useState } from 'react';
import { Alert, Share, StyleSheet, Text, View } from 'react-native';
import { ApiError, apiTextRequest, sessionRequest } from './api';
import { currentMonth } from './format';
import {
    ActionButton,
    Card,
    Page,
    PageTitle,
    PreferencesSheet,
    SettingsRow,
    SectionTitle,
    UserAvatar,
    TextField,
} from './components';
import type { ThemeColors } from './theme';
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
    const { styles } = useThemeStyles(createStyles);
    const { language, theme } = usePreferences();
    const [preferencesOpen, setPreferencesOpen] = useState(false);
    const [deletionOpen, setDeletionOpen] = useState(false);
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
            setErrorMessage(t('Informe sua senha para confirmar a exclusão.'));
            return;
        }

        Alert.alert(
            t('Excluir sua conta?'),
            t(
                'Essa ação é permanente. Seu perfil, lançamentos, categorias, metas e recorrências serão removidos.',
            ),
            [
                { text: t('Cancelar'), style: 'cancel' },
                {
                    text: t('Excluir permanentemente'),
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
                title={t('Conta')}
                subtitle={t('Perfil e segurança da sua sessão.')}
            />

            {session.isDemo ? (
                <View style={styles.demoBanner}>
                    <Text style={styles.demoBannerText}>
                        {t('Conta de demonstração em instância isolada')}
                    </Text>
                </View>
            ) : null}

            <Card style={styles.profileCard}>
                <UserAvatar name={session.user.name} />
                <View style={styles.profileCopy}>
                    <Text style={styles.name}>{session.user.name}</Text>
                    <Text style={styles.email}>{session.user.email}</Text>
                </View>
            </Card>
            <Card>
                <SectionTitle title={t('Do seu jeito')} />
                <SettingsRow
                    icon="settings"
                    title={t('Idioma e aparência')}
                    subtitle={`${language === 'en' ? 'English' : 'Português'} · ${t(theme === 'light' ? 'Claro' : theme === 'dark' ? 'Escuro' : 'Sistema')}`}
                    onPress={() => setPreferencesOpen(true)}
                />
            </Card>
            {!session.isDemo ? (
                <Card>
                    <SectionTitle title={t('Seus dados')} />
                    <SettingsRow
                        icon="download"
                        title={t('Exportar todos os dados')}
                        subtitle={t('Seu perfil e suas finanças em JSON.')}
                        onPress={() =>
                            void shareExport(
                                '/account/export',
                                t('Exportação Saldoa'),
                            )
                        }
                        disabled={busy}
                        loading={busy}
                    />
                    <SettingsRow
                        icon="transactions"
                        title={t('Exportar CSV do mês')}
                        subtitle={t('Seus lançamentos em uma planilha.')}
                        onPress={() =>
                            void shareExport(
                                `/transactions/export?month=${currentMonth()}`,
                                t('Lançamentos Saldoa'),
                            )
                        }
                        disabled={busy}
                    />
                </Card>
            ) : null}
            {errorMessage ? (
                <Text accessibilityRole="alert" style={styles.error}>
                    {errorMessage}
                </Text>
            ) : null}

            <Card>
                <SectionTitle title={t('Segurança')} />
                <Text style={styles.description}>
                    {t('Sessão válida até')}{' '}
                    {new Intl.DateTimeFormat(getLocale(), {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                    }).format(new Date(session.expiresAt))}
                </Text>
                {!session.isDemo ? (
                    <SettingsRow
                        icon="shield"
                        title={t('Encerrar sessões em outros dispositivos')}
                        onPress={() =>
                            Alert.alert(
                                t('Encerrar todas as sessões?'),
                                t('Todos os dispositivos serão desconectados.'),
                                [
                                    { text: t('Cancelar'), style: 'cancel' },
                                    {
                                        text: t('Encerrar sessões'),
                                        onPress: () => void revokeAllTokens(),
                                    },
                                ],
                            )
                        }
                        disabled={busy}
                    />
                ) : null}
                <SettingsRow
                    icon="logout"
                    title={t('Sair desta conta')}
                    onPress={() => void onLogout()}
                    disabled={busy}
                />
            </Card>
            {!session.isDemo ? (
                <Card style={styles.dangerCard}>
                    <SettingsRow
                        icon="trash"
                        title={t('Excluir conta')}
                        subtitle={t(
                            'Gerenciar a exclusão permanente dos seus dados.',
                        )}
                        onPress={() => {
                            setDeletionOpen(!deletionOpen);
                            setPassword('');
                        }}
                        disabled={busy}
                    />
                    {deletionOpen ? (
                        <View style={styles.deletionContent}>
                            <Text style={styles.description}>
                                {t(
                                    'A exclusão remove permanentemente sua conta e os dados associados. Também é possível solicitar pelo site, sem o app.',
                                )}
                            </Text>
                            <TextField
                                label={t('Confirme sua senha')}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                autoComplete="current-password"
                                placeholder={t('Senha atual')}
                            />
                            <ActionButton
                                onPress={confirmAccountDeletion}
                                variant="danger"
                                disabled={busy}
                            >
                                {t('Excluir minha conta')}
                            </ActionButton>
                            <ActionButton
                                onPress={() => {
                                    setDeletionOpen(false);
                                    setPassword('');
                                }}
                                variant="quiet"
                            >
                                {t('Cancelar')}
                            </ActionButton>
                        </View>
                    ) : null}
                </Card>
            ) : null}
            <PreferencesSheet
                visible={preferencesOpen}
                onClose={() => setPreferencesOpen(false)}
            />
        </Page>
    );
}

function errorMessageFor(error: unknown): string {
    return error instanceof ApiError
        ? error.message
        : t('Não foi possível concluir a solicitação.');
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        demoBanner: {
            backgroundColor: colors.primarySoft,
            borderRadius: 14,
            padding: 12,
        },
        demoBannerText: {
            fontFamily: 'DMSans',
            color: colors.primary,
            fontSize: 12,
            fontWeight: '700',
            textAlign: 'center',
        },
        profileCard: { alignItems: 'center', paddingVertical: 28, gap: 16 },
        profileCopy: { alignItems: 'center', gap: 7, width: '100%' },
        name: {
            fontFamily: 'SpaceGrotesk',
            color: colors.text,
            fontSize: 24,
            fontWeight: '700',
            textAlign: 'center',
        },
        email: {
            fontFamily: 'DMSans',
            color: colors.muted,
            fontSize: 13,
            textAlign: 'center',
        },
        description: {
            fontFamily: 'DMSans',
            color: colors.muted,
            fontSize: 12,
            lineHeight: 19,
        },
        error: {
            fontFamily: 'DMSans',
            backgroundColor: colors.surfaceMuted,
            borderRadius: 14,
            color: colors.text,
            fontSize: 13,
            padding: 14,
        },
        dangerCard: { borderColor: colors.border },
        deletionContent: { gap: 16, paddingTop: 8 },
    });
