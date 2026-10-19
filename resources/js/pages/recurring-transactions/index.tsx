import { useState } from 'react';
import { Form, Head, Link } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import RecurringTransactionController from '@/actions/App/Http/Controllers/RecurringTransactionController';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type {
    RecurringTransaction,
    RecurringTransactionFrequency,
} from '@/types/recurring-transaction';

type RecurringTransactionsIndexProps = {
    recurringTransactions: RecurringTransaction[];
};

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

const frequencyLabels: Record<RecurringTransactionFrequency, string> = {
    daily: 'Diária',
    weekly: 'Semanal',
    monthly: 'Mensal',
    yearly: 'Anual',
};

function formatDate(date: string): string {
    const [year, month, day] = date.split('-').map(Number);

    return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
}

export default function RecurringTransactionsIndex({
    recurringTransactions,
}: RecurringTransactionsIndexProps) {
    const [deletingRecurringTransaction, setDeletingRecurringTransaction] =
        useState<RecurringTransaction | null>(null);

    return (
        <>
            <Head title="Recorrências" />

            <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:p-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Recorrências
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Gerencie receitas e despesas que se repetem.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={RecurringTransactionController.create()}>
                            <Plus className="size-4" />
                            Nova recorrência
                        </Link>
                    </Button>
                </header>

                <Card className="overflow-hidden rounded-2xl shadow-sm">
                    {recurringTransactions.length > 0 ? (
                        <CardContent className="divide-y divide-border/60 p-0">
                            {recurringTransactions.map(
                                (recurringTransaction) => (
                                    <article
                                        key={recurringTransaction.id}
                                        className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                                    >
                                        <div className="min-w-0 space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="font-medium">
                                                    {
                                                        recurringTransaction.description
                                                    }
                                                </h2>
                                                <span
                                                    className={`text-sm ${recurringTransaction.type === 'income' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}
                                                >
                                                    {recurringTransaction.type ===
                                                    'income'
                                                        ? 'Receita'
                                                        : 'Despesa'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {
                                                    recurringTransaction
                                                        .category.name
                                                }{' '}
                                                ·{' '}
                                                {
                                                    frequencyLabels[
                                                        recurringTransaction
                                                            .frequency
                                                    ]
                                                }{' '}
                                                · começa em{' '}
                                                {formatDate(
                                                    recurringTransaction.startDate,
                                                )}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {recurringTransaction.nextOccurrenceDate
                                                    ? `Próximo lançamento: ${formatDate(recurringTransaction.nextOccurrenceDate)}`
                                                    : 'Recorrência encerrada'}
                                                {recurringTransaction.endDate
                                                    ? ` · termina em ${formatDate(recurringTransaction.endDate)}`
                                                    : ''}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between gap-3 sm:justify-end">
                                            <p
                                                className={`font-semibold whitespace-nowrap ${recurringTransaction.type === 'income' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}
                                            >
                                                {currencyFormatter.format(
                                                    Number(
                                                        recurringTransaction.amount,
                                                    ),
                                                )}
                                            </p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={RecurringTransactionController.edit(
                                                        recurringTransaction.id,
                                                    )}
                                                >
                                                    <Pencil className="size-4" />
                                                    <span className="sr-only">
                                                        Editar{' '}
                                                        {
                                                            recurringTransaction.description
                                                        }
                                                    </span>
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                    setDeletingRecurringTransaction(
                                                        recurringTransaction,
                                                    )
                                                }
                                                aria-label={`Excluir ${recurringTransaction.description}`}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </article>
                                ),
                            )}
                        </CardContent>
                    ) : (
                        <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
                            <h2 className="font-medium">
                                Nenhuma recorrência cadastrada
                            </h2>
                            <p className="max-w-md text-sm text-muted-foreground">
                                Crie uma regra para gerar automaticamente
                                lançamentos diários, semanais, mensais ou
                                anuais.
                            </p>
                            <Button asChild>
                                <Link
                                    href={RecurringTransactionController.create()}
                                >
                                    Criar primeira recorrência
                                </Link>
                            </Button>
                        </CardContent>
                    )}
                </Card>
            </main>

            <Dialog
                open={deletingRecurringTransaction !== null}
                onOpenChange={(open) =>
                    !open && setDeletingRecurringTransaction(null)
                }
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Excluir recorrência?</DialogTitle>
                        <DialogDescription>
                            Os lançamentos já criados serão mantidos. A regra
                            deixará de gerar novos lançamentos.
                        </DialogDescription>
                    </DialogHeader>
                    {deletingRecurringTransaction && (
                        <Form
                            {...RecurringTransactionController.destroy.form(
                                deletingRecurringTransaction.id,
                            )}
                            options={{ preserveScroll: true }}
                            onSuccess={() =>
                                setDeletingRecurringTransaction(null)
                            }
                        >
                            {({ processing }) => (
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline">
                                            Cancelar
                                        </Button>
                                    </DialogClose>
                                    <Button
                                        type="submit"
                                        variant="destructive"
                                        disabled={processing}
                                    >
                                        Excluir recorrência
                                    </Button>
                                </DialogFooter>
                            )}
                        </Form>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
