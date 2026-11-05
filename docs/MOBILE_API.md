# API móvel

Esta API fornece o backend JSON autenticado por tokens Sanctum para o aplicativo Expo/React Native em `mobile/`. A interface nativa cobre autenticação, leitura do dashboard e gestão de lançamentos, categorias, metas e recorrências, além de exportação e gestão da conta. O cliente ainda precisa ser validado contra instâncias publicadas antes de qualquer distribuição.

## Endereços e instâncias

Use uma implantação e um banco separados para cada ambiente:

- Produção: `EXPO_PUBLIC_API_URL` aponta para a URL HTTPS da API principal.
- Demonstração: `EXPO_PUBLIC_API_URL_DEMO` aponta para a URL HTTPS da instância demo isolada.

O cliente oferece o link discreto **Experimentar sem criar conta** abaixo do formulário, somente quando `EXPO_PUBLIC_API_URL_DEMO` contém uma URL válida para o build. A ausência de configuração oculta o link, sem mostrar instruções técnicas ao usuário. Isso se aplica a APKs locais e de distribuição: a demo não depende do tipo de APK. O endereço deve apontar para uma instância disponível com a demonstração habilitada; a presença do link não é uma verificação de saúde do servidor. Antes de autenticar, o cliente usa a URL demo. A sessão salva o host de origem junto com o token para impedir que um token demo seja enviado ao host de produção ou vice-versa. A instância demo deve usar `DEMO_INSTANCE=true` e `DEMO_LOGIN_ENABLED=true`; nunca deve compartilhar banco, credenciais, backups ou acesso administrativo com a produção.

Para desenvolvimento local, copie `mobile/.env.example` para `mobile/.env` e configure as URLs base sem `/api/v1`. No Android Emulator, o Laravel na máquina hospedeira costuma ser acessível em `http://10.0.2.2:8000`; em dispositivo físico, use o IP LAN do computador. Builds públicos exigem HTTPS. O comando `npm run apk:local` é uma exceção para testes locais: habilita HTTP no Android apenas para o host privado configurado, compila `arm64-v8a` e usa a chave de depuração. Esse APK não serve para a Play Store e depende da mesma rede local e da API em execução com `php artisan serve --host=0.0.0.0 --port=8000`.

O endereço configurado em `mobile/.env` é incorporado ao APK durante o build. Alterar esse arquivo ou iniciar o Laravel não muda o endereço de um APK já instalado. Se o computador trocar de rede ou receber outro IP, volte à rede/endereço usado no build ou atualize as URLs e gere outro APK. Antes de recompilar, confirme no navegador do celular que `http://<IP-do-computador>:8000/up` abre com os dois aparelhos na mesma rede; se não abrir, resolva conectividade/firewall primeiro. Uma URL pública HTTPS estável elimina essa dependência da rede local.

## Interface, preferências e idioma

O cliente acompanha a identidade desktop com carteira Saldoa, DM Sans, Space Grotesk e temas laranja/cinza. Português e inglês e a aparência claro/escuro/sistema podem ser escolhidos no painel de preferências: botão de ajustes no topo do login/cadastro ou opção **Idioma e aparência** em Conta. O painel respeita áreas seguras, permite rolagem em telas baixas e fecha pelo botão, pelo fundo ou pela ação de voltar do sistema. Preferências são locais ao dispositivo, salvas no SecureStore, sem alterar o perfil ou o contrato da API; na prévia web, ficam no localStorage, separado do token que continua em memória. A moeda permanece BRL nos dois idiomas.

O login/cadastro usa uma ilustração vetorial local, reduzida no cadastro, em telas baixas ou quando o teclado nativo abre. A tela de acesso não exibe hosts nem nomes de variáveis de ambiente. O dashboard usa somente os dados já recebidos da API, com atalhos para telas existentes, barras de distribuição das despesas e movimentações recentes. Metas mostram gasto, limite e disponibilidade/excesso; o formulário abre ao criar ou editar. Conta agrupa preferências, exportação e segurança; a exclusão fica recolhida e mantém senha e confirmação final. Nenhum endpoint ou regra de autorização foi alterado por esse redesign.

