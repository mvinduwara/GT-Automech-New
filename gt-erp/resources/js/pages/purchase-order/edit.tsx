import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search, PlusCircle, Trash2, Save } from 'lucide-react';
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
    category: Category;
    brand: Brand;
    total_stock: number;
}

interface Stock {
    id: number;
    product: Product;
    quantity: number;
}

interface PurchaseOrderItem {
    id?: number; // Optional since new items won't have an ID
    stock_id: number;
    stock: Stock;
    name: string;
    part_number: string;
    quantity: number;
}

interface PurchaseOrder {
    id: number;
    name: string;
    date: string;
    status: string;
}

interface Props {
    purchaseOrder: PurchaseOrder;
    purchaseOrderItems: PurchaseOrderItem[];
    stocks: Stock[];
    categories: Category[];
    brands: Brand[];
}

export default function Edit({ purchaseOrder, purchaseOrderItems, stocks, categories, brands }: Props) {
    const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [quantityToAdd, setQuantityToAdd] = useState(1);
    const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

    const { data, setData, put, processing, errors } = useForm({
        name: purchaseOrder.name,
        date: purchaseOrder.date,
        items: purchaseOrderItems.map(item => ({
            stock_id: item.stock_id,
            name: item.stock.product.name,
            part_number: item.stock.product.part_number,
            quantity: item.quantity,
        })),
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Purchase Order',
            href: '/dashboard/purchase-order',
        },
        {
            title: `Edit ${purchaseOrder.name}`,
            href: '',
        },
    ];

    // Update filtered stocks whenever the original stocks, search query, category, or brand changes.
    useEffect(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        const filtered = stocks.filter((stock) => {
            const matchesSearch = stock.product.part_number.toLowerCase().includes(lowercasedQuery);
            const matchesCategory = selectedCategory && selectedCategory !== 'all' ? stock.product.category.id === parseInt(selectedCategory) : true;
            const matchesBrand = selectedBrand && selectedBrand !== 'all' ? stock.product.brand.id === parseInt(selectedBrand) : true;
            return matchesSearch && matchesCategory && matchesBrand;
        });
        setFilteredStocks(filtered);
    }, [stocks, searchQuery, selectedCategory, selectedBrand]);

    useEffect(() => {
        if (errors.items) {
            toast.error(errors.items);
        }
    }, [errors]);

    // Handle opening the modal for a specific product
    const handleAddProductClick = (stock: Stock) => {
        setSelectedStock(stock);
        setQuantityToAdd(1); // Reset quantity each time
        setIsModalOpen(true);
    };

    const handleConfirmAdd = () => {
        if (selectedStock) {
            // Check if the item is already in the list
            const existingItemIndex = data.items.findIndex(
                (item) => item.stock_id === selectedStock.id
            );

            if (existingItemIndex !== -1) {
                // If it exists, update the quantity
                setData((prevData) => {
                    const newItems = [...prevData.items];
                    newItems[existingItemIndex].quantity += quantityToAdd;
                    return { ...prevData, items: newItems };
                });
                toast.success('Quantity updated successfully!');
            } else {
                // Otherwise, add a new item
                setData((prevData) => ({
                    ...prevData,
                    items: [
                        ...prevData.items,
                        {
                            stock_id: selectedStock.id,
                            name: selectedStock.product.name,
                            part_number: selectedStock.product.part_number,
                            quantity: quantityToAdd,
                        },
                    ],
                }));
                toast.success('Product added to purchase order!');
            }
            setIsModalOpen(false);
            setSelectedStock(null);
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
        put(route('dashboard.purchase-order.update', purchaseOrder.id), {
            onSuccess: () => {
                toast.success('Purchase order updated successfully!');
            },
            onError: (errors) => {
                if (errors.date) toast.error(errors.date);
                if (errors.items) toast.error(errors.items);
                console.error(errors);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Purchase Order ${purchaseOrder.name}`} />
            <Toaster position="bottom-right" richColors />
            <div className="mx-auto p-4 sm:p-6 lg:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Purchase Order</CardTitle>
                            <CardDescription>Update the details for purchase order `<strong>{purchaseOrder.name}</strong>`.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Purchase Order Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        className="text-gray-700"
                                        disabled
                                    />
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
                            </div>
                        </CardContent>
                    </Card>

                    {/* Products & Filters Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Products</CardTitle>
                            <CardDescription>Select products to add or remove from the purchase order.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
                                <Input
                                    type="text"
                                    placeholder="Search by Part Number..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1"
                                />
                                <Select onValueChange={setSelectedCategory} value={selectedCategory || ''}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by Category" />
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
                                <Select onValueChange={setSelectedBrand} value={selectedBrand || ''}>
                                    <SelectTrigger className="w-[180px]">
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
                            </div>
                            <div className="max-h-96 overflow-y-auto border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Part No.</TableHead>
                                            <TableHead>Product Name</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Brand</TableHead>
                                            <TableHead className="text-right">Stock</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredStocks.length > 0 ? (
                                            filteredStocks.map((stock) => (
                                                <TableRow key={stock.id}>
                                                    <TableCell className="font-medium">{stock.product.part_number}</TableCell>
                                                    <TableCell>{stock.product.name}</TableCell>
                                                    <TableCell>{stock.product.category.name}</TableCell>
                                                    <TableCell>{stock.product.brand.name}</TableCell>
                                                    <TableCell className="text-right">{stock.quantity}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            type="button" // This is the fix.
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleAddProductClick(stock)}
                                                        >
                                                            <PlusCircle className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center">No products found.</TableCell>
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
                            <Table>
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
                                            <TableRow key={item.stock_id}>
                                                <TableCell>{item.part_number}</TableCell>
                                                <TableCell>{item.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{item.quantity}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        type="button" // This button should also be of type="button"
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
                                <span>Save Changes</span>
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
                                Enter the quantity for `<strong>{selectedStock?.product.name}</strong>`
                                (Available: {selectedStock?.quantity}).
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
