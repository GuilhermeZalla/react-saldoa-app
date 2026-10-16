import { Form, Head, Link } from '@inertiajs/react';
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
    DialogTrigger,
} from '@/components/ui/dialog';
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
    warning: 'text-warning border-warning/30 bg-warning/10 dark:bg-warning/20',
    exceeded: 'text-expense-text border-expense/30 bg-expense/10 dark:bg-expense/20',
};

type BudgetsIndexProps = {
    budgets: Budget[];
    categoriesWithoutBudget: BudgetCategoryOption[];
    currentMonth: string;
};

function ProgressBar({ percentage, status }: { percentage: number; status: Budget['status'] }) {
    const displayPercentage = Math.min(percentage, 100);

    return (
        <div className="w-full bg-secondary rounded-full h-2.5">
            <div
                className={`h-2.5 rounded-full transition-all duration-500 ${statusClasses[status]} `}
                style={{ width: `${displayPercentage}%` }}
            />
        </div>
    );
}

export default function BudgetsIndex({
    budgets,
    categoriesWithoutBudget,
    currentMonth,
}: BudgetsIndexProps) {
    const [openCreateDialog, setOpenCreateDialog] = React.useState(false);
    const [openEditDialog, setOpenEditDialog] = React.useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
    const [editingBudgetId, setEditingBudgetId] = React.useState<number | null>(null);
    const [deleteBudgetId, setDeleteBudgetId] = React.useState<number | null>(null);
    const [editAmount, setEditAmount] = React.useState('');

    const hasBudgets = budgets.length > 0;
    const hasCategoriesWithoutBudget = categoriesWithoutBudget.length > 0;

    return (
        <>
            <Head title="Metas" />

            <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:p-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">Metas</h1>

                {hasBudgets ? (
                    <Card className="overflow-hidden rounded-2xl shadow-sm">
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/60">
                                {budgets.map((budget) => (
                                    <article key={budget.id} className="p-6">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className={statusClasses[budget.status]}>
                                                    {statusLabels[budget.status]}
                                                </Badge>
                                                <p className="min-w-0 font-medium">{budget.category_name}</p>
                                            </div>

                                            <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:justify-end gap-4">
                                                <div className="text-right">
                                                    <p className="text-xs text-muted-foreground">Gasto do mês</p>
                                                    <p className="font-medium tabular-nums">
                                                        {currencyFormatter.format(Number(budget.spent))}
                                                    </p>
                                                </div>

                                                <div className="w-full sm:w-64">
                                                    <p className="text-xs text-muted-foreground mb-1">
                                                        Limite: {currencyFormatter.format(Number(budget.amount))}
                                                    </p>
                                                    <ProgressBar percentage={budget.percentage} status={budget.status} />
                                                    <p className="text-xs font-medium text-right">
                                                        {percentageFormatter.format(budget.percentage)}% usado
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setEditingBudgetId(budget.id);
                                                            setEditAmount(budget.amount);
                                                            setOpenEditDialog(true);
                                                        }}
                                                    >
                                                        <Edit2 className="size-4" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => {
                                                            setDeleteBudgetId(budget.id);
                                                            setOpenDeleteDialog(true);
                                                        }}
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
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
                                Defina limites mensais de gasto para suas categorias de despesa
                                e acompanhe o uso ao longo do mês.
                            </p>
                            {hasCategoriesWithoutBudget && (
                                <Button onClick={() => setOpenCreateDialog(true)} className="mt-2">
                                    Criar primeira meta
                                </Button>
                            )}
                            {!hasCategoriesWithoutBudget && (
                                <p className="text-sm text-muted-foreground">
                                    Todas as suas categorias de despesa já têm uma meta.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )
                        <p className="text-sm text-muted-foreground">
                            Acompanhe seus limites mensais de gasto por categoria.
                        </p>
                    </div>
                    <Button
                        onClick={() => setOpenCreateDialog(true)}
                        disabled={!hasCategoriesWithoutBudget}
                    >
                        {hasCategoriesWithoutBudget ? 'Nova meta' : 'Todas as categorias têm meta'}
                    </Button>
                </header>
