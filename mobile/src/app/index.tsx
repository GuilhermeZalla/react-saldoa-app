import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSession } from '../SessionContext';
import { colors } from '../theme';

export default function IndexRoute() {
    const { session, loading } = useSession();

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator color={colors.primary} size="large" />
                <Text style={styles.text}>Carregando Saldoa…</Text>
            </View>
        );
    }

    return <Redirect href={session === null ? '/login' : '/(app)/dashboard'} />;
}

const styles = StyleSheet.create({
    loading: {
        alignItems: 'center',
        backgroundColor: colors.background,
        flex: 1,
        gap: 12,
        justifyContent: 'center',
    },
    text: { color: colors.muted, fontSize: 13 },
});
