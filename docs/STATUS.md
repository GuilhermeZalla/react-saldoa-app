# Estado do projeto

Projeto: app de controle financeiro pessoal (portfólio). Laravel + React (Inertia, TypeScript), SQLite, Tailwind e shadcn/ui, toasts com Sonner. Interface web em português e mobile em português/inglês; código em inglês.

## Favicon e cache do navegador — 04/11/2026

- Os arquivos públicos já entregavam a marca Fluxo, mas os links mantinham as URLs anteriores. Adicionado `?v=fluxo-1` aos links ICO, SVG e Apple Touch em `resources/views/app.blade.php` para invalidar o cache dos navegadores. Publicação manual por rebuild da imagem app; sem mudanças no APK ou no banco.

## Marca Fluxo, revisão de qualidade e capa — 04/11/2026

- Usuário escolheu a opção 01: marca Fluxo, um S com setas de entrada/saída, preservando o laranja. SVG original em `docs/images/saldoa-logo-01-fluxo.svg`; aplicado aos componentes web, login mobile, favicon, ícones nativos/adaptativo/monocromático e abertura. Ícones funcionais mantêm seus significados. Instruções de identidade foram alinhadas à escolha.
- Site publicado com a nova marca; título corrigido para `Bem-vindo - Saldoa`. Nome do frontend definido durante o build Docker. Browser validou 1440 px e 390 px sem overflow horizontal e sem erros JavaScript. Imagens anteriores de produção preservadas como `saldoa-app:pre-flow` e `saldoa-web:pre-flow`; nenhuma migration executada.
- Revisão: sessão preservada diante de falhas temporárias, mantendo remoção em 401; prazo de requisição cobre a leitura do corpo, com limpeza em `finally` e erros traduzidos para JSON inválido/interrupção; exportação mensal reutiliza calendário local; limpeza do build tenta todas as etapas mesmo se uma falhar; script preserva a formatação do manifesto sem alterar dependências.
- Notificação de exclusão implementa `ShouldQueue`, usando a fila já configurada em produção. Falha de SMTP passa a ser processada pelo worker, sem bloquear a resposta HTTP da solicitação. SMTP real permanece pendente; esta alteração não confirma entrega de e-mails.
- Verificações: 13 testes mobile (incluindo falhas de rede/corpo, sessão inválida e virada de mês), tipos mobile/web, lint mobile e check completo passaram. Um teste unitário PHP sem banco confirma a entrega pela fila; Pint passou. Testes Feature não foram executados nesta etapa para respeitar a restrição de migrations/alteração de banco.
- Capa para portfólio criada em `docs/images/saldoa-portfolio-cover.png` (1920 × 1080) e SVG independente. Usa captura real do site público e captura do login Expo no navegador, sem contas/dados reais ou alteração do portfólio externo. Capturas originais ficam em `docs/screenshots/saldoa-*-flow*.png`.
- O usuário confirmou que o APK público anterior funcionou pelo 4G/5G; a causa da falha transitória inicial não foi confirmada. Novo APK com a marca Fluxo e correções compilado com sucesso em 17 min 44 s: `mobile/android/app/build/outputs/apk/release/app-release.apk`, 29,21 MiB, `com.saldoa.app`, versão 1.0.0/código 1, ARM64. Assinatura v2 e certificado iguais ao APK anterior; URL pública confirmada no bundle e exceção HTTP local ausente. Ícone nativo gerado conferido visualmente. Esta nova compilação ainda aguarda teste no aparelho. Release manual criada como rascunho (`mobile-v1.0.0-preview.1`), com APK validado anexado como `saldoa-android-public-preview.apk`; aguarda commit correspondente e atualização da referência antes de publicar. Link do rascunho: https://github.com/GuilhermeZalla/react-saldoa-app/releases/tag/untagged-29e9879810e28b50943d. SHA-256 do APK: `dab39f980804367d505ca31b387561a608bfeb54385fd63533e8a72f0e445040`. Não foi criado commit/push automaticamente. Preparação da Release manual não habilita deploy automático.

## APK de teste com API pública — 04/11/2026

