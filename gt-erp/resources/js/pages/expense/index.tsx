import { Button } from '@/components/ui/button';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Search, Filter, FileText, Trash2, Edit, ExternalLink, Download, X, LayoutGrid } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface Expense {
    id: number;
    date: string;
    amount: string;
    description: string | null;
    payment_method: string;
    reference_number: string | null;
    proof_path: string | null;
    account: { id: number; name: string };
    user: { id: number; name: string };
}

interface PageProps {
    expenses: {
        data: Expense[];
        links: any[];
        meta: any;
    };
    accounts: { id: number; name: string }[];
    filters: any;
    [key: string]: unknown;
}

export default function Index() {
    const { expenses, accounts, filters } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [accountId, setAccountId] = useState(filters.account_id || 'all');
    const [paymentMethod, setPaymentMethod] = useState(filters.payment_method || 'all');

    const handleFilter = () => {
        router.get(route('dashboard.expense.index'), {
            search,
            start_date: startDate,
            end_date: endDate,
            account_id: accountId === 'all' ? '' : accountId,
            payment_method: paymentMethod === 'all' ? '' : paymentMethod,
        }, { preserveState: true });
    };

    const handleClear = () => {
        setSearch('');
        setStartDate('');
        setEndDate('');
        setAccountId('all');
        setPaymentMethod('all');
        router.get(route('dashboard.expense.index'), {}, { preserveState: true });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this expense? This will also remove the ledger entry.')) {
            router.delete(route('dashboard.expense.destroy', id), {
                onSuccess: () => toast.success('Expense deleted successfully'),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Expenses', href: '#' }]}>
            <Head title="Expense Management" />

            <div className="flex flex-col gap-6 p-4 md:p-6 overflow-y-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Expense Management</h1>
                        <p className="text-gray-500 mt-1 text-sm">Review, record, and track your business expenses.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href={route('dashboard.expense.categories.index')}>
                            <Button variant="outline" className="gap-2">
                                <LayoutGrid className="h-4 w-4" /> Categories
                            </Button>
                        </Link>
                        <Link href={route('dashboard.expense.reports')}>
                            <Button variant="outline" className="gap-2">
                                <FileText className="h-4 w-4" /> Reports
                            </Button>
                        </Link>
                        <Link href={route('dashboard.expense.create')}>
                            <Button >
                                <Plus className="h-4 w-4" /> Add Expense
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Advanced Filters */}
                <div className="bg-white flex flex-col justify-start items-start gap-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Search</label>
                            <Input
                                placeholder="Description / Ref..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Category</label>
                            <Select value={accountId} onValueChange={setAccountId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {accounts.map(acc => (
                                        <SelectItem key={acc.id} value={acc.id.toString()}>{acc.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Payment Method</label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Methods" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Methods</SelectItem>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="cheque">Cheque</SelectItem>
                                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                    <SelectItem value="card">Card</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1 col-span-1 md:col-span-2 flex items-end gap-2">
                            <div className="flex-1 space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">From</label>
                                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                            </div>
                            <div className="flex-1 space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">To</label>
                                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 space-y-1 flex gap-2">
                        <Button onClick={handleFilter} className="">
                            <Filter className="h-4 w-4 mr-2" /> Apply
                        </Button>
                        <Button onClick={handleClear} variant="outline">
                            <X className="h-4 w-4 mr-2" /> Clear
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50">
                                <TableHead className="w-[120px]">Date</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-center">Proof</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expenses.data.length > 0 ? (
                                expenses.data.map((expense) => (
                                    <TableRow key={expense.id} className="hover:bg-gray-50/50 transition-colors">
                                        <TableCell className="font-medium">{new Date(expense.date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                {expense.account.name}
                                            </span>
                                        </TableCell>
                                        <TableCell className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                                            {expense.description || '-'}
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-red-600">
                                            LKR {Number(expense.amount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {expense.proof_path ? (
                                                <a href={'/storage/' + expense.proof_path} target="_blank" rel="noopener noreferrer">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Button>
                                                </a>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={route('dashboard.expense.edit', expense.id)}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-600"
                                                    onClick={() => handleDelete(expense.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                                        No expenses found matching your filters.
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
