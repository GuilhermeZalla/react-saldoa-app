import { Form, Head } from '@inertiajs/react';
import CategoryController from '@/actions/App/Http/Controllers/CategoryController';
import { CategoryForm } from '@/components/category-form';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import categories from '@/routes/categories';
import type { EditableCategory } from '@/types/category';

type CategoriesEditProps = {
    category: EditableCategory;
};

export default function CategoriesEdit({ category }: CategoriesEditProps) {
    return (
        <>
            <Head title={`Editar ${category.name}`} />

            <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 md:p-8">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Editar categoria
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Atualize o nome ou o tipo desta categoria.
                    </p>
                </div>

                <Card className="rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle>Dados da categoria</CardTitle>
                        <CardDescription>
                            As alterações também serão refletidas nos
                            lançamentos associados a esta categoria.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            {...CategoryController.update.form(category.id)}
                            options={{ preserveScroll: true }}
                        >
                            {({ processing, errors }) => (
                                <CategoryForm
                                    category={category}
                                    errors={errors}
                                    processing={processing}
                                    submitLabel="Salvar alterações"
                                />
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}

CategoriesEdit.layout = {
    breadcrumbs: [{ title: 'Categorias', href: categories.index() }],
};
