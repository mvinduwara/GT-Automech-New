import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
} from '@/components/ui/pagination';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PaginatedResource } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { Phone, Search, Star, MessageSquare } from 'lucide-react';
import { useState } from 'react';

// --- Types ---
interface Customer {
    id: number;
    name: string;
    mobile: string;
}

interface Vehicle {
    id: number;
    vehicle_no: string;
}

interface JobCard {
    id: number;
    vehicle: Vehicle;
}

interface Invoice {
    id: number;
    invoice_no: string;
    invoice_date: string;
    status: string;
    manual_rating: number | null;
    manual_feedback: string | null;
    customer: Customer;
    job_card: JobCard;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Customer Reviews', href: route('dashboard.reviews.index') },
    { title: 'Feedback Calls', href: route('dashboard.reviews.calls') },
];

// --- Feedback Dialog Component ---
function FeedbackDialog({ invoice }: { invoice: Invoice }) {
    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        manual_rating: invoice.manual_rating || 0,
        manual_feedback: invoice.manual_feedback || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('dashboard.reviews.manual.store', invoice.id), {
            onSuccess: () => setOpen(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={invoice.manual_rating ? "secondary" : "default"} size="sm">
                    {invoice.manual_rating ? (
                        <>
                            <Star className="mr-2 h-3 w-3 fill-current" />
                            Edit Review
                        </>
                    ) : (
                        <>
                            <Phone className="mr-2 h-4 w-4" />
                            Log Call
                        </>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Customer Feedback</DialogTitle>
                        <DialogDescription>
                            Log feedback for Invoice #{invoice.invoice_no} ({invoice.customer.name})
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Star Rating Input */}
                        <div className="flex flex-col gap-2">
                            <Label>Rate Experience</Label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="focus:outline-none"
                                        onClick={() => setData('manual_rating', star)}
                                    >
                                        <Star
                                            className={`h-8 w-8 transition-colors ${star <= data.manual_rating
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-300'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            {errors.manual_rating && (
                                <span className="text-xs text-red-500">{errors.manual_rating}</span>
                            )}
                        </div>

                        {/* Feedback Text Input */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="feedback">Comments (Optional)</Label>
                            <Textarea
                                id="feedback"
                                placeholder="Customer mentioned..."
                                value={data.manual_feedback}
                                onChange={(e) => setData('manual_feedback', e.target.value)}
                            />
                            {errors.manual_feedback && (
                                <span className="text-xs text-red-500">{errors.manual_feedback}</span>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save Feedback'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// --- Main Page Component ---
export default function CallList({
    invoices,
    filters,
}: {
    invoices: PaginatedResource<Invoice>;
    filters: { search?: string, filter?: string };
}) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = () => {
        router.get(
            route('dashboard.reviews.calls'),
            { search },
            { preserveState: true }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Feedback Call List" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Pending Feedback Calls</CardTitle>
                            <p className="text-sm text-gray-500 mt-1">
                                Call customers to collect post-service feedback.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {/* Simple Toggle Filter */}
                            <Button
                                variant={filters.filter === 'completed' ? 'default' : 'outline'}
                                onClick={() => router.get(route('dashboard.reviews.calls'), { filter: filters.filter === 'completed' ? '' : 'completed' })}
                            >
                                {filters.filter === 'completed' ? 'Show Pending' : 'Show Completed'}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Search Bar */}
                        <div className="mb-4 flex gap-2">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Search invoice, customer or vehicle..."
                                    className="pl-8"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                            <Button onClick={handleSearch}>Search</Button>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto rounded-lg border shadow-sm">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Invoice</TableHead>
                                        <TableHead>Customer Info</TableHead>
                                        <TableHead>Vehicle</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Manual Review</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoices.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center">
                                                No invoices found needing calls.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        invoices.data.map((invoice) => (
                                            <TableRow key={invoice.id}>
                                                <TableCell className="whitespace-nowrap">
                                                    {format(new Date(invoice.invoice_date), 'yyyy-MM-dd')}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {invoice.invoice_no}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {invoice.customer.name}
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <Phone className="mr-1 h-3 w-3" />
                                                        {invoice.customer.mobile}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {invoice.job_card.vehicle?.vehicle_no}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="capitalize">
                                                        {invoice.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {invoice.manual_rating ? (
                                                        <div className="flex items-center gap-1">
                                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                            <span className="font-bold">{invoice.manual_rating}/5</span>
                                                            {invoice.manual_feedback && (
                                                                <MessageSquare className="ml-2 h-4 w-4 text-gray-400" />
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic">Pending</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <FeedbackDialog invoice={invoice} />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {invoices.last_page > 1 && (
                            <div className="mt-4">
                                <Pagination>
                                    <PaginationContent>
                                        {invoices.links.map((link, index) => (
                                            <PaginationItem key={index}>
                                                <PaginationLink
                                                    href={link.url || '#'}
                                                    isActive={link.active}
                                                    onClick={(e) => {
                                                        if (!link.url) e.preventDefault();
                                                    }}
                                                    disabled={!link.url}
                                                >
                                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}