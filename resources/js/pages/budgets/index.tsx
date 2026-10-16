import * as React from 'react';
import { Form, Head } from '@inertiajs/react';
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
import { Input } from '@/components/ui/input';
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
    exceeded: 'text-expense-text border-expense/30 bg-expense/10',
};

type BudgetsIndexProps = {
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
        exceeded: 'bg-expense',
    };

    return (
        <div className="h-2.5 w-full rounded-full bg-secondary">
            <div
                className={`h-2.5 rounded-full transition-all duration-500 ${progressClasses[status]}`}
                style={{ width: `${displayPercentage}%` }}
            />
        </div>
    );
}

export default function BudgetsIndex({
    budgets: userBudgets,
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

    const hasBudgets = userBudgets.length > 0;
    const hasCategoriesWithoutBudget = categoriesWithoutBudget.length > 0;

    return (
        <>
            <Head title="Metas" />

            <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:p-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Metas
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Acompanhe seus limites mensais de gasto por
                            categoria.
                        </p>
                    </div>
                    <Button
                        onClick={() => setOpenCreateDialog(true)}
                        disabled={!hasCategoriesWithoutBudget}
                    >
                        {hasCategoriesWithoutBudget
                            ? 'Nova meta'
                            : 'Todas as categorias têm meta'}
                    </Button>
                </header>

                {hasBudgets ? (
                    <Card className="overflow-hidden rounded-2xl shadow-sm">
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/60">
                                {userBudgets.map((budget) => (
                                    <article key={budget.id} className="p-6">
                                        <div className="flex flex-col gap-4">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            statusClasses[
                                                                budget.status
                                                            ]
                                                        }
                                                    >
                                                        {
                                                            statusLabels[
                                                                budget.status
                                                            ]
                                                        }
                                                    </Badge>
                                                    <p className="min-w-0 font-medium">
                                                        {budget.category_name}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setEditingBudget(
                                                                budget,
                                                            );
                                                            setOpenEditDialog(
                                                                true,
                                                            );
                                                        }}
                                                    >
                                                        <Edit2 className="size-4" />
                                                        <span className="sr-only">
                                                            Editar meta
                                                        </span>
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
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
                                                        <span className="sr-only">
                                                            Excluir meta
                                                        </span>
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                                <div className="text-left">
                                                    <p className="text-xs text-muted-foreground">
                                                        Gasto do mês
                                                    </p>
                                                    <p className="font-medium tabular-nums">
                                                        {currencyFormatter.format(
                                                            Number(
                                                                budget.spent,
                                                            ),
                                                        )}
                                                    </p>
                                                </div>

                                                <div className="w-full sm:w-80">
                                                    <div className="mb-1 flex items-center justify-between">
                                                        <p className="text-xs text-muted-foreground">
                                                            Limite:{' '}
                                                            {currencyFormatter.format(
                                                                Number(
                                                                    budget.amount,
                                                                ),
                                                            )}
                                                        </p>
                                                        <p className="text-xs font-medium">
                                                            {percentageFormatter.format(
                                                                budget.percentage,
                                                            )}
                                                            % usado
                                                        </p>
                                                    </div>
                                                    <ProgressBar
                                                        percentage={
                                                            budget.percentage
                                                        }
                                                        status={budget.status}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="rounded-2xl shadow-sm">
                        <CardContent className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                            <h2 className="font-medium">Nenhuma meta ainda</h2>
                            <p className="max-w-sm text-sm text-muted-foreground">
                                Defina limites mensais de gasto para suas
                                categorias de despesa e acompanhe o uso ao longo
                                do mês.
                            </p>
                            {hasCategoriesWithoutBudget ? (
                                <Button
                                    onClick={() => setOpenCreateDialog(true)}
                                    className="mt-2"
                                >
                                    Criar primeira meta
                                </Button>
                            ) : (
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Todas as suas categorias de despesa já têm
                                    uma meta.
                                </p>
                            )}
                        </CardContent>
                    </Card>
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
                                            <Input
                                                id="amount"
                                                name="amount"
                                                type="number"
                                                step="0.01"
                                                min="0.01"
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
                                                <Input
                                                    id="edit-amount"
                                                    name="amount"
                                                    type="number"
                                                    step="0.01"
                                                    min="0.01"
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
            title: 'Metas',
            href: budgets.index(),
        },
    ],
};
