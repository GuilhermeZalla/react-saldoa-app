import { Form, Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import TransactionController from '@/actions/App/Http/Controllers/TransactionController';
import { FinancePeriod } from '@/components/finance-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import transactions from '@/routes/transactions';
import type {
    TransactionCategoryOption,
    TransactionFilters,
    TransactionMonthNavigation,
} from '@/types/transaction';

type Props = {
    categories: TransactionCategoryOption[];
    filters: TransactionFilters;
    monthNavigation: TransactionMonthNavigation;
};
export function TransactionFiltersPanel({
    categories,
    filters,
    monthNavigation,
}: Props) {
    return (
        <Form
            {...TransactionController.index.form()}
            key={JSON.stringify(filters)}
            options={{ preserveScroll: true }}
            className="space-y-4"
        >
            <div className="flex flex-wrap items-center justify-between gap-3">
                <FinancePeriod
                    month={filters.month}
                    onChange={(month) =>
                        router.get(
                            transactions.index().url,
                            { ...filters, month },
                            { preserveScroll: true },
                        )
                    }
                />
                <fieldset className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
                    <legend className="sr-only">Tipo de lançamento</legend>
                    {[
                        ['all', 'Todos'],
                        ['income', 'Receitas'],
                        ['expense', 'Despesas'],
                    ].map(([value, label]) => (
                        <label key={value} className="cursor-pointer">
                            <input
                                type="radio"
                                className="peer sr-only"
                                name="type"
                                value={value}
                                defaultChecked={filters.type === value}
                            />
                            <span className="block rounded-lg px-4 py-2 text-xs text-muted-foreground peer-checked:bg-primary/10 peer-checked:font-medium peer-checked:text-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                                {label}
                            </span>
                        </label>
                    ))}
                </fieldset>
            </div>
            <input type="hidden" name="month" value={filters.month} />
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-48 flex-1">
                    <Search className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground" />
                    <Input
                        aria-label="Buscar descrição"
                        name="search"
                        type="search"
                        defaultValue={filters.search}
                        placeholder="Buscar descrição"
                        maxLength={255}
                        className="h-10 bg-card pl-10"
                    />
                </div>
                <Select name="category_id" defaultValue={filters.category_id}>
                    <SelectTrigger
                        aria-label="Categoria"
                        className="h-10 w-full bg-card sm:w-52"
                    >
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas as categorias</SelectItem>
                        {categories.map((category) => (
                            <SelectItem
                                key={category.id}
                                value={String(category.id)}
                            >
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button type="submit">Aplicar filtros</Button>
                <Button variant="ghost" asChild>
                    <Link
                        href={transactions.index({
                            query: { month: monthNavigation.default },
                        })}
                    >
                        Limpar filtros
                    </Link>
                </Button>
            </div>
        </Form>
    );
}
