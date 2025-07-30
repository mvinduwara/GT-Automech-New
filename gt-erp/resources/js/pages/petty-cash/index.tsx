import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { pettyCash } from '@/types/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Tooltip } from '@radix-ui/react-tooltip';
import { BadgeCheck, TrashIcon, UserPen } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Petty Cash',
        href: '/dashboard/petty-cash',
    },
];

export default function Index({ petty_cash }: { petty_cash: pettyCash[] }) {
    console.log('petty_cash', petty_cash);
    const { delete: destroy, processing } = useForm(); // Get the delete method from useForm
    const [selectedVoucher, setSelectedVoucher] = useState<pettyCash | null>(null);

    const { auth } = usePage().props;
    console.log('auth', auth);

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
                    {auth?.user?.role === 'cashier' && (
                        <Link href={route('dashboard.petty-cash.create')}>
                            <Button>Add New PettyCash Voucher</Button>
                        </Link>
                    )}
                </div>

                <div className="flex h-full flex-1 flex-col overflow-y-auto">
                    <Table className="w-full table-fixed">
                        <TableCaption>A list of your recent stocks.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Voucher Number</TableHead>
                                <TableHead className="w-12">Date</TableHead>
                                <TableHead className="text-end">Amount</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead>Requested By</TableHead>
                                <TableHead>Accepted By</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {petty_cash.map((petty_cash: pettyCash, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{petty_cash.voucher_number}</TableCell>
                                    <TableCell>{new Date(petty_cash.date).toLocaleDateString()}</TableCell>
                                    <TableCell align="right">{petty_cash.total_amount}</TableCell>
                                    <TableCell align="center">
                                        <Badge
                                            variant={
                                                petty_cash.status === 'approved'
                                                    ? 'secondary'
                                                    : petty_cash.status === 'paid'
                                                      ? 'default'
                                                      : petty_cash.status === 'rejected'
                                                        ? 'destructive'
                                                        : 'outline'
                                            }
                                        >
                                            {petty_cash.status}
                                        </Badge>
                                    </TableCell>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <TableCell className="cursor-pointer">{petty_cash.requested_by?.name?.split(' ')[0] || 'N/A'}</TableCell>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p> {petty_cash.requested_by?.name || 'N/A'}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <TableCell className="cursor-pointer">{petty_cash.approved_by?.name?.split(' ')[0] || 'N/A'}</TableCell>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p> {petty_cash.approved_by?.name || 'N/A'}</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    {/* <TableCell>{petty_cash.approved_by?.name || 'N/A'}</TableCell> */}

                                    <TableCell className="pr-0">
                                        <div className="flex items-center justify-center space-x-2">
                                            {auth?.user?.role === 'cashier' && (
                                                <Link href={route('dashboard.petty-cash.edit', { voucher_number: petty_cash.voucher_number })}>
                                                    <Button variant="ghost" className="flex items-center justify-center p-2 text-neutral-800">
                                                        <UserPen className="h-5 w-5" />
                                                    </Button>
                                                </Link>
                                            )}
                                            {auth?.user?.role === 'cashier' && (
                                                <Button className="flex items-center justify-center bg-red-100 p-2 text-red-800 hover:bg-red-200 hover:text-red-950">
                                                    <TrashIcon className="h-5 w-5" />
                                                </Button>
                                            )}

                                            {auth?.user?.role === 'admin' && (
                                                <AlertDialog>
                                                    <div onClick={() => setSelectedVoucher(petty_cash)}>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="outline">
                                                                <BadgeCheck />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                    </div>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Approve or Reject Petty Cash Voucher ?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                <div className="space-y-2">
                                                                    <p>
                                                                        <strong>Voucher Number:</strong> {selectedVoucher?.voucher_number}
                                                                    </p>
                                                                    <p>
                                                                        <strong>Date:</strong>{' '}
                                                                        {selectedVoucher?.date
                                                                            ? new Date(selectedVoucher.date).toLocaleDateString()
                                                                            : 'N/A'}
                                                                    </p>
                                                                    <p>
                                                                        <strong>Total Amount:</strong> {selectedVoucher?.total_amount || 'N/A'}
                                                                    </p>
                                                                    <p>
                                                                        <strong>Requested By:</strong> {selectedVoucher?.requested_by?.name || 'N/A'}
                                                                    </p>
                                                                    <p>
                                                                        <strong>Approved By:</strong> {selectedVoucher?.approved_by?.name || 'N/A'}
                                                                    </p>
                                                                </div>
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <Button variant="default">Approve</Button>
                                                            <Button variant="destructive">Reject</Button>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}

                                            {auth?.user?.role === 'service-manager' && (
                                                <AlertDialog>
                                                    <div onClick={() => setSelectedVoucher(petty_cash)}>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="outline">
                                                                <BadgeCheck />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                    </div>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Status Change to Pending or Paid ?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                <div className="space-y-2">
                                                                    <p>
                                                                        <strong>Voucher Number:</strong> {selectedVoucher?.voucher_number}
                                                                    </p>
                                                                    <p>
                                                                        <strong>Date:</strong>{' '}
                                                                        {selectedVoucher?.date
                                                                            ? new Date(selectedVoucher.date).toLocaleDateString()
                                                                            : 'N/A'}
                                                                    </p>
                                                                    <p>
                                                                        <strong>Total Amount:</strong> {selectedVoucher?.total_amount || 'N/A'}
                                                                    </p>
                                                                    <p>
                                                                        <strong>Requested By:</strong> {selectedVoucher?.requested_by?.name || 'N/A'}
                                                                    </p>
                                                                    <p>
                                                                        <strong>Approved By:</strong> {selectedVoucher?.approved_by?.name || 'N/A'}
                                                                    </p>
                                                                </div>
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <Button variant="default">Pending</Button>
                                                            <Button variant="destructive">Paid</Button>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}
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
