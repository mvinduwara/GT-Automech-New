import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, Download, Search, Clock } from 'lucide-react';
import { useState } from 'react';

interface Attendance {
    id: number;
    date: string;
    clock_in: string | null;
    clock_out: string | null;
    status: string;
    late_minutes: number;
    overtime_minutes: number;
}

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    attendance_machine_id: string;
    job_title: string;
    mobile: string;
    email: string;
}

interface PageProps {
    employee: Employee;
    attendances: {
        data: Attendance[];
        links: any[]; // You can add pagination component if needed
    };
    filters: {
        from_date?: string;
        to_date?: string;
    };
}

export default function EmployeeHistory({ employee, attendances, filters }: PageProps) {
    const [fromDate, setFromDate] = useState(filters.from_date || '');
    const [toDate, setToDate] = useState(filters.to_date || '');

    const handleFilter = () => {
        const params: Record<string, any> = {};
        if (fromDate) params.from_date = fromDate;
        if (toDate) params.to_date = toDate;

        router.get(route('dashboard.attendance.employee', employee.id), params, {
            preserveState: true,
            replace: true,
        });
    };

    const formatTime = (time: string | null) => {
        if (!time) return '-';
        return new Date(`1970-01-01T${time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Attendance', href: '/attendance' },
            { title: `${employee.first_name} ${employee.last_name}`, href: '' }
        ]}>
            <Head title={`Attendance - ${employee.first_name} ${employee.last_name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 md:p-6 overflow-y-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => window.history.back()} className="p-2 hover:bg-gray-100 rounded-full">
                            <ArrowLeft className="h-5 w-5 text-gray-500" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{employee.first_name} {employee.last_name}</h1>
                            <p className="text-sm text-gray-500">{employee.job_title} • ID: {employee.attendance_machine_id}</p>
                        </div>
                    </div>
                </div>

                {/* Statistics / filters */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-end">
                    <div className="flex gap-4 items-end w-full md:w-auto">
                        <div className="flex flex-col gap-1 w-full md:w-auto">
                            <label className="text-xs font-medium text-gray-500">From Date</label>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex flex-col gap-1 w-full md:w-auto">
                            <label className="text-xs font-medium text-gray-500">To Date</label>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            onClick={handleFilter}
                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 flex items-center gap-2 text-sm font-medium transition-colors"
                        >
                            <Search className="h-4 w-4" />
                            Filter
                        </button>
                    </div>

                    <div className="flex gap-2">
                        {/* Placeholder for export buttons */}
                        <button
                            onClick={() => {
                                const params = new URLSearchParams();
                                params.append('employee_id', employee.id.toString());
                                if (fromDate) params.append('from_date', fromDate);
                                if (toDate) params.append('to_date', toDate);
                                window.open(`${route('dashboard.attendance.export.pdf')}?${params.toString()}`, '_blank');
                            }}
                            className="border border-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center gap-2 text-sm font-medium transition-colors"
                        >
                            <Download className="h-4 w-4" />
                            Export PDF
                        </button>
                        <button
                            onClick={() => {
                                const params = new URLSearchParams();
                                params.append('employee_id', employee.id.toString());
                                if (fromDate) params.append('from_date', fromDate);
                                if (toDate) params.append('to_date', toDate);
                                window.open(`${route('dashboard.attendance.export.excel')}?${params.toString()}`, '_blank');
                            }}
                            className="border border-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center gap-2 text-sm font-medium transition-colors"
                        >
                            <Download className="h-4 w-4" />
                            Export Excel
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Clock In</th>
                                    <th className="px-6 py-4">Clock Out</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Late (min)</th>
                                    <th className="px-6 py-4 text-center">Overtime (min)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {attendances.data.length > 0 ? (
                                    attendances.data.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-gray-600 font-medium">{record.date}</td>
                                            <td className="px-6 py-4 text-gray-600 font-mono">{formatTime(record.clock_in)}</td>
                                            <td className="px-6 py-4 text-gray-600 font-mono">{formatTime(record.clock_out)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border
                                                    ${record.status === 'present' ? 'bg-green-50 text-green-700 border-green-200' :
                                                        record.status === 'late' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                            'bg-gray-50 text-gray-700 border-gray-200'}`}>
                                                    {record.status === 'late' && <Clock className="h-3 w-3" />}
                                                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 text-center font-medium ${record.late_minutes > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                                                {record.late_minutes}
                                            </td>
                                            <td className={`px-6 py-4 text-center font-medium ${record.overtime_minutes > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                                                {record.overtime_minutes}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                            No attendance records found for this period.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
