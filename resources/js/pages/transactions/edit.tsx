import { Form, Head } from '@inertiajs/react';
import TransactionController from '@/actions/App/Http/Controllers/TransactionController';
import { TransactionForm } from '@/components/transaction-form';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import transactions from '@/routes/transactions';
import type {
    EditableTransaction,
    TransactionCategoryOption,
    TransactionFilters,
} from '@/types/transaction';

type TransactionsEditProps = {
    categories: TransactionCategoryOption[];
    filters: TransactionFilters;
    transaction: EditableTransaction;
};

export default function TransactionsEdit({
    categories: userCategories,
    filters,
    transaction,
}: TransactionsEditProps) {
    return (
        <>
            <Head title={`Editar ${transaction.description}`} />

            <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 md:p-8">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Editar lançamento
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Atualize os dados deste lançamento.
                    </p>
                </div>

                <Card className="rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle>Dados do lançamento</CardTitle>
                        <CardDescription>
                            As categorias exibidas pertencem à sua conta e
                            correspondem ao tipo selecionado.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            {...TransactionController.update.form(
                                transaction.id,
                                { query: filters },
                            )}
                            options={{ preserveScroll: true }}
                        >
                            {({ processing, errors }) => (
                                <TransactionForm
                                    categories={userCategories}
                                    errors={errors}
                                    processing={processing}
                                    submitLabel="Salvar alterações"
                                    filters={filters}
                                    transaction={transaction}
                                />
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}

TransactionsEdit.layout = {
    breadcrumbs: [{ title: 'Lançamentos', href: transactions.index() }],
};
