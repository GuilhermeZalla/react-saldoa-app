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
import categories from '@/routes/categories';
import type { EditableCategory } from '@/types/category';

type CategoryFormProps = {
    category?: EditableCategory;
    errors: {
        name?: string;
        type?: string;
    };
    processing: boolean;
    submitLabel: string;
};

export function CategoryForm({
    category,
    errors,
    processing,
    submitLabel,
}: CategoryFormProps) {
    return (
        <div className="space-y-5">
            <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                    id="name"
                    name="name"
                    defaultValue={category?.name}
                    placeholder="Ex.: Moradia"
                    maxLength={255}
                    required
                    autoFocus
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name && (
                    <p
                        id="name-error"
                        className="text-sm text-muted-foreground"
                    >
                        {errors.name}
                    </p>
                )}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                    name="type"
                    defaultValue={category?.type ?? 'expense'}
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

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="outline" asChild>
                    <Link href={categories.index()}>Cancelar</Link>
                </Button>
                <Button type="submit" disabled={processing}>
                    {submitLabel}
                </Button>
            </div>
        </div>
    );
}
