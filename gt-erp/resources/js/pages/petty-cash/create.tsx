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
];

export default function Create() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add New Petty Cash" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <h1>Add new Petty Cash</h1>
            </div>
        </AppLayout>
    );
}