- Script `mobile/scripts/build-local-apk.mjs` recebeu o modo `--public-api`: exige URLs HTTPS para API/site e desativa a exceção HTTP da rede local. O modo LAN existente foi preservado; nenhuma dependência foi alterada.
- Build iniciado com `https://saldoa-app.duckdns.org` para API/site e demo vazia, sem alterar `mobile/.env`. O banco da AWS é separado do banco local. Envio real de e-mails continua pendente.
- Cinco testes mobile, TypeScript, Expo lint, lint/formatação do script e rejeição de HTTP no modo público passaram. README e contrato mobile documentam o comando. Build Gradle concluído em 18 min 13 s; APK de 29,15 MiB em `mobile/android/app/build/outputs/apk/release/app-release.apk`, `com.saldoa.app`, somente `arm64-v8a`, assinatura de depuração v2 verificada. Bundle final contém a URL pública e não contém o IP LAN configurado; recurso de exceção HTTP local ausente. API pública respondeu 200 em `/up` e 401 para login inválido. Teste no aparelho pelo 4G/5G ainda pendente.

## Correção da página inicial — 04/11/2026

- Removido de `resources/js/pages/welcome.tsx` o bloco de rodapé de solicitação de exclusão que estava inserido dentro do cabeçalho e desorganizava o layout. O fluxo privado e a rota pública `/account-deletion` foram preservados.
- Lint/formatação do arquivo e TypeScript passaram. `npm run check` completo encontrou uma pendência de formatação em `mobile/package.json`, fora desta correção. Nenhuma lógica de backend foi alterada.
- A correção foi enviada diretamente à EC2 para recompilar as imagens; o checkout remoto terá essa alteração sem commit até sincronizar o próximo commit do usuário.

## Preparação para implantação pública — 04/11/2026

- Validação pública em 04/11/2026: `/up` e `/login` responderam 200 via HTTPS, HTTP redirecionou com 308, `/api/v1/auth/me` sem token respondeu 401 e `/.env` respondeu 404. O APK existente continua com a URL local; não houve novo build mobile. SMTP real ainda não foi configurado, portanto recuperação de senha e confirmação de exclusão por e-mail não estão prontas para uso público.

- O usuário confirmou que o APK funciona; a falha de login ocorreu porque o celular estava na rede errada. Não foi necessária uma alteração no app para corrigir esse problema.
- O APK local continua usando uma URL HTTP de rede privada e serve apenas para testes. Para funcionar fora da rede doméstica, o próximo marco é publicar o Laravel em HTTPS e gerar outro build com a URL pública.
- A configuração local usa SQLite e drivers `database` para sessão, cache e fila. Na VM AWS, a configuração separada de produção usa MySQL 8.4 em volume persistente; proteção contra perda da VM depende de backup externo e restauração testada.
- Localmente, o envio de e-mail está configurado para `log`; na EC2, SMTP permanece sem provedor real configurado; a solicitação pública de exclusão já existe, mas a confirmação por e-mail depende de um provedor real configurado e testado.
- O projeto contém um endpoint `/up`, Scheduler para lançamentos recorrentes e limpeza de solicitações expiradas, e documentação das proteções necessárias para a instância demo. Não habilitar a demo na produção principal.
- O destino atual é AWS EC2. Verificado por SSH: `t3.small`, região `us-east-2` (Ohio), Ubuntu 26.04.1 LTS, x86_64, 1,9 GiB RAM e disco raiz de 28 GiB. Docker 29.9.3/Compose 5.7.0; Docker habilitado no boot. Swap de 4 GiB ativo e persistência configurada em `/etc/fstab`, sem reboot de validação. Commit `242f69f` clonado em `/opt/saldoa`; imagens compiladas na EC2, MySQL saudável, migrations aplicadas e app/scheduler/worker iniciados sem portas publicadas. Credenciais geradas somente no servidor. Web publicado em `https://saldoa-app.duckdns.org`, com certificado HTTPS validado e redirecionamento HTTP. Apenas o web publica portas 80/443; banco e PHP permanecem internos. Usuário confirmou Mailtrap Email Sandbox; envio real ainda não configurado. Plano/saldo AWS e backup externo pendentes. Guia: `docs/AWS_DEPLOY.md`.

