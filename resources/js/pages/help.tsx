import { Head, Link } from '@inertiajs/react';
import CategoryController from '@/actions/App/Http/Controllers/CategoryController';
import TransactionController from '@/actions/App/Http/Controllers/TransactionController';
import RecurringTransactionController from '@/actions/App/Http/Controllers/RecurringTransactionController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard, guide } from '@/routes';
import budgets from '@/routes/budgets';

const steps = [
    {
        title: '1. Confira suas categorias',
        description:
            'Categorias organizam receitas e despesas. Confira as existentes ou crie uma que faça sentido para você.',
        href: CategoryController.index(),
    },
    {
        title: '2. Registre uma movimentação',
        description:
            'Escolha receita ou despesa, informe valor, descrição, categoria e data. Para R$ 50,00, digite 5000 no campo de valor.',
        href: TransactionController.create(),
    },
    {
        title: '3. Acompanhe seu saldo',
        description:
            'Volte ao início para ver o resultado e escolha o mês que deseja acompanhar.',
        href: dashboard(),
    },
];

export default function Help() {
    return (
        <>
            <Head title="Como usar o Saldoa" />
            <main className="finance-page max-w-4xl">
                <header className="space-y-2">
                    <h1 className="font-heading text-3xl font-semibold">
                        Como usar o Saldoa
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Comece com três passos. Consulte esta ajuda sempre que
                        precisar.
                    </p>
                </header>
                {steps.map((step) => (
                    <Card key={step.title} className="finance-surface">
                        <CardHeader>
                            <CardTitle>{step.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                {step.description}
                            </p>
                            <Button variant="outline" asChild>
                                <Link href={step.href}>Abrir</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
                <Card className="finance-surface">
                    <CardHeader>
                        <CardTitle>Entenda os números</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground">
                        <p>
                            <strong className="text-foreground">
                                Saldo geral:
                            </strong>{' '}
                            receitas menos despesas registradas de todos os
                            períodos. O saldo do mês considera apenas o mês
                            selecionado. Previsões da agenda ficam fora desses
                            saldos.
                        </p>
                        <p>
                            <strong className="text-foreground">
                                Limites mensais:
                            </strong>{' '}
                            defina quanto pretende gastar por categoria de
                            despesa. O limite continua nos próximos meses até
                            ser alterado ou excluído; o gasto é calculado para
                            cada mês.
                        </p>
                        <Button variant="outline" asChild>
                            <Link href={budgets.index()}>
                                Abrir planejamento
                            </Link>
                        </Button>
                        <p>
                            <strong className="text-foreground">
                                Recorrências:
                            </strong>{' '}
                            regras que geram lançamentos nas datas previstas. A
                            agenda mostra a próxima ocorrência de cada regra no
                            mês selecionado. O valor só entra no saldo quando o
                            lançamento é gerado.
                        </p>
                        <Button variant="outline" asChild>
                            <Link href={RecurringTransactionController.index()}>
                                Abrir recorrências
                            </Link>
                        </Button>
                        <p>
                            <strong className="text-foreground">
                                Valores:
                            </strong>{' '}
                            os dois últimos dígitos são os centavos. Digitar 200
                            mostra 2,00; 5000 mostra 50,00. Você também pode
                            colar 1.234,56.
                        </p>
                    </CardContent>
                </Card>
                <Card className="finance-surface">
                    <CardHeader>
                        <CardTitle>Guia do site em PDF</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Instruções e imagens da versão desktop, disponíveis
                            em português e inglês. Baixe para consultar mesmo
                            sem internet.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Button variant="outline" asChild>
                                <a
                                    href={
                                        guide({
                                            query: {
                                                platform: 'desktop',
                                                lang: 'pt-BR',
                                            },
                                        }).url
                                    }
                                    download
                                >
                                    Baixar em português
                                </a>
                            </Button>
                            <Button variant="outline" asChild>
                                <a
                                    href={
                                        guide({
                                            query: {
                                                platform: 'desktop',
                                                lang: 'en',
                                            },
                                        }).url
                                    }
                                    download
                                >
                                    Baixar em inglês
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}
