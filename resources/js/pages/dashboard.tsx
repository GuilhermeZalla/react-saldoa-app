import { useState } from 'react';
import { GettingStarted } from '@/components/getting-started';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowDownLeft,
    ArrowUpRight,
    Eye,
    EyeOff,
    Plus,
    Wallet,
} from 'lucide-react';
import TransactionController from '@/actions/App/Http/Controllers/TransactionController';
import { DashboardCharts } from '@/components/dashboard-charts';
import {
    FinanceHeader,
    FinancePeriod,
    UpcomingTransactions,
} from '@/components/finance-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';
import budgets from '@/routes/budgets';
import type {
    BudgetAlert,
    DashboardExpenseCategory,
    DashboardMonthNavigation,
    DashboardMonthlyTotal,
    DashboardRecentTransaction,
    DashboardSummary,
    UpcomingTransaction,
} from '@/types/dashboard';

type DashboardProps = {
    filters: { month: string };
    monthNavigation: DashboardMonthNavigation;
    summary: DashboardSummary;
    expensesByCategory: DashboardExpenseCategory[];
    monthlyTrend: DashboardMonthlyTotal[];
    recentTransactions: DashboardRecentTransaction[];
    hasTransactionsInMonth: boolean;
    hasTransactionsInChartRange: boolean;
    budgetAlerts: BudgetAlert[];
    hasBudgets: boolean;
    upcomingTransactions?: UpcomingTransaction[];
};
const currency = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});
export default function Dashboard({
    filters,
    monthNavigation,
    summary,
    expensesByCategory,
    monthlyTrend,
    recentTransactions,
    hasTransactionsInChartRange,
    budgetAlerts,
    hasBudgets,
    hasTransactionsInMonth,
    upcomingTransactions = [],
}: DashboardProps) {
    const { auth } = usePage().props;
    const [hidden, setHidden] = useState(false);
    const value = (amount: string) =>
        hidden ? '••••' : currency.format(Number(amount));
    const cards = [
        {
            label: 'Saldo geral',
            amount: summary.overallBalance,
            description:
                'Receitas menos despesas de todos os períodos, sem previsões da agenda.',
            kind: 'balance',
            comparison: null,
        },
        {
            label: 'Receitas do mês',
            amount: summary.monthlyIncome,
            description: monthNavigation.label,
            kind: 'income',
            comparison: summary.monthlyComparison.income,
        },
        {
            label: 'Despesas do mês',
            amount: summary.monthlyExpense,
            description: monthNavigation.label,
            kind: 'expense',
            comparison: summary.monthlyComparison.expense,
        },
        {
            label: 'Saldo do mês',
            amount: summary.monthlyBalance,
            description: 'Resultado do período selecionado',
            kind: 'monthly',
            comparison: summary.monthlyComparison.balance,
        },
    ];
    const chartProps = {
        expensesByCategory,
        selectedMonth: filters.month,
        selectedMonthLabel: monthNavigation.label,
        monthlyTrend,
        hasTransactionsInChartRange,
    };
    return (
        <>
            <Head title="Dashboard" />
            <main className="finance-page">
                <FinanceHeader
                    eyebrow="Seu resumo financeiro"
                    title={`Olá, ${auth.user.name.split(' ')[0]}`}
                    subtitle="Um olhar claro para o seu dinheiro."
                >
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setHidden((current) => !current)}
                        aria-label={
                            hidden ? 'Mostrar valores' : 'Ocultar valores'
                        }
                    >
                        {hidden ? <EyeOff /> : <Eye />}
                    </Button>
                    <FinancePeriod
                        month={filters.month}
                        onChange={(month) =>
                            router.get(
                                dashboard().url,
                                { month },
                                { preserveState: true, preserveScroll: true },
                            )
                        }
                    />
                    <Button asChild>
                        <Link
                            href={TransactionController.create({
                                query: { month: filters.month },
                            })}
                        >
                            <Plus className="size-4" />
                            Novo lançamento
                        </Link>
                    </Button>
                </FinanceHeader>
                <GettingStarted
                    empty={
                        !hasTransactionsInMonth && !hasTransactionsInChartRange
                    }
                />
                <section
                    className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                    aria-label="Resumo financeiro"
                >
                    {cards.map((card) => (
                        <Card
                            key={card.label}
                            className={`finance-surface gap-2 py-5 ${card.kind === 'balance' ? 'border-primary/25 bg-primary/5' : ''}`}
                        >
                            <CardContent className="space-y-3 px-5">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    {card.kind === 'income' ? (
                                        <ArrowDownLeft className="size-4 text-income" />
                                    ) : card.kind === 'expense' ? (
                                        <ArrowUpRight className="size-4 text-expense-text" />
                                    ) : (
                                        <Wallet className="size-4 text-primary" />
                                    )}
                                    {card.label}
                                </div>
                                <p
                                    className={`money-value text-2xl font-semibold tracking-tight ${card.kind === 'income' ? 'text-income' : card.kind === 'expense' ? 'text-expense-text' : ''}`}
                                >
                                    {value(card.amount)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {card.description}
                                </p>
                                {!hidden &&
                                    card.comparison &&
                                    card.comparison.state !== 'none' && (
                                        <p className="text-xs text-muted-foreground">
                                            {card.comparison.state === 'new'
                                                ? 'Novo neste período'
                                                : card.comparison.state ===
                                                    'unchanged'
                                                  ? 'Sem alteração'
                                                  : `${card.comparison.sentiment === 'positive' ? 'Melhorou' : 'Piorou'} ${Math.abs(card.comparison.percentageChange ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`}{' '}
                                            vs. mês anterior
                                        </p>
                                    )}
                            </CardContent>
                        </Card>
                    ))}
                </section>
                <div className="grid items-start gap-5 md:grid-cols-2 xl:grid-cols-[1.45fr_1fr]">
                    <div className={hidden ? 'finance-chart-private' : ''}>
                        <DashboardCharts {...chartProps} mode="trend" />
                    </div>
                    <UpcomingTransactions
                        items={upcomingTransactions}
                        hidden={hidden}
                        compact
                    />
                </div>
                <div className="grid items-start gap-5 md:grid-cols-2 xl:grid-cols-[1.45fr_1fr]">
                    <Card className="finance-surface">
                        <CardHeader className="flex-row items-center justify-between gap-3">
                            <CardTitle>Limites de gastos</CardTitle>
                            <Link
                                href={budgets.index({
                                    query: { month: filters.month },
                                })}
                                className="text-xs font-medium text-primary"
                            >
                                Planejar
                            </Link>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {budgetAlerts.length ? (
                                budgetAlerts.map((alert) => (
                                    <Link
                                        key={alert.category_name}
                                        href={budgets.index({
                                            query: { month: filters.month },
                                        })}
                                        className="block space-y-2 rounded-xl border border-border p-4"
                                    >
                                        <div className="flex justify-between gap-3">
                                            <span className="text-sm font-medium">
                                                {alert.category_name}
                                            </span>
                                            <span className="text-xs font-semibold text-warning">
                                                {hidden
                                                    ? '••••'
                                                    : `${alert.percentage.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`}
                                            </span>
                                        </div>
                                        <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                                            <div
                                                className="h-full rounded-full bg-warning"
                                                style={{
                                                    width: `${Math.min(100, Math.max(0, alert.percentage))}%`,
                                                }}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {alert.status === 'exceeded'
                                                ? 'Limite ultrapassado'
                                                : 'Próximo do limite mensal'}
                                        </p>
                                    </Link>
                                ))
                            ) : (
                                <p className="py-6 text-sm text-muted-foreground">
                                    {hasBudgets
                                        ? 'Nenhum limite exige atenção neste mês.'
                                        : 'Defina limites por categoria para acompanhar seus gastos.'}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                    <Card className="finance-surface">
                        <CardHeader className="flex-row items-center justify-between gap-3">
                            <CardTitle>Últimos lançamentos</CardTitle>
                            <Link
                                href={TransactionController.index({
                                    query: { month: filters.month },
                                })}
                                className="text-xs font-medium text-primary"
                            >
                                Ver lançamentos
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {recentTransactions.length ? (
                                <div className="divide-y divide-border">
                                    {recentTransactions.map((transaction) => (
                                        <Link
                                            key={transaction.id}
                                            href={TransactionController.edit(
                                                transaction.id,
                                            )}
                                            className="flex items-center gap-3 py-3 first:pt-0"
                                        >
                                            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground">
                                                {transaction.type ===
                                                'income' ? (
                                                    <ArrowDownLeft className="size-4" />
                                                ) : (
                                                    <ArrowUpRight className="size-4" />
                                                )}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium break-words">
                                                    {transaction.description}
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {transaction.category} ·{' '}
                                                    {transaction.formattedDate}
                                                </p>
                                            </div>
                                            <span
                                                className={`money-value shrink-0 text-sm font-semibold ${transaction.type === 'income' ? 'text-income' : 'text-expense-text'}`}
                                            >
                                                {hidden
                                                    ? '••••'
                                                    : `${transaction.type === 'income' ? '+' : '−'} ${value(transaction.amount)}`}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="py-6 text-sm text-muted-foreground">
                                    Você ainda não tem lançamentos. Adicione o
                                    primeiro para começar.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <details className="rounded-2xl border border-border bg-card p-5">
                    <summary className="cursor-pointer text-sm font-medium">
                        Despesas por categoria
                    </summary>
                    <div className="mt-5">
                        {hidden ? (
                            <p className="text-sm text-muted-foreground">
                                Valores ocultos.
                            </p>
                        ) : (
                            <DashboardCharts
                                {...chartProps}
                                mode="categories"
                            />
                        )}
                    </div>
                </details>
            </main>
        </>
    );
}
Dashboard.layout = { breadcrumbs: [{ title: 'Dashboard', href: dashboard() }] };
