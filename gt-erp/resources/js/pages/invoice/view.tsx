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
    User,
    Phone,
    MapPin,
    CheckCircle,
    XCircle,
    Clock,
    Edit,
} from 'lucide-react';

// Types
interface Customer {
    id: number;
    title: string;
    name: string;
    mobile: string;
    address: string;
}

interface VehicleBrand { id: number; name: string; }
interface VehicleModel { id: number; name: string; }

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

interface JobCard {
    id: number;
    job_card_no: string;
    date: string;
    status: string;
    vehicle: Vehicle;
    user: User;
}

interface InvoiceItem {
    id: number;
    description: string;
    quantity: number;
    unit_price: number;
    discount_type: string | null;
    discount_value: number | null;
    line_total: number;
}

interface Invoice {
    id: number;
    invoice_no: string;
    invoice_date: string;
    due_date: string;
    remarks?: string;
    status: string;
    customer: Customer;
    job_card: JobCard;
    items: InvoiceItem[];
}

interface Totals {
    subtotal: number;
    discount: number;
    advance: number;
    grand_total: number;
    remaining: number;
}

interface Props {
    invoice: Invoice;
    totals: Totals;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Invoices', href: '/dashboard/invoice' },
    { title: 'View', href: '' },
];

export default function View({ invoice, totals }: Props) {
    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
            paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Invoice - ${invoice.invoice_no}`} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('dashboard.invoice.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Invoices
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Invoice: {invoice.invoice_no}
                            </h1>
                            <p className="text-sm text-gray-600">
                                Issued on {formatDate(invoice.invoice_date)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {getStatusBadge(invoice.status)}
                        <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Customer Info */}
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
                                            {invoice.customer.title} {invoice.customer.name}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Mobile</label>
                                        <p className="text-lg font-semibold flex items-center gap-1">
                                            <Phone className="h-4 w-4" />
                                            {invoice.customer.mobile}
                                        </p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium text-gray-500">Address</label>
                                        <p className="text-lg font-semibold flex items-start gap-1">
                                            <MapPin className="h-4 w-4 mt-1" />
                                            {invoice.customer.address}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Related Job Card */}
                        {invoice.job_card && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Job Card Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Job Card No:</span>
                                        <span className="font-medium">{invoice.job_card.job_card_no}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Created By:</span>
                                        <span className="font-medium">{invoice.job_card.user.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Date:</span>
                                        <span className="font-medium flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(invoice.job_card.date)}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Invoice Items */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Invoice Items</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Qty</TableHead>
                                            <TableHead>Unit Price</TableHead>
                                            <TableHead>Discount</TableHead>
                                            <TableHead className="text-right">Line Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invoice.items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>{item.description}</TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                                                <TableCell>
                                                    {item.discount_value
                                                        ? `${item.discount_value}${item.discount_type === 'percent' ? '%' : ' LKR'}`
                                                        : '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(item.line_total)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Remarks */}
                        {invoice.remarks && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Remarks</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-700 whitespace-pre-wrap">{invoice.remarks}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right column - Totals */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Invoice Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Invoice No:</span>
                                    <span className="font-medium">{invoice.invoice_no}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Invoice Date:</span>
                                    <span className="font-medium">{formatDate(invoice.invoice_date)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Due Date:</span>
                                    <span className="font-medium">{formatDate(invoice.due_date)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Status:</span>
                                    {getStatusBadge(invoice.status)}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Cost Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Subtotal:</span>
                                    <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Discount:</span>
                                    <span className="font-medium">-{formatCurrency(totals.discount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Advance Payment:</span>
                                    <span className="font-medium">-{formatCurrency(totals.advance)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between text-lg font-semibold">
                                    <span>Grand Total:</span>
                                    <span className="text-green-600">{formatCurrency(totals.grand_total)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-semibold">
                                    <span>Remaining:</span>
                                    <span className="text-red-600">{formatCurrency(totals.remaining)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
