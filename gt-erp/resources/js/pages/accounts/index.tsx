import { Button } from '@/components/ui/button';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Plus, Trash2, Edit, ArrowLeft, Save, X, BookOpen, FileDown } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface Account {
    id: number;
    name: string;
    code: string | null;
    type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
    description: string | null;
}

interface PageProps {
    accounts: Account[];
    [key: string]: unknown;
}

const accountTypes = [
    { value: 'asset', label: 'Asset' },
    { value: 'liability', label: 'Liability' },
    { value: 'equity', label: 'Equity' },
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' },
];

export default function AccountIndex() {
    const { accounts } = usePage<PageProps>().props;
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        code: '',
        type: 'expense',
        description: '',
    });

    const openCreateDialog = () => {
        setEditingAccount(null);
        reset();
        clearErrors();
        setIsDialogOpen(true);
    };

    const openEditDialog = (account: Account) => {
        setEditingAccount(account);
        setData({
            name: account.name,
            code: account.code || '',
            type: account.type,
            description: account.description || '',
        });
        clearErrors();
        setIsDialogOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAccount) {
            put(route('dashboard.accounts.update', editingAccount.id), {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    toast.success('Account updated successfully');
                },
            });
        } else {
            post(route('dashboard.accounts.store'), {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    toast.success('Account created successfully');
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this account? Accounts with recorded transactions cannot be deleted.')) {
            destroy(route('dashboard.accounts.destroy', id), {
                onSuccess: () => toast.success('Account deleted successfully'),
                onError: (errors: any) => {
                    if (errors.error) toast.error(errors.error);
                }
            });
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'asset': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'liability': return 'bg-red-100 text-red-800 border-red-200';
            case 'equity': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'income': return 'bg-green-100 text-green-800 border-green-200';
            case 'expense': return 'bg-orange-100 text-orange-800 border-orange-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Accounts', href: '#' }]}>
            <Head title="Chart of Accounts" />

            <div className="flex flex-col gap-6 p-4 md:p-6 items-center">
                <div className="w-full max-w-5xl flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white ">
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Chart of Accounts</h1>
                                <p className="text-gray-500 text-sm">Manage your assets, liabilities, income, and expenses.</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link href={route('dashboard.accounts.reports')}>
                                <Button variant="outline" className="gap-2">
                                    <FileDown className="h-4 w-4" /> Reports
                                </Button>
                            </Link>
                            <Button onClick={openCreateDialog} className="gap-2">
                                <Plus className="h-4 w-4" /> Add Account
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/50">
                                    <TableHead className="w-[100px]">Code</TableHead>
                                    <TableHead>Account Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {accounts.length > 0 ? (
                                    accounts.map((account) => (
                                        <TableRow key={account.id} className="hover:bg-gray-50/50 transition-colors">
                                            <TableCell className="font-mono text-xs">{account.code || '-'}</TableCell>
                                            <TableCell className="font-bold text-gray-900">{account.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`${getTypeColor(account.type)} capitalize`}>
                                                    {account.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-gray-500 text-sm max-w-xs truncate">
                                                {account.description || '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50" onClick={() => openEditDialog(account)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(account.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-48 text-center text-gray-500">
                                            No accounts found. Click "Add Account" to get started.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingAccount ? 'Edit Account' : 'Add New Account'}</DialogTitle>
                        <DialogDescription>
                            Enter the details for the account. These will define your financial structure.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <label className="text-sm font-semibold text-gray-700">Account Name <span className="text-red-500">*</span></label>
                                <Input
                                    placeholder="e.g. Petty Cash, Sales Revenue"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Type <span className="text-red-500">*</span></label>
                                <Select value={data.type} onValueChange={(value: any) => setData('type', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accountTypes.map(type => (
                                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.type && <p className="text-xs text-red-500">{errors.type}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Account Code</label>
                                <Input
                                    placeholder="e.g. 1000, 5001"
                                    value={data.code}
                                    onChange={e => setData('code', e.target.value)}
                                    className={errors.code ? 'border-red-500' : ''}
                                />
                                {errors.code && <p className="text-xs text-red-500">{errors.code}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Description</label>
                            <Textarea
                                placeholder="Optional details..."
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={processing} >
                                <Save className="h-4 w-4 mr-2" /> {editingAccount ? 'Update' : 'Save'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
