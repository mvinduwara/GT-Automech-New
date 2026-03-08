import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import React from 'react';

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

export default function Create({ auto_voucher_number }: { auto_voucher_number: string }) {
    const { auth } = usePage<any>().props;

    const { data, setData, post, processing, errors } = useForm({
        voucher_number: auto_voucher_number || '',
        date: new Date().toISOString().split('T')[0],
        requested_by_user_id: auth.user.id,
        name: '',
        description: '',
        requested_amount: 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/dashboard/petty-cash');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Register New Petty Cash" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <h1 className="h1 font-bold">Add New Petty Cash Voucher</h1>

                <form onSubmit={handleSubmit} className=" max-w-4xl space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Voucher Number */}
                        <div className="flex flex-col gap-3">
                            <Label className="font-bold">Voucher Number</Label>
                            <Input
                                placeholder="Enter voucher number"
                                value={data.voucher_number}
                                onChange={(e) => setData('voucher_number', e.target.value)}
                            />
                            {errors.voucher_number && <p className="text-sm text-red-600">{errors.voucher_number}</p>}
                        </div>

                        {/* Name */}
                        <div className="flex flex-col gap-3">
                            <Label className="font-bold">Payee Name</Label>
                            <Input placeholder="Enter payee name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                        </div>

                        {/* Date */}
                        <div className="flex flex-col gap-3">
                            <Label className="font-bold">Date</Label>
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

                        {/* Requested Amount */}
                        <div className="flex flex-col gap-3">
                            <Label className="font-bold">Requested Amount (LKR)</Label>
                            <Input
                                type="number"
                                placeholder="Enter requested amount"
                                value={data.requested_amount}
                                onChange={(e) => setData('requested_amount', parseFloat(e.target.value) || 0)}
                            />
                            {errors.requested_amount && <p className="text-sm text-red-600">{errors.requested_amount}</p>}
                        </div>

                        {/* Description */}
                        <div className="flex flex-col gap-3 md:col-span-2">
                            <Label className="font-bold">Description</Label>
                            <Input
                                placeholder="Enter purpose of petty cash"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                            />
                            {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end pt-6">
                        <Button type="submit" className="w-full md:w-48" disabled={processing}>
                            {processing ? 'Processing...' : 'Create Request'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}