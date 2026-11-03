import { Head } from '@inertiajs/react';

export default function AccountDeletionRequested() {
    return (
        <>
            <Head title="Solicitação recebida" />
            <p className="text-sm leading-6 text-muted-foreground">
                Se houver uma conta associada ao e-mail informado, enviaremos
                instruções para confirmar a exclusão. Verifique sua caixa de
                entrada.
            </p>
        </>
    );
}

AccountDeletionRequested.layout = {
    title: 'Verifique seu e-mail',
    description: 'A solicitação foi processada.',
};
