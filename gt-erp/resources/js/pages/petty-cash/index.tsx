import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { TrashIcon, UserPen } from 'lucide-react';

const pettyCash = [
    {
        pettycash_id: 'PT001',
        paymentStatus: 'Paid',
        totalAmount: '$250.00',
        paymentMethod: 'Credit Card',
    },
    {
        pettycash_id: 'PT002',
        paymentStatus: 'Pending',
        totalAmount: '$150.00',
        paymentMethod: 'PayPal',
    },
    {
        pettycash_id: 'PT003',
        paymentStatus: 'Unpaid',
        totalAmount: '$350.00',
        paymentMethod: 'Bank Transfer',
    },
    {
        pettycash_id: 'PT004',
        paymentStatus: 'Paid',
        totalAmount: '$450.00',
        paymentMethod: 'Credit Card',
    },
    {
        pettycash_id: 'PT005',
        paymentStatus: 'Paid',
        totalAmount: '$550.00',
        paymentMethod: 'PayPal',
    },
    {
        pettycash_id: 'PT006',
        paymentStatus: 'Pending',
        totalAmount: '$200.00',
        paymentMethod: 'Bank Transfer',
    },
    {
        pettycash_id: 'PT007',
        paymentStatus: 'Unpaid',
        totalAmount: '$300.00',
        paymentMethod: 'Credit Card',
    },
];

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Petty Cash',
        href: '/dashboard/petty-cash',
    },
];

export default function Index() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Petty Cash" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="h1 font-bold">All Petty Cash</h1>
                    <Link href={route('dashboard.petty-cash.create')}>
                        <Button>Add New PettyCash Record</Button>
                    </Link>
                </div>

                <div className="flex h-full flex-1 flex-col overflow-y-auto">
                    <Table className="w-full table-fixed">
                        <TableCaption>A list of your recent stocks.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Stock</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {pettyCash.map((pettyCash) => (
                                <TableRow key={pettyCash.pettycash_id}>
                                    <TableCell className="font-medium">{pettyCash.pettycash_id}</TableCell>
                                    <TableCell>{pettyCash.paymentStatus}</TableCell>
                                    <TableCell>{pettyCash.paymentMethod}</TableCell>
                                    <TableCell>{pettyCash.totalAmount}</TableCell>
                                    <TableCell className="pr-0">
                                        <div className="flex items-center justify-center space-x-2">
                                            <Link href={route('dashboard.petty-cash.edit', { pettycash_id: pettyCash.pettycash_id })}>
                                                <Button variant={'ghost'} className="flex items-center justify-center p-2 text-neutral-800">
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
