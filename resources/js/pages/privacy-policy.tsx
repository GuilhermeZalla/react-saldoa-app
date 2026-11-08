import { Head } from '@inertiajs/react';
import { privacyPolicy } from '@/routes';

type Language = 'pt-BR' | 'en';

type PolicySection = {
    title: string;
    paragraphs: string[];
};

const policy = {
    'pt-BR': {
        title: 'Política de Privacidade',
        updated: 'Última atualização: 8 de novembro de 2026',
        switchLabel: 'Read this policy in English',
        intro: 'Saldoa é um aplicativo de organização financeira pessoal. Ele não é uma instituição financeira e não acessa automaticamente sua conta bancária. As informações financeiras são inseridas por você.',
        sections: [
            {
                title: 'Dados tratados',
                paragraphs: [
                    'Para criar e proteger uma conta, o Saldoa trata nome, endereço de e-mail, senha (armazenada como hash, não em texto simples), estado de verificação do e-mail e dados técnicos de autenticação, como tokens de sessão. O aplicativo também trata os dados que você registra: descrições, valores, datas, tipos de movimentação, categorias, limites e recorrências.',
                    'Idioma e tema são preferências guardadas no dispositivo. No aplicativo Android, o token de sessão é armazenado usando o armazenamento seguro do dispositivo. Se você solicitar uma exportação, seus dados são preparados para compartilhamento no dispositivo.',
                ],
            },
            {
                title: 'Finalidades e serviços',
                paragraphs: [
                    'Usamos esses dados para fornecer as funções de conta e controle financeiro, sincronizar seus registros com a API, permitir exportação e exclusão, proteger sessões e enviar mensagens necessárias à conta, como recuperação de acesso e confirmação de exclusão.',
                    'O serviço web e a API são hospedados em uma instância AWS EC2 na região de Ohio, Estados Unidos (us-east-2), com banco de dados associado. O Gmail é usado para o envio de mensagens transacionais e para receber cópias de segurança criptografadas operacionais. Esses provedores tratam dados necessários para prestar essas funções, conforme suas próprias condições e políticas.',
                ],
            },
            {
                title: 'Segurança e cópias de segurança',
                paragraphs: [
                    'Adotamos medidas técnicas e operacionais para proteger os dados, incluindo hash de senhas, proteção do token no dispositivo Android e cópias de segurança criptografadas. A rotina atual envia uma cópia criptografada aproximadamente a cada 15 dias para a conta Gmail operacional e conserva manualmente pelo menos os últimos 30 dias e uma cópia mensal.',
                    'Quando você exclui a conta, os dados associados são removidos do banco de dados ativo conforme o fluxo de exclusão. A exclusão não apaga automaticamente cópias históricas já produzidas. Essas cópias podem continuar contendo dados da conta até serem removidas pela rotina manual de retenção; hoje não há um prazo máximo fixo documentado para essa remoção.',
                ],
            },
            {
                title: 'Retenção, acesso e exclusão',
                paragraphs: [
                    'Mantemos os dados da conta enquanto ela estiver ativa ou pelo tempo necessário para atender às finalidades descritas. Você pode solicitar a exportação dos dados disponíveis pelo recurso do aplicativo. Para excluir a conta, use a opção de exclusão na área da conta ou acesse a página de solicitação de exclusão. O fluxo externo exige confirmação por e-mail; o link de confirmação expira em uma hora.',
                    'Para dúvidas ou solicitações relacionadas a dados pessoais, escreva para o e-mail de suporte. A exclusão no banco ativo não elimina imediatamente cópias de segurança históricas, conforme explicado acima.',
                ],
            },
            {
                title: 'Crianças e alterações',
                paragraphs: [
                    'O Saldoa é uma ferramenta de finanças pessoais. A classificação etária e o público-alvo serão informados na Play Store após a conclusão das declarações correspondentes. Atualizaremos esta política quando as práticas de dados mudarem e indicaremos a data da revisão.',
                ],
            },
        ] satisfies PolicySection[],
        email: 'saldoappcontact@gmail.com',
        deletionLabel: 'Solicitar exclusão da conta',
        contactLabel: 'Enviar e-mail de suporte',
        publisher: 'Responsável público: SaldoaApp',
    },
    en: {
        title: 'Privacy Policy',
        updated: 'Last updated: November 8, 2026',
        switchLabel: 'Leia esta política em português',
        intro: 'Saldoa is a personal finance organization app. It is not a financial institution and does not automatically access your bank account. You enter the financial information yourself.',
        sections: [
            {
                title: 'Data we process',
                paragraphs: [
                    'To create and protect an account, Saldoa processes your name, email address, password (stored as a hash, not in plain text), email verification status, and technical authentication data such as session tokens. The app also processes the information you record: descriptions, amounts, dates, transaction types, categories, budgets, and recurring transactions.',
                    "Language and theme are preferences stored on your device. On Android, the session token is stored using the device's secure storage. If you request an export, your data is prepared for sharing on your device.",
                ],
            },
            {
                title: 'Purposes and service providers',
                paragraphs: [
                    'We use this data to provide account and personal finance features, synchronize your records with the API, support export and deletion, protect sessions, and send account-related messages such as access recovery and deletion confirmation.',
                    'The web service and API are hosted on an AWS EC2 instance in the Ohio, United States region (us-east-2), with an associated database. Gmail is used to send transactional messages and receive encrypted operational backups. These providers process information needed to provide these functions under their own terms and policies.',
                ],
            },
            {
                title: 'Security and backups',
                paragraphs: [
                    'We use technical and operational safeguards, including password hashing, secure token storage on Android, and encrypted backups. Our current routine sends an encrypted backup approximately every 15 days to the operational Gmail account and manually retains at least the most recent 30 days and one monthly copy.',
                    'When you delete your account, associated data is removed from the active database through the deletion process. Deletion does not automatically erase historical backups that have already been created. Those copies may continue to contain account data until removed through the manual retention process; there is currently no documented fixed maximum period for their removal.',
                ],
            },
            {
                title: 'Retention, access, and deletion',
                paragraphs: [
                    "We keep account data while your account is active or as needed for the purposes described above. You can request an export of available data using the app's export feature. To delete your account, use the deletion option in the account area or visit the account deletion request page. The external process requires email confirmation; its confirmation link expires after one hour.",
                    'For questions or requests about personal data, email our support address. Deletion from the active database does not immediately remove historical backups, as explained above.',
                ],
            },
            {
                title: 'Children and changes',
                paragraphs: [
                    'Saldoa is a personal finance tool. Its age rating and target audience will be declared in Google Play after the relevant forms are completed. We will update this policy when data practices change and provide the revision date.',
                ],
            },
        ] satisfies PolicySection[],
        email: 'saldoappcontact@gmail.com',
        deletionLabel: 'Request account deletion',
        contactLabel: 'Email support',
        publisher: 'Public developer name: SaldoaApp',
    },
} satisfies Record<
    Language,
    {
        title: string;
        updated: string;
        switchLabel: string;
        intro: string;
        sections: PolicySection[];
        email: string;
        deletionLabel: string;
        contactLabel: string;
        publisher: string;
    }
