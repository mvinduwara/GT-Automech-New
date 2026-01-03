import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import VehicleModelSelector, { VehicleModel } from '@/components/VehicleModelSelector';
import { Head, router, usePage } from '@inertiajs/react';
import { Download, FileSpreadsheet, Eye } from 'lucide-react';
import { useState } from 'react';

interface Brand {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    part_number: string;
    brand_id: number | null;
    brand?: Brand;
    vehicle_models_count: number;
    vehicle_models: VehicleModel[];
    stocks: { quantity: number; selling_price: number; buying_price: number; status: string; created_at: string }[];
}

interface AnalysisPageProps {
    products: {
        data: Product[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        vehicle_model_id?: string;
        brand_id?: string;
    };
    brands: Brand[];
    vehicleModels: VehicleModel[];
    [key: string]: unknown;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reports',
        href: '/dashboard/reports/stock', // Default report page
    },
    {
        title: 'Product-Vehicle Analysis',
        href: '/dashboard/reports/product-vehicle-analysis',
    },
];

export default function Index() {
    const { products, filters, brands, vehicleModels } = usePage<AnalysisPageProps>().props;

    const [search, setSearch] = useState(filters.search || '');
    const [brandId, setBrandId] = useState(filters.brand_id || '');

    // Vehicle Model Selector expects array for multiple selection, but our filter can handle single ID.
    // For consistency with the selector component, we'll manage it as an array state but standard logic.
    // However, the backend filter in my controller expects a single `vehicle_model_id`.
    // Let's assume for this specific report we want single selection or I update the selector to handle single.
    // Looking at Stock page, it handled array. My controller handled `whereHas ... whereIn` check? 
    // Wait, my controller used `where('vehicle_models.id', $request->input('vehicle_model_id'))`.
    // It implies single value. I should probably adjust frontend to send the first ID if multiple selected or just handle one.
    // Actually, `VehicleModelSelector` likely returns an array of numbers.
    const initialVehicleModelIds = filters.vehicle_model_id ? [Number(filters.vehicle_model_id)] : [];
    const [selectedVehicleModelIds, setSelectedVehicleModelIds] = useState<number[]>(initialVehicleModelIds);

    // Helper for selected models objects to pass to Selector if needed (optional)
    const initialSelectedModels = vehicleModels.filter(vm => initialVehicleModelIds.includes(vm.id));

    // Stock Dialog State
    const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
    const [selectedProductForStock, setSelectedProductForStock] = useState<Product | null>(null);

    const handleViewStock = (product: Product) => {
        setSelectedProductForStock(product);
        setIsStockDialogOpen(true);
    };

    const applyFilters = () => {
        router.get(
            route('dashboard.reports.product_vehicle_analysis'),
            {
                search,
                brand_id: brandId === 'all' ? '' : brandId,
                vehicle_model_id: selectedVehicleModelIds.length > 0 ? selectedVehicleModelIds[0] : '', // Take first one for now
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const clearFilters = () => {
        setSearch('');
        setBrandId('');
        setSelectedVehicleModelIds([]);
        router.get(
            route('dashboard.reports.product_vehicle_analysis'),
            {},
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleDownloadExcel = () => {
        const url = new URL(route('dashboard.reports.product_vehicle_analysis.excel'));
        if (search) url.searchParams.append('search', search);
        if (brandId && brandId !== 'all') url.searchParams.append('brand_id', brandId);
        if (selectedVehicleModelIds.length > 0) url.searchParams.append('vehicle_model_id', String(selectedVehicleModelIds[0]));
        window.location.href = url.toString();
    };

    const handleDownloadPdf = () => {
        const url = new URL(route('dashboard.reports.product_vehicle_analysis.pdf'));
        if (search) url.searchParams.append('search', search);
        if (brandId && brandId !== 'all') url.searchParams.append('brand_id', brandId);
        if (selectedVehicleModelIds.length > 0) url.searchParams.append('vehicle_model_id', String(selectedVehicleModelIds[0]));
        window.location.href = url.toString();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product-Vehicle Analysis" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex w-full gap-4 justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Product-Vehicle Analysis
                    </h1>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleDownloadExcel}>
                            <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                        </Button>
                        <Button variant="outline" onClick={handleDownloadPdf}>
                            <Download className="mr-2 h-4 w-4" /> PDF
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-lg border bg-white p-4 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-gray-700">Filters</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                        <Input
                            placeholder="Search Part No / Name"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="rounded-md border border-gray-300 p-2"
                        />
                        <Select value={brandId} onValueChange={setBrandId}>
                            <SelectTrigger className="rounded-md border border-gray-300 p-2">
                                <SelectValue placeholder="Filter by Brand" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Brands</SelectItem>
                                {brands.map((brand) => (
                                    <SelectItem key={brand.id} value={String(brand.id)}>
                                        {brand.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div>
                            <VehicleModelSelector
                                value={selectedVehicleModelIds}
                                onChange={(ids) => setSelectedVehicleModelIds(ids.slice(-1))} // Hack to keep single selection if controller only supports one
                                initialSelectedModels={initialSelectedModels}
                            // Note: component usually expects arrays. I'm slicing to keep last one to simulate single select UX or enable multi in backend later.
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <Button onClick={applyFilters}>Apply Filters</Button>
                        <Button onClick={clearFilters} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                            Clear Filters
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
                    <Table className="min-w-full divide-y divide-gray-200">
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Part Number</TableHead>
                                <TableHead className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Product Name</TableHead>
                                <TableHead className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Brand</TableHead>
                                <TableHead className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Models (Count)</TableHead>
                                <TableHead className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Total Stock</TableHead>
                                <TableHead className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Latest Price</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-200">
                            {products.data?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-4 text-center text-gray-500">
                                        No data found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products.data?.map((product) => {
                                    const stock = product.stocks.filter(s => s.status === 'active').reduce((acc, s) => acc + s.quantity, 0);
                                    const latestPrice = product.stocks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]?.selling_price || 0;

                                    return (
                                        <TableRow key={product.id} className="hover:bg-gray-50">
                                            <TableCell className="px-6 py-4 whitespace-nowrap">{product.part_number}</TableCell>
                                            <TableCell className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{product.name}</TableCell>
                                            <TableCell className="px-6 py-4 whitespace-nowrap">{product.brand?.name || '-'}</TableCell>
                                            <TableCell className="px-6 py-4 text-center">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger className="underline decoration-dotted offset-2 text-blue-600">
                                                            {product.vehicle_models_count}
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-gray-800 text-white max-w-xs">
                                                            <p className="text-xs">
                                                                {product.vehicle_models.length > 0
                                                                    ? product.vehicle_models.map(m => m.name).join(', ')
                                                                    : 'No models linked'}
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span>{stock}</span>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleViewStock(product)}>
                                                        <Eye className="h-3 w-3 text-gray-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-right">LKR {latestPrice}</TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {products.last_page > 1 && (
                    <Pagination>
                        <PaginationContent>
                            {products.links.map((link, index) => (
                                !link.label.includes('Previous') && !link.label.includes('Next') && (
                                    <PaginationItem key={index}>
                                        <PaginationLink
                                            href={link.url || '#'}
                                            isActive={link.active}
                                            onClick={(e) => {
                                                if (!link.url) e.preventDefault();
                                                else router.get(link.url, {}, { preserveScroll: true, preserveState: true });
                                            }}
                                        >
                                            {link.label}
                                        </PaginationLink>
                                    </PaginationItem>
                                )
                            ))}
                        </PaginationContent>
                    </Pagination>
                )}
            </div>

            {/* Stock Details Dialog */}
            <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Stock Details: {selectedProductForStock?.name} ({selectedProductForStock?.part_number})</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date Added</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                    <TableHead className="text-right">Buying Price</TableHead>
                                    <TableHead className="text-right">Selling Price</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedProductForStock?.stocks && selectedProductForStock.stocks.length > 0 ? (
                                    selectedProductForStock.stocks.map((stock, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>{new Date(stock.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">{stock.quantity}</TableCell>
                                            <TableCell className="text-right">{stock.buying_price || '-'}</TableCell>
                                            <TableCell className="text-right">{stock.selling_price}</TableCell>
                                            <TableCell className="text-center">
                                                <span className={`px-2 py-1 rounded text-xs ${stock.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {stock.status}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-gray-500">No stock records found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
