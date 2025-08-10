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
import { toast } from 'sonner';
import { useEffect } from 'react';

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

    console.log("brands, models",brands, models)

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
                        <Select
                            value={data.vehicle_brand_id}
                            onValueChange={(value) => {
                                setData('vehicle_brand_id', value);
                                // Reset model when brand changes
                                // setData('vehicle_model_id', '');
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
                        {errors.vehicle_brand_id && <div className="text-red-500 text-sm mt-1">{errors.vehicle_brand_id}</div>}
                    </div>

                    <div>
                        <Label htmlFor="vehicle_model_id">Model</Label>
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