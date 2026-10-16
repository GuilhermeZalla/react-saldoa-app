import { useState } from 'react';
import { Link } from '@inertiajs/react';
import CategoryController from '@/actions/App/Http/Controllers/CategoryController';
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
    EditableTransaction,
    TransactionCategoryOption,
    TransactionFilters,
    TransactionType,
} from '@/types/transaction';

type TransactionFormProps = {
    categories: TransactionCategoryOption[];
    errors: {
        description?: string;
        amount?: string;
        type?: string;
        category_id?: string;
        date?: string;
    };
    processing: boolean;
    submitLabel: string;
    filters?: TransactionFilters;
    transaction?: EditableTransaction;
};

export function TransactionForm({
    categories,
    errors,
    processing,
    submitLabel,
    filters,
    transaction,
}: TransactionFormProps) {
    const [type, setType] = useState<TransactionType>(
        transaction?.type ?? 'expense',
    );
    const [categoryId, setCategoryId] = useState(
        transaction?.categoryId.toString() ?? '',
    );
    const availableCategories = categories.filter(
        (category) => category.type === type,
    );

    function handleTypeChange(value: string) {
        const selectedType = value as TransactionType;

        if (selectedType !== type) {
            setCategoryId('');
        }

        setType(selectedType);
    }

    return (
        <div className="space-y-5">
            <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                    id="description"
                    name="description"
                    defaultValue={transaction?.description}
                    placeholder="Ex.: Compra no mercado"
                    maxLength={255}
                    required
                    autoFocus
                    aria-invalid={Boolean(errors.description)}
                    aria-describedby={
                        errors.description ? 'description-error' : undefined
                    }
                    className="aria-invalid:border-input aria-invalid:ring-0"
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

            <div className="grid gap-2 sm:grid-cols-2">
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
                        defaultValue={transaction?.amount}
                        placeholder="0,00"
                        required
                        aria-invalid={Boolean(errors.amount)}
                        aria-describedby={
                            errors.amount ? 'amount-error' : undefined
                        }
                        className="aria-invalid:border-input aria-invalid:ring-0"
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
                    <Label htmlFor="date">Data</Label>
                    <Input
                        id="date"
                        name="date"
                        type="date"
                        defaultValue={transaction?.date}
                        required
                        aria-invalid={Boolean(errors.date)}
                        aria-describedby={
                            errors.date ? 'date-error' : undefined
                        }
                        className="aria-invalid:border-input aria-invalid:ring-0"
                    />
                    {errors.date && (
                        <p
                            id="date-error"
                            className="text-sm text-muted-foreground"
                        >
                            {errors.date}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
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
                            className="w-full aria-invalid:border-input aria-invalid:ring-0"
                            aria-invalid={Boolean(errors.type)}
                            aria-describedby={
                                errors.type ? 'type-error' : undefined
                            }
                        >
                            <SelectValue placeholder="Selecione o tipo" />
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
                        disabled={availableCategories.length === 0}
                        required
                    >
                        <SelectTrigger
                            id="category_id"
                            className="w-full aria-invalid:border-input aria-invalid:ring-0"
                            aria-invalid={Boolean(errors.category_id)}
                            aria-describedby={
                                errors.category_id
                                    ? 'category-error'
                                    : undefined
                            }
                        >
                            <SelectValue
                                placeholder={
                                    availableCategories.length === 0
                                        ? 'Nenhuma categoria deste tipo'
                                        : 'Selecione uma categoria'
                                }
                            />
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
                    {categories.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            Você ainda não tem categorias.{' '}
                            <Link
                                href={CategoryController.create()}
                                className="underline underline-offset-4"
                            >
                                Cadastre uma categoria
                            </Link>{' '}
                            antes de criar o lançamento.
                        </p>
                    )}
                </div>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="outline" asChild>
                    <Link
                        href={
                            filters
                                ? transactions.index({ query: filters })
                                : transactions.index()
                        }
                    >
                        Cancelar
                    </Link>
                </Button>
                <Button type="submit" disabled={processing}>
                    {submitLabel}
                </Button>
            </div>
        </div>
    );
}
