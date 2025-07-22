import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory',
        href: '/dashboard/inventory',
    },
];

export default function Index() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1>Inventory</h1>
                <div className="grid grid-cols-4 gap-3">
                    <Link href='/dashboard/category'>
                        <Button>category</Button>
                    </Link>
                    <Link href='/dashboard/brand'>
                        <Button>brand</Button>
                    </Link>
                    <Link href='/dashboard/product'>
                        <Button>product</Button>
                    </Link>
                    <Link href='/dashboard/stock'>
                        <Button>stock</Button>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
