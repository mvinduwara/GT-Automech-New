import { Button } from '@/components/ui/button';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, Upload, AlertCircle, FileText } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Expense {
    id: number;
    account_id: number;
    date: string;
    amount: string;
    description: string | null;
    payment_method: string;
    reference_number: string | null;
    proof_path: string | null;
}

interface PageProps {
    expense: Expense;
    accounts: { id: number; name: string }[];
    [key: string]: unknown;
}

export default function Edit() {
    const { expense, accounts } = usePage<PageProps>().props;
    
    // We use POST with _method=PUT to handle multipart/form-data with file uploads correctly in Laravel
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        account_id: expense.account_id.toString(),
        date: expense.date.split('T')[0],
        amount: expense.amount,
        description: expense.description || '',
        payment_method: expense.payment_method,
        reference_number: expense.reference_number || '',
        proof: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // Laravel's useForm doesn't support PUT with Files directly via 'put' method, 
        // so we use 'post' and pass _method: 'PUT' in data.
        post(route('dashboard.expense.update', expense.id), {
            onSuccess: () => toast.success('Expense updated successfully'),
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Expenses', href: route('dashboard.expense.index') }, { title: 'Edit', href: '#' }]}>
            <Head title="Edit Expense" />
            
            <div className="flex flex-col gap-6 p-4 md:p-6 items-center">
                <div className="w-full max-w-3xl flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <Link href={route('dashboard.expense.index')}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Edit Expense</h1>
                            <p className="text-gray-500 text-sm">Update the details of the recorded expense.</p>
                        </div>
                    </div>

                    <form onSubmit={submit} className="bg-white p-8 rounded-2xl border shadow-sm ring-1 ring-gray-900/5 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Category / Account <span className="text-red-500">*</span></label>
                                <Select value={data.account_id} onValueChange={val => setData('account_id', val)}>
                                    <SelectTrigger className={errors.account_id ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accounts.map(acc => (
                                            <SelectItem key={acc.id} value={acc.id.toString()}>{acc.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.account_id && <p className="text-xs text-red-500">{errors.account_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Date <span className="text-red-500">*</span></label>
                                <Input type="date" value={data.date} onChange={e => setData('date', e.target.value)} className={errors.date ? 'border-red-500' : ''} />
                                {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Amount (LKR) <span className="text-red-500">*</span></label>
                                <Input type="number" step="0.01" placeholder="0.00" value={data.amount} onChange={e => setData('amount', e.target.value)} className={errors.amount ? 'border-red-500' : ''} />
                                {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Payment Method <span className="text-red-500">*</span></label>
                                <Select value={data.payment_method} onValueChange={val => setData('payment_method', val)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="cheque">Cheque</SelectItem>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="card">Card</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Reference Number</label>
                            <Input placeholder="Receipt # / Invoice # / Transaction ID" value={data.reference_number} onChange={e => setData('reference_number', e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Description</label>
                            <Textarea rows={3} placeholder="Brief details about this expense..." value={data.description} onChange={e => setData('description', e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Attachment (Proof / Bill)</label>
                            {expense.proof_path && !data.proof && (
                                <div className="flex items-center gap-2 mb-2 p-2 bg-gray-50 rounded-lg border text-xs text-blue-600">
                                    <FileText className="h-4 w-4" />
                                    <span>Existing proof: <a href={'/storage/' + expense.proof_path} target="_blank" className="underline">View current file</a></span>
                                </div>
                            )}
                            <div className="flex items-center gap-4 p-4 border-2 border-dashed rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                                <Upload className="h-6 w-6 text-gray-400" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-700">{data.proof ? data.proof.name : 'Upload new to replace existing'}</p>
                                    <p className="text-xs text-gray-500">JPG, PNG, PDF up to 2MB</p>
                                </div>
                                <Input 
                                    type="file" 
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                    onChange={e => setData('proof', e.target.files?.[0] || null)} 
                                />
                            </div>
                        </div>

                        <div className="flex items-start gap-2 p-4 bg-amber-50 text-amber-800 rounded-xl text-xs">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <p>Updating this expense will also update the corresponding ledger entry. Changing the amount or category will be reflected immediately in your financial reports.</p>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Link href={route('dashboard.expense.index')}>
                                <Button variant="outline" type="button">Cancel</Button>
                            </Link>
                            <Button disabled={processing} className="bg-blue-600 hover:bg-blue-700 min-w-[120px]">
                                <Save className="h-4 w-4 mr-2" /> {processing ? 'Updating...' : 'Update Expense'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
