import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Job card',
        href: '/dashboard/job-card',
    },
    {
        title: 'New Job card',
        href: '/dashboard/job-card/create',
    },
    {
        title: 'Edit Job Card',
        href: '/dashboard/job-card/edit',
    },
];

export default function Update() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit job card" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <h1>Edit job card</h1>
            </div>
        </AppLayout>
    );
}
