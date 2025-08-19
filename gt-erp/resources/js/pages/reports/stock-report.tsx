import React from 'react';
import { Head } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';

export default function StockReport() {
    const generateReport = () => {
        Inertia.get(route('dashboard.reports.stock.download'), {}, {
            preserveState: true,
        });
    };

    return (
        <>
            <Head title="Stock Report" />
            <div className="p-6 bg-white rounded shadow">
                <h1 className="text-2xl font-bold mb-4">Stock Report</h1>

                <button
                    onClick={generateReport}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Generate Stock Report
                </button>

                <p className="mt-2 text-sm text-gray-600">
                    Click the button above to download the detailed Excel file.
                </p>
            </div>
        </>
    );
}