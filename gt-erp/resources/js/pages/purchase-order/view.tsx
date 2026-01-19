import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Link, Printer } from "lucide-react";
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type PurchaseOrderItem = {
    id: number;
    purchase_order_id: number;
    stock_id: number;
    quantity: number;
    is_approved: number;
    created_at: string;
    updated_at: string;
    stock: {
        product: {
            name: string;
            part_number: string;
        }
    }
};

type PurchaseOrder = {
    id: number;
    name: string;
    date: string;
    status: 'pending' | 'checked' | 'requested' | 'completed';
    purchase_order_items: PurchaseOrderItem[];
};

export default function View({ purchaseOrder }: { purchaseOrder: PurchaseOrder }) {
    const { auth } = usePage().props as any;
    const userRole = auth?.user?.role;
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Purchase Orders',
            href: route('dashboard.purchase-order.index'),
        },
        {
            title: purchaseOrder.name,
            href: '#',
        },
    ];

    const { data, setData, put, processing } = useForm({
        items: purchaseOrder.purchase_order_items.map((item: PurchaseOrderItem) => ({
            id: item.id,
            is_approved: item.is_approved,
        })),
    });

    const [allItemsReviewed, setAllItemsReviewed] = useState(false);

    useEffect(() => {
        // Check if all items have been reviewed (is_approved is not null or default)
        const allReviewed = data.items.every(item => item.is_approved === 0 || item.is_approved === 1);
        setAllItemsReviewed(allReviewed);
    }, [data.items]);

    const handleApprovalChange = (itemId: number, isApproved: boolean) => {
        setData('items', data.items.map(item =>
            item.id === itemId
                ? { ...item, is_approved: isApproved ? 1 : 0 }
                : item
        ));
    };

    const handleFinish = () => {
        if (allItemsReviewed) {
            put(route('dashboard.purchase-order.item.update', { purchaseOrder_id: purchaseOrder.id }), {
                onSuccess: () => {
                    toast.success('Purchase order status updated to checked.');
                    router.visit(route('dashboard.purchase-order.index'));
                },
                onError: (errors) => {
                    toast.error('Failed to update purchase order.');
                    console.error(errors);
                }
            });
        }
    };

    const handleRequested = () => {
        put(route('dashboard.purchase-order.item.update.requested', { purchaseOrder_id: purchaseOrder.id }), {
            onSuccess: () => {
                toast.success('Purchase order requested.');
            },
            onError: (errors) => {
                toast.error('Failed to request purchase order.');
                console.error(errors);
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={purchaseOrder.name} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <Card>
                    <CardHeader>
                        <div className='flex items-center justify-between'>
                            <CardTitle className='w-full'>Purchase Order: {purchaseOrder.name}</CardTitle>
                            {purchaseOrder.status != 'requested' && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button disabled={purchaseOrder.status != 'checked'} variant={'outline'} className='text-red-800'>Request</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Request purchase order</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to request this purchase order?
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleRequested}>Continue</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                            {purchaseOrder.status === 'requested' && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant={'secondary'} className='bg-yellow-200 hover:bg-yellow-400'>Create GRN</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Create GRN</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to Create GRN for this purchase order?
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel >Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => { router.visit(`/dashboard/grn/create/${purchaseOrder.id}`) }}>
                                                Create
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>)}

                            <a href={`/dashboard/purchase-order/${purchaseOrder.id}/print`} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" className="gap-2 ml-2">
                                    <Printer className="h-4 w-4" />
                                    Print
                                </Button>
                            </a>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p><strong>Date:</strong> {purchaseOrder.date}</p>
                        <p><strong>Status:</strong> {purchaseOrder.status.charAt(0).toUpperCase() + purchaseOrder.status.slice(1)}</p>

                        <div className="mt-6 overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Part Number</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead className="text-center">Approved</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.items.map((item: any) => {
                                        const originalItem = purchaseOrder.purchase_order_items.find(
                                            (original: PurchaseOrderItem) => original.id === item.id
                                        );
                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell>{originalItem?.stock?.product?.name}</TableCell>
                                                <TableCell>{originalItem?.stock?.product?.part_number}</TableCell>
                                                <TableCell>{originalItem?.quantity}</TableCell>
                                                <TableCell className="text-center">
                                                    <Switch
                                                        disabled={processing || purchaseOrder.status === 'checked'}
                                                        checked={!!item.is_approved}
                                                        onCheckedChange={(checked) => handleApprovalChange(item.id, checked)}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <Button
                                onClick={handleFinish}
                                disabled={!allItemsReviewed || processing}
                            >
                                Finish Review
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
