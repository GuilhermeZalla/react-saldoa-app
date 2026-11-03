import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';

export default function ConfirmAccountDeletion({ token }: { token: string }) {
    return (
        <>
            <Head title="Confirmar exclusão" />
            <p className="mb-6 text-sm leading-6 text-muted-foreground">
                Esta ação é permanente. Ao confirmar, seu perfil e seus dados
                financeiros serão excluídos e não poderão ser recuperados.
            </p>

            <Form
                action="/account-deletion/confirm"
                method="post"
                className="space-y-4"
            >
                {({ processing, errors }) => (
                    <>
                        <input type="hidden" name="token" value={token} />
                        <InputError message={errors.token} />
                        <Button
                            type="submit"
                            variant="destructive"
                            className="w-full"
                            disabled={processing}
                        >
                            Excluir minha conta permanentemente
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}

ConfirmAccountDeletion.layout = {
    title: 'Confirmar exclusão da conta',
    description:
        'Confirme somente se você realmente deseja excluir seus dados.',
};
