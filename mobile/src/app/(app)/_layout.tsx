import { Redirect, Tabs } from 'expo-router';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
    type ColorValue,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSession } from '../../SessionContext';
import { usePreferences } from '../../PreferencesContext';
import { AppIcon, type IconName } from '../../icons';

// Keep secondary routes navigable: href: null also redirects them in Expo Router 58.
const secondaryScreenOptions = {
    tabBarButton: () => null,
    tabBarItemStyle: { display: 'none' as const },
};

export default function MainTabsLayout() {
    const { session, loading } = useSession();
    const { colors, t } = usePreferences();
    const insets = useSafeAreaInsets();

    if (loading) {
        return (
            <View
                style={[styles.loading, { backgroundColor: colors.background }]}
            >
                <ActivityIndicator color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.muted }]}>
                    {t('Carregando Saldoa…')}
                </Text>
            </View>
        );
    }

    if (session === null) {
        return <Redirect href="/login" />;
    }

    return (
        <Tabs
            backBehavior="history"
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.muted,
                tabBarLabelStyle: styles.tabLabel,
                tabBarStyle: [
                    styles.tabBar,
                    {
                        backgroundColor: colors.surface,
                        borderTopColor: colors.border,
                        height: 68 + insets.bottom,
                        paddingBottom: Math.max(8, insets.bottom),
                    },
                ],
                tabBarHideOnKeyboard: true,
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: t('Início'),
                    tabBarIcon: ({ color, size, focused }) => (
                        <TabIcon
                            focused={focused}
                            name="home"
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="transactions"
                options={{
                    title: t('Lançamentos'),
                    tabBarLabel: t('Lançamentos'),
                    tabBarAccessibilityLabel: t('Lançamentos'),
                    tabBarIcon: ({ color, size, focused }) => (
                        <TabIcon
                            focused={focused}
                            name="transactions"
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="budgets"
                options={{
                    title: t('Planejamento'),
                    tabBarIcon: ({ color, size, focused }) => (
                        <TabIcon
                            focused={focused}
                            name="calendar"
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="more"
                options={{
                    title: t('Mais'),
                    tabBarIcon: ({ color, size, focused }) => (
                        <TabIcon
                            focused={focused}
                            name="more"
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />
            <Tabs.Screen name="categories" options={secondaryScreenOptions} />
            <Tabs.Screen name="recurring" options={secondaryScreenOptions} />
            <Tabs.Screen name="account" options={secondaryScreenOptions} />
            <Tabs.Screen name="help" options={secondaryScreenOptions} />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    loading: {
        alignItems: 'center',
        flex: 1,
        gap: 12,
        justifyContent: 'center',
    },
    loadingText: { fontFamily: 'DMSans', fontSize: 13 },
    tabBar: {
        elevation: 0,
        paddingTop: 8,
    },
    tabIcon: {
        width: 44,
        height: 34,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabLabel: {
        fontFamily: 'DMSans',
        fontSize: 12,
        fontWeight: '600',
        lineHeight: 18,
    },
});

function TabIcon({
    name,
    color,
    size,
    focused,
}: {
    name: IconName;
    color: ColorValue;
    size: number;
    focused: boolean;
}) {
    const { colors } = usePreferences();
    return (
        <View
            style={[
                styles.tabIcon,
                {
                    backgroundColor: focused
                        ? colors.primarySoft
                        : 'transparent',
                },
            ]}
        >
            <AppIcon name={name} color={color} size={Math.max(26, size)} />
        </View>
    );
}
