import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

// Define the types for the props passed from the controller
type Brand = {
    id: number;
    name: string;
};

type Model = {
    id: number;
    name: string;
    vehicle_brand_id: number;
};

type PageProps = {
    brands: Brand[];
    models: Model[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Vehicle',
        href: '/dashboard/vehicle',
    },
    {
        title: 'Vehicle Create',
        href: '/dashboard/vehicle/create',
    },
];

export default function Create() {
    const { brands, models } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        vehicle_no: '',
        vehicle_brand_id: '',
        vehicle_model_id: '',
        make_year: '',
    });

    const [brandDialogOpen, setBrandDialogOpen] = useState(false);
    const [modelDialogOpen, setModelDialogOpen] = useState(false);

    const brandForm = useForm({
        name: '',
    });

    const modelForm = useForm({
        name: '',
        vehicle_brand_id: '',
    });

    console.log("brands, models", brands, models);

    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash?.success);
        }
        if (flash?.error) {
            toast.error(flash?.error);
        }
    }, [flash]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('dashboard.vehicle.store'));
    };

    const handleAddBrand = (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        brandForm.post(route('dashboard.vehicle-brand.store'), {
            onSuccess: () => {
                toast.success('Brand added successfully');
                setBrandDialogOpen(false);
                brandForm.reset();
            },
            onError: () => {
                toast.error('Failed to add brand');
            },
        });
    };

    const handleAddModel = (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        modelForm.post(route('dashboard.vehicle-model.store'), {
            onSuccess: () => {
                toast.success('Model added successfully');
                setModelDialogOpen(false);
                modelForm.reset();
            },
            onError: () => {
                toast.error('Failed to add model');
            },
        });
    };

    // Pre-populate brand when opening model dialog
    useEffect(() => {
        if (modelDialogOpen && data.vehicle_brand_id) {
            modelForm.setData('vehicle_brand_id', data.vehicle_brand_id);
        }
    }, [modelDialogOpen, data.vehicle_brand_id]);

    // Filter models based on selected brand
    const filteredModels = models.filter(model => String(model.vehicle_brand_id) === data.vehicle_brand_id);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vehicle Create" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Create New Vehicle</h1>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <Label htmlFor="vehicle_no">Vehicle No</Label>
                        <Input
                            id="vehicle_no"
                            type="text"
                            value={data.vehicle_no}
                            onChange={(e) => setData('vehicle_no', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        {errors.vehicle_no && <div className="text-red-500 text-sm mt-1">{errors.vehicle_no}</div>}
                    </div>

                    <div>
                        <Label htmlFor="vehicle_brand_id">Brand</Label>
                        <div className="flex gap-2 mt-1">
                            <Select
                                value={data.vehicle_brand_id}
                                onValueChange={(value) => {
                                    setData('vehicle_brand_id', value);
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a brand" />
                                </SelectTrigger>
                                <SelectContent>
                                    {brands.map((brand) => (
                                        <SelectItem key={brand.id} value={String(brand.id)}>
                                            {brand.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Dialog open={brandDialogOpen} onOpenChange={setBrandDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button type="button" size="icon" variant="outline">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Brand</DialogTitle>
                                        <DialogDescription>
                                            Enter the name of the new vehicle brand.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleAddBrand} className="space-y-4">
                                        <div>
                                            <Label htmlFor="brand_name">Brand Name</Label>
                                            <Input
                                                id="brand_name"
                                                type="text"
                                                value={brandForm.data.name}
                                                onChange={(e) => brandForm.setData('name', e.target.value)}
                                                className="mt-1"
                                                placeholder="e.g., Toyota"
                                            />
                                            {brandForm.errors.name && (
                                                <div className="text-red-500 text-sm mt-1">
                                                    {brandForm.errors.name}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setBrandDialogOpen(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={brandForm.processing}>
                                                Add Brand
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                        {errors.vehicle_brand_id && <div className="text-red-500 text-sm mt-1">{errors.vehicle_brand_id}</div>}
                    </div>

                    <div>
                        <Label htmlFor="vehicle_model_id">Model</Label>
                        <div className="flex gap-2 mt-1">
                            <Select
                                value={data.vehicle_model_id}
                                onValueChange={(value) => setData('vehicle_model_id', value)}
                                disabled={!data.vehicle_brand_id}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a model" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredModels.map((model) => (
                                        <SelectItem key={model.id} value={String(model.id)}>
                                            {model.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Dialog open={modelDialogOpen} onOpenChange={setModelDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="outline"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Model</DialogTitle>
                                        <DialogDescription>
                                            Enter the name of the new vehicle model.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleAddModel} className="space-y-4">
                                        <div>
                                            <Label htmlFor="model_brand">Brand</Label>
                                            <Select
                                                value={modelForm.data.vehicle_brand_id}
                                                onValueChange={(value) => modelForm.setData('vehicle_brand_id', value)}
                                                defaultValue={data.vehicle_brand_id}
                                            >
                                                <SelectTrigger className="w-full mt-1">
                                                    <SelectValue placeholder="Select a brand" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {brands.map((brand) => (
                                                        <SelectItem key={brand.id} value={String(brand.id)}>
                                                            {brand.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {modelForm.errors.vehicle_brand_id && (
                                                <div className="text-red-500 text-sm mt-1">
                                                    {modelForm.errors.vehicle_brand_id}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="model_name">Model Name</Label>
                                            <Input
                                                id="model_name"
                                                type="text"
                                                value={modelForm.data.name}
                                                onChange={(e) => modelForm.setData('name', e.target.value)}
                                                className="mt-1"
                                                placeholder="e.g., Camry"
                                            />
                                            {modelForm.errors.name && (
                                                <div className="text-red-500 text-sm mt-1">
                                                    {modelForm.errors.name}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setModelDialogOpen(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={modelForm.processing}>
                                                Add Model
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                        {errors.vehicle_model_id && <div className="text-red-500 text-sm mt-1">{errors.vehicle_model_id}</div>}
                    </div>

                    <div>
                        <Label htmlFor="make_year">Make Year</Label>
                        <Input
                            id="make_year"
                            type="number"
                            value={data.make_year}
                            onChange={(e) => setData('make_year', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        {errors.make_year && <div className="text-red-500 text-sm mt-1">{errors.make_year}</div>}
                    </div>

                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={processing}>
                            Create Vehicle
                        </Button>
                        <Button variant="outline" type="button" onClick={() => window.history.back()}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
