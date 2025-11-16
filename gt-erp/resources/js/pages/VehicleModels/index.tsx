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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Vehicle', href: '/dashboard/vehicle' },
    { title: 'Vehicle Models', href: '/dashboard/vehicle-models' },
];

interface VehicleBrand {
    id: number;
    name: string;
}

interface VehicleModel {
    id: number;
    name: string;
    brand: VehicleBrand;
}

interface VehicleModelIndexPageProps {
    models: {
        data: VehicleModel[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    brands: VehicleBrand[];
}

export default function Index() {
    const { props, flash } = usePage<VehicleModelIndexPageProps & { flash: { success?: string; error?: string } }>();
    const { models, brands } = props;

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingModel, setEditingModel] = useState<VehicleModel | null>(null);

    const addForm = useForm({
        name: '',
        vehicle_brand_id: '',
    });

    const editForm = useForm({
        name: '',
        vehicle_brand_id: '',
    });

    const { delete: destroy } = useForm();

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post(route('dashboard.vehicle-models.store'), {
            onSuccess: () => {
                addForm.reset();
                setIsAddOpen(false);
                toast.success('Model added successfully!');
            },
            onError: () => toast.error('Failed to add model.'),
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingModel) return;
        editForm.put(route('dashboard.vehicle-models.update', editingModel.id), {
            onSuccess: () => {
                editForm.reset();
                setEditingModel(null);
                toast.success('Model updated successfully!');
            },
            onError: () => toast.error('Failed to update model.'),
        });
    };

    const handleDelete = (modelId: number) => {
        if (confirm('Are you sure you want to delete this model? This action cannot be undone.')) {
            destroy(route('dashboard.vehicle-models.destroy', modelId), {
                onSuccess: () => toast.success('Model deleted successfully!'),
                onError: () => toast.error('Failed to delete model. It may be in use.'),
            });
        }
    };

    const openEdit = (model: VehicleModel) => {
        setEditingModel(model);
        editForm.setData({
            name: model.name,
            vehicle_brand_id: String(model.brand?.id ?? ''),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vehicle Models" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">Vehicle Models</h1>
                    <Button onClick={() => setIsAddOpen(true)}>
                        <PlusIcon className="mr-2 h-4 w-4" /> Add Model
                    </Button>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableCaption>A list of vehicle models.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Model Name</TableHead>
                                <TableHead>Brand</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {models.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-gray-500">
                                        No models found. Add your first model to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                models.data.map((model) => (
                                    <TableRow key={model.id}>
                                        <TableCell className="font-medium">{model.name}</TableCell>
                                        <TableCell>{model.brand?.name ?? 'N/A'}</TableCell>
                                        <TableCell className="pr-0">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Button
                                                    variant={'ghost'}
                                                    className="flex items-center justify-center p-2 text-neutral-800"
                                                    onClick={() => openEdit(model)}
                                                >
                                                    <UserPen className="h-5 w-5" />
                                                </Button>
                                                <Button
                                                    variant={'ghost'}
                                                    className="flex items-center justify-center p-2 text-red-600 hover:text-red-800 hover:bg-red-50"
                                                    onClick={() => handleDelete(model.id)}
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
                        {models.links.map((link, index) => (
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

            {/* Add Model Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <form onSubmit={handleAdd}>
                        <DialogHeader>
                            <DialogTitle>Add New Model</DialogTitle>
                            <DialogDescription>Enter the model name and select a brand.</DialogDescription>
                        </DialogHeader>

                        <div className="py-4 space-y-4">
                            <div>
                                <Label htmlFor="add-name">Model Name</Label>
                                <Input
                                    id="add-name"
                                    value={addForm.data.name}
                                    onChange={(e) => addForm.setData('name', e.target.value)}
                                    className="mt-1"
                                    placeholder="e.g., Corolla"
                                />
                                {addForm.errors.name && (
                                    <p className="text-sm text-red-600 mt-1">{addForm.errors.name}</p>
                                )}
                            </div>

                            <div>
                                <Label>Brand</Label>
                                <Select
                                    value={addForm.data.vehicle_brand_id}
                                    onValueChange={(val) => addForm.setData('vehicle_brand_id', val)}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select brand" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {brands.map((brand) => (
                                            <SelectItem key={brand.id} value={String(brand.id)}>
                                                {brand.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {addForm.errors.vehicle_brand_id && (
                                    <p className="text-sm text-red-600 mt-1">{addForm.errors.vehicle_brand_id}</p>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={addForm.processing}>
                                {addForm.processing ? 'Adding...' : 'Add Model'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Model Dialog */}
            <Dialog open={!!editingModel} onOpenChange={() => setEditingModel(null)}>
                <DialogContent>
                    <form onSubmit={handleEdit}>
                        <DialogHeader>
                            <DialogTitle>Edit Model</DialogTitle>
                            <DialogDescription>Update the model name or brand.</DialogDescription>
                        </DialogHeader>

                        <div className="py-4 space-y-4">
                            <div>
                                <Label htmlFor="edit-name">Model Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    className="mt-1"
                                    placeholder="e.g., Civic"
                                />
                                {editForm.errors.name && (
                                    <p className="text-sm text-red-600 mt-1">{editForm.errors.name}</p>
                                )}
                            </div>

                            <div>
                                <Label>Brand</Label>
                                <Select
                                    value={editForm.data.vehicle_brand_id}
                                    onValueChange={(val) => editForm.setData('vehicle_brand_id', val)}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select brand" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {brands.map((brand) => (
                                            <SelectItem key={brand.id} value={String(brand.id)}>
                                                {brand.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {editForm.errors.vehicle_brand_id && (
                                    <p className="text-sm text-red-600 mt-1">{editForm.errors.vehicle_brand_id}</p>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditingModel(null)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={editForm.processing}>
                                {editForm.processing ? 'Updating...' : 'Update Model'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Toaster richColors position="top-right" />
        </AppLayout>
    );
}
