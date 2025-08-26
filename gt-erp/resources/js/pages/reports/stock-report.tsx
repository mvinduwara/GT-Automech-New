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

            {/* Petty Cash Report */}
            <Head title="Petty Cash Report" />
            <div className="rounded bg-white p-6 shadow">
                <h1 className="mb-4 text-2xl font-bold">Petty Cash Report</h1>

                <button onClick={downloadPettyCashReport} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                    Download Petty Cash Report
                </button>

                <p className="mt-2 text-sm text-gray-600">Click the button above to download the detailed Excel file.</p>
            </div>

            {/* Employee Report */}
            <Head title="Employee Report" />
            <div className="rounded bg-white p-6 shadow">
                <h1 className="mb-4 text-2xl font-bold">Employee Report</h1>

                <button
                    onClick={downloadEmployeeReport}
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                    Download Employee Report
                </button>

                <p className="mt-2 text-sm text-gray-600">Click the button above to download the detailed Excel file.</p>
            </div>
        </>
    );
}
