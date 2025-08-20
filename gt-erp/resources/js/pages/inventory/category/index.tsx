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
import { Category } from '@/types/types';
import { Head, router, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface CategoryFormData {
    name: string;
    description: string;
    status: 'active' | 'deactive';
}

interface PaginatedData<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    from: number;
    to: number;
    total: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inventory', href: '/dashboard/inventory' },
    { title: 'Category', href: '/dashboard/category' },
];

export default function CategoryIndex() {
    const {
        categories,
        flash,
        errors: inertiaErrors,
        filters,
    } = usePage<{
        categories: PaginatedData<Category>;
        flash: { success?: string; error?: string };
        errors: { [key: string]: string };
        filters: { search?: string; status?: string };
    }>().props;

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState<CategoryFormData>({
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

    // Remove debounced search effect since we're using Apply Filters button
    // useEffect(() => {
    //     const handler = setTimeout(() => {
    //         router.get(route('dashboard.category.index'), { search: searchTerm, status: statusFilter }, { preserveState: true, replace: true });
    //     }, 300);
    //     return () => clearTimeout(handler);
    // }, [searchTerm, statusFilter]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
        if (formErrors[id]) {
            setFormErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[id];
                return newErrors;
            });
        }
    };

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

    const openCreateDialog = () => {
        setEditingCategory(null);
        setIsDialogOpen(true);
    };

    const openEditDialog = (category: Category) => {
        setEditingCategory(category);
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '', status: 'active' });
        setFormErrors({});
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Category" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Categories</h1>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={openCreateDialog}>Add New Category</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>{editingCategory ? 'Edit Category' : 'Create Category'}</DialogTitle>
                                <DialogDescription>
                                    {editingCategory ? 'Edit the category and click save.' : 'Fill in the new category details.'}
                                </DialogDescription>
                            </DialogHeader>
                            <form className="grid gap-4 py-4">
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
                                    <Select value={formData.status} onValueChange={handleSelectChange}>
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
                                    <Button type="submit">{editingCategory ? 'Save Changes' : 'Create Category'}</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Filter Section */}
                <div className="rounded-md border bg-white p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <Label htmlFor="search" className="text-sm font-medium mb-2 block">
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
                            <Label htmlFor="status-filter" className="text-sm font-medium mb-2 block">
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

                        <div className="md:col-span-2 flex justify-end space-x-2">
                            <Button 
                                variant="default" 
                                onClick={() => {
                                    router.get(route('dashboard.category.index'), { search: searchTerm, status: statusFilter }, { preserveState: true, replace: true });
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                            >
                                Apply Filters
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('');
                                    router.get(route('dashboard.category.index'), {}, { preserveState: true, replace: true });
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
                            {categories.data.length > 0 ? (
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
                                            <Button variant="outline" size="sm" onClick={() => openEditDialog(category)}>
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

                <div className="flex items-center justify-end space-x-2 py-4">
                    <div className="text-sm text-muted-foreground">
                        Showing {categories.from} to {categories.to} of {categories.total} entries
                    </div>
                    <div className="flex items-center space-x-2">
                        {categories.links.map((link, index) => (
                            <Button
                                key={index}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => {
                                    if (link.url) router.get(link.url, {}, { preserveScroll: true, preserveState: true });
                                }}
                                disabled={!link.url}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}