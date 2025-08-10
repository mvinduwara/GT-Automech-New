import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { toast } from 'sonner';
import { Link } from '@inertiajs/react';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from '@/components/ui/pagination';
import { Brand, Category, Product } from '@/types/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory',
        href: '/dashboard/inventory',
    },
    {
        title: 'Product',
        href: '/dashboard/product',
    },
];

type PaginatedProducts = {
    data: Product[];
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    current_page: number;
    first_page_url: string | null;
    from: number;
    last_page: number;
    last_page_url: string | null;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
};

type IndexProps = {
    products: PaginatedProducts; // Updated to use PaginatedProducts type
    categories: Category[];
    brands: Brand[];
    unitOfMeasures: { id: number; name: string }[];
    filters: {
        search?: string;
        category_id?: string;
        brand_id?: string;
        status?: string;
        unit_of_measure_id?: string;
    };
};

export default function Index({
    products,
    categories,
    brands,
    unitOfMeasures,
    filters,
}: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(
        filters.category_id || '',
    );
    const [selectedBrand, setSelectedBrand] = useState(filters.brand_id || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedUOM, setSelectedUOM] = useState(
        filters.unit_of_measure_id || '',
    );

    const applyFilters = () => {
        router.get(
            '/dashboard/product',
            {
                search,
                category_id: selectedCategory,
                brand_id: selectedBrand,
                status: selectedStatus,
                unit_of_measure_id: selectedUOM,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Filters applied successfully.');
                },
                onError: () => {
                    toast.error('Failed to apply filters.');
                },
            },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedCategory('');
        setSelectedBrand('');
        setSelectedStatus('');
        setSelectedUOM('');
        router.get(
            '/dashboard/product',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.info('Filters cleared.');
                },
                onError: () => {
                    toast.error('Failed to clear filters.');
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Products</h1>
                    <Button asChild>
                        <Link href="/dashboard/product/create">
                            Add New Product
                        </Link>
                    </Button>
                </div>

                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <Label htmlFor="search">Search (Name or Part Number)</Label>
                        <Input
                            id="search"
                            placeholder="Search by name or part number"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="category">Category</Label>
                        <Select
                            value={selectedCategory}
                            onValueChange={setSelectedCategory}
                        >
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
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
                    </div>
                    <div>
                        <Label htmlFor="brand">Brand</Label>
                        <Select
                            value={selectedBrand}
                            onValueChange={setSelectedBrand}
                        >
                            <SelectTrigger id="brand">
                                <SelectValue placeholder="Select a brand" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Brands</SelectItem>
                                {brands.map((brand) => (
                                    <SelectItem
                                        key={brand.id}
                                        value={String(brand.id)}
                                    >
                                        {brand.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={selectedStatus}
                            onValueChange={setSelectedStatus}
                        >
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="deactive">Deactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="uom">Unit of Measure</Label>
                        <Select value={selectedUOM} onValueChange={setSelectedUOM}>
                            <SelectTrigger id="uom">
                                <SelectValue placeholder="Select a UOM" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All Units of Measure
                                </SelectItem>
                                {unitOfMeasures.map((uom) => (
                                    <SelectItem
                                        key={uom.id}
                                        value={String(uom.id)}
                                    >
                                        {uom.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-full flex justify-end gap-2">
                        <Button onClick={applyFilters}>Apply Filters</Button>
                        <Button variant="outline" onClick={clearFilters}>
                            Clear Filters
                        </Button>
                    </div>
                </div>

                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Part Number</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Brand</TableHead>
                                <TableHead>Unit of Measure</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.data.length > 0 ? (
                                products.data.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>{product.part_number}</TableCell>
                                        <TableCell>{product.category.name}</TableCell>
                                        <TableCell>{product.brand.name}</TableCell>
                                        <TableCell>
                                            {product.unit_of_measure.name}
                                        </TableCell>
                                        <TableCell>{product.status}</TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild variant="ghost" size="sm">
                                                <Link href={`/dashboard/product/${product.id}/edit`}>
                                                    Edit
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center">
                                        No products found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {products.last_page > 1 && (
                    <Pagination>
                        <PaginationContent>
                            {products.links.map((link, index) => (
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
                                        {/* Render "..." for ellipsis, otherwise the label */}
                                        {link.label.includes('Previous') ? (
                                            <PaginationPrevious href={link.url || '#'} />
                                        ) : link.label.includes('Next') ? (
                                            <PaginationNext href={link.url || '#'} />
                                        ) : (
                                            link.label
                                        )}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                        </PaginationContent>
                    </Pagination>
                )}
            </div>
        </AppLayout>
    );
}