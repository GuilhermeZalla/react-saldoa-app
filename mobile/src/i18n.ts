export type Locale = 'pt-BR' | 'en';
let currentLocale: Locale = 'pt-BR';

export const english: Record<string, string> = {
    'Mostrar senha': 'Show password',
    'Ocultar senha': 'Hide password',
    'Recolher navegação': 'Collapse navigation',
    'Expandir navegação': 'Expand navigation',
    'A senha deve ter pelo menos 8 caracteres, contendo letras e números.':
        'Password must be at least 8 characters long, containing letters and numbers.',
    'Conta criada com sucesso!': 'Account created successfully!',
    'Seu Saldoa está pronto. Vamos organizar suas finanças, um passo de cada vez.':
        'Your Saldoa is ready. Let’s organize your finances, one step at a time.',
    'Começar a usar': 'Get started',
    'Não foi possível salvar a sessão. Tente novamente.':
        'Unable to save your session. Please try again.',
    'Como usar o Saldoa': 'How to use Saldoa',
    'Política de Privacidade': 'Privacy Policy',
    'Leia como seus dados são tratados.': 'Read how your data is handled.',
    'Primeiros passos e guia de uso.': 'Getting started and user guide.',
    'Seus primeiros passos': 'Your first steps',
    'Dispensar primeiros passos': 'Dismiss first steps',
    'Você pode dispensar estas dicas e consultar a ajuda na aba Mais.':
        'You can dismiss these tips and find help in the More tab.',
    'Comece com três passos. Consulte esta ajuda sempre que precisar.':
        'Start with three steps. Return to this help whenever you need it.',
    '1. Confira suas categorias': '1. Check your categories',
    '2. Registre uma movimentação': '2. Record a transaction',
    '3. Acompanhe seu saldo': '3. Track your balance',
    'Categorias organizam receitas e despesas. Confira as existentes ou crie uma que faça sentido para você.':
        'Categories organize income and expenses. Check the existing ones or create one that works for you.',
    'Escolha receita ou despesa, informe valor, descrição, categoria e data. Para R$ 50,00, digite 5000 no campo de valor.':
        'Choose income or expense, then enter the amount, description, category and date. For R$ 50,00, type 5000 in the amount field.',
    'Volte ao início para ver o resultado e escolha o mês que deseja acompanhar.':
        'Return to Home to see the result and choose the month you want to track.',
    'Receitas menos despesas registradas de todos os períodos. O saldo do mês considera apenas o mês selecionado. Previsões da agenda ficam fora desses saldos.':
        'Recorded income minus expenses across all periods. The monthly balance includes only the selected month. Schedule forecasts are excluded from both balances.',
    'Receitas menos despesas de todos os períodos, sem previsões da agenda.':
        'Income minus expenses across all periods, excluding schedule forecasts.',
    'Defina quanto pretende gastar por categoria de despesa. O limite continua nos próximos meses até ser alterado ou excluído; o gasto é calculado para cada mês.':
        'Set how much you plan to spend per expense category. The limit continues in future months until changed or deleted; spending is calculated for each month.',
    'Limites mensais': 'Monthly limits',
    'Recorrências e agenda': 'Recurring transactions and schedule',
    'Recorrências geram lançamentos nas datas previstas. A agenda mostra a próxima ocorrência de cada regra no mês selecionado. O valor só entra no saldo quando o lançamento é gerado.':
        'Recurring rules create transactions on their scheduled dates. The schedule shows the next occurrence of each rule in the selected month. Amounts affect your balance only when the transaction is generated.',
    'O limite continua nos próximos meses até ser alterado ou excluído. O gasto considera apenas o mês selecionado.':
        'The limit continues in future months until changed or deleted. Spending includes only the selected month.',
    'A agenda mostra previsões. O valor só entra no saldo quando o lançamento da recorrência é gerado.':
        'The schedule shows forecasts. An amount affects your balance only when its recurring transaction is generated.',
    'Defina um limite mensal para acompanhar os gastos de uma categoria de despesa.':
        'Set a monthly limit to track spending in an expense category.',
    'Crie uma categoria, como Moradia ou Salário, e escolha se ela organiza receitas ou despesas.':
        'Create a category, such as Housing or Salary, and choose whether it organizes income or expenses.',
    'Criar primeiro limite': 'Create your first limit',
    'Criar categoria de despesa': 'Create an expense category',
    'Criar primeira categoria': 'Create your first category',
    'Registrar movimentação': 'Record a transaction',
    'Guia completo em PDF': 'Complete PDF guide',
    'Guia no idioma do aplicativo, com capturas em português. Escolha uma pasta para salvar o PDF. É preciso internet para baixar; depois você pode ler offline.':
        'Guide in the app language, with screenshots in Portuguese. Choose a folder to save the PDF. Internet is needed to download; then you can read offline.',
    'Baixar guia em PDF': 'Download PDF guide',
    'Guia salvo com sucesso!': 'Guide saved successfully!',
    'O PDF está na pasta que você escolheu. Você pode abri-lo mesmo sem internet.':
        'The PDF is in the folder you chose. You can open it even without internet access.',
    'Não foi possível baixar o guia': 'Unable to download the guide',
    'Confira sua conexão e tente novamente. Se o problema continuar, tente mais tarde.':
        'Check your connection and try again. If the problem continues, try again later.',
    Abrir: 'Open',
    Despesas: 'Expenses',
    'Excluir lançamento': 'Delete transaction',
    Exportar: 'Export',
    Limite: 'Limit',
    Receitas: 'Income',
    Todos: 'All',

    Agenda: 'Schedule',
    'Agenda do mês': 'Monthly schedule',
    'Buscar descrição': 'Search description',
    'Buscar lançamentos': 'Search transactions',
    'Cada movimentação, no seu lugar.': 'Every transaction, in its place.',
    'Carregar mais': 'Load more',
    'Escala máxima: {amount}': 'Maximum scale: {amount}',
    'Espaço no orçamento': 'Budget remaining',
    'Ex.: compra no mercado': 'E.g. grocery shopping',
    Gasto: 'Spent',
    'Gerenciar recorrências': 'Manage recurring transactions',
    'Histórico do mês': 'Monthly history',
    'Informe um valor maior que zero.': 'Enter an amount greater than zero.',
    Limites: 'Limits',
    'Limites das categorias': 'Category limits',
    'Limites de gastos': 'Spending limits',
    'Limpar filtros': 'Clear filters',
    Mais: 'More',
    'Minha conta': 'My account',
    'Mês anterior': 'Previous month',
    'Nas categorias com limite': 'For budgeted categories',
    'Nenhum lançamento encontrado. Experimente outro mês ou filtro.':
        'No transactions found. Try another month or filter.',
    'Nenhuma recorrência prevista neste período.':
        'No recurring transactions expected in this period.',
    'No período selecionado': 'In the selected period',
    'Novo limite': 'New limit',
    'Organização, preferências e sua conta.':
        'Organization, preferences and your account.',
    'Organize o mês e enxergue o que vem depois.':
        'Plan your month and see what comes next.',
    'Organize o que se repete.': 'Organize repeating transactions.',
    'Organize suas receitas e despesas.': 'Organize your income and expenses.',
    'Orçamento do mês': 'Monthly budget',
    'Perfil, exportação e segurança.': 'Profile, exports and security.',
    Planejamento: 'Planning',
    Planejar: 'Plan',
    Previsto: 'Expected',
    'Próxima ocorrência de cada recorrência. Valores previstos, fora do saldo realizado.':
        'Next occurrence of each recurring transaction. Expected amounts are separate from your actual balance.',
    'Próximo mês': 'Next month',
    'Próximos lançamentos': 'Upcoming transactions',
    'Receitas e despesas dos últimos seis meses':
        'Income and expenses over the last six months',
    'Saldo do mês': 'Monthly balance',
    'Saldo geral': 'Overall balance',
    'Seu Saldoa': 'Your Saldoa',
    'Seu dia a dia': 'Your daily finances',
    'Seu dinheiro ao longo do tempo': 'Your money over time',
    'Seus próximos passos': 'Your next steps',
    'Todos os períodos': 'All periods',
    'Um olhar claro para o seu dinheiro.': 'A clear view of your money.',
    'Valor (R$)': 'Amount (BRL)',
    'Ver todos': 'View all',
    'Visão geral': 'Overview',
    'Últimos lançamentos': 'Recent transactions',
    'Mostrar valores': 'Show amounts',
    'Ocultar valores': 'Hide amounts',
    Fechar: 'Close',
    Novo: 'New',

    'A senha deve ter pelo menos {min} caracteres.':
        'Your password must contain at least {min} characters.',
    'A confirmação de senha não confere.':
        'The password confirmation does not match.',
    'A senha deve conter letras maiúsculas e minúsculas.':
        'Your password must contain uppercase and lowercase letters.',
    'A senha deve conter pelo menos uma letra.':
        'Your password must contain at least one letter.',
    'A senha deve conter pelo menos um número.':
        'Your password must contain at least one number.',
    'A senha deve conter pelo menos um símbolo.':
        'Your password must contain at least one symbol.',
    'Esta senha apareceu em um vazamento de dados. Escolha outra senha.':
        'This password appeared in a data breach. Choose another password.',
    'Use pelo menos 12 caracteres, com maiúsculas, minúsculas, números e símbolos.':
        'Use at least 12 characters, including uppercase and lowercase letters, numbers and symbols.',

    'Abrir preferências': 'Open preferences',
    'Fechar preferências': 'Close preferences',
    'Experimentar sem criar conta': 'Try without an account',
    'A recuperação de senha está indisponível no momento.':
        'Password recovery is currently unavailable.',
    'A demonstração está indisponível no momento.':
        'The demo is currently unavailable.',
    'O serviço está indisponível no momento. Tente novamente mais tarde.':
        'The service is currently unavailable. Please try again later.',
    'Abrir minha conta': 'Open my account',
    'Carregando resumo…': 'Loading overview…',
    'Ver todas': 'View all',
    'Do seu jeito': 'Make it yours',
    'Idioma e aparência': 'Language and appearance',
    'Seu perfil e suas finanças em JSON.': 'Your profile and finances in JSON.',
    'Seus lançamentos em uma planilha.': 'Your transactions in a spreadsheet.',
    'Sessão válida até': 'Session valid until',
    'Gerenciar a exclusão permanente dos seus dados.':
        'Manage the permanent deletion of your data.',
    'de {amount} no mês': 'of {amount} this month',
    'Acima do limite': 'Over budget',
    Disponível: 'Available',
    'Informe sua senha para confirmar a exclusão.':
        'Enter your password to confirm deletion.',
    'Excluir sua conta?': 'Delete your account?',
    'Essa ação é permanente. Seu perfil, lançamentos, categorias, metas e recorrências serão removidos.':
        'This action is permanent. Your profile, transactions, categories, budgets and recurring rules will be removed.',
    Cancelar: 'Cancel',
    'Excluir permanentemente': 'Delete permanently',
    Conta: 'Account',
    'Perfil e segurança da sua sessão.': 'Your profile and session security.',
    'Conta de demonstração em instância isolada':
        'Demo account on an isolated instance',
    'Token válido até': 'Token valid until',
    'Ambiente:': 'Environment:',
    Demonstração: 'Demo',
    Produção: 'Production',
    'Seus dados': 'Your data',
    'Compartilhe um arquivo JSON com seu perfil e dados financeiros.':
        'Share a JSON export of your profile and financial data.',
    'Exportação Saldoa': 'Saldoa export',
    'Exportar todos os dados': 'Export all data',
    'Lançamentos Saldoa': 'Saldoa transactions',
    'Exportar CSV do mês': 'Export monthly CSV',
    Segurança: 'Security',
    'Encerrar todas as sessões?': 'End all sessions?',
    'Todos os dispositivos serão desconectados.':
        'All devices will be signed out.',
    'Encerrar sessões': 'End sessions',
    'Encerrar sessões em outros dispositivos': 'Sign out on other devices',
    'Sair desta conta': 'Sign out',
    'Excluir conta': 'Delete account',
    'A exclusão remove permanentemente sua conta e os dados associados. Também é possível solicitar pelo site, sem o app.':
        'Deletion permanently removes your account and associated data. You can also request it on the website without the app.',
    'Confirme sua senha': 'Confirm your password',
    'Senha atual': 'Current password',
    'Excluir minha conta': 'Delete my account',
    'Não foi possível concluir a solicitação.':
        'Could not complete the request.',
    'Configure EXPO_PUBLIC_WEB_URL para abrir a recuperação de senha.':
        'Set EXPO_PUBLIC_WEB_URL to open password recovery.',
    'Não foi possível abrir o site': 'Could not open the website',
    'Tente novamente mais tarde.': 'Please try again later.',
    'Configure EXPO_PUBLIC_API_URL_DEMO para conectar à demonstração.':
        'Set EXPO_PUBLIC_API_URL_DEMO to connect to the demo.',
    'Configure EXPO_PUBLIC_API_URL para conectar à API.':
        'Set EXPO_PUBLIC_API_URL to connect to the API.',
    'Ocorreu um erro ao entrar. Tente novamente.':
        'Could not sign in. Please try again.',
    'Suas finanças, com mais clareza.': 'A clearer view of your finances.',
    'Bem-vindo de volta': 'Welcome back',
    'Criar conta': 'Create account',
    'Entre para acompanhar seu dinheiro.':
        'Sign in to keep track of your money.',
    'Organize suas finanças em um só lugar.':
        'Organize your finances in one place.',
    Nome: 'Name',
    'Seu nome': 'Your name',
    'E-mail': 'Email',
    Senha: 'Password',
    'Sua senha': 'Your password',
    'Confirmar senha': 'Confirm password',
    'Repita sua senha': 'Repeat your password',
    Entrar: 'Sign in',
    'Criar minha conta': 'Create my account',
    'Ainda não tenho uma conta': 'Create an account',
    'Já tenho uma conta': 'I already have an account',
    'Conheça o Saldoa': 'Meet Saldoa',
    'Explore uma demonstração isolada com dados de exemplo. Ela usa uma API diferente da produção.':
        'Explore an isolated demo with sample data. It uses a separate API from production.',
    'Experimentar demo': 'Try demo',
    'Instância de demonstração configurada': 'Demo instance configured',
    'Configure EXPO_PUBLIC_API_URL_DEMO para ativar':
        'Set EXPO_PUBLIC_API_URL_DEMO to enable',
    'Esqueci minha senha': 'Forgot password',
    'Configure EXPO_PUBLIC_API_URL para desenvolvimento':
        'Set EXPO_PUBLIC_API_URL for development',
    'Informe o valor da meta e selecione uma categoria.':
        'Enter a budget amount and select a category.',
    'Excluir meta?': 'Delete budget?',
    Excluir: 'Delete',
    Metas: 'Budgets',
    'Acompanhe seus limites de gastos do mês.':
        'Keep track of your monthly spending limits.',
    'Nova meta': 'New budget',
    'Editar meta': 'Edit budget',
    Categoria: 'Category',
    Categorias: 'Categories',
    'Limite mensal': 'Monthly limit',
    'Salvar meta': 'Save budget',
    'Cancelar edição': 'Cancel editing',
    'Metas deste mês': 'This month’s budgets',
    'Carregando metas…': 'Loading budgets…',
    'Nenhuma meta cadastrada para este mês.': 'No budgets for this month.',
    '% utilizado': '% used',
    Editar: 'Edit',
    'Informe o nome da categoria.': 'Enter a category name.',
    'Excluir categoria?': 'Delete category?',
    'A categoria está em uso. Primeiro remova ou mova os lançamentos e recorrências associados.':
        'This category is in use. First remove or move its transactions and recurring rules.',
    'Organize receitas e despesas por tipo.':
        'Organize income and expenses by type.',
    'Nova categoria': 'New category',
    'Ex.: Moradia': 'E.g. Housing',
    Despesa: 'Expense',
    Receita: 'Income',
    'Adicionar categoria': 'Add category',
    'Suas categorias': 'Your categories',
    'Carregando categorias…': 'Loading categories…',
    'Nenhuma categoria cadastrada.': 'No categories yet.',
    'Não é possível excluir uma categoria que ainda possui lançamentos ou recorrências.':
        'A category with transactions or recurring rules cannot be deleted.',
    'Não foi possível carregar o resumo.': 'Could not load the summary.',
    'Seu resumo financeiro': 'Your financial summary',
    'Modo demonstração · somente leitura': 'Demo mode · read only',
    'Tentar novamente': 'Try again',
    'Saldo total': 'Total balance',
    'Saldo de todos os períodos': 'Balance across all periods',
    'Receitas no mês': 'Monthly income',
    'Despesas no mês': 'Monthly expenses',
    'Despesas por categoria': 'Expenses by category',
    'Ainda não há despesas neste mês.': 'No expenses this month yet.',
    'Movimentações recentes': 'Recent transactions',
    'Seus lançamentos aparecerão aqui.': 'Your transactions will appear here.',
    'Atenção às metas': 'Budget alerts',
    '% do limite mensal': '% of the monthly limit',
    Diária: 'Daily',
    Semanal: 'Weekly',
    Mensal: 'Monthly',
    Anual: 'Yearly',
    'Preencha a descrição, o valor e a categoria.':
        'Enter a description, amount and category.',
    'Excluir recorrência?': 'Delete recurring rule?',
    Recorrências: 'Recurring',
    'Acompanhe lançamentos que se repetem.':
        'Keep track of repeating transactions.',
    'Nova recorrência': 'New recurring rule',
    'Ex.: Mensalidade': 'E.g. Subscription',
    Descrição: 'Description',
    Valor: 'Amount',
    'Crie uma categoria desse tipo antes de continuar.':
        'Create a category of this type before continuing.',
    Frequência: 'Frequency',
    'Data de início (AAAA-MM-DD)': 'Start date (YYYY-MM-DD)',
    'Criar recorrência': 'Create recurring rule',
    'Regras cadastradas': 'Recurring rules',
    'Carregando recorrências…': 'Loading recurring rules…',
    'Próxima:': 'Next:',
    'não agendada': 'not scheduled',
    'Nenhuma recorrência cadastrada.': 'No recurring rules yet.',
    'Não foi possível carregar os lançamentos.': 'Could not load transactions.',
    'Informe uma data válida no formato DD/MM/AAAA.':
        'Enter a valid date in DD/MM/YYYY format.',
    'Não foi possível salvar o lançamento.': 'Could not save the transaction.',
    'Excluir lançamento?': 'Delete transaction?',
    'Não foi possível excluir o lançamento.':
        'Could not delete the transaction.',
    Lançamentos: 'Transactions',
    'Receitas e despesas do mês atual.':
        'Income and expenses for the current month.',
    'Novo lançamento': 'New transaction',
    'Editar lançamento': 'Edit transaction',
    'Ex.: Conta de luz': 'E.g. Electricity bill',
    'Crie uma categoria desse tipo antes de adicionar um lançamento.':
        'Create a category of this type before adding a transaction.',
    'Data (DD/MM/AAAA)': 'Date (DD/MM/YYYY)',
    'DD/MM/AAAA': 'DD/MM/YYYY',
    'Adicionar lançamento': 'Add transaction',
    'Salvar alterações': 'Save changes',
    'Este mês': 'This month',
    'Carregando lançamentos…': 'Loading transactions…',
    'Não há lançamentos neste período.': 'No transactions in this period.',
    'Não foi possível restaurar a sessão': 'Could not restore your session',
    'Tente entrar novamente.': 'Please sign in again.',
    'Sessão encerrada neste dispositivo': 'Signed out on this device',
    'A API não confirmou a revogação. A sessão salva localmente foi removida.':
        'The API did not confirm revocation. The local session was removed.',
    'Conta excluída': 'Account deleted',
    'Sua conta e seus dados foram removidos.':
        'Your account and data have been removed.',
    'A API não respondeu em 15 segundos. Verifique se o servidor está ativo e acessível pelo celular.':
        'The API did not respond within 15 seconds. Check that the server is running and reachable from your phone.',
    'Não foi possível conectar à API. Verifique a URL e sua conexão.':
        'Could not connect to the API. Check the URL and your connection.',
    'Sua sessão expirou. Entre novamente.':
        'Your session has expired. Please sign in again.',
    'Não foi possível conectar à API. Verifique sua conexão.':
        'Could not connect to the API. Check your connection.',
    'Não foi possível exportar os dados.': 'Could not export the data.',
    'Não foi possível ler a sessão salva.': 'Could not read the saved session.',
    Início: 'Home',
    'Lanç.': 'Trans.',
    'Recorr.': 'Repeat',
    'Carregando Saldoa…': 'Loading Saldoa…',
    Preferências: 'Preferences',
    Finanças: 'Finances',
    'Conta e ajuda': 'Account and help',
    Idioma: 'Language',
    Aparência: 'Appearance',
    Claro: 'Light',
    Escuro: 'Dark',
    Sistema: 'System',
    'As preferências são salvas neste aparelho.':
        'Preferences are saved on this device.',
    'Não foi possível salvar as preferências. Elas serão mantidas apenas nesta sessão.':
        'Could not save preferences. They will only apply to this session.',
    'Olá, {name}': 'Hello, {name}',
    '“{description}” será movido para a lixeira.':
        '“{description}” will be moved to the trash.',
    'A regra “{description}” será removida. Os lançamentos já criados permanecem.':
        'The rule “{description}” will be removed. Existing transactions will remain.',
    'A meta de “{name}” será removida.':
        'The budget for “{name}” will be removed.',
    'A categoria “{name}” será removida.':
        'The category “{name}” will be removed.',
    'API principal: {host}': 'Main API: {host}',
    'Data de início (DD/MM/AAAA)': 'Start date (DD/MM/YYYY)',
    'E-mail ou senha incorretos.': 'Incorrect email or password.',
    'Você não tem permissão para esta ação.':
        'You do not have permission to perform this action.',
    'O recurso solicitado não está disponível.':
        'The requested resource is unavailable.',
    'Muitas tentativas. Aguarde um momento e tente novamente.':
        'Too many attempts. Wait a moment and try again.',
    'O servidor encontrou um problema. Tente novamente mais tarde.':
        'The server encountered a problem. Please try again later.',
    'Verifique os dados informados em: {fields}.':
        'Check the information entered for: {fields}.',
    'Verifique os dados informados.': 'Check the information you entered.',
    Data: 'Date',
    'Data de início': 'Start date',
    '{count} lançamentos': '{count} transactions',
};

export function setLocale(locale: Locale): void {
    currentLocale = locale;
}

export function getLocale(): Locale {
    return currentLocale;
}

export function t(
    message: string,
    values: Record<string, string | number> = {},
): string {
    const translated =
        currentLocale === 'en' ? (english[message] ?? message) : message;
    return translated.replace(/\{(\w+)\}/g, (match, key: string) =>
        String(values[key] ?? match),
    );
}
