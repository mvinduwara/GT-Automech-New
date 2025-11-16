import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { FinancialSummaryCard } from '../dashboard';
import { Package, Store } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory',
        href: '/dashboard/inventory',
    },
];

interface InventoryStats {
    categories: { count: number; change: string; trend: 'up' | 'down' };
    brands: { count: number; change: string; trend: 'up' | 'down' };
    products: { count: number; change: string; trend: 'up' | 'down' };
    stock: { count: number; change: string; trend: 'up' | 'down' };
    totalStockBuyingValue: number;
    totalStockSellingValue: number;
}

interface IndexProps {
    stats: InventoryStats;
    insights?: any;
}

interface StatCardProps {
    title: string;
    count: number;
    change: string;
    trend: 'up' | 'down';
    href: string;
    color: 'green' | 'yellow' | 'orange' | 'blue' | 'purple';
}

const StatCard = ({ title, count, change, trend, href, color }: StatCardProps) => {
    const colorClasses = {
        green: 'from-green-50 to-green-100 border-green-200',
        yellow: 'from-yellow-50 to-yellow-100 border-yellow-200',
        orange: 'from-orange-50 to-orange-100 border-orange-200',
        blue: 'from-blue-50 to-blue-100 border-blue-200',
        purple: 'from-purple-50 to-purple-100 border-purple-200',
    };

    const trendColors = {
        up: 'text-green-600',
        down: 'text-red-600',
    };

    const sparklineColor = {
        green: '#10b981',
        yellow: '#f59e0b',
        orange: '#f97316',
        blue: '#3b82f6',
        purple: '#8b5cf6',
    };

    return (
        <Link href={href}>
            <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-lg p-6 hover:shadow-md transition-all duration-200 cursor-pointer h-full`}>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-sm font-medium text-gray-600 capitalize">{title}</h3>
                    <div className="w-16 h-8">
                        {/* Simple sparkline representation */}
                        <svg viewBox="0 0 64 32" className="w-full h-full">
                            <path
                                d="M0,20 Q16,15 32,18 T64,12"
                                stroke={sparklineColor[color]}
                                strokeWidth="2"
                                fill="none"
                                className="opacity-60"
                            />
                        </svg>
                    </div>
                </div>

                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-2xl font-bold text-gray-900 mb-1">
                            {count.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-1">
                            <span className={`text-xs font-medium ${trendColors[trend]}`}>
                                {trend === 'up' ? '↗' : '↘'} {change}
                            </span>
                            <span className="text-xs text-gray-500">last week</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default function Index({ stats }: IndexProps) {
    const { auth } = usePage().props;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Inventory Overview</h1>
                </div>

                {/* Stats Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    <Link href="/dashboard/category">
                        <div className='flex flex-col justify-center items-start gap-4 rounded-md shadow-md p-5
                        bg-gradient-to-r from-red-200 to-orange-200'>
                            <p className='text-neutral-600 font-medium'>Categories</p>
                            <h1>{stats.categories.count}</h1>
                        </div>
                    </Link>
                    <Link href="/dashboard/brand">
                        <div className='flex flex-col justify-center items-start gap-4 rounded-md shadow-md p-5
                        bg-gradient-to-r from-violet-200 to-pink-200'>
                            <p className='text-neutral-600 font-medium'>Brands</p>
                            <h1>{stats.brands.count}</h1>
                        </div>
                    </Link>
                    <Link href="/dashboard/product">
                        <div className='flex flex-col justify-center items-start gap-4 rounded-md shadow-md p-5
                        bg-gradient-to-r from-teal-200 to-yellow-200'>
                            <p className='text-neutral-600 font-medium'>Products</p>
                            <h1>{stats.products.count}</h1>
                        </div>
                    </Link>
                    <Link href="/dashboard/stock">
                        <div className='flex flex-col justify-center items-start gap-4 rounded-md shadow-md p-5
                        bg-gradient-to-r from-amber-200 to-pink-200'>
                            <p className='text-neutral-600 font-medium'>Stock</p>
                            <h1>{stats.stock.count}</h1>
                        </div>
                    </Link>

                </div>

                {auth?.user?.role === "admin" && (
                    <div className="mt-8 flex justify-start gap-3 items-center">
                        <FinancialSummaryCard
                            title="Stock Buying Value"
                            value={stats.totalStockBuyingValue}
                            icon={Package}
                            color="text-purple-500"
                        />
                        <FinancialSummaryCard
                            title="Stock Selling Value (EST)"
                            value={stats.totalStockSellingValue}
                            icon={Store}
                            color="text-pink-500"
                        />
                    </div>
                )}
                <div className="mt-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link href="/dashboard/category">
                            <Button variant="outline" className="w-full justify-start">
                                📁 Manage Categories
                            </Button>
                        </Link>
                        <Link href="/dashboard/brand">
                            <Button variant="outline" className="w-full justify-start">
                                🏷️ Manage Brands
                            </Button>
                        </Link>
                        <Link href="/dashboard/product">
                            <Button variant="outline" className="w-full justify-start">
                                📦 Manage Products
                            </Button>
                        </Link>
                        <Link href="/dashboard/stock">
                            <Button variant="outline" className="w-full justify-start">
                                📊 Manage Stock
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout >
    );
}