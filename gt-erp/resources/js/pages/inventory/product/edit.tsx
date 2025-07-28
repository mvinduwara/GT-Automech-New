import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { FormEvent, useEffect } from 'react';
import { Brand, Category, UnitOfMeasure } from '@/types/types';

type Product = {
    id: number;
    name: string;
    part_number: string;
    description: string;
    category_id: Category;
    brand_id: Brand;
    unit_of_measure_id: UnitOfMeasure;
    reorder_level: number;
    status: string;
};

type EditProductProps = {
    product: Product;
    categories: Category[];
    brands: Brand[];
    unitOfMeasures: UnitOfMeasure[];
};

export default function Edit({
    product,
    categories,
    brands,
    unitOfMeasures,
}: EditProductProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Inventory',
            href: '/dashboard/inventory',
        },
        {
            title: 'Product',
            href: '/dashboard/product',
        },
        {
            title: product.name,
            href: '',
        },
    ];

    const { data, setData, post, processing, errors } = useForm({
        name: product.name,
        part_number: product.part_number,
        description: product.description,
        category_id: String(product.category_id),
        brand_id: String(product.brand_id),
        unit_of_measure_id: String(product.unit_of_measure_id),
        reorder_level: String(product.reorder_level),
        status: product.status,
        _method: 'POST', // Inertia handles PUT/PATCH via _method spoofing for POST requests
    });

    useEffect(() => {
        // This effect can be useful if product data can change after initial load
        // But with typical Inertia, product is passed once and form handles state
        setData({
            name: product.name,
            part_number: product.part_number,
            description: product.description,
            category_id: String(product.category_id),
            brand_id: String(product.brand_id),
            unit_of_measure_id: String(product.unit_of_measure_id),
            reorder_level: String(product.reorder_level),
            status: product.status,
            _method: 'POST',
        });
    }, [product]);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(`/dashboard/product/${product.id}/update`, {
            onSuccess: () => {
                toast.success('Product updated successfully.');
            },
            onError: (formErrors) => {
                Object.values(formErrors).forEach((message) => {
                    if (message) toast.error(message);
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${product.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1 className="text-2xl font-semibold">
                    Edit Product: {product.name}
                </h1>

                <form
                    onSubmit={submit}
                    className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4"
                >
                    <div>
                        <Label htmlFor="name">Product Name</Label>
                        <Input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="part_number">Part Number</Label>
                        <Input
                            id="part_number"
                            type="text"
                            value={data.part_number}
                            onChange={(e) =>
                                setData('part_number', e.target.value)
                            }
                            required
                        />
                        {errors.part_number && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.part_number}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                        />
                        {errors.description && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.description}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="category_id">Category</Label>
                        <Select
                            value={data.category_id}
                            onValueChange={(value) =>
                                setData('category_id', value)
                            }
                        >
                            <SelectTrigger id="category_id">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
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
                        {errors.category_id && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.category_id}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="brand_id">Brand</Label>
                        <Select
                            value={data.brand_id}
                            onValueChange={(value) => setData('brand_id', value)}
                        >
                            <SelectTrigger id="brand_id">
                                <SelectValue placeholder="Select a brand" />
                            </SelectTrigger>
                            <SelectContent>
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
                        {errors.brand_id && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.brand_id}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="unit_of_measure_id">
                            Unit of Measure
                        </Label>
                        <Select
                            value={data.unit_of_measure_id}
                            onValueChange={(value) =>
                                setData('unit_of_measure_id', value)
                            }
                        >
                            <SelectTrigger id="unit_of_measure_id">
                                <SelectValue placeholder="Select a unit of measure" />
                            </SelectTrigger>
                            <SelectContent>
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
                        {errors.unit_of_measure_id && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.unit_of_measure_id}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="reorder_level">Reorder Level</Label>
                        <Input
                            id="reorder_level"
                            type="number"
                            value={data.reorder_level}
                            onChange={(e) =>
                                setData('reorder_level', e.target.value)
                            }
                            required
                        />
                        {errors.reorder_level && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.reorder_level}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={data.status}
                            onValueChange={(value) => setData('status', value)}
                        >
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="deactive">Deactive</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.status && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.status}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Updating...' : 'Update Product'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}