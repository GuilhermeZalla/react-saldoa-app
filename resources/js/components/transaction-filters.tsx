import { Form, Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TransactionController from '@/actions/App/Http/Controllers/TransactionController';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

type TransactionFiltersProps = {
    categories: TransactionCategoryOption[];
    filters: TransactionFilters;
    monthNavigation: TransactionMonthNavigation;
};

export function TransactionFiltersPanel({
    categories,
    filters,
    monthNavigation,
}: TransactionFiltersProps) {
    const periodFormatter = new Intl.DateTimeFormat('pt-BR', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    });
    const currentPeriod = periodFormatter.format(
        new Date(`${monthNavigation.current}-01T00:00:00Z`),
    );

    function monthUrl(month: string) {
        return transactions.index({
            query: {
                ...filters,
                month,
            },
        });
    }

    return (
        <Card className="rounded-2xl shadow-sm">
            <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <CardTitle className="capitalize">
                        {currentPeriod}
                    </CardTitle>
                    <CardDescription>
                        Navegue entre os meses ou combine os filtros.
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" asChild>
                        <Link
                            href={monthUrl(monthNavigation.previous)}
                            aria-label="Ir para o mês anterior"
                        >
                            <ChevronLeft />
                        </Link>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                        <Link
                            href={monthUrl(monthNavigation.next)}
                            aria-label="Ir para o próximo mês"
                        >
                            <ChevronRight />
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Form
                    {...TransactionController.index.form()}
                    options={{ preserveScroll: true }}
                    className="space-y-4"
                >
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="grid gap-2">
                            <Label htmlFor="month">Mês</Label>
                            <Input
                                id="month"
                                name="month"
                                type="month"
                                defaultValue={filters.month}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="type">Tipo</Label>
                            <Select name="type" defaultValue={filters.type}>
                                <SelectTrigger id="type" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="income">
                                        Receitas
                                    </SelectItem>
                                    <SelectItem value="expense">
                                        Despesas
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="category_id">Categoria</Label>
                            <Select
                                name="category_id"
                                defaultValue={filters.category_id}
                            >
                                <SelectTrigger
                                    id="category_id"
                                    className="w-full"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Todas as categorias
                                    </SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem
                                            key={category.id}
                                            value={category.id.toString()}
                                        >
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="search">Descrição</Label>
                            <Input
                                id="search"
                                name="search"
                                type="search"
                                defaultValue={filters.search}
                                placeholder="Buscar descrição"
                                maxLength={255}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button variant="outline" asChild>
                            <Link
                                href={transactions.index({
                                    query: { month: monthNavigation.default },
                                })}
                            >
                                Limpar filtros
                            </Link>
                        </Button>
                        <Button type="submit">Aplicar filtros</Button>
                    </div>
                </Form>
            </CardContent>
        </Card>
    );
}
