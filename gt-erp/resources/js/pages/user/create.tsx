import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/dashboard/user',
    },
    {
        title: 'Register New User',
        href: '/dashboard/create',
    },
];

export default function Create() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Register New User" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="h1 font-bold">Register New User</h1>
                </div>

                <form className="space-y-6">
                    <div className="w-full max-w-md">
                        <Label className="h1 font-bold">Enter Name</Label>
                        <Input id="name" placeholder="Enter name" />
                    </div>
                    <div className="w-full max-w-md">
                        <Label className="h1 font-bold">Enter Email</Label>
                        <Input id="email" placeholder="Enter email" />
                    </div>
                    <div className="w-full max-w-md">
                        <Label className="h1 font-bold">Enter Mobile</Label>
                        <Input id="mobile" placeholder="Enter mobile" />
                    </div>
                    <div className="w-full max-w-md">
                        <Label className="h1 font-bold">Enter Mobile</Label>
                        <Input id="mobile" placeholder="Enter mobile" />
                    </div>
                    <div className="w-full max-w-md">
                        <Label className="h1 font-bold">Password</Label>
                        <Input id="password" type="password" placeholder="Enter password" autoComplete="new-password" />
                    </div>

                    <div className="w-full max-w-md">
                        <Button>Register User</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
