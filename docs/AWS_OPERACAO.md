# Operação do Saldoa na AWS

Guia de consulta para acessar a máquina, verificar o aplicativo e cuidar do ambiente. Os comandos desta página **não foram executados para alterar dados**; os exemplos de manutenção são para uso consciente pelo administrador.

## Visão do ambiente

| Item                | Configuração atual                                      |
| ------------------- | ------------------------------------------------------- |
| Site e API          | https://saldoa-app.duckdns.org                          |
| Região              | Ohio, `us-east-2`                                       |
| EC2                 | `saldoa`, instância `t3.small`                          |
| Sistema             | Ubuntu 26.04.1 LTS, usuário `ubuntu`                    |
| IPv4 consultado     | `18.188.208.120` — pode mudar após stop/start           |
| Projeto no servidor | `/opt/saldoa`                                           |
| Execução            | Docker Compose, arquivo `docker-compose.production.yml` |
| Banco               | MySQL 8.4 em container e volume persistente na EC2      |

Versão do app: **1.1.0**. Último deploy web/API em **11/11/2026**, commit `fb0945f18fc136d97ce1733d36edd162d0779794`, com [CI aprovado](https://github.com/GuilhermeZalla/react-saldoa-app/actions/runs/43067505989). Imagens `saldoa-app:1.1.0-fb0945f` e `saldoa-web:1.1.0-fb0945f`, construídas em `/opt/saldoa-builds/1.1.0-review-20261111-435a6af6b6`. `/opt/saldoa/.deployed-commit` e `.deployed-build` identificam a versão e o diretório ativo; `SALDOA_IMAGE_TAG` na configuração privada foi atualizado para a tag ativa. App, web, worker e scheduler atualizados; banco, volumes e checkout Git operacional preservados, sem migrations. As imagens anteriores `saldoa-app:1.1.0-11ea50d` e `saldoa-web:1.1.0-11ea50d` continuam disponíveis, também com aliases `rollback-before-fb0945f`; configuração anterior preservada em `/var/backups/saldoa-deploy/pre-fb0945f`. O checkout Git da EC2 conserva histórico e alterações próprias: continue usando publicação manual em diretório isolado, sem `git pull`/reset direto.

Verificação após a publicação: cinco serviços ativos, MySQL saudável, login/cadastro/política PT/EN/ícone/assets por HTTPS, API sem token 401, quatro PDFs com checksums idênticos aos locais e nenhum indicador de erro nos logs consultados. Duas prévias dos templates transacionais foram autorizadas e processadas sem falha pela fila após autenticação SMTP; os links eram fictícios e não alteraram contas. Recebimento na caixa de entrada continua sendo confirmação do titular. Disco: 55% usado, cerca de 13 GB livres; não foi necessário apagar caches, imagens, volumes ou backups.

Backup anterior à publicação: `saldoa-20261111T172808Z-DYKQXJ.cms`, 31.335 bytes, entregue ao SMTP da rotina Gmail e copiado para fora da EC2 em `.secrets/backups/`. SHA-256 conferido no servidor e no notebook: `b0adb554b8dc7a1e3ce17554716c2f91efecdacca2c883de20828b0960e3e5b0`. `last-success` em 11/11/2026 17:28:12 UTC; próximo envio em 26/11/2026, salvo novo backup manual. O titular assumiu a segunda cópia da chave privada fora do notebook. Custos detalhados, capacidade do Gmail e recursos retidos da stack CloudFormation antiga ainda exigem acesso autenticado aos respectivos painéis; não foram marcados como verificados.

O site e a API estão no mesmo Laravel. O APK instalado contém a interface mobile e faz chamadas HTTPS à API. Ele não se conecta diretamente ao MySQL. O banco da AWS é separado do banco do notebook.

## 1. Entrar na máquina

### Pelo navegador

1. Acesse o console AWS e selecione a região **Ohio**.
2. Entre em **EC2 → Instâncias → saldoa → Conectar**.
3. Selecione **EC2 Instance Connect**, confirme o usuário `ubuntu` e conecte.

Esse método depende das regras de SSH e dos requisitos do EC2 Instance Connect. O Security Group precisa permitir a origem correta; não libere a porta 22 para toda a internet como solução permanente.

### Pelo notebook Windows

Abra o PowerShell e substitua o caminho da chave pelo local onde ela foi salva:

```powershell
ssh -i "C:\caminho\saldoa-aws.pem" ubuntu@18.188.208.120
```

Na primeira conexão, confira a identidade do servidor antes de aceitar a chave. Não envie a chave `.pem`, senhas ou tokens ao GitHub. Caso o IP mude, consulte o novo endereço no console e atualize o DuckDNS.

## 2. Preparar os comandos do Docker

Os comandos a seguir são executados **dentro da máquina Ubuntu**, não no PowerShell do notebook:

```bash
cd /opt/saldoa
dc() {
    sudo docker compose --env-file .env.production -f docker-compose.production.yml "$@"
}
```

`dc` é apenas um atalho para o Compose de produção. Defina-o novamente ao abrir outra sessão SSH. Evite usar `docker compose` sem esses dois arquivos, pois o repositório também possui uma configuração de desenvolvimento.

## 3. Ver se está tudo funcionando

```bash
dc ps
curl --fail --silent --show-error https://saldoa-app.duckdns.org/up
free -h
df -h /
```

Os serviços são:

| Serviço     | Função                                                   |
| ----------- | -------------------------------------------------------- |
| `web`       | Receber acessos HTTP/HTTPS e servir os arquivos públicos |
| `app`       | Executar o Laravel e a API                               |
| `database`  | Guardar os dados no MySQL                                |
| `worker`    | Processar trabalhos da fila, como notificações           |
| `scheduler` | Executar tarefas agendadas, como recorrências            |

Somente o serviço web publica as portas 80 e 443. MySQL e PHP ficam acessíveis internamente entre os containers.

## 4. Acessar os logs

```bash
# Últimas mensagens da aplicação e do servidor web
dc logs --tail=100 app web

# Acompanhar as mensagens em tempo real; Ctrl+C encerra a visualização
dc logs --follow --tail=100 app web

# Verificar tarefas em segundo plano
dc logs --tail=100 worker scheduler

# Verificar o banco
dc logs --tail=100 database
```

O Laravel está configurado para escrever os logs no stderr do container. Por isso, `dc logs app` é o ponto inicial; não conte com a existência de um arquivo `laravel.log`. Não publique logs completos sem revisar dados pessoais, URLs de confirmação e outros conteúdos sensíveis.

Para listar trabalhos que falharam, sem reexecutá-los:

```bash
dc exec --user www-data app php artisan queue:failed --no-interaction
```

O envio real de e-mails está configurado pelo Gmail, conforme a seção de backup e e-mails. Uma falha de SMTP no worker não significa necessariamente que o site ou o login deixaram de funcionar.

## 5. Acessar o banco

É possível consultar e alterar o MySQL, mas alterações diretas ignoram validações e autorizações do Laravel. Para lançamentos, categorias e metas, prefira as telas do Saldoa. Use SQL direto apenas quando souber exatamente o que será afetado e tiver um backup válido.

Para abrir o cliente MySQL **dentro do container**, sem expor a porta 3306:

```bash
dc exec database sh -c 'MYSQL_PWD="$(cat /run/secrets/mysql_root_password)" exec mysql -uroot "$MYSQL_DATABASE"'
```

A senha é lida do segredo existente. O comando não a imprime nem a coloca em um argumento da linha de comando do cliente.

Dentro do MySQL, consultas de inspeção:

```sql
SHOW TABLES;
SELECT id, name, type FROM categories LIMIT 10;
SELECT id, description, amount, date FROM transactions ORDER BY id DESC LIMIT 10;
```

Para sair:

```sql
exit;
```

### Adicionar, editar ou remover dados

Sim, há suporte a `INSERT`, `UPDATE` e `DELETE`. Porém, apagar registros relacionados pode afetar lançamentos, metas, recorrências e o perfil. Um `DELETE` SQL não oferece o mesmo fluxo de desfazer da interface.

Para aprender ou ensaiar, use um **banco de teste**. Estrutura de exemplo, com identificadores que precisam ser substituídos e conferidos:

```sql
START TRANSACTION;

-- Edite somente o registro e o usuário conferidos anteriormente:
UPDATE categories
SET name = 'Nome revisado'
WHERE id = <ID_DA_CATEGORIA> AND user_id = <ID_DO_USUARIO>;

-- Confira o resultado antes de decidir manter a alteração.
SELECT id, user_id, name FROM categories WHERE id = <ID_DA_CATEGORIA>;

-- Desfaz o ensaio. Não troque por COMMIT sem revisar o resultado.
ROLLBACK;
```

Os valores entre `<...>` são marcadores, não SQL pronto para copiar. Faça inclusões e exclusões pela aplicação sempre que possível; para intervenção direta em produção, revise relacionamentos, crie backup e prepare a recuperação antes de confirmar a transação.

Não abra a porta 3306 no Security Group. Para usar uma ferramenta visual como DBeaver, o caminho apropriado é um túnel SSH; a implantação atual não publica o MySQL nem em localhost do host. Isso exige preparar o acesso local com cuidado, não simplesmente liberar o banco na internet.

## 6. Backup e e-mails

O Gmail pessoal está configurado no Laravel usando uma senha de app, com TLS na porta 465. O titular confirmou o recebimento do teste em 05/11/2026. A senha não é a senha normal da conta Google e não deve ser copiada para o Git, chat ou logs. Se for revogada no Google, atualize a configuração privada no servidor e recrie app/worker/scheduler.

O backup criptografado já foi instalado na EC2:

```bash
sudo /usr/local/sbin/saldoa-backup
```

Ele inclui SQL consistente do MySQL, arquivos de storage e configuração. Os arquivos `.cms` ficam em `/var/backups/saldoa`, protegidos com AES-256-GCM e uma chave pública RSA. A chave privada fica somente no notebook, em `.secrets/backup-private-key.pem`; guarde uma segunda cópia segura fora do notebook. Sem essa chave, os backups não podem ser recuperados. Nunca a envie à EC2 ou ao repositório.

Há uma cópia criptografada fora da EC2 em `.secrets/backups/saldoa-current.cms`. A restauração SQL foi conferida num MySQL temporário sem rede, sem usar os volumes de produção. O teste também verificou checksums e integridade dos arquivos de storage/configuração. O container temporário e seu volume foram removidos. Isso ainda não substitui ensaiar a recuperação completa da aplicação em uma segunda VM.

O backup usa **Gmail a cada 15 dias**, por decisão do titular, sem S3, permissões IAM adicionais ou upgrade da AWS. O timer `saldoa-backup.timer` faz uma checagem diária às 06:30 UTC (03:30 em São Paulo), com atraso aleatório de até dez minutos. A condição `backup-due.py` só permite gerar/enviar uma cópia quando passaram 15 dias de calendário UTC desde a data de `last-success`; a contagem continua válida após reiniciar a EC2. Sem registro anterior, o primeiro disparo gera a cópia. Falhas durante o backup são tentadas novamente no dia seguinte. O comando direto acima permite uma cópia manual imediata, que reinicia a contagem após sucesso. O primeiro envio pelo serviço systemd terminou com `Result=success` e `ExecMainStatus=0`; o titular confirmou recebimento.

O Gmail pode agrupar os anexos `.cms` e `.sha256` em um ZIP ao baixar. A cópia recebida teve seu SHA256 comparado com o arquivo da EC2, passou pela autenticação criptográfica e foi usada em uma recuperação completa isolada: SQL, storage, APP_KEY, aplicação web e API. Cadastro, autenticação, lançamento, dashboard, exportação e exclusão de uma conta temporária passaram. A rede do ensaio era interna, sem portas publicadas, SMTP externo, worker ou scheduler; banco e volumes reais não foram utilizados.

Para consultar o agendamento, executar uma cópia manual ou conferir os registros:

```bash
sudo systemctl list-timers saldoa-backup.timer
# Executa apenas se já chegou a data; para forçar, use o comando direto acima.
sudo systemctl start saldoa-backup.service
sudo systemctl show saldoa-backup.service --property=Result --property=ExecMainStatus
sudo journalctl -u saldoa-backup.service --since today --no-pager
sudo cat /var/backups/saldoa/last-success
```

Nos dias em que ainda não venceu o intervalo, `Result=exec-condition` com `ExecCondition` encerrando em `status=1` significa que o envio foi pulado normalmente. Um registro `last-success` ilegível, inválido ou no futuro faz a condição falhar com status 255 e exige conferir o journal e o relógio do servidor.

A configuração fica em `/etc/saldoa/backup.env`, com permissão 0600 e os campos `SALDOA_ROOT`, `SALDOA_BACKUP_DELIVERY=gmail`, `SALDOA_BACKUP_EMAIL` e `SALDOA_BACKUP_MAIL_SCRIPT`. O helper instalado em `/usr/local/lib/saldoa/send-backup.py` lê o SMTP da configuração Compose privada, sem imprimir credenciais. Envia somente um envelope CMS autenticado e seu checksum; arquivos sem criptografia e anexos acima de **15 MiB** são rejeitados. Esse teto deixa margem para a codificação do e-mail sob o [limite pessoal do Gmail](https://support.google.com/mail/answer/6584?hl=en).

As cópias locais com mais de sete dias só são removidas se houver o marcador `.emailed`, criado após aceitação SMTP. Cópias com envio falho são preservadas. Na caixa Gmail, mantenha pelo menos os últimos 30 dias e uma cópia mensal; a limpeza da caixa é manual. Acompanhe o espaço disponível. Se o backup ultrapassar 15 MiB, será necessário outro destino antes de retomar o envio; o script não troca o arquivo por um link público.

Falhas geram registro no journal e uma tentativa de aviso pelo mesmo SMTP. Se o próprio SMTP ou a EC2 estiver indisponível, esse aviso também pode não chegar: a ausência do e-mail esperado a cada 15 dias exige verificação. O arquivo `last-success` registra a última execução concluída, não a confirmação humana de recebimento.

### Repetir a recuperação

O verificador `docker/verify-backup.sh` aceita um tar previamente descriptografado por `--stdin`; adicione `--application` para conferir também web/API. A descriptografia acontece no notebook com a chave privada; envie somente os bytes do tar por SSH, nunca a chave. Não use o pipeline de texto do PowerShell para esse arquivo binário.

Exemplo conceitual no Git Bash, a partir de uma pasta privada com a cópia e suas chaves:

```bash
if openssl cms -decrypt -binary -inform DER -in backup.cms \
  -recip backup-public-cert.pem -inkey backup-private-key.pem -out recovery.tar; then
  ssh -i /c/Users/zalla/Documents/AWS/saldoa-aws.pem ubuntu@18.188.208.120 \
    'sudo env SALDOA_RECOVERY_APP_SCRIPT=/usr/local/lib/saldoa/verify-restored-app.py /usr/local/sbin/saldoa-verify-backup --stdin --application' < recovery.tar
fi
rm -f -- recovery.tar
```

Substitua os nomes pelos arquivos corretos e use a identidade SSH previamente conferida. Prossiga para o SSH somente se a descriptografia terminar com código 0; descarte qualquer saída de uma tentativa que falhe. O verificador não executa migrations, não publica portas e remove os containers, o volume MySQL temporário, a rede e o tar de trabalho ao terminar.

As imagens usadas são registradas no backup. Se precisar reconstruí-las após perder a VM, use o código e os arquivos de dependências da mesma versão e confira o ensaio antes de publicar. Os overrides `SALDOA_RESTORE_APP_IMAGE`, `SALDOA_RESTORE_WEB_IMAGE` e `SALDOA_RESTORE_DATABASE_IMAGE` permitem indicar as imagens reconstruídas; app/web usam IDs Docker `sha256:...`. A reconstrução da VM inteira e a emissão de novos certificados continuam sendo procedimentos de operação, não são simuladas pelo verificador de containers.

O script anterior `docker/backup-production.sh` continua disponível para compatibilidade, mas gera arquivos sem criptografia. Prefira o novo comando. SQL e storage são capturados em momentos diferentes: para arquivos que mudem durante o backup, use uma janela planejada sem alterações.

## 7. Deploy manual

Em 05/11/2026, o titular decidiu manter o plano gratuito atual e dispensar a automação do deploy. **Fazer push no GitHub não atualiza o site nem a API.** O CI continua verificando o código; publicar na EC2 é uma operação separada, feita pelo administrador ou com ajuda do assistente.

A conta usa a experiência simplificada da AWS baseada em projetos. O backup por Gmail a cada 15 dias não depende dessa integração GitHub/OIDC. A stack `saldoa-automation` falhou ao criar o provedor GitHub OIDC: `iam:CreateOpenIDConnectProvider` foi negado explicitamente por uma SCP da organização. O CloudShell também apresentou verificação de conta pendente. O titular não autorizou upgrade nem ativação dos recursos avançados.

Os rascunhos de workflow, template e scripts de automação foram retirados dos arquivos candidatos a commit e arquivados localmente em `.secrets/deferred-deploy-20261105/`. O helper instalado anteriormente na EC2 permanece sem acionamento configurado; não houve deploy pelo novo fluxo. Não reutilize o ZIP antigo de preparação para repetir a stack.

Antes de cada publicação manual:

1. Escolha o commit revisado e confira o CI no GitHub.
2. Confira o estado do checkout na EC2 e preserve os ajustes locais e as credenciais. O histórico foi reescrito; o checkout antigo não deve receber um `git pull` ou reset sem reconciliação.
3. Gere um backup criptografado, copie-o para fora da EC2 e preserve as imagens da versão anterior.
4. Prepare o código e compile novas imagens antes de substituir app/web/worker/scheduler, mantendo os volumes existentes.
5. Confira `/up`, login, assets e logs; se houver falha, recupere a versão anterior compatível com o banco.

Não há migração automática do banco. Qualquer alteração de schema precisa de análise específica antes da publicação. O procedimento de reconstrução está em [AWS_DEPLOY.md](AWS_DEPLOY.md).

As consultas de operação continuam usando `/opt/saldoa` e o Compose original, como nas primeiras seções deste guia. A estrutura de releases com `/opt/saldoa/current` não foi ativada. Backups, e-mail e a futura publicação na Play Store são tratados separadamente da decisão sobre deploy.

## 8. Como a AWS cobra

Neste desenho, a cobrança não é uma tarifa única por requisição ao Laravel:

| Recurso             | O que influencia o custo                                                          |
| ------------------- | --------------------------------------------------------------------------------- |
| EC2                 | Tempo da instância ligada e tamanho escolhido                                     |
| EBS                 | Capacidade do disco provisionado; IOPS e throughput adicionais quando contratados |
| IPv4 público        | Tempo de uso do endereço IPv4                                                     |
| Rede                | Tráfego de saída e possíveis transferências entre regiões/serviços                |
| T3 Unlimited        | Créditos de CPU excedentes, se o modo estiver habilitado                          |
| Recursos adicionais | Snapshots, outros volumes, serviços de e-mail etc., se forem criados              |

O MySQL está no disco da EC2, sem uma instância RDS separada. Mais dados ocupam esse disco, mas não existe uma tarifa independente por linha ou consulta MySQL nessa configuração. O EBS cobra pela capacidade provisionada, não apenas pela parte ocupada pelo banco.

Uma instância ligada e sem visitas ainda consome recursos. Parar a EC2 interrompe o site; o armazenamento e outros recursos retidos podem continuar gerando custos. Encerrar a instância pode excluir o disco, conforme a configuração. Não use stop/terminate como uma limpeza sem antes planejar backup e disponibilidade.

### Os US$ 100 em créditos

Os créditos abatem consumo elegível; não tornam a hospedagem gratuita para sempre. O valor informado pelo titular não foi conferido diretamente no Billing. No plano Free atual, o prazo é de até seis meses ou até acabar o crédito, o que ocorrer primeiro. O plano Paid tem regras de cobrança próprias, inclusive depois dos créditos.

Na experiência simplificada atual, comece por **AWS Settings → Billing** para conferir créditos, prazo e custos por projeto. Algumas ferramentas do console convencional podem exigir recursos avançados; o titular decidiu manter a modalidade atual.

Quando disponíveis na conta, consulte:

1. **Billing and Cost Management → Home/Free Tier:** plano, saldo e validade.
2. **Bills:** consumo por serviço e região.
3. **Cost Explorer:** evolução do gasto e projeção, quando disponível.
4. **Budgets:** alertas de custo; alertas não são um bloqueio rígido de gastos.

Não estime a duração dos US$ 100 apenas pelo número de acessos. Para uma previsão, use o tipo `t3.small`, região Ohio, capacidade real do EBS, IPv4 e tráfego no AWS Pricing Calculator. Confira também se T3 está em Standard ou Unlimited.

Referências oficiais consultadas em 04/11/2026: [EC2](https://aws.amazon.com/ec2/pricing/on-demand/), [EBS](https://aws.amazon.com/ebs/pricing/), [IPv4](https://aws.amazon.com/vpc/pricing/), [planos e créditos](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/free-tier-plans.html) e [calculadora](https://calculator.aws/).

## 9. Checklist rápido de problemas

| Sintoma                  | Primeira conferência                                                               |
| ------------------------ | ---------------------------------------------------------------------------------- |
| SSH não conecta          | Região, estado da EC2, IP atual e regra 22 para a origem correta                   |
| Site fora do ar          | `dc ps`, `/up`, logs de web/app, DNS e portas 80/443                               |
| APK não conecta          | Abrir `/up` no celular e confirmar que o APK usa a URL pública                     |
| E-mail não chega         | Configuração SMTP e logs do worker; Sandbox não entrega aos destinatários          |
| Dados parecem diferentes | Confirmar se o ambiente é local ou AWS e qual usuário está conectado               |
| Disco enchendo           | `df -h /`, backups acumulados e uso das imagens/volumes; não apagar dados às cegas |
