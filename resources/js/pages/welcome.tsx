import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarDays,
    ChartNoAxesCombined,
    Tags,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard, login, register } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Início" />
            <div className="min-h-screen bg-background">
                <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
                    <Link
                        href={auth.user ? dashboard() : '/'}
                        className="text-lg font-semibold tracking-tight"
                    >
                        Saldoa
                    </Link>
                    <nav
                        aria-label="Navegação principal"
                        className="flex items-center gap-2"
                    >
                        {auth.user ? (
                            <Button asChild>
                                <Link href={dashboard()}>Abrir painel</Link>
                            </Button>
                        ) : (
                            <>
                                <Button variant="ghost" asChild>
                                    <Link href={login()}>Entrar</Link>
                                </Button>
                                <Button asChild>
                                    <Link href={register()}>Criar conta</Link>
                                </Button>
                            </>
                        )}
                    </nav>
                </header>

                <main className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
                    <section className="space-y-6">
                        <p className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">
                            Controle financeiro pessoal
                        </p>
                        <div className="space-y-4">
                            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                                Tenha clareza sobre suas finanças.
                            </h1>
                            <p className="max-w-xl text-lg leading-8 text-muted-foreground">
                                Organize receitas e despesas, acompanhe seu
                                saldo e entenda como seu dinheiro muda a cada
                                mês.
                            </p>
                        </div>
                        {!auth.user && (
                            <div className="flex flex-wrap items-center gap-3">
                                <Button size="lg" asChild>
                                    <Link href={register()}>
                                        Começar agora
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </Button>
                                <Button size="lg" variant="outline" asChild>
                                    <Link href={login()}>
                                        Já tenho uma conta
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </section>

                    <Card className="mx-auto w-full max-w-lg rounded-2xl shadow-sm">
                        <CardHeader>
                            <CardTitle>Seu mês, em um só lugar</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Uma visão simples para acompanhar o que entra e
                                o que sai.
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="flex items-start gap-4">
                                <ChartNoAxesCombined
                                    className="mt-0.5 size-5 shrink-0 text-primary"
                                    aria-hidden="true"
                                />
                                <div>
                                    <p className="font-medium">
                                        Acompanhe seu saldo
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Veja receitas, despesas e resultado do
                                        período.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Tags
                                    className="mt-0.5 size-5 shrink-0 text-primary"
                                    aria-hidden="true"
                                />
                                <div>
                                    <p className="font-medium">
                                        Organize por categoria
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Entenda para onde seus gastos estão
                                        indo.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <CalendarDays
                                    className="mt-0.5 size-5 shrink-0 text-primary"
                                    aria-hidden="true"
                                />
                                <div>
                                    <p className="font-medium">
                                        Consulte cada período
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Acesse seus lançamentos e resumos mês a
                                        mês.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </>
    );
}
