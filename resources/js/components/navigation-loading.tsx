import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

export function NavigationLoading() {
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        let pending = 0;
        let timer: ReturnType<typeof setTimeout> | undefined;
        const start = router.on('start', () => {
            pending++;
            timer ??= setTimeout(() => setLoading(true), 250);
        });
        const finish = router.on('finish', () => {
            pending = Math.max(0, pending - 1);
            if (pending === 0) {
                clearTimeout(timer);
                timer = undefined;
                setLoading(false);
            }
        });
        return () => {
            start();
            finish();
            clearTimeout(timer);
        };
    }, []);
    return loading ? (
        <div
            role="status"
            aria-live="polite"
            className="fixed right-4 bottom-4 z-50 flex items-center gap-3 rounded-xl border bg-background px-4 py-3 text-sm shadow-sm"
        >
            <LoaderCircle
                aria-hidden="true"
                className="size-5 animate-spin text-primary motion-reduce:animate-none"
            />
            Carregando…
        </div>
    ) : null;
}
