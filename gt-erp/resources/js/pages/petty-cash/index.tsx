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
import { ShieldQuestion, TrashIcon, UserPen, X } from 'lucide-react';
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
    const { delete: destroy, processing } = useForm();
    const [selectedVoucher, setSelectedVoucher] = useState<pettyCash | null>(null);
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [isPaidDialogOpen, setIsPaidDialogOpen] = useState(false);
    const [itemStatus, setItemStatus] = useState(petty_cash.items?.status);

    const { auth } = usePage().props;
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
                <div className="flex items-center justify-between">
                    <h1 className="h1 font-bold">All Petty Cash Vouchers</h1>
                    <Link href={route('dashboard.petty-cash.create')}>
                        <Button>Add New PettyCash Voucher</Button>
                    </Link>
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
                                    <TableCell className="pr-0">
                                        <div className="flex items-center justify-center space-x-2">
                                            {auth?.user?.role === 'cashier' && (
                                                <Link href={route('dashboard.petty-cash.edit', { voucher_number: petty_cash.voucher_number })}>
                                                    <Button variant="ghost" className="flex items-center justify-center p-2 text-neutral-800">
                                                        <UserPen className="h-5 w-5" />
                                                    </Button>
                                                </Link>
                                            )}

                                            {auth?.user?.role === 'admin' && (
                                                <>
                                                    <AlertDialog
                                                        open={isApproveDialogOpen && selectedVoucher?.voucher_number === petty_cash.voucher_number}
                                                        onOpenChange={setIsApproveDialogOpen}
                                                    >
                                                        <div onClick={() => setSelectedVoucher(petty_cash)}>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="outline">
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

                                                                        {selectedVoucher?.items?.length ? (
                                                                            <div className="pt-4">
                                                                                <strong>Voucher Items:</strong>
                                                                                <ul className="mt-2 space-y-3">
                                                                                    {selectedVoucher.items.map((item) => (
                                                                                        <li
                                                                                            key={item.id}
                                                                                            className="flex flex-col items-start justify-start gap-2 border-b-2 border-b-neutral-300 pb-2"
                                                                                        >
                                                                                            <p>
                                                                                                {item.item_description} - {item.quantity} × {item.unit_price} = {item.amount}
                                                                                            </p>
                                                                                            <div className="flex items-center space-x-2">
                                                                                                <Switch
                                                                                                    id={`checked-switch-${item.id}`}
                                                                                                    checked={item.checked ? true : false}
                                                                                                    onCheckedChange={(checked) =>
                                                                                                        handleToggleChecked(item.id, checked)
                                                                                                    }
                                                                                                    disabled={selectedVoucher?.status !== 'pending'}
                                                                                                />
                                                                                                <Label htmlFor={`checked-switch-${item.id}`}>
                                                                                                    Checked
                                                                                                </Label>
                                                                                            </div>
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-sm text-muted italic">No items found for this voucher.</p>
                                                                        )}
                                                                    </div>
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            {selectedVoucher?.status === 'pending' && (
                                                                <AlertDialogFooter>
                                                                    <Button
                                                                        variant="ghost"
                                                                        onClick={() => selectedVoucher && handleApprove(selectedVoucher.voucher_number)}
                                                                        disabled={processing}
                                                                    >
                                                                        Approve
                                                                    </Button>
                                                                    <Button
                                                                        className="flex items-center justify-center bg-red-100 p-2 text-red-800 hover:bg-red-200 hover:text-red-950"
                                                                        onClick={() => selectedVoucher && handleReject(selectedVoucher.voucher_number)}
                                                                        disabled={processing}
                                                                    >
                                                                        Reject
                                                                    </Button>
                                                                </AlertDialogFooter>
                                                            )}
                                                        </AlertDialogContent>
                                                    </AlertDialog>

                                                    <AlertDialog
                                                        open={isPaidDialogOpen && selectedVoucher?.voucher_number === petty_cash.voucher_number}
                                                        onOpenChange={setIsPaidDialogOpen}
                                                    >
                                                        <div onClick={() => setSelectedVoucher(petty_cash)}>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="outline">
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

                                                                        {selectedVoucher?.items?.length ? (
                                                                            <div className="pt-4">
                                                                                <strong>Voucher Items:</strong>
                                                                                <ul className="mt-2 list-inside list-disc space-y-1">
                                                                                    {selectedVoucher.items.map((item) => (
                                                                                        <li key={item.id}>
                                                                                            {item.item_description} - {item.quantity} × {item.unit_price}{' '}
                                                                                            = {item.amount}
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-sm text-muted italic">No items found for this voucher.</p>
                                                                        )}
                                                                    </div>
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            {selectedVoucher?.status === 'approved' && (
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
                                                                        onClick={() => selectedVoucher && handleSetPaid(selectedVoucher.voucher_number)}
                                                                        disabled={processing}
                                                                    >
                                                                        Mark as Paid
                                                                    </Button>
                                                                </AlertDialogFooter>
                                                            )}
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </>
                                            )}

                                            {auth?.user?.role === 'service-manager' && (
                                                <AlertDialog
                                                    open={isPaidDialogOpen && selectedVoucher?.voucher_number === petty_cash.voucher_number}
                                                    onOpenChange={setIsPaidDialogOpen}
                                                >
                                                    <div onClick={() => setSelectedVoucher(petty_cash)}>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="outline">
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

                                                                    {selectedVoucher?.items?.length ? (
                                                                        <div className="pt-4">
                                                                            <strong>Voucher Items:</strong>
                                                                            <ul className="mt-2 list-inside list-disc space-y-1">
                                                                                {selectedVoucher.items.map((item) => (
                                                                                    <li key={item.id}>
                                                                                        {item.item_description} - {item.quantity} × {item.unit_price}{' '}
                                                                                        = {item.amount}
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    ) : (
                                                                        <p className="text-sm text-muted italic">No items found for this voucher.</p>
                                                                    )}
                                                                </div>
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        {selectedVoucher?.status === 'approved' && (
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
                                                                    onClick={() => selectedVoucher && handleSetPaid(selectedVoucher.voucher_number)}
                                                                    disabled={processing}
                                                                >
                                                                    Mark as Paid
                                                                </Button>
                                                            </AlertDialogFooter>
                                                        )}
                                                    </AlertDialogContent>
                                                </AlertDialog>
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