# Estado do projeto

Atualizado em 05/11/2026. Projeto de controle financeiro pessoal e portfólio. **Web iniciado em 2025; mobile criado em 2026**, conforme informação do autor.

## Produto e publicação

- Site público: https://saldoa-app.duckdns.org, com HTTPS e título `Bem-vindo - Saldoa`.
- Release Android: https://github.com/GuilhermeZalla/react-saldoa-app/releases/tag/v1.0.0.
- O APK de teste usa a API pública, é ARM64, assinado com chave de depuração e não está na Play Store. O APK validado é o mesmo binário da prévia anterior, sem alteração de código mobile nesta etapa; o hash é `dab39f980804367d505ca31b387561a608bfeb54385fd63533e8a72f0e445040`.
- O titular confirmou o último APK com a marca Fluxo no aparelho: login, lançamentos, categorias, metas, exportação, temas e idiomas funcionais, sem problemas encontrados.
- Marca aprovada: opção 01 — Fluxo, aplicada ao site, favicon, login mobile, ícones e abertura. A capa para o portfólio foi mantida.
- Dashboard, lançamentos, categorias, metas, recorrências, exportação e gestão da conta disponíveis. Mobile com português/inglês e temas claro/escuro/sistema.

## Código e qualidade

- `feat/mobile-api` foi integrado à `main` com autorização do usuário, preservando as outras branches.
- O CI instala também as dependências mobile para resolver `expo/tsconfig.base`. A execução da integração na `main` passou: https://github.com/GuilhermeZalla/react-saldoa-app/actions/runs/41951167374.
- Revisão recente: preservação da sessão em falhas temporárias; invalidação em 401; timeout incluindo leitura do corpo e limpeza do temporizador; tratamento de JSON inválido/interrupção; exportação pelo mês local; limpeza do build resiliente.
- A notificação pública de exclusão usa a fila existente. SMTP Gmail configurado em 05/11/2026, com autenticação TLS, envio aceito e recebimento confirmado na caixa de entrada. Doze testes existentes de recuperação/exclusão passaram (71 assertions); o titular também confirmou os dois fluxos completos pelos links recebidos, usando conta descartável.
- Evidência anterior: 13 testes mobile, um teste unitário PHP específico, tipos, lint, builds e assinatura do APK aprovados. O CI executou as verificações do backend em ambiente isolado.
- Histórico revisado com autorização do titular: removidas dez linhas de coautoria do Copilot. As branches `main` e `feat/mobile-api` e a tag da Release foram atualizadas com proteção contra alterações remotas concorrentes. Conferidos 41 commits; as árvores de arquivos, os autores, as datas e o APK foram preservados na reescrita. Backup Git completo e mapa dos commits em `.secrets/history-cleanup-20261104-235026/`, somente local e ignorado pelo Git.

## Infraestrutura AWS

- EC2 `t3.small`, Ohio (`us-east-2`), Ubuntu 26.04.1 LTS, x86_64. Docker Compose executa web/Caddy, app/Laravel, MySQL 8.4, worker e scheduler.
- Conferência atual por SSH: cinco serviços ativos; banco saudável; aproximadamente 1,9 GiB de RAM, swap de 4 GiB e 17 GiB livres no disco raiz de 28 GiB.
- Projeto em `/opt/saldoa`. Configuração privada de produção no servidor e arquivos locais sensíveis ignorados pelo Git; banco em volume persistente, sem porta 3306 publicada. Apenas web publica 80/443.
- O checkout da EC2 recebeu alterações diretas nas publicações e precisa de sincronização cuidadosa antes de atualizações via Git. Imagens anteriores foram preservadas como `pre-flow` e `pre-favicon`.
- A remoção da coautoria mudou os hashes do histórico publicado. Antes do próximo deploy, reconciliar o checkout da EC2 com a nova `main`, preservando ajustes locais e credenciais; não executar `git pull` automaticamente sobre o histórico anterior.
- O titular decidiu em 05/11/2026 manter o plano gratuito atual e dispensar deploy automático. Publicações serão manuais, com backup e revisão do estado da EC2. Push no GitHub continua separado da publicação. A Play Store permanece como última prioridade.
- O titular confirmou a permanência no plano gratuito da experiência simplificada. Os US$ 100 foram informados pelo titular; saldo efetivo, prazo e modo de créditos CPU continuam sujeitos à conferência em AWS Settings/Billing.
- O titular decidiu manter a instância ligada por sete dias, com pouco tráfego, para observar o consumo real. Comparar custos e saldo de créditos ao final do período; a estimativa discutida não substitui os valores do Billing.

