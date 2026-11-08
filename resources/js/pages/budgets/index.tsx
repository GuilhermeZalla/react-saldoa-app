import * as React from 'react';
import { Form, Head, Link, router } from '@inertiajs/react';
import CategoryController from '@/actions/App/Http/Controllers/CategoryController';
import {
    FinanceHeader,
    FinancePeriod,
    UpcomingTransactions,
} from '@/components/finance-layout';
import type { UpcomingTransaction } from '@/types/dashboard';
import { Trash2, Edit2 } from 'lucide-react';
import BudgetController from '@/actions/App/Http/Controllers/BudgetController';
import budgets from '@/routes/budgets';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MoneyInput } from '@/components/money-input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { Budget, BudgetCategoryOption } from '@/types/budget';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

const percentageFormatter = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
});

const statusLabels: Record<Budget['status'], string> = {
    ok: 'Dentro da meta',
    warning: 'Atenção',
    exceeded: 'Estourou',
};

const statusClasses: Record<Budget['status'], string> = {
    ok: 'text-muted-foreground border-border',
    warning: 'text-warning border-warning/30 bg-warning/10',
    exceeded: 'text-warning border-warning/30 bg-warning/10',
};

type BudgetsIndexProps = {
    month: string;
    upcomingTransactions?: UpcomingTransaction[];
    budgets: Budget[];
    categoriesWithoutBudget: BudgetCategoryOption[];
};

function ProgressBar({
    percentage,
    status,
}: {
    percentage: number;
    status: Budget['status'];
}) {
    const displayPercentage = Math.min(percentage, 100);

    const progressClasses: Record<Budget['status'], string> = {
        ok: 'bg-muted-foreground',
        warning: 'bg-warning',
        exceeded: 'bg-warning',
    };

    return (
        <div className="h-1.5 w-full rounded-full bg-secondary">
            <div
                className={`h-1.5 rounded-full transition-all duration-500 ${progressClasses[status]}`}
                style={{ width: `${displayPercentage}%` }}
            />
        </div>
    );
}

