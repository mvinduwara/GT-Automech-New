import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Stock',
        href: '/dashboard/stock',
    },
    {
        title: 'Creat Stock',
        href: '/dashboard/stock/edit',
    },
];

export default function Edit() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stock Name" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1>Edit Stock</h1>
            </div>
        </AppLayout>
    );
}
