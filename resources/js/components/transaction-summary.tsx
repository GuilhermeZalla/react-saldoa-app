import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TransactionSummary as TransactionSummaryValues } from '@/types/transaction';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

type TransactionSummaryProps = {
    month: string;
    summary: TransactionSummaryValues;
};

export function TransactionSummary({
    month,
    summary,
}: TransactionSummaryProps) {
    const periodFormatter = new Intl.DateTimeFormat('pt-BR', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    });
    const period = periodFormatter.format(new Date(`${month}-01T00:00:00Z`));

    return (
        <Card className="rounded-2xl shadow-sm">
            <CardHeader>
                <CardTitle className="text-base">Resumo de {period}</CardTitle>
            </CardHeader>
            <CardContent>
                <dl className="grid gap-5 sm:grid-cols-3">
                    <div className="space-y-1">
                        <dt className="text-sm text-muted-foreground">
                            Total de receitas
                        </dt>
                        <dd className="text-xl font-semibold text-green-700 dark:text-green-400">
                            {currencyFormatter.format(Number(summary.income))}
                        </dd>
                    </div>
                    <div className="space-y-1">
                        <dt className="text-sm text-muted-foreground">
                            Total de despesas
                        </dt>
                        <dd className="text-xl font-semibold text-red-700 dark:text-red-400">
                            {currencyFormatter.format(Number(summary.expense))}
                        </dd>
                    </div>
                    <div className="space-y-1">
                        <dt className="text-sm text-muted-foreground">Saldo</dt>
                        <dd className="text-xl font-semibold">
                            {currencyFormatter.format(Number(summary.balance))}
                        </dd>
                    </div>
                </dl>
            </CardContent>
        </Card>
    );
}
