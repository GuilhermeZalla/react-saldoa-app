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

O envio real de e-mails ainda precisa ser configurado. Uma falha de SMTP no worker não significa necessariamente que o site ou o login deixaram de funcionar.

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

## 6. Backup

O projeto contém um script para gerar backup no próprio servidor:

```bash
sudo bash /opt/saldoa/docker/backup-production.sh
```

Ele salva banco, arquivos e configuração em `/var/backups/saldoa`. Backups com o marcador `INCOMPLETE` não devem ser usados como cópias concluídas. O arquivo de configuração contém segredos; a cópia externa precisa de proteção e criptografia.

Um backup no mesmo disco não protege contra perda da EC2. A cópia externa, a retenção e a restauração em uma segunda instalação ainda estão pendentes. O script não elimina backups antigos automaticamente; acompanhe o espaço em disco.

## 7. Atualizações e reinícios

Enviar código ao GitHub **não atualiza o servidor**. O deploy é manual. Antes de atualizar:

1. Confira o estado do Git no servidor e o commit que está em execução.
2. Preserve mudanças locais; a EC2 recebeu alterações diretas nas últimas publicações. Não use `git reset --hard` para descartá-las.
3. Faça backup e preserve a imagem anterior.
4. Prepare e revise a nova versão, compile as imagens e recrie os serviços afetados.
5. Confira `/up`, login, assets e logs.

O procedimento de reconstrução está em [AWS_DEPLOY.md](AWS_DEPLOY.md). Não execute setup, seeders, migrations, remoção de volumes ou comandos de limpeza como parte de uma simples consulta de status.

Reiniciar um container pode interromper requisições. Para uma intervenção planejada, use o nome específico do serviço e verifique os logs depois. Evite reiniciar o banco para tentar corrigir um problema de interface.

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

No console, consulte:

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
