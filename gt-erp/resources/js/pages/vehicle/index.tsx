import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { Vehicle } from '@/types/types';

type PageProps = {
    vehicles: {
        data: Vehicle[];
        links: { url: string; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
    };
    brands: { id: number; name: string }[];
    models: { id: number; name: string }[];
    years: number[];
    filters: {
        search?: string;
        year?: string;
        brand?: string;
        model?: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Vehicle',
        href: '/dashboard/vehicle',
    },
];

export default function Index() {
    const { vehicles, brands, models, years, filters } = usePage<PageProps>().props;
    const { data, setData, get } = useForm({
        search: filters.search || '',
        year: filters.year || '',
        brand: filters.brand || '',
        model: filters.model || '',
    });

    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash?.success);
        }
        if (flash?.error) {
            toast.error(flash?.error);
        }
    }, [flash]);

    const handleFilter = () => {
        get(route('dashboard.vehicle.index'), {
            data: {
                search: data.search,
                year: data.year,
                brand: data.brand,
                model: data.model,
            },
            preserveState: true,
        });
    };

    const handleClearFilters = () => {
        setData({ search: '', year: '', brand: '', model: '' });
        get(route('dashboard.vehicle.index'), {
            data: {
                search: '',
                year: '',
                brand: '',
                model: '',
            },
            preserveState: true,
        });
    };

    const handleDelete = (vehicleId: number) => {
        if (confirm('Are you sure you want to delete this vehicle?')) {
            router.delete(route('dashboard.vehicle.destroy', vehicleId), {
                preserveState: true,
                onSuccess: () => {
                    toast.success('Vehicle deleted successfully.');
                },
                onError: (errors) => {
                    toast.error('Failed to delete vehicle. ' + errors.message);
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vehicle" />
            <div className="flex flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Vehicles</h1>
                    <Button asChild>
                        <Link href={route('dashboard.vehicle.create')}>Add Vehicle</Link>
                    </Button>
                </div>

                {/* Filters Section */}
                <div className="flex flex-wrap items-center gap-4">
                    <Input
                        placeholder="Search by vehicle no..."
                        value={data.search}
                        onChange={(e) => setData('search', e.target.value)}
                        className="w-full md:w-auto"
                    />

                    <Select value={data.year} onValueChange={(value) => setData('year', value)}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Filter by Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((year) => (
                                <SelectItem key={year} value={String(year)}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={data.brand} onValueChange={(value) => setData('brand', value)}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Filter by Brand" />
                        </SelectTrigger>
                        <SelectContent>
                            {brands.map((brand) => (
                                <SelectItem key={brand.id} value={String(brand.id)}>
                                    {brand.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={data.model} onValueChange={(value) => setData('model', value)}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Filter by Model" />
                        </SelectTrigger>
                        <SelectContent>
                            {models.map((model) => (
                                <SelectItem key={model.id} value={String(model.id)}>
                                    {model.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="flex gap-2">
                        <Button onClick={handleFilter}>Apply Filters</Button>
                        <Button variant="outline" onClick={handleClearFilters}>
                            Clear Filters
                        </Button>
                    </div>
                </div>

                {/* Vehicle Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Vehicle No</TableHead>
                                <TableHead>Brand</TableHead>
                                <TableHead>Model</TableHead>
                                <TableHead>Make Year</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vehicles.data.length > 0 ? (
                                vehicles.data.map((vehicle) => (
                                    <TableRow key={vehicle.id}>
                                        <TableCell>{vehicle.vehicle_no}</TableCell>
                                        <TableCell>{vehicle.brand?.name ?? 'N/A'}</TableCell>
                                        <TableCell>{vehicle.model?.name ?? 'N/A'}</TableCell>
                                        <TableCell>{vehicle.make_year}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={route('dashboard.vehicle.edit', vehicle.id)}>Edit</Link>
                                                </Button>
                                                {/* <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(vehicle.id)}
                                                >
                                                    Delete
                                                </Button> */}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">
                                        No vehicles found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex justify-center mt-4">
                    <Pagination>
                        <PaginationContent>
                            {vehicles.links.map((link, index) => (
                                <PaginationItem key={index}>
                                    <PaginationLink
                                        href={link.url || '#'}
                                        isActive={link.active}
                                        onClick={(e) => {
                                            if (!link.url) e.preventDefault();
                                        }}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                </PaginationItem>
                            ))}
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>
        </AppLayout>
    );
}