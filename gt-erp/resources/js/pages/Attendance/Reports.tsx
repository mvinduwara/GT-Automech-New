import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Search, FileText } from 'lucide-react';
import { useState } from 'react';

interface EmployeeStat {
    employee: {
        id: number;
        first_name: string;
        last_name: string;
        attendance_machine_id: string;
    };
    present: number;
    late: number;
    absent: number;
    late_minutes: number;
    overtime_minutes: number;
}

interface PageProps {
    stats: {
        total_days: number;
        present: number;
        late: number;
        absent: number;
        total_late_minutes: number;
        total_overtime_minutes: number;
    };
    employee_stats: EmployeeStat[];
    filters: {
        month: number;
        year: number;
        employee_id?: string;
    };
    employees: Array<{ id: number, first_name: string, last_name: string }>;
}

export default function AttendanceReports({ stats, employee_stats, filters, employees }: PageProps) {
    const [month, setMonth] = useState(filters.month);
    const [year, setYear] = useState(filters.year);
    const [employeeId, setEmployeeId] = useState(filters.employee_id || '');

    const handleFilter = () => {
        router.get(route('dashboard.attendance.reports'), {
            month,
            year,
            employee_id: employeeId
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const months = [
        { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
        { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
        { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
        { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
    ];

    const chartData = [
        { name: 'Present', value: stats.present, fill: '#10b981' }, // Green
        { name: 'Late', value: stats.late, fill: '#f59e0b' },    // Amber
        { name: 'Absent', value: stats.absent, fill: '#ef4444' },  // Red
    ];

    return (
        <AppLayout breadcrumbs={[{ title: 'Attendance Reports', href: '/dashboard/attendance/reports' }]}>
            <Head title="Attendance Reports" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 md:p-6 overflow-y-auto">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Monthly Reports</h1>
                        <p className="text-sm text-gray-500">Overview of employee attendance for {months.find(m => m.value == month)?.label} {year}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Placeholder for Print/Export if needed */}
                        {/* <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            <FileText className="h-4 w-4" /> Export
                         </button> */}
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-end">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-500">Month</label>
                        <select
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                            className="border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 w-32"
                        >
                            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-500">Year</label>
                        <input
                            type="number"
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            className="border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 w-24"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-500">Employee</label>
                        <select
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            className="border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 w-48"
                        >
                            <option value="">All Employees</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleFilter}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                        <Search className="h-4 w-4" />
                        Generate Report
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-xs font-medium text-gray-500 uppercase">Present Days</p>
                        <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-xs font-medium text-gray-500 uppercase">Late Days</p>
                        <p className="text-2xl font-bold text-amber-600">{stats.late}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-xs font-medium text-gray-500 uppercase">Absent Days</p>
                        <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-xs font-medium text-gray-500 uppercase">Total Overtime (min)</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.total_overtime_minutes}</p>
                    </div>
                </div>

                {/* Employee Stats Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 font-semibold text-gray-800">
                        Employee Breakdown
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">Employee</th>
                                    <th className="px-6 py-4 text-center">Present</th>
                                    <th className="px-6 py-4 text-center">Late</th>
                                    <th className="px-6 py-4 text-center">Absent</th>
                                    <th className="px-6 py-4 text-center">Late Mins</th>
                                    <th className="px-6 py-4 text-center">OT Mins</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {employee_stats.map((stat, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {stat.employee.first_name} {stat.employee.last_name}
                                        </td>
                                        <td className="px-6 py-4 text-center text-green-600 font-medium">{stat.present}</td>
                                        <td className="px-6 py-4 text-center text-amber-600 font-medium">{stat.late}</td>
                                        <td className="px-6 py-4 text-center text-red-600 font-medium">{stat.absent}</td>
                                        <td className="px-6 py-4 text-center text-gray-600">{stat.late_minutes}</td>
                                        <td className="px-6 py-4 text-center text-blue-600 font-bold">{stat.overtime_minutes}</td>
                                    </tr>
                                ))}
                                {employee_stats.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                                            No data available for this period.
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
