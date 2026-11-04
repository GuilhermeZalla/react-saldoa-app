# Deploy do Saldoa na Oracle Always Free

Estado: arquivos preparados para uma única VM. Nenhuma conta, VM, DNS, certificado ou cópia externa de backup foi criada. Este guia publica o Laravel e o site juntos; o app mobile usa a mesma origem com `/api/v1`.

Validação local: build Linux AMD64, cinco containers isolados, respostas HTTP esperadas, requisitos PHP, backup e importação SQL em um segundo banco descartável passaram. Isso não comprova execução ARM64 na Oracle, SMTP, certificado público nem recuperação após perda da VM; esses pontos continuam pendentes.

## 1. Conta, VM e endereço público

1. Cadastre-se em https://signup.cloud.oracle.com. Faça a verificação de identidade/cartão diretamente na Oracle; não compartilhe senha, cartão, token ou chave SSH privada no chat ou no Git.
2. Escolha a home region com cuidado: os recursos Always Free precisam ser criados nela e a capacidade varia. No console, procure **Always Free**, não apenas os créditos temporários de avaliação.
3. Crie uma VM **Ubuntu 24.04 LTS, ARM64, VM.Standard.A1.Flex**, inicialmente com **1 OCPU, 6 GB RAM e 50 GB de boot volume**. Na documentação consultada em 04/11/2026, o total Always Free A1 é 2 OCPUs/12 GB, com 200 GB de armazenamento de bloco compartilhado pelos volumes. Confira os limites e o resumo de custos da sua conta antes de criar. Se houver falta de capacidade, não substitua a shape por uma paga sem revisar o custo.
4. Crie uma subnet pública e atribua IPv4 público. Guarde a chave SSH fora do repositório e confirme acesso como `ubuntu`. Não exponha MySQL (3306), PHP-FPM (9000) ou Docker (2375/2376).
5. No NSG/security list da Oracle, permita TCP 80/443 da internet e restrinja TCP 22 ao seu IP de administração. Preserve as regras de saída necessárias para DNS, HTTPS, atualizações e SMTP. Confira também o firewall do Ubuntu; não desative nem limpe as regras existentes. Portas publicadas pelo Docker podem contornar regras UFW, por isso a restrição de rede da Oracle também importa.
6. Crie um subdomínio gratuito em https://www.duckdns.org e aponte-o ao IPv4 da VM. É uma alternativa inicial a comprar domínio. Guarde o token DuckDNS fora do Git; o app não precisa dele. Se o IP mudar, atualize o DNS antes de usar o app.

