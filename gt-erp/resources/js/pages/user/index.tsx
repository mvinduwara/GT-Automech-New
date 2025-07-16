import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { UserPen } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/dashboard/stock',
    },
];

export default function Index({ users }: { users: any[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stock" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="h1 font-bold">All Registered Users</h1>
                    <Link href={route('dashboard.user.create')}>
                        <Button>Register New User</Button>
                    </Link>
                </div>

                <div className="flex h-full flex-1 flex-col overflow-y-auto">
                    <Table className="w-full table-fixed">
                        <TableCaption>A list of your recent users.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-left">User ID</TableHead>
                                <TableHead className="text-left">User Name</TableHead>
                                <TableHead className="text-left">Email</TableHead>
                                <TableHead className="text-left">Mobile</TableHead>
                                <TableHead className="text-left">Role</TableHead>
                                <TableHead className="text-left">Status</TableHead>
                                <TableHead className="text-left">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="text-left font-medium">{user.id}</TableCell>
                                    <TableCell className="text-left">{user.name}</TableCell>
                                    <TableCell className="text-left">{user.email}</TableCell>
                                    <TableCell className="text-left">{user.mobile}</TableCell>
                                    <TableCell className="text-left">{user.role}</TableCell>
                                    <TableCell className="text-left">{user.status}</TableCell>
                                    <TableCell className="text-left">
                                        <div className="justify-left flex space-x-2">
                                            <Link href={route('dashboard.user.edit', { customer_id: user.id })}>
                                                <Button variant="ghost" className="p-2">
                                                    <UserPen className="h-5 w-5" />
                                                </Button>
                                            </Link>

                                            {/* <Button className="bg-red-100 p-2 text-red-800 hover:bg-red-200">
                                                <TrashIcon className="h-5 w-5" />
                                            </Button> */}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>

                        {/* <TableFooter>
                            <TableRow>
                                <TableCell colSpan={4}>Total</TableCell>
                                <TableCell>$2,500.00</TableCell>
                            </TableRow>
                        </TableFooter> */}
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
