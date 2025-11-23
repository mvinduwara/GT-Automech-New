import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Ensure you have this or use conditional rendering
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PaginatedResource } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { MessageSquare, Phone, Search, Star, User } from 'lucide-react';
import { useState } from 'react';

// --- Shared Types ---
interface Customer {
    id: number;
    name: string;
    mobile: string;
}

interface Vehicle {
    id: number;
    vehicle_no: string;
}

// Type for the "Calls" view (Invoice based)
interface InvoiceItem {
    id: number;
    invoice_no: string;
    invoice_date: string;
    created_at?: string;
    status: string;
    manual_rating: number | null;
    manual_feedback: string | null;
    customer: Customer;
    job_card: { id: number; vehicle: Vehicle };
}

// Type for the "Reviews" view (Review model based)
interface ReviewItem {
    id: number;
    rating: number;
    suggestions: string | null;
    created_at: string;
    invoice: {
        id: number;
        invoice_no: string;
        customer: Customer;
    };
    job_card: { id: number; vehicle: Vehicle };
}

// --- Helper Components ---

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
            <Star
                key={star}
                className={`h-4 w-4 ${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            />
        ))}
    </div>
);

function FeedbackDialog({ invoice }: { invoice: InvoiceItem }) {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        manual_rating: invoice.manual_rating || 0,
        manual_feedback: invoice.manual_feedback || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('dashboard.reviews.manual.store', invoice.id), {
            onSuccess: () => setOpen(false),
            preserveScroll: true
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={invoice.manual_rating ? "secondary" : "outline"} size="sm" className='gap-2'>
                    {invoice.manual_rating ? <Star className="h-3 w-3" /> : <Phone className="h-3 w-3" />}
                    {invoice.manual_rating ? 'Edit' : 'Log'}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Log Call Feedback</DialogTitle>
                        <DialogDescription>Invoice #{invoice.invoice_no} - {invoice.customer?.name}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-2">
                            <Label>Customer Rating</Label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setData('manual_rating', star)}
                                        className="focus:outline-none"
                                    >
                                        <Star className={`h-8 w-8 transition-colors ${star <= data.manual_rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Comments</Label>
                            <Textarea
                                value={data.manual_feedback}
                                onChange={(e) => setData('manual_feedback', e.target.value)}
                                placeholder="What did the customer say?"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={processing}>Save Feedback</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// --- Main Page ---

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Reviews & Calls', href: route('dashboard.reviews.index') },
];

export default function Index({
    listData,
    filters,
    currentView
}: {
    listData: PaginatedResource<any>; // Can be InvoiceItem or ReviewItem
    filters: { search?: string, filter?: string };
    currentView: 'reviews' | 'calls';
}) {
    const [search, setSearch] = useState(filters.search || '');

    // Function to handle tab switching
    const handleTabChange = (value: string) => {
        setSearch(''); // Clear search when switching context
        router.get(route('dashboard.reviews.index'), { view: value }, { preserveState: true });
    };

    // Function to handle search
    const handleSearch = () => {
        router.get(
            route('dashboard.reviews.index'),
            { view: currentView, search, filter: filters.filter },
            { preserveState: true }
        );
    };

    // Toggle filter for calls (Pending vs Completed)
    const toggleCallFilter = () => {
        const newFilter = filters.filter === 'completed' ? '' : 'completed';
        router.get(
            route('dashboard.reviews.index'),
            { view: 'calls', search, filter: newFilter },
            { preserveState: true }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reviews Management" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Tabs value={currentView} onValueChange={handleTabChange} className="w-full">
                    <div className="flex items-center justify-between mb-4">
                        <TabsList>
                            <TabsTrigger value="reviews" className="flex gap-2">
                                <Star className="h-4 w-4" />
                                Online Reviews
                            </TabsTrigger>
                            <TabsTrigger value="calls" className="flex gap-2">
                                <Phone className="h-4 w-4" />
                                Call List
                            </TabsTrigger>
                        </TabsList>

                        {currentView === 'calls' && (
                            <Button
                                variant={filters.filter === 'completed' ? 'default' : 'outline'}
                                size="sm"
                                onClick={toggleCallFilter}
                            >
                                {filters.filter === 'completed' ? 'Show Pending Calls' : 'Show Completed Calls'}
                            </Button>
                        )}
                    </div>

                    <Card>
                        <CardHeader className='pb-3'>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>
                                        {currentView === 'reviews' ? 'Customer Reviews' : 'Feedback Call List'}
                                    </CardTitle>
                                    <CardDescription>
                                        {currentView === 'reviews'
                                            ? 'Reviews submitted by customers via the online link.'
                                            : 'Manage manual feedback calls for completed invoices.'}
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2 w-full max-w-sm">
                                    <Input
                                        placeholder="Search..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <Button variant="secondary" onClick={handleSearch}><Search className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>

                            {/* --- CONTENT FOR ONLINE REVIEWS --- */}
                            <TabsContent value="reviews" className="m-0">
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Customer</TableHead>
                                                <TableHead>Vehicle</TableHead>
                                                <TableHead>Rating</TableHead>
                                                <TableHead>Feedback</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {(listData.data as ReviewItem[]).length === 0 ? (
                                                <TableRow><TableCell colSpan={5} className="text-center h-24 text-gray-500">No reviews found.</TableCell></TableRow>
                                            ) : (
                                                (listData.data as ReviewItem[]).map((review) => (
                                                    <TableRow key={review.id}>
                                                        <TableCell>
                                                            {review.created_at ? (<>{
                                                            format(
                                                                new Date(
                                                                    review.created_at
                                                                ),
                                                                'yyyy-MM-dd'
                                                            )}</>) : ""
                                                        }
                                                        </TableCell>
                                                        {/* <TableCell>
                                                            {format(
                                                                new Date(
                                                                    review.created_at
                                                                ),
                                                                'yyyy-MM-dd'
                                                            )}
                                                        </TableCell> */}
                                                        {/* <TableCell className="whitespace-nowrap">{format(new Date(review.created_at), 'yyyy-MM-dd')}</TableCell> */}
                                                        <TableCell>
                                                            <div className="font-medium">
                                                                {review.invoice?.customer
                                                                    ?.name ?? 'N/A'}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {review.invoice?.customer
                                                                    ?.mobile ?? ''}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{review.job_card.vehicle?.vehicle_no}</TableCell>
                                                        <TableCell><StarRating rating={review.rating} /></TableCell>
                                                        <TableCell className="max-w-md truncate text-sm" title={review.suggestions || ''}>
                                                            {review.suggestions || <span className="text-gray-400 italic">No comments</span>}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </TabsContent>

                            {/* --- CONTENT FOR CALL LIST --- */}
                            <TabsContent value="calls" className="m-0">
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Invoice</TableHead>
                                                <TableHead>Customer</TableHead>
                                                <TableHead>Vehicle</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Admin Log</TableHead>
                                                <TableHead className="text-right">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {(listData.data as InvoiceItem[]).length === 0 ? (
                                                <TableRow><TableCell colSpan={7} className="text-center h-24 text-gray-500">No invoices needing calls found.</TableCell></TableRow>
                                            ) : (
                                                (listData.data as InvoiceItem[]).map((invoice) => (
                                                    <TableRow key={invoice.id}>
                                                        <TableCell>
                                                            {invoice.created_at ? (<>{
                                                            format(
                                                                new Date(
                                                                    invoice.created_at
                                                                ),
                                                                'yyyy-MM-dd'
                                                            )}</>) : ""
                                                        }
                                                        </TableCell>
                                                        <TableCell className="font-mono text-xs">{invoice.invoice_no}</TableCell>
                                                        <TableCell>
                                                            <div className="font-medium">{invoice?.customer?.name}</div>
                                                            <div className="flex items-center text-xs text-gray-500 gap-1">
                                                                <Phone className="h-3 w-3" /> {invoice?.customer?.mobile}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{invoice.job_card.vehicle?.vehicle_no}</TableCell>
                                                        <TableCell><Badge variant="outline" className="capitalize text-xs">{invoice.status}</Badge></TableCell>
                                                        <TableCell>
                                                            {invoice.manual_rating ? (
                                                                <div className="flex items-center gap-2">
                                                                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200 gap-1">
                                                                        <Star className="h-3 w-3 fill-yellow-700 text-yellow-700" />
                                                                        {invoice.manual_rating}/5
                                                                    </Badge>
                                                                    {invoice.manual_feedback && <MessageSquare className="h-4 w-4 text-gray-400" />}
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400 text-xs italic">Pending</span>
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
                            </TabsContent>

                            {/* --- PAGINATION (Shared) --- */}
                            {listData.last_page > 1 && (
                                <div className="mt-4">
                                    <Pagination>
                                        <PaginationContent>
                                            {listData.links.map((link, index) => (
                                                <PaginationItem key={index}>
                                                    <PaginationLink
                                                        href={link.url || '#'}
                                                        isActive={link.active}
                                                        onClick={(e) => {
                                                            if (!link.url) e.preventDefault();
                                                            // Inertia handles preservation automatically via the href
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
                </Tabs>
            </div>
        </AppLayout>
    );
}