O cliente envia `Accept-Language` e apresenta mensagens de autenticação, rede, permissão e limite de tentativas no idioma selecionado. O backend atual não negocia o idioma das validações: em português são preservados os detalhes recebidos; em inglês o cliente mostra os nomes traduzidos dos campos inválidos. Conteúdo criado pelo usuário não é traduzido. Datas editáveis de lançamentos e recorrências usam dia/mês/ano e são normalizadas para ISO antes do envio.

O limite de 15 segundos nas requisições evita carregamento sem fim quando a API local não está acessível. Verifique servidor, IP LAN, Wi-Fi e firewall se o aparelho não conectar. As barras do Android são ocultadas por componentes nativos do Expo SDK 58; áreas seguras e espaçamento inferior continuam sendo respeitados. Validar isso em navegador não substitui o teste do APK no aparelho.

## Autenticação

Envie os tokens Sanctum como `Authorization: Bearer <access_token>`. Login web e API são independentes: a web continua usando sessão e Fortify; o aplicativo usa tokens pessoais Sanctum.

| Método | Endpoint                  | Acesso                        | Descrição                                                                              |
| ------ | ------------------------- | ----------------------------- | -------------------------------------------------------------------------------------- |
| POST   | `/api/v1/auth/register`   | Público                       | Cadastro; recebe `name`, `email`, `password`, `password_confirmation` e `device_name`. |
| POST   | `/api/v1/auth/login`      | Público                       | Login com `email`, `password` e `device_name`.                                         |
| POST   | `/api/v1/auth/demo`       | Público, só na instância demo | Emite token apenas de leitura para a conta de demonstração.                            |
| GET    | `/api/v1/auth/me`         | Token                         | Retorna o perfil autenticado.                                                          |
| POST   | `/api/v1/auth/logout`     | Token                         | Revoga o token atual.                                                                  |
| POST   | `/api/v1/auth/logout-all` | Token                         | Revoga todos os tokens do usuário.                                                     |
| POST   | `/api/v1/auth/refresh`    | Token                         | Revoga o token atual e retorna outro para o mesmo dispositivo.                         |

Tokens comuns expiram em 30 dias por padrão (`SANCTUM_TOKEN_EXPIRATION`, em minutos). Tokens demo expiram em 60 minutos por padrão (`DEMO_TOKEN_EXPIRATION`). Ambos devem ser configurados por ambiente. A rotação exige o token atual ainda válido; não há refresh token separado.

O cadastro usa as mesmas regras de senha do Fortify e requer confirmação de senha. A verificação de e-mail não está habilitada para a API. Para ativá-la futuramente, habilite `Features::emailVerification()` em `config/fortify.php` e aplique o middleware `verified` ao grupo autenticado de `routes/api.php`; antes disso, decida como o cliente tratará a confirmação por link.

Não há endpoint mobile para solicitar redefinição de senha; o fluxo existente de recuperação continua sendo o web/Fortify. Login tem limite de 5 tentativas por minuto por e-mail normalizado + IP; cadastro tem o mesmo limite por e-mail + IP e um limite adicional de 20/min por IP; refresh tem limite de 5/min por usuário + IP. A demonstração tem limite de 5/min por IP.

## Recursos

Todos os recursos exigem token, exceto os endpoints de autenticação listados acima.

