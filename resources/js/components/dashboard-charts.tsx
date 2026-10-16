import { Link, router } from '@inertiajs/react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Sector,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import TransactionController from '@/actions/App/Http/Controllers/TransactionController';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type {
    DashboardExpenseCategory,
    DashboardMonthlyTotal,
} from '@/types/dashboard';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

const expenseColors = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
    'var(--chart-6)',
];

type DashboardChartsProps = {
    expensesByCategory: DashboardExpenseCategory[];
    selectedMonth: string;
    selectedMonthLabel: string;
    monthlyTrend: DashboardMonthlyTotal[];
    hasTransactionsInChartRange: boolean;
};

export function DashboardCharts({
    expensesByCategory,
    selectedMonth,
    selectedMonthLabel,
    monthlyTrend,
    hasTransactionsInChartRange,
}: DashboardChartsProps) {
    const transactionListUrl = (categoryId: number) =>
        TransactionController.index({
            query: {
                month: selectedMonth,
                type: 'expense',
                category_id: String(categoryId),
            },
        }).url;

    return (
        <section className="grid gap-6 lg:grid-cols-2">
            <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                    <CardTitle>Despesas por categoria</CardTitle>
                    <CardDescription>
                        Como as despesas se dividiram no mês selecionado.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {expensesByCategory.length > 0 ? (
                        <>
                            <div className="h-64 min-w-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={expensesByCategory}
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius="56%"
                                            outerRadius="82%"
                                            paddingAngle={2}
                                            stroke="none"
                                            activeShape={(shapeProps) => (
                                                <Sector
                                                    {...shapeProps}
                                                    outerRadius={
                                                        (shapeProps.outerRadius ??
                                                            0) + 6
                                                    }
                                                />
                                            )}
                                            onClick={(_, index) => {
                                                const category =
                                                    expensesByCategory[index];

                                                if (category) {
                                                    router.visit(
                                                        transactionListUrl(
                                                            category.id,
                                                        ),
                                                    );
                                                }
                                            }}
                                        >
                                            {expensesByCategory.map(
                                                (category, index) => (
                                                    <Cell
                                                        key={category.id}
                                                        fill={
                                                            expenseColors[
                                                                index %
                                                                    expenseColors.length
                                                            ]
                                                        }
                                                        className="cursor-pointer"
                                                    />
                                                ),
                                            )}
                                        </Pie>
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (
                                                    !active ||
                                                    !payload?.length
                                                ) {
                                                    return null;
                                                }

                                                const category = payload[0]
                                                    .payload as DashboardExpenseCategory;

                                                return (
                                                    <div className="space-y-1 rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-md">
                                                        <p className="text-sm font-medium">
                                                            {category.name}
                                                        </p>
                                                        <p className="text-sm text-expense-text tabular-nums">
                                                            {currencyFormatter.format(
                                                                Number(
                                                                    category.total,
                                                                ),
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Clique para ver os
                                                            lançamentos
                                                        </p>
                                                    </div>
                                                );
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                                {expensesByCategory.map((category, index) => (
                                    <li key={category.id} className="min-w-0">
                                        <Link
                                            href={transactionListUrl(
                                                category.id,
                                            )}
                                            aria-label={`Ver lançamentos de ${category.name} em ${selectedMonthLabel}`}
                                            className="group flex min-w-0 items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm transition-colors duration-200 hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                                        >
                                            <span className="flex min-w-0 items-center gap-2">
                                                <span
                                                    aria-hidden="true"
                                                    className="size-2.5 shrink-0 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            expenseColors[
                                                                index %
                                                                    expenseColors.length
                                                            ],
                                                    }}
                                                />
                                                <span className="truncate">
                                                    {category.name}
                                                </span>
                                            </span>
                                            <span className="shrink-0 font-medium text-expense-text">
                                                {currencyFormatter.format(
                                                    Number(category.total),
                                                )}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <div className="flex h-64 items-center justify-center rounded-xl bg-muted/30 px-6 text-center text-sm text-muted-foreground">
                            Não há despesas por categoria neste mês.
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                    <CardTitle>Receitas e despesas</CardTitle>
                    <CardDescription>
                        Comparativo dos últimos seis meses.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {hasTransactionsInChartRange ? (
                        <>
                            <div className="mb-3 flex flex-wrap justify-end gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-2">
                                    <span className="size-2.5 rounded-full bg-income" />
                                    Receitas
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="size-2.5 rounded-full bg-expense" />
                                    Despesas
                                </span>
                            </div>
                            <div className="h-72 min-w-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={monthlyTrend}
                                        margin={{
                                            top: 8,
                                            right: 4,
                                            bottom: 0,
                                            left: 4,
                                        }}
                                    >
                                        <CartesianGrid
                                            vertical={false}
                                            stroke="var(--border)"
                                            strokeDasharray="3 3"
                                        />
                                        <XAxis
                                            dataKey="label"
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{
                                                fill: 'var(--muted-foreground)',
                                                fontSize: 12,
                                            }}
                                        />
                                        <YAxis
                                            width={80}
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{
                                                fill: 'var(--muted-foreground)',
                                                fontSize: 11,
                                            }}
                                            tickFormatter={(value) =>
                                                currencyFormatter.format(
                                                    Number(value),
                                                )
                                            }
                                        />
                                        <Tooltip
                                            formatter={(value) =>
                                                currencyFormatter.format(
                                                    Number(value ?? 0),
                                                )
                                            }
                                        />
                                        <Bar
                                            dataKey="income"
                                            name="Receitas"
                                            fill="var(--income)"
                                            radius={[4, 4, 0, 0]}
                                        />
                                        <Bar
                                            dataKey="expense"
                                            name="Despesas"
                                            fill="var(--expense)"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </>
                    ) : (
                        <div className="flex h-72 items-center justify-center rounded-xl bg-muted/30 px-6 text-center text-sm text-muted-foreground">
                            Ainda não há lançamentos nos últimos seis meses.
                        </div>
                    )}
                </CardContent>
            </Card>
        </section>
    );
}
