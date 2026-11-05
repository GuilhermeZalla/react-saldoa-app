# Deploy do Saldoa na AWS EC2

Referência técnica para instalar ou reconstruir o ambiente. Para acesso diário, logs, banco e custos, use [AWS_OPERACAO.md](AWS_OPERACAO.md).

Destino escolhido em 04/11/2026: uma instância EC2 administrada pelo usuário, executando Laravel/site, MySQL, Caddy/HTTPS, scheduler e worker com o Docker Compose de produção existente. O app mobile usa a mesma origem com `/api/v1`.

Estado verificado por SSH em 04/11/2026: EC2 `t3.small` na região `us-east-2` (Ohio), Ubuntu 26.04.1 LTS, x86_64, 1,9 GiB RAM e disco raiz de 28 GiB. Docker 29.9.3 e Compose 5.7.0 instalados; Docker habilitado no boot. Swap de 4 GiB ativo e registrado em `/etc/fstab`, sem teste de reboot. Código do commit `242f69f` em `/opt/saldoa`; imagens de produção compiladas na própria VM. MySQL saudável, migrations existentes aplicadas e app/scheduler/worker iniciados, sem portas publicadas. O serviço web está publicado em `https://saldoa-app.duckdns.org`, com HTTPS válido e redirecionamento HTTP; somente ele publica portas 80/443. Chaves e senhas foram geradas somente no servidor. Plano/saldo AWS, SMTP real e backup externo continuam pendentes.

A infraestrutura genérica já passou por build Linux AMD64, cinco containers isolados, respostas HTTP esperadas, requisitos PHP, execução do backup e restauração SQL num segundo banco descartável. Essa evidência vem da preparação anterior (commit `242f69f`); os arquivos Docker não mudaram na troca de provedor. O build e a inicialização interna na EC2 passaram; dimensionamento sob carga, SMTP e recuperação após perda do servidor continuam pendentes.

Validação pública em 04/11/2026: `/up` e `/login` responderam 200 via HTTPS, HTTP redirecionou com 308, `/api/v1/auth/me` sem token respondeu 401 e `/.env` respondeu 404. Desde essa validação inicial, foi publicado um APK de teste com API pública HTTPS; o usuário confirmou acesso por dados móveis na primeira compilação pública. A compilação seguinte com a marca Fluxo está disponível na Release e ainda aguarda novo retorno do aparelho. SMTP real ainda não foi configurado, portanto recuperação de senha e confirmação de exclusão por e-mail não estão prontas para uso público.

## 1. Conta, custos, EC2 e endereço público

### Cadastro e período gratuito

