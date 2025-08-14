import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Clear Cache',
        href: '/dashboard/clear-cache',
    },
];

export default function CacheClear() {

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cache Clear" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                <p>The cache has been cleared successfully.</p>
            </div>
        </AppLayout>
    );
}