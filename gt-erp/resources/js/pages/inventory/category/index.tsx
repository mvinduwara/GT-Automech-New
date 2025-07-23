import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Category } from '@/types/types';

// Define the form data interface
interface CategoryFormData {
    name: string;
    description: string;
    status: 'active' | 'inactive';
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
        title: 'Category',
        href: '/dashboard/category',
    },
];

export default function CategoryIndex() {
    // Get categories, flash messages, and filters from Inertia props
    const { categories, flash, errors: inertiaErrors, filters } = usePage<{
        categories: PaginatedData<Category>,
        flash: { success?: string, error?: string },
        errors: { [key: string]: string }, // Inertia errors for validation
        filters: { search?: string }
    }>().props;

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState<CategoryFormData>({
        name: '',
        description: '',
        status: 'active',
    });
    // Use a separate state for form errors displayed on the client side,
    // and merge with Inertia errors when the dialog is open.
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    // Effect to show toasts for flash messages
    useEffect(() => {
        // Ensure flash.success is a string before passing to toast
        if (typeof flash.success === 'string' && flash.success) {
            toast('Success!', {
                description: flash.success,
            });
        } else if (flash.success) {
            // Log if flash.success is not a string, indicating unexpected data
            console.warn('Unexpected flash.success type:', flash.success);
            toast('Success (Unexpected Format)!', {
                description: 'An operation completed successfully.',
            });
        }

        // Ensure flash.error is a string before passing to toast
        if (typeof flash.error === 'string' && flash.error) {
            toast('Error!', {
                description: flash.error,
            });
        } else if (flash.error) {
            // Log if flash.error is not a string, indicating unexpected data
            console.warn('Unexpected flash.error type:', flash.error);
            toast('Error (Unexpected Format)!', {
                description: 'An error occurred.',
            });
        }
    }, [flash, toast]);

    // Effect to handle Inertia validation errors when the dialog is open
    useEffect(() => {
        if (Object.keys(inertiaErrors).length > 0 && isDialogOpen) {
            setFormErrors(inertiaErrors);
            toast('Validation Error', {
                description: 'Please correct the highlighted fields.',
            });
        }
    }, [inertiaErrors, isDialogOpen, toast]);


    // Debounce search input to avoid excessive requests
    useEffect(() => {
        const handler = setTimeout(() => {
            router.get(route('dashboard.category.index'), { search: searchTerm }, {
                preserveState: true, // Keep form state
                replace: true,       // Replace current history entry
            });
        }, 300); // 300ms debounce delay

        return () => {
            clearTimeout(handler); // Clear timeout if searchTerm changes before delay
        };
    }, [searchTerm]);

    // Effect to populate form when editingCategory changes or dialog opens/closes
    useEffect(() => {
        if (editingCategory) {
            setFormData({
                name: editingCategory.name,
                description: editingCategory.description,
                status: editingCategory.status,
            });
        } else {
            setFormData({
                name: '',
                description: '',
                status: 'active',
            });
        }
        setFormErrors({}); // Clear errors when dialog opens/closes
    }, [editingCategory, isDialogOpen]); // Added isDialogOpen to dependency array

    // Handle input changes for form fields
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        // Clear error for the changed field
        if (formErrors[id]) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[id];
                return newErrors;
            });
        }
    };

    // Handle select input change for status
    const handleSelectChange = (value: 'active' | 'inactive') => {
        setFormData(prev => ({ ...prev, status: value }));
        if (formErrors.status) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.status;
                return newErrors;
            });
        }
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Client-side validation (basic) - This is for immediate feedback before server validation
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

        if (editingCategory) {
            // Update existing category
            router.post(route('dashboard.category.update', editingCategory.id), formData, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    setEditingCategory(null);
                    setFormErrors({}); // Clear errors on successful submission
                    // Toast message handled by useEffect for flash.success
                },
                onError: (errors) => {
                    setFormErrors(errors); // Set errors from Inertia
                    // Toast message handled by useEffect for inertiaErrors
                },
            });
        } else {
            // Create new category
            router.post(route('dashboard.category.store'), formData, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    setFormErrors({}); // Clear errors on successful submission
                    // Toast message handled by useEffect for flash.success
                },
                onError: (errors) => {
                    setFormErrors(errors); // Set errors from Inertia
                    // Toast message handled by useEffect for inertiaErrors
                },
            });
        }
    };

    // Open dialog for creating a new category
    const openCreateDialog = () => {
        setEditingCategory(null);
        setIsDialogOpen(true);
    };

    // Open dialog for editing an existing category
    const openEditDialog = (category: Category) => {
        setEditingCategory(category);
        setIsDialogOpen(true);
    };

    // Close dialog and reset state
    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '', status: 'active' });
        setFormErrors({}); // Clear errors when dialog is closed manually
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Category" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Categories</h1>
                    <div className="flex items-center space-x-2">
                        <Input
                            type="text"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={openCreateDialog}>Add New Category</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>{editingCategory ? 'Edit Category' : 'Create Category'}</DialogTitle>
                                    <DialogDescription>
                                        {editingCategory
                                            ? 'Make changes to your category here. Click save when you\'re done.'
                                            : 'Fill in the details for the new category.'}
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
                                        {formErrors.name && (
                                            <p className="col-span-4 text-right text-sm text-red-500">{formErrors.name}</p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="description" className="text-right">
                                            Description
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="status" className="text-right">
                                            Status
                                        </Label>
                                        <Select
                                            onValueChange={handleSelectChange}
                                            value={formData.status}
                                        >
                                            <SelectTrigger className={`col-span-3 ${formErrors.status ? 'border-red-500' : ''}`}>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="deactive">Deactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {formErrors.status && (
                                            <p className="col-span-4 text-right text-sm text-red-500">{formErrors.status}</p>
                                        )}
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={closeDialog}>
                                            Cancel
                                        </Button>
                                        <Button type="submit">
                                            {editingCategory ? 'Save Changes' : 'Create Category'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
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
                            {categories.data && categories.data.length > 0 ? (
                                categories.data.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell className="font-medium">{category.name}</TableCell>
                                        <TableCell>{category.description || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Badge variant={category.status === 'active' ? 'default' : 'destructive'}>
                                                {category.status.charAt(0).toUpperCase() + category.status.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(category.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openEditDialog(category)}
                                            >
                                                Edit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No categories found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between space-x-2 py-4">
                    <div className="text-sm text-muted-foreground">
                        Showing {categories.from} to {categories.to} of {categories.total} entries
                    </div>
                    <div className="flex items-center space-x-2">
                        {categories.links.map((link, index) => (
                            <Button
                                key={index}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
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
