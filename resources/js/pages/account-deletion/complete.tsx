import { Head, Link } from '@inertiajs/react';

export default function AccountDeletionComplete() {
    return (
        <>
            <Head title="Conta excluída" />
            <p className="text-sm leading-6 text-muted-foreground">
                Sua conta e os dados associados foram excluídos.
            </p>
            <Link
                href="/"
                className="mt-6 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
                Voltar ao início
            </Link>
        </>
    );
}

AccountDeletionComplete.layout = {
    title: 'Conta excluída',
    description: 'A solicitação foi concluída.',
};
