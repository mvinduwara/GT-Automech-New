import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import React, { useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Petty Cash',
        href: '/dashboard/petty-cash',
    },
    {
        title: 'New Petty Cash',
        href: '/dashboard/petty-cash/create',
    },
];

interface PettyCashItem {
    item_description: string;
    quantity: number;
    unit_price: number;
    amount: number;
}

export default function Create() {
    const { auth } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        voucher_number: '',
        date: new Date().toISOString().split('T')[0],
        requested_by_user_id: auth.user.id,
        name: '',
        description: '',
        items: [
            {
                item_description: '',
                quantity: 1,
                unit_price: 0,
                amount: 0,
            },
        ] as PettyCashItem[],
    });

    // Calculate total amount whenever items change
    useEffect(() => {
        const total = data.items.reduce((sum, item) => sum + item.amount, 0);
        // This is for display purposes - backend will calculate
    }, [data.items]);

    const handleItemChange = (index: number, field: keyof PettyCashItem, value: string | number) => {
        const newItems = [...data.items];
        newItems[index] = {
            ...newItems[index],
            [field]: value,
        };

        // Auto-calculate amount when quantity or unit_price changes
        if (field === 'quantity' || field === 'unit_price') {
            newItems[index].amount = newItems[index].quantity * newItems[index].unit_price;
        }

        setData('items', newItems);
    };

    const addItem = () => {
        setData('items', [
            ...data.items,
            {
                item_description: '',
                quantity: 1,
                unit_price: 0,
                amount: 0,
            },
        ]);
    };

    const removeItem = (index: number) => {
        if (data.items.length > 1) {
            const newItems = data.items.filter((_, i) => i !== index);
            setData('items', newItems);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/dashboard/petty-cash');
    };

    const totalAmount = data.items.reduce((sum, item) => sum + item.amount, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Register New Petty Cash" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <h1 className="h1 font-bold">Add New Petty Cash Voucher</h1>

                <form onSubmit={handleSubmit} className="mx-auto max-w-6xl space-y-8">
                    <div className="-mx-6 flex flex-wrap">
                        {/* Voucher Number */}
                        <div className="mb-6 flex w-full flex-col gap-3 px-3 md:w-1/2">
                            <Label className="h1 font-bold">Voucher Number</Label>
                            <Input
                                placeholder="Enter voucher number"
                                value={data.voucher_number}
                                onChange={(e) => setData('voucher_number', e.target.value)}
                            />
                            {errors.voucher_number && <p className="text-sm text-red-600">{errors.voucher_number}</p>}
                        </div>

                        {/* Name */}
                        <div className="mb-6 flex w-full flex-col gap-3 px-3 md:w-1/2">
                            <Label className="h1 font-bold">Name</Label>
                            <Input placeholder="Enter name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                        </div>

                        {/* Description */}
                        <div className="mb-6 flex w-full flex-col gap-3 px-3 md:w-1/2">
                            <Label className="h1 font-bold">Description</Label>
                            <Input
                                placeholder="Enter description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                            />
                            {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                        </div>

                        {/* Date */}
                        <div className="mb-6 flex w-full flex-col gap-3 px-3 md:w-1/2">
                            <Label className="h1 font-bold">Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {format(new Date(data.date), 'PPP')}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={new Date(data.date)}
                                        onSelect={(d) => setData('date', d?.toISOString().split('T')[0] ?? data.date)}
                                    />
                                </PopoverContent>
                            </Popover>
                            {errors.date && <p className="text-sm text-red-600">{errors.date}</p>}
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="space-y-4 border-t pt-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">Voucher Items</h2>
                            <Button type="button" onClick={addItem} variant="outline" size="sm">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Item
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {data.items.map((item, index) => (
                                <div key={index} className="rounded-lg border p-4">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="font-semibold">Item {index + 1}</h3>
                                        {data.items.length > 1 && (
                                            <Button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="-mx-2 flex flex-wrap">
                                        {/* Item Description */}
                                        <div className="mb-4 w-full px-2 md:w-1/2">
                                            <Label>Item Description</Label>
                                            <Input
                                                placeholder="Enter item description"
                                                value={item.item_description}
                                                onChange={(e) => handleItemChange(index, 'item_description', e.target.value)}
                                            />
                                            {errors[`items.${index}.item_description`] && (
                                                <p className="text-sm text-red-600">{errors[`items.${index}.item_description`]}</p>
                                            )}
                                        </div>

                                        {/* Quantity */}
                                        <div className="mb-4 w-full px-2 md:w-1/6">
                                            <Label>Quantity</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                placeholder="Qty"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                            />
                                            {errors[`items.${index}.quantity`] && (
                                                <p className="text-sm text-red-600">{errors[`items.${index}.quantity`]}</p>
                                            )}
                                        </div>

                                        {/* Unit Price */}
                                        <div className="mb-4 w-full px-2 md:w-1/6">
                                            <Label>Unit Price</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="Price"
                                                value={item.unit_price}
                                                onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                            />
                                            {errors[`items.${index}.unit_price`] && (
                                                <p className="text-sm text-red-600">{errors[`items.${index}.unit_price`]}</p>
                                            )}
                                        </div>

                                        {/* Amount (Read-only) */}
                                        <div className="mb-4 w-full px-2 md:w-1/6">
                                            <Label>Amount</Label>
                                            <Input
                                                type="number"
                                                value={item.amount.toFixed(2)}
                                                readOnly
                                                className="bg-gray-50"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Total Amount Display */}
                        <div className="flex justify-end border-t pt-4">
                            <div className="text-right">
                                <Label className="text-lg">Total Amount</Label>
                                <p className="text-2xl font-bold">{totalAmount.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 flex w-full gap-3 px-3">
                        <Button type="submit" className="w-48" disabled={processing}>
                            {processing ? 'Adding...' : 'Add Voucher'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}