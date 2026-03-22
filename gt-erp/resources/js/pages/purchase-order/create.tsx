import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search, PlusCircle, Trash2, X, Save, Edit, Check, ChevronsUpDown } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Toaster, toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

// Define the types for the data passed from the backend
interface Brand {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    part_number: string;
    category?: Category;
    brand?: Brand;
}

interface Supplier {
    id: number;
    name: string;
    mobile: string;
    email: string;
}

interface PurchaseOrderItem {
    product_id: number;
    name: string;
    part_number: string;
    quantity: number;
}

interface Props {
    categories: Category[];
    brands: Brand[];
    generatedPoNumber: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Purchase Order',
        href: '/dashboard/purchase-order',
    },
    {
        title: 'Purchase Order Create',
        href: '/dashboard/purchase-order/create',
    },
];

export default function Create({ categories, brands, generatedPoNumber }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>('all');
    const [selectedBrand, setSelectedBrand] = useState<string | null>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [quantityToAdd, setQuantityToAdd] = useState(1);

    // Product Search State
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isSearchingProducts, setIsSearchingProducts] = useState(false);

    // Supplier Search State
    const [openSupplier, setOpenSupplier] = useState(false);
    const [supplierQuery, setSupplierQuery] = useState('');
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

    interface Form {
        name: string;
        date: string;
        supplier_id: number | null;
        notes: string;
        items: PurchaseOrderItem[];
        [key: string]: any;
    }

    const { data, setData, post, processing, errors, reset } = useForm<Form>({
        name: generatedPoNumber || '',
        date: new Date().toLocaleDateString('sv-SE'),
        supplier_id: null,
        notes: '',
        items: [],
    });

    useEffect(() => {
        if (generatedPoNumber && data.name !== generatedPoNumber) {
            setData('name', generatedPoNumber);
        }
    }, [generatedPoNumber]);

    // Product Search Effect
    useEffect(() => {
        const fetchProducts = async () => {
            setIsSearchingProducts(true);
            try {
                const params = new URLSearchParams();
                if (searchQuery) params.append('q', searchQuery);
                if (selectedCategory && selectedCategory !== 'all') params.append('category_id', selectedCategory);
                if (selectedBrand && selectedBrand !== 'all') params.append('brand_id', selectedBrand);

                const url = route('dashboard.purchase-order.products.search') + `?${params.toString()}`;

                const response = await fetch(url);

                if (!response.ok) {
                    const text = await response.text();
                    console.error('Product search failed:', text);
                    throw new Error(`Search failed: ${response.status}`);
                }

                const data = await response.json();
                setSearchResults(data);
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setIsSearchingProducts(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchProducts();
        }, 300); // Debounce

        return () => clearTimeout(timeoutId);
    }, [searchQuery, selectedCategory, selectedBrand]);

    // Supplier Search Effect
    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const url = route('dashboard.purchase-order.suppliers.search') + `?q=${supplierQuery}`;

                const response = await fetch(url);

                if (!response.ok) {
                    const text = await response.text();
                    console.error('Supplier search failed:', text);
                    throw new Error(`Search failed: ${response.status}`);
                }

                const data = await response.json();
                setSuppliers(data);
            } catch (error) {
                console.error("Failed to fetch suppliers", error);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchSuppliers();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [supplierQuery]);


    const handleAddProductClick = (product: Product) => {
        setSelectedProduct(product);
        setQuantityToAdd(1);
        setIsModalOpen(true);
    };

    const handleConfirmAdd = () => {
        if (selectedProduct) {
            // Check if item exists
            const existingItemIndex = data.items.findIndex(
                (item) => item.product_id === selectedProduct.id
            );

            if (existingItemIndex !== -1) {
                setData((prevData) => {
                    const newItems = [...prevData.items];
                    newItems[existingItemIndex].quantity += quantityToAdd;
                    return { ...prevData, items: newItems };
                });
                toast.success('Quantity updated successfully!');
            } else {
                setData((prevData) => ({
                    ...prevData,
                    items: [
                        ...prevData.items,
                        {
                            product_id: selectedProduct.id,
                            name: selectedProduct.name,
                            part_number: selectedProduct.part_number,
                            quantity: quantityToAdd,
                        },
                    ],
                }));
                toast.success('Product added to purchase order!');
            }
            setIsModalOpen(false);
            setSelectedProduct(null);
        }
    };

    const handleRemoveItem = (index: number) => {
        setData('items', data.items.filter((_, i) => i !== index));
        toast.info('Item removed from the list.');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.items.length === 0) {
            toast.error('Please add at least one item to the purchase order.');
            return;
        }
        if (!data.supplier_id) {
            toast.error('Please select a supplier.');
            return;
        }

        post(route('dashboard.purchase-order.store'), {
            onSuccess: () => {
                toast.success('Purchase order created successfully!');
                reset();
                setSelectedSupplier(null);
            },
            onError: (errors) => {
                Object.values(errors).forEach(e => toast.error(e));
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Purchase Order" />
            <Toaster position="bottom-right" richColors />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create New Purchase Order</CardTitle>
                            <CardDescription>Fill in the details to create a new purchase order.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Purchase Order Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="text-gray-700"
                                        required
                                    />
                                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="date">Date</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={data.date}
                                        onChange={(e) => setData('date', e.target.value)}
                                        className="text-gray-700"
                                        required
                                    />
                                    {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
                                </div>
                                <div className="space-y-2 flex flex-col">
                                    <Label>Supplier</Label>
                                    <Popover open={openSupplier} onOpenChange={setOpenSupplier}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openSupplier}
                                                className="w-full justify-between"
                                            >
                                                {selectedSupplier ? selectedSupplier.name : "Select supplier..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[400px] p-0">
                                            <Command shouldFilter={false}>
                                                <CommandInput
                                                    placeholder="Search supplier..."
                                                    onValueChange={setSupplierQuery}
                                                />
                                                <CommandList>
                                                    <CommandEmpty>No supplier found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {suppliers.map((supplier) => (
                                                            <CommandItem
                                                                key={supplier.id}
                                                                value={String(supplier.id)}
                                                                onSelect={() => {
                                                                    setSelectedSupplier(supplier);
                                                                    setData('supplier_id', supplier.id);
                                                                    setOpenSupplier(false);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        selectedSupplier?.id === supplier.id ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                <div className="flex flex-col">
                                                                    <span>{supplier.name}</span>
                                                                    <span className="text-xs text-muted-foreground">{supplier.mobile} - {supplier.email}</span>
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    {errors.supplier_id && <p className="text-red-500 text-sm">{errors.supplier_id}</p>}
                                </div>
                                <div className="space-y-2">
                                    {/* Placeholder to align grid if needed, or just notes full width below */}
                                </div>
                            </div>
                            <div className="mt-4 space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Add any additional notes here..."
                                />
                                {errors.notes && <p className="text-red-500 text-sm">{errors.notes}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Products & Filters Section */}
                    <Card >
                        <CardHeader>
                            <CardTitle>Products</CardTitle>
                            <CardDescription>Search and select products to add to the purchase order.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col overflow-y-auto overflow-x-auto sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
                                <Input
                                    type="text"
                                    placeholder="Search by Part Number or Name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1"
                                />
                                <Select onValueChange={setSelectedCategory} value={selectedCategory || 'all'}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={String(category.id)}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select onValueChange={setSelectedBrand} value={selectedBrand || 'all'}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Brand" />
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
                            </div>

                            <div className="max-h-96 overflow-y-auto overflow-x-auto border rounded-md">
                                <Table className="[&_*]:max-w-[200px] [&_*]:truncate [&_*]:overflow-hidden [&_*]:whitespace-nowrap">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Part No.</TableHead>
                                            <TableHead>Product Name</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {searchResults.length > 0 ? (
                                            searchResults.map((product) => (
                                                <TableRow key={product.id}>
                                                    <TableCell
                                                        className="font-medium whitespace-nowrap max-w-[300px] truncate overflow-hidden"
                                                        title={product.part_number}
                                                    >
                                                        {product.part_number}
                                                    </TableCell>

                                                    <TableCell
                                                        className="whitespace-nowrap max-w-[300px] truncate overflow-hidden"
                                                        title={product.name}
                                                    >
                                                        {product.name}
                                                    </TableCell>

                                                    <TableCell className="text-right">
                                                        <Button
                                                            type='button'
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleAddProductClick(product)}
                                                        >
                                                            <PlusCircle className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center">{isSearchingProducts ? 'Searching...' : 'No products found.'}</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Purchase Order Items Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Purchase Order Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table className="[&_*]:max-w-[200px] [&_*]:truncate [&_*]:overflow-hidden [&_*]:whitespace-nowrap">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Part No.</TableHead>
                                        <TableHead>Product Name</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.items.length > 0 ? (
                                        data.items.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{item.part_number}</TableCell>
                                                <TableCell>{item.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{item.quantity}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemoveItem(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center">No items added yet.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                        <CardFooter className="justify-end">
                            <Button type="submit" disabled={processing} className="flex items-center space-x-2">
                                <Save className="h-4 w-4" />
                                <span>Save Purchase Order</span>
                            </Button>
                        </CardFooter>
                    </Card>
                </form>

                {/* Add Quantity Dialog */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Quantity</DialogTitle>
                            <p className="text-sm text-gray-500">
                                Enter the quantity for `<strong>{selectedProduct?.name}</strong>`
                            </p>
                        </DialogHeader>
                        <div className="py-4">
                            <Input
                                id="quantity"
                                type="number"
                                min="1"
                                value={quantityToAdd}
                                onChange={(e) => setQuantityToAdd(Number(e.target.value))}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="button" onClick={handleConfirmAdd}>
                                Add Item
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