- Verificação local anterior da preparação genérica (commit `242f69f`): Compose, configuração Caddy e sintaxe Bash passaram; imagens PHP/Vite/Caddy compilaram em Linux AMD64. Cinco serviços foram iniciados num projeto descartável: `/up`, login web e exclusão pública responderam 200, API sem token e login inválido responderam 401, e `/.env` respondeu 404. Requisitos PHP de produção passaram. O script de backup foi executado e seu SQL restaurado em um segundo banco descartável (15 tabelas); containers/volumes de teste removidos. Build e inicialização interna na AWS passaram; dimensionamento sob carga, e-mail real e backup externo ainda não foram validados. A troca desta etapa alterou somente a documentação; os arquivos Docker e o app permanecem iguais.

## Redesign mobile — 04/11/2026

- O usuário confirmou que o APK anterior funcionou no celular. A direção visual seguinte foi aprovada: autenticação mais leve, controles de tema/idioma discretos e telas internas com hierarquia mais clara, mantendo laranja, cinzas, DM Sans, Space Grotesk e a carteira Saldoa.
- Login/cadastro receberam ilustração vetorial própria, formulário com maior espaçamento e botão de preferências no topo. A ilustração é reduzida no cadastro, em telas baixas e quando o teclado nativo aparece. O painel permite mudar idioma/tema e fechar pelo botão, fundo ou ação de voltar; a persistência existente foi preservada.
- O card de demo foi substituído por **Experimentar sem criar conta**, visível apenas quando uma URL demo válida está configurada. A regra vale em qualquer build; não identifica um APK de teste nem comprova disponibilidade do servidor. Hosts e instruções de configuração não aparecem na tela de acesso.
- Dashboard: saudação com avatar de iniciais, saldo destacado, receitas/despesas compactas, atalhos para as telas existentes, barras de distribuição por categoria e movimentações com indicadores de entrada/saída. Todos os valores vêm da API existente.
- Metas: gasto e limite mais legíveis, progresso, disponível ou excesso; formulário aberto ao criar/editar. Conta: perfil e opções agrupadas em linhas, preferências no mesmo painel e exclusão recolhida, mantendo senha e confirmação permanente.
- Componentes compartilhados, demais listas e aba ativa foram ajustados ao mesmo estilo. Não houve alteração de backend, endpoints, banco, dependências ou regras financeiras.
- README, documentação da API e instruções mobile atualizados; capturas do navegador usam dados fictícios, sem alterar contas reais.
- Verificações do redesign: 5 testes mobile aprovados, TypeScript e Expo lint sem erros; `npm run check` passou com 125 arquivos formatados e 110 arquivos sem avisos/erros de lint. A suíte Laravel passou com 153 testes, 2 ignorados e 1 aviso, sem alterar código PHP.
- Playwright com API simulada validou login/cadastro, seis abas, português/inglês, temas, fechamento do painel, ausência de configuração técnica no login, demo oculta sem URL e demo somente leitura quando configurada. Também conferiu criação/edição de metas com os mesmos payloads da API, cancelamento da exclusão e ausência de overflow horizontal em 320/360/390/768 px. Sem erros JavaScript.
- Novo APK gerado por `npm run apk:local` com build completo em 19 min 2 s: `mobile/android/app/build/outputs/apk/release/app-release.apk`, 29,15 MiB, `com.saldoa.app`, apenas `arm64-v8a`. Assinatura v2 verificada e certificado igual ao APK anterior. O bundle contém os novos textos, o host local correto e não contém o endereço fictício usado na revisão da demo.
- API local confirmada com HTTP 200 em `http://192.168.68.50:8000/up` após a compilação. Essa verificação se refere à rede utilizada no momento do build. Este APK usa a configuração local, sem URL demo; por isso o link de demonstração fica oculto. O usuário confirmou que o app funciona no celular; o erro de conexão relatado depois ocorreu enquanto o aparelho estava na rede incorreta.

## Atualização — cliente mobile

### 04/11/2026 — identidade, áreas seguras e preferências

