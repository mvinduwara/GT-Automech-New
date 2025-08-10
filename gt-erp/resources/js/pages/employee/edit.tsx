import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { CalendarIcon } from 'lucide-react'; // Changed from ChevronDownIcon
import * as React from 'react';
import { format } from 'date-fns'; // Import format from date-fns
import { cn } from '@/lib/utils'; // Import cn utility
import { toast } from 'sonner';
import { useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Employee',
        href: '/dashboard/employee',
    },
    {
        title: 'Edit Employee',
        href: '/dashboard/employee/edit',
    },
];

export default function Edit({ employee, departments, success, error }: any) {
    const [open, setOpen] = React.useState(false);

    const { data, setData, post, processing, errors } = useForm({
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        email: employee.email || '',
        mobile: employee.mobile || '',
        hire_date: employee.hire_date || '', // Ensure this is a string in YYYY-MM-DD format
        job_title: employee.job_title || '',
        department_id: employee.department_id ? String(employee.department_id) : '',
        status: employee.status || '',
        _method: 'PUT', // Important for Laravel PUT requests
    });

    useEffect(() => {
        if (success) {
            toast.success(success);
        }
        if (error) {
            toast.error(error);
        }
    }, [success, error]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('dashboard.employee.update', { employee_id: employee.id }), {
            onSuccess: () => {
                toast.success('Employee Updated Successfully!');
            },
            onError: (errors) => {
                for (const key in errors) {
                    toast.error(errors[key]);
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Employee" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Edit Employee</h1>
                </div>

                <form onSubmit={handleSubmit} className="mx-auto max-w-5xl space-y-8">
                    <div className="-mx-3 flex flex-wrap">
                        <div className="mb-6 w-full px-3 md:w-1/2">
                            <Label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name</Label>
                            <Input
                                id="first_name"
                                value={data.first_name}
                                placeholder="Enter first name"
                                className="mt-1 block w-full"
                                onChange={(e) => setData('first_name', e.target.value)}
                            />
                            {errors.first_name && <p className="text-sm text-red-600">{errors.first_name}</p>}
                        </div>

                        <div className="mb-6 w-full px-3 md:w-1/2">
                            <Label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Last Name</Label>
                            <Input
                                id="last_name"
                                value={data.last_name}
                                placeholder="Enter last name"
                                className="mt-1 block w-full"
                                onChange={(e) => setData('last_name', e.target.value)}
                            />
                            {errors.last_name && <p className="text-sm text-red-600">{errors.last_name}</p>}
                        </div>

                        <div className="mb-6 w-full px-3 md:w-1/2">
                            <Label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</Label>
                            <Input
                                id="email"
                                value={data.email}
                                placeholder="Enter email"
                                className="mt-1 block w-full"
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                        </div>

                        <div className="mb-6 w-full px-3 md:w-1/2">
                            <Label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile</Label>
                            <Input
                                id="mobile"
                                value={data.mobile}
                                placeholder="Enter mobile"
                                className="mt-1 block w-full"
                                onChange={(e) => setData('mobile', e.target.value)}
                            />
                            {errors.mobile && <p className="text-sm text-red-600">{errors.mobile}</p>}
                        </div>

                        <div className="mb-6 w-full px-3 md:w-1/2">
                            <Label htmlFor="job_title" className="block text-sm font-medium text-gray-700">Job Title</Label>
                            <Input
                                id="job_title"
                                value={data.job_title}
                                placeholder="Enter Job Title"
                                className="mt-1 block w-full"
                                onChange={(e) => setData('job_title', e.target.value)}
                            />
                            {errors.job_title && <p className="text-sm text-red-600">{errors.job_title}</p>}
                        </div>

                        <div className="mb-6 flex w-full flex-col gap-3 px-3 md:w-1/2">
                            <Label htmlFor="hire_date" className="block text-sm font-medium text-gray-700">
                                Select Hire Date
                            </Label>
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            !data.hire_date && 'text-muted-foreground'
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {data.hire_date ? format(new Date(data.hire_date), 'PPP') : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={data.hire_date ? new Date(data.hire_date) : undefined}
                                        onSelect={(date) => {
                                            setData('hire_date', date ? format(date, 'yyyy-MM-dd') : '');
                                            setOpen(false); // Close popover on date selection
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {errors.hire_date && <p className="text-sm text-red-600">{errors.hire_date}</p>}
                        </div>

                        <div className="mb-6 w-full px-3 md:w-1/2">
                            <Label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</Label>
                            <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                <SelectTrigger className="mt-1 w-full">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Select Status</SelectLabel>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="deactive">Deactive</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="terminated">Terminated</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
                        </div>

                        <div className="mb-6 w-full px-3 md:w-1/2">
                            <Label htmlFor="department_id" className="block text-sm font-medium text-gray-700">Department</Label>
                            <Select value={data.department_id} onValueChange={(value) => setData('department_id', value)}>
                                <SelectTrigger className="mt-1 w-full">
                                    <SelectValue placeholder="Select Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Select Department</SelectLabel>
                                        {departments.map((department: any) => (
                                            <SelectItem key={department.id} value={department.id.toString()}>
                                                {department.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {errors.department_id && <p className="text-sm text-red-600">{errors.department_id}</p>}
                        </div>
                    </div>

                    <div className="flex w-full justify-center">
                        <Button type="submit" className="w-48" disabled={processing}>
                            {processing ? 'Updating...' : 'Update Employee'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}