| Método                 | Endpoint                                    | Descrição                                                      |
| ---------------------- | ------------------------------------------- | -------------------------------------------------------------- |
| GET                    | `/api/v1/dashboard?month=AAAA-MM`           | Resumo do dashboard para o mês informado ou mês atual.         |
| GET, POST              | `/api/v1/transactions`                      | Lista paginada e cria lançamentos.                             |
| GET, PUT/PATCH, DELETE | `/api/v1/transactions/{id}`                 | Consulta, atualiza ou exclui um lançamento.                    |
| POST                   | `/api/v1/transactions/{id}/restore`         | Restaura lançamento soft-deleted autorizado.                   |
| GET                    | `/api/v1/transactions/export?month=AAAA-MM` | Exporta os lançamentos filtrados em CSV.                       |
| GET, POST              | `/api/v1/categories`                        | Lista e cria categorias.                                       |
| GET, PUT/PATCH, DELETE | `/api/v1/categories/{id}`                   | Consulta, atualiza ou exclui uma categoria.                    |
| GET, POST              | `/api/v1/budgets`                           | Lista e cria metas mensais por categoria.                      |
| PUT/PATCH, DELETE      | `/api/v1/budgets/{id}`                      | Atualiza ou exclui uma meta.                                   |
| GET, POST              | `/api/v1/recurring-transactions`            | Lista e cria regras de recorrência.                            |
| GET, PUT/PATCH, DELETE | `/api/v1/recurring-transactions/{id}`       | Consulta, atualiza ou exclui uma recorrência.                  |
| GET                    | `/api/v1/account/export`                    | Exporta perfil, categorias, lançamentos, metas e recorrências. |
| DELETE                 | `/api/v1/account`                           | Exclui a conta após confirmação da senha atual.                |

As respostas de valores monetários usam strings decimais, por exemplo `"1234.56"`, para evitar perda de precisão no cliente. Datas são ISO (`AAAA-MM-DD` ou timestamp ISO, conforme o campo). Listagens paginadas seguem o envelope de resources do Laravel.

Erros da API têm o formato `{"error":{"code":"...","message":"...","details":...}}`. Validação usa HTTP 422; não autenticado 401; não autorizado 403; recurso inexistente 404; limite excedido 429. Login com credenciais inválidas responde 401.

Na instância demo, as respostas de leitura continuam disponíveis, mas requisições de escrita com o usuário demo são bloqueadas por middleware. Logout e rotação de token continuam disponíveis para o cliente.

## Exclusão de conta

O endpoint autenticado `DELETE /api/v1/account` reutiliza a Action compartilhada de exclusão e exige a senha atual no corpo JSON. Há também um fluxo web público em `/account-deletion`: a pessoa informa o e-mail, recebe um link de uso único válido por uma hora e confirma a exclusão por POST. O GET do link não exclui dados. Solicitações têm limite de taxa e os tokens são armazenados somente como hash.

O pedido público de exclusão responde de forma igual para e-mails existentes e inexistentes, com limite de 3 solicitações por hora por e-mail normalizado + IP; abrir ou confirmar links tem limite de 10/min por IP.

Antes de publicar ou iniciar teste fechado na Play Store:

- publique a API principal e a página pública de exclusão em HTTPS;
- configure e teste o envio real de e-mail, necessário para confirmação da exclusão;
- publique uma política de privacidade acessível por URL pública e use a mesma URL nos metadados da Play Store;
- confirme o conteúdo da política com os dados reais coletados, finalidades, retenção, fornecedores e procedimentos de exclusão. Este repositório não contém uma política publicada e não substitui essa confirmação;
- informe a URL da página `/account-deletion` como mecanismo de solicitação de exclusão disponível fora do app.

## Deploy e operação

