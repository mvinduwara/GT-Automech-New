import React from 'react';
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

    return (
        <>
            {/* Stock Report */}
            <Head title="Stock Report" />
            <div className="p-6 bg-white rounded shadow mb-6">
                <h1 className="text-2xl font-bold mb-4">Stock Report</h1>

                <button
                    onClick={downloadStockReport}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Download Stock Report
                </button>

                <p className="mt-2 text-sm text-gray-600">
                    Click the button above to download the detailed Excel file.
                </p>
            </div>

            {/* Petty Cash Report */}
            <Head title="Petty Cash Report" />
            <div className="p-6 bg-white rounded shadow">
                <h1 className="text-2xl font-bold mb-4">Petty Cash Report</h1>

                <button
                    onClick={downloadPettyCashReport}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Download Petty Cash Report
                </button>

                <p className="mt-2 text-sm text-gray-600">
                    Click the button above to download the detailed Excel file.
                </p>
            </div>
        </>
    );
}
