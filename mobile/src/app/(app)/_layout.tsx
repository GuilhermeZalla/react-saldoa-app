import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSession } from '../../SessionContext';
import { colors } from '../../theme';

export default function MainTabsLayout() {
    const { session, loading } = useSession();

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.loadingText}>Carregando Saldoa…</Text>
            </View>
        );
    }

    if (session === null) {
        return <Redirect href="/login" />;
    }

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.muted,
                tabBarLabelStyle: styles.tabLabel,
                tabBarStyle: styles.tabBar,
            }}
        >
            <Tabs.Screen name="dashboard" options={{ title: 'Início' }} />
            <Tabs.Screen
                name="transactions"
                options={{ title: 'Lançamentos' }}
            />
            <Tabs.Screen name="categories" options={{ title: 'Categorias' }} />
            <Tabs.Screen name="budgets" options={{ title: 'Metas' }} />
            <Tabs.Screen
                name="recurring"
                options={{ title: 'Recorrências' }}
            />
            <Tabs.Screen name="account" options={{ title: 'Conta' }} />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    loading: {
        alignItems: 'center',
        backgroundColor: colors.background,
        flex: 1,
        gap: 12,
        justifyContent: 'center',
    },
    loadingText: { color: colors.muted, fontSize: 13 },
    tabBar: {
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        elevation: 0,
    },
    tabLabel: { fontSize: 10, fontWeight: '600' },
});
