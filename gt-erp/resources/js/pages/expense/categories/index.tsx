import { Button } from '@/components/ui/button';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Plus, Trash2, Edit, ArrowLeft, Save, X } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Category {
    id: number;
    name: string;
    code: string | null;
    description: string | null;
}

interface PageProps {
    categories: Category[];
    [key: string]: unknown;
}

export default function CategoryIndex() {
    const { categories } = usePage<PageProps>().props;
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        code: '',
        description: '',
    });

    const openCreateDialog = () => {
        setEditingCategory(null);
        reset();
        clearErrors();
        setIsDialogOpen(true);
    };

    const openEditDialog = (category: Category) => {
        setEditingCategory(category);
        setData({
            name: category.name,
            code: category.code || '',
            description: category.description || '',
        });
        clearErrors();
        setIsDialogOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            put(route('dashboard.expense.categories.update', editingCategory.id), {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    toast.success('Category updated successfully');
                },
            });
        } else {
            post(route('dashboard.expense.categories.store'), {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    toast.success('Category created successfully');
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this category? Categories with recorded expenses cannot be deleted.')) {
            destroy(route('dashboard.expense.categories.destroy', id), {
                onSuccess: () => toast.success('Category deleted successfully'),
                onError: (errors: any) => {
                    if (errors.error) toast.error(errors.error);
                }
            });
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Expenses', href: route('dashboard.expense.index') }, { title: 'Categories', href: '#' }]}>
            <Head title="Expense Categories" />

            <div className="flex flex-col gap-6 p-4 md:p-6 items-center">
                <div className="w-full max-w-4xl flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
                        <div className="flex items-center gap-4">
                            <Link href={route('dashboard.expense.index')}>
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Expense Categories</h1>
                                <p className="text-gray-500 text-sm">Organize your expenses with custom categories.</p>
                            </div>
                        </div>
                        <Button onClick={openCreateDialog} className="gap-2">
                            <Plus className="h-4 w-4" /> Add Category
                        </Button>
                    </div>

                    <div className="bg-white rounded-2xl border shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/50">
                                    <TableHead className="w-[100px]">Code</TableHead>
                                    <TableHead>Category Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.length > 0 ? (
                                    categories.map((category) => (
                                        <TableRow key={category.id} className="hover:bg-gray-50/50 transition-colors">
                                            <TableCell className="font-mono text-xs">{category.code || '-'}</TableCell>
                                            <TableCell className="font-bold text-gray-900">{category.name}</TableCell>
                                            <TableCell className="text-gray-500 text-sm max-w-xs truncate">
                                                {category.description || '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600" onClick={() => openEditDialog(category)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDelete(category.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-48 text-center text-gray-500">
                                            No categories found. Click "Add Category" to get started.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                        <DialogDescription>
                            Enter the details for the expense category. These will be mapped to your chart of accounts.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Category Name <span className="text-red-500">*</span></label>
                            <Input
                                placeholder="e.g. Electricity, Fuel, Rent"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Account Code (Optional)</label>
                            <Input
                                placeholder="e.g. 5001"
                                value={data.code}
                                onChange={e => setData('code', e.target.value)}
                                className={errors.code ? 'border-red-500' : ''}
                            />
                            {errors.code && <p className="text-xs text-red-500">{errors.code}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Description</label>
                            <Textarea
                                placeholder="Optional details..."
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={processing} >
                                <Save className="h-4 w-4 mr-2" /> {editingCategory ? 'Update' : 'Save'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
