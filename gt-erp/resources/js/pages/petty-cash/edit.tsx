import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Petty Cash',
        href: '/dashboard/petty-cash',
    },
    {
        title: 'New Petty Cash',
        href: '/dashboard/petty-cash/create',
    },
    {
        title: 'Edit Petty Cash',
        href: '/dashboard/petty-cash/edit',
    },
];

export default function Update() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Petty Cash" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <h1>Edit Petty Cash</h1>
            </div>
        </AppLayout>
    );
}
