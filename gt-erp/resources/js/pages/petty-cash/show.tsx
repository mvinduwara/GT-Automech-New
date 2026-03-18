import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { pettyCash } from '@/types/types';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Download, FileText, Plus, Trash2, Edit } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface FinalizeItem {
    item_description: string;
    quantity: number;
    unit_price: number;
    amount: number;
}

export default function Show({ voucher }: { voucher: pettyCash }) {
    const { auth } = usePage<any>().props;
    const userRole = auth.user.role;
    const isAdmin = userRole === 'admin';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Petty Cash', href: '/dashboard/petty-cash' },
        { title: `Voucher ${voucher.voucher_number}`, href: route('dashboard.petty-cash.show', voucher.voucher_number) },
    ];

    const { data, setData, post, processing, errors, reset } = useForm<any>({
        items: voucher.items?.length > 0 
            ? voucher.items.map(i => ({ 
                item_description: i.item_description, 
                quantity: i.quantity, 
                unit_price: i.unit_price, 
                amount: i.amount 
            }))
            : [{ item_description: '', quantity: 1, unit_price: 0, amount: 0 }],
        proof: null,
    });

    const [isFinalizing, setIsFinalizing] = useState(false);

    const handleItemChange = (index: number, field: keyof FinalizeItem, value: string | number) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
            newItems[index].amount = Number(newItems[index].quantity) * Number(newItems[index].unit_price);
        }
        setData('items', newItems);
    };

    const addItem = () => {
        setData('items', [...data.items, { item_description: '', quantity: 1, unit_price: 0, amount: 0 }]);
    };

    const removeItem = (index: number) => {
        if (data.items.length > 1) {
            setData('items', data.items.filter((_: any, i: number) => i !== index));
        }
    };

    const handleSubmitForReview = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('dashboard.petty-cash.submit-for-review', voucher.voucher_number), {
            onSuccess: () => {
                toast.success('Voucher submitted for review successfully!');
                setIsFinalizing(false);
                reset();
            },
            onError: (err) => {
                console.error(err);
                toast.error('Failed to submit voucher.');
            }
        });
    };

    const handleAdminFinalize = (e?: React.FormEvent | React.MouseEvent) => {
        if (e && 'preventDefault' in e) e.preventDefault();
        
        post(route('dashboard.petty-cash.finalize', voucher.voucher_number), {
            onSuccess: () => {
                toast.success('Voucher finalized successfully!');
                setIsFinalizing(false);
            },
            onError: (err) => {
                console.error(err);
                toast.error('Failed to finalize voucher. Please check item details.');
            }
        });
    };

    const totalActualAmount = data.items.reduce((sum: number, item: any) => sum + item.amount, 0);

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'finalized': return 'default'; // primary color
            case 'processed': return 'secondary';
            case 'paid': return 'outline';
            case 'rejected': return 'destructive';
            default: return 'outline';
        }
    };

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
                        {voucher.status === 'pending' && isAdmin && (
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

                        {voucher.status === 'approved' && (isAdmin || userRole === 'service-manager') && (
                            <Button
                                onClick={() => router.patch(route('dashboard.petty-cash.set-paid', voucher.voucher_number))}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Mark as Paid
                            </Button>
                        )}

                        {voucher.status === 'paid' && !isFinalizing && (
                            <Button onClick={() => setIsFinalizing(true)} className="bg-orange-600 hover:bg-orange-700">
                                {isAdmin ? 'Enter Items & Finalize' : 'Submit for Finalization'}
                            </Button>
                        )}

                        {voucher.status === 'processed' && isAdmin && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button className="bg-green-700 hover:bg-green-800">
                                        Confirm & Finalize
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will finalize the petty cash voucher and update the financial ledger entries permanently.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleAdminFinalize} className="bg-green-600 hover:bg-green-700 text-white">
                                            Confirm & Finalize
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}

                        {voucher.status === 'processed' && !isAdmin && (
                            <Badge className="bg-yellow-500 text-white hover:bg-yellow-600 px-4 py-2">
                                Awaiting Admin Review
                            </Badge>
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
                                <Badge variant={getStatusVariant(voucher.status)} className="capitalize px-4 py-1 text-sm">
                                    {voucher.status === 'processed' ? 'PENDING FINALIZATION' : voucher.status}
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
                {((voucher.status === 'finalized' || voucher.status === 'processed') && !isFinalizing) ? (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Expenditure Breakdown</CardTitle>
                                {voucher.status === 'processed' && (
                                    <CardDescription>Submitted by cashier, awaiting admin confirmation.</CardDescription>
                                )}
                            </div>
                            {voucher.status === 'processed' && (
                                <Button variant="outline" size="sm" onClick={() => setIsFinalizing(true)}>
                                    <Edit className="w-4 h-4 mr-1" /> Edit Items
                                </Button>
                            )}
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
                                    {voucher.items?.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.item_description}</TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                            <TableCell className="text-right">{parseFloat(item.unit_price.toString()).toFixed(2)}</TableCell>
                                            <TableCell className="text-right font-semibold">{parseFloat(item.amount.toString()).toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="border-t-2">
                                        <TableCell colSpan={3} className="text-right text-muted-foreground font-medium">Requested Amount</TableCell>
                                        <TableCell className="text-right font-medium">LKR {parseFloat(voucher.requested_amount.toString()).toFixed(2)}</TableCell>
                                    </TableRow>
                                    <TableRow className="bg-muted/30 font-bold">
                                        <TableCell colSpan={3} className="text-right">Total Spent</TableCell>
                                        <TableCell className="text-right">LKR {parseFloat(voucher.actual_amount?.toString() || '0').toFixed(2)}</TableCell>
                                    </TableRow>
                                    <TableRow className="border-t">
                                        <TableCell colSpan={3} className="text-right text-muted-foreground font-medium">Balance to Return</TableCell>
                                        <TableCell className={`text-right font-bold ${Number(voucher.balance_amount) < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                            LKR {parseFloat(voucher.balance_amount?.toString() || '0').toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ) : isFinalizing ? (
                    <Card className="border-green-200">
                        <form onSubmit={isAdmin ? handleAdminFinalize : handleSubmitForReview}>
                            <CardHeader className="bg-green-50/50">
                                <CardTitle className="text-green-800">
                                    {isAdmin ? 'Finalize Voucher Expenses' : 'Submit Expenses for Review'}
                                </CardTitle>
                                <CardDescription>Enter the actual items purchased and upload the bill.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                {Object.keys(errors).length > 0 && typeof errors.error === 'string' && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
                                        {errors.error}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-2 px-1">
                                        <h3 className="font-semibold text-gray-700">Expenditure Items</h3>
                                        <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-8 border-dashed hover:bg-green-50 hover:text-green-600 transition-colors">
                                            <Plus className="w-4 h-4 mr-1" /> Add Business Expense
                                        </Button>
                                    </div>
                                    
                                    <div className="rounded-md border bg-white overflow-hidden shadow-sm">
                                        <Table>
                                            <TableHeader className="bg-muted/30">
                                                <TableRow className="hover:bg-transparent">
                                                    <TableHead className="w-[45%] text-xs font-bold uppercase tracking-wider">Description</TableHead>
                                                    <TableHead className="w-[15%] text-center text-xs font-bold uppercase tracking-wider">Qty</TableHead>
                                                    <TableHead className="w-[20%] text-right text-xs font-bold uppercase tracking-wider">Unit Price</TableHead>
                                                    <TableHead className="w-[15%] text-right text-xs font-bold uppercase tracking-wider">Total</TableHead>
                                                    <TableHead className="w-[5%]"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {data.items.map((item: any, index: number) => (
                                                    <React.Fragment key={index}>
                                                        <TableRow className="group transition-colors hover:bg-muted/10">
                                                            <TableCell className="align-top py-4">
                                                                <Input
                                                                    placeholder="e.g. Printer Toner"
                                                                    value={item.item_description}
                                                                    onChange={(e) => handleItemChange(index, 'item_description', e.target.value)}
                                                                    className={`h-9 shadow-none ${errors[`items.${index}.item_description`] ? 'border-red-500 bg-red-50' : ''}`}
                                                                />
                                                                {errors[`items.${index}.item_description`] && <p className="text-[10px] text-red-500 mt-1 pl-1">{errors[`items.${index}.item_description`]}</p>}
                                                            </TableCell>
                                                            <TableCell className="align-top py-4">
                                                                <Input
                                                                    type="number"
                                                                    value={item.quantity}
                                                                    onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                                    className={`h-9 text-center shadow-none ${errors[`items.${index}.quantity`] ? 'border-red-500 bg-red-50' : ''}`}
                                                                />
                                                                {errors[`items.${index}.quantity`] && <p className="text-[10px] text-red-500 mt-1 text-center">{errors[`items.${index}.quantity`]}</p>}
                                                            </TableCell>
                                                            <TableCell className="align-top py-4">
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={item.unit_price}
                                                                    onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                                    className={`h-9 text-right shadow-none ${errors[`items.${index}.unit_price`] ? 'border-red-500 bg-red-50' : ''}`}
                                                                />
                                                                {errors[`items.${index}.unit_price`] && <p className="text-[10px] text-red-500 mt-1 text-right">{errors[`items.${index}.unit_price`]}</p>}
                                                            </TableCell>
                                                            <TableCell className="align-top pt-5 text-right font-semibold text-sm text-gray-700">
                                                                {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </TableCell>
                                                            <TableCell className="align-top py-4">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-9 w-9 text-muted-foreground hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    onClick={() => removeItem(index)}
                                                                    disabled={data.items.length === 1}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    </React.Fragment>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    {errors.items && <p className="text-sm text-red-500 text-center py-2 bg-red-50 rounded-md border border-red-100 italic">⚠️ {errors.items}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-dashed">
                                    <div className="space-y-3">
                                        <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                            <Download className="w-4 h-4" /> Proof of Purchase (Bill/Receipt)
                                        </Label>
                                        <div className="p-4 border-2 border-dashed rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer group relative">
                                            <Input
                                                type="file"
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                onChange={(e) => setData('proof', e.target.files?.[0] || null)}
                                                accept="image/*,.pdf"
                                            />
                                            <div className="flex flex-col items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                                                <FileText className="w-8 h-8 mb-2" />
                                                <p className="text-xs font-medium">{data.proof ? (data.proof as File).name : 'Click or Drag to upload receipt'}</p>
                                                <p className="text-[10px] opacity-60 mt-1">Images or PDF (max 2MB)</p>
                                            </div>
                                        </div>
                                        {errors.proof && <p className="text-xs text-red-500 mt-1">{errors.proof}</p>}
                                    </div>
                                    <div className="bg-gray-50 border p-6 rounded-xl flex flex-col justify-center items-end shadow-inner">
                                        <div className="text-right space-y-2">
                                            <div className="flex justify-between items-center gap-8 border-b pb-2">
                                                <span className="text-sm text-muted-foreground">Requested Limit:</span>
                                                <span className="font-semibold">LKR {parseFloat(voucher.requested_amount.toString()).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center gap-8 border-b pb-2">
                                                <span className="text-sm text-muted-foreground">Total Actual Spent:</span>
                                                <span className="text-xl font-bold text-blue-700">LKR {totalActualAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex justify-between items-center gap-8 pt-1">
                                                <span className="text-sm font-bold">Balance to Return:</span>
                                                <span className={`text-xl font-black ${voucher.requested_amount - totalActualAmount < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                                    LKR {(voucher.requested_amount - totalActualAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/30 flex justify-end gap-3 pt-6 border-t px-6 py-4">
                                <Button type="button" variant="ghost" onClick={() => { setIsFinalizing(false); reset(); }} disabled={processing}>Cancel</Button>
                                <Button type="submit" className="bg-green-600 hover:bg-green-700 font-bold px-8 shadow-md hover:shadow-lg transition-all" disabled={processing}>
                                    {processing ? 'Processing...' : (isAdmin ? 'Confirm & Finalize' : 'Submit for Review')}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                ) : null}
            </div>
        </AppLayout>
    );
}
