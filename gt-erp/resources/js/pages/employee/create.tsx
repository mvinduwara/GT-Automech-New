import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

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
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Register New User" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <h1 className="h1 font-bold">Register New Employee</h1>
                </div>

                <form className="mx-auto max-w-5xl space-y-8">
                    <div className="-mx-6 flex flex-wrap">
                        <div className="mb-8 w-full px-6 md:w-1/2">
                            <Label className="h1 font-bold">First Name</Label>
                            <Input id="fname" placeholder="Enter first name" className="min-w-[280px]" />
                        </div>

                        <div className="mb-8 w-full px-6 md:w-1/2">
                            <Label className="h1 font-bold">Last Name</Label>
                            <Input id="lname" placeholder="Enter last name" className="min-w-[280px]" />
                        </div>

                        <div className="mb-8 w-full px-6 md:w-1/2">
                            <Label className="h1 font-bold">Email</Label>
                            <Input id="email" placeholder="Enter email" className="min-w-[280px]" />
                        </div>

                        <div className="mb-8 w-full px-6 md:w-1/2">
                            <Label className="h1 font-bold">Mobile</Label>
                            <Input id="mobile" placeholder="Enter mobile" className="min-w-[280px]" />
                        </div>

                        <div className="mb-8 w-full px-6 md:w-1/2">
                            <Label className="h1 font-bold">Job Title</Label>
                            <Input id="department" placeholder="Enter Job Title" className="min-w-[280px]" />
                        </div>

                        <div className="mb-8 w-full px-6 md:w-1/2">
                            <Label className="h1 font-bold">Department</Label>
                            <Input id="department" placeholder="Enter department" className="min-w-[280px]" />
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
