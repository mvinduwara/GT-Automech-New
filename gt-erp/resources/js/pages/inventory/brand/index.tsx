import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Brand } from '@/types/types';
import { Head, router, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Define the form data interface
interface BrandFormData {
    name: string;
    description: string;
    status: 'active' | 'deactive';
}

// Define the paginated data structure from Laravel's paginate method
interface PaginatedData<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory',
        href: '/dashboard/inventory',
    },
    {
        title: 'Brand',
        href: '/dashboard/brand',
    },
];

export default function BrandIndex() {
    // Get brands, flash messages, errors, and filters from Inertia props
    const {
        brands,
        flash,
        errors: inertiaErrors,
        filters,
    } = usePage<{
        brands: PaginatedData<Brand>;
        flash: { success?: string; error?: string };
        errors: { [key: string]: string };
        filters: { search?: string; status?: string };
    }>().props;

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [formData, setFormData] = useState<BrandFormData>({
        name: '',
        description: '',
        status: 'active',
    });
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    // Flash messages
    useEffect(() => {
        if (flash.success) toast('Success!', { description: flash.success });
        if (flash.error) toast('Error!', { description: flash.error });
    }, [flash]);

    // Validation errors
    useEffect(() => {
        if (Object.keys(inertiaErrors).length > 0 && isDialogOpen) {
            setFormErrors(inertiaErrors);
            toast('Validation Error', {
                description: 'Please correct the highlighted fields.',
            });
        }
    }, [inertiaErrors, isDialogOpen]);

    // Effect to populate form when editingBrand changes
    useEffect(() => {
        if (editingBrand) {
            setFormData({
                name: editingBrand.name,
                description: editingBrand.description,
                status: editingBrand.status,
            });
        } else {
            setFormData({
                name: '',
                description: '',
                status: 'active',
            });
        }
        setFormErrors({}); // Clear errors when dialog opens/closes
    }, [editingBrand]);

    // Handle input changes for form fields
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
        // Clear error for the changed field
        if (formErrors[id]) {
            setFormErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[id];
                return newErrors;
            });
        }
    };

    // Handle select input change for status
    const handleSelectChange = (value: 'active' | 'deactive') => {
        setFormData((prev) => ({ ...prev, status: value }));
        if (formErrors.status) {
            setFormErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.status;
                return newErrors;
            });
        }
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Client-side validation (basic)
        const errors: { [key: string]: string } = {};
        if (!formData.name.trim()) errors.name = 'Name is required.';
        if (!formData.status) errors.status = 'Status is required.';

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            toast('Validation Error', {
                description: 'Please correct the highlighted fields.',
            });
            return;
        }

        if (editingBrand) {
            // Update existing brand
            router.post(route('dashboard.brand.update', editingBrand.id), formData, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    setEditingBrand(null);
                    // Toast message handled by useEffect for flash.success
                },
                onError: (errors) => {
                    setFormErrors(errors);
                    toast('Update Failed', {
                        description: 'There was an error updating the brand. Please check your input.',
                    });
                },
            });
        } else {
            // Create new brand
            router.post(route('dashboard.brand.store'), formData, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    // Toast message handled by useEffect for flash.success
                },
                onError: (errors) => {
                    setFormErrors(errors);
                    toast('Creation Failed', {
                        description: 'There was an error creating the brand. Please check your input.',
                    });
                },
            });
        }
    };

    // Open dialog for creating a new brand
    const openCreateDialog = () => {
        setEditingBrand(null);
        setIsDialogOpen(true);
    };

    // Open dialog for editing an existing brand
    const openEditDialog = (brand: Brand) => {
        setEditingBrand(brand);
        setIsDialogOpen(true);
    };

    // Close dialog and reset state
    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingBrand(null);
        setFormData({ name: '', description: '', status: 'active' });
        setFormErrors({});
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Brand" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Brands</h1>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={openCreateDialog}>Add New Brand</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>{editingBrand ? 'Edit Brand' : 'Create Brand'}</DialogTitle>
                                <DialogDescription>
                                    {editingBrand
                                        ? "Make changes to your brand here. Click save when you're done."
                                        : 'Fill in the details for the new brand.'}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        Name
                                    </Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className={`col-span-3 ${formErrors.name ? 'border-red-500' : ''}`}
                                    />
                                    {formErrors.name && <p className="col-span-4 text-right text-sm text-red-500">{formErrors.name}</p>}
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="description" className="text-right">
                                        Description
                                    </Label>
                                    <Textarea id="description" value={formData.description} onChange={handleInputChange} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="status" className="text-right">
                                        Status
                                    </Label>
                                    <Select onValueChange={handleSelectChange} value={formData.status}>
                                        <SelectTrigger className={`col-span-3 ${formErrors.status ? 'border-red-500' : ''}`}>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="deactive">Deactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {formErrors.status && <p className="col-span-4 text-right text-sm text-red-500">{formErrors.status}</p>}
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={closeDialog}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">{editingBrand ? 'Save Changes' : 'Create Brand'}</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Filter Section */}
                <div className="rounded-md border bg-white p-4">
                    <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-4">
                        <div>
                            <Label htmlFor="search" className="mb-2 block text-sm font-medium">
                                Search (Name, Description)
                            </Label>
                            <Input
                                id="search"
                                type="text"
                                placeholder="Search by name or description"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full"
                            />
                        </div>

                        <div>
                            <Label htmlFor="status-filter" className="mb-2 block text-sm font-medium">
                                Status
                            </Label>
                            <Select value={statusFilter || 'all'} onValueChange={(val) => setStatusFilter(val === 'all' ? '' : val)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select A Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="deactive">Deactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-end space-x-2 md:col-span-2">
                            <Button
                                variant="default"
                                onClick={() => {
                                    router.get(
                                        route('dashboard.brand.index'),
                                        { search: searchTerm, status: statusFilter },
                                        { preserveState: true, replace: true },
                                    );
                                }}
                                className="bg-blue-600 px-6 text-white hover:bg-blue-700"
                            >
                                Apply Filters
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('');
                                    router.get(route('dashboard.brand.index'), {}, { preserveState: true, replace: true });
                                }}
                                className="px-6"
                            >
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {brands.data && brands.data.length > 0 ? (
                                brands.data.map((brand) => (
                                    <TableRow key={brand.id}>
                                        <TableCell className="font-medium">{brand.name}</TableCell>
                                        <TableCell>{brand.description || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Badge variant={brand.status === 'active' ? 'default' : 'destructive'}>
                                                {brand.status.charAt(0).toUpperCase() + brand.status.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(brand.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => openEditDialog(brand)}>
                                                Edit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No brands found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between space-x-2 py-4">
                    <div className="text-sm text-muted-foreground">
                        Showing {brands.from} to {brands.to} of {brands.total} entries
                    </div>
                    <div className="flex items-center space-x-2">
                        {brands.links.map((link, index) => (
                            <Button
                                key={index}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true, preserveState: true })}
                                disabled={!link.url}
                                // dangerouslySetInnerHTML is used here because Laravel's pagination links can include HTML entities like &laquo;
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