- Caminho escolhido pelo usuário: VM AWS EC2 administrada pelo próprio usuário. O fluxo separado de produção usa Docker Compose, PHP 8.4, MySQL 8.4, Caddy/HTTPS, fila e scheduler; consulte [deploy na AWS](AWS_DEPLOY.md) para conta/VM, domínio gratuito opcional, configuração, validação e backups. Nenhum recurso externo foi criado; conta e domínio ainda precisam ser configurados. O plano gratuito AWS é temporário e depende de créditos/eligibilidade; planejar custos e continuidade antes da distribuição pública.
- A configuração local versionada usa SQLite, sessões/cache/filas no banco e e-mail em `log`. Em produção, configurar um banco persistente (MySQL já é suportado), `APP_KEY` exclusiva, `APP_DEBUG=false`, `APP_URL` HTTPS, sessão/cache/fila conforme os serviços provisionados e um provedor de e-mail real. Nunca reutilizar o `.env` local.
- Configurar a execução do Scheduler para lançamentos recorrentes e expiração de solicitações de exclusão. Validar a configuração de proxies confiáveis com a documentação da plataforma antes de ativá-la, preservando a identificação correta do IP para limites de requisição.
- Configure `APP_ENV=production`, `APP_DEBUG=false`, `APP_KEY` e segredos exclusivos do ambiente.
- Ative HTTPS, configure `APP_URL` e `TrustProxies` de acordo com o balanceador real. A identificação correta do IP é necessária para que limites por IP funcionem como esperado.
- Execute migrations com `php artisan migrate --force`.
- Configure o cron do Laravel Scheduler e um worker de fila se a configuração de e-mail ou outras tarefas de produção usarem fila. O scheduler também gera lançamentos recorrentes, limpa pedidos de exclusão expirados e, somente na instância demo, executa `demo:reset` diariamente.
- Na produção principal, valide primeiro o alvo e execute `php artisan demo:purge --force`; confirme que a conta demo não existe. Na instância isolada de demonstração, configure banco e domínio próprios e monitore o `demo:reset`.
- Não habilite `DEMO_INSTANCE` na produção principal.
- `mobile/eas.json` define um build de teste interno (APK) e um build de produção (AAB). Para iniciar o APK, execute `npx eas-cli@latest init` e depois `npx eas-cli@latest build --profile preview --platform android` na pasta `mobile/`; para o AAB, use `--profile production`. O build EAS exige uma conta, projeto associado e assinatura configurada.
- Configure `EXPO_PUBLIC_API_URL` e `EXPO_PUBLIC_WEB_URL` com URLs HTTPS públicas no ambiente de build; configure `EXPO_PUBLIC_API_URL_DEMO` somente para uma instância isolada publicada. O arquivo `.env` local deste ambiente aponta para um endereço privado HTTP e não serve para um APK distribuível.
- Android Studio, JDK e Android SDK estão instalados e o fluxo de APK local está implementado; ele é independente do EAS. Não foi gerado um AAB de distribuição. O identificador de teste é `com.saldoa.app` e os ícones locais usam a carteira Saldoa; confirme o identificador antes da publicação. Para a Play Store, configure a assinatura de produção, publique a política de privacidade e disponibilize e teste o fluxo público de exclusão de conta.

## APK de teste com HTTPS público — 04/11/2026

O script aceita `--public-api` para compilar localmente sem a exceção de HTTP privado. Informe `EXPO_PUBLIC_API_URL` e `EXPO_PUBLIC_WEB_URL` como `https://saldoa-app.duckdns.org` no ambiente do processo e mantenha a URL demo vazia. O modo exige HTTPS; assinatura de depuração e arquitetura ARM64 permanecem. Consulte o comando completo no README. O banco da AWS é independente do banco local e SMTP real ainda está pendente.

## Robustez do cliente — 04/11/2026

Falhas temporárias de rede/servidor ao restaurar a sessão preservam o token salvo; uma resposta 401 ainda invalida a sessão local. O limite de 15 segundos inclui leitura do corpo JSON/texto, e o temporizador é limpo em todos os caminhos. JSON inválido e interrupção da resposta resultam em erros locais traduzidos. A exportação mensal usa o calendário local, sem alterar endpoints ou contratos de API. A notificação pública de exclusão é processada pela fila existente; SMTP real ainda precisa ser configurado e testado.
