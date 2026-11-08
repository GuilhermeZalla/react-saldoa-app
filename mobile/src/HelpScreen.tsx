import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import {
    ActionButton,
    Card,
    Page,
    PageTitle,
    ResponsiveGrid,
    SectionTitle,
} from './components';
import { usePreferences, useThemeStyles } from './PreferencesContext';
import { t } from './i18n';
import { helpSteps, helpTopics } from './help';
import { downloadGuide } from './guideDownload';
import type { ThemeColors } from './theme';

export default function HelpScreen() {
    const { styles } = useThemeStyles(createStyles);
    const { language } = usePreferences();
    const [downloading, setDownloading] = useState(false);
    const webUrl = process.env.EXPO_PUBLIC_WEB_URL?.trim().replace(/\/+$/, '');
    async function saveGuide(): Promise<void> {
        if (downloading) return;
        setDownloading(true);
        try {
            if (!webUrl) throw new Error('Missing web URL');
            const result = await downloadGuide(webUrl, language);
            if (result === 'saved') {
                Alert.alert(
                    t('Guia salvo com sucesso!'),
                    t(
                        'O PDF está na pasta que você escolheu. Você pode abri-lo mesmo sem internet.',
                    ),
                );
            }
        } catch {
            Alert.alert(
                t('Não foi possível baixar o guia'),
                t(
                    'Confira sua conexão e tente novamente. Se o problema continuar, tente mais tarde.',
                ),
            );
        } finally {
            setDownloading(false);
        }
    }
    return (
        <Page>
            <PageTitle
                title={t('Como usar o Saldoa')}
                subtitle={t(
                    'Comece com três passos. Consulte esta ajuda sempre que precisar.',
                )}
            />
            <ResponsiveGrid>
                {helpSteps.map((step) => (
                    <Card key={step.title}>
                        <SectionTitle title={t(step.title)} />
                        <Text style={styles.text}>{t(step.description)}</Text>
                        <ActionButton
                            variant="secondary"
                            onPress={() => router.navigate(step.href)}
                        >
                            {t('Abrir')}
                        </ActionButton>
                    </Card>
                ))}
                {helpTopics.map((topic) => (
                    <Card key={topic.title}>
                        <SectionTitle title={t(topic.title)} />
                        <Text style={styles.text}>{t(topic.description)}</Text>
                        <ActionButton
                            variant="quiet"
                            onPress={() => router.navigate(topic.href)}
                        >
                            {t('Abrir')}
                        </ActionButton>
                    </Card>
                ))}
                <Card>
                    <SectionTitle title={t('Guia completo em PDF')} />
                    <Text style={styles.text}>
                        {t(
                            'Guia no idioma do aplicativo, com capturas em português. Escolha uma pasta para salvar o PDF. É preciso internet para baixar; depois você pode ler offline.',
                        )}
                    </Text>
                    <ActionButton
                        variant="secondary"
                        loading={downloading}
                        onPress={() => void saveGuide()}
                    >
                        {t('Baixar guia em PDF')}
                    </ActionButton>
                </Card>
            </ResponsiveGrid>
        </Page>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        text: {
            fontFamily: 'DMSans',
            fontSize: 15,
            lineHeight: 23,
            color: colors.muted,
        },
    });
