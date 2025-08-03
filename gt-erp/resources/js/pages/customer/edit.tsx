import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Toaster, toast } from 'sonner';
import { useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Customer',
        href: '/dashboard/customer',
    },
    {
        title: 'Edit Customer',
        href: '#',
    },
];

interface Customer {
    id: number;
    title: string | null;
    name: string;
    mobile: string;
    address: string;
}

interface EditPageProps {
    customer: Customer;
}

export default function Edit() {
    const { customer } = usePage<EditPageProps>().props;
    const { data, setData, put, processing, errors } = useForm({
        title: customer.title,
        name: customer.name,
        mobile: customer.mobile,
        address: customer.address,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('dashboard.customer.update', { customer: customer.id }), {
            onSuccess: () => {
                toast.success('Customer updated successfully!');
            },
            onError: () => {
                toast.error('Failed to update customer. Please check the form for errors.');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Customer" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <h1 className="text-2xl font-bold text-gray-800">Edit Customer: {customer.name}</h1>
                <form onSubmit={submit} className="max-w-2xl space-y-4">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="title">Title</Label>
                        <Select onValueChange={(value) => setData('title', value)} value={data.title || ''}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a title" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Mr">Mr</SelectItem>
                                <SelectItem value="Mrs">Mrs</SelectItem>
                                <SelectItem value="Ms">Ms</SelectItem>
                                <SelectItem value="Ven">Ven</SelectItem>
                                <SelectItem value="Dr">Dr</SelectItem>
                                <SelectItem value="Prof">Prof</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                    </div>

                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Customer Name"
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>

                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="mobile">Mobile</Label>
                        <Input
                            id="mobile"
                            type="text"
                            value={data.mobile}
                            onChange={(e) => setData('mobile', e.target.value)}
                            placeholder="Mobile Number"
                        />
                        {errors.mobile && <p className="text-sm text-red-500">{errors.mobile}</p>}
                    </div>

                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                            id="address"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            placeholder="Customer Address"
                        />
                        {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                    </div>

                    <Button type="submit" disabled={processing}>
                        Update
                    </Button>
                </form>
            </div>
            <Toaster richColors position="top-right" />
        </AppLayout>
    );
}
