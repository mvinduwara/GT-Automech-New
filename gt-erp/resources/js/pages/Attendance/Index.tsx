import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Upload, Search, FileUp, Clock, AlertCircle } from 'lucide-react';
import { useState, useRef, FormEvent, useEffect } from 'react';
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
import { toast } from 'sonner';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Attendance {
    id: number;
    employee_id: number;
    date: string;
    clock_in: string | null;
    clock_out: string | null;
    status: string;
    late_minutes: number;
    overtime_minutes: number;
    employee: {
        id: number;
        first_name: string;
        last_name: string;
        attendance_machine_id: string;
    } | null;
}

interface PageProps {
    attendances: {
        data: Attendance[];
        links: any[];
    };
    filters: {
        search?: string;
        from_date?: string;
        to_date?: string;
        status?: string;
    };
    flash: {
        success?: string;
        error?: string;
        import_errors?: string[];
    };
}

export default function AttendanceIndex({ attendances, filters }: PageProps) {
    const { flash } = usePage<any>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [fromDate, setFromDate] = useState(filters.from_date || '');
    const [toDate, setToDate] = useState(filters.to_date || '');
    const [status, setStatus] = useState(filters.status || '');
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handleSearch = () => {
        const params: Record<string, any> = {};
        if (search) params.search = search;
        if (fromDate) params.from_date = fromDate;
        if (toDate) params.to_date = toDate;
        if (status && status !== 'all') params.status = status;

        router.get(route('dashboard.attendance.index'), params, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setFromDate('');
        setToDate('');
        setStatus('');
        router.get(route('dashboard.attendance.index'));
    };

    const handleImport = (e: FormEvent) => {
        e.preventDefault();
        const file = fileInputRef.current?.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setIsImporting(true);
        router.post(route('dashboard.attendance.import'), formData, {
            onFinish: () => {
                setIsImporting(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
            forceFormData: true,
        });
    };

    const formatTime = (time: string | null) => {
        if (!time) return '-';
        return new Date(`1970-01-01T${time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            present: 'bg-green-100 text-green-800 hover:bg-green-100',
            late: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
            absent: 'bg-red-100 text-red-800 hover:bg-red-100',
            leave: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
            half_day: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
        };
        return (
            <Badge variant="secondary" className={`${styles[status] || 'bg-gray-100 text-gray-800'} capitalize`}>
                {status === 'late' && <Clock className="mr-1 h-3 w-3" />}
                {status}
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Attendance', href: '/dashboard/attendance' }]}>
            <Head title="Attendance" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Attendance Management</h1>
                        <p className="text-sm text-muted-foreground">Track employee attendance and import machine data</p>
                    </div>

                    <div className="flex gap-2">
                        <form onSubmit={handleImport} className="flex items-center gap-2">
                            <input
                                type="file"
                                accept=".csv,.txt"
                                ref={fileInputRef}
                                className="hidden"
                                id="csv-upload"
                                required
                            />
                            <Label htmlFor="csv-upload" className="cursor-pointer border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 rounded-md inline-flex items-center justify-center text-sm font-medium transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                                {fileInputRef.current?.files?.[0]?.name || 'Choose File'}
                            </Label>
                            <Button type="submit" disabled={isImporting}>
                                <Upload className="mr-2 h-4 w-4" />
                                {isImporting ? 'Importing...' : 'Import CSV'}
                            </Button>
                        </form>
                        <Button variant="outline" onClick={() => {
                            const params = new URLSearchParams();
                            if (search) params.append('search', search);
                            if (fromDate) params.append('from_date', fromDate);
                            if (toDate) params.append('to_date', toDate);
                            if (status && status !== 'all') params.append('status', status);
                            window.open(`${route('dashboard.attendance.export.pdf')}?${params.toString()}`, '_blank');
                        }}>
                            Export PDF
                        </Button>
                        <Button variant="outline" onClick={() => {
                            const params = new URLSearchParams();
                            if (search) params.append('search', search);
                            if (fromDate) params.append('from_date', fromDate);
                            if (toDate) params.append('to_date', toDate);
                            if (status && status !== 'all') params.append('status', status);
                            window.open(`${route('dashboard.attendance.export.excel')}?${params.toString()}`, '_blank');
                        }}>
                            Export Excel
                        </Button>
                    </div>
                </div>

                {flash?.import_errors && flash.import_errors.length > 0 && (
                    <div className="bg-destructive/15 text-destructive p-4 rounded-lg border border-destructive/20">
                        <div className="flex items-center gap-2 font-medium mb-2">
                            <AlertCircle className="h-5 w-5" />
                            Import Issues Found ({flash.import_errors.length})
                        </div>
                        <ul className="list-disc pl-5 text-sm space-y-1 max-h-40 overflow-y-auto">
                            {flash.import_errors.map((error: string, index: number) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-2">
                        <Label>Search</Label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Name, Mobile, ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch();
                                    }
                                }}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>From Date</Label>
                        <Input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>To Date</Label>
                        <Input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="present">Present</SelectItem>
                                <SelectItem value="late">Late</SelectItem>
                                <SelectItem value="absent">Absent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="col-span-full flex justify-end gap-2">
                        <Button onClick={handleSearch}>Apply Filters</Button>
                        <Button variant="outline" onClick={clearFilters}>Reset</Button>
                    </div>
                </div>

                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Clock In</TableHead>
                                <TableHead>Clock Out</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-center">Late (min)</TableHead>
                                <TableHead className="text-center">Overtime (min)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attendances.data.length > 0 ? (
                                attendances.data.map((record) => (
                                    <TableRow
                                        key={record.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => router.get(route('dashboard.attendance.employee', record.employee_id))}
                                    >
                                        <TableCell>
                                            {record.employee ? (
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{record.employee.first_name} {record.employee.last_name}</span>
                                                    <span className="text-xs text-muted-foreground">ID: {record.employee.attendance_machine_id}</span>
                                                </div>
                                            ) : (
                                                <span className="text-destructive">Unknown</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{record.date}</TableCell>
                                        <TableCell className="font-mono text-xs">{formatTime(record.clock_in)}</TableCell>
                                        <TableCell className="font-mono text-xs">{formatTime(record.clock_out)}</TableCell>
                                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                                        <TableCell className={`text-center font-medium ${record.late_minutes > 0 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                                            {record.late_minutes}
                                        </TableCell>
                                        <TableCell className={`text-center font-medium ${record.overtime_minutes > 0 ? 'text-blue-600' : 'text-muted-foreground'}`}>
                                            {record.overtime_minutes}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        No attendance records found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination - Reuse logic from Employee Index if needed or simple links */}
                {attendances.links && attendances.links.length > 3 && (
                    <div className="mt-4">
                        <Pagination>
                            <PaginationContent>
                                {attendances.links.map((link, index) => (
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
                                            <span dangerouslySetInnerHTML={{ __html: link.label }}></span>
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
