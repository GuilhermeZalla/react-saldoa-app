const icons = window.SaldoaIcons;
const icon = (name) => icons[name] || icons.CircleCheck;
const params = new URLSearchParams(location.search);
const state = {
    screen: ['dashboard', 'transactions', 'planning'].includes(
        params.get('screen'),
    )
        ? params.get('screen')
        : 'dashboard',
    theme: params.get('theme') === 'light' ? 'light' : 'dark',
    month: '2026-11',
    filter: 'all',
    search: '',
    hidden: false,
    planningTab: 'all',
};
const page = document.getElementById('page');
const currency = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});
const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
});
const entries = [
    {
        id: 1,
        description: 'Salário',
        category: 'Trabalho',
        date: '2026-11-01',
        amount: 6800,
        type: 'income',
        icon: 'BriefcaseBusiness',
    },
    {
        id: 2,
        description: 'Aluguel',
        category: 'Moradia',
        date: '2026-11-02',
        amount: 800,
        type: 'expense',
        icon: 'Home',
    },
    {
        id: 3,
        description: 'Compras no mercado',
        category: 'Alimentação',
        date: '2026-11-03',
        amount: 850,
        type: 'expense',
        icon: 'ShoppingBag',
    },
    {
        id: 4,
        description: 'Restaurantes',
        category: 'Alimentação',
        date: '2026-11-04',
        amount: 550,
        type: 'expense',
        icon: 'Utensils',
    },
    {
        id: 5,
        description: 'Transporte do mês',
        category: 'Transporte',
        date: '2026-11-04',
        amount: 500,
        type: 'expense',
        icon: 'Bus',
    },
    {
        id: 6,
        description: 'Compras pessoais',
        category: 'Outros',
        date: '2026-11-05',
        amount: 280,
        type: 'expense',
        icon: 'ShoppingBag',
    },
];
const budgetFixtures = [
    { name: 'Alimentação', icon: 'Utensils', limit: 1600, spent: 1400 },
    { name: 'Moradia', icon: 'Home', limit: 1200, spent: 800 },
    { name: 'Transporte', icon: 'Bus', limit: 700, spent: 500 },
];
const bills = [
    {
        name: 'Internet',
        category: 'Moradia',
        day: '08',
        amount: 120,
        type: 'expense',
    },
    {
        name: 'Energia elétrica',
        category: 'Moradia',
        day: '10',
        amount: 184,
        type: 'expense',
    },
    {
        name: 'Projeto freelance',
        category: 'Trabalho',
        day: '12',
        amount: 850,
        type: 'income',
    },
];
const escapeHtml = (value) =>
    String(value).replace(
        /[&<>"']/g,
        (char) =>
            ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
            })[char],
    );
const money = (amount, signed = false) => {
    const value = signed
        ? `${amount < 0 ? '− ' : '+ '}${currency.format(Math.abs(amount))}`
        : currency.format(amount);
    return `<span data-money="${escapeHtml(value)}">${state.hidden ? '••••' : value}</span>`;
};
const monthLabel = () =>
    new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' })
        .format(new Date(`${state.month}-01T12:00:00`))
        .replace(' de ', ' ');
const period = () =>
    `<div class="period" aria-label="Período selecionado"><button class="icon-button" data-month="-1" aria-label="Mês anterior">${icon('ChevronLeft')}</button><span class="period-label">${monthLabel()}</span><button class="icon-button" data-month="1" aria-label="Próximo mês">${icon('ChevronRight')}</button></div>`;
const button = (label, attrs = '', glyph = 'Plus', primary = true) =>
    `<button class="button ${primary ? 'primary' : ''}" ${attrs}>${icon(glyph)}${label}</button>`;
const monthEntries = () =>
    entries.filter((entry) => entry.date.startsWith(state.month));
const sortedEntries = () =>
    [...monthEntries()].sort(
        (a, b) => b.date.localeCompare(a.date) || b.id - a.id,
    );
const totals = () =>
    monthEntries().reduce(
        (summary, entry) => {
            summary[entry.type] += entry.amount;
            return summary;
        },
        { income: 0, expense: 0 },
    );
