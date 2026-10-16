import { usePage } from '@inertiajs/react';
import { WalletCards } from 'lucide-react';

export default function AppLogo() {
    const { name } = usePage().props;

    return (
        <>
            <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm group-data-[collapsible=icon]:mx-auto">
                <WalletCards aria-hidden="true" className="size-5" />
            </div>
            <div className="ml-2 grid flex-1 text-left text-sm group-data-[collapsible=icon]:hidden">
                <span className="truncate font-heading leading-tight font-semibold tracking-tight text-sidebar-foreground">
                    {name}
                </span>
            </div>
        </>
    );
}