1. Inicie pelo [cadastro oficial AWS](https://aws.amazon.com/free/). Para uso pessoal, escolha a modalidade pessoal quando o formulário oferecer a distinção de conta empresarial. O cadastro e a aceitação dos termos devem ser feitos pelo titular; não compartilhe documentos, cartão, senha, códigos MFA ou access keys no chat/Git.
2. Para esta avaliação, escolha **Free account plan**, se disponível para sua conta nova. Ele dá créditos e prazo limitado; não representa hospedagem EC2 gratuita permanente. Confira em Billing o plano efetivamente selecionado, saldo, validade e ofertas aplicadas à sua conta antes de criar recursos.
3. A documentação consultada em 04/11/2026 informa US$ 100 de crédito inicial e até mais US$ 100 por atividades elegíveis. O plano gratuito termina após seis meses ou esgotamento dos créditos, o que ocorrer primeiro. Contas antigas seguem regras diferentes. Não conte com seis meses completos sem medir o consumo.
4. Planeje a continuidade antes de distribuir o app para usuários: ao final do plano gratuito, sem upgrade, pode haver encerramento da conta e perda de acesso aos recursos. No plano pago, custos além dos créditos são cobrados conforme o uso. Não faça upgrade nem contrate suporte pago como parte automática deste guia.
5. Ative MFA na conta e acompanhe Billing/Free Tier. Se configurar alertas de orçamento, lembre que **alerta não é um bloqueio rígido de gastos**. Não crie credenciais do usuário root para colocar na VM: o Saldoa não precisa de access keys AWS para este desenho.

Referências: [planos AWS](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/free-tier-plans.html), [Free Tier EC2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-free-tier-usage.html), [cadastro pessoal/empresarial](https://docs.aws.amazon.com/hands-on/latest/setup-environment/module-one.html).

### Configuração inicial proposta (confirmar no console antes de lançar)

- **Região:** comparar preço e latência entre `us-east-1` (N. Virginia) e `sa-east-1` (São Paulo); não selecionar automaticamente com base apenas em proximidade. Todos os recursos deste primeiro ambiente ficam na mesma região.
- **Uma EC2**, nome `saldoa`, AMI Ubuntu Server 24.04 LTS oficial da Canonical, arquitetura **x86_64/AMD64**. Evite imagens Marketplace com cobrança adicional.
- **`t3.small` (2 GiB RAM)** como ponto inicial de teste de baixo tráfego, caso esteja elegível/disponível na conta/região. Seu tamanho precisa ser validado sob carga; o build pode precisar de swap. Não escolher uma instância maior apenas porque tem o selo Free Tier: o consumo de créditos muda. Instâncias micro têm ainda menos memória para todos os serviços juntos.
- **Créditos CPU em Standard**, quando disponível, para evitar cobrança de CPU excedente do modo Unlimited. Standard pode limitar desempenho depois do consumo dos créditos de CPU; isso não limita os demais custos da conta.
- **EBS gp3 de 30 GiB criptografado**, sem aumentar IOPS/throughput. O banco e os arquivos ficam em volumes Docker neste disco; não são um RDS gerenciado. Confira custos de armazenamento/snapshots e o comportamento de exclusão do disco ao terminar a instância.
- **Uma subnet pública**, com rota para Internet Gateway e um IPv4 público. O default VPC, se disponível e adequado, evita criar uma arquitetura de rede desnecessária. Neste desenho não são necessários NAT Gateway, Load Balancer, EKS, ECS nem RDS.
- **Security Group:** SSH/TCP 22 apenas de “My IP” (seu IPv4 de administração); HTTP/TCP 80 e HTTPS/TCP 443 de `0.0.0.0/0`. Não liberar 3306, 9000 ou a API do Docker. Não configurar IPv6/AAAA sem também revisar rotas e regras IPv6.
- **Par de chaves SSH:** guardar a chave privada fora do repositório; usar `ubuntu` como usuário da AMI Ubuntu. Manter IMDSv2 requerido. Não associar uma role administrativa à instância.

O IPv4 público não é permanentemente gratuito: a tarifa padrão consultada é US$ 0,005/h, aproximadamente US$ 3,60 por 30 dias para um endereço, antes de créditos/impostos. EC2, EBS, tráfego e eventualmente snapshots também entram na estimativa. Confira o [AWS Pricing Calculator](https://calculator.aws/) e a [tarifa de IPv4](https://aws.amazon.com/vpc/pricing/).

O IP atribuído automaticamente pode mudar após stop/start. Um Elastic IP dá estabilidade, mas também é cobrado, inclusive se ficar alocado sem uso. Podemos começar com o IP automático e atualizar o DNS quando mudar; registre essa dependência antes do teste público. Parar a instância não elimina todos os custos: EBS, snapshots e Elastic IP ainda podem gerar despesas. Não encerre a instância nem apague volumes antes de testar o backup externo.

### DNS e acesso

Crie um subdomínio gratuito no [DuckDNS](https://www.duckdns.org/about.jsp) e aponte-o ao IPv4 da EC2. O Caddy emite HTTPS para esse hostname após DNS e portas estarem corretos. O token DuckDNS não precisa entrar no app nem no repositório. O domínio público da própria EC2 não é o domínio de aplicação escolhido neste guia.

Conecte pelo SSH com a chave selecionada na criação da instância. Se o Windows recusar a chave por permissões abertas, ajuste as permissões apenas do arquivo de chave, sem remover regras gerais do sistema. Confirme a identidade do host antes de aceitar uma chave SSH desconhecida.

```powershell
ssh -i "C:\caminho\fora-do-repositorio\saldoa.pem" ubuntu@IP_PUBLICO
```

Depois de confirmar acesso, prossiga abaixo. Não execute comandos de instalação da VM no notebook Windows.

## 2. Preparar a VM

Instale Git, OpenSSL, `flock` (pacote `util-linux`) e Docker Engine com o plugin Compose seguindo a [documentação oficial para Ubuntu](https://docs.docker.com/engine/install/ubuntu/). Use o repositório apt oficial, não scripts de instalação sem revisão. Este fluxo não precisa instalar PHP, Node ou MySQL diretamente no host.

Confirme `sudo docker version` e `sudo docker compose version`. Use Compose 2.24 ou superior. O acesso ao grupo `docker` equivale a administrar o host; os exemplos abaixo usam `sudo`.

Em uma `t3.small`, confira `free -h`, `df -h` e `swapon --show` antes de compilar. O build local validado não comprova build com apenas 2 GiB de RAM. Se a VM nova não tiver swap, uma opção para a fase inicial é reservar 4 GiB no disco, após conferir espaço livre:

```bash
if [ ! -e /swapfile ]; then
    sudo fallocate -l 4G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
else
    echo "Swapfile already exists; inspect it before making changes."
fi
```

Não sobrescreva um swapfile existente. Depois de validar, configure sua ativação no boot revisando `/etc/fstab`. Swap não substitui RAM: monitore memória, espaço e latência. Se continuar insuficiente, compile fora da VM ou revise o tamanho/custo antes de mudar a instância.

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
- O usuário confirmou que usa **Mailtrap Email Sandbox**, que captura mensagens de teste e não entrega aos usuários. Ele não foi configurado como envio de produção. Será necessário um serviço de envio real com remetente autorizado. Consulte a [documentação do Mailtrap](https://docs.mailtrap.io/getting-started/email-api-smtp).
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
- Para um APK de teste compilado localmente com HTTPS público, use `npm run apk:local -- --public-api` com as URLs no ambiente do processo, conforme [mobile/README.md](../mobile/README.md). O comando sem essa opção continua restrito ao HTTP privado. Assinatura de distribuição, EAS/AAB, política de privacidade e exigências da Play Store são uma etapa posterior.

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

## Atualização de identidade e revisão — 04/11/2026

Marca Fluxo e título `Bem-vindo - Saldoa` publicados por atualização manual dos arquivos e recompilação das imagens. As imagens anteriores foram preservadas como `saldoa-app:pre-flow` e `saldoa-web:pre-flow`. A notificação de exclusão usa a fila existente; o worker permanece responsável por tentativas/erros de SMTP. Isso não substitui configurar envio real de e-mails. Nenhuma migration foi executada nesta atualização. O checkout da EC2 contém alterações diretas e precisa ser sincronizado com o próximo commit antes de uma atualização via Git; não executar `git reset --hard` para descartar essas mudanças.
