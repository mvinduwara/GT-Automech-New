import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Download } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reports',
        href: '/dashboard/reports',
    },
];

// Download Stock Report
const downloadStockReport = () => {
    window.location.href = route('dashboard.reports.stock.download');
};

// Download Petty Cash Report
const downloadPettyCashReport = () => {
    window.location.href = route('dashboard.reports.petty_cash.download');
};

// ✅ Download Employee Report
const downloadEmployeeReport = () => {
    window.location.href = route('dashboard.reports.employee.download');
};

// ✅ Download Supplier Report
const downloadSupplierReport = () => {
    window.location.href = route('dashboard.reports.supplier.download');
};

// ✅ Download Purchase Order Report
const downloadPurchaseOrderReport = () => {
    window.location.href = route('dashboard.reports.purchase_order.download');
};

export default function Reports() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Reports Overview</h1>
                </div>
                <>
                    <Head title="Reports" />

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {/* Stock Report */}
                        <div className="flex flex-col items-start justify-between gap-4 rounded-md bg-gradient-to-r from-red-300 to-slate-50 p-5 shadow-md">
                            <p className="font-medium text-neutral-700">Stock Report</p>
                            <Button variant={'outline'} onClick={downloadStockReport} c>
                                <Download className="h-4 w-4" /> Download
                            </Button>
                        </div>

                        {/* Petty Cash Items Report */}
                        <div className="flex flex-col items-start justify-between gap-4 rounded-md bg-gradient-to-r from-lime-300 to-slate-50 p-5 shadow-md">
                            <p className="font-medium text-neutral-700">Petty Cash Items Report</p>
                            <Button variant={'outline'} onClick={downloadPettyCashReport}>
                                <Download className="h-4 w-4" /> Download
                            </Button>
                        </div>

                        {/* Petty Cash Vouchers Report */}
                        <div className="flex flex-col items-start justify-between gap-4 rounded-md bg-gradient-to-r from-stone-400 to-neutral-300 p-5 shadow-md">
                            <p className="font-medium text-neutral-700">Petty Cash Vouchers Report</p>
                            <Button
                                variant={'outline'}
                                onClick={() => (window.location.href = route('dashboard.reports.petty_cash_vouchers.download'))}
                            >
                                <Download className="h-4 w-4" /> Download
                            </Button>
                        </div>

                        {/* Employee Report */}
                        <div className="flex flex-col items-start justify-between gap-4 rounded-md bg-gradient-to-r from-pink-200 to-violet-200 p-5 shadow-md">
                            <p className="font-medium text-neutral-700">Employee Report</p>
                            <Button variant={'outline'} onClick={downloadEmployeeReport}>
                                <Download className="h-4 w-4" /> Download
                            </Button>
                        </div>

                        {/* Supplier Report */}
                        <div className="flex flex-col items-start justify-between gap-4 rounded-md bg-gradient-to-r from-teal-500 to-teal-200 p-5 shadow-md">
                            <p className="font-medium text-neutral-700">Supplier Report</p>
                            <Button variant={'outline'} onClick={downloadSupplierReport}>
                                <Download className="h-4 w-4" /> Download
                            </Button>
                        </div>

                        {/* Purchase Order Report */}
                        <div className="flex flex-col items-start justify-between gap-4 rounded-md bg-gradient-to-r from-cyan-200 to-blue-200 p-5 shadow-md">
                            <p className="font-medium text-neutral-700">Purchase Order Report</p>
                            <Button variant={'outline'} onClick={downloadPurchaseOrderReport}>
                                <Download className="h-4 w-4" /> Download
                            </Button>
                        </div>

                        {/* Purchase Order Items Report */}
                        <div className="flex flex-col items-start justify-between gap-4 rounded-md bg-gradient-to-r from-green-300 to-slate-50 p-5 shadow-md">
                            <p className="font-medium text-neutral-700">Purchase Order Items Report</p>
                            <Button
                                variant={'outline'}
                                onClick={() => (window.location.href = route('dashboard.reports.purchase_order_items.download'))}
                            >
                                <Download className="h-4 w-4" /> Download
                            </Button>
                        </div>
                    </div>
                </>
            </div>
        </AppLayout>
    );
}
