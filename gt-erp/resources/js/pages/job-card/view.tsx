import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    ArrowLeft,
    Calendar,
    Car,
    User,
    Phone,
    MapPin,
    Gauge,
    Wrench,
    Package,
    Users,
    CheckCircle,
    XCircle,
    Edit,
    Clock
} from 'lucide-react';
import JobCardStatusForm from './JobCardStatusForm';
import EmployeeAssignmentForm from './EmployeeAssignmentForm';

// Type Definitions
interface Customer {
    id: number;
    title: string;
    name: string;
    mobile: string;
    address: string;
}

interface VehicleBrand {
    id: number;
    name: string;
}

interface VehicleModel {
    id: number;
    name: string;
}

interface Vehicle {
    id: number;
    vehicle_no: string;
    make_year: string;
    brand: VehicleBrand;
    model: VehicleModel;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface VehicleService {
    id: number;
    name: string;
    status: string;
}

interface VehicleServiceOption {
    id: number;
    name: string;
    price: number;
    status: string;
}

interface JobCardVehicleService {
    id: number;
    is_included: boolean;
    vehicle_service: VehicleService;
    vehicle_service_option: VehicleServiceOption;
}

interface Product {
    id: number;
    name: string;
    part_number: string;
}

interface Stock {
    id: number;
    quantity: number;
    buying_price: number;
    selling_price: number;
    product: Product;
    alternative_product?: Product;
}

interface Department {
    id: number;
    name: string;
}

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    job_title: string;
    department: Department;
}

interface ServiceJobCard {
    id: number;
    status: string;
    oil_item?: Stock;
    oil_filter_item?: Stock;
    drain_plug_seal_item?: Stock;
    ac_technician?: Employee;
    electronic_technician?: Employee;
    mechanical_technician?: Employee;
}

interface JobCard {
    id: number;
    job_card_no: string;
    mileage: number;
    date: string;
    remarks?: string;
    type: string;
    status: string;
    vehicle: Vehicle;
    customer: Customer;
    user: User;
    job_card_vehicle_services: JobCardVehicleService[];
    service_job_card?: ServiceJobCard;
}

interface Totals {
    service_total: number;
    stock_total: number;
    grand_total: number;
}

interface Props {
    jobCard: JobCard;
    totals: Totals;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Job Card',
        href: '/dashboard/job-card',
    },
    {
        title: 'View',
        href: '',
    },
];

