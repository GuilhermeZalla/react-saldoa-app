# Saldoa

![Tela inicial do Saldoa](docs/images/home.gif)

O Saldoa ajuda a acompanhar o dinheiro que entra e sai. Você registra receitas e despesas, organiza tudo por categoria, define limites mensais e vê um resumo das finanças no dashboard. É um projeto de portfólio feito com Laravel, React e Inertia.

## Features da aplicação

- Criar uma conta e manter os dados separados por usuário.
- Registrar receitas e despesas, filtrar os lançamentos e exportar os resultados para CSV.
- Organizar lançamentos em categorias e definir metas mensais para categorias de despesa.
- Agendar lançamentos recorrentes e acompanhar os resumos no dashboard.
- Experimentar o app com a conta de demonstração, quando o login demo estiver habilitado.

## Tecnologias

- PHP 8.4 e Laravel 13
- React 19, Inertia.js 3 e TypeScript
- Tailwind CSS 4 e componentes shadcn/ui
- Recharts para os gráficos
- Pest para os testes
- SQLite por padrão no ambiente local; MySQL também pode ser configurado

## Rodar na sua máquina

Você precisa de PHP 8.4 com as extensões do Laravel, Composer, Node.js/npm e Git. Com SQLite, não é necessário instalar um servidor de banco de dados.

```bash
git clone https://github.com/GuilhermeZalla/react-saldoa-app.git
cd react-saldoa-app
composer install
npm install
```

Copie `.env.example` para `.env` (no PowerShell, use `Copy-Item .env.example .env`), gere a chave e prepare o banco:

```bash
php artisan key:generate
php artisan migrate --seed
```

O arquivo de ambiente padrão usa SQLite. Caso o arquivo `database/database.sqlite` não exista, crie-o antes de migrar. Para usar MySQL, configure as variáveis `DB_*` no `.env`.

Inicie a aplicação e o Vite:

```bash
composer run dev
```

Abra [http://localhost:8000](http://localhost:8000). Em ambiente local, o seeder cria dados de exemplo, incluindo a conta `demo@exemplo.com` (senha `demo1234`). O botão de acesso em um clique depende de `DEMO_LOGIN_ENABLED=true` no `.env`.

**A conta e a senha conhecidas de demonstração nunca podem existir na instância principal de produção.** Para disponibilizar uma demonstração pública, use uma implantação e banco de dados isolados, habilite `DEMO_INSTANCE=true` somente nela e configure `DEMO_LOGIN_ENABLED=true`. O seeder e o login demo permanecem bloqueados em produção quando `DEMO_INSTANCE=false`. Não compartilhe banco, domínio administrativo, credenciais nem backups entre as instâncias.

Na instância demo, as rotas web e API de escrita recusam alterações feitas pela conta demo. O comando `php artisan demo:reset --force` remove os dados da conta demo e a cria novamente; ele é agendado diariamente nessa instância. Antes de publicar a instância principal de produção, execute `php artisan demo:purge --force` e confirme que a conta não existe.

## Rodar as verificações

```bash
php artisan test
npm run check
npm run types:check
npm run build
```

O workflow do GitHub Actions também executa o setup e as verificações em pushes para `main` e em pull requests.

Para remover manualmente os dados de demonstração, execute `php artisan demo:purge`. O comando pede confirmação; `--force` dispensa a confirmação e é apropriado para um passo explícito do checklist de deploy.

## Como o app é organizado

As rotas ficam em `routes/` e encaminham as requisições para controllers em `app/Http/Controllers/`. As regras de entrada ficam em Form Requests e as permissões por usuário ficam em Policies. Models e migrations representam os dados no banco. Serviços reúnem cálculos usados por mais de uma tela.

As páginas React ficam em `resources/js/pages/`, os componentes reutilizáveis em `resources/js/components/` e os tipos compartilhados em `resources/js/types/`. O Inertia conecta essas páginas às rotas Laravel, enviando os dados preparados no servidor. O Wayfinder gera funções TypeScript para chamar as rotas nomeadas.

Os testes de comportamento ficam em `tests/Feature/`; factories e seeders ajudam a preparar os dados. O agendamento de recorrências é definido em `routes/console.php`: em produção, configure o cron do Laravel Scheduler para que as ocorrências sejam criadas no horário previsto.

## Demonstração

### Tela Inicial

![Tela inicial do Saldoa](docs/images/home.gif)

### Login e cadastro

![Login e cadastro](docs/images/auth.gif)

### Dashboard

![Dashboard](docs/images/dashboard.gif)

### Lançamentos

![Lançamentos](docs/images/transactions.gif)

## Categorias

![Categorias](docs/images/categories.gif)

## Meta

![Meta](docs/images/meta.gif)

## Deploy

O app ainda não possui uma URL pública de produção.

## API móvel

O backend JSON autenticado por tokens Sanctum e seus endpoints estão descritos em [docs/MOBILE_API.md](docs/MOBILE_API.md). O cliente Android está em `mobile/`, feito com Expo, React Native e TypeScript. Ele inclui autenticação, acesso à demo isolada, dashboard, lançamentos, categorias, metas, recorrências e opções de exportação, logout e exclusão de conta.

Para executar em desenvolvimento:

```powershell
Copy-Item mobile/.env.example mobile/.env
Set-Location mobile
npm install
npm start -- --go --lan
```

Instale o **Expo Go** no celular, conecte o celular e o computador à mesma rede Wi-Fi e leia o QR code mostrado pelo comando. Para testar com o backend local em um aparelho físico, edite `mobile/.env` e use o IP LAN do computador em `EXPO_PUBLIC_API_URL`, sem acrescentar `/api/v1`; inicie o Laravel com `php artisan serve --host=0.0.0.0` para permitir o acesso pela rede local. Configure `EXPO_PUBLIC_API_URL_DEMO` somente quando houver uma instância demo separada.

Esse modo serve para pré-visualizar e testar o app durante o desenvolvimento; não gera um APK nem substitui um build de distribuição. Para usar um emulador com `npm run android` ou fazer um build local, é necessário instalar JDK e Android Studio/SDK. Builds de distribuição aceitam apenas HTTPS.

Antes de um teste fechado na Play Store, ainda é necessário configurar e validar URLs reais de produção e demo, confirmar o identificador Android do aplicativo, preparar os ícones finais e credenciais de assinatura, e publicar em HTTPS uma política de privacidade e o fluxo público de exclusão de conta em `/account-deletion`. O aplicativo ainda não foi validado manualmente contra uma implantação real nem foi gerado como pacote assinado de distribuição.
