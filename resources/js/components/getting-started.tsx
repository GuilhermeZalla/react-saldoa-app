import { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { X } from 'lucide-react';
import CategoryController from '@/actions/App/Http/Controllers/CategoryController';
import TransactionController from '@/actions/App/Http/Controllers/TransactionController';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { help } from '@/routes';

export function GettingStarted({ empty }: { empty: boolean }) {
    const { auth } = usePage().props;
    const storageKey = `saldoa.help.dismissed.${auth.user.id}`;
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        try {
            setVisible(localStorage.getItem(storageKey) !== 'true');
        } catch {
            setVisible(true);
        }
    }, [storageKey]);
    if (!empty || !visible) return null;
    return (
        <Card className="finance-surface border-primary/25">
            <CardContent className="space-y-4 pt-5">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="font-heading text-lg font-semibold">
                        Seus primeiros passos
                    </h2>
                    <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Dispensar primeiros passos"
                        onClick={() => {
                            setVisible(false);
                            try {
                                localStorage.setItem(storageKey, 'true');
                            } catch {
                                /* Dismissal remains effective for this visit. */
                            }
                        }}
                    >
                        <X />
                    </Button>
                </div>
                <ol className="grid gap-4 text-sm sm:grid-cols-3">
                    <li>
                        <Link
                            className="font-medium text-primary underline-offset-4 hover:underline"
                            href={CategoryController.index()}
                        >
                            1. Confira suas categorias
                        </Link>
                        <p className="mt-1 text-muted-foreground">
                            Organize receitas e despesas.
                        </p>
                    </li>
                    <li>
                        <Link
                            className="font-medium text-primary underline-offset-4 hover:underline"
                            href={TransactionController.create()}
                        >
                            2. Registre uma movimentação
                        </Link>
                        <p className="mt-1 text-muted-foreground">
                            Comece com uma receita ou despesa.
                        </p>
                    </li>
                    <li>
                        <p className="font-medium">3. Acompanhe seu saldo</p>
                        <p className="mt-1 text-muted-foreground">
                            Seu resumo aparece aqui após o registro.
                        </p>
                    </li>
                </ol>
                <Link
                    href={help()}
                    className="text-sm text-primary hover:underline"
                >
                    Como usar o Saldoa
                </Link>
            </CardContent>
        </Card>
    );
}
