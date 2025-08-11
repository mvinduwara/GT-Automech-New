import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, PageProps } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
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

export default function View({ purchaseOrder }: PageProps<{ purchaseOrder: PurchaseOrder }>) {
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
        items: purchaseOrder.purchase_order_items.map(item => ({
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
            put(route('dashboard.purchase-order.update', { purchaseOrder_id: purchaseOrder.id }), {
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={purchaseOrder.name} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Purchase Order: {purchaseOrder.name}</CardTitle>
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
                                    {data.items.map(item => {
                                        const originalItem = purchaseOrder.purchase_order_items.find(
                                            original => original.id === item.id
                                        );
                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell>{originalItem?.stock?.product?.name}</TableCell>
                                                <TableCell>{originalItem?.stock?.product?.part_number}</TableCell>
                                                <TableCell>{originalItem?.quantity}</TableCell>
                                                <TableCell className="text-center">
                                                    <Switch
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
