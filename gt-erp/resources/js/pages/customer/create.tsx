import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Toaster, toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Customer',
        href: '/dashboard/customer',
    },
    {
        title: 'New Customer',
        href: '/dashboard/customer/create',
    },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        name: '',
        mobile: '',
        address: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('dashboard.customer.store'), {
            onSuccess: () => {
                toast.success('Customer created successfully!');
            },
            onError: () => {
                toast.error('Failed to create customer. Please check the form for errors.');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Customer" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <h1 className="text-2xl font-bold text-gray-800">New Customer</h1>
                <form onSubmit={submit} className="max-w-2xl space-y-4">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="title">Title</Label>
                        <Select onValueChange={(value) => setData('title', value)} value={data.title}>
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
                        Create
                    </Button>
                </form>
            </div>
            <Toaster richColors position="top-right" />
        </AppLayout>
    );
}
