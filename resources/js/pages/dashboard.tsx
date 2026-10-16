import { Form, Head, Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TransactionController from '@/actions/App/Http/Controllers/TransactionController';
import { DashboardCharts } from '@/components/dashboard-charts';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';
import type {
    DashboardExpenseCategory,
    DashboardMonthNavigation,
    DashboardMonthlyTotal,
    DashboardRecentTransaction,
    DashboardSummary,
} from '@/types/dashboard';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

type DashboardProps = {
    filters: {
        month: string;
    };
    monthNavigation: DashboardMonthNavigation;
    summary: DashboardSummary;
    expensesByCategory: DashboardExpenseCategory[];
    monthlyTrend: DashboardMonthlyTotal[];
    recentTransactions: DashboardRecentTransaction[];
    hasTransactionsInMonth: boolean;
    hasTransactionsInChartRange: boolean;
};

export default function Dashboard({
    filters,
    monthNavigation,
    summary,
    expensesByCategory,
    monthlyTrend,
    recentTransactions,
    hasTransactionsInMonth,
    hasTransactionsInChartRange,
}: DashboardProps) {
    const summaryCards = [
        {
            title: 'Saldo geral',
            value: summary.overallBalance,
            description: 'Receitas menos despesas desde o início.',
            valueClassName: '',
        },
        {
            title: 'Receitas do mês',
            value: summary.monthlyIncome,
            description: monthNavigation.label,
            valueClassName: 'text-green-700 dark:text-green-400',
        },
        {
            title: 'Despesas do mês',
            value: summary.monthlyExpense,
            description: monthNavigation.label,
            valueClassName: 'text-red-700 dark:text-red-400',
        },
        {
            title: 'Saldo do mês',
            value: summary.monthlyBalance,
            description: 'Receitas menos despesas no período.',
            valueClassName: '',
        },
    ];

    return (
        <>
            <Head title="Dashboard" />

            <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Dashboard
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Uma visão geral das suas finanças.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" asChild>
                            <Link
                                href={dashboard({
                                    query: { month: monthNavigation.previous },
                                })}
                                aria-label="Ir para o mês anterior"
                            >
                                <ChevronLeft />
                            </Link>
                        </Button>
                        <Form
                            {...dashboard.form()}
                            options={{ preserveScroll: true }}
                            className="flex items-end gap-2"
                        >
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="dashboard-month"
                                    className="sr-only"
                                >
                                    Mês e ano
                                </Label>
                                <Input
                                    id="dashboard-month"
                                    name="month"
                                    type="month"
                                    defaultValue={filters.month}
                                    required
                                    className="w-40"
                                />
                            </div>
                            <Button type="submit">Ver mês</Button>
                        </Form>
                        <Button variant="outline" size="icon" asChild>
                            <Link
                                href={dashboard({
                                    query: { month: monthNavigation.next },
                                })}
                                aria-label="Ir para o próximo mês"
                            >
                                <ChevronRight />
                            </Link>
                        </Button>
                    </div>
                </header>

                {!hasTransactionsInMonth && (
                    <Card className="rounded-2xl shadow-sm">
                        <CardContent className="flex flex-col items-start justify-between gap-4 py-5 sm:flex-row sm:items-center">
                            <div className="space-y-1">
                                <p className="font-medium">
                                    Ainda não há lançamentos em{' '}
                                    {monthNavigation.label}.
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Adicione receitas e despesas para acompanhar
                                    este período.
                                </p>
                            </div>
                            <Button asChild>
                                <Link href={TransactionController.create()}>
                                    Adicionar lançamento
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                <section
                    aria-label="Resumo financeiro"
                    className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
                >
                    {summaryCards.map((summaryCard) => (
                        <Card
                            key={summaryCard.title}
                            className="rounded-2xl shadow-sm"
                        >
                            <CardHeader className="gap-2">
                                <CardDescription>
                                    {summaryCard.title}
                                </CardDescription>
                                <CardTitle
                                    className={`text-2xl tabular-nums ${summaryCard.valueClassName}`}
                                >
                                    {currencyFormatter.format(
                                        Number(summaryCard.value),
                                    )}
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    {summaryCard.description}
                                </p>
                            </CardHeader>
                        </Card>
                    ))}
                </section>

                <DashboardCharts
                    expensesByCategory={expensesByCategory}
                    monthlyTrend={monthlyTrend}
                    hasTransactionsInChartRange={hasTransactionsInChartRange}
                />

                <Card className="rounded-2xl shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between gap-4">
                        <div className="space-y-1">
                            <CardTitle>Lançamentos recentes</CardTitle>
                            <CardDescription>
                                Seus cinco lançamentos mais recentes.
                            </CardDescription>
                        </div>
                        <Button
                            variant="link"
                            asChild
                            className="shrink-0 px-0"
                        >
                            <Link
                                href={TransactionController.index({
                                    query: { month: filters.month },
                                })}
                            >
                                Ver todos
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {recentTransactions.length > 0 ? (
                            <ul className="divide-y divide-border/60">
                                {recentTransactions.map((transaction) => (
                                    <li
                                        key={transaction.id}
                                        className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="min-w-0 space-y-1">
                                            <p className="truncate font-medium">
                                                {transaction.description}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {transaction.category} ·{' '}
                                                {transaction.formattedDate}
                                            </p>
                                        </div>
                                        <p
                                            className={`shrink-0 font-medium tabular-nums ${transaction.type === 'income' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}
                                        >
                                            {transaction.type === 'income'
                                                ? '+ '
                                                : '− '}
                                            {currencyFormatter.format(
                                                Number(transaction.amount),
                                            )}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="py-4 text-sm text-muted-foreground">
                                Você ainda não tem lançamentos. Adicione o
                                primeiro para começar.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </main>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
