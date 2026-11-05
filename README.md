# Saldoa

Controle financeiro pessoal para acompanhar receitas, despesas e metas na web e no celular.

**[Acessar o site](https://saldoa-app.duckdns.org)** · **[Baixar o APK Android](https://github.com/GuilhermeZalla/react-saldoa-app/releases/download/mobile-v1.0.0-preview.1/saldoa-android-public-preview.apk)** · [Notas da versão](https://github.com/GuilhermeZalla/react-saldoa-app/releases/tag/mobile-v1.0.0-preview.1)

A versão **web começou em 2025**. Em **2026**, o projeto ganhou um aplicativo mobile que utiliza o mesmo backend. O Saldoa é um projeto de estudo e portfólio, com publicação web na AWS e uma versão Android disponível para testes.

## Preview

![Saldoa na web e no celular](docs/images/saldoa-portfolio-cover.png)

## O que é possível fazer

- Registrar receitas e despesas e organizar tudo por categorias.
- Consultar saldo, gráficos e movimentações do mês.
- Definir limites de gastos por categoria e acompanhar o progresso.
- Programar lançamentos recorrentes e exportar os dados.
- Gerenciar o perfil e solicitar a exclusão da conta.
- No mobile, escolher português ou inglês e tema claro, escuro ou do sistema.

## Aplicação web

![Dashboard do Saldoa](docs/screenshots/dashboard-desktop.png)

| Tela         | Desktop                                                 | Celular                                                |
| ------------ | ------------------------------------------------------- | ------------------------------------------------------ |
| Início       | [Ver imagem](docs/screenshots/home-desktop.png)         | [Ver imagem](docs/screenshots/home-mobile.png)         |
| Login        | [Ver imagem](docs/screenshots/login-desktop.png)        | [Ver imagem](docs/screenshots/login-mobile.png)        |
| Cadastro     | [Ver imagem](docs/screenshots/register-desktop.png)     | [Ver imagem](docs/screenshots/register-mobile.png)     |
| Dashboard    | [Ver imagem](docs/screenshots/dashboard-desktop.png)    | [Ver imagem](docs/screenshots/dashboard-mobile.png)    |
| Lançamentos  | [Ver imagem](docs/screenshots/transactions-desktop.png) | [Ver imagem](docs/screenshots/transactions-mobile.png) |
| Categorias   | [Ver imagem](docs/screenshots/categories-desktop.png)   | [Ver imagem](docs/screenshots/categories-mobile.png)   |
| Metas        | [Ver imagem](docs/screenshots/budgets-desktop.png)      | [Ver imagem](docs/screenshots/budgets-mobile.png)      |
| Recorrências | [Ver imagem](docs/screenshots/recurring-desktop.png)    | [Ver imagem](docs/screenshots/recurring-mobile.png)    |
| Perfil       | [Ver imagem](docs/screenshots/account-desktop.png)      | [Ver imagem](docs/screenshots/account-mobile.png)      |

## Aplicativo mobile

<p>
  <img src="docs/screenshots/mobile-login-expo.png" alt="Login do Saldoa mobile" width="240">
  <img src="docs/screenshots/mobile-dashboard-expo.png" alt="Dashboard do Saldoa mobile" width="240">
  <img src="docs/screenshots/mobile-budgets-expo.png" alt="Metas no Saldoa mobile" width="240">
</p>

O APK acessa a API pública e pode ser usado pelo Wi-Fi ou 4G/5G, sem depender do notebook. A versão disponível é de teste para Android ARM64 e ainda não foi publicada na Play Store. Veja como instalar, executar e compilar em [mobile/README.md](mobile/README.md).

As imagens foram atualizadas com a interface atual. Telas privadas usam dados de exemplo; as imagens mobile foram capturadas na prévia web do aplicativo.

## Tecnologias

| Parte      | Tecnologias atuais                                            |
| ---------- | ------------------------------------------------------------- |
| Backend    | Laravel 13, PHP 8.4 e Sanctum                                 |
| Web        | React 19, Inertia, TypeScript e Tailwind CSS                  |
| Mobile     | Expo, React Native e TypeScript                               |
| Banco      | SQLite no desenvolvimento e MySQL na AWS                      |
| Hospedagem | AWS EC2 com Docker Compose e HTTPS                            |
| Qualidade  | Pest, análise de tipos, lint e verificações no GitHub Actions |

## Executar no computador

Requisitos: PHP 8.4, Composer, Node.js 22.13 ou superior e npm. O PHP deve ter SQLite, OpenSSL, mbstring, intl e as extensões exigidas pelo Composer.

Para a primeira instalação, em uma cópia nova do repositório, use o PowerShell:

```powershell
composer install
npm ci
if (!(Test-Path .env)) {
    Copy-Item .env.example .env
}
if (!(Test-Path database/database.sqlite)) {
    New-Item database/database.sqlite -ItemType File
}
php artisan key:generate
php artisan migrate --seed
composer run dev
```

Abra `http://localhost:8000`. Esses passos criam um **ambiente local**; não devem ser usados sobre o banco de produção. Não sobrescreva um `.env` que já esteja configurado.

O seeder local inclui a conta `demo@exemplo.com`, senha `demo1234`. Essa conta serve apenas para demonstração local ou para uma instância demo separada; ela não deve existir na produção principal.

Para iniciar o aplicativo mobile e configurar o endereço da API, consulte o [guia mobile](mobile/README.md).

## Verificações

```powershell
npm --prefix mobile ci
npm run check
npm run types:check
php artisan test --compact
```

Os testes Laravel devem usar o ambiente de testes, separado dos dados reais. Comandos específicos do mobile estão no seu [README](mobile/README.md).

## Situação atual

O site está publicado em HTTPS e há um APK de teste com acesso à API pública. O envio real de e-mails, o backup externo com restauração validada e a distribuição na Play Store continuam pendentes. O deploy ainda é manual.

## Documentação

- [Guia de operação da AWS](docs/AWS_OPERACAO.md): acesso à máquina, logs, banco, backup e custos.
- [Implantação na AWS](docs/AWS_DEPLOY.md): configuração e reconstrução do ambiente.
- [API mobile](docs/MOBILE_API.md): contratos e orientações para integração.
- [Status do projeto](docs/STATUS.md): entregas, validações e próximos passos.

## Apoio de IA

Ferramentas de IA apoiaram o desenvolvimento, a revisão e a documentação. As decisões e a validação do projeto permanecem sob responsabilidade do autor.
