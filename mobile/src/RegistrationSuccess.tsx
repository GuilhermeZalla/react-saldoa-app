import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, Text } from 'react-native';
import { ActionButton, Page } from './components';
import { AppIcon } from './icons';
import { t } from './i18n';
import { useThemeStyles } from './PreferencesContext';
import type { ThemeColors } from './theme';

export function RegistrationSuccess({
    onContinue,
    busy,
    error,
}: {
    onContinue: () => Promise<void>;
    busy: boolean;
    error: string;
}) {
    const { colors, styles } = useThemeStyles(createStyles);
    const [progress] = useState(() => new Animated.Value(0));
    useEffect(() => {
        let active = true;
        void AccessibilityInfo.isReduceMotionEnabled()
            .then((reduced) => {
                if (!active) return;
                if (reduced) progress.setValue(1);
                else
                    Animated.timing(progress, {
                        toValue: 1,
                        duration: 450,
                        useNativeDriver: true,
                    }).start();
            })
            .catch(() => progress.setValue(1));
        return () => {
            active = false;
            progress.stopAnimation();
        };
    }, [progress]);
    return (
        <Page contentStyle={styles.page}>
            <Animated.View
                style={[
                    styles.mark,
                    {
                        opacity: progress,
                        transform: [
                            {
                                scale: progress.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.8, 1],
                                }),
                            },
                        ],
                    },
                ]}
            >
                <AppIcon name="check" color={colors.primary} size={48} />
            </Animated.View>
            <Text
                accessibilityRole="header"
                accessibilityLiveRegion="polite"
                style={styles.title}
            >
                {t('Conta criada com sucesso!')}
            </Text>
            <Text style={styles.description}>
                {t(
                    'Seu Saldoa está pronto. Vamos organizar suas finanças, um passo de cada vez.',
                )}
            </Text>
            {error ? (
                <Text accessibilityRole="alert" style={styles.description}>
                    {error}
                </Text>
            ) : null}
            <ActionButton onPress={() => void onContinue()} loading={busy}>
                {t('Começar a usar')}
            </ActionButton>
        </Page>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        page: {
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 24,
            maxWidth: 480,
            padding: 28,
        },
        mark: {
            backgroundColor: colors.primarySoft,
            width: 100,
            height: 100,
            borderRadius: 50,
            alignItems: 'center',
            justifyContent: 'center',
        },
        title: {
            fontFamily: 'SpaceGrotesk',
            fontSize: 28,
            fontWeight: '700',
            color: colors.text,
            textAlign: 'center',
        },
        description: {
            fontFamily: 'DMSans',
            fontSize: 16,
            lineHeight: 24,
            color: colors.muted,
            textAlign: 'center',
        },
    });
