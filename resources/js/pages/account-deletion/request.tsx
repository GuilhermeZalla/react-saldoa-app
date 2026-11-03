import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AccountDeletionRequest() {
    return (
        <>
            <Head title="Excluir conta" />
            <p className="mb-6 text-sm leading-6 text-muted-foreground">
                Informe o e-mail da conta. Enviaremos um link de confirmação
                para que você possa excluir permanentemente seu perfil e os
                dados financeiros associados.
            </p>

            <Form
                action="/account-deletion"
                method="post"
                className="space-y-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="email">E-mail da conta</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                            />
                            <InputError message={errors.email} />
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing}
                        >
                            Enviar link de confirmação
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}

AccountDeletionRequest.layout = {
    title: 'Solicitar exclusão da conta',
    description:
        'Você também pode solicitar a exclusão sem acessar o aplicativo.',
};
