import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'GRN',
        href: '/dashboard/grn',
    },
    {
        title: 'New GRN',
        href: '/dashboard/grn/create',
    },
    {
        title: 'Edit GRN',
        href: '/dashboard/grn/edit',
    },
];

export default function Update() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit GRN" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <h1>Edit GRN</h1>
            </div>
        </AppLayout>
    );
}