## Revisão de documentação e imagens

- README principal reescrito para apresentar o produto a terceiros, com seção Preview, capa, funcionalidades, imagens estáticas e passos locais essenciais. Criado `mobile/README.md` para instalação, uso e desenvolvimento do app.
- Capturas web e mobile renovadas com a marca atual. Telas públicas vêm do site; telas privadas usam dados fictícios interceptados apenas no navegador. Nenhuma conta real ou dado de produção foi usado nessas capturas.
- Removidos GIFs, alternativas de logo descartadas e capturas duplicadas sem referência. Mantidos o SVG aprovado e a capa PNG/SVG. Instruções de agentes e licenças das fontes foram preservadas.
- `AWS_DEPLOY.md` foi mantido: serve para reconstruir a implantação. `MOBILE_API.md` foi mantido: registra contratos e segurança da API. Trechos desatualizados corrigidos.
- Criado `AWS_OPERACAO.md` com acesso, logs, banco, backup e custos. Criada apresentação de entrevista em PDF, com fonte HTML editável, em quatro páginas.
- Validação desta etapa: 29 capturas renovadas, sem erros JavaScript durante a captura; links locais conferidos; zero GIFs; PDF com quatro páginas, texto selecionável e três links; 13 testes mobile e `npm run check` sem erros/avisos. Descrição da Release atualizada para leitores externos. Documentação e imagens incorporadas ao repositório.
- Esta etapa altera documentação e imagens; não executa migrations, seeders nem alterações de banco. Não instala dependências novas no projeto.
- Capa do Preview recomposta em **1920 × 1320 (16:11)**, na proporção do cartão do portfólio. SVG e PNG atualizados com as capturas existentes, as fontes da marca e margem para o enquadramento. Conferência visual em um cartão de 1072 × 737 e outro de 350 × 280, sem erros de carregamento nem rolagem horizontal.
- Criada uma segunda capa horizontal em **1920 × 1080 (16:9)**: `docs/images/saldoa-portfolio-cover-wide.png` e `.svg`. Logo e dispositivos reposicionados para o quadro horizontal, sem substituir a versão 16:11. Conferência visual em 1120 × 630 e 350 × 197, com fontes e imagens carregadas, sem erros JavaScript nem rolagem horizontal.
- Após a sincronização anterior, `feat/mobile-api` recebeu um README exclusivo do mobile, com apenas imagens do app. A `main` mantém a apresentação web/mobile; preservar essa diferença nas próximas integrações.

## Operação e automação — 05/11/2026

- Gmail configurado com senha de app fora do Git. Autenticação TLS e envio real aprovados; recebimento na caixa de entrada confirmado pelo titular. Site respondeu HTTP 200 após recriar app/worker/scheduler.
- Criados `docker/backup-encrypted.sh` e `docker/verify-backup.sh`. Backup inclui SQL, storage e configuração, com criptografia autenticada AES-256-GCM e chave pública RSA. Chave privada somente no notebook (`.secrets/backup-private-key.pem`), com ACL restrita; nunca enviada à EC2.
- Cópia criptografada externa em `.secrets/backups/saldoa-current.cms`. SQL restaurado em MySQL temporário sem rede e com volume próprio, removido após o teste. Dados e DDL conferidos, normalizando apenas declarações redundantes de charset. Storage/configuração tiveram integridade e checksums conferidos; na etapa de fechamento, a aplicação também foi recuperada em containers isolados a partir do arquivo recebido por Gmail. Reconstrução de outra VM é um procedimento de operação separado.
- Backup diário ativo por Gmail: `SALDOA_BACKUP_DELIVERY=gmail`. Timer habilitado às 06:30 UTC (03:30 em São Paulo), com até dez minutos de atraso aleatório. Serviço executado com sucesso e recebimento confirmado. Cópia Gmail com checksum idêntico ao servidor e recuperação completa isolada aprovados. S3 não é utilizado.
- A tentativa de stack `saldoa-automation` falhou: `iam:CreateOpenIDConnectProvider` negado explicitamente por SCP. Criação de `OperationsBucket` cancelada, com evento posterior `DELETE_SKIPPED`; existência/conteúdo do bucket ainda não conferidos. CloudShell também bloqueado por verificação da conta. Não há autorização para upgrade ou ativação de recursos avançados.
- Por decisão do titular, retirados dos arquivos candidatos a commit os quatro rascunhos de automação: workflow, template CloudFormation, helper AWS e script de deploy. Arquivados em `.secrets/deferred-deploy-20261105/`, ignorado pelo Git. Helper instalado na EC2 permanece sem acionamento configurado; nenhum deploy automático foi executado. Scripts de backup e verificação foram preservados.
- Suíte Laravel completa: 154 testes aprovados, 2 ignorados e 1.343 assertions, sem avisos após remover o import redundante `RuntimeException` de `DemoDataSeederTest.php`. Os dois testes ignorados dependem de autenticação em dois fatores, desativada no projeto. Nenhuma regra de negócio ou teste foi removido.
- Verificações: `npm run check` aprovado; sintaxe Bash conferida; quatro simulações de deploy passaram (sucesso, migrations pendentes, falha na troca e falha de saúde). As simulações usam Docker fictício e não comprovam integração AWS ou rollback real.
- Nenhuma dependência do projeto adicionada; nenhum dado ou schema do banco de produção alterado. Os 12 testes Laravel usaram SQLite em memória e passaram com 71 assertions.

