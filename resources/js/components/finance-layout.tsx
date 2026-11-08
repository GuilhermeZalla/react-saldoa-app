import type { ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import RecurringTransactionController from '@/actions/App/Http/Controllers/RecurringTransactionController';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { UpcomingTransaction } from '@/types/dashboard';

export function FinanceHeader({
    eyebrow,
    title,
    subtitle,
    children,
}: {
    eyebrow: string;
    title: string;
    subtitle: string;
    children?: ReactNode;
}) {
    return (
        <header className="finance-head">
            <div className="min-w-0">
                <p className="finance-eyebrow">{eyebrow}</p>
                <h1>{title}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">{children}</div>
        </header>
    );
}
export function FinancePeriod({
    month,
    onChange,
}: {
    month: string;
    onChange: (month: string) => void;
}) {
    function move(offset: number) {
        const [year, number] = month.split('-').map(Number);
        const index = year * 12 + number - 1 + offset;
        const nextYear = Math.floor(index / 12);
        if (nextYear < 1 || nextYear > 9999) return;
        onChange(
            `${String(nextYear).padStart(4, '0')}-${String((index % 12) + 1).padStart(2, '0')}`,
        );
    }
    return (
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
            <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8"
                onClick={() => move(-1)}
                aria-label="Mês anterior"
            >
                <ChevronLeft className="size-4" />
            </Button>
            <Input
                aria-label="Mês selecionado"
                type="month"
                min="0001-01"
                max="9999-12"
                value={month}
                onChange={(event) => {
                    if (
                        /^(?!0000)\d{4}-(0[1-9]|1[0-2])$/.test(
                            event.currentTarget.value,
                        )
                    )
                        onChange(event.currentTarget.value);
                }}
                className="h-8 w-36 border-0 bg-transparent px-1 text-xs shadow-none"
            />
            <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8"
                onClick={() => move(1)}
                aria-label="Próximo mês"
            >
                <ChevronRight className="size-4" />
            </Button>
        </div>
    );
}
const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});
export function UpcomingTransactions({
    items,
    hidden = false,
    compact = false,
}: {
    items: UpcomingTransaction[];
    hidden?: boolean;
    compact?: boolean;
}) {
    return (
        <Card className="finance-surface">
            <CardHeader className="flex-row items-start justify-between gap-3">
                <div>
                    <CardTitle>Próximos lançamentos</CardTitle>
                    <CardDescription className="mt-1 text-xs">
                        Próxima ocorrência de cada recorrência. Valores
                        previstos, fora do saldo realizado.
                    </CardDescription>
                </div>
                <Link
                    href={RecurringTransactionController.index()}
                    className="shrink-0 text-xs font-medium text-primary"
                >
                    Ver recorrências
                </Link>
            </CardHeader>
            <CardContent>
                {items.length ? (
                    <div className="divide-y divide-border">
                        {items.slice(0, compact ? 3 : 20).map((item) => (
                            <Link
                                key={item.id}
                                href={RecurringTransactionController.edit(
                                    item.id,
                                )}
                                className="flex items-center gap-3 py-3 first:pt-0"
                            >
                                <div className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl bg-background">
                                    <span className="font-heading text-base font-semibold">
                                        {item.date.slice(-2)}
                                    </span>
                                    <span className="text-[0.6rem] text-muted-foreground">
                                        {new Intl.DateTimeFormat('pt-BR', {
                                            month: 'short',
                                        }).format(
                                            new Date(item.date + 'T12:00:00'),
                                        )}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium break-words">
                                        {item.description}
                                    </p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        {item.category} · Previsto
                                    </p>
                                </div>
                                <span
                                    className={`money-value shrink-0 text-sm font-semibold ${item.type === 'income' ? 'text-income' : 'text-expense-text'}`}
                                >
                                    {hidden
                                        ? '••••'
                                        : `${item.type === 'income' ? '+' : '−'} ${formatter.format(Number(item.amount))}`}
                                </span>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-muted-foreground">
                        <CalendarDays className="size-6" />
                        <p>
                            Nenhuma recorrência prevista neste período. Crie uma
                            regra para acompanhar os próximos valores na agenda.
                        </p>
                        <Link
                            href={RecurringTransactionController.create()}
                            className="font-medium text-primary hover:underline"
                        >
                            Criar recorrência
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
