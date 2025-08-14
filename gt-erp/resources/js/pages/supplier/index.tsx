import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Supplier } from '@/types/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { UserPen } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Suppliers',
        href: '/dashboard/supplier',
    },
];

export default function Index({ suppliers, filters }: { suppliers: Supplier[]; filters: { search?: string; status?: string } }) {
    const { delete: destroy, processing } = useForm();
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleDelete = (supplierId: number) => {
        if (confirm('Are you sure you want to delete this supplier?')) {
            destroy(route('dashboard.supplier.destroy', supplierId), {
                onSuccess: () => {
                    toast.success('Supplier deleted successfully!');
                },
                onError: () => {
                    toast.error('Failed to delete supplier.');
                },
            });
        }
    };

    const handleSearch = () => {
        router.get(route('dashboard.supplier.index'), { search, status }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Suppliers" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="h1 font-bold">All Suppliers</h1>
                    {auth?.user?.role !== 'viewer' && (
                        <Link href={route('dashboard.supplier.create')}>
                            <Button>Add New Supplier</Button>
                        </Link>
                    )}
                </div>

                {/* Search and Filters */}
                <div className="flex flex-wrap gap-3">
                    <input
                        type="text"
                        placeholder="Search by name, email, or mobile"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-64 rounded border px-3 py-2"
                    />
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded border px-3 py-2">
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="deactive">Deactive</option>
                    </select>
                    <Button variant="outline" onClick={handleSearch}>
                        Filter
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <Table className="w-full table-fixed">
                        <TableCaption>List of all suppliers</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[18%]">Name</TableHead>
                                <TableHead className="w-[28%]">Email</TableHead> {/* widened */}
                                <TableHead className="w-[18%]">Mobile</TableHead>
                                <TableHead className="w-[18%]">Register Date</TableHead>
                                <TableHead className="w-[10%]">Status</TableHead> {/* narrowed */}
                                <TableHead className="w-[8%] text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {suppliers.data.length > 0 ? (
                                suppliers.data.map((supplier) => (
                                    <TableRow key={supplier.id}>
                                        <TableCell>{supplier.name}</TableCell>
                                        <TableCell>{supplier.email || 'N/A'}</TableCell>
                                        <TableCell>{supplier.mobile || 'N/A'}</TableCell>
                                        <TableCell>
                                            {supplier.register_date ? new Date(supplier.register_date).toLocaleDateString() : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={supplier.status === 'active' ? 'secondary' : 'destructive'}>{supplier.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-center gap-2">
                                                {auth?.user?.role !== 'viewer' && (
                                                    <Link href={route('dashboard.supplier.edit', supplier.id)}>
                                                        <Button variant="ghost" className="p-2 text-neutral-800">
                                                            <UserPen className="h-5 w-5" />
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-4 text-center text-neutral-500">
                                        No suppliers found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    <div className="mt-4 flex justify-center gap-2">
                        {suppliers.links?.map((link, index) => (
                            <Button
                                key={index}
                                variant={link.active ? 'default' : 'outline'}
                                disabled={!link.url}
                                onClick={() => {
                                    if (link.url) router.get(link.url, {}, { preserveState: true });
                                }}
                            >
                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
