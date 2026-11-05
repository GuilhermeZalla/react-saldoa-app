# Deploy do Saldoa na AWS EC2

Referência técnica para instalar ou reconstruir o ambiente. Para acesso diário, logs, banco e custos, use [AWS_OPERACAO.md](AWS_OPERACAO.md).

Atualização em **05/11/2026 — versão 1.1.0**: web e API executam o código `05fd8c1`, com imagens `saldoa-app:1.1.0-05fd8c1` e `saldoa-web:1.1.0-05fd8c1`. Build feito em `/opt/saldoa-builds/1.1.0-05fd8c1`; fontes de operação continuam em `/opt/saldoa`. Banco e volumes preservados, sem migrations pendentes ou executadas. Traduções de `lang/` incluídas na imagem. O arquivo `/opt/saldoa/.deployed-commit` registra o código ativo; o histórico Git antigo da EC2 foi preservado e não deve receber `git pull`/reset sem reconciliação.

Backup criptografado anterior à troca: `/var/backups/saldoa/saldoa-20261105T215937Z-mYZgQF.cms`, enviado por Gmail e copiado para o notebook, com integridade conferida. Código/configuração anteriores estão protegidos em `/var/backups/saldoa-deploy/pre-1.1.0`; imagens anteriores têm a tag `rollback-pre-1.1.0`. Não remova esses recursos durante uma limpeza sem revisar a necessidade de recuperação. Sondagens de leitura e conferências públicas aprovadas após o deploy; timer de backup segue ativo a cada 15 dias.

Destino escolhido em 04/11/2026: uma instância EC2 administrada pelo usuário, executando Laravel/site, MySQL, Caddy/HTTPS, scheduler e worker com o Docker Compose de produção existente. O app mobile usa a mesma origem com `/api/v1`.

Estado verificado por SSH em 04/11/2026: EC2 `t3.small` na região `us-east-2` (Ohio), Ubuntu 26.04.1 LTS, x86_64, 1,9 GiB RAM e disco raiz de 28 GiB. Docker 29.9.3 e Compose 5.7.0 instalados; Docker habilitado no boot. Swap de 4 GiB ativo e registrado em `/etc/fstab`, sem teste de reboot. Código do commit `242f69f` em `/opt/saldoa`; imagens de produção compiladas na própria VM. MySQL saudável, migrations existentes aplicadas e app/scheduler/worker iniciados, sem portas publicadas. O serviço web está publicado em `https://saldoa-app.duckdns.org`, com HTTPS válido e redirecionamento HTTP; somente ele publica portas 80/443. Chaves e senhas foram geradas somente no servidor. Plano/saldo AWS ainda não conferidos. Atualização em 05/11/2026: Gmail real validado; backup criptografado copiado para o notebook e SQL restaurado em MySQL isolado. Backup por Gmail a cada 15 dias ativado e recuperação completa isolada validada em 05/11/2026. S3 não é utilizado. Deploy continuará manual por decisão do titular em 05/11/2026, mantendo o plano gratuito atual.

A infraestrutura genérica já passou por build Linux AMD64, cinco containers isolados, respostas HTTP esperadas, requisitos PHP, execução do backup e restauração SQL num segundo banco descartável. Essa evidência vem da preparação anterior (commit `242f69f`); os arquivos Docker não mudaram na troca de provedor. O build e a inicialização interna na EC2 passaram; dimensionamento sob carga e ensaio completo de recuperação após perda da VM continuam pendentes. O envio Gmail foi validado em 05/11/2026.

Validação pública em 04/11/2026: `/up` e `/login` responderam 200 via HTTPS, HTTP redirecionou com 308, `/api/v1/auth/me` sem token respondeu 401 e `/.env` respondeu 404. Desde essa validação inicial, foi publicado um APK de teste com API pública HTTPS; o usuário confirmou acesso por dados móveis na primeira compilação pública. A compilação com a marca Fluxo foi confirmada pelo titular no aparelho, incluindo os fluxos funcionais, temas e idiomas. O SMTP Gmail foi configurado em 05/11/2026, com recebimento de teste confirmado. O titular confirmou em 05/11/2026 os fluxos completos de recuperação de senha e exclusão de uma conta descartável pelos links recebidos.

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
- Mailtrap Email Sandbox era usado apenas nos testes. Em 05/11/2026 o Gmail pessoal foi configurado para envio real com senha de app e TLS na porta 465 (`MAIL_SCHEME=smtps`); teste recebido na caixa de entrada. Senhas permanecem fora do Git.
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

