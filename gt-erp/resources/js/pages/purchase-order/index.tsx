import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink
} from '@/components/ui/pagination';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
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

import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, PageProps, PaginatedResource } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon, Filter, List, Pencil, RefreshCcw, UserRoundSearch } from 'lucide-react';
import { FormEvent, useState } from 'react';

type PurchaseOrder = {
    id: number;
    name: string;
    date: string;
    status: 'pending' | 'checked' | 'requested' | 'completed';
    purchase_order_items_count: number;
    created_at: string;
    updated_at: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Purchase Orders',
        href: '/dashboard/purchase-order',
    },
];

export default function Index({ purchaseOrders, filters }: PageProps<{
    purchaseOrders: PaginatedResource<PurchaseOrder>;
    filters: Record<string, string | number>;
}>) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? 'all');
    const [dateFrom, setDateFrom] = useState<Date | undefined>(filters.date_from ? new Date(filters.date_from) : undefined);
    const [dateTo, setDateTo] = useState<Date | undefined>(filters.date_to ? new Date(filters.date_to) : undefined);
    const [perPage, setPerPage] = useState(filters.per_page ?? 10);

    const { auth } = usePage().props;
    const userRole = auth?.user?.role;

    const applyFilters = (e: FormEvent) => {
        e.preventDefault();
        router.get(route('dashboard.purchase-order.index'), {
            search,
            status,
            date_from: dateFrom ? format(dateFrom, 'yyyy-MM-dd') : undefined,
            date_to: dateTo ? format(dateTo, 'yyyy-MM-dd') : undefined,
            per_page: perPage
        }, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('all');
        setDateFrom(undefined);
        setDateTo(undefined);
        setPerPage(10);
        router.get(route('dashboard.purchase-order.index'));
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'pending':
                return 'yellow';
            case 'checked':
                return 'blue';
            case 'requested':
                return 'purple';
            case 'completed':
                return 'green';
            default:
                return 'default';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Purchase Orders" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <Card>
                    <CardHeader>
                        <div className='flex justify-between items-start'>
                            <div className='flex flex-col justify-start items-start gap-2'>
                                <CardTitle>Purchase Orders</CardTitle>
                                <CardDescription>
                                    A list of all purchase orders.
                                </CardDescription>
                            </div>
                            {(userRole === "cashier" || userRole === "admin") && (
                                <Button asChild>
                                    <Link href='/dashboard/purchase-order/create'>Create</Link>
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={applyFilters} className="flex flex-col md:flex-row gap-4 mb-4 items-end">
                            <Input
                                placeholder="Search by name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full md:w-auto"
                            />
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Filter by Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Status</SelectLabel>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="checked">Checked</SelectItem>
                                        <SelectItem value="requested">Requested</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={'outline'}
                                        className={cn(
                                            "w-full md:w-[280px] justify-start text-left font-normal",
                                            !dateFrom && !dateTo && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateFrom && dateTo ? (
                                            `${format(dateFrom, "PPP")} - ${format(dateTo, "PPP")}`
                                        ) : (
                                            <span>Filter by Date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateFrom}
                                        selected={{ from: dateFrom, to: dateTo }}
                                        onSelect={(range) => {
                                            setDateFrom(range?.from);
                                            setDateTo(range?.to);
                                        }}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>

                            <Button type="submit" className="w-full md:w-auto">
                                <Filter className="h-4 w-4 mr-2" /> Apply Filters
                            </Button>
                            <Button type="button" onClick={clearFilters} variant="outline" className="w-full md:w-auto">
                                <RefreshCcw className="h-4 w-4 mr-2" /> Clear
                            </Button>
                        </form>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order Name</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Items Count</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {purchaseOrders.data.length > 0 ? (
                                        purchaseOrders.data.map((purchaseOrder) => (
                                            <TableRow key={purchaseOrder.id}>
                                                <TableCell>{purchaseOrder.name}</TableCell>
                                                <TableCell>{purchaseOrder.date}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={getStatusBadgeVariant(purchaseOrder.status)}
                                                    >
                                                        {purchaseOrder.status.charAt(0).toUpperCase() + purchaseOrder.status.slice(1)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{purchaseOrder.purchase_order_items_count}</TableCell>
                                                <TableCell className="text-right flex items-center justify-end gap-2">
                                                    {(userRole === "admin" || userRole === "service-manager") && (
                                                        <Link href={route('dashboard.purchase-order.view', { purchaseOrder_id: purchaseOrder.id })}>
                                                            <Button variant={'ghost'} size={'sm'}>
                                                                View
                                                            </Button>
                                                        </Link>
                                                    )}
                                                        <Link href={`/dashboard/purchase-order/${purchaseOrder.id}/edit`}>
                                                            <Button variant={'ghost'} size={'sm'}>
                                                                <Pencil className="h-5 w-5" />
                                                            </Button>
                                                        </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center">
                                                No purchase orders found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Pagination className="mx-auto">
                            <PaginationContent>
                                {purchaseOrders.links.map((link, index) => (
                                    <PaginationItem key={index}>
                                        <PaginationLink
                                            href={link.url ?? '#'}
                                            isActive={link.active}
                                            disabled={!link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    </PaginationItem>
                                ))}
                            </PaginationContent>
                        </Pagination>
                    </CardFooter>
                </Card>
            </div>
        </AppLayout>
    );
}
