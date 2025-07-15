import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { TrashIcon, UserPen } from 'lucide-react';

const invoices = [
    {
        invoiceId: 'INV001',
        paymentStatus: 'Paid',
        totalAmount: '$250.00',
        paymentMethod: 'Credit Card',
    },
    {
        invoiceId: 'INV002',
        paymentStatus: 'Pending',
        totalAmount: '$150.00',
        paymentMethod: 'PayPal',
    },
    {
        invoiceId: 'INV003',
        paymentStatus: 'Unpaid',
        totalAmount: '$350.00',
        paymentMethod: 'Bank Transfer',
    },
    {
        invoiceId: 'INV004',
        paymentStatus: 'Paid',
        totalAmount: '$450.00',
        paymentMethod: 'Credit Card',
    },
    {
        invoiceId: 'INV005',
        paymentStatus: 'Paid',
        totalAmount: '$550.00',
        paymentMethod: 'PayPal',
    },
    {
        invoiceId: 'INV006',
        paymentStatus: 'Pending',
        totalAmount: '$200.00',
        paymentMethod: 'Bank Transfer',
    },
    {
        invoiceId: 'INV007',
        paymentStatus: 'Unpaid',
        totalAmount: '$300.00',
        paymentMethod: 'Credit Card',
    },
];

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Invoice',
        href: '/dashboard/invoice',
    },
];

export default function Index() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Invoice" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="h1 font-bold">All Invoices</h1>
                    <Link href={route('dashboard.invoice.create')}>
                        <Button>Add New Invoice</Button>
                    </Link>
                </div>

                <div className="flex h-full flex-1 flex-col overflow-y-auto">
                    <Table className="w-full table-fixed">
                        <TableCaption>A list of your recent stocks.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice ID</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {invoices.map((invoices) => (
                                <TableRow key={invoices.invoiceId}>
                                    <TableCell className="font-medium">{invoices.invoiceId}</TableCell>
                                    <TableCell>{invoices.paymentStatus}</TableCell>
                                    <TableCell>{invoices.paymentMethod}</TableCell>
                                    <TableCell>{invoices.totalAmount}</TableCell>
                                    <TableCell className="pr-0">
                                        <div className="flex items-center justify-center space-x-2">
                                            <Link href={route('dashboard.invoice.edit', { invoice_id: invoices.invoiceId })}>
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
