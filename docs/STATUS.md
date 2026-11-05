# Estado do projeto

Atualizado em 04/11/2026. Projeto de controle financeiro pessoal e portfólio. **Web iniciado em 2025; mobile criado em 2026**, conforme informação do autor.

## Produto e publicação

- Site público: https://saldoa-app.duckdns.org, com HTTPS e título `Bem-vindo - Saldoa`.
- Release Android: https://github.com/GuilhermeZalla/react-saldoa-app/releases/tag/mobile-v1.0.0-preview.1.
- O APK de teste usa a API pública, é ARM64, assinado com chave de depuração e não está na Play Store. A tag da Release aponta para `9fb436f`; o hash do APK é `dab39f980804367d505ca31b387561a608bfeb54385fd63533e8a72f0e445040`.
- O autor confirmou o primeiro APK público por dados móveis. O build seguinte com a marca Fluxo foi compilado e teve assinatura/URL conferidas, mas ainda aguarda retorno específico do aparelho.
- Marca aprovada: opção 01 — Fluxo, aplicada ao site, favicon, login mobile, ícones e abertura. A capa para o portfólio foi mantida.
- Dashboard, lançamentos, categorias, metas, recorrências, exportação e gestão da conta disponíveis. Mobile com português/inglês e temas claro/escuro/sistema.

## Código e qualidade

- `feat/mobile-api` foi integrado à `main` com autorização do usuário, preservando as outras branches.
- O CI instala também as dependências mobile para resolver `expo/tsconfig.base`. A execução da integração na `main` passou: https://github.com/GuilhermeZalla/react-saldoa-app/actions/runs/41951167374.
- Revisão recente: preservação da sessão em falhas temporárias; invalidação em 401; timeout incluindo leitura do corpo e limpeza do temporizador; tratamento de JSON inválido/interrupção; exportação pelo mês local; limpeza do build resiliente.
- A notificação pública de exclusão usa a fila existente. SMTP real continua pendente; não considerar recuperação de senha e confirmação de exclusão por e-mail prontas para produção.
- Evidência anterior: 13 testes mobile, um teste unitário PHP específico, tipos, lint, builds e assinatura do APK aprovados. O CI executou as verificações do backend em ambiente isolado.
- Histórico revisado com autorização do titular: removidas dez linhas de coautoria do Copilot. As branches `main` e `feat/mobile-api` e a tag da Release foram atualizadas com proteção contra alterações remotas concorrentes. Conferidos 41 commits; as árvores de arquivos, os autores, as datas e o APK foram preservados na reescrita. Backup Git completo e mapa dos commits em `.secrets/history-cleanup-20261104-235026/`, somente local e ignorado pelo Git.

## Infraestrutura AWS

- EC2 `t3.small`, Ohio (`us-east-2`), Ubuntu 26.04.1 LTS, x86_64. Docker Compose executa web/Caddy, app/Laravel, MySQL 8.4, worker e scheduler.
- Conferência atual por SSH: cinco serviços ativos; banco saudável; aproximadamente 1,9 GiB de RAM, swap de 4 GiB e 17 GiB livres no disco raiz de 28 GiB.
- Projeto em `/opt/saldoa`. Credenciais somente no servidor; banco em volume persistente, sem porta 3306 publicada. Apenas web publica 80/443.
- O checkout da EC2 recebeu alterações diretas nas publicações e precisa de sincronização cuidadosa antes de atualizações via Git. Imagens anteriores foram preservadas como `pre-flow` e `pre-favicon`.
- A remoção da coautoria mudou os hashes do histórico publicado. Antes do próximo deploy, reconciliar o checkout da EC2 com a nova `main`, preservando ajustes locais e credenciais; não executar `git pull` automaticamente sobre o histórico anterior.
- O deploy continua manual. Enviar ao GitHub não atualiza a EC2. A configuração do deploy automático foi reservada para a retomada em 05/11/2026, depois da prioridade de publicação na Play Store.
- O titular informou US$ 100 em créditos; plano, saldo efetivo, prazo e modo de créditos CPU não foram conferidos no Billing.
- O titular decidiu manter a instância ligada por sete dias, com pouco tráfego, para observar o consumo real. Comparar custos e saldo de créditos ao final do período; a estimativa discutida não substitui os valores do Billing.

## Revisão de documentação e imagens

- README principal reescrito para apresentar o produto a terceiros, com seção Preview, capa, funcionalidades, imagens estáticas e passos locais essenciais. Criado `mobile/README.md` para instalação, uso e desenvolvimento do app.
- Capturas web e mobile renovadas com a marca atual. Telas públicas vêm do site; telas privadas usam dados fictícios interceptados apenas no navegador. Nenhuma conta real ou dado de produção foi usado nessas capturas.
- Removidos GIFs, alternativas de logo descartadas e capturas duplicadas sem referência. Mantidos o SVG aprovado e a capa PNG/SVG. Instruções de agentes e licenças das fontes foram preservadas.
- `AWS_DEPLOY.md` foi mantido: serve para reconstruir a implantação. `MOBILE_API.md` foi mantido: registra contratos e segurança da API. Trechos desatualizados corrigidos.
- Criado `AWS_OPERACAO.md` com acesso, logs, banco, backup e custos. Criada apresentação de entrevista em PDF, com fonte HTML editável, em quatro páginas.
- Validação desta etapa: 29 capturas renovadas, sem erros JavaScript durante a captura; links locais conferidos; zero GIFs; PDF com quatro páginas, texto selecionável e três links; 13 testes mobile e `npm run check` sem erros/avisos. Descrição da Release atualizada para leitores externos. Documentação e imagens incorporadas ao repositório.
- Esta etapa altera documentação e imagens; não executa migrations, seeders nem alterações de banco. Não instala dependências novas no projeto.

## Próximos passos

Retomada planejada para **05/11/2026**, por decisão do usuário. As pendências abaixo ficam para a retomada; o encerramento de hoje incluiu a atualização do planejamento e a remoção autorizada da coautoria no histórico.

1. **Prioridade: publicação na Play Store.** Começar pela situação da conta no Play Console e pelos requisitos aplicáveis; preparar política de privacidade, assinatura de distribuição, AAB e materiais da loja. Conferir as pendências de e-mail, backup e validação no aparelho antes de considerar o app pronto para publicação. A conclusão depende dos requisitos de teste e análise da loja.
2. Configurar deploy automático com GitHub Actions a partir de push na branch de publicação, com sincronização cuidadosa do checkout da EC2 e recuperação da versão anterior.
3. Configurar e testar envio real de e-mails para recuperação de senha e confirmação de exclusão.
4. Concluir backup externo protegido, retenção e restauração em instalação isolada.
5. Receber o retorno do APK com a marca Fluxo no aparelho, incluindo login, navegação, temas e idiomas.
6. Confirmar plano/saldo/prazo AWS, avaliar alerta de orçamento e acompanhar o consumo durante os sete dias com a instância ligada.

## Referências

- [Apresentação do projeto](../README.md)
- [Aplicativo mobile](../mobile/README.md)
- [Operação AWS](AWS_OPERACAO.md)
- [Implantação AWS](AWS_DEPLOY.md)
- [API mobile](MOBILE_API.md)
- [Guia de entrevista](apresentacao-entrevista-saldoa.pdf)
