import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, PageProps, PaginatedResource } from '@/types';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { Star } from 'lucide-react';

// --- Define Types ---

// A minimal Customer type
interface Customer {
    id: number;
    name: string;
    mobile: string;
}

// A minimal Vehicle type
interface Vehicle {
    id: number;
    vehicle_no: string;
}

// A minimal Invoice type
interface Invoice {
    id: number;
    invoice_no: string;
    customer: Customer;
}

// A minimal JobCard type
interface JobCard {
    id: number;
    job_card_no: string;
    vehicle: Vehicle;
}

// The main Review type
interface Review {
    id: number;
    rating: number; // 1-5
    suggestions: string | null;
    created_at: string;
    invoice: Invoice;
    job_card: JobCard;
}

// --- Helper Component ---

// A simple component to display the star rating
const StarRating = ({ rating }: { rating: number }) => {
    return (
        <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={
                        rating >= star
                            ? 'h-5 w-5 text-yellow-400 fill-yellow-400'
                            : 'h-5 w-5 text-gray-300'
                    }
                />
            ))}
        </div>
    );
};

// --- Main Page Component ---

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Customer Reviews', href: route('dashboard.reviews.index') },
];

export default function Index({
    reviews,
}: PageProps<{ reviews: PaginatedResource<Review> }>) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Reviews" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Reviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-lg border shadow-sm">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Vehicle No.</TableHead>
                                        <TableHead>Rating</TableHead>
                                        <TableHead>Suggestions</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reviews.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="py-4 text-center text-gray-500"
                                            >
                                                No reviews found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        reviews.data.map((review) => (
                                            <TableRow key={review.id}>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {review.invoice.customer
                                                            ?.name ?? 'N/A'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {review.invoice.customer
                                                            ?.mobile ?? ''}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {review.job_card.vehicle
                                                        ?.vehicle_no ?? 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    <StarRating
                                                        rating={review.rating}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <p className="w-full max-w-xs truncate">
                                                        {review.suggestions ||
                                                            '-'}
                                                    </p>
                                                </TableCell>
                                                <TableCell>
                                                    {format(
                                                        new Date(
                                                            review.created_at
                                                        ),
                                                        'yyyy-MM-dd'
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {reviews.last_page > 1 && (
                    <Pagination>
                        <PaginationContent>
                            {reviews.links.map((link, index) => (
                                <PaginationItem key={index}>
                                    <PaginationLink
                                        href={link.url || '#'}
                                        isActive={link.active}
                                        onClick={(e) => {
                                            if (!link.url) {
                                                e.preventDefault();
                                            } else {
                                                router.get(link.url, {}, {
                                                    preserveScroll: true,
                                                    preserveState: true,
                                                });
                                            }
                                        }}
                                        disabled={!link.url}
                                    >
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                        </PaginationContent>
                    </Pagination>
                )}
            </div>
        </AppLayout>
    );
}