// Add these imports at the top
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Download, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';

export function FilteredStockReportDialog() {
    const [categoryId, setCategoryId] = useState<string>('all');
    const [brandId, setBrandId] = useState<string>('all');
    const [productIds, setProductIds] = useState<string[]>([]);

    const [categories, setCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fetch initial filter options when dialog opens
    useEffect(() => {
        if (open && categories.length === 0) {
            fetchFilterOptions();
        }
    }, [open]);

    // Filter products based on selected category and brand
    useEffect(() => {
        let filtered = [...products];

        if (categoryId && categoryId !== 'all') {
            filtered = filtered.filter(p => p.category_id === parseInt(categoryId));
        }

        if (brandId && brandId !== 'all') {
            filtered = filtered.filter(p => p.brand_id === parseInt(brandId));
        }

        setFilteredProducts(filtered);

        // Clear product selection if filtered products don't include selected ones
        setProductIds(prev => prev.filter(id =>
            filtered.some(p => p.id.toString() === id)
        ));
    }, [categoryId, brandId, products]);

    const fetchFilterOptions = async () => {
        setLoading(true);
        try {
            const response = await fetch(route('dashboard.reports.stock.filters'));
            const data = await response.json();
            setCategories(data.categories);
            setBrands(data.brands);
            setProducts(data.products);
            setFilteredProducts(data.products);
        } catch (error) {
            console.error('Failed to fetch filters:', error);
            alert('Failed to load filter options');
        } finally {
            setLoading(false);
        }
    };

    const handleProductToggle = (productId: string) => {
        setProductIds(prev => {
            if (prev.includes(productId)) {
                return prev.filter(id => id !== productId);
            } else {
                return [...prev, productId];
            }
        });
    };

    const handleSelectAll = () => {
        // If "All" is selected for both category and brand, select all products
        const shouldSelectAll = categoryId === 'all' && brandId === 'all';
        const productsToSelect = shouldSelectAll ? products : filteredProducts;

        if (productIds.length === productsToSelect.length) {
            setProductIds([]);
        } else {
            setProductIds(productsToSelect.map(p => p.id.toString()));
        }
    };

    const handleDownload = () => {
        // Check if at least one filter is selected
        const hasFilter = (categoryId !== 'all') || (brandId !== 'all') || productIds.length > 0;

        if (!hasFilter) {
            alert('Please select at least one filter: Category, Brand, or Product(s)');
            return;
        }

        const params = new URLSearchParams();

        // Only append if not 'all'
        if (categoryId && categoryId !== 'all') {
            params.append('category_id', categoryId);
        }
        if (brandId && brandId !== 'all') {
            params.append('brand_id', brandId);
        }
        productIds.forEach(id => params.append('product_ids[]', id));

        window.location.href = route('dashboard.reports.stock.filtered.download') + '?' + params.toString();

        // Reset and close
        handleReset();
        setOpen(false);
    };

    const handleReset = () => {
        setCategoryId('all');
        setBrandId('all');
        setProductIds([]);
    };

    const handleClearFilters = () => {
        setCategoryId('all');
        setBrandId('all');
        setProductIds([]);
    };

    // Check if at least one filter is selected
    const canDownload = (categoryId !== 'all') || (brandId !== 'all') || productIds.length > 0;
    const hasAnySelection = canDownload;

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="outline">
                    <FileText className="h-4 w-4" /> Generate Report
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <AlertDialogHeader>
                    <AlertDialogTitle>Generate Filtered Stock Report</AlertDialogTitle>
                    <AlertDialogDescription>
                        Select at least one filter: Category, Brand, or specific Product(s).
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {loading ? (
                    <div className="py-8 text-center">Loading filters...</div>
                ) : (
                    <div className="space-y-4 py-4">
                        {/* Clear Filters Button */}
                        {hasAnySelection && (
                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearFilters}
                                >
                                    Clear All Filters
                                </Button>
                            </div>
                        )}

                        {/* Category Filter */}
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select value={categoryId} onValueChange={setCategoryId}>
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Brand Filter */}
                        <div className="space-y-2">
                            <Label htmlFor="brand">Brand</Label>
                            <Select value={brandId} onValueChange={setBrandId}>
                                <SelectTrigger id="brand">
                                    <SelectValue placeholder="Select Brand" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Brands</SelectItem>
                                    {brands.map((brand) => (
                                        <SelectItem key={brand.id} value={brand.id.toString()}>
                                            {brand.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Product Selection */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Products (Optional)</Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleSelectAll}
                                    disabled={filteredProducts.length === 0}
                                >
                                    {productIds.length === (categoryId === 'all' && brandId === 'all' ? products : filteredProducts).length &&
                                        (categoryId === 'all' && brandId === 'all' ? products : filteredProducts).length > 0
                                        ? 'Deselect All'
                                        : 'Select All'}
                                </Button>
                            </div>

                            <div className="border rounded-md max-h-60 overflow-y-auto">
                                {filteredProducts.length === 0 ? (
                                    <div className="p-4 text-center text-muted-foreground">
                                        No products found for selected filters
                                    </div>
                                ) : (
                                    <div className="p-2 space-y-1">
                                        {filteredProducts.map((product) => (
                                            <label
                                                key={product.id}
                                                className="flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={productIds.includes(product.id.toString())}
                                                    onChange={() => handleProductToggle(product.id.toString())}
                                                    className="!h-4 !w-4"
                                                />
                                                <span className="text-sm flex-1">
                                                    <span className="font-medium">{product.part_number}</span>
                                                    {' - '}
                                                    {product.name}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {productIds.length > 0 && (
                                <p className="text-sm text-muted-foreground">
                                    {productIds.length} product{productIds.length !== 1 ? 's' : ''} selected
                                </p>
                            )}
                        </div>

                        {/* Selection Summary */}
                        <div className="bg-muted p-3 rounded-md text-sm">
                            <p className="font-medium mb-1">Current Selection:</p>
                            <ul className="space-y-1 text-muted-foreground">
                                {categoryId !== 'all' && <li>✓ Category: {categories.find(c => c.id.toString() === categoryId)?.name}</li>}
                                {brandId !== 'all' && <li>✓ Brand: {brands.find(b => b.id.toString() === brandId)?.name}</li>}
                                {productIds.length > 0 && <li>✓ {productIds.length} specific product(s)</li>}
                                {!canDownload && <li className="text-amber-600">⚠ Select at least one filter</li>}
                            </ul>
                        </div>
                    </div>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel onClick={handleReset}>Cancel</AlertDialogCancel>
                    <Button
                        onClick={handleDownload}
                        disabled={!canDownload || loading}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
