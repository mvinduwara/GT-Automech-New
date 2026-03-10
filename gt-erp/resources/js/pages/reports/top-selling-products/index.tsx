import { Button } from '@/components/ui/button';
import { Head, router, usePage } from '@inertiajs/react';
import { Download, Calendar, Search } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ProductData {
    id: number;
    name: string;
    part_number: string;
    brand_name: string | null;
    total_sold: number;
    current_stock: number;
    is_low_stock: boolean;
}

interface PageProps {
    products: ProductData[];
    filters: {
        startDate: string;
        endDate: string;
    };
    [key: string]: unknown;
}

export default function Index() {
    const { products, filters } = usePage<PageProps>().props;
    const [startDate, setStartDate] = useState(filters.startDate);
    const [endDate, setEndDate] = useState(filters.endDate);
    const [viewType, setViewType] = useState<'daily' | 'monthly' | 'yearly' | 'custom'>('daily');

    const handleQuickFilter = (type: 'daily' | 'monthly' | 'yearly') => {
        setViewType(type);
        const now = new Date();
        let start, end;

        if (type === 'daily') {
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        } else if (type === 'monthly') {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        } else {
            start = new Date(now.getFullYear(), 0, 1);
            end = new Date(now.getFullYear(), 11, 31);
        }

        const startStr = start.toISOString().split('T')[0];
        const endStr = end.toISOString().split('T')[0];

        setStartDate(startStr);
        setEndDate(endStr);

        router.get(route('dashboard.reports.top_selling_products'), {
            start_date: startStr,
            end_date: endStr,
        }, { preserveState: true, replace: true });
    };

    const handleApplyCustom = () => {
        setViewType('custom');
        router.get(route('dashboard.reports.top_selling_products'), {
            start_date: startDate,
            end_date: endDate,
        }, { preserveState: true, replace: true });
    };

    const handleDownloadPdf = () => {
        const url = new URL(route('dashboard.reports.top_selling_products.pdf'));
        url.searchParams.append('start_date', startDate);
        url.searchParams.append('end_date', endDate);
        window.location.href = url.toString();
    };

    const breadcrumbs = [
        { title: 'Reports', href: '/dashboard/reports/stock' },
        { title: 'Top Selling Products', href: '#' }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Top Selling Products" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 overflow-y-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border shadow-sm ring-1 ring-gray-900/5">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Mostly Selling Products</h1>
                        <p className="text-gray-500 mt-1 text-sm">Monitor high-demand products and availability for restocking.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button 
                            onClick={handleDownloadPdf} 
                            variant="outline" 
                            className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                            <Download className="h-4 w-4" />
                            Export PDF
                        </Button>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 bg-white p-5 rounded-2xl border shadow-sm ring-1 ring-gray-900/5">
                    <div className="flex items-center p-1 bg-gray-100 rounded-lg self-start">
                        <button
                            onClick={() => handleQuickFilter('daily')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewType === 'daily' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Daily
                        </button>
                        <button
                            onClick={() => handleQuickFilter('monthly')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewType === 'monthly' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => handleQuickFilter('yearly')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewType === 'yearly' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Yearly
                        </button>
                    </div>

                    <div className="h-4 w-[1px] bg-gray-200 hidden lg:block mx-1"></div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="text-sm border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                            <span className="text-gray-400 text-sm">to</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="text-sm border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <Button onClick={handleApplyCustom} size="sm" className="bg-blue-600 hover:bg-blue-700">Apply Filter</Button>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-2xl border shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50">
                                <TableHead className="py-4 px-6 font-semibold text-gray-700">Part Number</TableHead>
                                <TableHead className="py-4 px-6 font-semibold text-gray-700">Product Name</TableHead>
                                <TableHead className="py-4 px-6 font-semibold text-gray-700">Brand</TableHead>
                                <TableHead className="py-4 px-6 font-semibold text-gray-700 text-right">Qty Sold</TableHead>
                                <TableHead className="py-4 px-6 font-semibold text-gray-700 text-right">Avail. Stock</TableHead>
                                <TableHead className="py-4 px-6 font-semibold text-gray-700 text-center">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <TableRow key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                        <TableCell className="px-6 py-4 font-mono text-xs text-gray-500">{product.part_number}</TableCell>
                                        <TableCell className="px-6 py-4 font-bold text-gray-900">{product.name}</TableCell>
                                        <TableCell className="px-6 py-4 text-gray-600">{product.brand_name || '-'}</TableCell>
                                        <TableCell className="px-6 py-4 text-right">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                {product.total_sold}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-right font-medium">{product.current_stock}</TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            {product.is_low_stock ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 ring-1 ring-inset ring-red-600/20">
                                                    Low Stock
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 ring-1 ring-inset ring-green-600/20">
                                                    Available
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Search className="h-8 w-8 text-gray-300" />
                                            <p className="text-gray-500 font-medium">No sales data found for this period.</p>
                                            <p className="text-gray-400 text-xs text-center max-w-xs">Try selecting a different date range to see which products are performing best.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
