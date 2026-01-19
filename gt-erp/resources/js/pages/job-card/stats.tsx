import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Calendar, Car, Package, Shield, Wrench, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { BarChart, Bar, CartonGrid, Tooltip, Legend, ResponsiveContainer, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';
import { Button } from "@/components/ui/button";

interface ChartData {
    date: string;
    displayDate: string;
    total: number;
    general: number;
    service: number;
    insurance: number;
}

interface StatsProps {
    stats: {
        total: number;
        general: number;
        service: number;
        insurance: number;
    };
    chartData: ChartData[];
    filters: {
        start_date: string;
        end_date: string;
    };
}

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6']; // Blue, Green, Purple

const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
        <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-600">{title}</h3>
            <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <p className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
            {value}
        </p>
    </div>
);

export default function JobCardStats() {
    const { stats, chartData, filters } = usePage<any>().props as StatsProps;

    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const handleFilter = () => {
        router.get(route('dashboard.job-card.stats'), {
            start_date: startDate,
            end_date: endDate,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const pieData = [
        { name: 'General', value: stats.general },
        { name: 'Service', value: stats.service },
        { name: 'Insurance', value: stats.insurance },
    ].filter(item => item.value > 0);

    return (
        <AppLayout breadcrumbs={[
            { title: 'Job Cards', href: '/dashboard/job-card' },
            { title: 'Statistics', href: '/dashboard/job-card/stats' }
        ]}>
            <Head title="Job Card Statistics" />

            <div className="flex flex-col gap-6 p-4 md:p-6 overflow-y-auto">
                {/* Header & Filters */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => router.visit('/dashboard/job-card')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-2xl font-bold text-gray-800">Job Card Statistics</h1>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg bg-white p-2 border shadow-sm">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                        <span className="text-gray-500 text-sm">to</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                        <Button onClick={handleFilter}>Apply</Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Total Job Cards" value={stats.total} icon={Car} color="text-indigo-500" />
                    <StatCard title="General" value={stats.general} icon={Package} color="text-blue-500" />
                    <StatCard title="Service" value={stats.service} icon={Wrench} color="text-green-500" />
                    <StatCard title="Insurance" value={stats.insurance} icon={Shield} color="text-purple-500" />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Daily Trend Chart */}
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-900/5">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Job Card Trend</h3>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="displayDate" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                                <Bar dataKey="general" stackId="a" fill="#3b82f6" name="General" radius={[0, 0, 4, 4]} />
                                <Bar dataKey="service" stackId="a" fill="#10b981" name="Service" />
                                <Bar dataKey="insurance" stackId="a" fill="#8b5cf6" name="Insurance" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Distribution Pie Chart */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-900/5">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribution by Type</h3>
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
