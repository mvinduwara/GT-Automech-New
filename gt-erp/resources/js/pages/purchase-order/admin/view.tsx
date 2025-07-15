import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Purchase Order',
        href: '/dashboard/purchase-order',
    },
    {
        title: 'Purchase Order View',
        href: '/dashboard/view',
    },
];

export default function View() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Purchase Order Name" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">

            </div>
        </AppLayout>
    );
}