export default function BudgetsIndex({
    budgets: userBudgets,
    month,
    upcomingTransactions = [],
    categoriesWithoutBudget,
}: BudgetsIndexProps) {
    const [openCreateDialog, setOpenCreateDialog] = React.useState(false);
    const [openEditDialog, setOpenEditDialog] = React.useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
    const [editingBudget, setEditingBudget] = React.useState<Budget | null>(
        null,
    );
    const [deletingBudget, setDeletingBudget] = React.useState<Budget | null>(
        null,
    );

    const [tab, setTab] = React.useState('all');
    const totalLimit = userBudgets.reduce(
        (sum, budget) => sum + Number(budget.amount),
        0,
    );
    const totalSpent = userBudgets.reduce(
        (sum, budget) => sum + Number(budget.spent),
        0,
    );
    const hasBudgets = userBudgets.length > 0;
    const hasCategoriesWithoutBudget = categoriesWithoutBudget.length > 0;

    return (
        <>
            <Head title="Planejamento" />

            <main className="finance-page">
                <FinanceHeader
                    eyebrow="Seus próximos passos"
                    title="Planejamento"
                    subtitle="Organize o mês e enxergue o que vem depois."
                >
                    <FinancePeriod
                        month={month}
                        onChange={(selected) =>
                            router.get(
                                budgets.index().url,
                                { month: selected },
                                { preserveState: true, preserveScroll: true },
                            )
                        }
                    />
                    <Button
                        onClick={() => setOpenCreateDialog(true)}
                        disabled={!hasCategoriesWithoutBudget}
                    >
                        {hasCategoriesWithoutBudget
                            ? 'Novo limite'
                            : 'Todas as categorias têm limite'}
                    </Button>
                </FinanceHeader>
                <p className="text-sm text-muted-foreground">
                    O limite continua nos próximos meses até ser alterado ou
                    excluído. O gasto considera apenas o mês selecionado.
                </p>
                <section className="grid gap-3 sm:grid-cols-3">
                    <Card className="finance-surface gap-2 py-5">
                        <CardContent className="space-y-2">
                            <p className="text-xs text-muted-foreground">
                                Orçamento do mês
                            </p>
                            <p className="money-value text-2xl font-semibold">
                                {currencyFormatter.format(totalLimit)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Limites de {userBudgets.length} categorias
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="finance-surface gap-2 py-5">
                        <CardContent className="space-y-2">
                            <p className="text-xs text-muted-foreground">
                                Espaço no orçamento
                            </p>
                            <p className="money-value text-2xl font-semibold">
                                {currencyFormatter.format(
                                    totalLimit - totalSpent,
                                )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Disponível nas categorias com limite
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="finance-surface gap-2 py-5">
                        <CardContent className="space-y-2">
                            <p className="text-xs text-muted-foreground">
                                Próximos lançamentos
                            </p>
                            <p className="money-value text-2xl font-semibold">
                                {upcomingTransactions.length}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Até 20 próximas ocorrências previstas
                            </p>
                        </CardContent>
                    </Card>
                </section>
                <div
                    className="flex gap-5 border-b border-border"
                    role="group"
                    aria-label="Seções do planejamento"
                >
                    {[
                        ['all', 'Visão geral'],
                        ['limits', 'Limites'],
                        ['upcoming', 'Agenda'],
                    ].map(([value, label]) => (
                        <button
                            key={value}
                            onClick={() => setTab(value)}
                            aria-pressed={tab === value}
                            className={`border-b-2 px-1 pb-3 text-sm ${tab === value ? 'border-primary font-medium' : 'border-transparent text-muted-foreground'}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                {tab !== 'upcoming' &&
                    (hasBudgets ? (
                        <section className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {userBudgets.map((budget) => (
                                <Card
                                    key={budget.id}
                                    className="finance-surface"
                                >
                                    <CardContent className="space-y-5">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="font-heading text-base font-semibold break-words">
                                                    {budget.category_name}
                                                </p>
                                                <Badge
                                                    variant="outline"
                                                    className={`mt-2 ${statusClasses[budget.status]}`}
                                                >
                                                    {
                                                        statusLabels[
                                                            budget.status
                                                        ]
                                                    }
                                                </Badge>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Editar limite de ${budget.category_name}`}
                                                    onClick={() => {
                                                        setEditingBudget(
                                                            budget,
                                                        );
                                                        setOpenEditDialog(true);
                                                    }}
                                                >
                                                    <Edit2 className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Excluir limite de ${budget.category_name}`}
                                                    onClick={() => {
                                                        setDeletingBudget(
                                                            budget,
                                                        );
                                                        setOpenDeleteDialog(
                                                            true,
                                                        );
                                                    }}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="money-value text-2xl font-semibold">
                                                {currencyFormatter.format(
                                                    Number(budget.spent),
                                                )}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                de{' '}
                                                {currencyFormatter.format(
                                                    Number(budget.amount),
                                                )}{' '}
                                                no mês
                                            </p>
                                        </div>
                                        <div className="space-y-3">
                                            <ProgressBar
                                                percentage={budget.percentage}
                                                status={budget.status}
                                            />
                                            <div className="flex justify-between gap-2 text-xs text-muted-foreground">
                                                <span>
                                                    {Number(budget.amount) -
                                                        Number(budget.spent) >=
                                                    0
                                                        ? 'Ainda disponível'
                                                        : 'Acima do limite'}
                                                </span>
                                                <span>
                                                    {currencyFormatter.format(
                                                        Math.abs(
                                                            Number(
                                                                budget.amount,
                                                            ) -
                                                                Number(
                                                                    budget.spent,
                                                                ),
                                                        ),
                                                    )}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {percentageFormatter.format(
                                                    budget.percentage,
                                                )}
                                                % utilizado
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </section>
                    ) : (
                        <Card className="finance-surface">
                            <CardContent className="space-y-3 py-6 text-center">
                                <h2 className="font-medium">
                                    Nenhum limite definido
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Crie uma categoria de despesa e defina
                                    quanto pretende gastar por mês.
                                </p>
                                {hasCategoriesWithoutBudget ? (
                                    <Button
                                        onClick={() =>
                                            setOpenCreateDialog(true)
                                        }
                                    >
                                        Criar primeiro limite
                                    </Button>
                                ) : (
                                    <Button asChild>
                                        <Link
                                            href={CategoryController.create()}
                                        >
                                            Criar categoria de despesa
                                        </Link>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                {tab !== 'limits' && (
                    <UpcomingTransactions items={upcomingTransactions} />
                )}

                {/* Create Dialog */}
                <Dialog
                    open={openCreateDialog}
                    onOpenChange={setOpenCreateDialog}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Criar meta</DialogTitle>
                            <DialogDescription>
                                Defina um limite mensal de gasto para uma
                                categoria de despesa.
                            </DialogDescription>
                        </DialogHeader>

                        <Form
                            {...BudgetController.store.form()}
                            onSuccess={() => setOpenCreateDialog(false)}
                        >
                            {({ errors, processing }) => (
                                <>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="category_id">
                                                Categoria
                                            </Label>
                                            <Select name="category_id" required>
                                                <SelectTrigger id="category_id">
                                                    <SelectValue placeholder="Selecione uma categoria" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categoriesWithoutBudget.map(
                                                        (category) => (
                                                            <SelectItem
                                                                key={
                                                                    category.id
                                                                }
                                                                value={category.id.toString()}
                                                            >
                                                                {category.name}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {errors.category_id && (
                                                <p className="text-sm text-destructive">
                                                    {errors.category_id}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="amount">
                                                Valor limite (R$)
                                            </Label>
                                            <MoneyInput
                                                id="amount"
                                                name="amount"
                                                placeholder="0,00"
                                                required
                                            />
                                            {errors.amount && (
                                                <p className="text-sm text-destructive">
                                                    {errors.amount}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() =>
                                                setOpenCreateDialog(false)
                                            }
                                            disabled={processing}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {processing
                                                ? 'Criando...'
                                                : 'Criar meta'}
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    </DialogContent>
                </Dialog>

                {/* Edit Dialog */}
                <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Editar meta</DialogTitle>
                            <DialogDescription>
                                Altere o valor limite mensal de{' '}
                                {editingBudget?.category_name}.
                            </DialogDescription>
                        </DialogHeader>

                        {editingBudget && (
                            <Form
                                {...BudgetController.update.form(
                                    editingBudget.id,
                                )}
                                onSuccess={() => {
                                    setOpenEditDialog(false);
                                    setEditingBudget(null);
                                }}
                            >
                                {({ errors, processing }) => (
                                    <>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="edit-amount">
                                                    Valor limite (R$)
                                                </Label>
                                                <MoneyInput
                                                    id="edit-amount"
                                                    name="amount"
                                                    placeholder="0,00"
                                                    defaultValue={
                                                        editingBudget.amount
                                                    }
                                                    required
                                                />
                                                {errors.amount && (
                                                    <p className="text-sm text-destructive">
                                                        {errors.amount}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <DialogFooter>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={() => {
                                                    setOpenEditDialog(false);
                                                    setEditingBudget(null);
                                                }}
                                                disabled={processing}
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                            >
                                                {processing
                                                    ? 'Salvando...'
                                                    : 'Salvar'}
                                            </Button>
                                        </DialogFooter>
                                    </>
                                )}
                            </Form>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Delete Dialog */}
                <Dialog
                    open={openDeleteDialog}
                    onOpenChange={setOpenDeleteDialog}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Excluir meta</DialogTitle>
                            <DialogDescription>
                                Tem certeza de que deseja excluir a meta de{' '}
                                {deletingBudget?.category_name}?
                            </DialogDescription>
                        </DialogHeader>

                        {deletingBudget && (
                            <Form
                                {...BudgetController.destroy.form(
                                    deletingBudget.id,
                                )}
                                onSuccess={() => {
                                    setOpenDeleteDialog(false);
                                    setDeletingBudget(null);
                                }}
                            >
                                {({ processing }) => (
                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => {
                                                setOpenDeleteDialog(false);
                                                setDeletingBudget(null);
                                            }}
                                            disabled={processing}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="destructive"
                                            disabled={processing}
                                        >
                                            {processing
                                                ? 'Excluindo...'
                                                : 'Excluir'}
                                        </Button>
                                    </DialogFooter>
                                )}
                            </Form>
                        )}
                    </DialogContent>
                </Dialog>
            </main>
        </>
    );
}

BudgetsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Planejamento',
            href: budgets.index(),
        },
    ],
};
