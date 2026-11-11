# Estado do projeto

Atualizado em 11/11/2026. Saldoa é um projeto de controle financeiro pessoal e portfólio. **Web iniciado em 2025; mobile criado em 2026**, conforme informação do autor.

## Entrega atual

- Web/API: [saldoa-app.duckdns.org](https://saldoa-app.duckdns.org), publicados na AWS em 11/11/2026, commit `fb0945f18fc136d97ce1733d36edd162d0779794`. A release Android não altera automaticamente o servidor; deploy continua manual.
- Android: [Saldoa 1.1.1](https://github.com/GuilhermeZalla/react-saldoa-app/releases/tag/v1.1.1), release regular marcada como mais recente no GitHub, publicada em 11/11/2026 às 23:24 UTC. [Download do APK](https://github.com/GuilhermeZalla/react-saldoa-app/releases/download/v1.1.1/saldoa-android-v1.1.1.apk).
- Pacote `com.saldoa.app`, versão `1.1.1`, versionCode `12`, Android 7.0+ (API 24), target API 36, ARM64. Assinatura de depuração preservada, compatível com as instalações anteriores.
- APK: 30.730.006 bytes; SHA-256 `b40fbb9489455dad6e434014655ca70059275619ca499e0251764465a9148174`. APK e `SHA256SUMS` públicos conferidos contra os arquivos locais; download respondeu HTTP 200. Cópia privada em `.secrets/release-v1.1.1/`.
- Código da release: `9f1cc558f094c54de8f461955c9519ba4c3a82e2`, com [CI aprovado](https://github.com/GuilhermeZalla/react-saldoa-app/actions/runs/43119230979). O registro final de publicação também passou no [CI](https://github.com/GuilhermeZalla/react-saldoa-app/actions/runs/43119683457).
- Histórico de versões e mudanças: [CHANGELOG.md](../CHANGELOG.md) e [GitHub Releases](https://github.com/GuilhermeZalla/react-saldoa-app/releases). Builds antigas continuam no histórico; seus relatos de compilação não são repetidos neste status.

## Funcionalidades concluídas

- Dashboard, lançamentos, categorias, limites por categoria, recorrências, agenda, exportação e gestão da conta. Previsões da agenda são separadas dos saldos realizados.
- Mobile em português/inglês, temas claro/escuro/sistema e identidade Fluxo. Máscara monetária, ajuda contextual e confirmação de cadastro implementadas; sessões mobile duram até dez dias, sem renovação automática.
- Tablet: login/cadastro aproveitam a largura disponível; menu lateral recolhível a partir de 768 pontos; Início ocupa duas colunas quando há espaço, respeitando escala de fonte. Mostrar/ocultar senha disponível no login e cadastro.
- Quatro guias PDF publicados, para web/mobile em PT/EN, com download pela ajuda. Os PDFs complementam as orientações dentro do produto.
- Política de privacidade bilíngue publicada em `/privacy-policy`; texto mantido na [página do sistema](../resources/js/pages/privacy-policy.tsx). Recuperação de senha e exclusão por e-mail já confirmadas pelo titular com conta descartável. Templates transacionais usam a marca Fluxo.

## Validação da entrega

- Build Android, versão, pacote, integridade e assinatura conferidos. 35 testes mobile, tipos, lint e `npm run check` aprovados; CI completo da release inclui PHP e build web.
- Tablet: 24 combinações de tema/idioma/largura na prévia do app e 528 verificações de layout Yoga aprovadas. A prévia corrigida foi aprovada pelo titular; isso não equivale a testes nativos completos de todas as builds.
- Web/tablet e e-mails: 48 conferências visuais com dados fictícios, sem overflow ou erros JavaScript. Atualização autorizada do Vite+ para 1.6.0 concluída; auditorias npm web de produção e completa sem vulnerabilidades na conferência registrada.

## Operação e recuperação

- Publicação web/API conferida com cinco serviços ativos, MySQL saudável, HTTPS, autenticação pública, assets, política PT/EN e quatro guias. Detalhes da versão ativa, imagens e retorno estão em [AWS_OPERACAO.md](AWS_OPERACAO.md).
- Backup criptografado por Gmail a cada 15 dias. SQL, storage, APP_KEY, web e API foram recuperados em containers isolados, sem usar volumes reais. A reconstrução de uma VM inteira é um procedimento separado.
- Último backup registrado: 11/11/2026; próximo envio em 26/11/2026, salvo nova cópia manual. Nome, checksum, cópias e procedimentos de restauração estão no guia operacional.
- Chave privada de recuperação fora da EC2 e do Git; a segunda cópia segura fora do notebook ficou sob responsabilidade do titular. Backups, chaves, APKs e evidências privadas permanecem em `.secrets/`.
- Push executa CI e não faz deploy. Preserve credenciais, ajustes do checkout da EC2, volumes, backup externo e imagens de retorno antes de uma publicação.

## Pendências

| Área           | Próxima etapa                                                                                                                                                                                                                                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Play Store     | Concluir a verificação da conta pessoal, conferir requisitos atuais no Console, configurar assinatura de distribuição/EAS, gerar AAB, revisar materiais, ficha PT/EN, acesso do revisor, classificações e Segurança dos dados. Nenhuma faixa de teste ou publicação na loja foi iniciada. [Rascunho da ficha](PLAY_STORE_LISTING_DRAFT.md). |
| Monetização    | Definir e aprovar os planos antes de implementar avaliação, cobrança e permissões. Preços e regras são apenas proposta, sem cobrança implementada. [Proposta atual](MONETIZATION_DRAFT.md).                                                                                                                                                 |
| Android físico | Conferência completa da versão final: rotação, teclado, diálogos, barras do sistema e download do guia. O titular confirmou versões anteriores e a prévia corrigida; os registros não foram extrapolados para todas as builds.                                                                                                              |
| E-mails        | Confirmar recebimento das duas prévias de templates processadas pela fila em 11/11; sem redefinir senha ou excluir conta real nessa conferência.                                                                                                                                                                                            |
| AWS/Gmail      | Conferir custos detalhados, saldo/prazo dos créditos, capacidade da caixa e recursos retidos da stack `saldoa-automation`. Esses painéis não foram verificados pelo agente.                                                                                                                                                                 |
| Retenção       | Definir prazo máximo de descarte dos backups antes de concluir as declarações da loja; a exclusão da conta não remove imediatamente cópias históricas.                                                                                                                                                                                      |

Ideias futuras fora da entrega atual: login social opcional e confirmação de e-mail. Cadastro atual usa nome, e-mail e senha; verificação de e-mail ainda não está habilitada.

## Documentação mantida

- [README principal](../README.md): apresentação, instalação local e links de distribuição.
- [README mobile](../mobile/README.md): instalação e desenvolvimento/build do app.
- [Contrato da API](MOBILE_API.md): autenticação, endpoints e formatos.
- [Implantação/reconstrução](AWS_DEPLOY.md) e [operação diária/recuperação](AWS_OPERACAO.md): procedimentos técnicos e estado da infraestrutura.
- Guias [mobile PT](guia-de-uso-saldoa.pdf), [mobile EN](use-guide-saldoa-en.pdf), [web PT](guia-de-uso-saldoa-desktop.pdf) e [web EN](use-guide-saldoa-desktop-en.pdf).

## Limpeza de documentação — 11/11/2026

Consolidados relatos de retomadas, builds substituídas, contagens repetidas e procedimentos já documentados nos guias próprios. Removido o rascunho de privacidade substituído pela página bilíngue publicada. Mantidos histórico de releases, propostas pendentes, recuperação, licenças, imagens e guias atuais. A comparação por SHA-256 não encontrou cópias idênticas entre documentação e assets; variantes de capas e fontes editáveis foram preservadas.

Conferências desta limpeza: 81 links locais válidos e 55 arquivos de entrega/identidade com checksums inalterados; 16 testes PHP da ajuda/política e 35 testes mobile aprovados. Tipos/lint mobile e `npm run check` aprovados. Apenas documentação alterada; a release 1.1.1 e o ambiente de produção foram preservados.
