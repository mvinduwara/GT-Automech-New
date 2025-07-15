import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Purchase Order',
        href: '/dashboard/purchase-order',
    },
];

export default function Index() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Purchase Order" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="h1 font-bold">All Purchase Orders View (Cashier)</h1>
                    {/* <Link href={route('dashboard.purchase-order.index')}>
                        <Button>Add New Purchase Order</Button>
                    </Link> */}
                </div>
            </div>
        </AppLayout>
    );
}
