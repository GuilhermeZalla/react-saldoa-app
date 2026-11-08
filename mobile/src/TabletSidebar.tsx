import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { usePreferences, useThemeStyles } from './PreferencesContext';
import type { ThemeColors } from './theme';
import { AppIcon, type IconName } from './icons';

const financeItems: [string, string, IconName][] = [
    ['dashboard', 'Início', 'home'],
    ['transactions', 'Lançamentos', 'transactions'],
    ['budgets', 'Planejamento', 'calendar'],
    ['categories', 'Categorias', 'categories'],
    ['recurring', 'Recorrências', 'repeat'],
];

export function TabletSidebar({
    state,
    emitter,
    navigateToTab,
    insets,
    onOpenPreferences,
}: BottomTabBarProps & { onOpenPreferences: () => void }) {
    const { t } = usePreferences();
    const { colors, styles } = useThemeStyles(createStyles);
    const activeRoute = state.routes[state.index];

    function item(name: string, label: string, icon: IconName) {
        const route = state.routes.find((candidate) => candidate.name === name);
        if (!route) return null;
        const selected = activeRoute.key === route.key;
        return (
            <Pressable
                key={name}
                accessibilityRole="tab"
                accessibilityLabel={t(label)}
                accessibilityState={{ selected }}
                aria-selected={selected}
                onPress={() => {
                    const event = emitter.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });
                    if (!selected && !event.defaultPrevented) {
                        navigateToTab(route.key);
                    }
                }}
                style={({ pressed }) => [
                    styles.item,
                    {
                        backgroundColor:
                            selected || pressed
                                ? colors.primarySoft
                                : 'transparent',
                    },
                ]}
            >
                <AppIcon
                    name={icon}
                    size={22}
                    color={selected ? colors.primary : colors.muted}
                />
                <Text
                    style={[
                        styles.label,
                        { color: selected ? colors.primary : colors.text },
                    ]}
                >
                    {t(label)}
                </Text>
            </Pressable>
        );
    }

    return (
        <ScrollView
            style={styles.sidebar}
            contentContainerStyle={[
                styles.content,
                {
                    paddingTop: Math.max(24, insets.top),
                    paddingBottom: Math.max(20, insets.bottom),
                    paddingLeft: 12 + insets.left,
                },
            ]}
        >
            <View style={styles.brand}>
                <AppIcon name="brand" size={32} color={colors.primary} />
                <Text style={[styles.brandText, { color: colors.text }]}>
                    Saldoa
                </Text>
            </View>
            <Text style={[styles.heading, { color: colors.muted }]}>
                {t('Finanças').toLocaleUpperCase()}
            </Text>
            {financeItems.map(([name, label, icon]) => item(name, label, icon))}
            <View style={[styles.secondary, { borderTopColor: colors.border }]}>
                <Text style={[styles.heading, { color: colors.muted }]}>
                    {t('Conta e ajuda').toLocaleUpperCase()}
                </Text>
                {item('account', 'Minha conta', 'user')}
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('Preferências')}
                    onPress={onOpenPreferences}
                    style={({ pressed }) => [
                        styles.item,
                        {
                            backgroundColor: pressed
                                ? colors.primarySoft
                                : 'transparent',
                        },
                    ]}
                >
                    <AppIcon name="settings" size={22} color={colors.muted} />
                    <Text style={[styles.label, { color: colors.text }]}>
                        {t('Preferências')}
                    </Text>
                </Pressable>
                {item('help', 'Como usar o Saldoa', 'help')}
            </View>
        </ScrollView>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        sidebar: {
            backgroundColor: colors.surface,
            borderRightColor: colors.border,
            width: 216,
            flexGrow: 0,
            flexShrink: 0,
            borderRightWidth: 1,
        },
        content: { flexGrow: 1, paddingRight: 12 },
        brand: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingHorizontal: 10,
            marginBottom: 30,
        },
        brandText: {
            fontFamily: 'SpaceGrotesk',
            fontSize: 25,
            fontWeight: '700',
        },
        heading: {
            fontFamily: 'DMSans',
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 1,
            marginHorizontal: 12,
            marginBottom: 12,
        },
        item: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            minHeight: 50,
            paddingVertical: 12,
            paddingHorizontal: 12,
            borderRadius: 12,
            marginBottom: 4,
        },
        label: {
            fontFamily: 'DMSans',
            fontSize: 14,
            lineHeight: 20,
            fontWeight: '600',
            flex: 1,
        },
        secondary: { marginTop: 'auto', paddingTop: 22, borderTopWidth: 1 },
    });
