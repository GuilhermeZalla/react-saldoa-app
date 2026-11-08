import { router } from 'expo-router';
import { useState } from 'react';
import { Card, Page, PreferencesSheet, SettingsRow } from '../../components';
import { FinanceHeader } from '../../finance-components';
import { useSession } from '../../SessionContext';
import { t } from '../../i18n';

export default function MoreRoute() {
    const { session } = useSession();
    const [preferencesOpen, setPreferencesOpen] = useState(false);
    if (!session) return null;
    return (
        <Page contentStyle={{ padding: 18, gap: 18, maxWidth: 820 }}>
            <FinanceHeader
                title={t('Seu Saldoa')}
                subtitle={t('Organização, preferências e sua conta.')}
                name={session.user.name}
                eyebrow={t('Do seu jeito')}
            />
            <Card>
                <SettingsRow
                    icon="categories"
                    title={t('Categorias')}
                    subtitle={t('Organize suas receitas e despesas.')}
                    onPress={() => router.navigate('/categories')}
                />
                <SettingsRow
                    icon="repeat"
                    title={t('Recorrências')}
                    subtitle={t('Organize o que se repete.')}
                    onPress={() => router.navigate('/recurring')}
                />
                <SettingsRow
                    icon="settings"
                    title={t('Idioma e aparência')}
                    onPress={() => setPreferencesOpen(true)}
                />
                <SettingsRow
                    icon="user"
                    title={t('Minha conta')}
                    subtitle={t('Perfil, exportação e segurança.')}
                    onPress={() => router.navigate('/account')}
                />
                <SettingsRow
                    icon="help"
                    title={t('Como usar o Saldoa')}
                    subtitle={t('Primeiros passos e guia de uso.')}
                    onPress={() => router.navigate('/help')}
                />
            </Card>
            <PreferencesSheet
                visible={preferencesOpen}
                onClose={() => setPreferencesOpen(false)}
            />
        </Page>
    );
}
