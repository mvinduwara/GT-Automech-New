import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { pettyCash } from '@/types/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Download, ExternalLink, FileDown, FileText } from 'lucide-react';
import React from 'react';

interface Props {
    vouchers: pettyCash[];
    summary: {
        date: string;
        total_requested: number;
        total_spent: number;
        total_balance: number;
        voucher_count: number;
        finalized_count: number;
    };
}

export default function DailyReportShow({ vouchers, summary }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Petty Cash Daily Reports', href: route('dashboard.reports.petty_cash_daily') },
        { title: `Report ${summary.date}`, href: route('dashboard.reports.petty_cash_daily.show', summary.date) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Petty Cash Report - ${summary.date}`} />

            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <Link href={route('dashboard.reports.petty_cash_daily')}>
                        <Button variant="ghost" className="gap-2">
                            <ArrowLeft className="w-4 h-4" /> Back to Summaries
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Daily Report: {new Date(summary.date).toLocaleDateString()}</h1>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="text-green-600 border-green-200 hover:bg-green-50 gap-2"
                            onClick={() => window.location.href = route('dashboard.reports.petty_cash_daily.day_export', summary.date)}
                        >
                            <FileDown className="w-4 h-4" /> Export Excel
                        </Button>
                        <Button
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50 gap-2"
                            onClick={() => window.location.href = route('dashboard.reports.petty_cash_daily.download_pdf', summary.date)}
                        >
                            <FileText className="w-4 h-4" /> Download PDF
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Vouchers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{summary.voucher_count}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Requested</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">LKR {parseFloat(summary.total_requested.toString()).toLocaleString()}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-blue-100 bg-blue-50/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-blue-600 uppercase">Total Spent</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-blue-700">LKR {parseFloat(summary.total_spent?.toString() || '0').toLocaleString()}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-green-100 bg-green-50/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-green-600 uppercase">Total Balance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-green-700">LKR {parseFloat(summary.total_balance?.toString() || '0').toLocaleString()}</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="bg-white rounded-xl shadow-sm border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Voucher #</TableHead>
                                <TableHead>Payee</TableHead>
                                <TableHead className="text-right">Requested</TableHead>
                                <TableHead className="text-right">Actual Spent</TableHead>
                                <TableHead className="text-right">Balance</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">View</TableHead>
                                <TableHead className="text-center">PDF</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vouchers.map((voucher) => (
                                <TableRow key={voucher.id}>
                                    <TableCell className="font-medium">{voucher.voucher_number}</TableCell>
                                    <TableCell>{voucher.name}</TableCell>
                                    <TableCell className="text-right">{parseFloat(voucher.requested_amount.toString()).toLocaleString()}</TableCell>
                                    <TableCell className="text-right">{voucher.actual_amount ? parseFloat(voucher.actual_amount.toString()).toLocaleString() : '-'}</TableCell>
                                    <TableCell className="text-right">{voucher.balance_amount ? parseFloat(voucher.balance_amount.toString()).toLocaleString() : '-'}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={voucher.finalized_at ? 'default' : 'outline'}>
                                            {voucher.finalized_at ? 'FINALIZED' : voucher.status.toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Link href={route('dashboard.petty-cash.show', voucher.voucher_number)}>
                                            <Button variant="ghost" size="sm">
                                                <ExternalLink className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => window.location.href = route('dashboard.petty-cash.download-pdf', voucher.voucher_number)}
                                        >
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
