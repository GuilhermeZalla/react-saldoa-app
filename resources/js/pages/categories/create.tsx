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

export default function CategoriesCreate() {
    return (
        <>
            <Head title="Nova categoria" />

            <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 md:p-8">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Nova categoria
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Adicione uma categoria para organizar seus lançamentos.
                    </p>
                </div>

                <Card className="rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle>Dados da categoria</CardTitle>
                        <CardDescription>
                            Escolha um nome e indique se ela representa uma
                            receita ou despesa.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            {...CategoryController.store.form()}
                            options={{ preserveScroll: true }}
                        >
                            {({ processing, errors }) => (
                                <CategoryForm
                                    errors={errors}
                                    processing={processing}
                                    submitLabel="Criar categoria"
                                />
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}

CategoriesCreate.layout = {
    breadcrumbs: [
        { title: 'Categorias', href: categories.index() },
        { title: 'Nova categoria', href: CategoryController.create() },
    ],
};