>;

export default function PrivacyPolicy({ language }: { language: Language }) {
    const content = policy[language];
    const otherLanguage = language === 'en' ? 'pt-BR' : 'en';
    const otherLanguageUrl =
        language === 'en'
            ? privacyPolicy().url
            : privacyPolicy({ query: { lang: 'en' } }).url;

    return (
        <>
            <Head title={`${content.title} — Saldoa`} />
            <main
                lang={language}
                className="min-h-svh bg-background px-4 py-10 text-foreground sm:px-6 sm:py-16"
            >
                <article className="mx-auto max-w-3xl space-y-8">
                    <header className="space-y-3 border-b border-border pb-6">
                        <a
                            href="/"
                            className="font-heading text-sm font-semibold text-primary underline-offset-4 hover:underline"
                        >
                            Saldoa
                        </a>
                        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                            {content.title}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {content.updated}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {content.publisher}
                        </p>
                        <a
                            href={`mailto:${content.email}`}
                            className="text-sm text-primary underline underline-offset-4"
                        >
                            {content.email}
                        </a>
                        <p>
                            <a
                                href={otherLanguageUrl}
                                hrefLang={otherLanguage}
                                className="text-sm text-primary underline underline-offset-4"
                            >
                                {content.switchLabel}
                            </a>
                        </p>
                    </header>

                    <p className="text-base leading-7 text-muted-foreground">
                        {content.intro}
                    </p>

                    {content.sections.map((section) => (
                        <section key={section.title} className="space-y-3">
                            <h2 className="font-heading text-xl font-semibold">
                                {section.title}
                            </h2>
                            {section.paragraphs.map((paragraph) => (
                                <p
                                    key={paragraph}
                                    className="text-base leading-7 text-muted-foreground"
                                >
                                    {paragraph}
                                </p>
                            ))}
                        </section>
                    ))}

                    <footer className="space-y-3 border-t border-border pt-6 text-sm">
                        <p>
                            <a
                                href="/account-deletion"
                                className="text-primary underline underline-offset-4"
                            >
                                {content.deletionLabel}
                            </a>
                        </p>
                        <p>
                            <a
                                href={`mailto:${content.email}`}
                                className="text-primary underline underline-offset-4"
                            >
                                {content.contactLabel}: {content.email}
                            </a>
                        </p>
                    </footer>
                </article>
            </main>
        </>
    );
}
