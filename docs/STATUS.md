# Estado do projeto

Projeto: app de controle financeiro pessoal (portfólio). Laravel + React (Inertia, TypeScript), SQLite, Tailwind e shadcn/ui, toasts com Sonner. Textos da interface em português, código em inglês.

## Atualização — cliente mobile

- A API Sanctum e o isolamento da demonstração foram implementados e documentados; o aplicativo web continua autenticado por sessão/Fortify.
- O cliente Expo/React Native em `mobile/` usa Expo Router e SecureStore. Inclui cadastro/login, recuperação via site, opção “Experimentar demo”, dashboard, lançamentos, categorias, metas, recorrências, exportação, logout e exclusão de conta.
- A sessão armazena o token e a URL da instância correspondente. A demo fica em somente leitura no cliente e o backend também bloqueia suas mutações.
- Verificações atuais do cliente: TypeScript, Expo lint, checagem de compatibilidade das dependências Expo, Expo Doctor e exportação do bundle Android passaram.
- A suíte Laravel passou com 153 testes aprovados e 2 ignorados.
- A primeira validação funcional em aparelho físico com Expo Go foi concluída. Também foi executado um smoke test ponta a ponta da API local (cadastro, categoria, lançamento, meta, recorrência, dashboard, listagem, exportações e exclusão; registros temporários removidos). Ainda falta revisar todos os fluxos visuais no aparelho e testar instâncias publicadas. Nenhum APK foi gerado: este ambiente ainda precisa de JDK e Android SDK para build local; o build EAS na nuvem não foi iniciado. Para distribuição também faltam URLs HTTPS, identificador/ícones definitivos, assinatura e publicação de política de privacidade e exclusão de conta.
- `npm audit` reporta avisos moderados de `glob`/`minimatch` na árvore do Expo/ESLint. O reparo forçado proposto pelo npm implicaria downgrade incompatível do Expo; nenhum downgrade foi aplicado.

## Concluído

- Autenticação, categorias, lançamentos (CRUD com Policy e Form Requests), filtros por URL, dashboard com cards e gráficos, seeder de demonstração, README inicial.
- Redesign visual completo (tema escuro padrão, laranja #FF8500 só para ações e navegação, verde/vermelho só para receita/despesa, tokens no tema, fontes Space Grotesk e DM Sans), incluindo página inicial e telas de autenticação.
- Variação mensal nos cards do dashboard.
- Conta de demonstração com acesso em um clique, protegida por limite de tentativas e bloqueio de alteração de perfil, senha e exclusão da conta enquanto estiver habilitada. As páginas de configurações mostram um aviso para a conta demo.
- CI com GitHub Actions configurado para rodar o setup e as verificações em pushes para `main` e em pull requests.
- Exportação CSV de lançamentos com os mesmos filtros da listagem, escopo por usuário e proteção contra fórmulas de planilha em campos exportados.
- Lançamentos recorrentes diários, semanais, mensais e anuais, com gestão de regras, geração agendada e prevenção de duplicidade.
- README revisado com instruções locais, recursos atuais e uma visão simples da organização do código.
- Revisão local de segurança, acessibilidade e desempenho feita junto às mudanças: autorização e isolamento por usuário, validação de dados, idempotência das recorrências, controles e erros associados a rótulos e agregações para reduzir consultas repetidas.
- Rosca de despesas clicável (leva à lista filtrada).
- Desfazer exclusão: soft delete em lançamentos, rota de restauração com Policy, toast "Desfazer" de 8s. Categorias: só lançamentos ativos bloqueiam a exclusão; ao excluir categoria, lançamentos excluídos dela são apagados de vez (forceDelete em DB::transaction). Testes passando (63).
- **Metas de gasto por categoria — completo:**
    - Backend: tabela `budgets` (id, user_id, category_id, amount decimal(12,2), timestamps, índice único user_id+category_id, cascadeOnDelete em category_id), model `Budget` com cast `decimal:2`, relações `user()`/`category()`, factory, `BudgetPolicy`, `StoreBudgetRequest`/`UpdateBudgetRequest` (valor > 0, categoria de despesa do usuário, unicidade), `BudgetController` (index/store/update/destroy com Inertia), rota `budgets` (resource com index/store/update/destroy), enum `BudgetStatus` (Ok/Warning/Exceeded com `fromPercentage()`), `BudgetSummaryService` (gasto, percentual sem arredondar e status por meta no mês, via Eloquent agregado sem N+1, ignorando soft-deleted).
    - Frontend: página `budgets/index.tsx` com listagem de metas, barra de progresso, diálogos de criar/editar/excluir, estados vazios, integração com Wayfinder, item "Metas" na sidebar (ícone Target). Token âmbar (`--warning`) no app.css (light #b45309, dark #f59e0b) exclusivo para estado de aviso das metas, exposto no tema do Tailwind como `text-warning` e `bg-warning`. Card "Metas do mês" no dashboard com alertas (warning/exceeded ordenados por percentual decrescente) ou mensagem discreta quando tudo está dentro das metas.
    - Seeder: usuário demo tem 4 metas (Alimentação, Lazer, Transporte, Saúde) ajustadas para exibir 1 de cada status no mês atual (ok, warning, exceeded).
    - Testes: 98 testes passando (9 novos), incluindo testes de feature para `BudgetController@index` e alertas no dashboard (`BudgetIndexTest`, `DashboardBudgetAlertsTest`).
    - Documentação: README atualizado (seção Metas nas funcionalidades, usuário demo inclui metas), AGENTS.md com diretriz de que âmbar é exclusivo para avisos de metas.
    - Decisões: metas calculam status por percentual sem arredondar (ok < 80%, warning 80-99%, exceeded ≥ 100%), só lançamentos ativos do mês atual contam, edição de meta altera apenas o valor (não a categoria), dashboard e tela de metas mostram somente o mês atual (sem navegação entre meses).

## Em andamento

- Validação manual do cliente Expo contra emulador/dispositivo e API; depende de endpoints configurados em `mobile/.env` e não substitui testes de um build assinado.
- Revisão do app publicado: depende de uma URL de produção e deve ser feita depois do deploy.

## Próximos passos

- Validar os fluxos web e API no emulador ou dispositivo, incluindo sessão expirada, demo somente leitura, exportação e exclusão.
- Definir o identificador Android final, ícones e URLs HTTPS da API principal, instância demo, site e política de privacidade.
- Configurar EAS e credenciais de assinatura, gerar um build interno e então preparar o teste fechado da Play Store.
- Publicar a aplicação e revisar segurança, acessibilidade e desempenho no ambiente real.
- Capturar telas atualizadas das funcionalidades que ainda não aparecem nos GIFs.

## Regras de trabalho

- Passos pequenos; explicar em linguagem simples (estou aprendendo).
- Mostrar o plano e esperar meu OK antes de codar.
- Sem bibliotecas novas sem perguntar.
- Sem cores fixas: usar os tokens do tema.
- Rodar os comandos de verificação do AGENTS.md (testes, lint, tipos) ao final.
