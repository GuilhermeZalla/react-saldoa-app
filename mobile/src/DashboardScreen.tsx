import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { ApiError, sessionRequest } from './api';
import {
    ActionButton,
    Card,
    Page,
    PageTitle,
    SectionTitle,
    commonStyles,
} from './components';
import { currentMonth, formatCurrency, formatDate } from './format';
import { colors } from './theme';
import type { Dashboard, Session } from './types';

type Props = { session: Session };

export default function DashboardScreen({ session }: Props) {
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
                    : 'Não foi possível carregar o resumo.',
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
                            : 'Não foi possível carregar o resumo.',
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
            <PageTitle
                title={`Olá, ${session.user.name.split(' ')[0]}`}
                subtitle={
                    dashboard?.monthNavigation.label ?? 'Seu resumo financeiro'
                }
            />

            {session.isDemo ? (
                <View style={styles.demoBanner}>
                    <Text style={styles.demoBannerText}>
                        Modo demonstração · somente leitura
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
                        Tentar novamente
                    </ActionButton>
                </Card>
            ) : null}

            <Card style={styles.balanceCard}>
                <Text style={styles.metricLabel}>Saldo total</Text>
                <Text style={styles.balance}>
                    {loading || !summary
                        ? '—'
                        : formatCurrency(summary.overallBalance)}
                </Text>
                <Text style={styles.balanceCaption}>
                    Saldo de todos os períodos
                </Text>
            </Card>

            <View style={styles.metricGrid}>
                <MetricCard
                    label="Receitas no mês"
                    value={summary?.monthlyIncome}
                    kind="income"
                    loading={loading}
                />
                <MetricCard
                    label="Despesas no mês"
                    value={summary?.monthlyExpense}
                    kind="expense"
                    loading={loading}
                />
            </View>

            <Card>
                <SectionTitle title="Despesas por categoria" />
                {dashboard?.expensesByCategory.length ? (
                    dashboard.expensesByCategory.slice(0, 5).map((category) => (
                        <View key={category.id} style={styles.listRow}>
                            <Text style={styles.rowTitle}>{category.name}</Text>
                            <Text style={styles.rowAmount}>
                                {formatCurrency(category.total)}
                            </Text>
                        </View>
                    ))
                ) : (
                    <Text style={commonStyles.muted}>
                        Ainda não há despesas neste mês.
                    </Text>
                )}
            </Card>

            <Card>
                <SectionTitle title="Movimentações recentes" />
                {dashboard?.recentTransactions.length ? (
                    dashboard.recentTransactions.map((transaction) => (
                        <View
                            key={transaction.id}
                            style={styles.transactionRow}
                        >
                            <View style={styles.transactionDescription}>
                                <Text style={styles.rowTitle} numberOfLines={1}>
                                    {transaction.description}
                                </Text>
                                <Text style={styles.rowMeta}>
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
                        Seus lançamentos aparecerão aqui.
                    </Text>
                )}
            </Card>

            {dashboard?.budgetAlerts.length ? (
                <Card style={styles.warningCard}>
                    <SectionTitle title="Atenção às metas" />
                    {dashboard.budgetAlerts.map((alert) => (
                        <Text
                            key={alert.category_name}
                            style={styles.warningText}
                        >
                            {alert.category_name}:{' '}
                            {Math.round(alert.percentage)}% do limite mensal
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
    return (
        <Card style={styles.metricCard}>
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

const styles = StyleSheet.create({
    demoBanner: {
        alignItems: 'center',
        backgroundColor: colors.primarySoft,
        borderRadius: 11,
        padding: 11,
    },
    demoBannerText: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: '700',
    },
    balanceCard: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    metricLabel: { color: colors.muted, fontSize: 12, fontWeight: '600' },
    balance: { color: colors.surface, fontSize: 31, fontWeight: '800' },
    balanceCaption: { color: '#E1E3FF', fontSize: 12 },
    metricGrid: { flexDirection: 'row', gap: 12 },
    metricCard: { flex: 1, minWidth: 0 },
    metricValue: { fontSize: 17, fontWeight: '700' },
    income: { color: colors.income },
    expense: { color: colors.expense },
    listRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 3,
    },
    transactionRow: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'space-between',
    },
    transactionDescription: { flex: 1, gap: 2 },
    rowTitle: { color: colors.text, fontSize: 13, fontWeight: '600' },
    rowMeta: { color: colors.muted, fontSize: 11 },
    rowAmount: { color: colors.text, fontSize: 12, fontWeight: '700' },
    warningCard: {
        backgroundColor: colors.warningSoft,
        borderColor: '#F3DFAF',
    },
    warningText: { color: colors.warning, fontSize: 13 },
    error: { color: colors.expense, fontSize: 13, lineHeight: 19 },
});
