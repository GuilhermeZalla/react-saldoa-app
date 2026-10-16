import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeftRight,
    ArrowRight,
    CalendarDays,
    ChartNoAxesCombined,
    Github,
    Tags,
    WalletCards,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { dashboard, login, register } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Bem-vindo" />
            <div className="page-atmosphere min-h-svh overflow-hidden text-foreground">
                <header className="border-b border-border/70">
                    <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
                        <Link
                            href={auth.user ? dashboard() : '/'}
                            className="inline-flex min-w-0 items-center gap-2.5 rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background focus-visible:outline-none"
                        >
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <WalletCards
                                    aria-hidden="true"
                                    className="size-5"
                                />
                            </span>
                            <span className="font-heading text-base font-semibold tracking-tight sm:text-lg">
                                Saldoa
                            </span>
                        </Link>

                        <nav
                            aria-label="Navegação principal"
                            className="flex shrink-0 items-center gap-1.5 sm:gap-2"
                        >
                            {auth.user ? (
                                <Button
                                    size="sm"
                                    asChild
                                    className="duration-200"
                                >
                                    <Link href={dashboard()}>Abrir painel</Link>
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        asChild
                                        className="duration-200"
                                    >
                                        <Link href={login()}>Entrar</Link>
                                    </Button>
                                    <Button
                                        size="sm"
                                        asChild
                                        className="duration-200"
                                    >
                                        <Link href={register()}>
                                            Criar conta
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                <main>
                    <section className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 md:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
                        <div className="space-y-6 sm:space-y-7">
                            <p className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium tracking-wide text-muted-foreground sm:text-sm">
                                Finanças pessoais, com clareza
                            </p>
                            <div className="space-y-4">
                                <h1 className="max-w-xl text-[2.65rem] leading-[1.06] font-semibold tracking-[-0.045em] text-foreground sm:text-6xl">
                                    Organize seu dinheiro com clareza.
                                </h1>
                                <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                                    Registre receitas e despesas, acompanhe cada
                                    período e entenda seu saldo em um só lugar.
                                </p>
                            </div>
                            {!auth.user && (
                                <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
                                    <Button
                                        size="lg"
                                        asChild
                                        className="h-12 px-6 text-base duration-200"
                                    >
                                        <Link href={register()}>
                                            Criar conta
                                            <ArrowRight
                                                aria-hidden="true"
                                                className="size-4"
                                            />
                                        </Link>
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        asChild
                                        className="h-12 px-6 text-base duration-200"
                                    >
                                        <Link href={login()}>Entrar</Link>
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="mx-auto w-full max-w-xl md:ml-auto">
                            <div className="mb-3 flex justify-center sm:justify-start">
                                <span className="rounded-full border border-border bg-card px-3 py-1 text-[0.7rem] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                                    Prévia ilustrativa
                                </span>
                            </div>
                            <Card
                                aria-hidden="true"
                                className="gap-4 rounded-2xl border-border bg-card p-4 shadow-sm sm:gap-5 sm:p-5"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-foreground">
                                            <ChartNoAxesCombined className="size-4" />
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold">
                                                Visão geral
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Acompanhe seu período
                                            </p>
                                        </div>
                                    </div>
                                    <span className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-muted-foreground">
                                        Este mês
                                    </span>
                                </div>

                                <div className="rounded-xl border border-border bg-background p-4 sm:p-5">
                                    <p className="text-sm text-muted-foreground">
                                        Saldo do período
                                    </p>
                                    <p className="money-value mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                                        R$ 4.820,00
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="min-w-0 rounded-xl border border-border p-3 sm:p-4">
                                        <p className="text-xs text-muted-foreground sm:text-sm">
                                            Receitas
                                        </p>
                                        <p className="money-value mt-2 truncate text-base font-semibold text-income sm:text-lg">
                                            R$ 6.240,00
                                        </p>
                                    </div>
                                    <div className="min-w-0 rounded-xl border border-border p-3 sm:p-4">
                                        <p className="text-xs text-muted-foreground sm:text-sm">
                                            Despesas
                                        </p>
                                        <p className="money-value mt-2 truncate text-base font-semibold text-expense-text sm:text-lg">
                                            R$ 1.420,00
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-border p-4 sm:p-5">
                                    <div className="mb-5 flex items-center justify-between gap-3">
                                        <p className="text-sm font-medium">
                                            Receitas e despesas
                                        </p>
                                        <div className="flex items-center gap-3 text-[0.7rem] text-muted-foreground">
                                            <span className="inline-flex items-center gap-1.5">
                                                <span className="size-2 rounded-full bg-income" />
                                                Receitas
                                            </span>
                                            <span className="inline-flex items-center gap-1.5">
                                                <span className="size-2 rounded-full bg-expense" />
                                                Despesas
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex h-24 items-end justify-between gap-2 sm:h-28 sm:gap-3">
                                        <div className="flex h-full flex-1 items-end justify-center gap-1.5 border-b border-border pb-0.5">
                                            <span className="h-10 w-full max-w-5 rounded-t-sm bg-income" />
                                            <span className="h-6 w-full max-w-5 rounded-t-sm bg-expense" />
                                        </div>
                                        <div className="flex h-full flex-1 items-end justify-center gap-1.5 border-b border-border pb-0.5">
                                            <span className="h-16 w-full max-w-5 rounded-t-sm bg-income" />
                                            <span className="h-9 w-full max-w-5 rounded-t-sm bg-expense" />
                                        </div>
                                        <div className="flex h-full flex-1 items-end justify-center gap-1.5 border-b border-border pb-0.5">
                                            <span className="h-12 w-full max-w-5 rounded-t-sm bg-income" />
                                            <span className="h-7 w-full max-w-5 rounded-t-sm bg-expense" />
                                        </div>
                                        <div className="flex h-full flex-1 items-end justify-center gap-1.5 border-b border-border pb-0.5">
                                            <span className="h-20 w-full max-w-5 rounded-t-sm bg-income" />
                                            <span className="h-11 w-full max-w-5 rounded-t-sm bg-expense" />
                                        </div>
                                        <div className="flex h-full flex-1 items-end justify-center gap-1.5 border-b border-border pb-0.5">
                                            <span className="h-14 w-full max-w-5 rounded-t-sm bg-income" />
                                            <span className="h-8 w-full max-w-5 rounded-t-sm bg-expense" />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </section>

                    <section className="border-t border-border/70 bg-card/40">
                        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-20">
                            <div className="mb-8 max-w-2xl space-y-3 sm:mb-10">
                                <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                                    Feito para o dia a dia
                                </p>
                                <h2 className="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
                                    O essencial para cuidar bem do seu dinheiro.
                                </h2>
                                <p className="max-w-xl leading-7 text-muted-foreground">
                                    Ferramentas simples para registrar,
                                    organizar e acompanhar suas finanças.
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <Card className="group gap-5 rounded-2xl border-border bg-muted/40 p-5 shadow-none transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-ring/60 hover:shadow-sm sm:col-span-2 sm:p-6">
                                    <span className="flex size-10 items-center justify-center rounded-xl border border-border bg-card text-foreground">
                                        <ArrowLeftRight
                                            aria-hidden="true"
                                            className="size-5"
                                        />
                                    </span>
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-semibold tracking-tight">
                                            Lançamentos
                                        </h3>
                                        <p className="max-w-md text-sm leading-6 text-muted-foreground">
                                            Registre receitas e despesas e
                                            acompanhe cada movimento.
                                        </p>
                                    </div>
                                </Card>

                                <Card className="gap-5 rounded-2xl border-border bg-card p-5 shadow-sm transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-ring/60 hover:shadow-md sm:p-6">
                                    <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-foreground">
                                        <Tags
                                            aria-hidden="true"
                                            className="size-5"
                                        />
                                    </span>
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-semibold tracking-tight">
                                            Categorias
                                        </h3>
                                        <p className="text-sm leading-6 text-muted-foreground">
                                            Organize seus lançamentos por tipo e
                                            finalidade.
                                        </p>
                                    </div>
                                </Card>

                                <Card className="gap-5 rounded-2xl border-border bg-card p-5 shadow-sm transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-ring/60 hover:shadow-md sm:p-6">
                                    <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-foreground">
                                        <CalendarDays
                                            aria-hidden="true"
                                            className="size-5"
                                        />
                                    </span>
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-semibold tracking-tight">
                                            Filtros por período
                                        </h3>
                                        <p className="text-sm leading-6 text-muted-foreground">
                                            Consulte lançamentos por mês,
                                            categoria ou tipo.
                                        </p>
                                    </div>
                                </Card>

                                <Card className="gap-5 rounded-2xl border-border bg-card p-5 shadow-sm transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-ring/60 hover:shadow-md sm:col-span-2 sm:p-6">
                                    <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-foreground">
                                        <ChartNoAxesCombined
                                            aria-hidden="true"
                                            className="size-5"
                                        />
                                    </span>
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-semibold tracking-tight">
                                            Painel com gráficos
                                        </h3>
                                        <p className="max-w-md text-sm leading-6 text-muted-foreground">
                                            Visualize os totais do período e a
                                            distribuição das despesas.
                                        </p>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="border-t border-border">
                    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                        <Link
                            href={auth.user ? dashboard() : '/'}
                            className="inline-flex w-fit items-center gap-2 rounded-md font-heading font-semibold tracking-tight focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background focus-visible:outline-none"
                        >
                            <WalletCards
                                aria-hidden="true"
                                className="size-4 text-primary"
                            />
                            Saldoa
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            Feito por Guilherme Zalla
                        </p>
                        <a
                            href="https://github.com/GuilhermeZalla/react-saldoa-app"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex w-fit items-center gap-2 rounded-md text-sm text-muted-foreground underline decoration-border underline-offset-4 transition-colors duration-200 hover:text-foreground hover:decoration-current focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background focus-visible:outline-none"
                        >
                            <Github aria-hidden="true" className="size-4" />
                            Repositório no GitHub
                        </a>
                    </div>
                </footer>
            </div>
        </>
    );
}
