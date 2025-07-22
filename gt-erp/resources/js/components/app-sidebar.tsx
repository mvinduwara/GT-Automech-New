import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { HandCoins, Home, IdCard, LayoutGrid, NotepadText, StickyNote, TicketCheck, UserRound, UserRoundCheck, Users, Warehouse } from 'lucide-react';
import { useMemo } from 'react';
import AppLogo from './app-logo';

const USER_ROLES = {
    CASHIER: 'cashier',
    ADMIN: 'admin',
    SERVICEMANAGER: 'service-manager',
    DEFAULT: 'cashier',
};

const mainNavItems: (NavItem & { roles?: string[] })[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: Home,
        roles: [USER_ROLES.CASHIER, USER_ROLES.ADMIN, USER_ROLES.SERVICEMANAGER],
    },
    {
        title: 'Customer',
        href: '/dashboard/customer',
        icon: Users,
        roles: [USER_ROLES.CASHIER, USER_ROLES.ADMIN, USER_ROLES.SERVICEMANAGER],
        // roles: [USER_ROLES.ADMIN],
    },
    {
        title: 'Inventory',
        href: '/dashboard/inventory',
        icon: LayoutGrid,
        roles: [USER_ROLES.CASHIER, USER_ROLES.ADMIN, USER_ROLES.SERVICEMANAGER],
        // roles: [USER_ROLES.ADMIN],
    },
    {
        title: 'Admin Purchase Order',
        href: '/dashboard/purchase-order',
        icon: TicketCheck,
        roles: [USER_ROLES.CASHIER, USER_ROLES.ADMIN, USER_ROLES.SERVICEMANAGER],
        // roles: [USER_ROLES.ADMIN],
    },
    {
        title: 'User',
        href: '/dashboard/user',
        icon: UserRound,
        roles: [USER_ROLES.CASHIER, USER_ROLES.ADMIN, USER_ROLES.SERVICEMANAGER],
        // roles: [USER_ROLES.ADMIN],
    },
    {
        title: 'Cashier Purchase Order',
        href: '/dashboard/purchase-order/cashier',
        icon: TicketCheck,
        roles: [USER_ROLES.CASHIER, USER_ROLES.ADMIN, USER_ROLES.SERVICEMANAGER],
        // roles: [USER_ROLES.CASHIER],
    },
    {
        title: 'Jobcard',
        href: '/dashboard/job-card',
        icon: IdCard,
        roles: [USER_ROLES.CASHIER, USER_ROLES.ADMIN, USER_ROLES.SERVICEMANAGER],
        // roles: [USER_ROLES.SERVICEMANAGER],
    },
    {
        title: 'Petty Cash',
        href: '/dashboard/petty-cash',
        icon: HandCoins,
        roles: [USER_ROLES.CASHIER, USER_ROLES.ADMIN, USER_ROLES.SERVICEMANAGER],
        // roles: [USER_ROLES.SERVICEMANAGER],
    },
    {
        title: 'GRN',
        href: '/dashboard/grn',
        icon: NotepadText,
        roles: [USER_ROLES.CASHIER, USER_ROLES.ADMIN, USER_ROLES.SERVICEMANAGER],
        // roles: [USER_ROLES.SERVICEMANAGER],
    },
    {
        title: 'Invoice',
        href: '/dashboard/invoice',
        icon: StickyNote,
        roles: [USER_ROLES.CASHIER, USER_ROLES.ADMIN, USER_ROLES.SERVICEMANAGER],
        // roles: [USER_ROLES.SERVICEMANAGER],
    },
    {
        title: 'Employee',
        href: '/dashboard/employee',
        icon: UserRoundCheck,
        roles: [USER_ROLES.CASHIER, USER_ROLES.ADMIN, USER_ROLES.SERVICEMANAGER],
        // roles: [USER_ROLES.SERVICEMANAGER],
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const userRole = auth?.user?.role || USER_ROLES.DEFAULT;
    const filteredMainNavItems = useMemo(() => {
        return mainNavItems.filter((item) => !item.roles || item.roles.includes(userRole));
    }, [userRole]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredMainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {/* <NavFooter items={[]} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
