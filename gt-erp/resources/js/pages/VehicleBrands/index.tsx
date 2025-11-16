import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Trash2, UserPen, PlusIcon } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Vehicle',
        href: '/dashboard/vehicle',
    },
    {
        title: 'Vehicle Brands',
        href: '/dashboard/vehicle-brands',
    },
];

interface VehicleBrand {
    id: number;
    name: string;
    models_count: number;
}

interface VehicleBrandIndexPageProps {
    brands: {
        data: VehicleBrand[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
}

export default function Index() {
    const { props, flash } = usePage<VehicleBrandIndexPageProps & { flash: { success?: string; error?: string } }>();
    const { brands } = props;

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<VehicleBrand | null>(null);

    const addForm = useForm({
        name: '',
    });

    const editForm = useForm({
        name: '',
    });

    const { delete: destroy } = useForm();

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post(route('dashboard.vehicle-brands.store'), {
            onSuccess: () => {
                addForm.reset();
                setIsAddOpen(false);
                toast.success('Brand added successfully!');
            },
            onError: () => {
                toast.error('Failed to add brand.');
            },
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBrand) return;

        editForm.put(route('dashboard.vehicle-brands.update', editingBrand.id), {
            onSuccess: () => {
                editForm.reset();
                setEditingBrand(null);
                toast.success('Brand updated successfully!');
            },
            onError: () => {
                toast.error('Failed to update brand.');
            },
        });
    };

    const handleDelete = (brandId: number) => {
        if (confirm('Are you sure you want to delete this brand? This action cannot be undone.')) {
            destroy(route('dashboard.vehicle-brands.destroy', brandId), {
                onSuccess: () => {
                    toast.success('Brand deleted successfully!');
                },
                onError: () => {
                    toast.error('Failed to delete brand. It may have associated models.');
                },
            });
        }
    };

    const openEdit = (brand: VehicleBrand) => {
        setEditingBrand(brand);
        editForm.setData('name', brand.name);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vehicle Brands" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">Vehicle Brands</h1>
                    <Button onClick={() => setIsAddOpen(true)}>
                        <PlusIcon className="mr-2 h-4 w-4" /> Add Brand
                    </Button>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableCaption>A list of vehicle brands.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Brand Name</TableHead>
                                <TableHead>Models Count</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {brands.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-gray-500">
                                        No brands found. Add your first brand to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                brands.data.map((brand) => (
                                    <TableRow key={brand.id}>
                                        <TableCell className="font-medium">{brand.name}</TableCell>
                                        <TableCell>{brand.models_count} {brand.models_count === 1 ? 'model' : 'models'}</TableCell>
                                        <TableCell className="pr-0">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Button
                                                    variant={'ghost'}
                                                    className="flex items-center justify-center p-2 text-neutral-800"
                                                    onClick={() => openEdit(brand)}
                                                >
                                                    <UserPen className="h-5 w-5" />
                                                </Button>
                                                <Button
                                                    variant={'ghost'}
                                                    className="flex items-center justify-center p-2 text-red-600 hover:text-red-800 hover:bg-red-50"
                                                    onClick={() => handleDelete(brand.id)}
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <Pagination>
                    <PaginationContent>
                        {brands.links.map((link, index) => (
                            <PaginationItem key={index}>
                                <PaginationLink
                                    href={link.url || '#'}
                                    isActive={link.active}
                                    onClick={(e) => {
                                        if (link.url) {
                                            e.preventDefault();
                                            router.get(link.url);
                                        }
                                    }}
                                >
                                    {link.label.replace('&laquo; Previous', 'Previous').replace('Next &raquo;', 'Next')}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                    </PaginationContent>
                </Pagination>
            </div>

            {/* Add Brand Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <form onSubmit={handleAdd}>
                        <DialogHeader>
                            <DialogTitle>Add New Brand</DialogTitle>
                            <DialogDescription>
                                Enter the vehicle brand name below.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Label htmlFor="add-name">Brand Name</Label>
                            <Input
                                id="add-name"
                                value={addForm.data.name}
                                onChange={(e) => addForm.setData('name', e.target.value)}
                                className="mt-1"
                                placeholder="e.g., Toyota"
                            />
                            {addForm.errors.name && (
                                <p className="text-sm text-red-600 mt-1">{addForm.errors.name}</p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={addForm.processing}>
                                {addForm.processing ? 'Adding...' : 'Add Brand'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Brand Dialog */}
            <Dialog open={!!editingBrand} onOpenChange={() => setEditingBrand(null)}>
                <DialogContent>
                    <form onSubmit={handleEdit}>
                        <DialogHeader>
                            <DialogTitle>Edit Brand</DialogTitle>
                            <DialogDescription>
                                Update the vehicle brand name below.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Label htmlFor="edit-name">Brand Name</Label>
                            <Input
                                id="edit-name"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                className="mt-1"
                                placeholder="e.g., Toyota"
                            />
                            {editForm.errors.name && (
                                <p className="text-sm text-red-600 mt-1">{editForm.errors.name}</p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditingBrand(null)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={editForm.processing}>
                                {editForm.processing ? 'Updating...' : 'Update Brand'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Toaster richColors position="top-right" />
        </AppLayout>
    );
}