## Fechamento da versão 1.0 — 05/11/2026

Escopo: versão funcional web e Android para portfólio, com distribuição direta do APK. **Play Store, assinatura de distribuição/AAB e deploy automático estão fora desta entrega.** O APK permanece ARM64 e assinado para testes; isso está explícito nos READMEs e na Release.

- [x] Último APK confirmado no aparelho pelo titular.
- [x] Recuperação de senha e exclusão por link de e-mail confirmadas pelo titular com conta descartável.
- [x] Backup externo diário por Gmail habilitado, sem upgrade AWS ou dependências novas.
- [x] Recebimento dos anexos confirmado; checksum do arquivo recebido idêntico ao da EC2.
- [x] Recuperação de SQL, storage, APP_KEY, web e API em containers isolados, sem portas públicas ou internet. Cadastro, autenticação, lançamento, dashboard, exportação e exclusão passaram.
- [x] Falhas de protocolo verificadas: arquivo sem criptografia, anexo acima de 15 MiB, recusa SMTP e adulteração criptográfica rejeitados. Aviso de falha tenta usar o mesmo SMTP; ausência do e-mail diário requer conferência manual.
- [x] READMEs principal e mobile em inglês, mantendo imagens exclusivas do app na apresentação mobile e datas web 2025/mobile 2026.
- [x] `composer ci:check`, build web, 13 testes mobile, tipos e lint mobile aprovados. Assinatura, pacote, versão 1.0.0 e ARM64 do APK conferidos.
- [x] Integridade do código publicado conferida: 203 arquivos de runtime idênticos ao checkout que fecha a 1.0; nenhuma recompilação do app ou migration necessária nesta etapa.

A publicação Git/Release é registrada no fechamento desta entrega. A branch `main` apresenta web e mobile; `feat/mobile-api` preserva um README voltado ao app, também em inglês.

## Operação contínua e próximas versões

1. Acompanhar o e-mail diário, o espaço da caixa Gmail e o disco da EC2. Manter cópias locais por pelo menos sete dias e retenção manual no Gmail; guardar a chave privada de recuperação em uma segunda localização segura fora do notebook.
2. Conferir recursos retidos da stack que falhou, antes de qualquer limpeza, sem alterar a EC2 ou volumes do Saldoa.
3. Consultar créditos, prazo e consumo em AWS Settings/Billing durante o período de observação. O plano gratuito foi mantido; não ativar recursos avançados como parte de uma rotina de publicação.
4. Realizar deploy manual quando houver mudanças de aplicação, com CI aprovado, backup e preservação de imagens/ajustes locais. Push não atualiza o site.
5. Por último, em outra etapa: Play Console, política de privacidade, assinatura de distribuição, AAB e materiais da loja.

## Referências

- [Apresentação do projeto](../README.md)
- [Aplicativo mobile](../mobile/README.md)
- [Operação AWS](AWS_OPERACAO.md)
- [Implantação AWS](AWS_DEPLOY.md)
- [API mobile](MOBILE_API.md)
