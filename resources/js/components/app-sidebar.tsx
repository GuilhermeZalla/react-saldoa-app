import { Link } from '@inertiajs/react';
import { ArrowLeftRight, LayoutGrid, Repeat, Tags, Target } from 'lucide-react';
import BudgetController from '@/actions/App/Http/Controllers/BudgetController';
import CategoryController from '@/actions/App/Http/Controllers/CategoryController';
import RecurringTransactionController from '@/actions/App/Http/Controllers/RecurringTransactionController';
import TransactionController from '@/actions/App/Http/Controllers/TransactionController';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Lançamentos',
        href: TransactionController.index(),
        icon: ArrowLeftRight,
    },
    {
        title: 'Recorrências',
        href: RecurringTransactionController.index(),
        icon: Repeat,
    },
    {
        title: 'Categorias',
        href: CategoryController.index(),
        icon: Tags,
    },
    {
        title: 'Metas',
        href: BudgetController.index(),
        icon: Target,
    },
];

export function AppSidebar() {
    return (
        <Sidebar
            collapsible="icon"
            variant="sidebar"
            className="border-r border-sidebar-border"
        >
            <SidebarHeader className="px-4 pt-6 pb-5">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="h-12 rounded-xl px-2 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
                        >
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-2 pt-4">
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border/70 px-3 py-4">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
