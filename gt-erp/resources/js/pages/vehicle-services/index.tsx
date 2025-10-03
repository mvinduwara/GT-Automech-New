import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Eye } from 'lucide-react';

interface VehicleServiceOption {
    id: number;
    name: string;
    price: number;
    status: string;
}

interface VehicleService {
    id: number;
    name: string;
    status: string;
    options: VehicleServiceOption[];
    created_at: string;
    updated_at: string;
}

interface Props {
    vehicleServices: VehicleService[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Services',
        href: '/dashboard/vehicle-services',
    },
];

export default function VehicleServicesIndex({ vehicleServices }: Props) {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState<VehicleService | null>(null);

    const { data: createData, setData: setCreateData, post: createPost, processing: createProcessing, errors: createErrors, reset: resetCreate } = useForm({
        name: '',
        status: 'active',
    });

    const { data: editData, setData: setEditData, post: editPost, processing: editProcessing, errors: editErrors, reset: resetEdit } = useForm({
        name: '',
        status: 'active',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createPost(route('dashboard.vehicle-services.create'), {
            onSuccess: () => {
                setIsCreateDialogOpen(false);
                resetCreate();
            },
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingService) return;

        editPost(route('dashboard.vehicle-services.update', editingService.id), {
            onSuccess: () => {
                setIsEditDialogOpen(false);
                setEditingService(null);
                resetEdit();
            },
        });
    };

    const openEditDialog = (service: VehicleService) => {
        setEditingService(service);
        setEditData({
            name: service.name,
            status: service.status,
        });
        setIsEditDialogOpen(true);
    };

    const handleViewOptions = (serviceId: number) => {
        router.get(route('dashboard.vehicle-services.service.index', serviceId));
    };

    const getStatusColor = (status: string) => {
        return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vehicle Services" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Vehicle Services</h1>
                        <p className="text-sm text-gray-600">Manage your vehicle services and options</p>
                    </div>

                    <AlertDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <AlertDialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Service
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <form onSubmit={handleCreate}>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Create Vehicle Service</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Add a new vehicle service to your system.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="create-name">Service Name</Label>
                                        <Input
                                            id="create-name"
                                            value={createData.name}
                                            onChange={(e) => setCreateData('name', e.target.value)}
                                            placeholder="Enter service name"
                                            className={createErrors.name ? 'border-red-500' : ''}
                                        />
                                        {createErrors.name && (
                                            <p className="text-sm text-red-500">{createErrors.name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="create-status">Status</Label>
                                        <Select value={createData.status} onValueChange={(value) => setCreateData('status', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="deactive">deactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {createErrors.status && (
                                            <p className="text-sm text-red-500">{createErrors.status}</p>
                                        )}
                                    </div>
                                </div>

                                <AlertDialogFooter>
                                    <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                                    <AlertDialogAction type="submit" disabled={createProcessing}>
                                        {createProcessing ? 'Creating...' : 'Create Service'}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </form>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Services List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {vehicleServices.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No vehicle services found. Create your first service to get started.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Service Name</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Options Count</TableHead>
                                        <TableHead>Created Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {vehicleServices.map((service) => (
                                        <TableRow key={service.id}>
                                            <TableCell className="font-medium">{service.name}</TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(service.status)}>
                                                    {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{service.options.length}</TableCell>
                                            <TableCell>
                                                {new Date(service.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleViewOptions(service.id)}
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        Options
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditDialog(service)}
                                                    >
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        Edit
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Edit Dialog */}
                <AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <AlertDialogContent>
                        <form onSubmit={handleEdit}>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Edit Vehicle Service</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Update the vehicle service information.
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-name">Service Name</Label>
                                    <Input
                                        id="edit-name"
                                        value={editData.name}
                                        onChange={(e) => setEditData('name', e.target.value)}
                                        placeholder="Enter service name"
                                        className={editErrors.name ? 'border-red-500' : ''}
                                    />
                                    {editErrors.name && (
                                        <p className="text-sm text-red-500">{editErrors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-status">Status</Label>
                                    <Select value={editData.status} onValueChange={(value) => setEditData('status', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="deactive">Deactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {editErrors.status && (
                                        <p className="text-sm text-red-500">{editErrors.status}</p>
                                    )}
                                </div>
                            </div>

                            <AlertDialogFooter>
                                <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                                <AlertDialogAction type="submit" disabled={editProcessing}>
                                    {editProcessing ? 'Updating...' : 'Update Service'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </form>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}