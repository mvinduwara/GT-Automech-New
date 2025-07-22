import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { UserPen } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Employees',
        href: '/dashboard/employee',
    },
];

export default function Index({ employee }: { employee: any[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employee" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="h1 font-bold">All Registered Employees</h1>
                    <Link href={route('dashboard.employee.create')}>
                        <Button>Register New Employee</Button>
                    </Link>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex w-full items-center gap-2 md:max-w-md">
                        <Input type="text" placeholder="Search employees..." className="w-full" />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <select className="rounded-xl border px-4 py-2 text-sm text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                            <option value="">All Departments</option>
                            <option value="hr">HR</option>
                            <option value="finance">Finance</option>
                            <option value="engineering">Engineering</option>
                        </select>

                        <select className="rounded-xl border px-4 py-2 text-sm text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        <Button variant={'secondary'}>Apply Filters</Button>
                    </div>
                </div>

                <div className="flex h-full flex-1 flex-col overflow-y-auto">
                    <Table className="w-full table-fixed">
                        <TableCaption>A list of your recent employees</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px] text-left">Employee Name</TableHead>
                                <TableHead className="w-[250px] text-left">Email</TableHead>
                                <TableHead className="w-[150px] text-left">Mobile</TableHead>
                                <TableHead className="w-[100px] text-left">Department</TableHead>
                                <TableHead className="w-[100px] text-left">Status</TableHead>
                                <TableHead className="w-[100px] text-left">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {employee.map((employee) => (
                                <TableRow key={employee.id}>
                                    <TableCell className="w-[200px] text-left font-medium">
                                        {employee.first_name + ' ' + employee.last_name}
                                    </TableCell>
                                    <TableCell className="w-[250px] text-left">{employee.email}</TableCell>
                                    <TableCell className="w-[150px] text-left">{employee.mobile}</TableCell>
                                    <TableCell className="w-[100px] text-left">{employee.department?.name ?? 'N/A'}</TableCell>
                                    <TableCell className="w-[100px] text-left">{employee.status}</TableCell>
                                    <TableCell className="w-[100px] text-left">
                                        <div className="justify-left flex space-x-2">
                                            <Link href={route('dashboard.employee.edit', { id: employee.id })}>
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
