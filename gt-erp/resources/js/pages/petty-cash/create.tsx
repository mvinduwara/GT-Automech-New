import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
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

export default function Create() {
    const { users } = usePage().props as { users: User[] };

    const { data, setData, post, processing, errors } = useForm({
        voucher_number: '',
        date: new Date().toISOString().split('T')[0], // format YYYY-MM-DD
        requested_by_user_id: '',
        approved_by_user_id: '',
        name: '',
        total_amount: '',
        status: '',
        checked: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/dashboard/petty-cash'); // This should match your Laravel POST route
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Register New Petty Cash" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <h1 className="h1 font-bold">Add New Petty Cash Voucher</h1>

                <form onSubmit={handleSubmit} className="mx-auto max-w-5xl space-y-8">
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
                                    {errors.date && <p className="text-sm text-red-600">{errors.date}</p>}
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Requested User */}
                        <div className="mb-6 flex w-full flex-col gap-3 px-3 md:w-1/2">
                            <Label className="h1 font-bold">Requested User</Label>
                            <Select value={data.requested_by_user_id} onValueChange={(val) => setData('requested_by_user_id', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a user" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={user.id.toString()}>
                                            {user.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.requested_by_user_id && <p className="text-sm text-red-600">{errors.requested_by_user_id}</p>}
                        </div>

                        {/* Approved User */}
                        <div className="mb-6 flex w-full flex-col gap-3 px-3 md:w-1/2">
                            <Label className="h1 font-bold">Approved User</Label>
                            <Select value={data.approved_by_user_id} onValueChange={(val) => setData('approved_by_user_id', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a user" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={user.id.toString()}>
                                            {user.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.approved_by_user_id && <p className="text-sm text-red-600">{errors.approved_by_user_id}</p>}
                        </div>

                        {/* Name */}
                        <div className="mb-6 flex w-full flex-col gap-3 px-3 md:w-1/2">
                            <Label className="h1 font-bold">Name</Label>
                            <Input placeholder="Enter name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                        </div>

                        {/* Total Amount */}
                        <div className="mb-6 flex w-full flex-col gap-3 px-3 md:w-1/2">
                            <Label className="h1 font-bold">Total Amount</Label>
                            <Input
                                type="number"
                                placeholder="Enter amount"
                                value={data.total_amount}
                                onChange={(e) => setData('total_amount', e.target.value)}
                            />
                            {errors.total_amount && <p className="text-sm text-red-600">{errors.total_amount}</p>}
                        </div>

                        {/* Status */}
                        <div className="mb-6 flex w-full flex-col gap-3 px-3 md:w-1/2">
                            <Label className="h1 font-bold">Status</Label>
                            <Select onValueChange={(val) => setData('status', val)} defaultValue={data.status}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
                        </div>

                        {/* Checked */}
                        <div className="mb-6 flex w-full flex-col gap-3 px-3 md:w-1/2">
                            <Label className="h1 font-bold">Checked</Label>
                            <Select onValueChange={(val) => setData('checked', val)} defaultValue={data.checked}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select checked status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Yes</SelectItem>
                                    <SelectItem value="0">No</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.checked && <p className="text-sm text-red-600">{errors.checked}</p>}
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
                    </div>

                    <div className="mx-auto flex w-full max-w-md justify-center">
                        <Button type="submit" className="w-48" disabled={processing}>
                            {processing ? 'Adding...' : 'Add Voucher'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
