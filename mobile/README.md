# Saldoa Mobile

Aplicativo de controle financeiro pessoal criado em **2026**, como extensão do Saldoa web, iniciado em **2025**.

**[Baixar APK Android](https://github.com/GuilhermeZalla/react-saldoa-app/releases/download/mobile-v1.0.0-preview.1/saldoa-android-public-preview.apk)** · [Notas da versão](https://github.com/GuilhermeZalla/react-saldoa-app/releases/tag/mobile-v1.0.0-preview.1) · [Conhecer a versão web](https://saldoa-app.duckdns.org)

## Preview

<p>
  <img src="../docs/screenshots/mobile-login-expo.png" alt="Login do aplicativo" width="240">
  <img src="../docs/screenshots/mobile-dashboard-expo.png" alt="Resumo financeiro" width="240">
  <img src="../docs/screenshots/mobile-budgets-expo.png" alt="Metas de gastos" width="240">
</p>

Imagens da prévia web do aplicativo, com dados de exemplo.

## Funcionalidades

Dashboard, receitas e despesas, categorias, metas, recorrências, exportação e gerenciamento da conta. Português e inglês, com temas claro, escuro e do sistema.

Outras telas: [Cadastro](../docs/screenshots/mobile-register-expo.png) · [Lançamentos](../docs/screenshots/mobile-transactions-expo.png) · [Formulário](../docs/screenshots/mobile-transaction-form-expo.png) · [Categorias](../docs/screenshots/mobile-categories-expo.png) · [Recorrências](../docs/screenshots/mobile-recurring-expo.png) · [Conta](../docs/screenshots/mobile-account-expo.png) · [Preferências em inglês](../docs/screenshots/mobile-preferences-en.png) · [Dashboard em inglês](../docs/screenshots/mobile-dashboard-en.png).

## Instalar e testar

1. Baixe o APK da Release no celular Android.
2. Autorize a instalação por esse navegador ou gerenciador de arquivos, caso o Android solicite.
3. Abra o Saldoa e crie uma conta ou entre com uma conta do site hospedado.
4. Teste no Wi-Fi e também pelo 4G/5G.

O APK utiliza a API pública; não precisa que o Laravel esteja rodando no notebook. Contas e dados do ambiente local não são transferidos para a AWS.

A versão atual é para testes, compatível com Android ARM64 e assinada com chave de depuração. Ainda não está na Play Store. A recuperação de senha e a confirmação de exclusão por e-mail dependem do envio real de e-mails, que continua pendente.

## Executar o código

A partir da raiz do repositório, no PowerShell:

```powershell
if (!(Test-Path mobile/.env)) {
    Copy-Item mobile/.env.example mobile/.env
}
cd mobile
npm ci
```

Não sobrescreva um arquivo de ambiente que já esteja configurado. Para usar o servidor público, informe em `mobile/.env`:

```dotenv
EXPO_PUBLIC_API_URL=https://saldoa-app.duckdns.org
EXPO_PUBLIC_WEB_URL=https://saldoa-app.duckdns.org
EXPO_PUBLIC_API_URL_DEMO=
```

Inicie com `npm start`. Use o Expo Go compatível com o projeto para testar no celular ou `npm run web` para abrir a prévia no navegador.

Para usar uma API local, informe o IP LAN do computador nas duas URLs, com a porta 8000. Inicie o Laravel na raiz com `php artisan serve --host=0.0.0.0 --port=8000` e conecte o celular ao mesmo Wi-Fi.

## Gerar um APK de teste

Requer Android Studio, Android SDK e Java. Na pasta `mobile`, para acessar a API pública:

```powershell
$env:EXPO_PUBLIC_API_URL = 'https://saldoa-app.duckdns.org'
$env:EXPO_PUBLIC_WEB_URL = 'https://saldoa-app.duckdns.org'
$env:EXPO_PUBLIC_API_URL_DEMO = ''
npm run apk:local -- --public-api
```

O arquivo é gerado em `android/app/build/outputs/apk/release/app-release.apk`. Para testes com uma API HTTP privada, configure o IP em `.env` e use `npm run apk:local` sem a opção pública. Alterar a URL depois da instalação exige um novo build.

## Verificar

```powershell
npm test
npm run types:check
npm run lint
```

Para contratos da API e informações de segurança, consulte [MOBILE_API.md](../docs/MOBILE_API.md). O [README principal](../README.md) apresenta o projeto completo.
