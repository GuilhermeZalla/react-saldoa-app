# API móvel

Esta API fornece o backend JSON para um futuro cliente Expo/React Native. Ela não inclui telas, navegação ou configuração de um aplicativo Android.

## Endereços e instâncias

Use uma implantação e um banco separados para cada ambiente:

- Produção: `EXPO_PUBLIC_API_URL` aponta para a URL HTTPS da API principal.
- Demonstração: `EXPO_PUBLIC_API_URL_DEMO` aponta para a URL HTTPS da instância demo isolada.

O cliente pode oferecer **Experimentar demo** na tela inicial e, antes de autenticar, trocar o cliente HTTP para a URL demo. A instância demo deve usar `DEMO_INSTANCE=true` e `DEMO_LOGIN_ENABLED=true`; nunca deve compartilhar banco, credenciais, backups ou acesso administrativo com a produção. A tela e a troca de URL ainda precisam ser implementadas no aplicativo Expo.

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

- Configure `APP_ENV=production`, `APP_DEBUG=false`, `APP_KEY` e segredos exclusivos do ambiente.
- Ative HTTPS, configure `APP_URL` e `TrustProxies` de acordo com o balanceador real. A identificação correta do IP é necessária para que limites por IP funcionem como esperado.
- Execute migrations com `php artisan migrate --force`.
- Configure o cron do Laravel Scheduler e um worker de fila se a configuração de e-mail ou outras tarefas de produção usarem fila. O scheduler também gera lançamentos recorrentes, limpa pedidos de exclusão expirados e, somente na instância demo, executa `demo:reset` diariamente.
- Na produção principal, valide primeiro o alvo e execute `php artisan demo:purge --force`; confirme que a conta demo não existe. Na instância isolada de demonstração, configure banco e domínio próprios e monitore o `demo:reset`.
- Não habilite `DEMO_INSTANCE` na produção principal. A API ainda não tem um cliente Expo/React Native; os endereços base e o botão “Experimentar demo” serão implementados nessa etapa separada.
