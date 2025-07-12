import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Customer',
        href: '/dashboard/customer',
    },
    {
        title: 'New Customer',
        href: '/dashboard/customer/create',
    },
];

export default function Update() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Customer" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                
            </div>
        </AppLayout>
    );
}
