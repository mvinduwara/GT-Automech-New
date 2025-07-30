import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
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
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Register New User" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <h1 className="h1 font-bold">Add New Petty Cash Voucher</h1>
                </div>

                <form className="mx-auto max-w-5xl space-y-8">
                    <div className="-mx-6 flex flex-wrap">
                        <div className="mb-6 flex w-full flex-col gap-3 px-3 md:w-1/2">
                            <Label htmlFor="name" className="h1 font-bold">
                                Voucher Number
                            </Label>
                            <Input id="name" placeholder="Enter voucher number" className="min-w-[280px]" />
                        </div>

                        <div className="mb-6 flex w-full flex-col gap-3 px-3 md:w-1/2">
                            <Label htmlFor="email" className="h1 font-bold">
                                Date
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        data-empty={!date}
                                        className="w-[280px] justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
                                    >
                                        <CalendarIcon />
                                        {date ? format(date, 'PPP') : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={date} onSelect={setDate} />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="mb-6 flex w-full flex-col gap-3 px-3 md:w-1/2">
                            <Label htmlFor="role" className="h1 font-bold">
                                Requsted User
                            </Label>
                            <Select>
                                <SelectTrigger className="min-w-[280px]">
                                    <SelectValue placeholder="Select a User" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cashier">Cashier</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="service-manager">Service Manager</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="mb-6 flex w-full flex-col gap-3 px-3 md:w-1/2">
                            <Label htmlFor="role" className="h1 font-bold">
                                Accepted User
                            </Label>
                            <Select>
                                <SelectTrigger className="min-w-[280px]">
                                    <SelectValue placeholder="Select a User" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cashier">Cashier</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="service-manager">Service Manager</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="mb-6 flex w-full flex-col gap-3 px-3 md:w-1/2">
                            <Label htmlFor="mobile" className="h1 font-bold">
                                Name
                            </Label>
                            <Input id="mobile" type="text" placeholder="Enter name" className="min-w-[280px]" />
                        </div>

                        <div className="mb-6 flex w-full flex-col gap-3 px-3 md:w-1/2">
                            <Label htmlFor="mobile" className="h1 font-bold">
                                Total Amonut
                            </Label>
                            <Input id="mobile" type="text" placeholder="Enter Amount" className="min-w-[280px]" />
                        </div>

                        {/* Status */}
                        <div className="mb-6 flex w-full flex-col gap-3 px-3 md:w-1/2">
                            <Label htmlFor="status" className="h1 font-bold">
                                Status
                            </Label>
                            <Select>
                                <SelectTrigger className="min-w-[280px]">
                                    <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="deactive">Deactive</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="mb-6 flex w-full flex-col gap-3 px-3 md:w-1/2">
                            <Label htmlFor="status" className="h1 font-bold">
                                Checked
                            </Label>
                            <Select>
                                <SelectTrigger className="min-w-[280px]">
                                    <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="deactive">Deactive</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="mb-6 flex w-full flex-col gap-3 px-3 md:w-1/2">
                            <Label htmlFor="mobile" className="h1 font-bold">
                                Description
                            </Label>
                            <Input id="mobile" type="text" placeholder="Enter name" className="min-w-[280px]" />
                        </div>
                    </div>

                    <div className="mx-auto flex w-full max-w-md justify-center">
                        <Button type="submit" className="w-48">
                            Add Voucher
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