function fillIcons(root = document) {
    root.querySelectorAll('[data-icon]').forEach((item) => {
        item.outerHTML = icon(item.dataset.icon);
    });
}
function head(
    title,
    subtitle,
    eyebrow = 'SEU RESUMO FINANCEIRO',
    actions = '',
) {
    return `<header class="page-head"><div><span class="eyebrow">${eyebrow}</span><div class="title-line"><h1>${title}</h1>${state.screen === 'dashboard' ? `<button class="icon-button privacy-toggle mobile-only" aria-label="${state.hidden ? 'Mostrar' : 'Ocultar'} valores">${icon(state.hidden ? 'EyeOff' : 'Eye')}</button>` : ''}</div><p>${subtitle}</p></div><div class="head-actions">${period()}${actions}</div><button class="avatar mobile-avatar" data-more aria-label="Minha conta">MS</button></header>`;
}
function chart() {
    if (state.month !== '2026-11')
        return empty(
            'Sem histórico neste período',
            'Escolha novembro para explorar os dados da proposta.',
        );
    const values = [
        [5100, 2300],
        [5600, 2700],
        [5900, 2400],
        [6000, 3200],
        [6200, 3100],
        [6800, 2980],
    ];
    return `<svg class="chart" viewBox="0 0 520 168" role="img" aria-label="Receitas e despesas entre junho e novembro de 2026">${[8000, 4000, 0].map((value) => `<line x1="35" y1="${132 - value / 65}" x2="510" y2="${132 - value / 65}"/><text x="0" y="${135 - value / 65}">${value / 1000} mil</text>`).join('')}${values
        .map(([income, expense], i) => {
            const x = 58 + i * 76;
            return `<rect class="bar-income" x="${x}" y="${132 - income / 65}" width="19" height="${income / 65}" rx="4"/><rect class="bar-expense" x="${x + 24}" y="${132 - expense / 65}" width="19" height="${expense / 65}" rx="4"/><text x="${x + 21}" y="156" text-anchor="middle">${['Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov'][i]}</text>`;
        })
        .join('')}</svg>`;
}
function txRow(entry) {
    return `<div class="tx-row"><span class="category-icon">${icon(entry.icon)}</span><div class="row-copy"><strong>${escapeHtml(entry.description)}</strong><small>${escapeHtml(entry.category)}</small></div><div class="row-value"><strong class="${entry.type}">${money(entry.type === 'expense' ? -entry.amount : entry.amount, true)}</strong><small>${dateFormatter.format(new Date(entry.date + 'T12:00:00'))}</small></div></div>`;
}
function billRows() {
    return state.month === '2026-11'
        ? bills
              .map(
                  (bill) =>
                      `<div class="upcoming-row"><div class="date-badge"><strong>${bill.day}</strong><small>NOV</small></div><div class="row-copy"><strong>${bill.name}</strong><small>${bill.category} · ${bill.type === 'expense' ? 'A pagar' : 'A receber'}</small></div><span class="subtle-tag desktop-only">Agendado</span><div class="row-value"><strong class="${bill.type}">${money(bill.type === 'expense' ? -bill.amount : bill.amount, true)}</strong></div></div>`,
              )
              .join('')
        : empty('Nada agendado', 'Os próximos vencimentos aparecerão aqui.');
}
function budgetRow(budget, detailed = false) {
    const percentage = (budget.spent / budget.limit) * 100;
    const warning = percentage >= 80;
    return `<div class="budget-row"><div class="budget-label"><span class="category-icon">${icon(budget.icon)}</span><div><strong>${budget.name}</strong>${!detailed ? `<small>Limite de ${money(budget.limit)}</small>` : ''}</div><span class="percent ${warning ? 'warning' : ''}">${percentage.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%</span></div>${detailed ? `<div class="budget-amount">${money(budget.spent)}</div><p class="section-note">de ${money(budget.limit)} no mês</p>` : ''}<div class="progress ${warning ? 'warn' : ''}" style="--progress:${percentage}%"><span></span></div><div class="budget-foot"><span>${detailed ? 'Ainda disponível' : `Gasto: ${money(budget.spent)}`}</span><span>${detailed ? money(budget.limit - budget.spent) : `Restam ${money(budget.limit - budget.spent)}`}</span></div>${detailed && warning ? `<span class="warning-note">${icon('TriangleAlert')}Próximo do limite mensal</span>` : ''}</div>`;
}
function empty(title, text) {
    return `<div class="empty">${icon('CalendarDays')}<strong>${title}</strong><p>${text}</p>${state.month !== '2026-11' ? '<button class="text-button" data-reset-month>Voltar a novembro</button>' : ''}</div>`;
}
function dashboard() {
    const summary = totals();
    const balance = summary.income - summary.expense;
    return `${head('Olá, Marina', 'Um olhar claro para o seu dinheiro.', 'QUINTA-FEIRA, 5 DE NOVEMBRO', button('Novo lançamento', 'data-new'))}<div class="mobile-period-row mobile-only">${period()}<button class="text-button" data-new>${icon('Plus')}Novo lançamento</button></div><section class="metrics" aria-label="Resumo financeiro"><article class="card metric balance"><div class="metric-top"><span>Saldo geral</span>${icon('Wallet')}</div><strong class="money">${money(12840)}</strong><small><span class="desktop-only">Receitas e despesas de todos os períodos</span><span class="mobile-only">Todos os períodos</span></small><div class="balance-month mobile-only">Saldo do mês<strong>${money(balance)}</strong></div></article><article class="card metric"><div class="metric-top"><span class="income">${icon('ArrowDownLeft')}</span>Receitas do mês</div><strong class="money income">${money(summary.income)}</strong><small>Entradas em ${monthLabel()}</small></article><article class="card metric"><div class="metric-top"><span class="expense">${icon('ArrowUpRight')}</span>Despesas do mês</div><strong class="money expense">${money(summary.expense)}</strong><small>Saídas em ${monthLabel()}</small></article><article class="card metric monthly-balance"><div class="metric-top">${icon('ChartNoAxesCombined')}Saldo do mês</div><strong class="money">${money(balance)}</strong><small>Resultado do período selecionado</small></article></section><div class="grid-main"><section class="card chart-card"><div class="card-head"><div><h2>Seu dinheiro ao longo do tempo</h2><p>Receitas e despesas · últimos seis meses</p></div><div class="legend"><span><i class="dot"></i>Receitas</span><span><i class="dot red"></i>Despesas</span></div></div>${chart()}</section><section class="card upcoming-card"><div class="card-head"><div><h2>Próximos vencimentos</h2><p>O que vem pela frente neste mês</p></div><button class="text-button" data-screen="planning">Ver todos ${icon('ChevronRight')}</button></div>${billRows()}</section></div><div class="grid-main"><section class="card"><div class="card-head"><div><h2>Limites de gastos</h2><p>Acompanhe o espaço no seu orçamento</p></div><button class="text-button" data-screen="planning">Planejar ${icon('ChevronRight')}</button></div>${state.month === '2026-11' ? budgetFixtures.map((b) => budgetRow(b)).join('') : empty('Sem limites neste período', 'Defina valores para acompanhar seus gastos.')}</section><section class="card compact-transactions"><div class="card-head"><div><h2>Últimos lançamentos</h2><p>Seu histórico mais recente</p></div><button class="text-button" data-screen="transactions">Ver todos ${icon('ChevronRight')}</button></div>${sortedEntries().slice(0, 4).map(txRow).join('') || empty('Nenhum lançamento', 'As movimentações aparecerão aqui.')}</section></div>`;
}
function transactions() {
    const summary = totals();
    return `${head('Lançamentos', 'Cada movimentação, no seu lugar.', 'SEU DIA A DIA', button('Novo lançamento', 'data-new'))}<div class="mobile-period-row mobile-only">${period()}<button class="text-button" data-new>${icon('Plus')}Novo</button></div><section class="metrics desktop-only"><article class="card metric"><div class="metric-top">Movimentações no mês</div><strong class="money">${monthEntries().length}</strong><small>Registros no período selecionado</small></article><article class="card metric"><div class="metric-top">Receitas do mês</div><strong class="money income">${money(summary.income)}</strong><small>Entradas registradas</small></article><article class="card metric"><div class="metric-top">Despesas do mês</div><strong class="money expense">${money(summary.expense)}</strong><small>Saídas registradas</small></article><article class="card metric"><div class="metric-top">Saldo do mês</div><strong class="money">${money(summary.income - summary.expense)}</strong><small>Receitas menos despesas</small></article></section><div class="filter-panel"><label class="search">${icon('Search')}<input id="transaction-search" type="search" aria-label="Buscar lançamentos" placeholder="Buscar descrição ou categoria" value="${escapeHtml(state.search)}"></label><div class="chips" aria-label="Tipo de lançamento">${[
        ['all', 'Todos'],
        ['income', 'Receitas'],
        ['expense', 'Despesas'],
    ]
        .map(
            ([value, label]) =>
                `<button class="chip ${state.filter === value ? 'active' : ''}" data-filter="${value}" aria-pressed="${state.filter === value}">${label}</button>`,
        )
        .join(
            '',
        )}</div>${button('Exportar', 'data-export', 'Download', false)}</div><div id="transaction-results"></div>`;
}
function renderTransactionResults() {
    const query = state.search.toLocaleLowerCase('pt-BR');
    const results = sortedEntries().filter(
        (entry) =>
            (state.filter === 'all' || entry.type === state.filter) &&
            `${entry.description} ${entry.category}`
                .toLocaleLowerCase('pt-BR')
                .includes(query),
    );
    const node = document.getElementById('transaction-results');
    if (!node) return;
    if (!results.length) {
        node.innerHTML = `<section class="card">${empty('Nenhum lançamento encontrado', 'Experimente outro período, tipo ou descrição.')}<div style="text-align:center"><button class="text-button" data-clear-filters>Limpar filtros</button></div></section>`;
        return;
    }
    const groups = Object.groupBy(results, (entry) => entry.date);
    node.innerHTML = `<section class="card table-card"><div class="table-meta"><strong>Histórico do período</strong><small>${results.length} lançamentos</small></div><table><thead><tr><th>Descrição</th><th>Categoria</th><th>Data</th><th>Tipo</th><th style="text-align:right">Valor</th></tr></thead><tbody>${results.map((entry) => `<tr><td class="description-cell"><span class="category-icon">${icon(entry.icon)}</span><strong>${escapeHtml(entry.description)}</strong></td><td>${escapeHtml(entry.category)}</td><td>${dateFormatter.format(new Date(entry.date + 'T12:00:00'))}</td><td><span class="subtle-tag">${entry.type === 'income' ? 'Receita' : 'Despesa'}</span></td><td class="money-cell ${entry.type}">${money(entry.type === 'expense' ? -entry.amount : entry.amount, true)}</td></tr>`).join('')}</tbody></table><div class="table-footer"><span>${results.length} registros · novembro de 2026</span><span>Todos os lançamentos do período</span></div></section><section class="mobile-transactions"><div class="transaction-summary"><span>Histórico do mês</span><span>${results.length} lançamentos</span></div>${Object.entries(
        groups,
    )
        .map(
            ([date, items]) =>
                `<div class="group-label">${date === '2026-11-05' ? 'Hoje' : date === '2026-11-04' ? 'Ontem' : new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' }).format(new Date(date + 'T12:00:00'))}</div>${items.map(txRow).join('')}`,
        )
        .join('')}</section>`;
}
function planning() {
    return `${head('Planejamento', 'Organize o mês e enxergue o que vem depois.', 'SEUS PRÓXIMOS PASSOS', button('Novo limite', 'data-limit'))}<div class="mobile-period-row mobile-only">${period()}<button class="text-button" data-limit>${icon('Plus')}Novo limite</button></div><section class="planning-summary"><article class="card"><div class="metric-top">Orçamento do mês</div><strong class="money">${money(state.month === '2026-11' ? 3500 : 0)}</strong><small>${state.month === '2026-11' ? 'Limites de 3 categorias' : 'Nenhum limite neste período'}</small></article><article class="card"><div class="metric-top">Espaço no orçamento</div><strong class="money">${money(state.month === '2026-11' ? 800 : 0)}</strong><small>Disponível nas categorias com limite</small></article><article class="card"><div class="metric-top">Próximos compromissos</div><strong class="money">${state.month === '2026-11' ? 3 : 0}</strong><small>A pagar e a receber neste mês</small></article></section><div class="planning-tabs" aria-label="Seções do planejamento">${[
        ['all', 'Visão geral'],
        ['limits', 'Limites'],
        ['bills', 'Vencimentos'],
    ]
        .map(
            ([value, label]) =>
                `<button class="${state.planningTab === value ? 'active' : ''}" data-planning-tab="${value}" aria-pressed="${state.planningTab === value}">${label}</button>`,
        )
        .join(
            '',
        )}</div><div class="planning-content ${state.planningTab === 'bills' ? 'planning-bills-only' : state.planningTab === 'limits' ? 'planning-limits-only' : ''}"><div class="planning-budgets">${state.month === '2026-11' ? budgetFixtures.map((b) => `<section class="card">${budgetRow(b, true)}</section>`).join('') : `<section class="card">${empty('Sem limites neste mês', 'Seu planejamento aparecerá aqui.')}</section>`}</div><section class="card bills"><div class="bills-head"><div><h2>Agenda do mês</h2><p class="section-note">Compromissos previstos, separados do saldo realizado</p></div><span class="subtle-tag">${state.month === '2026-11' ? 3 : 0} previstos</span></div>${billRows()}</section><aside class="quiet-callout">${icon('Repeat2')}<div><strong>Deixe o que se repete organizado</strong><p>Suas recorrências ficam reunidas no planejamento.</p></div><button class="text-button" data-recurring>Ver recorrências ${icon('ChevronRight')}</button></aside></div>`;
}
function render() {
    document.documentElement.dataset.theme = state.theme;
    document.body.classList.toggle('shot', params.get('shot') === '1');
    document.body.classList.toggle('privacy-hidden', state.hidden);
    const navItems = [
        ['dashboard', 'House', 'Início'],
        ['transactions', 'ArrowDownUp', 'Lançamentos'],
        ['planning', 'CalendarDays', 'Planejamento'],
    ];
    document.getElementById('sidebar-nav').innerHTML =
        navItems
            .map(
                ([value, glyph, label]) =>
                    `<button class="nav-link ${state.screen === value ? 'active' : ''}" data-screen="${value}" ${state.screen === value ? 'aria-current="page"' : ''}>${icon(glyph)}${label}</button>`,
            )
            .join('') +
        `<button class="nav-link" data-more>${icon('Tags')}Categorias</button><button class="nav-link" data-recurring>${icon('Repeat2')}Recorrências</button>`;
    document.getElementById('mobile-nav').innerHTML =
        navItems
            .map(
                ([value, glyph, label]) =>
                    `<button class="${state.screen === value ? 'active' : ''}" data-screen="${value}" ${state.screen === value ? 'aria-current="page"' : ''}><span class="nav-icon">${icon(glyph)}</span><span>${label}</span></button>`,
            )
            .join('') +
        `<button data-more><span class="nav-icon">${icon('Ellipsis')}</span><span>Mais</span></button>`;
    document.getElementById('breadcrumb').textContent = {
        dashboard: 'Visão geral',
        transactions: 'Finanças / Lançamentos',
        planning: 'Finanças / Planejamento',
    }[state.screen];
    page.innerHTML = { dashboard, transactions, planning }[state.screen]();
    renderTransactionResults();
    fillIcons();
    document.querySelectorAll('.appbar .privacy-toggle').forEach((button) => {
        button.innerHTML = icon(state.hidden ? 'EyeOff' : 'Eye');
        button.setAttribute(
            'aria-label',
            state.hidden ? 'Mostrar valores' : 'Ocultar valores',
        );
    });
    const url = new URL(location.href);
    url.searchParams.set('screen', state.screen);
    url.searchParams.set('theme', state.theme);
    history.replaceState(null, '', url);
}
let toastTimeout;
function toast(text) {
    const node = document.getElementById('toast');
    node.textContent = text;
    node.hidden = false;
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => (node.hidden = true), 4000);
}
function closeDialogs() {
    document
        .querySelectorAll('dialog[open]')
        .forEach((dialog) => dialog.close());
}
function navigate(screen) {
    closeDialogs();
    state.screen = screen;
    render();
    document.querySelector('.scroll-area').scrollTop = 0;
}
document.addEventListener('click', (event) => {
    const target = event.target.closest('button');
    if (!target) return;
    if (target.dataset.screen) {
        navigate(target.dataset.screen);
        return;
    }
    if (
        target.classList.contains('theme-toggle') ||
        target.id === 'review-theme'
    ) {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        render();
        return;
    }
    if (target.classList.contains('privacy-toggle')) {
        state.hidden = !state.hidden;
        render();
        return;
    }
    if (target.hasAttribute('data-new')) {
        document.getElementById('entry-dialog').showModal();
        return;
    }
    if (target.hasAttribute('data-close')) {
        target.closest('dialog').close();
        return;
    }
    if (target.hasAttribute('data-more')) {
        document.getElementById('more-dialog').showModal();
        return;
    }
    if (target.hasAttribute('data-month')) {
        const date = new Date(`${state.month}-01T12:00:00`);
        date.setMonth(date.getMonth() + Number(target.dataset.month));
        state.month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        render();
        return;
    }
    if (target.hasAttribute('data-reset-month')) {
        state.month = '2026-11';
        render();
        return;
    }
    if (target.hasAttribute('data-filter')) {
        state.filter = target.dataset.filter;
        document.querySelectorAll('[data-filter]').forEach((button) => {
            button.classList.toggle(
                'active',
                button.dataset.filter === state.filter,
            );
            button.setAttribute(
                'aria-pressed',
                String(button.dataset.filter === state.filter),
            );
        });
        renderTransactionResults();
        return;
    }
    if (target.hasAttribute('data-clear-filters')) {
        state.search = '';
        state.filter = 'all';
        render();
        return;
    }
    if (target.hasAttribute('data-planning-tab')) {
        state.planningTab = target.dataset.planningTab;
        render();
        return;
    }
    if (target.hasAttribute('data-export')) {
        toast(
            'Prévia visual: a exportação existente será preservada na implementação.',
        );
        return;
    }
    if (target.hasAttribute('data-limit')) {
        toast(
            'Prévia visual: o cadastro de limites será adaptado após a aprovação.',
        );
        return;
    }
    if (target.hasAttribute('data-recurring')) {
        navigate('planning');
        toast('As recorrências existentes serão integradas a esta área.');
    }
});
document.addEventListener('input', (event) => {
    if (event.target.id === 'transaction-search') {
        state.search = event.target.value;
        renderTransactionResults();
    }
});
document.getElementById('entry-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const values = new FormData(event.target);
    const rawAmount = values.get('amount');
    const amount =
        typeof rawAmount === 'string'
            ? Number(rawAmount.replace(',', '.'))
            : NaN;
    if (!(amount > 0)) {
        toast('Informe um valor maior que zero.');
        return;
    }
    entries.push({
        id: Date.now(),
        description: values.get('description'),
        category: values.get('category'),
        date: values.get('date'),
        amount,
        type: values.get('type'),
        icon:
            values.get('type') === 'income'
                ? 'BriefcaseBusiness'
                : 'ShoppingBag',
    });
    closeDialogs();
    navigate('transactions');
    toast(
        'Adicionado apenas à prévia; recarregar a página restaura os exemplos.',
    );
    event.target.reset();
});
render();
