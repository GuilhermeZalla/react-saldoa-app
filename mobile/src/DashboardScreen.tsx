import { useThemeStyles } from './PreferencesContext';
import { getLocale, t } from './i18n';
import { useCallback, useEffect, useState } from 'react';
import {
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { router } from 'expo-router';
import { AppIcon, type IconName } from './icons';
import { ApiError, sessionRequest } from './api';
import {
    ActionButton,
    Card,
    Page,
    UserAvatar,
    ProgressBar,
    SectionTitle,
    useCommonStyles,
} from './components';
import { currentMonth, formatCurrency, formatDate } from './format';
import type { ThemeColors } from './theme';
import type { Dashboard, Session } from './types';

type Props = { session: Session };

export default function DashboardScreen({ session }: Props) {
    const { colors, styles } = useThemeStyles(createStyles);
    const commonStyles = useCommonStyles();
    const [dashboard, setDashboard] = useState<Dashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const fetchDashboard = useCallback(async () => {
        const response = await sessionRequest<{ data: Dashboard }>(
            session,
            `/dashboard?month=${currentMonth()}`,
        );

        return response.data;
    }, [session]);

    const loadDashboard = useCallback(async () => {
        setErrorMessage('');

        try {
            setDashboard(await fetchDashboard());
        } catch (error) {
            setErrorMessage(
                error instanceof ApiError
                    ? error.message
                    : t('Não foi possível carregar o resumo.'),
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [fetchDashboard]);

    useEffect(() => {
        let isCurrent = true;

        async function loadInitialDashboard(): Promise<void> {
            try {
                const data = await fetchDashboard();

                if (isCurrent) {
                    setDashboard(data);
                    setErrorMessage('');
                }
            } catch (error) {
                if (isCurrent) {
                    setErrorMessage(
                        error instanceof ApiError
                            ? error.message
                            : t('Não foi possível carregar o resumo.'),
                    );
                }
            } finally {
                if (isCurrent) {
                    setLoading(false);
                }
            }
        }

        void loadInitialDashboard();

        return () => {
            isCurrent = false;
        };
    }, [fetchDashboard]);

    const summary = dashboard?.summary;

    return (
        <Page
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => {
                        setRefreshing(true);
                        void loadDashboard();
                    }}
                />
            }
        >
            <View style={styles.header}>
                <View style={styles.headerCopy}>
                    <Text style={styles.eyebrow}>
                        {t('Seu resumo financeiro')}
                    </Text>
                    <Text accessibilityRole="header" style={styles.greeting}>
                        {t('Olá, {name}', {
                            name: session.user.name.split(' ')[0],
                        })}
                    </Text>
                </View>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('Abrir minha conta')}
                    onPress={() => router.navigate('/account')}
                >
                    <UserAvatar name={session.user.name} small />
                </Pressable>
            </View>
            {session.isDemo ? (
                <View style={styles.demoBanner}>
                    <Text style={styles.demoBannerText}>
                        {t('Modo demonstração · somente leitura')}
                    </Text>
                </View>
            ) : null}

            {errorMessage ? (
                <Card>
                    <Text style={styles.error}>{errorMessage}</Text>
                    <ActionButton
                        onPress={() => void loadDashboard()}
                        variant="secondary"
                        compact
                    >
                        {t('Tentar novamente')}
                    </ActionButton>
                </Card>
            ) : null}

            <Card style={styles.balanceCard}>
                <View style={styles.balanceHeading}>
                    <Text style={styles.metricLabel}>{t('Saldo total')}</Text>
                    <AppIcon name="wallet" color={colors.primary} size={25} />
                </View>
                <Text
                    style={styles.balance}
                    adjustsFontSizeToFit
                    minimumFontScale={0.6}
                    numberOfLines={1}
                >
                    {loading || !summary
                        ? '—'
                        : formatCurrency(summary.overallBalance)}
                </Text>
                <View style={styles.balanceFooter}>
                    <Text style={styles.balanceCaption}>
                        {t('Saldo de todos os períodos')}
                    </Text>
                    <Text style={styles.month}>
                        {new Intl.DateTimeFormat(getLocale(), {
                            month: 'short',
                            year: 'numeric',
                        }).format(new Date())}
                    </Text>
                </View>
            </Card>
            <View style={styles.metricGrid}>
                <MetricCard
                    label={t('Receitas no mês')}
                    value={summary?.monthlyIncome}
                    kind="income"
                    loading={loading}
                />
                <MetricCard
                    label={t('Despesas no mês')}
                    value={summary?.monthlyExpense}
                    kind="expense"
                    loading={loading}
                />
            </View>

            <View style={styles.quickActions}>
                <QuickAction
                    icon="plus"
                    label={t('Lançamentos')}
                    onPress={() => router.navigate('/transactions')}
                />
                <QuickAction
                    icon="target"
                    label={t('Metas')}
                    onPress={() => router.navigate('/budgets')}
                />
                <QuickAction
                    icon="repeat"
                    label={t('Recorrências')}
                    onPress={() => router.navigate('/recurring')}
                />
            </View>
            <Card>
                <SectionTitle title={t('Despesas por categoria')} />
                {dashboard?.expensesByCategory.length ? (
                    dashboard.expensesByCategory.slice(0, 5).map((category) => {
                        const total = dashboard.expensesByCategory.reduce(
                            (sum, item) => sum + Number(item.total),
                            0,
                        );
                        const percentage =
                            total > 0
                                ? (Number(category.total) / total) * 100
                                : 0;
                        return (
                            <View key={category.id} style={styles.categoryItem}>
                                <View style={styles.listRow}>
                                    <Text style={styles.rowTitle}>
                                        {category.name}
                                    </Text>
                                    <Text style={styles.rowAmount}>
                                        {formatCurrency(category.total)}
                                    </Text>
                                </View>
                                <ProgressBar
                                    value={percentage}
                                    label={category.name}
                                />
                            </View>
                        );
                    })
                ) : (
                    <Text style={commonStyles.muted}>
                        {loading
                            ? t('Carregando resumo…')
                            : t('Ainda não há despesas neste mês.')}
                    </Text>
                )}
            </Card>
            <Card>
                <SectionTitle
                    title={t('Movimentações recentes')}
                    action={
                        <ActionButton
                            compact
                            variant="quiet"
                            onPress={() => router.navigate('/transactions')}
                        >
                            {t('Ver todas')}
                        </ActionButton>
                    }
                />
                {dashboard?.recentTransactions.length ? (
                    dashboard.recentTransactions.map((transaction) => (
                        <View
                            key={transaction.id}
                            style={styles.transactionRow}
                        >
                            <View
                                style={[
                                    styles.transactionIcon,
                                    {
                                        backgroundColor:
                                            transaction.type === 'income'
                                                ? colors.incomeSoft
                                                : colors.expenseSoft,
                                    },
                                ]}
                            >
                                <AppIcon
                                    name={
                                        transaction.type === 'income'
                                            ? 'arrow-down'
                                            : 'arrow-up'
                                    }
                                    color={
                                        transaction.type === 'income'
                                            ? colors.income
                                            : colors.expense
                                    }
                                    size={20}
                                />
                            </View>
                            <View style={styles.transactionDescription}>
                                <Text style={styles.rowTitle} numberOfLines={1}>
                                    {transaction.description}
                                </Text>
                                <Text style={styles.rowMeta} numberOfLines={2}>
                                    {transaction.category} ·{' '}
                                    {formatDate(transaction.date)}
                                </Text>
                            </View>
                            <Text
                                style={[
                                    styles.rowAmount,
                                    transaction.type === 'income'
                                        ? styles.income
                                        : styles.expense,
                                ]}
                            >
                                {transaction.type === 'income' ? '+' : '−'}
                                {formatCurrency(transaction.amount)}
                            </Text>
                        </View>
                    ))
                ) : (
                    <Text style={commonStyles.muted}>
                        {loading
                            ? t('Carregando resumo…')
                            : t('Seus lançamentos aparecerão aqui.')}
                    </Text>
                )}
            </Card>

            {dashboard?.budgetAlerts.length ? (
                <Card style={styles.warningCard}>
                    <SectionTitle title={t('Atenção às metas')} />
                    {dashboard.budgetAlerts.map((alert) => (
                        <Text
                            key={alert.category_name}
                            style={styles.warningText}
                        >
                            {alert.category_name}:{' '}
                            {Math.round(alert.percentage)}
                            {t('% do limite mensal')}
                        </Text>
                    ))}
                </Card>
            ) : null}
        </Page>
    );
}

function MetricCard({
    label,
    value,
    kind,
    loading,
}: {
    label: string;
    value?: string;
    kind: 'income' | 'expense';
    loading: boolean;
}) {
    const { colors, styles } = useThemeStyles(createStyles);
    return (
        <Card style={styles.metricCard}>
            <AppIcon
                name={kind === 'income' ? 'arrow-down' : 'arrow-up'}
                color={kind === 'income' ? colors.income : colors.expense}
                size={21}
            />
            <Text style={styles.metricLabel}>{label}</Text>
            <Text
                style={[
                    styles.metricValue,
                    kind === 'income' ? styles.income : styles.expense,
                ]}
            >
                {loading || value === undefined ? '—' : formatCurrency(value)}
            </Text>
        </Card>
    );
}

function QuickAction({
    icon,
    label,
    onPress,
}: {
    icon: IconName;
    label: string;
    onPress: () => void;
}) {
    const { colors, styles } = useThemeStyles(createStyles);
    return (
        <Pressable
            accessibilityRole="button"
            onPress={onPress}
            style={({ pressed }) => [
                styles.quickAction,
                pressed && { opacity: 0.7 },
            ]}
        >
            <View style={styles.quickIcon}>
                <AppIcon name={icon} color={colors.primary} size={23} />
            </View>
            <Text style={styles.quickLabel}>{label}</Text>
        </Pressable>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            paddingVertical: 6,
        },
        headerCopy: { flex: 1, gap: 5 },
        eyebrow: { fontFamily: 'DMSans', color: colors.muted, fontSize: 13 },
        greeting: {
            fontFamily: 'SpaceGrotesk',
            color: colors.text,
            fontSize: 27,
            fontWeight: '700',
            letterSpacing: -0.7,
        },
        demoBanner: {
            alignItems: 'center',
            backgroundColor: colors.primarySoft,
            borderRadius: 12,
            padding: 11,
        },
        demoBannerText: {
            fontFamily: 'DMSans',
            color: colors.primary,
            fontSize: 12,
            fontWeight: '700',
        },
        balanceCard: {
            backgroundColor: colors.primarySoft,
            borderColor: colors.primarySoft,
            gap: 18,
            padding: 24,
        },
        balanceHeading: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        balanceFooter: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
            justifyContent: 'space-between',
        },
        metricLabel: {
            fontFamily: 'DMSans',
            color: colors.muted,
            fontSize: 12,
            fontWeight: '600',
        },
        balance: {
            fontFamily: 'SpaceGrotesk',
            color: colors.text,
            fontSize: 40,
            fontWeight: '700',
            letterSpacing: -1.5,
        },
        balanceCaption: {
            fontFamily: 'DMSans',
            color: colors.muted,
            fontSize: 11,
        },
        month: {
            fontFamily: 'DMSans',
            color: colors.primary,
            fontSize: 11,
            fontWeight: '700',
            textTransform: 'capitalize',
        },
        metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
        metricCard: { flex: 1, minWidth: 120, padding: 16, gap: 10 },
        metricValue: {
            fontFamily: 'SpaceGrotesk',
            fontSize: 18,
            fontWeight: '700',
        },
        income: { color: colors.income },
        expense: { color: colors.expense },
        quickActions: { flexDirection: 'row', gap: 10 },
        quickAction: {
            flex: 1,
            alignItems: 'center',
            gap: 9,
            paddingVertical: 6,
            minHeight: 82,
        },
        quickIcon: {
            width: 50,
            height: 50,
            borderRadius: 18,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.border,
        },
        quickLabel: {
            fontFamily: 'DMSans',
            color: colors.text,
            fontSize: 12,
            textAlign: 'center',
        },
        categoryItem: { gap: 10, paddingVertical: 4 },
        listRow: {
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 12,
        },
        transactionRow: {
            alignItems: 'center',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
            paddingVertical: 10,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
        transactionIcon: {
            width: 36,
            height: 36,
            borderRadius: 13,
            alignItems: 'center',
            justifyContent: 'center',
        },
        transactionDescription: { flex: 1, minWidth: 90, gap: 4 },
        rowTitle: {
            fontFamily: 'DMSans',
            color: colors.text,
            fontSize: 14,
            fontWeight: '600',
            flexShrink: 1,
        },
        rowMeta: {
            fontFamily: 'DMSans',
            color: colors.muted,
            fontSize: 11,
            lineHeight: 17,
        },
        rowAmount: {
            fontFamily: 'DMSans',
            color: colors.text,
            fontSize: 13,
            fontWeight: '700',
            flexShrink: 1,
        },
        warningCard: {
            backgroundColor: colors.warningSoft,
            borderColor: colors.border,
        },
        warningText: {
            fontFamily: 'DMSans',
            color: colors.warning,
            fontSize: 13,
        },
        error: {
            fontFamily: 'DMSans',
            color: colors.text,
            fontSize: 13,
            lineHeight: 19,
        },
    });
