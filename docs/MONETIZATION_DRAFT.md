# Planos e monetização — proposta para revisão

Atualizado em 08/11/2026. A direção solicitada pelo titular é oferecer um plano mais barato apenas para o app e um Pro com acesso também ao site. Os preços, a periodicidade e as regras abaixo são recomendações para aprovação, sem validação comercial ou cobrança implementada.

## Oferta recomendada

| Plano      | Preço inicial proposto no Brasil | O que inclui                                                               |
| ---------- | -------------------------------- | -------------------------------------------------------------------------- |
| Saldoa App | R$ 29,90 por ano                 | Recursos financeiros atuais pelo app Android, com dados salvos na conta.   |
| Saldoa Pro | R$ 49,90 por ano                 | Tudo do plano App e uso da versão web com a mesma conta e os mesmos dados. |

- Ambos sem anúncios. A diferença inicial é a plataforma de acesso; não retirar recursos atuais do app para forçar a contratação do Pro.
- Download gratuito na Play Store, com assinatura para continuar usando os recursos financeiros após a avaliação. Não há plano gratuito permanente nesta proposta, nem cobrança separada pelo download.
- Cobrança do valor integral uma vez a cada 12 meses, com renovação automática claramente informada e cancelável. Não é uma mensalidade, parcelamento ou compra vitalícia.
- Começar com planos anuais e comercialização no Brasil. Idioma inglês continua disponível; distribuição comercial em outros países e preços locais exigem revisão própria.
- Oferecer o Pro como conveniência para organizar as finanças também no computador. Ele pode ser menos atraente para quem usa apenas o celular; o plano App precisa ser sustentável por si.

## Experiência antes da compra

- Recomendar sete dias de avaliação do Pro por conta nova, sem contratação de assinatura ou cobrança automática. A avaliação é uma permissão temporária concedida pelo Saldoa, separada de uma oferta de assinatura do Google Play.
- Informar início e fim da avaliação e apresentar os dois planos antes de qualquer compra. Encerrar a avaliação não cria uma dívida ou assinatura.
- Contratar exige confirmação explícita da compra no Google Play. Depois disso, informar plano, valor anual, data da próxima renovação e caminho de cancelamento.
- A duração da avaliação, a elegibilidade e o tratamento das contas já existentes precisam ser aprovados antes da implementação. Não converter contas existentes automaticamente em pagantes ou retirar acesso sem comunicação e transição definidas.

## Regras de conta, troca e encerramento

- Uma pessoa usa uma conta Saldoa no app e no site. A assinatura é vinculada à conta e confirmada pelo servidor; reinstalar ou trocar de aparelho não exige outra compra, desde que a compra seja restaurada para a conta correta.
- Manter no máximo um plano ativo por conta. O Pro já inclui o App; não somar as duas cobranças. Regras para múltiplas contas e associação de compras devem evitar vincular a mesma assinatura a pessoas diferentes.
- Recomendar upgrade App → Pro imediato, usando a troca de assinatura do Google Play. Mostrar eventual cobrança, aproveitamento do período já pago e próxima renovação antes da confirmação; definir o modo de substituição suportado na implementação, sem cálculo manual ou promessa de preço proporcional ainda não configurado.
- Recomendar downgrade Pro → App na próxima renovação. O acesso web continua até o término do período Pro já pago.
- Cancelar a renovação mantém os benefícios até o fim do período pago. Reembolso, revogação e falha de pagamento seguem o estado confirmado pelo provedor, incluindo eventuais períodos de tolerância.
- Sem avaliação ou assinatura válida, oferecer consulta dos dados já registrados pelo app e exportação pela área de conta; suspender novas inclusões e alterações financeiras. Isso não libera as ferramentas financeiras web do Pro. Definir também a suspensão de novas gerações automáticas de recorrências, sem exclusão dos registros existentes.
- A ausência de assinatura não apaga dados automaticamente nem concede retenção permanente: aplicar a política de retenção publicada e revisar qualquer mudança antes de anunciá-la.
- Recuperação de acesso, suporte, gerenciamento da assinatura, exportação e exclusão da conta permanecem acessíveis sem pagamento. Encerrar uma conta e cancelar a renovação são operações distintas: o fluxo deve deixar isso explícito e tratar ambas para evitar cobranças após a exclusão.
- O plano App pode acessar páginas públicas e páginas administrativas da conta no site. A restrição do Pro se aplica ao uso das ferramentas financeiras web, não à política de privacidade, ajuda ou exclusão.

## Viabilidade dos preços

Os valores são hipóteses de lançamento, não resultados de pesquisa ou garantia de receita. Ambos os planos usam servidor, banco e rotina de backup; o custo do plano App não desaparece por ele não liberar o site.

Exemplo ilustrativo para assinaturas no Brasil, considerando taxa de serviço de 15% e sem impostos, reembolsos ou outros custos:

