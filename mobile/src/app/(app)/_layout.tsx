import { Redirect, Tabs } from 'expo-router';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
    type ColorValue,
} from 'react-native';
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
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Início',
                    tabBarIcon: ({ color, size }) => (
                        <TabIcon symbol="⌂" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="transactions"
                options={{
                    title: 'Lançamentos',
                    tabBarLabel: 'Lanç.',
                    tabBarAccessibilityLabel: 'Lançamentos',
                    tabBarIcon: ({ color, size }) => (
                        <TabIcon symbol="↕" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="categories"
                options={{
                    title: 'Categorias',
                    tabBarIcon: ({ color, size }) => (
                        <TabIcon symbol="▦" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="budgets"
                options={{
                    title: 'Metas',
                    tabBarIcon: ({ color, size }) => (
                        <TabIcon symbol="◎" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="recurring"
                options={{
                    title: 'Recorrências',
                    tabBarLabel: 'Recorr.',
                    tabBarAccessibilityLabel: 'Recorrências',
                    tabBarIcon: ({ color, size }) => (
                        <TabIcon symbol="↻" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="account"
                options={{
                    title: 'Conta',
                    tabBarIcon: ({ color, size }) => (
                        <TabIcon symbol="●" color={color} size={size} />
                    ),
                }}
            />
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
        height: 58,
        paddingBottom: 4,
        paddingTop: 4,
    },
    tabLabel: { fontSize: 10, fontWeight: '600', lineHeight: 12 },
});

function TabIcon({
    symbol,
    color,
    size,
}: {
    symbol: string;
    color: ColorValue;
    size: number;
}) {
    return (
        <Text style={{ color, fontSize: size, lineHeight: size + 1 }}>
            {symbol}
        </Text>
    );
}