A EC2 já possui `/usr/local/sbin/saldoa-backup`, instalado de `docker/backup-encrypted.sh`. Ele gera SQL, storage e configuração, verifica integridade e cifra com AES-256-GCM/RSA. A chave pública fica em `/etc/saldoa/backup-public-cert.pem`; a privada permanece no notebook e precisa de uma segunda cópia segura fora dele.

Em 05/11/2026, uma cópia recebida pelo Gmail teve checksum e autenticação criptográfica conferidos e foi restaurada em containers isolados. Foram recuperados SQL, storage e APP_KEY; a aplicação respondeu a cadastro, autenticação, lançamento, dashboard, exportação e exclusão. O ensaio não utilizou os volumes de produção, não publicou portas e não tinha acesso à internet.

O backup é enviado a cada **15 dias por Gmail**. O timer `saldoa-backup.timer` verifica diariamente às 06:30 UTC (03:30 em São Paulo), com até dez minutos de atraso aleatório; `backup-due.py`, usado em `ExecCondition`, só permite gerar e enviar a cópia quando passaram 15 dias de calendário UTC desde a data da última execução bem-sucedida em `/var/backups/saldoa/last-success`. Reinícios preservam essa contagem; sem registro anterior, o primeiro disparo gera uma cópia. Falhas de backup são tentadas novamente no dia seguinte. O comando direto `/usr/local/sbin/saldoa-backup` continua permitindo uma cópia manual imediata e reinicia a contagem após sucesso. A configuração privada está em `/etc/saldoa/backup.env`; o envio usa TLS e rejeita anexos acima de 15 MiB e arquivos sem o envelope de criptografia autenticada. Cópias locais antigas só são removidas após aceitação SMTP. O titular deve acompanhar os e-mails e a capacidade da caixa; a retenção no Gmail é manual.

Para instalar os helpers numa reconstrução, copie `docker/backup-due.py`, `docker/send-backup.py` e `docker/verify-restored-app.py` para `/usr/local/lib/saldoa/`, os scripts Bash para `/usr/local/sbin/saldoa-backup` e `/usr/local/sbin/saldoa-verify-backup`, e os units para `/etc/systemd/system/`. Preserve a configuração privada e instale **somente o certificado público** na EC2. A chave privada de recuperação continua fora do servidor.

O roteiro de consulta, recuperação e limitações está em [AWS_OPERACAO.md](AWS_OPERACAO.md#6-backup-e-e-mails). O ensaio usa as imagens registradas no snapshot; se elas não existirem numa nova VM, será necessário reconstruí-las a partir da versão correspondente e repetir a validação antes de publicar.

S3 não é necessário para a rotina adotada. A stack anterior `saldoa-automation` falhou por bloqueio SCP ao OIDC; seus recursos retidos ainda precisam de conferência no console, como manutenção separada. O script antigo `docker/backup-production.sh` gera arquivos sem criptografia; prefira o novo serviço.

## 7. Atualizações manuais

Por decisão do titular em 05/11/2026, a conta permanece no plano gratuito atual e o deploy será manual. Não será feito upgrade ou ativação de recursos avançados para automatizar a publicação. Push no GitHub executa as verificações existentes, mas não publica código na EC2.

Os rascunhos de automação foram arquivados localmente em `.secrets/deferred-deploy-20261105/`, fora do Git. Não existe workflow de deploy ativo no projeto. O fluxo de releases separado não foi ativado na EC2.

Antes de atualizar manualmente, confira o CI, preserve credenciais/ajustes locais, faça backup com cópia externa e mantenha as imagens anteriores. Compile a nova versão e atualize somente os serviços necessários; valide saúde, autenticação, assets e logs. Não execute migrations ou restauração sobre o banco ativo como parte de uma atualização de rotina.

O checkout da EC2 contém alterações diretas e histórico anterior à reescrita publicada. A sincronização exige revisão específica, preservando esses ajustes; não usar `git pull` ou reset indiscriminadamente. O roteiro operacional está no [guia de operação](AWS_OPERACAO.md#7-deploy-manual).

## Atualização de identidade e revisão — 04/11/2026

Marca Fluxo e título `Bem-vindo - Saldoa` publicados por atualização manual dos arquivos e recompilação das imagens. As imagens anteriores foram preservadas como `saldoa-app:pre-flow` e `saldoa-web:pre-flow`. A notificação de exclusão usa a fila existente; o worker permanece responsável por tentativas/erros de SMTP. O SMTP real foi configurado e teve recebimento de teste confirmado em 05/11/2026. Nenhuma migration foi executada nesta atualização. O checkout da EC2 contém alterações diretas e precisa ser sincronizado com o próximo commit antes de uma atualização via Git; não executar `git reset --hard` para descartar essas mudanças.
