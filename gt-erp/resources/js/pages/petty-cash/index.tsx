import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { pettyCash } from '@/types/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { TrashIcon, UserPen } from 'lucide-react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Petty Cash',
        href: '/dashboard/petty-cash',
    },
];

export default function Index({ petty_cash }: { petty_cash: pettyCash[] }) {
    const { delete: destroy, processing } = useForm(); // Get the delete method from useForm

    const handleDelete = (voucherNumber: string) => {
        if (confirm('Are you sure you want to delete this Petty Cash Voucher? This action cannot be undone.')) {
            destroy(route('dashboard.petty_cash.destroy', voucherNumber), {
                onSuccess: () => {
                    toast.success('Petty Cash Voucher deleted successfully!');
                },
                onError: (formErrors) => {
                    console.error('Deletion failed:', formErrors);
                    toast.error('Failed to delete petty cash record.');
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Petty Cash" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="h1 font-bold">All Petty Cash Vouchers</h1>
                    <Link href={route('dashboard.petty-cash.create')}>
                        <Button>Add New PettyCash Voucher</Button>
                    </Link>
                </div>

                <div className="flex h-full flex-1 flex-col overflow-y-auto">
                    <Table className="w-full table-fixed">
                        <TableCaption>A list of your recent stocks.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Voucher Number</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Requested By</TableHead>
                                <TableHead>Accepted By</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {petty_cash.map((petty_cash) => (
                                <TableRow>
                                    <TableCell className="font-medium">{petty_cash.voucher_number}</TableCell>
                                    <TableCell>{new Date(petty_cash.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{petty_cash.total_amount}</TableCell>
                                    <TableCell>{petty_cash.status}</TableCell>
                                    <TableCell>{petty_cash.requestedBy?.name || 'N/A'}</TableCell>
                                    <TableCell>{petty_cash.approvedBy?.name || 'N/A'}</TableCell>

                                    <TableCell className="pr-0">
                                        <div className="flex items-center justify-center space-x-2">
                                            <Link href={route('dashboard.petty-cash.edit', { voucher_number: petty_cash.voucher_number })}>
                                                <Button variant="ghost" className="flex items-center justify-center p-2 text-neutral-800">
                                                    <UserPen className="h-5 w-5" />
                                                </Button>
                                            </Link>

                                            <Button className="flex items-center justify-center bg-red-100 p-2 text-red-800 hover:bg-red-200 hover:text-red-950">
                                                <TrashIcon className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>

                        {/* <TableFooter>
                            <TableRow>
                                <TableCell colSpan={4}>Total</TableCell>
                                <TableCell>$2,500.00</TableCell>
                            </TableRow>
                        </TableFooter> */}
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
