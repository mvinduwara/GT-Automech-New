import { Head } from '@inertiajs/react';

export default function Reports() {
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

    return (
        <>
            {/* Stock Report */}
            <Head title="Stock Report" />
            <div className="mb-6 rounded bg-white p-6 shadow">
                <h1 className="mb-4 text-2xl font-bold">Stock Report</h1>

                <button onClick={downloadStockReport} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                    Download Stock Report
                </button>

                <p className="mt-2 text-sm text-gray-600">Click the button above to download the detailed Excel file.</p>
            </div>

            {/* Petty Cash Items Report */}
            <Head title="Petty Cash Items Report" />
            <div className="rounded bg-white p-6 shadow">
                <h1 className="mb-4 text-2xl font-bold">Petty Cash Items Report</h1>

                <button onClick={downloadPettyCashReport} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                    Download Petty Cash Items Report
                </button>

                <p className="mt-2 text-sm text-gray-600">Click the button above to download the detailed Excel file.</p>
            </div>

            {/* Petty Cash Vouchers Report */}
            <Head title="Petty Cash Vouchers Report" />
            <div className="rounded bg-white p-6 shadow">
                <h1 className="mb-4 text-2xl font-bold">Petty Cash Vouchers Report</h1>

                <button
                    onClick={() => (window.location.href = route('dashboard.reports.petty_cash_vouchers.download'))}
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                    Download Petty Cash Vouchers Report
                </button>

                <p className="mt-2 text-sm text-gray-600">Click the button above to download the detailed Excel file.</p>
            </div>

            {/* Employee Report */}
            <Head title="Employee Report" />
            <div className="rounded bg-white p-6 shadow">
                <h1 className="mb-4 text-2xl font-bold">Employee Report</h1>

                <button onClick={downloadEmployeeReport} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                    Download Employee Report
                </button>

                <p className="mt-2 text-sm text-gray-600">Click the button above to download the detailed Excel file.</p>
            </div>

            {/* Supplier Report */}
            <Head title="Supplier Report" />
            <div className="rounded bg-white p-6 shadow">
                <h1 className="mb-4 text-2xl font-bold">Supplier Report</h1>

                <button onClick={downloadSupplierReport} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                    Download Supplier Report
                </button>

                <p className="mt-2 text-sm text-gray-600">Click the button above to download the detailed Excel file.</p>
            </div>

            {/* Purchase Order Report */}
            <Head title="Purchase Order Report" />
            <div className="rounded bg-white p-6 shadow">
                <h1 className="mb-4 text-2xl font-bold">Purchase Order Report</h1>

                <button onClick={downloadPurchaseOrderReport} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                    Download Purchase Order Report
                </button>

                <p className="mt-2 text-sm text-gray-600">Click the button above to download the detailed Excel file.</p>
            </div>

            {/* Purchase Order Items Report */}
            <Head title="Purchase Order Items Report" />
            <div className="rounded bg-white p-6 shadow">
                <h1 className="mb-4 text-2xl font-bold">Purchase Order Items Report</h1>

                <button
                    onClick={() => (window.location.href = route('dashboard.reports.purchase_order_items.download'))}
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                    Download Purchase Order Items Report
                </button>

                <p className="mt-2 text-sm text-gray-600">Click the button above to download the detailed Excel file.</p>
            </div>
        </>
    );
}