export default function View({ jobCard, totals }: Props) {
    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
            in_progress: { color: 'bg-blue-100 text-blue-800', icon: Wrench },
            completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        const IconComponent = config.icon;

        return (
            <Badge className={config.color}>
                <IconComponent className="h-3 w-3 mr-1" />
                {status.replace('_', ' ').toUpperCase()}
            </Badge>
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'LKR',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const includedServices = jobCard.job_card_vehicle_services.filter(service => service.is_included);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Job Card - ${jobCard.job_card_no}`} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('dashboard.job-card.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Job Cards
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Job Card: {jobCard.job_card_no}
                            </h1>
                            <p className="text-sm text-gray-600">
                                Created on {formatDate(jobCard.date)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {getStatusBadge(jobCard.status)}
                        <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Vehicle Information */}
                        <JobCardStatusForm
                            id={jobCard.id}
                            currentStatus={jobCard.status}
                            jobCardNo={jobCard.job_card_no}
                        />
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Car className="h-5 w-5" />
                                    Vehicle Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Vehicle Number</label>
                                        <p className="text-lg font-semibold">{jobCard.vehicle.vehicle_no}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Current Mileage</label>
                                        <p className="text-lg font-semibold flex items-center gap-1">
                                            <Gauge className="h-4 w-4" />
                                            {jobCard.mileage.toLocaleString()} km
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Brand</label>
                                        <p className="text-lg font-semibold">{jobCard.vehicle.brand.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Model</label>
                                        <p className="text-lg font-semibold">{jobCard.vehicle.model?.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Make Year</label>
                                        <p className="text-lg font-semibold">{jobCard.vehicle.make_year}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Job Type</label>
                                        <Badge variant="outline" className="text-sm">
                                            {jobCard.type.replace('_', ' ').toUpperCase()}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Customer Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Customer Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Name</label>
                                        <p className="text-lg font-semibold">
                                            {jobCard.customer.title} {jobCard.customer.name}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Mobile</label>
                                        <p className="text-lg font-semibold flex items-center gap-1">
                                            <Phone className="h-4 w-4" />
                                            {jobCard.customer.mobile}
                                        </p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium text-gray-500">Address</label>
                                        <p className="text-lg font-semibold flex items-start gap-1">
                                            <MapPin className="h-4 w-4 mt-1" />
                                            {jobCard.customer.address}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Services */}
                        {includedServices.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Wrench className="h-5 w-5" />
                                        Selected Services
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Service</TableHead>
                                                <TableHead>Option</TableHead>
                                                <TableHead className="text-right">Price</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {includedServices.map((service) => (
                                                <TableRow key={service.id}>
                                                    <TableCell className="font-medium">
                                                        {service.vehicle_service.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {service.vehicle_service_option.name}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {formatCurrency(service.vehicle_service_option.price)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )}

                        {/* Stock Items */}
                        {jobCard.service_job_card && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Stock Items
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Item</TableHead>
                                                <TableHead>Part Number</TableHead>
                                                <TableHead className="text-right">Price</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {[
                                                { item: jobCard.service_job_card.oil_item, type: 'Oil' },
                                                { item: jobCard.service_job_card.oil_filter_item, type: 'Oil Filter' },
                                                { item: jobCard.service_job_card.drain_plug_seal_item, type: 'Drain Plug Seal' },
                                            ].map(({ item, type }, index) =>
                                                item && (
                                                    <TableRow key={index}>
                                                        <TableCell className="font-medium">
                                                            {item.product.name}
                                                        </TableCell>
                                                        <TableCell>
                                                            {item.product.part_number}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {formatCurrency(item.selling_price)}
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )}

                        {/* Technicians */}
                        {jobCard.service_job_card && (
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Assigned Technicians
                                    </CardTitle>
                                    <EmployeeAssignmentForm serviceJobCard={jobCard.service_job_card} />
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            { tech: jobCard.service_job_card.ac_technician, type: 'AC Technician' },
                                            { tech: jobCard.service_job_card.electronic_technician, type: 'Electronic Technician' },
                                            { tech: jobCard.service_job_card.mechanical_technician, type: 'Mechanical Technician' },
                                        ].map(({ tech, type }, index) => (
                                            <div key={index} className="p-3 border rounded-lg">
                                                <label className="text-sm font-medium text-gray-500">{type}</label>
                                                {tech ? (
                                                    <div>
                                                        <p className="font-semibold">
                                                            {tech.first_name} {tech.last_name}
                                                        </p>
                                                        <p className="text-sm text-gray-600">{tech.job_title}</p>
                                                        <p className="text-xs text-gray-500">{tech.department.name}</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-400 italic">Not assigned</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Remarks */}
                        {jobCard.remarks && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Remarks</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-700 whitespace-pre-wrap">{jobCard.remarks}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Summary */}
                    <div className="space-y-6">
                        {/* Job Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Job Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Job Card No:</span>
                                        <span className="font-medium">{jobCard.job_card_no}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Created By:</span>
                                        <span className="font-medium">{jobCard.user.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Date:</span>
                                        <span className="font-medium flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(jobCard.date)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Status:</span>
                                        {getStatusBadge(jobCard.status)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cost Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Cost Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Services:</span>
                                        <span className="font-medium">{formatCurrency(totals.service_total)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Stock Items:</span>
                                        <span className="font-medium">{formatCurrency(totals.stock_total)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between text-lg font-semibold">
                                        <span>Grand Total:</span>
                                        <span className="text-green-600">{formatCurrency(totals.grand_total)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}