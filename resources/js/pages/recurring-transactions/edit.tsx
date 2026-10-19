import { Form, Head } from '@inertiajs/react';
import RecurringTransactionController from '@/actions/App/Http/Controllers/RecurringTransactionController';
import { RecurringTransactionForm } from '@/components/recurring-transaction-form';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import transactions from '@/routes/transactions';
import type { TransactionCategoryOption } from '@/types/transaction';
import type { EditableRecurringTransaction } from '@/types/recurring-transaction';

type RecurringTransactionsEditProps = {
    categories: TransactionCategoryOption[];
    recurringTransaction: EditableRecurringTransaction;
};

export default function RecurringTransactionsEdit({
    categories,
    recurringTransaction,
}: RecurringTransactionsEditProps) {
    return (
        <>
            <Head title="Editar recorrência" />

            <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 md:p-8">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Editar recorrência
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        A regra atualizada vale para os próximos lançamentos.
                    </p>
                </div>

                <Card className="rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle>Dados da recorrência</CardTitle>
                        <CardDescription>
                            O início permanece como foi definido na criação.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            {...RecurringTransactionController.update.form(
                                recurringTransaction.id,
                            )}
                            options={{ preserveScroll: true }}
                        >
                            {({ processing, errors }) => (
                                <RecurringTransactionForm
                                    categories={categories}
                                    errors={errors}
                                    processing={processing}
                                    submitLabel="Salvar alterações"
                                    startDate={recurringTransaction.startDate}
                                    endDate={recurringTransaction.endDate}
                                    description={
                                        recurringTransaction.description
                                    }
                                    amount={recurringTransaction.amount}
                                    type={recurringTransaction.type}
                                    categoryId={recurringTransaction.categoryId}
                                    frequency={recurringTransaction.frequency}
                                />
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}

RecurringTransactionsEdit.layout = {
    breadcrumbs: [
        { title: 'Lançamentos', href: transactions.index() },
        { title: 'Recorrências', href: RecurringTransactionController.index() },
    ],
};
