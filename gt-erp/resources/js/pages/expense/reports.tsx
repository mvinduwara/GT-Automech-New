import { Button } from '@/components/ui/button';
import { Head, router, usePage } from '@inertiajs/react';
import { Download, Calendar, ArrowLeft, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

interface SummaryItem {
    name: string;
    total: number;
}

interface PageProps {
    expenses: any[];
    summary: SummaryItem[];
    filters: {
        startDate: string;
        endDate: string;
    };
    [key: string]: unknown;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#475569'];

export default function Reports() {
    const { summary, filters } = usePage<PageProps>().props;
    const [startDate, setStartDate] = useState(filters.startDate);
    const [endDate, setEndDate] = useState(filters.endDate);

    const handleFilter = () => {
        router.get(route('dashboard.expense.reports'), {
            start_date: startDate,
            end_date: endDate,
        }, { preserveState: true });
    };

    const handleDownloadPdf = () => {
        window.location.href = route('dashboard.expense.reports.pdf', {
            start_date: startDate,
            end_date: endDate,
        });
    };

    const totalExpense = summary.reduce((acc, item) => acc + item.total, 0);

    return (
        <AppLayout breadcrumbs={[{ title: 'Expenses', href: route('dashboard.expense.index') }, { title: 'Reports', href: '#' }]}>
            <Head title="Expense Reports" />

            <div className="flex flex-col gap-6 p-4 md:p-6 overflow-y-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white ">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Expense Analysis</h1>
                            <p className="text-gray-500 mt-1 text-sm">Visualize and export your business expense data.</p>
                        </div>
                    </div>
                    <Button onClick={handleDownloadPdf} >
                        <Download className="h-4 w-4" /> Export PDF
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-5 rounded-2xl border shadow-sm ring-1 ring-gray-900/5">
                    <div className="flex items-center gap-2 flex-1 w-full">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="flex-1" />
                        <span className="text-gray-400">to</span>
                        <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="flex-1" />
                    </div>
                    <Button onClick={handleFilter} className="w-full md:w-auto px-8">Refresh Report</Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Summary Stats */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-2xl border shadow-sm ring-1 ring-gray-900/5 flex flex-col justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Expenditure</h3>
                            <p className="text-4xl font-black text-gray-900 mt-2">
                                LKR {totalExpense.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">Across {summary.length} categories</p>
                        </div>

                        <div className="mt-8 space-y-3 px-2">
                            {summary.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                        <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors uppercase font-medium">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-800">
                                        {((item.total / totalExpense) * 100).toFixed(1)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chart Visualization */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border shadow-sm ring-1 ring-gray-900/5">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <PieChartIcon className="h-5 w-5 text-blue-500" /> Distribution by Category
                            </h3>
                        </div>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={summary}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="total"
                                        label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {summary.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => [`LKR ${value.toLocaleString()}`, 'Amount']}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Table View */}
                <div className="bg-white p-6 rounded-2xl border shadow-sm ring-1 ring-gray-900/5 text-center">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-green-500" /> Expense Breakdown
                    </h3>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={summary} layout="vertical" margin={{ left: 40, right: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    width={150}
                                    style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    formatter={(value: number) => [`LKR ${value.toLocaleString()}`, 'Total Amount']}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="total" radius={[0, 10, 10, 0]}>
                                    {summary.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
