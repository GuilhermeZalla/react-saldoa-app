export const helpSteps = [
    {
        title: '1. Confira suas categorias',
        description:
            'Categorias organizam receitas e despesas. Confira as existentes ou crie uma que faça sentido para você.',
        href: '/categories',
    },
    {
        title: '2. Registre uma movimentação',
        description:
            'Escolha receita ou despesa, informe valor, descrição, categoria e data. Para R$ 50,00, digite 5000 no campo de valor.',
        href: '/transactions?create=1',
    },
    {
        title: '3. Acompanhe seu saldo',
        description:
            'Volte ao início para ver o resultado e escolha o mês que deseja acompanhar.',
        href: '/dashboard',
    },
] as const;

export const helpTopics = [
    {
        title: 'Saldo geral',
        description:
            'Receitas menos despesas registradas de todos os períodos. O saldo do mês considera apenas o mês selecionado. Previsões da agenda ficam fora desses saldos.',
        href: '/dashboard',
    },
    {
        title: 'Limites mensais',
        description:
            'Defina quanto pretende gastar por categoria de despesa. O limite continua nos próximos meses até ser alterado ou excluído; o gasto é calculado para cada mês.',
        href: '/budgets',
    },
    {
        title: 'Recorrências e agenda',
        description:
            'Recorrências geram lançamentos nas datas previstas. A agenda mostra a próxima ocorrência de cada regra no mês selecionado. O valor só entra no saldo quando o lançamento é gerado.',
        href: '/recurring',
    },
] as const;