Referências: [limites e recuperação de instâncias ociosas](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm), [DuckDNS](https://www.duckdns.org/about.jsp).

A Oracle pode recuperar VMs gratuitas ociosas. O disco na própria VM e snapshots locais não substituem backups fora dela. Não crie carga artificial para evitar as regras do serviço.

## 2. Preparar a VM

Instale Git, OpenSSL, `flock` (pacote `util-linux`) e Docker Engine com o plugin Compose seguindo a [documentação oficial para Ubuntu](https://docs.docker.com/engine/install/ubuntu/). Use o repositório apt oficial, não scripts de instalação sem revisão. Este fluxo não precisa instalar PHP, Node ou MySQL diretamente no host.

Confirme `sudo docker version` e `sudo docker compose version`. Use Compose 2.24 ou superior. O acesso ao grupo `docker` equivale a administrar o host; os exemplos abaixo usam `sudo`.

Clone o repositório em `/opt/saldoa` com seu usuário de administração. Escolha o commit/branch revisado que contém os arquivos de produção; mudanças apenas locais ainda precisam ser commitadas/enviadas ao GitHub. Não use automaticamente a branch padrão se ela não contém essa etapa.

```bash
sudo mkdir -p /opt/saldoa
sudo chown ubuntu:ubuntu /opt/saldoa
git clone https://github.com/GuilhermeZalla/react-saldoa-app.git /opt/saldoa
cd /opt/saldoa
# git switch NOME_DA_BRANCH_REVISADA
# git checkout COMMIT_REVISADO
```

## 3. Configurar segredos exclusivos

Execute na VM, na raiz do checkout:

```bash
umask 077
cp docker/production.env.example .env.production
mkdir -p .secrets
chmod 700 .secrets
openssl rand -hex 32 > .secrets/mysql-root-password
# O bind mount precisa ser legível pelo usuário mysql no container.
# O diretório pai 0700 continua impedindo outros usuários do host de lerem o arquivo.
chmod 444 .secrets/mysql-root-password
openssl rand -base64 32
openssl rand -hex 32
```

Edite `.env.production` com um editor no servidor. Use o primeiro resultado como `APP_KEY=base64:RESULTADO` e o segundo como `DB_PASSWORD`. A senha de root do MySQL é a que está no arquivo de segredo, distinta da senha da aplicação. Não regenere essas credenciais a cada deploy: as senhas do MySQL só inicializam volumes novos, e mudar a chave do Laravel afeta cookies/dados criptografados.

- `SALDOA_HOST`: só o hostname, por exemplo `seu-saldoa.duckdns.org`, sem `https://`, caminho ou porta.
- `TLS_EMAIL`: e-mail para avisos dos certificados.
- `SALDOA_IMAGE_TAG`: identificador único do código revisado, por exemplo o resultado de `git rev-parse --short HEAD`. Não reutilize a tag em atualizações se precisar voltar à imagem anterior.
- `DB_DATABASE`/`DB_USERNAME`: mantenha `saldoa` em uma VM nova e configure uma senha aleatória.
- `MAIL_*`: use SMTP real e um remetente autorizado pelo provedor. O subdomínio DuckDNS não cria uma caixa postal nem autoriza envio de e-mail; o remetente precisa ser validado separadamente. Porta 587 normalmente usa `MAIL_SCHEME=smtp`; 465 usa `smtps`.
- Coloque valores com caracteres especiais entre aspas simples no arquivo de ambiente. Não publique o resultado de `docker compose config` sem `--quiet`, pois ele contém segredos.

A configuração de produção fixa debug desligado, cookies seguros, logs no stderr, banco/cache/sessão/filas persistentes e demonstração desativada. Somente o container MySQL recebe o segredo de root. `.env.production` e `.secrets/` ficam fora do Git e do contexto de build.

## 4. Primeiro deploy

Os comandos abaixo são para a VM nova, depois de preencher todos os valores de exemplo e confirmar DNS/portas. Não rode `composer run setup`, seeders ou resets da demo em produção.

```bash
cd /opt/saldoa
sudo docker compose --env-file .env.production -f docker-compose.production.yml config --quiet
sudo docker compose --env-file .env.production -f docker-compose.production.yml build app web
sudo docker compose --env-file .env.production -f docker-compose.production.yml up -d database
sudo docker compose --env-file .env.production -f docker-compose.production.yml run --rm --user www-data app php artisan migrate --force --no-interaction
sudo docker compose --env-file .env.production -f docker-compose.production.yml up -d
sudo docker compose --env-file .env.production -f docker-compose.production.yml exec --user www-data app php artisan optimize --no-interaction
sudo docker compose --env-file .env.production -f docker-compose.production.yml ps
```

O Caddy serve apenas `public/`, encaminha PHP ao FPM e emite/renova HTTPS. Não há proxy HTTP intermediário neste desenho: o Caddy envia os parâmetros FastCGI de IP e HTTPS ao Laravel. Não adicione `trustProxies('*')` por padrão. Se adicionar Cloudflare, balanceador ou outro proxy, revise a cadeia de confiança antes.

`app-storage`, `mysql-data` e os certificados do Caddy usam volumes persistentes. **Não use `down --volumes`, `volume prune` ou `system prune --volumes` nesse projeto:** isso pode apagar os dados. Não exponha o daemon Docker.

A VM deve manter Docker habilitado na inicialização (`sudo systemctl enable docker`). O Compose usa `restart: unless-stopped`; serviços parados manualmente precisam ser iniciados novamente. O serviço `scheduler` executa o Laravel Scheduler e `worker` processa a fila do banco, com parada graciosa. Não adicione outro cron para `schedule:run` enquanto o serviço scheduler estiver ativo.

## 5. Conferência antes de distribuir o app

- `https://HOST/up` deve responder 200. Esse teste só comprova o boot do Laravel; não comprova banco nem e-mail.
- `GET https://HOST/api/v1/auth/me` sem token deve responder 401 JSON.
- Abra o site/login, crie uma conta de teste e confirme cadastro/login, isolamento dos dados, lançamento, meta, exportação e logout. Em produção, a política de senha é mais exigente.
- Valide no site o e-mail de recuperação e o fluxo `/account-deletion`, inclusive recebimento e confirmação por POST com uma conta descartável. Não use uma conta com dados que queira manter.
- Verifique fila e scheduler com `docker compose ... logs --tail=100 worker scheduler`, sem publicar tokens ou conteúdo sensível dos logs.
- Confirme certificado válido e ausência de acesso às portas 3306/9000 pela internet. Consulte `docker compose ... ps`; somente `web` deve publicar 80/443.
- Configure no build mobile `EXPO_PUBLIC_API_URL=https://HOST` e `EXPO_PUBLIC_WEB_URL=https://HOST`, sem `/api/v1`. A demo permanece vazia até existir uma segunda instância realmente isolada.
- Gere um build de distribuição e teste no celular por dados móveis. O comando `apk:local` aceita apenas HTTP privado e não é o comando deste build público. Assinatura, EAS/AAB, política de privacidade e exigências atuais da Play Store são uma etapa posterior.

## 6. Backups e recuperação

O script não roda sozinho nem envia arquivos a um serviço externo. Na VM:

```bash
sudo bash /opt/saldoa/docker/backup-production.sh
```

Ele cria um diretório 0700 em `/var/backups/saldoa` com dump consistente do MySQL, arquivos de storage e configuração/chaves. Não passa senhas no argumento do cliente MySQL. Um marcador `INCOMPLETE` identifica tentativas interrompidas; somente backups sem esse marcador e com verificação de arquivos concluída podem ser considerados para recuperação. O snapshot do banco e a cópia dos arquivos não são uma transação conjunta; para mudanças simultâneas nos arquivos, programe uma janela breve de manutenção.

Depois do primeiro backup validado, o administrador pode agendar no crontab de root:

```cron
30 3 * * * /usr/bin/bash /opt/saldoa/docker/backup-production.sh >> /var/log/saldoa-backup.log 2>&1
```

Os arquivos incluem dados financeiros e segredos. Proteja a cópia externa com criptografia e guarde a chave de recuperação em outro local. Automatizar a cópia externa, definir retenção/alertas de falha/espaço e testar restauração ainda são tarefas obrigatórias antes de tratar esta instalação como confiável para dados reais. O script não remove backups antigos automaticamente.

Para ensaiar recuperação, use uma **segunda instalação isolada**, nunca o banco ativo:

1. Recrie os serviços a partir do commit/imagens do backup e restaure a configuração/chaves antes de iniciar o app. Ajuste só domínio e SMTP para o ambiente isolado.
2. Inicialize o MySQL vazio com as mesmas credenciais e importe `database.sql.gz` via cliente MySQL no container. Restaure `storage.tar.gz` no volume de storage e confira usuário/permissões.
3. Suba o app isolado e confira contagens, login e leitura dos registros. Não execute uma migração de versão nova antes de confirmar a recuperação da versão original.
4. Só depois de um ensaio aprovado considere usar o procedimento numa falha real. Arquivos de backup apenas existentes não comprovam recuperação.

## 7. Atualizações

Faça backup e registre o commit/tag anterior. Compile imagens com uma tag nova antes da janela de manutenção. Pare scheduler/worker, ative `php artisan down`, aplique migrations na nova imagem, recrie os serviços, execute `optimize` e finalize com `php artisan up`. O arquivo de manutenção está no storage compartilhado. Valide saúde, autenticação e assets antes de liberar usuários.

Não aplique rollback de migrations ou restauração em cima do banco ativo automaticamente. Voltar a uma imagem anterior só funciona se ela continuar compatível com o schema atual. Preserve as imagens e o backup anteriores até aprovar a nova versão.
