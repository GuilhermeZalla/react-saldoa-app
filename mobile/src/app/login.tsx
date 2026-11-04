import { useThemeStyles } from '../PreferencesContext';
import { t } from '../i18n';
import { Redirect } from 'expo-router';
import AuthScreen from '../AuthScreen';
import { useSession } from '../SessionContext';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { ThemeColors } from '../theme';

export default function LoginRoute() {
    const { colors, styles } = useThemeStyles(createStyles);
    const { session, loading, authenticate } = useSession();

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.text}>{t('Carregando Saldoa…')}</Text>
            </View>
        );
    }

    if (session !== null) {
        return <Redirect href="/(app)/dashboard" />;
    }

    return <AuthScreen onAuthenticated={authenticate} />;
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
