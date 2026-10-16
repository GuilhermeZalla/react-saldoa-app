Crie o arquivo docs/STATUS.md com o estado atual do projeto (caso não exista), e atualize-o ao final de CADA tarefa (o que foi feito, o que falta, decisões tomadas). Conteúdo inicial:

# Estado do projeto

Projeto: app de controle financeiro pessoal (portfólio). Laravel + React (Inertia, TypeScript), SQLite, Tailwind e shadcn/ui, toasts com Sonner. Textos da interface em português, código em inglês.

## Concluído
- Autenticação, categorias, lançamentos (CRUD com Policy e Form Requests), filtros por URL, dashboard com cards e gráficos, seeder de demonstração, README inicial.
- Redesign visual completo (tema escuro padrão, laranja #FF8500 só para ações e navegação, verde/vermelho só para receita/despesa, tokens no tema, fontes Space Grotesk e DM Sans), incluindo página inicial e telas de autenticação.
- Variação mensal nos cards do dashboard.
- Rosca de despesas clicável (leva à lista filtrada).
- Desfazer exclusão: soft delete em lançamentos, rota de restauração com Policy, toast "Desfazer" de 8s. Categorias: só lançamentos ativos bloqueiam a exclusão; ao excluir categoria, lançamentos excluídos dela são apagados de vez (forceDelete em DB::transaction). Testes passando (63).
- Metas de gasto por categoria — parte (a): banco e regra de negócio. Tabela `budgets` (id, user_id, category_id, amount decimal(12,2), timestamps, índice único user_id+category_id, cascadeOnDelete em category_id), model `Budget` com cast `decimal:2`, relações `user()`/`category()`, factory, `BudgetPolicy`, `StoreBudgetRequest`/`UpdateBudgetRequest` (valor > 0, categoria de despesa do usuário, unicidade), `BudgetController` (store/update/destroy com Inertia), rota `budgets` (only store/update/destroy), enum `BudgetStatus` (Ok/Warning/Exceeded com `fromPercentage()`), `BudgetSummaryService` (gasto, percentual sem arredondar e status por meta no mês, via Eloquent agregado sem N+1, ignorando soft-deleted). 26 testes da feature passando. Sem telas nem alterações no dashboard (partes b e c).

## Em andamento
- (preencher)

## Próximos passos (ordem)
1. Metas de gasto por categoria — (b) tela de metas e (c) alertas no dashboard
2. Conta de demonstração com 1 clique (só com variável de ambiente)
3. Exportar CSV
4. CI com GitHub Actions
5. Revisões de segurança, acessibilidade e desempenho
6. Lançamentos recorrentes
7. Prints, GIF, README final e deploy

## Regras de trabalho
- Passos pequenos; explicar em linguagem simples (estou aprendendo).
- Mostrar o plano e esperar meu OK antes de codar.
- Sem bibliotecas novas sem perguntar.
- Sem cores fixas: usar os tokens do tema.
- Rodar os comandos de verificação do AGENTS.md (testes, lint, tipos) ao final.