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

type RecurringTransactionsCreateProps = {
    categories: TransactionCategoryOption[];
    startDate: string;
};

export default function RecurringTransactionsCreate({
    categories,
    startDate,
}: RecurringTransactionsCreateProps) {
    return (
        <>
            <Head title="Nova recorrência" />

            <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 md:p-8">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Nova recorrência
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Programe receitas ou despesas que se repetem.
                    </p>
                </div>

                <Card className="rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle>Dados da recorrência</CardTitle>
                        <CardDescription>
                            Escolha quando a regra começa e com que frequência
                            ela se repete.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            {...RecurringTransactionController.store.form()}
                            options={{ preserveScroll: true }}
                        >
                            {({ processing, errors }) => (
                                <RecurringTransactionForm
                                    categories={categories}
                                    errors={errors}
                                    processing={processing}
                                    submitLabel="Criar recorrência"
                                    startDate={startDate}
                                    includeStartDate
                                />
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}

RecurringTransactionsCreate.layout = {
    breadcrumbs: [
        { title: 'Lançamentos', href: transactions.index() },
        {
            title: 'Nova recorrência',
            href: RecurringTransactionController.create(),
        },
    ],
};
