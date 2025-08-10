import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Calendar, Clock, TrendingUp, Users, DollarSign, Activity } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];


// Get current time greeting
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
};

// Get current date
const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export default function Dashboard() {

    const { auth } = usePage().props;

    // Mock user data - replace with actual auth user data
    const user = {
        name: auth?.user?.name,
        avatar: `https://ui-avatars.com/api/?name=${auth.user.name}&background=3b82f6&color=fff`
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                {/* Welcome Section */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 p-8 text-white">
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold">
                                {getGreeting()}, {user.name}! 👋
                            </h1>
                            <p className="text-blue-100 text-lg">
                                Welcome back to your dashboard
                            </p>
                            <div className="flex items-center gap-4 text-sm text-blue-100 mt-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{getCurrentDate()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{new Date().toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}</span>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="h-20 w-20 rounded-full border-4 border-white/20 shadow-lg"
                            />
                        </div>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white"></div>
                        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white"></div>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}