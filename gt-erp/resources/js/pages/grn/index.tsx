import { Button } from '@/components/ui/button';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'GRN',
        href: '/dashboard/grn',
    },
];

export default function Index() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="GRN" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="flex items-center justify-between">
                    <h1 className="h1 font-bold">All Good Received Notes (GRN)</h1>
                    <Link href={route('dashboard.grn.create')}>
                        <Button>Add New GRN</Button>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
