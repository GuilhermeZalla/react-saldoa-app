import type { PropsWithChildren, ReactNode } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { G, Line, Rect, Text as SvgText } from 'react-native-svg';
import { useThemeStyles } from './PreferencesContext';
import { AppIcon } from './icons';
import { Card, IconButton, UserAvatar } from './components';
import { formatCurrency, shiftMonth } from './format';
import { getLocale, t } from './i18n';
import type { ThemeColors } from './theme';
import type { Dashboard, UpcomingTransaction } from './types';

export function FinanceCard({
    children,
    style,
}: PropsWithChildren<{ style?: object }>) {
    return (
        <Card style={[{ borderRadius: 14, padding: 18 }, style]}>
            {children}
        </Card>
    );
}

export function FinanceHeader({
    title,
    subtitle,
    name,
    eyebrow,
    action,
}: {
    title: string;
    subtitle: string;
    name: string;
    eyebrow: string;
    action?: ReactNode;
}) {
    const { styles } = useThemeStyles(createStyles);
    return (
        <View style={styles.header}>
            <View style={styles.headerCopy}>
                <Text style={styles.eyebrow}>{eyebrow}</Text>
                <View style={styles.titleRow}>
                    <Text accessibilityRole="header" style={styles.title}>
                        {title}
                    </Text>
                    {action}
                </View>
                <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('Abrir minha conta')}
                onPress={() => router.navigate('/account')}
            >
                <UserAvatar name={name} small />
            </Pressable>
        </View>
    );
}
export function MonthPicker({
    month,
    onChange,
}: {
    month: string;
    onChange: (month: string) => void;
}) {
    const { styles } = useThemeStyles(createStyles);
    return (
        <View style={styles.monthPicker}>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('Mês anterior')}
                style={styles.monthArrow}
                onPress={() => onChange(shiftMonth(month, -1))}
            >
                <Text style={styles.arrow}>‹</Text>
            </Pressable>
            <Text style={styles.monthLabel}>
                {new Intl.DateTimeFormat(getLocale(), {
                    month: 'short',
                    year: 'numeric',
                }).format(new Date(`${month}-01T12:00:00`))}
            </Text>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('Próximo mês')}
                style={styles.monthArrow}
                onPress={() => onChange(shiftMonth(month, 1))}
            >
                <Text style={styles.arrow}>›</Text>
            </Pressable>
        </View>
    );
}
export function InlineAction({
    label,
    onPress,
    disabled = false,
}: {
    label: string;
    onPress: () => void;
    disabled?: boolean;
}) {
    const { colors, styles } = useThemeStyles(createStyles);
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled }}
            disabled={disabled}
            onPress={onPress}
            style={styles.inlineAction}
        >
            <AppIcon
                name="plus"
                color={disabled ? colors.muted : colors.primary}
                size={17}
            />
            <Text
                style={[
                    styles.inlineActionText,
                    disabled && { color: colors.muted },
                ]}
            >
                {label}
            </Text>
        </Pressable>
    );
}
export function FinanceSheet({
    visible,
    title,
    onClose,
    children,
    busy = false,
}: {
    visible: boolean;
    title: string;
    onClose: () => void;
    busy?: boolean;
    children: ReactNode;
}) {
    const { styles } = useThemeStyles(createStyles);
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={() => {
                if (!busy) onClose();
            }}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.modal}
            >
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={() => {
                        if (!busy) onClose();
                    }}
                    accessibilityLabel={t('Fechar')}
                    accessibilityRole="button"
                />
                <SafeAreaView
                    edges={['bottom', 'left', 'right']}
                    style={styles.sheet}
                >
                    <View style={styles.sheetHead}>
                        <Text
                            accessibilityRole="header"
                            style={styles.sheetTitle}
                        >
                            {title}
                        </Text>
                        {!busy && (
                            <IconButton
                                icon="close"
                                label={t('Fechar')}
                                onPress={onClose}
                            />
                        )}
                    </View>
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={styles.sheetBody}
                    >
                        {children}
                    </ScrollView>
                </SafeAreaView>
            </KeyboardAvoidingView>
        </Modal>
    );
}
export function FinanceError({ message }: { message: string }) {
    const { styles } = useThemeStyles(createStyles);
    return message ? (
        <Text accessibilityRole="alert" style={styles.error}>
            {message}
        </Text>
    ) : null;
}
export function EmptyFinance({ children }: PropsWithChildren) {
    const { styles } = useThemeStyles(createStyles);
    return (
        <View style={styles.empty}>
            <Text style={styles.subtitle}>{children}</Text>
        </View>
    );
}
export function UpcomingList({
    items,
    hidden = false,
}: {
    items: UpcomingTransaction[];
    hidden?: boolean;
}) {
    const { colors, styles } = useThemeStyles(createStyles);
    return items.length ? (
        <View>
            {items.map((item) => (
                <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    onPress={() => router.navigate('/recurring')}
                    style={styles.upcoming}
                >
                    <View style={styles.dateBadge}>
                        <Text style={styles.day}>{item.date.slice(-2)}</Text>
                        <Text style={styles.dateMonth}>
                            {new Intl.DateTimeFormat(getLocale(), {
                                month: 'short',
                            }).format(new Date(item.date + 'T12:00:00'))}
                        </Text>
                    </View>
                    <View style={styles.upcomingCopy}>
                        <Text style={styles.rowTitle}>{item.description}</Text>
                        <Text style={styles.rowMeta}>
                            {item.category} · {t('Previsto')}
                        </Text>
                    </View>
                    <Text
                        style={[
                            styles.rowAmount,
                            {
                                color:
                                    item.type === 'income'
                                        ? colors.income
                                        : colors.expense,
                            },
                        ]}
                    >
                        {hidden
                            ? '••••'
                            : `${item.type === 'income' ? '+' : '−'} ${formatCurrency(item.amount)}`}
                    </Text>
                </Pressable>
            ))}
        </View>
    ) : (
        <EmptyFinance>
            {t('Nenhuma recorrência prevista neste período.')}
        </EmptyFinance>
    );
}
export function MonthlyFlowChart({
    data,
    hidden = false,
}: {
    data: Dashboard['monthlyTrend'];
    hidden?: boolean;
}) {
    const { colors, styles } = useThemeStyles(createStyles);
    const highest = Math.max(
        1,
        ...data.flatMap((item) => [Number(item.income), Number(item.expense)]),
    );
    const max = Math.ceil(highest / 100) * 100;
    return (
        <View
            accessible
            accessibilityLabel={t('Receitas e despesas dos últimos seis meses')}
        >
            <View style={styles.legend}>
                <Text style={[styles.legendText, { color: colors.income }]}>
                    ● {t('Receitas')}
                </Text>
                <Text style={[styles.legendText, { color: colors.expense }]}>
                    ● {t('Despesas')}
                </Text>
            </View>
            <Svg width="100%" height={160} viewBox="0 0 340 160">
                {[0, 0.5, 1].map((fraction) => (
                    <Line
                        key={fraction}
                        x1={8}
                        x2={332}
                        y1={124 - fraction * 108}
                        y2={124 - fraction * 108}
                        stroke={colors.border}
                        strokeDasharray="3 5"
                    />
                ))}
                {data.map((item, index) => {
                    const x = 19 + index * 54;
                    const income = (Number(item.income) / max) * 108;
                    const expense = (Number(item.expense) / max) * 108;
                    return (
                        <G key={item.month}>
                            <Rect
                                x={x}
                                y={124 - income}
                                width={15}
                                height={income}
                                rx={3}
                                fill={colors.income}
                            />
                            <Rect
                                x={x + 19}
                                y={124 - expense}
                                width={15}
                                height={expense}
                                rx={3}
                                fill={colors.expense}
                            />
                            <SvgText
                                x={x + 17}
                                y={147}
                                textAnchor="middle"
                                fontSize={10}
                                fontFamily="DMSans"
                                fill={colors.muted}
                            >
                                {new Intl.DateTimeFormat(getLocale(), {
                                    month: 'short',
                                }).format(
                                    new Date(item.month + '-01T12:00:00'),
                                )}
                            </SvgText>
                        </G>
                    );
                })}
            </Svg>
            {!hidden && (
                <Text style={styles.chartScale}>
                    {t('Escala máxima: {amount}', {
                        amount: formatCurrency(max),
                    })}
                </Text>
            )}
        </View>
    );
}
export const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 12,
        },
        headerCopy: { flex: 1, gap: 5 },
        eyebrow: {
            fontFamily: 'DMSans',
            fontSize: 14,
            letterSpacing: 1.1,
            color: colors.muted,
            textTransform: 'uppercase',
        },
        titleRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
        title: {
            fontFamily: 'SpaceGrotesk',
            fontSize: 26,
            fontWeight: '700',
            letterSpacing: -0.8,
            color: colors.text,
            flexShrink: 1,
        },
        subtitle: {
            fontFamily: 'DMSans',
            fontSize: 14,
            lineHeight: 20,
            color: colors.muted,
        },
        monthPicker: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 10,
        },
        monthArrow: {
            width: 36,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
        },
        arrow: { fontFamily: 'DMSans', fontSize: 23, color: colors.muted },
        monthLabel: {
            fontFamily: 'DMSans',
            fontSize: 14,
            color: colors.text,
            minWidth: 82,
            textAlign: 'center',
        },
        inlineAction: {
            minHeight: 44,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
        },
        inlineActionText: {
            fontFamily: 'DMSans',
            color: colors.primary,
            fontSize: 14,
            fontWeight: '600',
        },
        modal: {
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'center',
            backgroundColor: colors.backdrop,
        },
        sheet: {
            backgroundColor: colors.surface,
            width: '100%',
            maxWidth: 580,
            maxHeight: '92%',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderColor: colors.border,
            borderWidth: 1,
        },
        sheetHead: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 20,
            paddingBottom: 10,
        },
        sheetTitle: {
            fontFamily: 'SpaceGrotesk',
            fontSize: 22,
            fontWeight: '700',
            color: colors.text,
            flex: 1,
        },
        sheetBody: { padding: 20, paddingTop: 8, gap: 16 },
        error: {
            fontFamily: 'DMSans',
            fontSize: 14,
            lineHeight: 20,
            color: colors.expense,
            backgroundColor: colors.expenseSoft,
            borderRadius: 10,
            padding: 12,
        },
        empty: { paddingVertical: 20, alignItems: 'center' },
        upcoming: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingVertical: 13,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
        dateBadge: {
            width: 40,
            minHeight: 44,
            backgroundColor: colors.background,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
        },
        day: {
            fontFamily: 'SpaceGrotesk',
            fontSize: 17,
            fontWeight: '600',
            color: colors.text,
        },
        dateMonth: { fontFamily: 'DMSans', fontSize: 14, color: colors.muted },
        upcomingCopy: { flex: 1, gap: 3 },
        rowTitle: {
            fontFamily: 'DMSans',
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
        },
        rowMeta: { fontFamily: 'DMSans', fontSize: 14, color: colors.muted },
        rowAmount: {
            fontFamily: 'SpaceGrotesk',
            fontSize: 14,
            fontWeight: '600',
            flexShrink: 0,
        },
        legend: { flexDirection: 'row', gap: 14, justifyContent: 'flex-end' },
        legendText: { fontFamily: 'DMSans', fontSize: 14 },
        chartScale: {
            fontFamily: 'DMSans',
            fontSize: 14,
            color: colors.muted,
            textAlign: 'right',
        },
    });
