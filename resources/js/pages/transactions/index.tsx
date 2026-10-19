import { Form, Head, Link } from '@inertiajs/react';
import TransactionController from '@/actions/App/Http/Controllers/TransactionController';
import { TransactionFiltersPanel } from '@/components/transaction-filters';
import { TransactionSummary } from '@/components/transaction-summary';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import transactionsRoute from '@/routes/transactions';
import type {
    PaginatedTransactions,
    TransactionCategoryOption,
    TransactionFilters,
    TransactionMonthNavigation,
    TransactionSummary as TransactionSummaryValues,
    TransactionType,
} from '@/types/transaction';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

const transactionTypeLabels: Record<TransactionType, string> = {
    income: 'Receita',
    expense: 'Despesa',
};

type TransactionsIndexProps = {
    categories: TransactionCategoryOption[];
    filters: TransactionFilters;
    monthNavigation: TransactionMonthNavigation;
    summary: TransactionSummaryValues;
    transactions: PaginatedTransactions;
};

function getPaginationLabel(label: string): string {
    if (label.includes('Previous')) {
        return 'Anterior';
    }

    if (label.includes('Next')) {
        return 'Próxima';
    }

    return label.replace('&laquo;', '‹').replace('&raquo;', '›');
}

export default function TransactionsIndex({
    categories,
    filters,
    monthNavigation,
    summary,
    transactions,
}: TransactionsIndexProps) {
    const hasTransactions = transactions.data.length > 0;

    return (
        <>
            <Head title="Lançamentos" />

            <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Lançamentos
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Acompanhe suas receitas e despesas.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Button variant="outline" asChild>
                            <a
                                href={TransactionController.export.url({
                                    query: filters,
                                })}
                            >
                                Exportar CSV
                            </a>
                        </Button>
                        <Button asChild>
                            <Link href={TransactionController.create()}>
                                Novo lançamento
                            </Link>
                        </Button>
                    </div>
                </header>

                <TransactionFiltersPanel
                    categories={categories}
                    filters={filters}
                    monthNavigation={monthNavigation}
                />

                <TransactionSummary month={filters.month} summary={summary} />

                <Card className="overflow-hidden rounded-2xl shadow-sm">
                    {hasTransactions ? (
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/60 xl:hidden">
                                {transactions.data.map((transaction) => (
                                    <article
                                        key={transaction.id}
                                        className="p-4"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0 space-y-1">
                                                <p className="font-medium break-words">
                                                    {transaction.description}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {transaction.category.name}
                                                </p>
                                            </div>
                                            <p
                                                className={`shrink-0 text-right font-medium whitespace-nowrap ${transaction.type === 'income' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}
                                            >
                                                {currencyFormatter.format(
                                                    Number(transaction.amount),
                                                )}
                                            </p>
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-x-2 text-sm text-muted-foreground">
                                            <span>
                                                {transaction.formattedDate}
                                            </span>
                                            <span aria-hidden="true">·</span>
                                            <span>
                                                {
                                                    transactionTypeLabels[
                                                        transaction.type
                                                    ]
                                                }
                                            </span>
                                        </div>
                                        <div className="mt-4 flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                asChild
                                            >
                                                <Link
                                                    href={TransactionController.edit(
                                                        transaction.id,
                                                        { query: filters },
                                                    )}
                                                >
                                                    Editar
                                                </Link>
                                            </Button>
                                            <Form
                                                className="flex-1"
                                                {...TransactionController.destroy.form(
                                                    transaction.id,
                                                    { query: filters },
                                                )}
                                                onBefore={() =>
                                                    window.confirm(
                                                        `Deseja excluir o lançamento “${transaction.description}”?`,
                                                    )
                                                }
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-full"
                                                    type="submit"
                                                >
                                                    Excluir
                                                </Button>
                                            </Form>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            <div className="hidden overflow-x-auto xl:block">
                                <table className="w-full min-w-[52rem] text-left text-sm">
                                    <thead className="bg-muted/40 text-muted-foreground">
                                        <tr>
                                            <th className="px-6 py-3 font-medium">
                                                Descrição
                                            </th>
                                            <th className="px-6 py-3 font-medium">
                                                Categoria
                                            </th>
                                            <th className="px-6 py-3 font-medium">
                                                Tipo
                                            </th>
                                            <th className="px-6 py-3 font-medium">
                                                Data
                                            </th>
                                            <th className="px-6 py-3 text-right font-medium">
                                                Valor
                                            </th>
                                            <th className="px-6 py-3 text-right font-medium">
                                                Ações
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.data.map(
                                            (transaction) => (
                                                <tr
                                                    key={transaction.id}
                                                    className="border-t border-border/60"
                                                >
                                                    <td className="px-6 py-4 font-medium">
                                                        {
                                                            transaction.description
                                                        }
                                                    </td>
                                                    <td className="px-6 py-4 text-muted-foreground">
                                                        {
                                                            transaction.category
                                                                .name
                                                        }
                                                    </td>
                                                    <td className="px-6 py-4 text-muted-foreground">
                                                        {
                                                            transactionTypeLabels[
                                                                transaction.type
                                                            ]
                                                        }
                                                    </td>
                                                    <td className="px-6 py-4 text-muted-foreground">
                                                        {
                                                            transaction.formattedDate
                                                        }
                                                    </td>
                                                    <td
                                                        className={`px-6 py-4 text-right font-medium ${transaction.type === 'income' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}
                                                    >
                                                        {currencyFormatter.format(
                                                            Number(
                                                                transaction.amount,
                                                            ),
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={TransactionController.edit(
                                                                        transaction.id,
                                                                        {
                                                                            query: filters,
                                                                        },
                                                                    )}
                                                                >
                                                                    Editar
                                                                </Link>
                                                            </Button>
                                                            <Form
                                                                {...TransactionController.destroy.form(
                                                                    transaction.id,
                                                                    {
                                                                        query: filters,
                                                                    },
                                                                )}
                                                                onBefore={() =>
                                                                    window.confirm(
                                                                        `Deseja excluir o lançamento “${transaction.description}”?`,
                                                                    )
                                                                }
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    type="submit"
                                                                >
                                                                    Excluir
                                                                </Button>
                                                            </Form>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex flex-col gap-3 border-t border-border/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-muted-foreground">
                                    {transactions.from ?? 0}–
                                    {transactions.to ?? 0} de{' '}
                                    {transactions.total} lançamentos
                                </p>
                                <nav
                                    aria-label="Paginação dos lançamentos"
                                    className="flex flex-wrap items-center justify-end gap-1"
                                >
                                    {transactions.links.map((link, index) => {
                                        const label = getPaginationLabel(
                                            link.label,
                                        );

                                        return link.url ? (
                                            <Button
                                                key={`${label}-${index}`}
                                                variant={
                                                    link.active
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                asChild
                                            >
                                                <Link href={link.url}>
                                                    {label}
                                                </Link>
                                            </Button>
                                        ) : (
                                            <Button
                                                key={`${label}-${index}`}
                                                variant="outline"
                                                size="sm"
                                                disabled
                                            >
                                                {label}
                                            </Button>
                                        );
                                    })}
                                </nav>
                            </div>
                        </CardContent>
                    ) : (
                        <CardContent className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                            <h2 className="font-medium">
                                Nenhum lançamento encontrado
                            </h2>
                            <p className="max-w-sm text-sm text-muted-foreground">
                                Não encontramos lançamentos para este período e
                                estes filtros. Experimente ajustar a busca ou
                                limpar os filtros.
                            </p>
                            <Button variant="outline" asChild className="mt-2">
                                <Link
                                    href={transactionsRoute.index({
                                        query: {
                                            month: monthNavigation.default,
                                        },
                                    })}
                                >
                                    Limpar filtros
                                </Link>
                            </Button>
                        </CardContent>
                    )}
                </Card>
            </main>
        </>
    );
}

TransactionsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Lançamentos',
            href: transactionsRoute.index(),
        },
    ],
};
