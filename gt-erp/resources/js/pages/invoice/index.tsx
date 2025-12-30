import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Banknote, CreditCard, Globe, ScrollText, TriangleAlert, Wallet } from 'lucide-react';

interface Invoice {
    id: number;
    invoice_no: string;
    customer: { name: string } | null;
    job_card: { job_card_no: string } | null;
    total: number;
    status: string;
    payment_method: string;
    invoice_date: string;
    due_date: string | null;
}

interface DailyStats {
    total: number;
    cash: number;
    card: number;
    online: number;
    cheque: number;
    credit: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface FilterOption {
    value: string;
    label: string;
}

interface Props {
    invoices: {
        data: Invoice[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
        from: number | null;
        to: number | null;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
        date_from?: string;
        date_to?: string;
    };
    statusOptions?: FilterOption[];
    dailyStats: DailyStats;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Invoice',
        href: '/dashboard/invoice',
    },
];

// Default status options if backend doesn't provide them
const defaultStatusOptions: FilterOption[] = [
    { value: '', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'unpaid', label: 'Unpaid' },
    { value: 'partial', label: 'Partially Paid' },
    { value: 'paid', label: 'Paid' },
    { value: 'cancelled', label: 'Cancelled' },
];

export default function Index({ invoices, filters = {}, statusOptions,dailyStats }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    // Use provided statusOptions or fallback to defaults
    const availableStatusOptions = statusOptions || defaultStatusOptions;

    const handleApplyFilters = () => {
        router.get(
            route('dashboard.invoice.index'),
            {
                search: search || undefined,
                status: status || undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleClearFilters = () => {
        setSearch('');
        setStatus('');
        setDateFrom('');
        setDateTo('');
        router.get(
            route('dashboard.invoice.index'),
            {},
            {
                preserveState: false,
            }
        );
    };

    const getStatusBadgeClass = (status: string) => {
        const statusLower = status.toLowerCase();
        switch (statusLower) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'partial':
                return 'bg-blue-100 text-blue-800';
            case 'unpaid':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'draft':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentMethodBadgeClass = (paymentMethod: string) => {
        const paymentMethodLower = paymentMethod.toLowerCase();
        switch (paymentMethodLower) {
            case 'cash':
                return 'bg-gray-50 text-gray-800';
            case 'card':
                return 'bg-purple-50 text-purple-800';
            case 'online':
                return 'bg-blue-50 text-blue-800';
            case 'cheque':
                return 'bg-yellow-50 text-yellow-800';
            case 'credit':
                return 'bg-red-50 text-red-800';
            default:
                return 'bg-gray-50 text-gray-800';
        }
    };
    const formatCurrency = (amount: number) => {
        return `Rs. ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Invoices" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">All Invoices</h1>
                </div>

                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
                    <Card className="bg-primary text-primary-foreground">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Collected
                            </CardTitle>
                            <Wallet className="h-4 w-4 text-primary-foreground/70" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(dailyStats.total)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Cash
                            </CardTitle>
                            <Banknote className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{formatCurrency(dailyStats.cash)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Card
                            </CardTitle>
                            <CreditCard className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{formatCurrency(dailyStats.card)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Online
                            </CardTitle>
                            <Globe className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{formatCurrency(dailyStats.online)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-red-600">
                                Credit
                            </CardTitle>
                            <TriangleAlert className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{formatCurrency(dailyStats.credit)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Cheque
                            </CardTitle>
                            <ScrollText className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{formatCurrency(dailyStats.cheque)}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters Section */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Input
                        placeholder="Search by invoice number..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleApplyFilters();
                            }
                        }}
                        className="w-full"
                    />
                    <Select 
                        value={status || 'all'} 
                        onValueChange={(value) => setStatus(value === 'all' ? '' : value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableStatusOptions.map((option) => (
                                <SelectItem 
                                    key={option.value || 'all'} 
                                    value={option.value || 'all'}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input
                        type="date"
                        placeholder="From date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                    />
                    <Input
                        type="date"
                        placeholder="To date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                    />
                </div>

                <div className="flex gap-2">
                    <Button onClick={handleApplyFilters}>Apply Filters</Button>
                    <Button variant="outline" onClick={handleClearFilters}>
                        Clear Filters
                    </Button>
                </div>

                {/* Invoices Table */}
                <div className="flex-1 overflow-auto rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice No</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Job Card</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Invoice Date</TableHead>
                                <TableHead>Due Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.data.length > 0 ? (
                                invoices.data.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell className='hover:underline'>
                                            <a  target='_blank'
                                                href={route('dashboard.invoice.show', invoice.id)}
                                            >
                                                {invoice.invoice_no}
                                            </a>
                                        </TableCell>
                                        <TableCell>{invoice.customer?.name || 'N/A'}</TableCell>
                                        <TableCell>{invoice.job_card?.job_card_no || 'N/A'}</TableCell>
                                        <TableCell>Rs. {Number(invoice.total).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`rounded px-2 py-1 text-xs ${getStatusBadgeClass(invoice.status)}`}
                                            >
                                                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                            </span>
                                        </TableCell>
                                        <TableCell className=''>
                                            <span
                                                className={`rounded mx-auto px-2 py-1 text-xs ${getPaymentMethodBadgeClass(invoice.payment_method)}`}
                                            >
                                                {invoice.payment_method.charAt(0).toUpperCase() + invoice.payment_method.slice(1)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(invoice.invoice_date), 'MMM dd, yyyy')}
                                        </TableCell>
                                        <TableCell>
                                            {invoice.due_date 
                                                ? format(new Date(invoice.due_date), 'MMM dd, yyyy')
                                                : 'N/A'
                                            }
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                        No invoices found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {invoices.data.length > 0 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing {invoices.from || 0} to {invoices.to || 0} of {invoices.total} invoices
                        </div>
                        <div className="flex gap-2">
                            {invoices.links.map((link, index) => {
                                if (!link.url) {
                                    return (
                                        <span
                                            key={index}
                                            className="px-3 py-1 rounded bg-gray-100 text-gray-400 cursor-not-allowed"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                }

                                return (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        preserveState
                                        preserveScroll
                                        className={`px-3 py-1 rounded ${
                                            link.active
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}