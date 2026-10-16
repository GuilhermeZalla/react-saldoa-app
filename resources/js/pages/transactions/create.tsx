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
import type { TransactionCategoryOption } from '@/types/transaction';

type TransactionsCreateProps = {
    categories: TransactionCategoryOption[];
};

export default function TransactionsCreate({
    categories,
}: TransactionsCreateProps) {
    return (
        <>
            <Head title="Novo lançamento" />

            <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 md:p-8">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Novo lançamento
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Registre uma receita ou despesa.
                    </p>
                </div>

                <Card className="rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle>Dados do lançamento</CardTitle>
                        <CardDescription>
                            Preencha os dados e escolha uma categoria do mesmo
                            tipo do lançamento.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            {...TransactionController.store.form()}
                            options={{ preserveScroll: true }}
                        >
                            {({ processing, errors }) => (
                                <TransactionForm
                                    categories={categories}
                                    errors={errors}
                                    processing={processing}
                                    submitLabel="Criar lançamento"
                                />
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}

TransactionsCreate.layout = {
    breadcrumbs: [
        { title: 'Lançamentos', href: transactions.index() },
        {
            title: 'Novo lançamento',
            href: TransactionController.create(),
        },
    ],
};
