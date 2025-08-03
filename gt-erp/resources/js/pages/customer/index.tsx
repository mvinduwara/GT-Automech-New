import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Trash2, UserPen, PlusIcon } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Customer',
        href: '/dashboard/customer',
    },
    {
        title: 'Customer List',
        href: '/dashboard/customer',
    },
];

interface Customer {
    id: number;
    title: string | null;
    name: string;
    mobile: string;
    address: string;
}

interface CustomerIndexPageProps {
    customers: {
        data: Customer[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    filters: {
        search: string | null;
    };
}

export default function Index() {
    const { props, flash } = usePage<CustomerIndexPageProps & { flash: { success?: string; error?: string } }>();
    const { customers, filters } = props;

    // Use useForm for search functionality
    const { data, setData, get } = useForm({
        search: filters.search || '',
    });

    // Use useForm to get the delete method
    const { delete: destroy } = useForm();

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get(route('dashboard.customer.index'), {
            preserveState: true,
            replace: true,
        });
    };

    const handleClear = () => {
        setData('search', '');
        router.get(route('dashboard.customer.index'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.info('Filters cleared.');
                },
                onError: () => {
                    toast.error('Failed to clear filters.');
                },
            },
        );

    };

    const handleDelete = (customerId: number) => {
        if (confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
            destroy(route('dashboard.customer.destroy', { customer: customerId }), {
                onSuccess: () => {
                    toast.success('Customer deleted successfully!');
                },
                onError: (errors) => {
                    console.error('Deletion failed:', errors);
                    toast.error('Failed to delete customer.');
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customers" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">Customer List</h1>
                    <Link href={route('dashboard.customer.create')}>
                        <Button>
                            <PlusIcon className="mr-2 h-4 w-4" /> New Customer
                        </Button>
                    </Link>
                </div>
                <form onSubmit={handleSearch} className="flex items-center space-x-2">
                    <Input
                        type="text"
                        placeholder="Search by name or mobile..."
                        value={data.search}
                        onChange={(e) => setData('search', e.target.value)}
                        className="max-w-sm"
                    />
                    <Button type="submit">Apply Filter</Button>
                    <Button type="button" variant="outline" onClick={handleClear}>Clear Filter</Button>
                </form>
                <div className="rounded-md border">
                    <Table>
                        <TableCaption>A list of your recent customers.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Mobile</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customers.data.map((customer) => (
                                <TableRow key={customer.id}>
                                    <TableCell>{customer.title}</TableCell>
                                    <TableCell>{customer.name}</TableCell>
                                    <TableCell>{customer.mobile}</TableCell>
                                    <TableCell>{customer.address}</TableCell>
                                    <TableCell className="pr-0">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Link href={route('dashboard.customer.edit', { customer: customer.id })}>
                                                <Button variant={'ghost'} className="flex items-center justify-center p-2 text-neutral-800">
                                                    <UserPen className="h-5 w-5" />
                                                </Button>
                                            </Link>
                                            <Button
                                                className="flex items-center justify-center bg-red-100 p-2 text-red-800 hover:bg-red-200 hover:text-red-950"
                                                onClick={() => handleDelete(customer.id)}
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <Pagination>
                    <PaginationContent>
                        {customers.links.map((link, index) => (
                            <PaginationItem key={index}>
                                <PaginationLink
                                    href={link.url || '#'}
                                    isActive={link.active}
                                    onClick={(e) => {
                                        if (link.url) {
                                            e.preventDefault();
                                            get(link.url);
                                        }
                                    }}
                                >
                                    {link.label.replace('&laquo; Previous', 'Previous').replace('Next &raquo;', 'Next')}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                    </PaginationContent>
                </Pagination>
            </div>
            <Toaster richColors position="top-right" />
        </AppLayout>
    );
}
