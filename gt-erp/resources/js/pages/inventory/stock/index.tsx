import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage, router } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Toaster, toast } from 'sonner';
import { Category, Stock, UnitOfMeasure } from '@/types/types';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

interface StocksPageProps {
    stocks: {
        data: Stock[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        category_id?: string;
        unit_of_measure_id?: string;
        min_qty?: string;
        max_qty?: string;
        min_buying_price?: string;
        max_buying_price?: string;
        min_selling_price?: string;
        max_selling_price?: string;
    };
    categories: Category[];
    unitOfMeasures: UnitOfMeasure[];
    success?: string;
    error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory',
        href: '/dashboard/inventory',
    },
    {
        title: 'Stock',
        href: '/dashboard/stock',
    },
];

export default function Index() {
    const { stocks, filters, categories, unitOfMeasures, success, error } =
        usePage<StocksPageProps>().props;

    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [unitOfMeasureId, setUnitOfMeasureId] = useState(
        filters.unit_of_measure_id || ''
    );
    const [minQty, setMinQty] = useState(filters.min_qty || '');
    const [maxQty, setMaxQty] = useState(filters.max_qty || '');
    const [minBuyingPrice, setMinBuyingPrice] = useState(
        filters.min_buying_price || ''
    );
    const [maxBuyingPrice, setMaxBuyingPrice] = useState(
        filters.max_buying_price || ''
    );
    const [minSellingPrice, setMinSellingPrice] = useState(
        filters.min_selling_price || ''
    );
    const [maxSellingPrice, setMaxSellingPrice] = useState(
        filters.max_selling_price || ''
    );

    const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
    const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

    useEffect(() => {
        if (success) {
            toast.success(success);
        }
        if (error) {
            toast.error(error);
        }
    }, [success, error]);

    const applyFilters = () => {
        router.get(
            route('dashboard.stock.index'),
            {
                search,
                category_id: categoryId,
                unit_of_measure_id: unitOfMeasureId,
                min_qty: minQty,
                max_qty: maxQty,
                min_buying_price: minBuyingPrice,
                max_buying_price: maxBuyingPrice,
                min_selling_price: minSellingPrice,
                max_selling_price: maxSellingPrice,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const clearFilters = () => {
        setSearch('');
        setCategoryId('');
        setUnitOfMeasureId('');
        setMinQty('');
        setMaxQty('');
        setMinBuyingPrice('');
        setMaxBuyingPrice('');
        setMinSellingPrice('');
        setMaxSellingPrice('');
        router.get(
            route('dashboard.stock.index'),
            {},
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleRowClick = (stock: Stock) => {
        setSelectedStock(stock);
        setIsSummaryDialogOpen(true);
    };

    const calculateSalesValue = (stock: Stock) => {
        return (stock.quantity * stock.selling_price).toFixed(2);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stock" />
            <Toaster position="top-right" richColors />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-1 gap-4 justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800 ">
                        Stock Management
                    </h1>
                    <Link href='/dashboard/stock/create'>
                        <Button>
                            Create New Stock
                        </Button>
                    </Link>
                </div>

                {/* Filter Section */}
                <div className="rounded-lg border bg-white p-4 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-gray-700 ">
                        Filters
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        <Input
                            placeholder="Search by Part Number"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="rounded-md border border-gray-300 p-2 "
                        />
                        <Select
                            value={categoryId}
                            onValueChange={setCategoryId}
                        >
                            <SelectTrigger className="rounded-md border border-gray-300 p-2 ">
                                <SelectValue placeholder="Filter by Category" />
                            </SelectTrigger>
                            <SelectContent className=" ">
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((category) => (
                                    <SelectItem
                                        key={category.id}
                                        value={String(category.id)}
                                    >
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={unitOfMeasureId}
                            onValueChange={setUnitOfMeasureId}
                        >
                            <SelectTrigger className="rounded-md border border-gray-300 p-2 ">
                                <SelectValue placeholder="Filter by UOM" />
                            </SelectTrigger>
                            <SelectContent className="">
                                <SelectItem value="all">All UOMs</SelectItem>
                                {unitOfMeasures.map((uom) => (
                                    <SelectItem
                                        key={uom.id}
                                        value={String(uom.id)}
                                    >
                                        {uom.name} ({uom.abbreviation})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                placeholder="Min Qty"
                                value={minQty}
                                onChange={(e) => setMinQty(e.target.value)}
                                className="rounded-md border border-gray-300 p-2 "
                            />
                            <Input
                                type="number"
                                placeholder="Max Qty"
                                value={maxQty}
                                onChange={(e) => setMaxQty(e.target.value)}
                                className="rounded-md border border-gray-300 p-2 "
                            />
                        </div>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                placeholder="Min Buy Price"
                                value={minBuyingPrice}
                                onChange={(e) =>
                                    setMinBuyingPrice(e.target.value)
                                }
                                className="rounded-md border border-gray-300 p-2 "
                            />
                            <Input
                                type="number"
                                placeholder="Max Buy Price"
                                value={maxBuyingPrice}
                                onChange={(e) =>
                                    setMaxBuyingPrice(e.target.value)
                                }
                                className="rounded-md border border-gray-300 p-2 "
                            />
                        </div>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                placeholder="Min Sell Price"
                                value={minSellingPrice}
                                onChange={(e) =>
                                    setMinSellingPrice(e.target.value)
                                }
                                className="rounded-md border border-gray-300 p-2 "
                            />
                            <Input
                                type="number"
                                placeholder="Max Sell Price"
                                value={maxSellingPrice}
                                onChange={(e) =>
                                    setMaxSellingPrice(e.target.value)
                                }
                                className="rounded-md border border-gray-300 p-2 "
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <Button
                            onClick={applyFilters}
                        >
                            Apply Filters
                        </Button>
                        <Button
                            onClick={clearFilters}
                            variant="outline"
                            className="rounded-md border border-red-300 px-4 py-2 text-red-700 hover:bg-red-100 "
                        >
                            Clear Filters
                        </Button>
                    </div>
                </div>

                {/* Stock Table */}
                <div className="overflow-x-auto rounded-lg border bg-white shadow-sm ">
                    <Table className="min-w-full divide-y divide-gray-200 ">
                        <TableHeader>
                            <TableRow className="bg-gray-50 ">
                                <TableHead className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 ">
                                    Part Number
                                </TableHead>
                                <TableHead className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 ">
                                    Category
                                </TableHead>
                                <TableHead className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 ">
                                    Alt. Part Number
                                </TableHead>
                                <TableHead className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 ">
                                    Quantity
                                </TableHead>
                                <TableHead className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 ">
                                    UOM
                                </TableHead>
                                <TableHead className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-500 text-right">
                                    Buying Price
                                </TableHead>
                                <TableHead className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-500 text-right">
                                    Selling Price
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-200 ">
                            {stocks.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="py-4 text-center text-gray-500 "
                                    >
                                        No stock items found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                stocks.data.map((stock) => (
                                    <TableRow
                                        key={stock.id}
                                        onClick={() => handleRowClick(stock)}
                                        className={`cursor-pointer transition-colors hover:bg-gray-100  ${stock.status == 'deactive'
                                            ? 'text-red-500 '
                                            : ''
                                            } ${stock.quantity <=
                                                stock.product.reorder_level
                                                ? 'bg-red-300/50 '
                                                : ''
                                            }`}
                                    >
                                        <TableCell className="whitespace-nowrap px-6 py-4">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        {
                                                            stock.product
                                                                .part_number
                                                        }
                                                    </TooltipTrigger>
                                                    <TooltipContent className="bg-gray-800 text-white ">
                                                        <p>
                                                            {stock.product.name}
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap px-6 py-4">
                                            {stock.product.category?.name ||
                                                'N/A'}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap px-6 py-4 ">
                                            {stock.alternative_product ? (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            {
                                                                stock
                                                                    .alternative_product
                                                                    .part_number
                                                            }
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-gray-800 text-white ">
                                                            <p>
                                                                {
                                                                    stock
                                                                        .alternative_product
                                                                        .name
                                                                }
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            ) : (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                             <p>
                                                                N/A
                                                            </p>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-gray-800 text-white ">
                                                            <p>
                                                                N/A
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap px-6 py-4">
                                            {stock.quantity}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap px-6 py-4">
                                            {stock.product.unit_of_measure
                                                ?.abbreviation || 'N/A'}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap px-6 py-4 text-right">
                                            {/* ${stock.buying_price.toFixed(2)} */}
                                            LKR{' '}{stock.buying_price}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap px-6 py-4 text-right">
                                            LKR{' '}{stock.selling_price}
                                            {/* ${stock.selling_price.toFixed(2)} */}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {
                    stocks.last_page > 1 && (
                        <Pagination>
                            <PaginationContent>
                                {stocks.links.map((link, index) => (
                                    // Only render if the label is a number or "..." (ellipsis)
                                    // We'll exclude links with labels "Previous" or "Next"
                                    !link.label.includes('Previous') && !link.label.includes('Next') && (
                                        <PaginationItem key={index}>
                                            <PaginationLink
                                                href={link.url || '#'}
                                                isActive={link.active}
                                                onClick={(e) => {
                                                    if (!link.url) {
                                                        e.preventDefault();
                                                    } else {
                                                        router.get(link.url, {}, {
                                                            preserveScroll: true,
                                                            preserveState: true,
                                                        });
                                                    }
                                                }}
                                                disabled={!link.url}
                                            >
                                                {link.label}
                                            </PaginationLink>
                                        </PaginationItem>
                                    )
                                ))}
                            </PaginationContent>
                        </Pagination>
                    )
                }

                {/* Summary Dialog */}
                <Dialog
                    open={isSummaryDialogOpen}
                    onOpenChange={setIsSummaryDialogOpen}
                >
                    <DialogContent className="max-w-md rounded-lg bg-white p-6 shadow-lg ">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-gray-800 ">
                                Stock Summary
                            </DialogTitle>
                            <DialogDescription className="text-gray-600 ">
                                Detailed information about the selected stock
                                item.
                            </DialogDescription>
                        </DialogHeader>
                        {selectedStock && (
                            <div className="mt-4 space-y-2 text-gray-700">
                                <p>
                                    <strong>Main Product:</strong>{' '}
                                    {selectedStock.product.name} (
                                    {selectedStock.product.part_number})
                                </p>
                                {selectedStock.alternative_product && (
                                    <p>
                                        <strong>Alternative Product:</strong>{' '}
                                        {selectedStock.alternative_product.name}{' '}
                                        (
                                        {
                                            selectedStock.alternative_product
                                                .part_number
                                        }
                                        )
                                    </p>
                                )}
                                <p>
                                    <strong>Category:</strong>{' '}
                                    {selectedStock.product.category?.name ||
                                        'N/A'}
                                </p>
                                <p>
                                    <strong>Quantity:</strong>{' '}
                                    {selectedStock.quantity}{' '}
                                    {selectedStock.product.unit_of_measure
                                        ?.abbreviation || 'N/A'}
                                </p>
                                <p>
                                    <strong>Buying Price:</strong> LKR{` `}
                                    {selectedStock.buying_price}
                                    {/* {selectedStock.buying_price.toFixed(2)} */}
                                </p>
                                <p>
                                    <strong>Selling Price:</strong> LKR{` `}
                                    {selectedStock.selling_price}
                                    {/* {selectedStock.selling_price.toFixed(2)} */}
                                </p>
                                <p>
                                    <strong>Status:</strong>{' '}
                                    <span
                                        className={`${selectedStock.status === 'inactive'
                                            ? 'text-red-500'
                                            : 'text-green-600'
                                            }`}
                                    >
                                        {selectedStock.status.toUpperCase()}
                                    </span>
                                </p>
                                <p className="mt-4 text-lg font-semibold">
                                    Estimated Sales Value:{' '}
                                    <span className="text-blue-600">
                                        LKR{' '}{calculateSalesValue(selectedStock)}
                                    </span>
                                </p>
                            </div>
                        )}
                        <div className="mt-6 flex justify-end">
                            <Link
                                href={
                                    selectedStock
                                        ? route('dashboard.stock.edit', {
                                            stock: selectedStock.id,
                                        })
                                        : '#'
                                }
                            >
                                <Button className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 ">
                                    Edit Stock Item
                                </Button>
                            </Link>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

