import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Printer } from 'lucide-react';

interface GrnItem {
    id: number;
    purchase_order_item_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    remarks: string | null;
    purchase_order_item: {
        stock: {
            product: {
                name: string;
                part_number: string;
            };
        };
    };
}

interface Grn {
    id: number;
    grn_no: string;
    date: string;
    supplier: {
        name: string;
        email: string;
        mobile: string;
    };
    purchase_order: {
        name: string;
    };
    status: string;
    remarks: string | null;
    grn_items: GrnItem[];
}

interface Props {
    grn: Grn;
}

export default function View({ grn }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'GRN',
            href: '/dashboard/grn',
        },
        {
            title: grn.grn_no,
            href: '#',
        },
    ];

    const totalAmount = grn.grn_items.reduce((acc, item) => acc + item.total_price, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`GRN ${grn.grn_no}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>GRN: {grn.grn_no}</CardTitle>
                        <div className="flex gap-2">
                            <a href={`/dashboard/grn/${grn.id}/print`} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" className="gap-2">
                                    <Printer className="h-4 w-4" />
                                    Print / Download
                                </Button>
                            </a>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold text-lg">Details</h3>
                                <div className="grid grid-cols-3 gap-2 text-sm mt-2">
                                    <span className="font-medium text-gray-500">Date:</span>
                                    <span className="col-span-2">{grn.date}</span>

                                    <span className="font-medium text-gray-500">PO Reference:</span>
                                    <span className="col-span-2">{grn.purchase_order?.name || 'N/A'}</span>

                                    <span className="font-medium text-gray-500">Status:</span>
                                    <span className="col-span-2 capitalize">{grn.status}</span>

                                    <span className="font-medium text-gray-500">Remarks:</span>
                                    <span className="col-span-2">{grn.remarks || '-'}</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Supplier</h3>
                                <div className="grid grid-cols-3 gap-2 text-sm mt-2">
                                    <span className="font-medium text-gray-500">Name:</span>
                                    <span className="col-span-2">{grn.supplier?.name}</span>

                                    <span className="font-medium text-gray-500">Email:</span>
                                    <span className="col-span-2">{grn.supplier?.email || '-'}</span>

                                    <span className="font-medium text-gray-500">Phone:</span>
                                    <span className="col-span-2">{grn.supplier?.mobile || '-'}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-4">Items</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Part Number</TableHead>
                                        <TableHead className="text-right">Quantity</TableHead>
                                        <TableHead className="text-right">Unit Price (LKR)</TableHead>
                                        <TableHead className="text-right">Total (LKR)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {grn.grn_items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.purchase_order_item?.stock?.product?.name || 'Unknown'}</TableCell>
                                            <TableCell>{item.purchase_order_item?.stock?.product?.part_number || 'N/A'}</TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                            <TableCell className="text-right">{item.unit_price.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">{item.total_price.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-right font-bold">Total Amount</TableCell>
                                        <TableCell className="text-right font-bold">LKR {totalAmount.toFixed(2)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
