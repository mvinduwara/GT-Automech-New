import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { User } from '@/types/types';
import { Head, Link, useForm } from '@inertiajs/react'; // Import useForm
import { UserPen, Trash2 } from 'lucide-react'; // Import Trash2 icon
import { toast } from 'sonner'; // Assuming you have sonner for toasts

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/dashboard/user', // Corrected href for users index
    },
];

export default function Index({ users }: { users: User[] }) {
    const { delete: destroy, processing } = useForm(); // Get the delete method from useForm

    const handleDelete = (userId: number) => {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            destroy(route('dashboard.user.destroy', { user: userId }), {
                onSuccess: () => {
                    toast.success('User deleted successfully!');
                },
                onError: (formErrors) => {
                    console.error('Deletion failed:', formErrors);
                    toast.error('Failed to delete user.');
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
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
                                <TableHead className="text-left w-[80px]">ID</TableHead>
                                <TableHead className="text-left w-[150px]">Name</TableHead>
                                <TableHead className="text-left w-[200px]">Email</TableHead>
                                <TableHead className="text-left w-[120px]">Mobile</TableHead>
                                <TableHead className="text-left w-[120px]">Role</TableHead>
                                <TableHead className="text-left w-[120px]">Status</TableHead>
                                <TableHead className="text-left w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="text-left font-medium">{user.id}</TableCell>
                                    <TableCell className="text-left">{user.name}</TableCell>
                                    <TableCell className="text-left">{user.email}</TableCell>
                                    <TableCell className="text-left">{user.mobile || '-'}</TableCell>
                                    <TableCell className="text-left">{user.role}</TableCell>
                                    <TableCell className="text-left">{user.status}</TableCell>
                                    <TableCell className="text-left">
                                        <div className="justify-left flex space-x-2">
                                            <Link href={route('dashboard.user.edit', { user: user.id })}>
                                                <Button variant="ghost" className="p-2">
                                                    <UserPen className="h-5 w-5" />
                                                </Button>
                                            </Link>

                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}

