import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { pettyCash } from '@/types/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Tooltip } from '@radix-ui/react-tooltip';
import { ShieldQuestion, TrashIcon, UserPen, X, Wallet, ArrowUpCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Petty Cash',
        href: '/dashboard/petty-cash',
    },
];

export default function Index({ petty_cash, imprest_summary }: { 
    petty_cash: pettyCash[], 
    imprest_summary: { limit: number, current_balance: number, shortfall: number } 
}) {
    console.log('petty_cash', petty_cash);
    const { delete: destroy, processing } = useForm();
    const [selectedVoucher, setSelectedVoucher] = useState<pettyCash | null>(null);
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [isPaidDialogOpen, setIsPaidDialogOpen] = useState(false);

    const { auth } = usePage<any>().props;
    console.log('auth', auth);

    const handleDelete = (voucherNumber: string) => {
        if (confirm('Are you sure you want to delete this Petty Cash Voucher? This action cannot be undone.')) {
            destroy(route('dashboard.petty-cash.destroy', voucherNumber), {
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

    const handleToggleChecked = async (itemId: number, newChecked: boolean) => {
        try {
            router.patch(
                route('dashboard.petty-cash.item.update-checked', { item: itemId }),
                { checked: newChecked },
                {
                    onSuccess: () => {
                        toast.success(`Item ${newChecked ? 'checked' : 'unchecked'} successfully`);
                    },
                    onError: (errors) => {
                        console.error('Update failed:', errors);
                        toast.error('Failed to update checked status');
                    },
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        } catch (error) {
            console.error('Toggle error:', error);
            toast.error('Failed to update checked status');
        }
    };

    // Admin approve/reject handlers
    const handleApprove = (voucherNumber: string) => {
        router.patch(
            route('dashboard.petty-cash.approve', voucherNumber),
            {},
            {
                onSuccess: () => {
                    toast.success('Voucher approved successfully!');
                    setIsApproveDialogOpen(false);
                },
                onError: (errors) => {
                    console.error('Approval failed:', errors);
                    toast.error(errors?.error || 'Failed to approve voucher');
                },
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleReject = (voucherNumber: string) => {
        router.patch(
            route('dashboard.petty-cash.reject', voucherNumber),
            {},
            {
                onSuccess: () => {
                    toast.success('Voucher rejected successfully!');
                    setIsApproveDialogOpen(false);
                },
                onError: (errors) => {
                    console.error('Rejection failed:', errors);
                    toast.error(errors?.error || 'Failed to reject voucher');
                },
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // Service Manager pending/paid handlers
    const handleSetPending = (voucherNumber: string) => {
        router.patch(
            route('dashboard.petty-cash.set-pending', voucherNumber),
            {},
            {
                onSuccess: () => {
                    toast.success('Voucher status changed to pending!');
                    setIsPaidDialogOpen(false);
                },
                onError: (errors) => {
                    console.error('Status change failed:', errors);
                    toast.error(errors?.error || 'Failed to change status to pending');
                },
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleSetPaid = (voucherNumber: string) => {
        router.patch(
            route('dashboard.petty-cash.set-paid', voucherNumber),
            {},
            {
                onSuccess: () => {
                    toast.success('Voucher marked as paid!');
                    setIsPaidDialogOpen(false);
                },
                onError: (errors) => {
                    console.error('Status change failed:', errors);
                    toast.error(errors?.error || 'Failed to mark as paid');
                },
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Petty Cash" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-full">
                            <Wallet className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Current Balance</p>
                            <h2 className="text-xl font-bold">LKR {imprest_summary.current_balance.toLocaleString()}</h2>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-full">
                            <ShieldQuestion className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Target Imprest</p>
                            <h2 className="text-xl font-bold">LKR {imprest_summary.limit.toLocaleString()}</h2>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4 justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${imprest_summary.shortfall > 0 ? 'bg-orange-100' : 'bg-green-100'}`}>
                                <ArrowUpCircle className={`h-6 w-6 ${imprest_summary.shortfall > 0 ? 'text-orange-600' : 'text-green-600'}`} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Shortfall</p>
                                <h2 className="text-xl font-bold">LKR {imprest_summary.shortfall.toLocaleString()}</h2>
                            </div>
                        </div>
                        {imprest_summary.shortfall > 0 && (
                            <Button 
                                onClick={() => router.post(route('dashboard.petty-cash.replenish'))}
                                className="bg-orange-600 hover:bg-orange-700"
                            >
                                Replenish
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <h1 className="h1 font-bold">All Petty Cash Vouchers</h1>
                    <div className="flex items-center justify-end gap-2">
                        <Link href={route('dashboard.reports.petty_cash_daily')}>
                            <Button variant={'secondary'}>Reports</Button>
                        </Link>
                        <Link href={route('dashboard.petty-cash.create')}>
                            <Button>Add New PettyCash Voucher</Button>
                        </Link>
                    </div>
                </div>

                <div className="flex h-full flex-1 flex-col overflow-y-auto">
                    <Table className="w-full table-fixed">
                        <TableCaption>A list of your recent petty cash vouchers.</TableCaption>
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
                                    <TableCell align="right">{petty_cash.status === 'pending' || petty_cash.status === 'approved' || (petty_cash.status === 'paid' && !petty_cash.finalized_at) ? petty_cash.requested_amount : petty_cash.actual_amount || petty_cash.total_amount}</TableCell>
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
                                            {petty_cash.finalized_at && petty_cash.status === 'paid' ? 'Finalized' : petty_cash.status}
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
                                    <TableCell className="pr-0">
                                        <div className="flex items-center justify-center space-x-2">
                                            <Link href={route('dashboard.petty-cash.show', { voucher_number: petty_cash.voucher_number })}>
                                                <Button variant="outline" size="sm">View</Button>
                                            </Link>

                                            <a href={route('dashboard.petty-cash.download-pdf', { voucher_number: petty_cash.voucher_number })} target="_blank" rel="noreferrer">
                                                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                                                    PDF
                                                </Button>
                                            </a>

                                            {petty_cash.status === 'paid' && !petty_cash.finalized_at && (
                                                <Link href={route('dashboard.petty-cash.show', { voucher_number: petty_cash.voucher_number })}>
                                                    <Button className="bg-orange-600 hover:bg-orange-700" size="sm">
                                                        Finalize
                                                    </Button>
                                                </Link>
                                            )}

                                            {(auth?.user?.role === 'admin' || auth?.user?.role === 'cashier') && petty_cash.status === 'pending' && (
                                                <AlertDialog
                                                    open={isApproveDialogOpen && selectedVoucher?.voucher_number === petty_cash.voucher_number}
                                                    onOpenChange={setIsApproveDialogOpen}
                                                >
                                                    <div onClick={() => setSelectedVoucher(petty_cash)}>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                Approve/Reject
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                    </div>
                                                    <AlertDialogContent>
                                                        <AlertDialogCancel className="ml-auto">
                                                            <X />
                                                        </AlertDialogCancel>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Approve or Reject Petty Cash Voucher ?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                <div className="space-y-2 text-sm text-foreground">
                                                                    <p><strong>Voucher Number:</strong> {selectedVoucher?.voucher_number}</p>
                                                                    <p><strong>Payee Name:</strong> {selectedVoucher?.name}</p>
                                                                    <p><strong>Requested Amount:</strong> LKR {selectedVoucher?.requested_amount ? parseFloat(selectedVoucher.requested_amount.toString()).toLocaleString() : 'N/A'}</p>
                                                                    <p><strong>Date:</strong> {selectedVoucher?.date ? new Date(selectedVoucher.date).toLocaleDateString() : 'N/A'}</p>
                                                                    <p><strong>Requested By:</strong> {selectedVoucher?.requested_by?.name || 'N/A'}</p>
                                                                </div>
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <Button
                                                                variant="ghost"
                                                                onClick={() => selectedVoucher && handleApprove(selectedVoucher.voucher_number)}
                                                                disabled={processing}
                                                            >
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                className="bg-red-600 hover:bg-red-700 text-white"
                                                                onClick={() => selectedVoucher && handleReject(selectedVoucher.voucher_number)}
                                                                disabled={processing}
                                                            >
                                                                Reject
                                                            </Button>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}

                                            {(auth?.user?.role === 'admin' || auth?.user?.role === 'cashier' || auth?.user?.role === 'service-manager') && petty_cash.status === 'approved' && (
                                                <AlertDialog
                                                    open={isPaidDialogOpen && selectedVoucher?.voucher_number === petty_cash.voucher_number}
                                                    onOpenChange={setIsPaidDialogOpen}
                                                >
                                                    <div onClick={() => setSelectedVoucher(petty_cash)}>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                Pending/Paid
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                    </div>
                                                    <AlertDialogContent>
                                                        <AlertDialogCancel className="ml-auto">
                                                            <X />
                                                        </AlertDialogCancel>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Status Change to Pending or Paid ?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                <div className="space-y-2 text-sm text-foreground">
                                                                    <p><strong>Voucher Number:</strong> {selectedVoucher?.voucher_number}</p>
                                                                    <p><strong>Payee Name:</strong> {selectedVoucher?.name}</p>
                                                                    <p><strong>Requested Amount:</strong> LKR {selectedVoucher?.requested_amount ? parseFloat(selectedVoucher.requested_amount.toString()).toLocaleString() : 'N/A'}</p>
                                                                    <p><strong>Date:</strong> {selectedVoucher?.date ? new Date(selectedVoucher.date).toLocaleDateString() : 'N/A'}</p>
                                                                    <p><strong>Requested By:</strong> {selectedVoucher?.requested_by?.name || 'N/A'}</p>
                                                                    <p><strong>Approved By:</strong> {selectedVoucher?.approved_by?.name || 'N/A'}</p>
                                                                </div>
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <Button
                                                                variant="ghost"
                                                                onClick={() =>
                                                                    selectedVoucher && handleSetPending(selectedVoucher.voucher_number)
                                                                }
                                                                disabled={processing}
                                                            >
                                                                Set Pending
                                                            </Button>
                                                            <Button
                                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                                                onClick={() => selectedVoucher && handleSetPaid(selectedVoucher.voucher_number)}
                                                                disabled={processing}
                                                            >
                                                                Mark as Paid
                                                            </Button>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}
                                            
                                            {auth?.user?.role === 'admin' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDelete(petty_cash.voucher_number)}
                                                    disabled={processing}
                                                    title="Delete Voucher"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}