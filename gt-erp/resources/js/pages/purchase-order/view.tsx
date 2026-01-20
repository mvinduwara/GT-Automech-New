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
import { Badge } from '@/components/ui/badge';
import { Separator } from "@/components/ui/separator";

type Product = {
    name: string;
    part_number: string;
}

type PurchaseOrderItem = {
    id: number;
    purchase_order_id: number;
    product_id: number;
    quantity: number;
    is_approved: number;
    created_at: string;
    updated_at: string;
    product: Product;
    // stock: { product: Product } // Legacy support if needed, but we should focus on product
};

type Supplier = {
    id: number;
    name: string;
    mobile: string;
    email: string;
}

type PurchaseOrder = {
    id: number;
    name: string;
    date: string;
    status: 'pending' | 'checked' | 'requested' | 'completed';
    purchase_order_items: PurchaseOrderItem[];
    supplier_id: number | null;
    supplier?: Supplier;
    notes: string | null;
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
                        <div className='flex flex-wrap items-center justify-between gap-4'>
                            <div>
                                <CardTitle className='text-2xl'>Purchase Order: {purchaseOrder.name}</CardTitle>
                                <div className="mt-2 text-sm text-muted-foreground flex items-center gap-4">
                                    <Badge variant="outline">{purchaseOrder.status.toUpperCase()}</Badge>
                                    <span>{purchaseOrder.date}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
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
                                    <Button variant="outline" className="gap-2">
                                        <Printer className="h-4 w-4" />
                                        Print
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Supplier Details</h3>
                                {purchaseOrder.supplier ? (
                                    <div className="text-sm space-y-1">
                                        <p><span className="font-medium">Name:</span> {purchaseOrder.supplier.name}</p>
                                        <p><span className="font-medium">Mobile:</span> {purchaseOrder.supplier.mobile}</p>
                                        <p><span className="font-medium">Email:</span> {purchaseOrder.supplier.email}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No supplier selected.</p>
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Notes</h3>
                                <p className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded-md min-h-[50px]">
                                    {purchaseOrder.notes ?? 'No notes provided.'}
                                </p>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h3 className="font-semibold text-lg mb-4">Items</h3>
                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product Name</TableHead>
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
                                            // Handle both direct product and nested stock.product (legacy)
                                            const product = originalItem?.product || (originalItem as any)?.stock?.product;

                                            return (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">{product?.name || 'Unknown'}</TableCell>
                                                    <TableCell>{product?.part_number || 'N/A'}</TableCell>
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
                        </div>

                        <div className="flex justify-end">
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
