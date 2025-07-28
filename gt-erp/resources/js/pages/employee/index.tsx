import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Link } from '@inertiajs/react';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Department, Employee } from '@/types/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Employees',
        href: '/dashboard/employee',
    },
];

type IndexProps = {
    employees: {
        data: Employee[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };
    departments: Department[];
    filters?: { // Made filters optional
        search?: string;
        department?: Department;
        status?: string;
    };
    success?: string;
    error?: string;
};

export default function Index({
    employees,
    departments,
    filters = {}, // Provide a default empty object for filters
    success,
    error,
}: IndexProps) {
    console.log("employees", employees)
    const [search, setSearch] = useState(filters.search || '');
    const [selectedDepartment, setSelectedDepartment] = useState(
        filters.department || '',
    );
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');

    // Show toasts for success and error messages
    useEffect(() => {
        if (success) {
            toast.success(success);
        }
        if (error) {
            toast.error(error);
        }
    }, [success, error]);

    const applyFilters = () => {
        router.get(
            '/dashboard/employee',
            {
                search,
                department: selectedDepartment,
                status: selectedStatus,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Filters applied successfully.');
                },
                onError: () => {
                    toast.error('Failed to apply filters.');
                },
            },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedDepartment('');
        setSelectedStatus('');
        router.get(
            '/dashboard/employee',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.info('Filters cleared.');
                },
                onError: () => {
                    toast.error('Failed to clear filters.');
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employees" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Employees</h1>
                    <Button asChild>
                        <Link href="/dashboard/employee/create">
                            Add New Employee
                        </Link>
                    </Button>
                </div>

                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <Label htmlFor="search">Search (Name, Email, Mobile)</Label>
                        <Input
                            id="search"
                            placeholder="Search by name, email, or mobile"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="department">Department</Label>
                        <Select
                            value={selectedDepartment}
                            onValueChange={setSelectedDepartment}
                        >
                            <SelectTrigger id="department">
                                <SelectValue placeholder="Select a department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                {departments.map((department) => (
                                    <SelectItem
                                        key={department.id}
                                        value={String(department.id)}
                                    >
                                        {department.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={selectedStatus}
                            onValueChange={setSelectedStatus}
                        >
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="deactive">Deactive</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="terminated">Terminated</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-full flex justify-end gap-2">
                        <Button onClick={applyFilters}>Apply Filters</Button>
                        <Button variant="outline" onClick={clearFilters}>
                            Clear Filters
                        </Button>
                    </div>
                </div>

                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>First Name</TableHead>
                                <TableHead>Last Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Mobile</TableHead>
                                <TableHead>Job Title</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employees.data.length > 0 ? (
                                employees.data.map((employee) => (
                                    <TableRow key={employee.id}>
                                        <TableCell>{employee.first_name}</TableCell>
                                        <TableCell>{employee.last_name}</TableCell>
                                        <TableCell>{employee.email}</TableCell>
                                        <TableCell>{employee.mobile}</TableCell>
                                        <TableCell>{employee.job_title}</TableCell>
                                        <TableCell>{employee.department?.name}</TableCell>
                                        <TableCell>{employee.status}</TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild variant="ghost" size="sm">
                                                <Link href={`/dashboard/employee/${employee.id}/edit`}>
                                                    Edit
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center">
                                        No employees found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {employees.links.length > 3 && (
                    <Pagination>
                        <PaginationContent>
                            {employees.links.map((link, index) => (
                                <PaginationItem key={index}>
                                    <PaginationLink
                                        href={link.url || '#'}
                                        isActive={link.active}
                                        onClick={(e) => {
                                            if (link.url) {
                                                e.preventDefault();
                                                router.get(link.url, {}, { preserveState: true, preserveScroll: true });
                                            }
                                        }}
                                        className={!link.url ? 'pointer-events-none opacity-50' : ''}
                                    >
                                        {link.label.includes('Previous') ? (
                                            <PaginationPrevious href={link.url || '#'} />
                                        ) : link.label.includes('Next') ? (
                                            <PaginationNext href={link.url || '#'} />
                                        ) : (
                                            link.label
                                        )}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                        </PaginationContent>
                    </Pagination>
                )}
            </div>
        </AppLayout>
    );
}
