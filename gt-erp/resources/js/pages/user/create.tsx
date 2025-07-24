import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Import Select components
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react'; // Import useForm
import { toast } from 'sonner'; // Assuming you have sonner for toasts

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/dashboard/user',
    },
    {
        title: 'Register User',
        href: '/dashboard/user/create',
    },
];

export default function Create() {
    // Initialize useForm hook for form data, processing state, and errors
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        mobile: '',
        role: 'admin', // Default role
        status: 'pending', // Default status
        password: '',
        password_confirmation: '', // For password confirmation
    });

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('dashboard.user.store'), {
            onSuccess: () => {
                toast.success('User registered successfully!');
                reset(); // Reset form fields on success
            },
            onError: (formErrors) => {
                console.error('Registration failed:', formErrors);
                toast.error('Failed to register user. Please check the form for errors.');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Register New User" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <h1 className="h1 font-bold">Register New User</h1>
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
                            <Select value={data.role} onValueChange={(value) => setData('role', value)}>
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
                            <Select value={data.status} onValueChange={(value) => setData('status', value)}>
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

                        {/* Password */}
                        <div className="mb-8 w-full px-6 md:w-1/2">
                            <Label htmlFor="password" className="h1 font-bold">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter password"
                                className="min-w-[280px]"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div className="mb-8 w-full px-6 md:w-1/2">
                            <Label htmlFor="password_confirmation" className="h1 font-bold">Confirm Password</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                placeholder="Confirm password"
                                className="min-w-[280px]"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                            />
                            {errors.password_confirmation && <p className="text-red-500 text-sm mt-1">{errors.password_confirmation}</p>}
                        </div>
                    </div>

                    <div className="mx-auto flex w-full max-w-md justify-center">
                        <Button type="submit" className="w-48" disabled={processing}>
                            {processing ? 'Registering...' : 'Register Employee'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

