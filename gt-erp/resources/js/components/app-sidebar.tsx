import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { File, Cog, Car, FileText, HandCoins, Home, IdCard, LayoutGrid, NotepadText, StickyNote, TicketCheck, Trash, UserPlus, UserRound, UserRoundCheck, Users } from 'lucide-react';
import { useMemo } from 'react';
import AppLogo from './app-logo';

const USER_ROLES = {
    CASHIER: 'cashier',
    ADMIN: 'admin',
    SERVICEMANAGER: 'service-manager',
    DEFAULT: 'admin',
};

const mainNavItems: (NavItem & { roles?: string[] })[] = [
    // Dashboard
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: Home,
        roles: [USER_ROLES.CASHIER, USER_ROLES.ADMIN, USER_ROLES.SERVICEMANAGER],
    },
    
    // Core Business Operations
    {
        title: 'Jobcard',
        href: '/dashboard/job-card',
        icon: IdCard,
        roles: [USER_ROLES.CASHIER, USER_ROLES.SERVICEMANAGER, USER_ROLES.ADMIN],
    },
    {
        title: 'Vehicle Services',
        href: '/dashboard/vehicle-services',
        icon: Cog,
        roles: [USER_ROLES.CASHIER, USER_ROLES.ADMIN, USER_ROLES.SERVICEMANAGER],
    },
    {
        title: 'Invoice',
        href: '/dashboard/invoice',
        icon: FileText,
        roles: [USER_ROLES.CASHIER, USER_ROLES.ADMIN, USER_ROLES.SERVICEMANAGER],
    },
    
    // Inventory & Procurement
    {
        title: 'Inventory',
        href: '/dashboard/inventory',
        icon: LayoutGrid,
        roles: [USER_ROLES.CASHIER, USER_ROLES.ADMIN],
    },
    {
        title: 'Purchase Order',
        href: '/dashboard/purchase-order',
        icon: TicketCheck,
        roles: [USER_ROLES.ADMIN, USER_ROLES.CASHIER, USER_ROLES.SERVICEMANAGER],
    },
    {
        title: 'GRN',
        href: '/dashboard/grn',
        icon: NotepadText,
        roles: [USER_ROLES.CASHIER, USER_ROLES.ADMIN, USER_ROLES.SERVICEMANAGER],
    },
    
    // Financial Management
    {
        title: 'Petty Cash',
        href: '/dashboard/petty-cash',
        icon: HandCoins,
        roles: [USER_ROLES.CASHIER, USER_ROLES.ADMIN, USER_ROLES.SERVICEMANAGER],
    },
    
    // Master Data Management
    {
        title: 'Customer',
        href: '/dashboard/customer',
        icon: Users,
        roles: [USER_ROLES.CASHIER, USER_ROLES.ADMIN],
    },
    {
        title: 'Vehicle',
        href: '/dashboard/vehicle',
        icon: Car,
        roles: [USER_ROLES.CASHIER, USER_ROLES.ADMIN],
    },
    {
        title: 'Supplier',
        href: '/dashboard/supplier',
        icon: UserPlus,
        roles: [USER_ROLES.CASHIER, USER_ROLES.ADMIN],
    },
    
    // User Management (Admin Only)
    {
        title: 'User',
        href: '/dashboard/user',
        icon: UserRound,
        roles: [USER_ROLES.ADMIN],
    },
    {
        title: 'Employee',
        href: '/dashboard/employee',
        icon: UserRoundCheck,
        roles: [USER_ROLES.ADMIN],
    },
    
    // Reports & System
    {
        title: 'Reports',
        href: '/dashboard/reports/stock',
        icon: File,
        roles: [USER_ROLES.CASHIER, USER_ROLES.ADMIN, USER_ROLES.SERVICEMANAGER],
    },
    {
        title: 'Clear Cache',
        href: '/dashboard/clear-cache',
        icon: Trash,
        roles: [USER_ROLES.CASHIER, USER_ROLES.ADMIN, USER_ROLES.SERVICEMANAGER],
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