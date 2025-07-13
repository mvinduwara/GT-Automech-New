import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Stock',
        href: '/dashboard/stock',
    },
    {
        title: 'Create',
        href: '/dashboard/create',
    },
    {
        title: 'Edit',
        href: '/dashboard/edit',
    },
];

export default function Edit() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stock Create" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"></div>
        </AppLayout>
    );
}
