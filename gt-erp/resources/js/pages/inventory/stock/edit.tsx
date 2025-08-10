// edit.tsx
import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster, toast } from 'sonner';
import { debounce } from 'lodash';
import { Category, Product, Stock, UnitOfMeasure } from '@/types/types';

interface ProductSearchResult {
    id: number;
    name: string;
    part_number: string;
    reorder_level: number;
}

interface EditStockPageProps {
    stock: Stock;
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
    {
        title: 'Edit Stock',
        href: ``,
    },
];

export default function Edit() {
    const { stock, categories, unitOfMeasures, success, error } =
        usePage<EditStockPageProps>().props;

    const { data, setData, put, processing, errors } = useForm({
        product_id: String(stock.product_id),
        alternative_product_id: stock.alternative_product_id
            ? String(stock.alternative_product_id)
            : '',
        quantity: String(stock.quantity),
        buying_price: String(stock.buying_price),
        selling_price: String(stock.selling_price),
        status: stock.status,
    });

    const [mainProductSearchQuery, setMainProductSearchQuery] = useState(
        stock.product.part_number || ''
    );
    const [mainProductSearchResults, setMainProductSearchResults] = useState<
        ProductSearchResult[]
    >([]);
    const [selectedMainProduct, setSelectedMainProduct] =
        useState<ProductSearchResult | null>(stock.product);

    const [altProductSearchQuery, setAltProductSearchQuery] = useState(
        stock.alternative_product?.part_number || ''
    );
    const [altProductSearchResults, setAltProductSearchResults] = useState<
        ProductSearchResult[]
    >([]);
    const [selectedAltProduct, setSelectedAltProduct] =
        useState<ProductSearchResult | null>(stock.alternative_product);

    useEffect(() => {
        if (success) {
            toast.success(success);
        }
        if (error) {
            toast.error(error);
        }
    }, [success, error]);

    // Debounced product search for main product
    const debouncedMainProductSearch = useCallback(
        debounce(async (query: string) => {
            if (query.length > 2) {
                try {
                    const response = await fetch(
                        route('dashboard.stock.search-products', { query })
                    );
                    const data = await response.json();
                    setMainProductSearchResults(data);
                } catch (e) {
                    toast.error('Failed to search products.');
                    console.error('Product search error:', e);
                }
            } else {
                setMainProductSearchResults([]);
            }
        }, 300),
        []
    );

    // Debounced product search for alternative product
    const debouncedAltProductSearch = useCallback(
        debounce(async (query: string) => {
            if (query.length > 2) {
                try {
                    const response = await fetch(
                        route('dashboard.stock.search-products', { query })
                    );
                    const data = await response.json();
                    setAltProductSearchResults(data);
                } catch (e) {
                    toast.error('Failed to search alternative products.');
                    console.error('Alternative product search error:', e);
                }
            } else {
                setAltProductSearchResults([]);
            }
        }, 300),
        []
    );

    const handleMainProductSearchChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const query = e.target.value;
        setMainProductSearchQuery(query);
        debouncedMainProductSearch(query);
    };

    const handleAltProductSearchChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const query = e.target.value;
        setAltProductSearchQuery(query);
        debouncedAltProductSearch(query);
    };

    const selectMainProduct = (product: ProductSearchResult) => {
        setSelectedMainProduct(product);
        setData('product_id', String(product.id));
        setMainProductSearchQuery(product.part_number); // Show selected part number in input
        setMainProductSearchResults([]); // Clear search results
    };

    const selectAltProduct = (product: ProductSearchResult) => {
        setSelectedAltProduct(product);
        setData('alternative_product_id', String(product.id));
        setAltProductSearchQuery(product.part_number); // Show selected part number in input
        setAltProductSearchResults([]); // Clear search results
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('dashboard.stock.update', { stock: stock.id }));
    };

    const calculateEstimatedSalesValue = () => {
        if (data.quantity && data.selling_price) {
            return (
                parseFloat(data.quantity) * parseFloat(data.selling_price)
            ).toFixed(2);
        }
        return '0.00';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Stock: ${stock.product.name}`} />
            <Toaster position="top-right" richColors />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 md:flex-row">
                <div className="flex-1 rounded-lg border bg-white p-6 shadow-sm ">
                    <h1 className="mb-6 text-2xl font-bold text-gray-800 ">
                        Edit Stock Item
                    </h1>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Main Product Selection */}
                        <div>
                            <Label
                                htmlFor="main_product_search"
                                className="mb-2 block text-sm font-medium text-gray-700 "
                            >
                                Search Main Product by Part Number{' '}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="main_product_search"
                                type="text"
                                value={mainProductSearchQuery}
                                onChange={handleMainProductSearchChange}
                                placeholder="e.g., ABC-123"
                                className="rounded-md border border-gray-300 p-2 "
                            />
                            {mainProductSearchResults.length > 0 && (
                                <ul className="mt-2 max-h-48 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg ">
                                    {mainProductSearchResults.map((product) => (
                                        <li
                                            key={product.id}
                                            onClick={() =>
                                                selectMainProduct(product)
                                            }
                                            className="cursor-pointer px-4 py-2 hover:bg-gray-100 "
                                        >
                                            {product.part_number} -{' '}
                                            {product.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {selectedMainProduct && (
                                <p className="mt-2 text-sm text-gray-600 ">
                                    Selected Main Product:{' '}
                                    <strong>
                                        {selectedMainProduct.name} (
                                        {selectedMainProduct.part_number})
                                    </strong>
                                </p>
                            )}
                            {errors.product_id && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.product_id}
                                </p>
                            )}
                        </div>

                        {/* Alternative Product Selection (Optional) */}
                        <div>
                            <Label
                                htmlFor="alt_product_search"
                                className="mb-2 block text-sm font-medium text-gray-700 "
                            >
                                Search Alternative Product by Part Number
                                (Optional)
                            </Label>
                            <Input
                                id="alt_product_search"
                                type="text"
                                value={altProductSearchQuery}
                                onChange={handleAltProductSearchChange}
                                placeholder="e.g., XYZ-456"
                                className="rounded-md border border-gray-300 p-2 "
                            />
                            {altProductSearchResults.length > 0 && (
                                <ul className="mt-2 max-h-48 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg ">
                                    {altProductSearchResults.map((product) => (
                                        <li
                                            key={product.id}
                                            onClick={() =>
                                                selectAltProduct(product)
                                            }
                                            className="cursor-pointer px-4 py-2 hover:bg-gray-100 "
                                        >
                                            {product.part_number} -{' '}
                                            {product.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {selectedAltProduct && (
                                <p className="mt-2 text-sm text-gray-600 ">
                                    Selected Alternative Product:{' '}
                                    <strong>
                                        {selectedAltProduct.name} (
                                        {selectedAltProduct.part_number})
                                    </strong>
                                </p>
                            )}
                            {errors.alternative_product_id && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.alternative_product_id}
                                </p>
                            )}
                        </div>

                        {/* Quantity */}
                        <div>
                            <Label
                                htmlFor="quantity"
                                className="mb-2 block text-sm font-medium text-gray-700 "
                            >
                                Quantity <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="quantity"
                                type="number"
                                value={data.quantity}
                                onChange={(e) =>
                                    setData('quantity', e.target.value)
                                }
                                min="0"
                                className="rounded-md border border-gray-300 p-2 "
                            />
                            {errors.quantity && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.quantity}
                                </p>
                            )}
                        </div>

                        {/* Buying Price */}
                        <div>
                            <Label
                                htmlFor="buying_price"
                                className="mb-2 block text-sm font-medium text-gray-700 "
                            >
                                Buying Price LKR{' '}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="buying_price"
                                type="number"
                                value={data.buying_price}
                                onChange={(e) =>
                                    setData('buying_price', e.target.value)
                                }
                                step="0.01"
                                min="0"
                                className="rounded-md border border-gray-300 p-2 "
                            />
                            {errors.buying_price && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.buying_price}
                                </p>
                            )}
                        </div>

                        {/* Selling Price */}
                        <div>
                            <Label
                                htmlFor="selling_price"
                                className="mb-2 block text-sm font-medium text-gray-700 "
                            >
                                Selling Price LKR{' '}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="selling_price"
                                type="number"
                                value={data.selling_price}
                                onChange={(e) =>
                                    setData('selling_price', e.target.value)
                                }
                                step="0.01"
                                min="0"
                                className="rounded-md border border-gray-300 p-2 "
                            />
                            {errors.selling_price && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.selling_price}
                                </p>
                            )}
                        </div>

                        {/* Status */}
                        <div>
                            <Label
                                htmlFor="status"
                                className="mb-2 block text-sm font-medium text-gray-700 "
                            >
                                Status <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={data.status}
                                onValueChange={(value) =>
                                    setData('status', value)
                                }
                            >
                                <SelectTrigger className="rounded-md border border-gray-300 p-2 ">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent className="">
                                    <SelectItem value="active">
                                        Active
                                    </SelectItem>
                                    <SelectItem value="deactive">
                                        Deactive
                                    </SelectItem>
                                    <SelectItem value="out of stock">
                                        Out of Stock
                                    </SelectItem>
                                    <SelectItem value="rejected">
                                        Rejected
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.status}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 "
                        >
                            {processing ? 'Updating...' : 'Update Stock'}
                        </Button>
                    </form>
                </div>

                {/* Summary Card */}
                <div className="mt-6 md:mt-0 md:w-1/3">
                    <Card className="rounded-lg border bg-white shadow-sm ">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-gray-800 ">
                                Stock Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-gray-700 ">
                            <p>
                                <strong>Main Product:</strong>{' '}
                                {selectedMainProduct
                                    ? `${selectedMainProduct.name} (${selectedMainProduct.part_number})`
                                    : 'Not selected'}
                            </p>
                            <p>
                                <strong>Alternative Product:</strong>{' '}
                                {selectedAltProduct
                                    ? `${selectedAltProduct.name} (${selectedAltProduct.part_number})`
                                    : 'None'}
                            </p>
                            <p>
                                <strong>Quantity:</strong>{' '}
                                {data.quantity || '0'}
                            </p>
                            <p>
                                <strong>Buying Price:</strong> LKR{' '}
                                {/* {(data.buying_price || 0).toFixed(2)} */}
                                {(data.buying_price || 0)}
                            </p>
                            <p>
                                <strong>Selling Price:</strong> LKR{' '}
                                {/* {(data.selling_price || 0).toFixed(2)} */}
                                {(data.selling_price || 0)}
                            </p>
                            <p>
                                <strong>Status:</strong>{' '}
                                {data.status.toUpperCase()}
                            </p>
                            <p className="mt-4 text-lg font-semibold">
                                Estimated Sales Value:{' '}
                                <span className="text-blue-600">
                                    LKR{' '}{calculateEstimatedSalesValue()}
                                </span>
                            </p>
                            {selectedMainProduct && (
                                <p className="text-sm text-gray-500 ">
                                    Main Product Reorder Level:{' '}
                                    {selectedMainProduct.reorder_level}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
