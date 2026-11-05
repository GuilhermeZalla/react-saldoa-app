import { Card, CardContent } from '@/components/ui/card';
import type { TransactionSummary as Summary } from '@/types/transaction';
const currency = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});
export function TransactionSummary({
    month,
    summary,
}: {
    month: string;
    summary: Summary;
}) {
    const period = new Intl.DateTimeFormat('pt-BR', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(new Date(`${month}-01T00:00:00Z`));
    return (
        <section
            className="grid gap-3 sm:grid-cols-3"
            aria-label={`Resumo de ${period}`}
        >
            {[
                ['Receitas do mês', summary.income, 'text-income'],
                ['Despesas do mês', summary.expense, 'text-expense-text'],
                ['Saldo do mês', summary.balance, ''],
            ].map(([title, value, color]) => (
                <Card key={title} className="finance-surface gap-0 py-5">
                    <CardContent className="space-y-2">
                        <p className="text-xs text-muted-foreground">{title}</p>
                        <p
                            className={`money-value text-2xl font-semibold ${color}`}
                        >
                            {currency.format(Number(value))}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {period}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </section>
    );
}
