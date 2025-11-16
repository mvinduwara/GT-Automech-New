import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
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
import { Plus, Edit, ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface VehicleServiceOption {
    id: number;
    name: string;
    price: number;
    status: string;
    created_at: string;
    updated_at: string;
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
    vehicleService: VehicleService;
}

export default function ServiceIndex({ vehicleService }: Props) {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingOption, setEditingOption] = useState<VehicleServiceOption | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Services',
            href: '/dashboard/vehicle-services',
        },
        {
            title: vehicleService.name,
            href: `/dashboard/vehicle-services/${vehicleService.id}`,
        },
    ];

    const { data: createData, setData: setCreateData, post: createPost, processing: createProcessing, errors: createErrors, reset: resetCreate } = useForm({
        name: '',
        price: '',
        status: 'active',
    });

    const { data: editData, setData: setEditData, post: editPost, processing: editProcessing, errors: editErrors, reset: resetEdit } = useForm({
        name: '',
        price: '',
        status: 'active',
    });

    const handleCreateOption = (e: React.FormEvent) => {
        e.preventDefault();
        createPost(route('dashboard.vehicle-services.option.store', vehicleService.id), {
            onSuccess: () => {
                setIsCreateDialogOpen(false);
                resetCreate();
            },
        });
    };

    const handleEditOption = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingOption) return;
        
        editPost(route('dashboard.vehicle-services.option.update', [vehicleService.id, editingOption.id]), {
            onSuccess: () => {
                setIsEditDialogOpen(false);
                setEditingOption(null);
                resetEdit();
            },
        });
    };

    const openEditDialog = (option: VehicleServiceOption) => {
        setEditingOption(option);
        setEditData({
            name: option.name,
            price: option.price.toString(),
            status: option.status,
        });
        setIsEditDialogOpen(true);
    };

    const getStatusColor = (status: string) => {
        return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'LKR',
            minimumFractionDigits: 2,
        }).format(price);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${vehicleService.name} - Options`} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                <div className="flex items-center gap-4">
                    <Link href={route('dashboard.vehicle-services.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Services
                        </Button>
                    </Link>
                </div>

                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">{vehicleService.name}</h1>
                        <p className="text-sm text-gray-600">Manage service options and pricing</p>
                        <div className="mt-2">
                            <Badge className={getStatusColor(vehicleService.status)}>
                                Service: {vehicleService.status.charAt(0).toUpperCase() + vehicleService.status.slice(1)}
                            </Badge>
                        </div>
                    </div>
                    
                    <AlertDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <AlertDialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Option
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <form onSubmit={handleCreateOption}>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Create Service Option</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Add a new option for {vehicleService.name} service.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="create-name">Option Name</Label>
                                        <Input
                                            id="create-name"
                                            value={createData.name}
                                            onChange={(e) => setCreateData('name', e.target.value)}
                                            placeholder="Enter option name"
                                            className={createErrors.name ? 'border-red-500' : ''}
                                        />
                                        {createErrors.name && (
                                            <p className="text-sm text-red-500">{createErrors.name}</p>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="create-price">Price (LKR)</Label>
                                        <Input
                                            id="create-price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={createData.price}
                                            onChange={(e) => setCreateData('price', e.target.value)}
                                            placeholder="Enter price"
                                            className={createErrors.price ? 'border-red-500' : ''}
                                        />
                                        {createErrors.price && (
                                            <p className="text-sm text-red-500">{createErrors.price}</p>
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
                                        {createProcessing ? 'Creating...' : 'Create Option'}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </form>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Service Options</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {vehicleService.options.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No service options found. Create your first option to get started.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Option Name</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {vehicleService.options.map((option) => (
                                        <TableRow key={option.id}>
                                            <TableCell className="font-medium">{option.name}</TableCell>
                                            <TableCell>{formatPrice(option.price)}</TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(option.status)}>
                                                    {option.status.charAt(0).toUpperCase() + option.status.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(option.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openEditDialog(option)}
                                                >
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Edit
                                                </Button>
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
                        <form onSubmit={handleEditOption}>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Edit Service Option</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Update the service option information.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-name">Option Name</Label>
                                    <Input
                                        id="edit-name"
                                        value={editData.name}
                                        onChange={(e) => setEditData('name', e.target.value)}
                                        placeholder="Enter option name"
                                        className={editErrors.name ? 'border-red-500' : ''}
                                    />
                                    {editErrors.name && (
                                        <p className="text-sm text-red-500">{editErrors.name}</p>
                                    )}
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="edit-price">Price (LKR)</Label>
                                    <Input
                                        id="edit-price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={editData.price}
                                        onChange={(e) => setEditData('price', e.target.value)}
                                        placeholder="Enter price"
                                        className={editErrors.price ? 'border-red-500' : ''}
                                    />
                                    {editErrors.price && (
                                        <p className="text-sm text-red-500">{editErrors.price}</p>
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
                                    {editProcessing ? 'Updating...' : 'Update Option'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </form>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}