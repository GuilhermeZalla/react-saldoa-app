import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { ActionButton, Card, IconButton } from './components';
import { useThemeStyles } from './PreferencesContext';
import { helpSteps } from './help';
import { t } from './i18n';
import type { ThemeColors } from './theme';
import type { Session } from './types';

export function GettingStarted({
    session,
    empty,
}: {
    session: Session;
    empty: boolean;
}) {
    const { styles } = useThemeStyles(createStyles);
    const [visible, setVisible] = useState(false);
    const storageKey = `saldoa.help.${encodeURIComponent(session.apiUrl).replace(/%/g, '_')}.${session.user.id}`;
    useEffect(() => {
        let active = true;
        async function restore(): Promise<void> {
            try {
                const saved =
                    Platform.OS === 'web'
                        ? globalThis.localStorage.getItem(storageKey)
                        : await SecureStore.getItemAsync(storageKey);
                if (active) setVisible(saved !== 'true');
            } catch {
                if (active) setVisible(true);
            }
        }
        void restore();
        return () => {
            active = false;
        };
    }, [storageKey]);
    async function dismiss(): Promise<void> {
        setVisible(false);
        try {
            if (Platform.OS === 'web')
                globalThis.localStorage.setItem(storageKey, 'true');
            else await SecureStore.setItemAsync(storageKey, 'true');
        } catch {
            /* Dismissal remains effective for this visit. */
        }
    }
    if (!empty || !visible || session.isDemo) return null;
    return (
        <Card>
            <View style={styles.heading}>
                <Text style={styles.title}>{t('Seus primeiros passos')}</Text>
                <IconButton
                    icon="close"
                    label={t('Dispensar primeiros passos')}
                    onPress={() => void dismiss()}
                />
            </View>
            {helpSteps.map((step) => (
                <ActionButton
                    key={step.title}
                    variant="quiet"
                    onPress={() => router.navigate(step.href)}
                >
                    {t(step.title)}
                </ActionButton>
            ))}
            <Text style={styles.text}>
                {t(
                    'Você pode dispensar estas dicas e consultar a ajuda na aba Mais.',
                )}
            </Text>
        </Card>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        heading: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
        },
        title: {
            fontFamily: 'SpaceGrotesk',
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            flex: 1,
        },
        text: {
            fontFamily: 'DMSans',
            fontSize: 14,
            lineHeight: 21,
            color: colors.muted,
        },
    });