- Mobile alinhado à identidade desktop: carteira Saldoa nos ícones de instalação/adaptativo/monocromático/abertura e no login; DM Sans e Space Grotesk empacotadas com suas licenças; paletas claro/escuro em laranja e cinza.
- Telas usam áreas seguras; barra de abas considera o espaço inferior do aparelho e se oculta com o teclado. Ícones vetoriais maiores substituem caracteres de texto e Conta usa um usuário. As barras do Android ficam ocultas e podem ser reveladas temporariamente por gesto.
- Português e inglês e temas claro/escuro/sistema disponíveis no login e em Conta. Preferências persistem no aparelho via SecureStore e na prévia web via localStorage; token web permanece somente em memória. Valores continuam em BRL. As datas editáveis de lançamentos e recorrências usam dia/mês/ano com normalização ISO para a API.
- Traduções incluem navegação, formulários, confirmações e mensagens locais. O backend não traduz as validações por `Accept-Language`; em inglês o cliente informa os campos inválidos, preservando detalhes do backend em português quando esse é o idioma selecionado.
- Preservadas as correções anteriores do script de APK local e de `api.ts`, incluindo caminhos curtos no Windows, `arm64-v8a`, HTTP privado de teste e timeout de 15 segundos.
- Script de APK ajustado para resolver o Gradle Wrapper por caminho absoluto e limitar memória/paralelismo da compilação: Gradle sem daemon persistente, um trabalho por vez, Kotlin no mesmo processo e pool CMake de dois compiladores. Isso reduz o consumo de memória; a recompilação completa passou após o ajuste.
- Verificações concluídas: 5 testes mobile de tradução/formatação/erros, checagem de tipos, Expo lint e exportação web. Playwright validou login com API simulada, as seis abas, troca/restauração de idioma e tema, acompanhamento do tema do sistema e larguras de 320/360/390/768 px, sem erros JavaScript. Capturas atualizadas no README usam dados fictícios e não comprovam conectividade da API real.
- A suíte Laravel passou com 153 testes e 2 ignorados via `php artisan test --compact` no PHP 8.4.27. A execução dentro do sandbox selecionava outro PHP sem OpenSSL; a suíte também passou ao habilitar a extensão apenas naquele processo. Nenhuma configuração global de PHP foi alterada.
- O endereço privado antigo da API (`192.168.68.52`) não correspondia mais ao IP Wi-Fi do computador. `mobile/.env` foi atualizado para `192.168.68.50`; a API local respondeu 200 em `/up`, 401 JSON em `/api/v1/auth/me` sem token e 401 no login com credenciais fictícias inválidas. Não foram criadas contas nem alterados dados financeiros. O teste do APK anterior foi confirmado pelo usuário antes do redesign seguinte.
- `npm run check` completo passou (124 arquivos formatados, 109 arquivos sem avisos/erros de lint); o script de build recebeu nova checagem escopada após o ajuste de memória. Build web, sintaxe do script e `git diff --check` também passaram.
- Novo APK gerado com sucesso pelo comando normal `npm run apk:local` (build completo em 20 minutos). Arquivo: `mobile/android/app/build/outputs/apk/release/app-release.apk`, 29,14 MiB, identificador `com.saldoa.app`, somente `arm64-v8a`, assinatura de depuração verificada pelo `apksigner`. Também foram verificados no pacote o novo host `192.168.68.50`, a ausência do host antigo no bundle e a permissão HTTP restrita ao novo endereço. A API local ficou em execução para teste no mesmo Wi-Fi.
- O usuário confirmou o funcionamento deste APK no celular antes do redesign seguinte; a prévia web não valida esses comportamentos nativos e não há emulador Android instalado neste ambiente.

- A API Sanctum e o isolamento da demonstração foram implementados e documentados; o aplicativo web continua autenticado por sessão/Fortify.
- O cliente Expo/React Native em `mobile/` usa Expo Router e SecureStore. Inclui cadastro/login, recuperação via site, opção “Experimentar sem criar conta” quando configurada, dashboard, lançamentos, categorias, metas, recorrências, exportação, logout e exclusão de conta.
- A sessão armazena o token e a URL da instância correspondente. A demo fica em somente leitura no cliente e o backend também bloqueia suas mutações.
- Verificações atuais do cliente: TypeScript, Expo lint, checagem de compatibilidade das dependências Expo, Expo Doctor e exportação do bundle Android passaram.
- A prévia Expo Web foi habilitada com `react-native-web` e revisada em 390 × 844. TypeScript, lint e exportação web passaram; a sessão no navegador fica apenas em memória porque o SecureStore não é suportado na web. As datas dos lançamentos são exibidas em `dd/mm/aaaa` e normalizadas para ISO antes do envio à API.
- A suíte Laravel passou com 153 testes aprovados e 2 ignorados.
- A primeira validação funcional em aparelho físico com Expo Go e um smoke test da API local foram concluídos anteriormente. Também foi gerado um APK local sem EAS para teste na rede doméstica, com assinatura de depuração e arquitetura `arm64-v8a`. O cliente usa uma API HTTP privada; o build local não exige endpoints públicos, mas depende da API ativa e acessível pela mesma rede Wi-Fi. O projeto ainda não está associado ao EAS. A distribuição pública exige HTTPS e assinatura próprios; a Play Store ainda depende de confirmar o identificador final, publicar política de privacidade e validar o fluxo público de exclusão de conta.
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

