# Saldoa

Aplicação web de controle financeiro pessoal criada para organizar receitas e despesas, acompanhar os gastos e visualizar a evolução das finanças em um dashboard.

## Funcionalidades

- Cadastro, autenticação e gerenciamento da conta.
- Cadastro, edição, listagem e exclusão de categorias próprias.
- Cadastro, edição, listagem e exclusão de receitas e despesas.
- Filtros de lançamentos por mês, tipo, categoria e texto, com paginação.
- Dashboard com saldo geral, resumo mensal, despesas por categoria, comparação dos últimos meses e lançamentos recentes.
- **Metas de gasto por categoria:** defina limites mensais para suas categorias de despesa e acompanhe o uso em tempo real. Metas abaixo de 80% aparecem como "ok", de 80% a menos de 100% aparecem com aviso de atenção, e a partir de 100% aparecem como estouradas. O dashboard exibe alertas das metas que precisam de atenção.
- Proteção dos dados por usuário, com autorização no back-end.
- Interface responsiva em português, com valores em reais e datas no formato brasileiro.

## Tecnologias

- PHP 8.4 e Laravel 13.
- React 19 com Inertia.js 3 e TypeScript.
- Tailwind CSS 4 e componentes shadcn/ui do starter kit.
- Recharts para os gráficos do dashboard.
- MySQL como banco de dados da aplicação. O `.env.example` usa SQLite como opção padrão para facilitar a execução local.
- Pest para os testes automatizados.

## Como rodar localmente

### Pré-requisitos

- PHP 8.4 com as extensões exigidas pelo Laravel, Composer e Node.js com npm.
- Git.
- SQLite para usar a configuração local padrão. Para usar MySQL, tenha o servidor instalado e crie um banco para o projeto.

### Instalação

Substitua a URL de exemplo pela URL do repositório publicado:

```bash
git clone https://github.com/SEU_USUARIO/react-saldoa-app.git
cd react-saldoa-app
composer install
npm install
```

Copie o arquivo de ambiente. No PowerShell do Windows:

```powershell
Copy-Item .env.example .env
```

No macOS ou Linux:

```bash
cp .env.example .env
```

O `.env.example` já aponta para SQLite. Crie o arquivo do banco se ele ainda não existir:

```bash
touch database/database.sqlite
```

No PowerShell, o equivalente é:

```powershell
if (-not (Test-Path database/database.sqlite)) { New-Item -ItemType File -Path database/database.sqlite }
```

Gere a chave da aplicação, crie as tabelas e carregue as categorias e os lançamentos de demonstração:

```bash
php artisan key:generate
php artisan migrate --seed
```

Para iniciar o servidor Laravel, o worker de filas e o servidor Vite juntos:

```bash
composer run dev
```

Acesse [http://localhost:8000](http://localhost:8000). Para usar MySQL, ajuste `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME` e `DB_PASSWORD` no `.env` antes de executar as migrations.

> O endereço de `git clone` acima é ilustrativo: este checkout não contém a URL remota do repositório. Troque `SEU_USUARIO` e o endereço pelo link publicado do projeto.

## Testes

Execute a suíte automatizada com:

```bash
php artisan test --compact
```

## Usuário de demonstração

O comando `php artisan migrate --seed` cria uma conta com lançamentos e metas de exemplo distribuídos pelos últimos três meses. Para ativar o login por 1 clique, defina `DEMO_LOGIN_ENABLED=true` no seu arquivo `.env`:

- **E-mail:** `demo@exemplo.com`
- **Senha:** `demo1234`

## Aprendizados

- Uso de Policies para restringir o acesso a categorias e lançamentos ao usuário proprietário.
- Validação de dados com Form Requests e regras específicas para categorias e lançamentos.
- Consultas agregadas com Eloquent para calcular saldos e preparar os dados dos gráficos no back-end.
- Integração Laravel, Inertia e React para manter rotas e regras no servidor e construir páginas interativas.

## Próximos passos

### Versão 1.1

- Criar lançamentos recorrentes.
- Exportar lançamentos para CSV.
- Acompanhar metas de economia.
- Terminar terminar a conta demo
- CI com GitHub Actions
- Revisão de segurança, acessibilidade e desempenho
- Deploy

## Prints e deploy

## Home Page
![Home Page](docs/images/home.gif)

<!-- TODO: adicionar capturas do dashboard, da lista de lançamentos e das categorias. -->

**Deploy:** <!-- TODO: adicionar o link da aplicação publicada. -->
