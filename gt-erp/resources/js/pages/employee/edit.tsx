import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Employee',
        href: '/dashboard/employee',
    },
    {
        title: 'New Employee',
        href: '/dashboard/employee/create',
    },
    {
        title: 'Edit Employee',
        href: '/dashboard/employee/edit',
    },
];

export default function Edit() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Employee" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1>Edit Employee</h1>
            </div>
        </AppLayout>
    );
}
