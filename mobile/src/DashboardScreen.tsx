import { useCallback, useState } from 'react';
import {
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useThemeStyles } from './PreferencesContext';
import { ApiError, sessionRequest } from './api';
import { AppIcon } from './icons';
import {
    ActionButton,
    IconButton,
    Page,
    ProgressBar,
    SectionTitle,
} from './components';
import {
    EmptyFinance,
    FinanceError,
    FinanceHeader,
    InlineAction,
    MonthPicker,
    MonthlyFlowChart,
    UpcomingList,
    FinanceCard as Card,
} from './finance-components';
import { currentMonth, formatCurrency, formatDate } from './format';
import { t } from './i18n';
import type { ThemeColors } from './theme';
import type { Budget, Dashboard, Session } from './types';

export default function DashboardScreen({ session }: { session: Session }) {
    const { colors, styles } = useThemeStyles(createStyles);
    const [month, setMonth] = useState(currentMonth());
    const [data, setData] = useState<Dashboard | null>(null);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [hidden, setHidden] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const fetchData = useCallback(async () => {
        const [dashboardResponse, budgetResponse] = await Promise.all([
            sessionRequest<{ data: Dashboard }>(
                session,
                `/dashboard?month=${month}`,
            ),
            sessionRequest<{ data: Budget[] }>(
                session,
                `/budgets?month=${month}`,
            ),
        ]);
        return {
            dashboard: dashboardResponse.data,
            budgets: budgetResponse.data,
        };
    }, [session, month]);
    useFocusEffect(
        useCallback(() => {
            let active = true;
            setLoading(true);
            setData(null);
            setBudgets([]);
            setError('');
            void fetchData()
                .then((result) => {
                    if (active) {
                        setData(result.dashboard);
                        setBudgets(result.budgets);
                    }
                })
                .catch((reason) => {
                    if (active)
                        setError(
                            reason instanceof ApiError
                                ? reason.message
                                : t('Não foi possível carregar o resumo.'),
                        );
                })
                .finally(() => {
                    if (active) setLoading(false);
                });
            return () => {
                active = false;
            };
        }, [fetchData]),
    );
    async function refresh() {
        setRefreshing(true);
        setError('');
        try {
            const result = await fetchData();
            setData(result.dashboard);
            setBudgets(result.budgets);
        } catch (reason) {
            setError(
                reason instanceof ApiError
                    ? reason.message
                    : t('Não foi possível carregar o resumo.'),
            );
        } finally {
            setRefreshing(false);
        }
    }
    const value = (amount: string | number | undefined) =>
        hidden
            ? '••••'
            : loading || amount === undefined
              ? '—'
              : formatCurrency(amount);
    return (
        <Page
            contentStyle={styles.page}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => void refresh()}
                    tintColor={colors.primary}
                />
            }
        >
            <FinanceHeader
                title={t('Olá, {name}', {
                    name: session.user.name.split(' ')[0],
                })}
                subtitle={t('Um olhar claro para o seu dinheiro.')}
                name={session.user.name}
                eyebrow={t('Seu resumo financeiro')}
                action={
                    <IconButton
                        variant="ghost"
                        icon={hidden ? 'eye-off' : 'eye'}
                        label={t(
                            hidden ? 'Mostrar valores' : 'Ocultar valores',
                        )}
                        onPress={() => setHidden((current) => !current)}
                    />
                }
            />
            {session.isDemo && (
                <Text style={styles.caption}>
                    {t('Modo demonstração · somente leitura')}
                </Text>
            )}
            <View style={styles.toolbar}>
                <MonthPicker month={month} onChange={setMonth} />
                <InlineAction
                    label={t('Novo lançamento')}
                    disabled={session.isDemo}
                    onPress={() =>
                        router.navigate({
                            pathname: '/transactions',
                            params: { create: '1' },
                        })
                    }
                />
            </View>
            <FinanceError message={error} />
            {error && (
                <ActionButton
                    variant="secondary"
                    compact
                    onPress={() => void refresh()}
                >
                    {t('Tentar novamente')}
                </ActionButton>
            )}
            <Card style={styles.balance}>
                <View style={styles.row}>
                    <Text style={styles.caption}>{t('Saldo geral')}</Text>
                    <AppIcon name="wallet" size={21} color={colors.primary} />
                </View>
                <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    style={styles.balanceValue}
                >
                    {value(data?.summary.overallBalance)}
                </Text>
                <View style={styles.row}>
                    <Text style={styles.caption}>{t('Todos os períodos')}</Text>
                    <View>
                        <Text style={[styles.caption, styles.right]}>
                            {t('Saldo do mês')}
                        </Text>
                        <Text style={styles.monthBalance}>
                            {value(data?.summary.monthlyBalance)}
                        </Text>
                    </View>
                </View>
            </Card>
            <View style={styles.metrics}>
                {(
                    [
                        [
                            'income',
                            'Receitas no mês',
                            data?.summary.monthlyIncome,
                        ],
                        [
                            'expense',
                            'Despesas no mês',
                            data?.summary.monthlyExpense,
                        ],
                    ] as const
                ).map(([kind, label, amount]) => (
                    <Card key={kind} style={styles.metric}>
                        <View style={styles.metricLabel}>
                            <AppIcon
                                name={
                                    kind === 'income'
                                        ? 'arrow-down'
                                        : 'arrow-up'
                                }
                                size={17}
                                color={
                                    kind === 'income'
                                        ? colors.income
                                        : colors.expense
                                }
                            />
                            <Text style={styles.caption}>{t(label)}</Text>
                        </View>
                        <Text
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            style={[
                                styles.metricValue,
                                {
                                    color:
                                        kind === 'income'
                                            ? colors.income
                                            : colors.expense,
                                },
                            ]}
                        >
                            {value(amount)}
                        </Text>
                        <Text style={styles.small}>
                            {t('No período selecionado')}
                        </Text>
                    </Card>
                ))}
            </View>
            <Card>
                <SectionTitle title={t('Seu dinheiro ao longo do tempo')} />
                {loading ? (
                    <Text style={styles.caption}>
                        {t('Carregando resumo…')}
                    </Text>
                ) : data?.hasTransactionsInChartRange ? (
                    <MonthlyFlowChart
                        data={data.monthlyTrend}
                        hidden={hidden}
                    />
                ) : (
                    <EmptyFinance>
                        {t('Não há lançamentos neste período.')}
                    </EmptyFinance>
                )}
            </Card>
            <Card>
                <SectionTitle
                    title={t('Próximos lançamentos')}
                    action={
                        <Pressable
                            accessibilityRole="button"
                            onPress={() => router.navigate('/budgets')}
                        >
                            <Text style={styles.link}>{t('Ver todos')}</Text>
                        </Pressable>
                    }
                />
                <Text style={styles.small}>
                    {t(
                        'Próxima ocorrência de cada recorrência. Valores previstos, fora do saldo realizado.',
                    )}
                </Text>
                <UpcomingList
                    items={(data?.upcomingTransactions ?? []).slice(0, 3)}
                    hidden={hidden}
                />
            </Card>
            <Card>
                <SectionTitle
                    title={t('Limites de gastos')}
                    action={
                        <Pressable
                            accessibilityRole="button"
                            onPress={() => router.navigate('/budgets')}
                        >
                            <Text style={styles.link}>{t('Planejar')}</Text>
                        </Pressable>
                    }
                />
                {budgets.length ? (
                    budgets.slice(0, 3).map((budget) => (
                        <View key={budget.id} style={styles.budgetRow}>
                            <View style={styles.row}>
                                <Text style={styles.rowTitle}>
                                    {budget.category_name}
                                </Text>
                                <Text
                                    style={[
                                        styles.caption,
                                        {
                                            color:
                                                budget.status === 'ok'
                                                    ? colors.muted
                                                    : colors.warning,
                                        },
                                    ]}
                                >
                                    {Math.round(budget.percentage)}%
                                </Text>
                            </View>
                            <ProgressBar
                                value={budget.percentage}
                                label={budget.category_name}
                                color={
                                    budget.status === 'ok'
                                        ? colors.primary
                                        : colors.warning
                                }
                            />
                            <View style={styles.row}>
                                <Text style={styles.small}>
                                    {t('Gasto')}: {value(budget.spent)}
                                </Text>
                                <Text style={styles.small}>
                                    {t('Limite')}: {value(budget.amount)}
                                </Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <EmptyFinance>
                        {t('Nenhuma meta cadastrada para este mês.')}
                    </EmptyFinance>
                )}
            </Card>
            <Card>
                <SectionTitle
                    title={t('Últimos lançamentos')}
                    action={
                        <Pressable
                            accessibilityRole="button"
                            onPress={() => router.navigate('/transactions')}
                        >
                            <Text style={styles.link}>{t('Ver todos')}</Text>
                        </Pressable>
                    }
                />
                {data?.recentTransactions.length ? (
                    data.recentTransactions.map((transaction) => (
                        <View style={styles.transaction} key={transaction.id}>
                            <View style={styles.transactionCopy}>
                                <Text style={styles.rowTitle}>
                                    {transaction.description}
                                </Text>
                                <Text style={styles.small}>
                                    {transaction.category} ·{' '}
                                    {formatDate(transaction.date)}
                                </Text>
                            </View>
                            <Text
                                style={[
                                    styles.rowAmount,
                                    {
                                        color:
                                            transaction.type === 'income'
                                                ? colors.income
                                                : colors.expense,
                                    },
                                ]}
                            >
                                {hidden
                                    ? '••••'
                                    : `${transaction.type === 'income' ? '+' : '−'} ${formatCurrency(transaction.amount)}`}
                            </Text>
                        </View>
                    ))
                ) : (
                    <EmptyFinance>
                        {t('Não há lançamentos neste período.')}
                    </EmptyFinance>
                )}
            </Card>
        </Page>
    );
}
const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        page: { padding: 18, gap: 16 },
        toolbar: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            flexWrap: 'wrap',
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
        },
        caption: { fontFamily: 'DMSans', fontSize: 11, color: colors.muted },
        right: { textAlign: 'right' },
        small: {
            fontFamily: 'DMSans',
            fontSize: 10,
            lineHeight: 16,
            color: colors.muted,
        },
        balance: {
            backgroundColor: colors.primarySoft,
            padding: 18,
            gap: 8,
            borderRadius: 14,
        },
        balanceValue: {
            fontFamily: 'SpaceGrotesk',
            fontSize: 33,
            fontWeight: '700',
            letterSpacing: -1,
            color: colors.text,
        },
        monthBalance: {
            fontFamily: 'SpaceGrotesk',
            fontSize: 13,
            color: colors.text,
            textAlign: 'right',
            fontWeight: '600',
        },
        metrics: { flexDirection: 'row', gap: 10 },
        metric: { flex: 1, padding: 14, gap: 8, borderRadius: 14 },
        metricLabel: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            flexWrap: 'wrap',
        },
        metricValue: {
            fontFamily: 'SpaceGrotesk',
            fontSize: 22,
            fontWeight: '600',
            letterSpacing: -0.6,
        },
        link: {
            fontFamily: 'DMSans',
            fontSize: 11,
            fontWeight: '600',
            color: colors.primary,
        },
        budgetRow: { gap: 10, paddingVertical: 12 },
        rowTitle: {
            fontFamily: 'DMSans',
            fontSize: 13,
            fontWeight: '600',
            color: colors.text,
        },
        transaction: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingVertical: 13,
            borderTopColor: colors.border,
            borderTopWidth: 1,
        },
        transactionCopy: { flex: 1, gap: 3 },
        rowAmount: {
            fontFamily: 'SpaceGrotesk',
            fontSize: 13,
            fontWeight: '600',
        },
    });
