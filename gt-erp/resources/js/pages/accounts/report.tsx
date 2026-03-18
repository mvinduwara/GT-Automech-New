import { Button } from '@/components/ui/button';
import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar as CalendarIcon, FileDown, Search } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Account {
    id: number;
    name: string;
    code: string | null;
    type: string;
}

interface LedgerEntry {
    id: number;
    account_id: number;
    date: string;
    description: string;
    debit: string;
    credit: string;
    transactionable_type: string;
    transactionable_id: number;
    account: Account;
}

interface PageProps {
    accounts: Account[];
    entries: LedgerEntry[];
    filters: {
        account_id: string | null;
        start_date: string;
        end_date: string;
    };
    [key: string]: unknown;
}

export default function AccountReport() {
    const { accounts, entries, filters } = usePage<PageProps>().props;

    const { data, setData, get, processing } = useForm({
        account_id: filters.account_id || '',
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get(route('dashboard.accounts.reports'), {
            preserveState: true,
        });
    };

    const totalDebit = entries.reduce((sum, entry) => sum + parseFloat(entry.debit || '0'), 0);
    const totalCredit = entries.reduce((sum, entry) => sum + parseFloat(entry.credit || '0'), 0);
    const balance = totalDebit - totalCredit;

    return (
        <AppLayout breadcrumbs={[{ title: 'Accounts', href: route('dashboard.accounts.index') }, { title: 'Ledger Report', href: '#' }]}>
            <Head title="Account Ledger Report" />

            <div className="flex flex-col gap-6 p-4 md:p-6 items-center">
                <div className="w-full max-w-6xl flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Account Ledger Report</h1>
                                <p className="text-gray-500 text-sm">View detailed transaction history for your accounts.</p>
                            </div>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Report Filters</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase text-gray-500">Account</label>
                                    <Select value={data.account_id} onValueChange={(value) => setData('account_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Accounts" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value=" ">All Accounts</SelectItem>
                                            {accounts.map(account => (
                                                <SelectItem key={account.id} value={account.id.toString()}>
                                                    {account.code ? `[${account.code}] ` : ''}{account.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase text-gray-500">Start Date</label>
                                    <Input type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase text-gray-500">End Date</label>
                                    <Input type="date" value={data.end_date} onChange={e => setData('end_date', e.target.value)} />
                                </div>
                                <Button type="submit" disabled={processing} className="w-full">
                                    <Search className="h-4 w-4 mr-2" /> Search
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-blue-50/50 border-blue-100">
                            <CardContent className="pt-6">
                                <p className="text-xs font-semibold uppercase text-blue-600 mb-1">Total Debit</p>
                                <p className="text-2xl font-bold text-blue-900">LKR {totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-red-50/50 border-red-100">
                            <CardContent className="pt-6">
                                <p className="text-xs font-semibold uppercase text-red-600 mb-1">Total Credit</p>
                                <p className="text-2xl font-bold text-red-900">LKR {totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                            </CardContent>
                        </Card>
                        <Card className={`${balance >= 0 ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
                            <CardContent className="pt-6">
                                <p className={`text-xs font-semibold uppercase ${balance >= 0 ? 'text-green-600' : 'text-red-600'} mb-1`}>Net Balance</p>
                                <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-900' : 'text-red-900'}`}>LKR {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="bg-white rounded-2xl border shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/50">
                                    <TableHead className="w-[120px]">Date</TableHead>
                                    <TableHead>Account</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Debit</TableHead>
                                    <TableHead className="text-right">Credit</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {entries.length > 0 ? (
                                    entries.map((entry) => (
                                        <TableRow key={entry.id} className="hover:bg-gray-50/50 transition-colors">
                                            <TableCell className="text-sm">{entry.date}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{entry.account.name}</span>
                                                    <span className="text-xs text-gray-500">{entry.account.type}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600">{entry.description}</TableCell>
                                            <TableCell className="text-right font-mono text-blue-600">
                                                {entry.debit && entry.debit !== "0.00" ? parseFloat(entry.debit).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-red-600">
                                                {entry.credit && entry.credit !== "0.00" ? parseFloat(entry.credit).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-48 text-center text-gray-500">
                                            No ledger entries found for the selected criteria.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
