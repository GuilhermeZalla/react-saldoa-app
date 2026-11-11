# API móvel

Esta API fornece o backend JSON autenticado por tokens Sanctum para o aplicativo Expo/React Native em `mobile/`. A interface nativa cobre autenticação, leitura do dashboard e gestão de lançamentos, categorias, metas e recorrências, além de exportação e gestão da conta. A release estável Android usa a API pública HTTPS; versão, download e validações estão no status do projeto. Para instalação e uso, consulte [mobile/README.md](../mobile/README.md).

## Endereços e instâncias

Use uma implantação e um banco separados para cada ambiente:

- Produção: `EXPO_PUBLIC_API_URL` aponta para a URL HTTPS da API principal.
- Demonstração: `EXPO_PUBLIC_API_URL_DEMO` aponta para a URL HTTPS da instância demo isolada.

O cliente oferece o link discreto **Experimentar sem criar conta** abaixo do formulário, somente quando `EXPO_PUBLIC_API_URL_DEMO` contém uma URL válida para o build. A ausência de configuração oculta o link, sem mostrar instruções técnicas ao usuário. Isso se aplica a APKs locais e de distribuição: a demo não depende do tipo de APK. O endereço deve apontar para uma instância disponível com a demonstração habilitada; a presença do link não é uma verificação de saúde do servidor. Antes de autenticar, o cliente usa a URL demo. A sessão salva o host de origem junto com o token para impedir que um token demo seja enviado ao host de produção ou vice-versa. A instância demo deve usar `DEMO_INSTANCE=true` e `DEMO_LOGIN_ENABLED=true`; nunca deve compartilhar banco, credenciais, backups ou acesso administrativo com a produção.

As URLs base são configuradas sem `/api/v1` e incorporadas ao APK durante o build. Alterar `mobile/.env` não muda um APK já instalado. Configuração local, conectividade e comandos de build estão no [README mobile](../mobile/README.md).

## Idioma e formatos do cliente

O cliente envia `Accept-Language` em português ou inglês. O backend não negocia o idioma das validações: em português o app preserva os detalhes recebidos; em inglês mostra os nomes traduzidos dos campos inválidos. Conteúdo criado pelo usuário não é traduzido. A moeda permanece BRL; datas editáveis usam dia/mês/ano e são normalizadas para ISO antes do envio.

Tema e idioma são preferências locais ao dispositivo. Tokens são guardados no SecureStore no Android; na prévia web o token fica em memória. A sessão mantém o host de origem para separar produção e demonstração.

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

Tokens comuns expiram em até 10 dias (`SANCTUM_TOKEN_EXPIRATION`, em minutos; padrão e teto de 14400). Valores menores continuam permitidos; configurações antigas de 30 dias são limitadas a 10 dias. Tokens demo expiram em 60 minutos por padrão (`DEMO_TOKEN_EXPIRATION`). A rotação exige o token atual ainda válido; não há refresh token separado. O app não renova automaticamente a sessão: pede novo login após o prazo, incluindo ao voltar do segundo plano. Sessões antigas sem registro do início da autenticação são removidas localmente na atualização, exigindo um novo login.

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

O dashboard inclui `data.upcomingTransactions`: até 20 próximas ocorrências de recorrências do próprio usuário, ordenadas por data e ID, com `id`, `description`, `amount`, `type`, `date` e `category`. A agenda considera a próxima ocorrência a partir de hoje, no mês selecionado e respeitando `end_date`; não cria lançamentos nem altera saldos. O cliente trata o campo como opcional.

O histórico aceita `month`, `type`, `search` e `page`; busca é por descrição e exportação mantém os mesmos filtros da consulta.

Erros da API têm o formato `{"error":{"code":"...","message":"...","details":...}}`. Validação usa HTTP 422; não autenticado 401; não autorizado 403; recurso inexistente 404; limite excedido 429. Login com credenciais inválidas responde 401.

Falhas temporárias de rede/servidor ao restaurar a sessão preservam o token salvo; uma resposta 401 invalida a sessão local. O limite de 15 segundos inclui leitura do corpo JSON/texto, e o temporizador é limpo em todos os caminhos. JSON inválido e interrupções da resposta resultam em erros locais traduzidos. A exportação mensal usa o calendário local.

Na instância demo, as respostas de leitura continuam disponíveis, mas requisições de escrita com o usuário demo são bloqueadas por middleware. Logout e rotação de token continuam disponíveis para o cliente.

## Exclusão de conta

O endpoint autenticado `DELETE /api/v1/account` reutiliza a Action compartilhada de exclusão e exige a senha atual no corpo JSON. Há também um fluxo web público em `/account-deletion`: a pessoa informa o e-mail, recebe um link de uso único válido por uma hora e confirma a exclusão por POST. O GET do link não exclui dados. Solicitações têm limite de taxa e os tokens são armazenados somente como hash.

O pedido público de exclusão responde de forma igual para e-mails existentes e inexistentes, com limite de 3 solicitações por hora por e-mail normalizado + IP; abrir ou confirmar links tem limite de 10/min por IP.

A política de privacidade já está publicada em `/privacy-policy`, com `?lang=en` para inglês; o texto é mantido em [privacy-policy.tsx](../resources/js/pages/privacy-policy.tsx). A exclusão do banco ativo não remove imediatamente os backups históricos. Revisão da retenção e declarações da Play Store permanecem nas [pendências do projeto](STATUS.md#pendências).

## Implantação e desenvolvimento

A API principal está em `https://saldoa-app.duckdns.org`. Procedimentos de servidor estão em [AWS_DEPLOY.md](AWS_DEPLOY.md) e [AWS_OPERACAO.md](AWS_OPERACAO.md). Instalação, configuração e build do cliente estão no [README mobile](../mobile/README.md); versões e validações ficam no [STATUS.md](STATUS.md).
