import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Calendar, Clock, DollarSign, Package, Store, TrendingDown, TrendingUp, Car, Wrench, Shield, type LucideIcon } from 'lucide-react';
import { useState, type FC, type ReactNode } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Types ---
interface ChartData {
    month: string;
    income: number;
    expenses: number;
    profit: number;
}

interface CategoryData {
    name: string;
    value: number;
}

interface FinancialSummary {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    filters: {
        startDate: string;
        endDate: string;
    };
    chartData: ChartData[];
    expensesByCategory: CategoryData[];
    incomeByCategory: CategoryData[];
    jobCardStats: {
        total: number;
        general: number;
        service: number;
        insurance: number;
    };
}

interface PageProps {
    auth: {
        user: {
            name: string;
        }
    };
    financialSummary: FinancialSummary;
}

// --- Helper Functions ---
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
};

const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 2,
    }).format(amount);
};

// Color palettes
const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f97316', '#6366f1'];
const INCOME_COLOR = '#10b981';
const EXPENSE_COLOR = '#ef4444';
const PROFIT_COLOR = '#3b82f6';

// --- Sub-Components ---
export const FinancialSummaryCard: FC<{ title: string; value: number | string; icon: LucideIcon; color: string }> = ({ title, value, icon: Icon, color }) => (
    <div className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
        <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-600">{title}</h3>
            <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <p className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
            {typeof value === 'number' && (title.includes("Income") || title.includes("Expenses") || title.includes("Profit") || title.includes("Value")) ? formatCurrency(value) : value}
        </p>
    </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                <p className="font-semibold text-gray-900 mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} style={{ color: entry.color }} className="text-sm">
                        {entry.name}: {formatCurrency(entry.value)}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// --- Main Component ---
export default function Dashboard() {
    const { auth, financialSummary } = usePage<PageProps>().props;

    const [viewType, setViewType] = useState<'monthly' | 'yearly'>('monthly');
    const [startDate, setStartDate] = useState(financialSummary.filters.startDate);
    const [endDate, setEndDate] = useState(financialSummary.filters.endDate);

    const handleQuickFilter = (type: 'monthly' | 'yearly') => {
        setViewType(type);
        const now = new Date();
        let start, end;

        if (type === 'monthly') {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        } else {
            start = new Date(now.getFullYear(), 0, 1);
            end = new Date(now.getFullYear(), 11, 31);
        }

        const startStr = start.toISOString().split('T')[0];
        const endStr = end.toISOString().split('T')[0];

        setStartDate(startStr);
        setEndDate(endStr);

        router.get(route('dashboard'), {
            start_date: startStr,
            end_date: endStr,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleReportGeneration = () => {
        router.get(route('dashboard'), {
            start_date: startDate,
            end_date: endDate,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const user = {
        name: auth?.user?.name,
        avatar: `https://ui-avatars.com/api/?name=${auth.user.name}&background=3b82f6&color=fff`
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 md:p-6 overflow-y-auto">
                {/* Welcome Section */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 p-6 md:p-8 text-white">
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="space-y-2">
                            <h1 className="text-2xl md:text-3xl font-bold">
                                {getGreeting()}, {user.name}! 👋
                            </h1>
                            <p className="text-blue-100 text-base md:text-lg">Welcome back to your dashboard</p>
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-sm text-blue-100 pt-2">
                                <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /><span>{getCurrentDate()}</span></div>
                                <div className="flex items-center gap-2"><Clock className="h-4 w-4" /><span>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span></div>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <img src={user.avatar} alt={user.name} className="h-20 w-20 rounded-full border-4 border-white/20 shadow-lg" />
                        </div>
                    </div>
                </div>

                {auth?.user?.role === "admin" && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <h2 className="text-xl font-semibold text-gray-800">Financial Summary</h2>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
                                {/* Quick Filters */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleQuickFilter('monthly')}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${viewType === 'monthly'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        Monthly
                                    </button>
                                    <button
                                        onClick={() => handleQuickFilter('yearly')}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${viewType === 'yearly'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        Yearly
                                    </button>
                                </div>

                                {/* Custom Date Range */}
                                <div className="flex items-center gap-2 rounded-lg bg-white p-2 border">
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    />
                                    <span className="text-gray-500 text-sm">to</span>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                        className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    />
                                    <button
                                        onClick={handleReportGeneration}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <FinancialSummaryCard
                                title="Total Income"
                                value={financialSummary.totalIncome}
                                icon={DollarSign}
                                color="text-green-500"
                            />
                            <FinancialSummaryCard
                                title="Total Expenses"
                                value={financialSummary.totalExpenses}
                                icon={TrendingDown}
                                color="text-red-500"
                            />
                            <FinancialSummaryCard
                                title="Net Profit"
                                value={financialSummary.netProfit}
                                icon={TrendingUp}
                                color={financialSummary.netProfit >= 0 ? "text-blue-500" : "text-amber-500"}
                            />
                        </div>

                        {/* Job Card Statistics */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-800">Job Card Statistics (Period Verified)</h2>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                                <FinancialSummaryCard
                                    title="Total Job Cards"
                                    value={financialSummary.jobCardStats.total}
                                    icon={Car}
                                    color="text-indigo-500"
                                // Override helper to show integer not currency
                                />
                                <FinancialSummaryCard
                                    title="General"
                                    value={financialSummary.jobCardStats.general}
                                    icon={Package}
                                    color="text-blue-500"
                                />
                                <FinancialSummaryCard
                                    title="Service"
                                    value={financialSummary.jobCardStats.service}
                                    icon={Wrench}
                                    color="text-green-500"
                                />
                                <FinancialSummaryCard
                                    title="Insurance"
                                    value={financialSummary.jobCardStats.insurance}
                                    icon={Shield}
                                    color="text-purple-500"
                                />
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Income vs Expenses Line Chart */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-900/5">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Income vs Expenses Trend</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={financialSummary.chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                        <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Line type="monotone" dataKey="income" stroke={INCOME_COLOR} strokeWidth={3} dot={{ r: 5 }} name="Income" />
                                        <Line type="monotone" dataKey="expenses" stroke={EXPENSE_COLOR} strokeWidth={3} dot={{ r: 5 }} name="Expenses" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Profit/Loss Bar Chart */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-900/5">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Profit/Loss</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={financialSummary.chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                        <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar dataKey="profit" fill={PROFIT_COLOR} radius={[8, 8, 0, 0]} name="Profit/Loss" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Expenses by Category Pie Chart */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-900/5">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Expenses by Category</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={financialSummary.expensesByCategory}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {financialSummary.expensesByCategory.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Income by Category Pie Chart */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-900/5">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Income by Category</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={financialSummary.incomeByCategory}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {financialSummary.incomeByCategory.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout >
    );
}