# Estado do projeto

Projeto: app de controle financeiro pessoal (portfólio). Laravel + React (Inertia, TypeScript), SQLite, Tailwind e shadcn/ui, toasts com Sonner. Textos da interface em português, código em inglês.

## Concluído
- Autenticação, categorias, lançamentos (CRUD com Policy e Form Requests), filtros por URL, dashboard com cards e gráficos, seeder de demonstração, README inicial.
- Redesign visual completo (tema escuro padrão, laranja #FF8500 só para ações e navegação, verde/vermelho só para receita/despesa, tokens no tema, fontes Space Grotesk e DM Sans), incluindo página inicial e telas de autenticação.
- Variação mensal nos cards do dashboard.
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
- (nenhum)

## Próximos passos (ordem)
1. Conta de demonstração com 1 clique (só com variável de ambiente)
2. Exportar CSV
3. CI com GitHub Actions
4. Revisões de segurança, acessibilidade e desempenho
5. Lançamentos recorrentes
6. Prints, GIF, README final e deploy

## Regras de trabalho
- Passos pequenos; explicar em linguagem simples (estou aprendendo).
- Mostrar o plano e esperar meu OK antes de codar.
- Sem bibliotecas novas sem perguntar.
- Sem cores fixas: usar os tokens do tema.
- Rodar os comandos de verificação do AGENTS.md (testes, lint, tipos) ao final.
