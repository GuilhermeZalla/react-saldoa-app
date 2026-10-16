import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
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
    '#991b1b',
    '#b91c1c',
    '#dc2626',
    '#ef4444',
    '#f87171',
    '#7f1d1d',
    '#fecaca',
];

type DashboardChartsProps = {
    expensesByCategory: DashboardExpenseCategory[];
    monthlyTrend: DashboardMonthlyTotal[];
    hasTransactionsInChartRange: boolean;
};

export function DashboardCharts({
    expensesByCategory,
    monthlyTrend,
    hasTransactionsInChartRange,
}: DashboardChartsProps) {
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
                                                    />
                                                ),
                                            )}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) =>
                                                currencyFormatter.format(
                                                    Number(value ?? 0),
                                                )
                                            }
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                                {expensesByCategory.map((category, index) => (
                                    <li
                                        key={category.id}
                                        className="flex min-w-0 items-center justify-between gap-3 text-sm"
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
                                        <span className="shrink-0 font-medium text-red-700 dark:text-red-400">
                                            {currencyFormatter.format(
                                                Number(category.total),
                                            )}
                                        </span>
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
                                    <span className="size-2.5 rounded-full bg-green-600" />
                                    Receitas
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="size-2.5 rounded-full bg-red-600" />
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
                                            fill="#16a34a"
                                            radius={[4, 4, 0, 0]}
                                        />
                                        <Bar
                                            dataKey="expense"
                                            name="Despesas"
                                            fill="#dc2626"
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
