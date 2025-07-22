import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ChevronDownIcon } from 'lucide-react';
import * as React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Employee',
        href: '/dashboard/employee',
    },
    {
        title: 'Register New Employee',
        href: '/dashboard/create',
    },
];

export default function Create() {
    const [open, setOpen] = React.useState(false);
    const [date, setDate] = React.useState<Date | undefined>(undefined);

    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        mobile: '',
        hire_date: '',
        job_title: '',
        department_id: '',
        status: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (date) setData('hire_date', date.toISOString().split('T')[0]);
        post('/dashboard/employee/store');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Register New User" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <h1 className="h1 font-bold">Register New Employee</h1>
                </div>

                <form onSubmit={handleSubmit} className="mx-auto max-w-5xl space-y-8">
                    <div className="-mx-6 flex flex-wrap">
                        <div className="mb-8 w-full px-6 md:w-1/2">
                            <Label className="h1 font-bold">First Name</Label>
                            <Input
                                id="fname"
                                value={data.first_name}
                                placeholder="Enter first name"
                                className="min-w-[280px]"
                                onChange={(e) => setData('first_name', e.target.value)}
                            />
                        </div>

                        <div className="mb-8 w-full px-6 md:w-1/2">
                            <Label className="h1 font-bold">Last Name</Label>
                            <Input
                                id="lname"
                                value={data.last_name}
                                placeholder="Enter last name"
                                className="min-w-[280px]"
                                onChange={(e) => setData('last_name', e.target.value)}
                            />
                        </div>

                        <div className="mb-8 w-full px-6 md:w-1/2">
                            <Label className="h1 font-bold">Email</Label>
                            <Input
                                id="email"
                                value={data.email}
                                placeholder="Enter email"
                                className="min-w-[280px]"
                                onChange={(e) => setData('email', e.target.value)}
                            />
                        </div>

                        <div className="mb-8 w-full px-6 md:w-1/2">
                            <Label className="h1 font-bold">Mobile</Label>
                            <Input
                                id="mobile"
                                value={data.mobile}
                                placeholder="Enter mobile"
                                className="min-w-[280px]"
                                onChange={(e) => setData('mobile', e.target.value)}
                            />
                        </div>

                        <div className="mb-8 w-full px-6 md:w-1/2">
                            <Label className="h1 font-bold">Job Title</Label>
                            <Input
                                id="job_title"
                                value={data.job_title}
                                placeholder="Enter Job Title"
                                className="min-w-[280px]"
                                onChange={(e) => setData('job_title', e.target.value)}
                            />
                        </div>

                        <div className="mb-8 flex w-full flex-col gap-3 px-6 md:w-1/2">
                            <Label htmlFor="date" className="h1 font-bold">
                                Select Hire Date
                            </Label>
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" id="date" className="w-48 justify-between font-normal">
                                        {date ? date.toLocaleDateString() : 'Select date'}
                                        <ChevronDownIcon />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        captionLayout="dropdown"
                                        onSelect={(date) => {
                                            setDate(date);
                                            setData('hire_date', date ? date.toISOString().split('T')[0] : '');
                                            setOpen(false);
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="mb-8 flex w-full items-center justify-start px-6 md:w-1/2">
                            <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Select</SelectLabel>
                                        <SelectItem value="active">active</SelectItem>
                                        <SelectItem value="deactive">deactive</SelectItem>
                                        <SelectItem value="pending">pending</SelectItem>
                                        <SelectItem value="terminated">terminated</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="mb-8 flex w-full items-center justify-start px-6 md:w-1/2">
                            <Select value={data.department_id} onValueChange={(value) => setData('department_id', value)}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Select</SelectLabel>
                                        <SelectItem value="1">Mechanical</SelectItem>
                                        <SelectItem value="2">Electronic</SelectItem>
                                        <SelectItem value="3">AC</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="mx-auto flex w-full max-w-md justify-center">
                        <Button className="w-48">Register Employee</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
