import { Button } from '@/components/ui/button';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Save, Settings2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Account {
    id: number;
    name: string;
    code: string | null;
}

interface PageProps {
    accounts: Account[];
    settings: {
        default_petty_cash_account_id: string | null;
        default_cash_account_id: string | null;
        default_petty_cash_expense_account_id: string | null;
        petty_cash_imprest_limit: string | null;
    };
    [key: string]: any;
}

export default function SystemSettings() {
    const { accounts, settings } = usePage<PageProps>().props;

    const { data, setData, patch, processing, errors } = useForm({
        default_petty_cash_account_id: settings.default_petty_cash_account_id?.toString() || '',
        default_cash_account_id: settings.default_cash_account_id?.toString() || '',
        default_petty_cash_expense_account_id: settings.default_petty_cash_expense_account_id?.toString() || '',
        petty_cash_imprest_limit: settings.petty_cash_imprest_limit?.toString() || '0',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('dashboard.settings.system.update'), {
            onSuccess: () => toast.success('Settings updated successfully'),
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Settings', href: '#' }, { title: 'System', href: '#' }]}>
            <Head title="System Settings" />

            <div className="flex flex-col gap-6 p-4 md:p-6 items-center">
                <div className="w-full max-w-3xl flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Settings2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                            <p className="text-gray-500 text-sm">Configure global application behavior and defaults.</p>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Financial Defaults</CardTitle>
                                <CardDescription>Set the default accounts for automated ledger entries.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Default Petty Cash Account</label>
                                    <Select value={data.default_petty_cash_account_id} onValueChange={v => setData('default_petty_cash_account_id', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select account" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value=" ">None</SelectItem>
                                            {accounts.map(account => (
                                                <SelectItem key={account.id} value={account.id.toString()}>
                                                    {account.code ? `[${account.code}] ` : ''}{account.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.default_petty_cash_account_id && <p className="text-xs text-red-500">{errors.default_petty_cash_account_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Default Cash/Bank Account (Replenishment Source)</label>
                                    <Select value={data.default_cash_account_id} onValueChange={v => setData('default_cash_account_id', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select account" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value=" ">None</SelectItem>
                                            {accounts.map(account => (
                                                <SelectItem key={account.id} value={account.id.toString()}>
                                                    {account.code ? `[${account.code}] ` : ''}{account.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.default_cash_account_id && <p className="text-xs text-red-500">{errors.default_cash_account_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Default Petty Cash Expense Account</label>
                                    <Select value={data.default_petty_cash_expense_account_id} onValueChange={v => setData('default_petty_cash_expense_account_id', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select account" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value=" ">None</SelectItem>
                                            {accounts.map(account => (
                                                <SelectItem key={account.id} value={account.id.toString()}>
                                                    {account.code ? `[${account.code}] ` : ''}{account.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground italic">This account will be debited when a petty cash voucher is finalized.</p>
                                    {errors.default_petty_cash_expense_account_id && <p className="text-xs text-red-500">{errors.default_petty_cash_expense_account_id}</p>}
                                </div>

                                <div className="pt-4 border-t space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Petty Cash Imprest Limit (LKR)</label>
                                    <Input
                                        type="number"
                                        placeholder="e.g. 150000"
                                        value={data.petty_cash_imprest_limit}
                                        onChange={e => setData('petty_cash_imprest_limit', e.target.value)}
                                        className="max-w-xs"
                                    />
                                    <p className="text-xs text-muted-foreground">The target amount to maintain in the petty cash drawer.</p>
                                    {errors.petty_cash_imprest_limit && <p className="text-xs text-red-500">{errors.petty_cash_imprest_limit}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing} className="px-8">
                                <Save className="h-4 w-4 mr-2" /> Save Settings
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
