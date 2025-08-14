import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Supplier',
        href: '/dashboard/supplier',
    },
    {
        title: 'Supplier Create',
        href: '/dashboard/supplier/create',
    },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        mobile: '',
        address: '',
        register_date: '',
        close_date: '',
        status: 'active',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/dashboard/supplier', {
            onSuccess: () => {
                toast( "Success!",{
                    description: "Supplier created successfully.",
                });
            },
            onError: (errors) => {
                toast("Error!",{
                    description: "Failed to create supplier. Please check the form for errors.",
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Supplier Create" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                <div className="w-full max-w-2xl mx-auto rounded-xl border bg-card text-card-foreground shadow-sm p-8">
                    <h2 className="text-2xl font-semibold mb-6">Create New Supplier</h2>
                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <Label htmlFor="mobile">Mobile</Label>
                            <Input
                                id="mobile"
                                type="text"
                                value={data.mobile}
                                onChange={(e) => setData('mobile', e.target.value)}
                            />
                            {errors.mobile && <p className="text-sm text-red-500 mt-1">{errors.mobile}</p>}
                        </div>

                        <div>
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                                id="address"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                required
                            />
                            {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
                        </div>

                        <div>
                            <Label htmlFor="register_date">Register Date</Label>
                            <Input
                                id="register_date"
                                type="date"
                                value={data.register_date}
                                onChange={(e) => setData('register_date', e.target.value)}
                                required
                            />
                            {errors.register_date && <p className="text-sm text-red-500 mt-1">{errors.register_date}</p>}
                        </div>

                        <div>
                            <Label htmlFor="close_date">Close Date</Label>
                            <Input
                                id="close_date"
                                type="date"
                                value={data.close_date}
                                onChange={(e) => setData('close_date', e.target.value)}
                            />
                            {errors.close_date && <p className="text-sm text-red-500 mt-1">{errors.close_date}</p>}
                        </div>

                        <div>
                            <Label>Status</Label>
                            <RadioGroup
                                defaultValue="active"
                                value={data.status}
                                onValueChange={(value) => setData('status', value)}
                                className="flex gap-4 mt-2"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="active" id="active" />
                                    <Label htmlFor="active">Active</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="deactive" id="deactive" />
                                    <Label htmlFor="deactive">Deactive</Label>
                                </div>
                            </RadioGroup>
                            {errors.status && <p className="text-sm text-red-500 mt-1">{errors.status}</p>}
                        </div>

                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Supplier'}
                        </Button>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
