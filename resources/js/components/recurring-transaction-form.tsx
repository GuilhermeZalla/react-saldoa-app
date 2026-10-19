import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
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
    TransactionType,
} from '@/types/transaction';
import type { RecurringTransactionFrequency } from '@/types/recurring-transaction';

type RecurringTransactionFormProps = {
    categories: TransactionCategoryOption[];
    errors: Record<string, string>;
    processing: boolean;
    submitLabel: string;
    startDate: string;
    endDate?: string | null;
    description?: string;
    amount?: string;
    type?: TransactionType;
    categoryId?: number;
    frequency?: RecurringTransactionFrequency;
    includeStartDate?: boolean;
};

const frequencyLabels: Record<RecurringTransactionFrequency, string> = {
    daily: 'Todos os dias',
    weekly: 'Toda semana',
    monthly: 'Todo mês',
    yearly: 'Todo ano',
};

export function RecurringTransactionForm({
    categories,
    errors,
    processing,
    submitLabel,
    startDate,
    endDate,
    description,
    amount,
    type: initialType = 'expense',
    categoryId: initialCategoryId,
    frequency: initialFrequency = 'monthly',
    includeStartDate = false,
}: RecurringTransactionFormProps) {
    const [type, setType] = useState<TransactionType>(initialType);
    const [categoryId, setCategoryId] = useState(
        initialCategoryId?.toString() ?? '',
    );
    const availableCategories = categories.filter(
        (category) => category.type === type,
    );

    function handleTypeChange(value: string) {
        const nextType = value as TransactionType;

        if (nextType !== type) {
            setCategoryId('');
        }

        setType(nextType);
    }

    return (
        <div className="space-y-5">
            <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                    id="description"
                    name="description"
                    defaultValue={description}
                    maxLength={255}
                    required
                    aria-invalid={Boolean(errors.description)}
                    aria-describedby={
                        errors.description ? 'description-error' : undefined
                    }
                />
                {errors.description && (
                    <p
                        id="description-error"
                        className="text-sm text-muted-foreground"
                    >
                        {errors.description}
                    </p>
                )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="amount">Valor</Label>
                    <Input
                        id="amount"
                        name="amount"
                        type="number"
                        inputMode="decimal"
                        min="0.01"
                        max="9999999999.99"
                        step="0.01"
                        defaultValue={amount}
                        required
                        aria-invalid={Boolean(errors.amount)}
                        aria-describedby={
                            errors.amount ? 'amount-error' : undefined
                        }
                    />
                    {errors.amount && (
                        <p
                            id="amount-error"
                            className="text-sm text-muted-foreground"
                        >
                            {errors.amount}
                        </p>
                    )}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="frequency">Frequência</Label>
                    <Select
                        name="frequency"
                        defaultValue={initialFrequency}
                        required
                    >
                        <SelectTrigger
                            id="frequency"
                            className="w-full"
                            aria-invalid={Boolean(errors.frequency)}
                            aria-describedby={
                                errors.frequency ? 'frequency-error' : undefined
                            }
                        >
                            <SelectValue placeholder="Selecione a frequência" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(frequencyLabels).map(
                                ([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                ),
                            )}
                        </SelectContent>
                    </Select>
                    {errors.frequency && (
                        <p
                            id="frequency-error"
                            className="text-sm text-muted-foreground"
                        >
                            {errors.frequency}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select
                        name="type"
                        value={type}
                        onValueChange={handleTypeChange}
                        required
                    >
                        <SelectTrigger
                            id="type"
                            className="w-full"
                            aria-invalid={Boolean(errors.type)}
                            aria-describedby={
                                errors.type ? 'type-error' : undefined
                            }
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="income">Receita</SelectItem>
                            <SelectItem value="expense">Despesa</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.type && (
                        <p
                            id="type-error"
                            className="text-sm text-muted-foreground"
                        >
                            {errors.type}
                        </p>
                    )}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="category_id">Categoria</Label>
                    <Select
                        name="category_id"
                        value={categoryId}
                        onValueChange={setCategoryId}
                        required
                    >
                        <SelectTrigger
                            id="category_id"
                            className="w-full"
                            aria-invalid={Boolean(errors.category_id)}
                            aria-describedby={
                                errors.category_id
                                    ? 'category-error'
                                    : undefined
                            }
                        >
                            <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableCategories.map((category) => (
                                <SelectItem
                                    key={category.id}
                                    value={category.id.toString()}
                                >
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.category_id && (
                        <p
                            id="category-error"
                            className="text-sm text-muted-foreground"
                        >
                            {errors.category_id}
                        </p>
                    )}
                    {availableCategories.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            Cadastre uma categoria deste tipo antes de criar a
                            recorrência.
                        </p>
                    )}
                </div>
            </div>

            {includeStartDate ? (
                <div className="grid gap-2">
                    <Label htmlFor="start_date">Começa em</Label>
                    <Input
                        id="start_date"
                        name="start_date"
                        type="date"
                        min={startDate}
                        defaultValue={startDate}
                        required
                        aria-invalid={Boolean(errors.start_date)}
                    />
                    {errors.start_date && (
                        <p className="text-sm text-muted-foreground">
                            {errors.start_date}
                        </p>
                    )}
                </div>
            ) : (
                <input type="hidden" name="start_date" value={startDate} />
            )}

            <div className="grid gap-2">
                <Label htmlFor="end_date">
                    Termina em{' '}
                    <span className="font-normal text-muted-foreground">
                        (opcional)
                    </span>
                </Label>
                <Input
                    id="end_date"
                    name="end_date"
                    type="date"
                    min={startDate}
                    defaultValue={endDate ?? ''}
                    aria-invalid={Boolean(errors.end_date)}
                />
                {errors.end_date && (
                    <p className="text-sm text-muted-foreground">
                        {errors.end_date}
                    </p>
                )}
            </div>

            <p className="text-sm text-muted-foreground">
                Os lançamentos são criados pelo agendador do Laravel. As
                alterações desta regra afetam apenas os próximos lançamentos.
            </p>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="outline" asChild>
                    <Link href={transactions.index()}>Cancelar</Link>
                </Button>
                <Button type="submit" disabled={processing}>
                    {submitLabel}
                </Button>
            </div>
        </div>
    );
}
