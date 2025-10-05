import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { Trash2, Plus, Search } from "lucide-react";
import axios from "axios";

type Product = {
    id: number;
    part_number: string;
    name: string;
};

type Stock = {
    id: number;
    quantity: number;
    selling_price: number;
    product: Product;
};

type ExistingProduct = {
    id: number;
    stock_id: number;
    quantity: number;
    unit_price: number;
    subtotal: number;
    discount_type: 'percentage' | 'amount' | null;
    discount_value: number;
    total: number;
    stock: {
        id: number;
        product: Product;
    };
};

type ProductFormData = {
    stock_id: number | null;
    quantity: number;
    discount_type: 'percentage' | 'amount' | null;
    discount_value: number;
    available_stock?: number;
    unit_price?: number;
    product_name?: string;
};

type JobCardProductsFormProps = {
    jobCardId: number;
    existingProducts: ExistingProduct[];
};

function JobCardProductsForm({
    jobCardId,
    existingProducts
}: JobCardProductsFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [products, setProducts] = useState<ProductFormData[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Stock[]>([]);
    const [searching, setSearching] = useState(false);
    const [activeProductIndex, setActiveProductIndex] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadExistingProducts();
        }
    }, [isOpen]);

    const loadExistingProducts = () => {
        if (existingProducts && existingProducts.length > 0) {
            const mappedProducts = existingProducts.map(product => ({
                stock_id: product.stock_id,
                quantity: product.quantity,
                discount_type: product.discount_type,
                discount_value: product.discount_value,
                unit_price: product.unit_price,
                product_name: product.stock.product.name,
            }));
            setProducts(mappedProducts);
        } else {
            setProducts([getEmptyProduct()]);
        }
    };

    const getEmptyProduct = (): ProductFormData => ({
        stock_id: null,
        quantity: 1,
        discount_type: null,
        discount_value: 0,
    });

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;

        setSearching(true);
        try {
            const response = await axios.get(
                route('dashboard.job-card.products.search'),
                { params: { search: searchTerm } }
            );
            setSearchResults(response.data.stocks || []);
        } catch (error) {
            console.error('Search failed:', error);
            alert('Failed to search products');
        } finally {
            setSearching(false);
        }
    };

    const selectProduct = (stock: Stock, index: number) => {
        const newProducts = [...products];
        newProducts[index] = {
            ...newProducts[index],
            stock_id: stock.id,
            available_stock: stock.quantity,
            unit_price: parseFloat(stock.selling_price.toString()),
            product_name: stock.product.name,
        };
        setProducts(newProducts);
        setSearchResults([]);
        setSearchTerm('');
        setActiveProductIndex(null);
    };

    const addProduct = () => {
        setProducts([...products, getEmptyProduct()]);
    };

    const removeProduct = (index: number) => {
        const newProducts = products.filter((_, i) => i !== index);
        setProducts(newProducts.length > 0 ? newProducts : [getEmptyProduct()]);
    };

    const updateProduct = (index: number, field: keyof ProductFormData, value: any) => {
        const newProducts = [...products];
        newProducts[index] = { ...newProducts[index], [field]: value };
        setProducts(newProducts);
    };

    const calculateProductTotal = (product: ProductFormData): number => {
        if (!product.stock_id || !product.unit_price) return 0;

        const subtotal = product.quantity * product.unit_price;

        if (!product.discount_type || product.discount_value === 0) {
            return subtotal;
        }

        if (product.discount_type === 'percentage') {
            return Math.round((subtotal - (subtotal * product.discount_value / 100)) * 100) / 100;
        }

        return Math.max(0, subtotal - product.discount_value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validProducts = products.filter(p => p.stock_id);

        if (validProducts.length === 0) {
            alert('Please add at least one product');
            return;
        }

        // Validate quantities
        for (const product of validProducts) {
            if (product.available_stock && product.quantity > product.available_stock) {
                alert(`Quantity for ${product.product_name} exceeds available stock (${product.available_stock})`);
                return;
            }
        }

        setLoading(true);

        router.post(
            route('dashboard.job-card.products.store', jobCardId),
            { products: validProducts },
            {
                onSuccess: () => {
                    setIsOpen(false);
                    setProducts([getEmptyProduct()]);
                },
                onError: (errors) => {
                    console.error('Failed to save products:', errors);
                    alert('Failed to save products. Please check the form and try again.');
                },
                onFinish: () => {
                    setLoading(false);
                }
            }
        );
    };

    const handleCancel = () => {
        setProducts([getEmptyProduct()]);
        setSearchResults([]);
        setSearchTerm('');
        setIsOpen(false);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            loadExistingProducts();
        } else {
            setSearchResults([]);
            setSearchTerm('');
        }
    };

    const getTotalAmount = (): number => {
        return products
            .filter(p => p.stock_id)
            .reduce((sum, product) => sum + calculateProductTotal(product), 0);
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>
                <Button variant="outline">
                    Manage Products
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Job Card Products</AlertDialogTitle>
                        <AlertDialogDescription>
                            Add or modify products for Job Card #{jobCardId}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="py-4 space-y-4">
                        {products.map((product, index) => (
                            <div key={index} className="border rounded-lg p-4 space-y-3">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-medium">Product {index + 1}</h4>
                                    {products.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => removeProduct(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                {/* Product Search */}
                                {!product.stock_id ? (
                                    <div className="space-y-2">
                                        <Label>Search Product</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="text"
                                                placeholder="Enter part number or name"
                                                value={activeProductIndex === index ? searchTerm : ''}
                                                onChange={(e) => {
                                                    setSearchTerm(e.target.value);
                                                    setActiveProductIndex(index);
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleSearch();
                                                    }
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                onClick={handleSearch}
                                                disabled={searching || !searchTerm.trim()}
                                            >
                                                <Search className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {/* Search Results */}
                                        {activeProductIndex === index && searchResults.length > 0 && (
                                            <div className="border rounded-md max-h-48 overflow-y-auto">
                                                {searchResults.map((stock) => (
                                                    <button
                                                        key={stock.id}
                                                        type="button"
                                                        onClick={() => selectProduct(stock, index)}
                                                        className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b last:border-b-0"
                                                    >
                                                        <div className="font-medium">{stock.product.name}</div>
                                                        <div className="text-sm text-gray-600">
                                                            Part#: {stock.product.part_number} | Stock: {stock.quantity} |
                                                            Price: Rs. {parseFloat(stock.selling_price.toString()).toLocaleString()}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-blue-50 p-3 rounded-md">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium">{product.product_name}</p>
                                                <p className="text-sm text-gray-600">
                                                    Available: {product.available_stock} | Unit Price: Rs. {product.unit_price?.toLocaleString()}
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    const newProducts = [...products];
                                                    newProducts[index] = getEmptyProduct();
                                                    setProducts(newProducts);
                                                }}
                                            >
                                                Change
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {product.stock_id && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Quantity</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                max={product.available_stock}
                                                value={product.quantity}
                                                onChange={(e) =>
                                                    updateProduct(index, 'quantity', parseInt(e.target.value) || 1)
                                                }
                                                placeholder="Enter quantity"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Discount Type</Label>
                                            <Select
                                                value={product.discount_type || 'none'}
                                                onValueChange={(value) =>
                                                    updateProduct(
                                                        index,
                                                        'discount_type',
                                                        value === 'none' ? null : value
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="No discount" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">No Discount</SelectItem>
                                                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                                                    <SelectItem value="amount">Amount (Rs.)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Discount Value</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={product.discount_value}
                                                onChange={(e) =>
                                                    updateProduct(index, 'discount_value', parseFloat(e.target.value) || 0)}
                                                disabled={!product.discount_type}
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div className="col-span-2 space-y-2">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600">
                                                    Subtotal: Rs. {(product.quantity * (product.unit_price || 0)).toLocaleString()}
                                                </span>
                                                <span className="font-semibold">
                                                    Total: Rs. {calculateProductTotal(product).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        <Button
                            type="button"
                            variant="outline"
                            onClick={addProduct}
                            className="w-full"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Another Product
                        </Button>

                        <div className="flex justify-between items-center pt-4 border-t-2">
                            <span className="text-lg font-semibold">Grand Total:</span>
                            <span className="text-lg font-bold">
                                Rs. {getTotalAmount().toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            type="button"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Products'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default JobCardProductsForm;