import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Download, Eye, Filter, X } from 'lucide-react';
import React from 'react';

interface Summary {
    report_date: string;
    voucher_count: number;
    total_requested: number;
    total_spent: number;
    total_balance: number;
    finalized_count: number;
}

interface Props {
    summaries: {
        data: Summary[];
        links: any[];
    };
    filters: {
        date_from?: string;
        date_to?: string;
    };
}

export default function DailyReportIndex({ summaries, filters }: Props) {
    const [dateFrom, setDateFrom] = React.useState(filters.date_from || '');
    const [dateTo, setDateTo] = React.useState(filters.date_to || '');

    const handleFilter = () => {
        router.get(route('dashboard.reports.petty_cash_daily'), {
            date_from: dateFrom,
            date_to: dateTo
        }, { preserveState: true });
    };

    const handleClear = () => {
        setDateFrom('');
        setDateTo('');
        router.get(route('dashboard.reports.petty_cash_daily'));
    };

    const handleExport = () => {
        window.location.href = route('dashboard.reports.petty_cash_daily.export', {
            date_from: dateFrom,
            date_to: dateTo
        });
    };
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Reports', href: route('dashboard.reports.petty_cash_daily') },
        { title: 'Petty Cash Daily Reports', href: route('dashboard.reports.petty_cash_daily') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Petty Cash Daily Reports" />
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Petty Cash Daily Summaries</h1>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border space-y-4">
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="space-y-1">
                            <Label className="text-xs uppercase text-muted-foreground">From Date</Label>
                            <Input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-48"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs uppercase text-muted-foreground">To Date</Label>
                            <Input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-48"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleFilter} className="gap-2">
                                <Filter className="w-4 h-4" /> Filter
                            </Button>
                            {(dateFrom || dateTo) && (
                                <Button variant="outline" onClick={handleClear} size="icon">
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                        <div className="ml-auto">
                            <Button variant="outline" onClick={handleExport} className="gap-2 text-green-600 border-green-200 hover:bg-green-50">
                                <Download className="w-4 h-4" /> Export Excel
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-center">Vouchers</TableHead>
                                <TableHead className="text-right">Total Requested</TableHead>
                                <TableHead className="text-right">Total Spent</TableHead>
                                <TableHead className="text-right">Total Balance</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {summaries.data.map((summary) => (
                                <TableRow key={summary.report_date}>
                                    <TableCell className="font-medium">{new Date(summary.report_date).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-center">{summary.voucher_count}</TableCell>
                                    <TableCell className="text-right">LKR {parseFloat(summary.total_requested.toString()).toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-medium text-blue-600">LKR {parseFloat(summary.total_spent?.toString() || '0').toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-medium text-green-600">LKR {parseFloat(summary.total_balance?.toString() || '0').toLocaleString()}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={summary.finalized_count === summary.voucher_count ? 'default' : 'outline'}>
                                            {summary.finalized_count} / {summary.voucher_count} Finalized
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Link href={route('dashboard.reports.petty_cash_daily.show', summary.report_date)}>
                                            <Button variant="ghost" size="icon">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {summaries.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground italic">
                                        No reports found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
