import { useThemeStyles } from '../PreferencesContext';
import { t } from '../i18n';
import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSession } from '../SessionContext';
import type { ThemeColors } from '../theme';

export default function IndexRoute() {
    const { colors, styles } = useThemeStyles(createStyles);
    const { session, loading } = useSession();

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator color={colors.primary} size="large" />
                <Text style={styles.text}>{t('Carregando Saldoa…')}</Text>
            </View>
        );
    }

    return <Redirect href={session === null ? '/login' : '/(app)/dashboard'} />;
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        loading: {
            alignItems: 'center',
            backgroundColor: colors.background,
            flex: 1,
            gap: 12,
            justifyContent: 'center',
        },
        text: { fontFamily: 'DMSans', color: colors.muted, fontSize: 13 },
    });