| Plano | Receita anual após somente a taxa de 15% | Equivalente mensal dessa receita |
| ----- | ---------------------------------------- | -------------------------------- |
| App   | Aproximadamente R$ 25,42                 | Aproximadamente R$ 2,12          |
| Pro   | Aproximadamente R$ 42,42                 | Aproximadamente R$ 3,53          |

O equivalente mensal não é uma cobrança mensal nem o fluxo real de recebimento. Com 28 assinantes App e 12 Pro, a receita anual após somente essa taxa seria R$ 1.220,60. Isso equivaleria a aproximadamente R$ 101,72 por mês, antes dos demais custos. O exemplo não representa usuários ou receita existentes e não demonstra lucro.

Antes de fechar os preços, levantar o custo mensal real sem créditos promocionais: AWS, armazenamento/backup, e-mail, eventuais serviços de cobrança, impostos e margem para manutenção. Definir quantos assinantes seriam necessários e um orçamento que o titular aceita sustentar durante o lançamento. Não acessar contas financeiras ou contratar recursos como parte desta proposta.

O titular iniciou esse levantamento com os dados de Billing enviados em 08/11/2026, registrados no [status de infraestrutura e operação](STATUS.md#infraestrutura-e-operação). A previsão mensal ainda está indisponível e o período inicial de consumo é curto. Manter os preços como hipóteses e definir o orçamento próprio e a continuidade da hospedagem antes de vender acesso anual; os créditos temporários não comprovam a sustentabilidade dos planos.

A avaliação comercial virá de uso e compras reais: acompanhar fim da avaliação, contratação de cada plano, cancelamentos e pedidos de suporte, inicialmente com totais operacionais e sem adicionar SDK de rastreamento. Compras de teste não contam como receita ou validação de demanda. A IA ajuda a analisar a proposta e os custos, mas não confirma disposição de clientes para pagar.

## Cobrança e impacto na publicação

- Recomendar Google Play Billing para a contratação dos dois planos pelo Android, com acesso Pro reconhecido pelo site após confirmação no servidor. Não propor checkout web separado nesta primeira etapa; as regras de contratação para pessoas que chegam apenas pelo site precisam ficar claras antes do lançamento.
- Não presumir que um checkout externo pode ser promovido livremente no app. Validar as políticas aplicáveis ao país e ao fluxo final; elas têm exceções e programas próprios.
- Hoje não há assinatura, compra ou separação entre App e Pro implementada. O site atual não está condicionado a plano. Este documento não altera contas, acesso, dependências, banco, APK ou infraestrutura.
- Se a intenção for cobrar desde a primeira publicação, concluir a implementação e os testes de monetização antes do AAB destinado aos testes no Console. O APK test6 continua sendo a base funcional testada, não uma build com planos pagos. A verificação de identidade do Google pode seguir em paralelo.
- O download gratuito com assinaturas permite cobrança interna futura, mas o mesmo pacote oferecido gratuitamente não pode depois passar a cobrar pelo download na loja. Aprovar essa escolha antes da distribuição.

## Ordem de execução proposta

1. Aprovar os dois preços anuais, avaliação de sete dias, download gratuito e regras de acesso; levantar custos e definir a transição das contas existentes.
2. Escolher a integração compatível com a stack instalada e apresentar dependências, migrations e configuração necessárias antes de implementá-las. Configurar produtos e credenciais com o titular, sem cobranças reais de teste.
3. Implementar compra e vínculo seguro à conta, restauração, renovação, cancelamento, upgrade/downgrade, tratamento de falhas e permissões no servidor para app e web.
4. Testar o ciclo completo em ambiente de teste, incluindo compra pendente, eventos repetidos, vencimento, reembolso/revogação, troca de conta e acesso aos dados após perda dos benefícios. Preparar acesso de revisão e de testadores que dure todo o período necessário, sem depender apenas dos sete dias de avaliação ou de compras reais.
5. Atualizar interface PT/EN, ficha da loja, política/condições comerciais, guias e status para o comportamento final. Gerar nova build e seguir com testes e publicação conforme as liberações do Console.

## Referências oficiais

Consultadas em 08/11/2026; conferir novamente antes da configuração e da distribuição.

- [Configurar preços e mudança de gratuito para pago](https://support.google.com/googleplay/android-developer/answer/6334373?hl=pt-BR).
- [Política de pagamentos e serviços digitais](https://support.google.com/googleplay/android-developer/answer/10281818?hl=pt-BR).
- [Taxas de serviço por região e modalidade](https://support.google.com/googleplay/android-developer/answer/112622?hl=pt-BR).
- [Assinaturas e troca de plano](https://developer.android.com/google/play/billing/subscriptions).
- [Ciclo de vida e confirmação da assinatura no servidor](https://developer.android.com/google/play/billing/lifecycle/subscriptions).
