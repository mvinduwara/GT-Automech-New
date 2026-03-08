import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { pettyCash } from '@/types/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Download, FileText, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface FinalizeItem {
    item_description: string;
    quantity: number;
    unit_price: number;
    amount: number;
}

export default function Show({ voucher }: { voucher: pettyCash }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Petty Cash', href: '/dashboard/petty-cash' },
        { title: `Voucher ${voucher.voucher_number}`, href: route('dashboard.petty-cash.show', voucher.voucher_number) },
    ];

    const { data, setData, post, processing, errors, reset } = useForm<any>({
        items: [
            { item_description: '', quantity: 1, unit_price: 0, amount: 0 }
        ],
        proof: null,
    });

    const [isFinalizing, setIsFinalizing] = useState(false);

    const handleItemChange = (index: number, field: keyof FinalizeItem, value: any) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
            newItems[index].amount = newItems[index].quantity * newItems[index].unit_price;
        }
        setData('items', newItems);
    };

    const addItem = () => {
        setData('items', [...data.items, { item_description: '', quantity: 1, unit_price: 0, amount: 0 }]);
    };

    const removeItem = (index: number) => {
        if (data.items.length > 1) {
            setData('items', data.items.filter((_, i) => i !== index));
        }
    };

    const handleFinalize = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('dashboard.petty-cash.finalize', voucher.voucher_number), {
            onSuccess: () => {
                toast.success('Voucher finalized successfully!');
                setIsFinalizing(false);
                reset();
            },
            onError: (err) => {
                console.error(err);
                toast.error('Failed to finalize voucher.');
            }
        });
    };

    const totalActualAmount = data.items.reduce((sum, item) => sum + item.amount, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Petty Cash Voucher - ${voucher.voucher_number}`} />

            <div className="p-6 space-y-6 max-w-5xl">
                <div className="flex items-center justify-between">
                    <Link href={route('dashboard.petty-cash.index')}>
                        <Button variant="ghost" className="gap-2">
                            <ArrowLeft className="w-4 h-4" /> Back to List
                        </Button>
                    </Link>
                    <div className="flex gap-2">
                        <a href={route('dashboard.petty-cash.download-pdf', voucher.voucher_number)} target="_blank" rel="noreferrer">
                            <Button variant="outline" className="gap-2">
                                <Download className="w-4 h-4" /> Download PDF
                            </Button>
                        </a>

                        {/* Status Transitions */}
                        {voucher.status === 'pending' && (
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => router.patch(route('dashboard.petty-cash.approve', voucher.voucher_number))}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    Approve
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => router.patch(route('dashboard.petty-cash.reject', voucher.voucher_number))}
                                >
                                    Reject
                                </Button>
                            </div>
                        )}

                        {voucher.status === 'approved' && (
                            <Button
                                onClick={() => router.patch(route('dashboard.petty-cash.set-paid', voucher.voucher_number))}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Mark as Paid
                            </Button>
                        )}

                        {voucher.status === 'paid' && !voucher.finalized_at && !isFinalizing && (
                            <Button onClick={() => setIsFinalizing(true)} className="bg-orange-600 hover:bg-orange-700">
                                Finalize Voucher
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-2xl">Voucher Details</CardTitle>
                                    <CardDescription>{voucher.voucher_number}</CardDescription>
                                </div>
                                <Badge variant={voucher.status === 'paid' ? 'default' : 'outline'}>
                                    {voucher.finalized_at ? 'FINALIZED' : voucher.status.toUpperCase()}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Date</Label>
                                    <p className="font-medium">{new Date(voucher.date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Payee</Label>
                                    <p className="font-medium">{voucher.name}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Requested Amount</Label>
                                    <p className="font-medium text-lg">LKR {parseFloat(voucher.requested_amount.toString()).toLocaleString()}</p>
                                </div>
                                {voucher.finalized_at && (
                                    <>
                                        <div>
                                            <Label className="text-muted-foreground">Actual Spent</Label>
                                            <p className="font-medium text-lg text-blue-600">LKR {parseFloat(voucher.actual_amount?.toString() || '0').toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Balance</Label>
                                            <p className="font-medium text-lg text-green-600">LKR {parseFloat(voucher.balance_amount?.toString() || '0').toLocaleString()}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="pt-2">
                                <Label className="text-muted-foreground">Description</Label>
                                <p className="mt-1">{voucher.description || 'No description provided.'}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Staff Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div>
                                <Label className="text-muted-foreground">Requested By</Label>
                                <p className="font-medium">{voucher.requested_by?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Approved By</Label>
                                <p className="font-medium">{voucher.approved_by?.name || 'Waiting for Approval'}</p>
                            </div>
                            {voucher.finalized_at && (
                                <div>
                                    <Label className="text-muted-foreground">Finalized At</Label>
                                    <p className="font-medium">{new Date(voucher.finalized_at).toLocaleString()}</p>
                                </div>
                            )}
                            {voucher.proof_path && (
                                <div className="pt-2">
                                    <Label className="text-muted-foreground">Proof of Purchase</Label>
                                    <div className="mt-2">
                                        <a
                                            href={`/storage/${voucher.proof_path}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-2 text-blue-600 hover:underline"
                                        >
                                            <FileText className="w-4 h-4" /> View Receipt/Bill
                                        </a>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Finalized Items OR Finalization Form */}
                {voucher.items && voucher.items.length > 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Expenditure Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Qty</TableHead>
                                        <TableHead className="text-right">Unit Price</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {voucher.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.item_description}</TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                            <TableCell className="text-right">{parseFloat(item.unit_price.toString()).toFixed(2)}</TableCell>
                                            <TableCell className="text-right font-semibold">{parseFloat(item.amount.toString()).toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="bg-muted/50 font-bold">
                                        <TableCell colSpan={3} className="text-right">Total Spent</TableCell>
                                        <TableCell className="text-right">LKR {parseFloat(voucher.actual_amount?.toString() || '0').toFixed(2)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ) : isFinalizing ? (
                    <Card className="border-green-200">
                        <form onSubmit={handleFinalize}>
                            <CardHeader className="bg-green-50/50">
                                <CardTitle className="text-green-800">Finalize Voucher Expenses</CardTitle>
                                <CardDescription>Enter the actual items purchased and upload the bill.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold">Items Purchased</h3>
                                        <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1">
                                            <Plus className="w-4 h-4" /> Add Item
                                        </Button>
                                    </div>
                                    <div className="space-y-3">
                                        {data.items.map((item, index) => (
                                            <div key={index} className="flex gap-2 items-end">
                                                <div className="flex-1 space-y-1">
                                                    <Label className="text-xs">Description</Label>
                                                    <Input
                                                        placeholder="e.g. Sugar 500g"
                                                        value={item.item_description}
                                                        onChange={(e) => handleItemChange(index, 'item_description', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="w-20 space-y-1">
                                                    <Label className="text-xs">Qty</Label>
                                                    <Input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                        required
                                                    />
                                                </div>
                                                <div className="w-32 space-y-1">
                                                    <Label className="text-xs">Unit Price</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={item.unit_price}
                                                        onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                        required
                                                    />
                                                </div>
                                                <div className="w-32 space-y-1">
                                                    <Label className="text-xs">Amount</Label>
                                                    <Input
                                                        readOnly
                                                        value={item.amount.toFixed(2)}
                                                        className="bg-muted"
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500"
                                                    onClick={() => removeItem(index)}
                                                    disabled={data.items.length === 1}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                                    <div className="space-y-2">
                                        <Label>Proof of Purchase (Bill/Receipt)</Label>
                                        <Input
                                            type="file"
                                            onChange={(e) => setData('proof', e.target.files?.[0] || null)}
                                            accept="image/*,.pdf"
                                        />
                                        <p className="text-xs text-muted-foreground italic">Upload a photo of the bill or a PDF receipt.</p>
                                        {errors.proof && <p className="text-xs text-red-500">{errors.proof}</p>}
                                    </div>
                                    <div className="bg-muted/30 p-4 rounded-lg flex flex-col justify-center items-end">
                                        <div className="text-right space-y-1">
                                            <p className="text-sm text-muted-foreground">Total Actual Spent:</p>
                                            <p className="text-2xl font-bold">LKR {totalActualAmount.toFixed(2)}</p>
                                            <p className="text-sm text-muted-foreground">Balance to Return:</p>
                                            <p className={`font-semibold ${voucher.requested_amount - totalActualAmount < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                                LKR {(voucher.requested_amount - totalActualAmount).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-green-50/50 flex justify-end gap-3 pt-6">
                                <Button type="button" variant="ghost" onClick={() => setIsFinalizing(false)}>Cancel</Button>
                                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={processing}>
                                    {processing ? 'Saving...' : 'Confirm & Finalize'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                ) : null}
            </div>
        </AppLayout>
    );
}
