import { Form, Head, Link } from '@inertiajs/react';
import CategoryController from '@/actions/App/Http/Controllers/CategoryController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import categories from '@/routes/categories';
import type { Category, CategoryType } from '@/types/category';

const categoryTypeLabels: Record<CategoryType, string> = {
    income: 'Receita',
    expense: 'Despesa',
};

type CategoriesIndexProps = {
    categories: Category[];
};

export default function CategoriesIndex({
    categories: userCategories,
}: CategoriesIndexProps) {
    return (
        <>
            <Head title="Categorias" />

            <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:p-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Categorias
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Organize suas receitas e despesas.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={CategoryController.create()}>
                            Nova categoria
                        </Link>
                    </Button>
                </header>

                <Card className="overflow-hidden rounded-2xl shadow-sm">
                    {userCategories.length > 0 ? (
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/60 lg:hidden">
                                {userCategories.map((category) => {
                                    const hasTransactions =
                                        category.transactionsCount > 0;

                                    return (
                                        <article
                                            key={category.id}
                                            className="space-y-4 p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <p className="min-w-0 font-medium break-words">
                                                    {category.name}
                                                </p>
                                                <Badge
                                                    className={
                                                        category.type ===
                                                        'income'
                                                            ? 'shrink-0 border-transparent bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                                                            : 'shrink-0 border-transparent bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                                    }
                                                >
                                                    {
                                                        categoryTypeLabels[
                                                            category.type
                                                        ]
                                                    }
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {category.transactionsCount ===
                                                1
                                                    ? '1 lançamento'
                                                    : `${category.transactionsCount} lançamentos`}
                                            </p>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    asChild
                                                >
                                                    <Link
                                                        href={CategoryController.edit(
                                                            category.id,
                                                        )}
                                                    >
                                                        Editar
                                                    </Link>
                                                </Button>
                                                {hasTransactions ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="flex-1"
                                                        disabled
                                                        title="Remova os lançamentos ativos antes de excluir esta categoria."
                                                    >
                                                        Excluir
                                                    </Button>
                                                ) : (
                                                    <Form
                                                        className="flex-1"
                                                        {...CategoryController.destroy.form(
                                                            category.id,
                                                        )}
                                                        onBefore={() =>
                                                            window.confirm(
                                                                `Deseja excluir a categoria “${category.name}”?`,
                                                            )
                                                        }
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="w-full"
                                                            type="submit"
                                                        >
                                                            Excluir
                                                        </Button>
                                                    </Form>
                                                )}
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>

                            <div className="hidden overflow-x-auto lg:block">
                                <table className="w-full min-w-[36rem] text-left text-sm">
                                    <thead className="bg-muted/40 text-muted-foreground">
                                        <tr>
                                            <th className="px-6 py-3 font-medium">
                                                Nome
                                            </th>
                                            <th className="px-6 py-3 font-medium">
                                                Tipo
                                            </th>
                                            <th className="px-6 py-3 font-medium">
                                                Lançamentos
                                            </th>
                                            <th className="px-6 py-3 text-right font-medium">
                                                Ações
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userCategories.map((category) => {
                                            const hasTransactions =
                                                category.transactionsCount > 0;

                                            return (
                                                <tr
                                                    key={category.id}
                                                    className="border-t border-border/60"
                                                >
                                                    <td className="px-6 py-4 font-medium">
                                                        {category.name}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge
                                                            className={
                                                                category.type ===
                                                                'income'
                                                                    ? 'border-transparent bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                                                                    : 'border-transparent bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                                            }
                                                        >
                                                            {
                                                                categoryTypeLabels[
                                                                    category
                                                                        .type
                                                                ]
                                                            }
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-muted-foreground">
                                                        {category.transactionsCount ===
                                                        1
                                                            ? '1 lançamento'
                                                            : `${category.transactionsCount} lançamentos`}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={CategoryController.edit(
                                                                        category.id,
                                                                    )}
                                                                >
                                                                    Editar
                                                                </Link>
                                                            </Button>
                                                            {hasTransactions ? (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    disabled
                                                                    title="Remova os lançamentos ativos antes de excluir esta categoria."
                                                                >
                                                                    Excluir
                                                                </Button>
                                                            ) : (
                                                                <Form
                                                                    {...CategoryController.destroy.form(
                                                                        category.id,
                                                                    )}
                                                                    onBefore={() =>
                                                                        window.confirm(
                                                                            `Deseja excluir a categoria “${category.name}”?`,
                                                                        )
                                                                    }
                                                                >
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        type="submit"
                                                                    >
                                                                        Excluir
                                                                    </Button>
                                                                </Form>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    ) : (
                        <CardContent className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                            <h2 className="font-medium">
                                Nenhuma categoria ainda
                            </h2>
                            <p className="max-w-sm text-sm text-muted-foreground">
                                Crie uma categoria para começar a organizar suas
                                receitas e despesas.
                            </p>
                            <Button asChild className="mt-2">
                                <Link href={CategoryController.create()}>
                                    Criar categoria
                                </Link>
                            </Button>
                        </CardContent>
                    )}
                </Card>
            </main>
        </>
    );
}

CategoriesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Categorias',
            href: categories.index(),
        },
    ],
};