## Concluído recentemente

- **Reestruturação e aprimoramento completo do README.md:**
    - Padronização seguindo o modelo de portfólio de alto nível, com visão geral, demonstrações em GIF, tabela comparativa de screenshots (Desktop e Celular), limites do projeto e decisões técnicas.
    - Inclusão da seção transparente e profissional sobre o "Uso de Inteligência Artificial" no desenvolvimento como ferramenta de apoio a documentação, mockups, estilos e testes, mantendo a autoria e decisões com o autor.
- **Captura e processamento de screenshots reais:**
    - Criação da pasta `docs/screenshots/` com capturas do sistema em português (BRL): `home-desktop`, `home-mobile`, `login-desktop`, `login-mobile`, `register-desktop`, `dashboard-desktop`, `dashboard-mobile`, `transactions-desktop`, `transactions-mobile`, `categories-desktop`, `categories-mobile`, `budgets-desktop` e `budgets-mobile`.
    - Adição de capturas do cliente Expo (login, dashboard, lançamentos, formulário, categorias, metas, recorrências e conta) e da animação `docs/images/mobile-expo.gif`, geradas com dados locais de demonstração.
- **Elaboração do Guia de Apresentação Técnica para Entrevistas (PDF):**
    - Script automatizado em Python gerando `docs/apresentacao-entrevista-saldoa.pdf` com pitch de elevador de 1 minuto, descrição do problema real, arquitetura web e mobile, segurança/boas práticas, respostas prontas para perguntas de recrutadores e ficha técnica do projeto.
- A auditoria mobile antiga foi removida porque afirmava que a API e o cliente não existiam; a implementação atual está descrita em `docs/MOBILE_API.md`.

- Validação manual do cliente Expo contra emulador/dispositivo e API; depende de endpoints configurados em `mobile/.env` e não substitui testes de um build assinado.
- Revisão do app publicado: depende de uma URL de produção e deve ser feita depois do deploy.

## Melhorias futuras

- Deploy automático com GitHub Actions: adiado por decisão do usuário. Por enquanto, enviar ao GitHub não atualiza a EC2; a publicação continua manual, com atualização do código, build e reinício dos serviços. Definir branch de publicação, acesso restrito ao servidor e recuperação da versão anterior quando esta melhoria for retomada.

## Próximos passos

- Revisar no aparelho os fluxos de sessão expirada, demo somente leitura, exportação e exclusão; depois testar instâncias publicadas.
- Publicar e configurar as URLs HTTPS da API principal e do site; configurar uma URL demo somente se houver instância isolada publicada.
- Associar o app a um projeto EAS, configurar variáveis de ambiente e assinatura de teste, gerar o APK `preview` e validá-lo fora do ambiente de desenvolvimento.
- Confirmar o identificador Android e os ícones finais; publicar política de privacidade e fluxo de exclusão antes de preparar o teste fechado da Play Store.
- Publicar a aplicação e revisar segurança, acessibilidade e desempenho no ambiente real.
- Capturar telas atualizadas das funcionalidades que ainda não aparecem nos GIFs.

## Regras de trabalho

- Passos pequenos; explicar em linguagem simples (estou aprendendo).
- Após a aprovação do plano, continuar a execução sem novas confirmações de rotina; interromper apenas diante de ações extremamente críticas que possam quebrar o sistema (orientação de 04/11/2026).
- Sem bibliotecas novas sem perguntar.
- Sem cores fixas: usar os tokens do tema.
- Rodar os comandos de verificação do AGENTS.md (testes, lint, tipos) ao final.
