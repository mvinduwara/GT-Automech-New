import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
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
import { TrashIcon, PencilIcon } from 'lucide-react';
import { BreadcrumbItem } from '@/types';
import { PageProps } from '@inertiajs/inertia';
import { format } from 'date-fns';
import AppLayout from '@/layouts/app-layout';

interface Invoice {
    id: number;
    invoice_no: string;
    customer: { name: string } | null;
    job_card: { job_card_no: string } | null;
    total: number;
    status: string;
    invoice_date: string;
    due_date: string;
}

interface FilterOption {
    value: string;
    label: string;
}

interface Props extends PageProps {
    invoices: {
        data: Invoice[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    filters: {
        search: string;
        status: string;
        date_from: string;
        date_to: string;
    };
    statusOptions: FilterOption[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Invoice',
        href: '/dashboard/invoice',
    },
];

export default function Index() {
    const { invoices, filters, statusOptions } = usePage<Props>().props;
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status);
    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo, setDateTo] = useState(filters.date_to);

    const handleApplyFilters = () => {
        // Use Inertia's router to preserve state
        window.location.href = route('dashboard.invoice.index', {
            search,
            status,
            date_from: dateFrom,
            date_to: dateTo,
        });
    };

    const handleClearFilters = () => {
        setSearch('');
        setStatus('');
        setDateFrom('');
        setDateTo('');
        window.location.href = route('dashboard.invoice.index');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Invoices" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">All Invoices</h1>
                    {/* <Link href={route('dashboard.invoice.create')}>
                        <Button>Add New Invoice</Button>
                    </Link> */}
                </div>

                {/* Filters Section */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Input
                        placeholder="Search by invoice number..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full"
                    />
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value != "" ? option.value : "0"}>
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
                                <TableHead>Invoice Date</TableHead>
                                <TableHead>Due Date</TableHead>
                                {/* <TableHead className="text-center">Actions</TableHead> */}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.data.map((invoice) => (
                                <TableRow key={invoice.id}>

                                    <TableCell className='hover:underline'>
                                        <Link href={route('dashboard.invoice.view', { invoice_id: invoice.id })}>{invoice.invoice_no}</Link>
                                    </TableCell>
                                    <TableCell>{invoice.customer?.name || 'N/A'}</TableCell>
                                    <TableCell>{invoice.job_card?.job_card_no || 'N/A'}</TableCell>
                                    <TableCell>{invoice.total}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`rounded px-2 py-1 text-xs ${invoice.status === 'paid'
                                                ? 'bg-green-100 text-green-800'
                                                : invoice.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(invoice.invoice_date), 'MMM dd, yyyy')}
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
                                    </TableCell>
                                    {/* <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Link href={route('dashboard.invoice.edit', { invoice_id: invoice.id })}>
                                                <Button variant="ghost" size="icon">
                                                    <PencilIcon className="h-4 w-4" />
                                                </Button>
                                            </Link> 
                                            <Button variant="ghost" size="icon" className="text-red-600">
                                                <TrashIcon className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell> */}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                    <div>
                        Showing {invoices.data.length} of {invoices.total} invoices
                    </div>
                    <div className="flex gap-2">
                        {invoices.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url}
                                className={`px-3 py-1 rounded ${link.active
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}