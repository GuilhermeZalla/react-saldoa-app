import { Link, usePage } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import { Card } from '@/components/ui/card';
import { home, login, register } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { component } = usePage();
    const isLoginPage = component === 'auth/login';
    const headerLink = isLoginPage
        ? { href: register(), label: 'Criar conta' }
        : { href: login(), label: 'Entrar' };

    return (
        <div className="page-atmosphere relative isolate flex min-h-svh flex-col overflow-hidden text-foreground">
            <header className="relative z-10 w-full border-b border-border/70 bg-background/80 backdrop-blur-sm">
                <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
                    <Link
                        href={home()}
                        className="inline-flex min-w-0 items-center rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background focus-visible:outline-none [&_.text-sidebar-foreground]:text-foreground"
                    >
                        <AppLogo />
                    </Link>
                    <Link
                        href={headerLink.href}
                        className="shrink-0 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background focus-visible:outline-none"
                    >
                        {headerLink.label}
                    </Link>
                </div>
            </header>

            <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 sm:px-6">
                <section className="my-auto grid flex-1 place-items-center py-10 sm:py-14">
                    <Card className="w-full max-w-md gap-0 rounded-2xl border-border/80 bg-card p-6 shadow-sm sm:p-8">
                        <div className="mb-8 space-y-2.5">
                            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                {title}
                            </h1>
                            <p className="text-sm leading-6 text-muted-foreground sm:text-base">
                                {description}
                            </p>
                        </div>
                        {children}
                    </Card>
                </section>
            </main>

            <footer className="relative z-10 border-t border-border/70">
                <div className="mx-auto flex w-full max-w-5xl flex-col gap-1.5 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <span className="font-heading font-semibold tracking-tight text-foreground">
                        Saldoa
                    </span>
                    <span>Feito por Guilherme Zalla</span>
                </div>
            </footer>
        </div>
    );
}
