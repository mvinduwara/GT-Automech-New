import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import {  type BreadcrumbItem } from '@/types';
import { User } from '@/types/types';
import { Head, useForm } from '@inertiajs/react';
import { toast } from 'sonner'; // Assuming you have sonner for toasts

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/dashboard/user',
    },
    {
        title: 'Edit User',
        href: '#',
    },
];

export default function Edit({ user }: { user: User }) {
    // Initialize useForm hook with existing user data
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        mobile: user.mobile || '', // Handle null mobile
        role: user.role,
        status: user.status,
        password: '', // Password field is optional for update
        password_confirmation: '',
    });

    // Update breadcrumbs dynamically with the user's name
    const dynamicBreadcrumbs: BreadcrumbItem[] = [
        ...breadcrumbs.slice(0, 1), // Keep 'Users'
        {
            title: `Edit ${user.name}`,
            href: route('dashboard.user.edit', { user: user.id }),
        },
    ];

    // Handle form submission for updating user
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('dashboard.user.update', { user: user.id }), {
            onSuccess: () => {
                toast.success('User updated successfully!');
            },
            onError: (formErrors) => {
                console.error('Update failed:', formErrors);
                toast.error('Failed to update user. Please check the form for errors.');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={dynamicBreadcrumbs}>
            <Head title={`Edit User: ${user.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <h1 className="h1 font-bold">Edit User: {user.name}</h1>
                </div>

                <form onSubmit={handleSubmit} className="mx-auto max-w-5xl space-y-8">
                    <div className="-mx-6 flex flex-wrap">
                        {/* Name */}
                        <div className="mb-8 w-full px-6 md:w-1/2">
                            <Label htmlFor="name" className="h1 font-bold">Name</Label>
                            <Input
                                id="name"
                                placeholder="Enter full name"
                                className="min-w-[280px]"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        {/* Email */}
                        <div className="mb-8 w-full px-6 md:w-1/2">
                            <Label htmlFor="email" className="h1 font-bold">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter email"
                                className="min-w-[280px]"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>

                        {/* Mobile */}
                        <div className="mb-8 w-full px-6 md:w-1/2">
                            <Label htmlFor="mobile" className="h1 font-bold">Mobile</Label>
                            <Input
                                id="mobile"
                                type="text"
                                placeholder="Enter mobile number"
                                className="min-w-[280px]"
                                value={data.mobile}
                                onChange={(e) => setData('mobile', e.target.value)}
                            />
                            {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
                        </div>

                        {/* Role */}
                        <div className="mb-8 w-full px-6 md:w-1/2">
                            <Label htmlFor="role" className="h1 font-bold">Role</Label>
                            <Select value={data.role} onValueChange={(value) => setData('role', value as 'cashier' | 'admin' | 'service-manager')}>
                                <SelectTrigger className="min-w-[280px]">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cashier">Cashier</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="service-manager">Service Manager</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
                        </div>

                        {/* Status */}
                        <div className="mb-8 w-full px-6 md:w-1/2">
                            <Label htmlFor="status" className="h1 font-bold">Status</Label>
                            <Select value={data.status} onValueChange={(value) => setData('status', value as 'active' | 'deactive' | 'pending')}>
                                <SelectTrigger className="min-w-[280px]">
                                    <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="deactive">Deactive</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
                        </div>

                        {/* Password (optional for update) */}
                        <div className="mb-8 w-full px-6 md:w-1/2">
                            <Label htmlFor="password" className="h1 font-bold">New Password (optional)</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter new password"
                                className="min-w-[280px]"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                        </div>

                        {/* Confirm New Password */}
                        <div className="mb-8 w-full px-6 md:w-1/2">
                            <Label htmlFor="password_confirmation" className="h1 font-bold">Confirm New Password</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                placeholder="Confirm new password"
                                className="min-w-[280px]"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                            />
                            {errors.password_confirmation && <p className="text-red-500 text-sm mt-1">{errors.password_confirmation}</p>}
                        </div>
                    </div>

                    <div className="mx-auto flex w-full max-w-md justify-center">
                        <Button type="submit" className="w-48" disabled={processing}>
                            {processing ? 'Updating...' : 'Update Employee'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

