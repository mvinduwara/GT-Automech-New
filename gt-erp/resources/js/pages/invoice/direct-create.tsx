import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Save, Trash2, UserPlus, Calculator, ChevronRight, Package, Wrench, DollarSign, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import CustomerCreateDialog from '../customer/CustomerCreateDialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Customer {
    id: number;
    name: string;
    mobile: string | null;
}

interface StockProduct {
    id: number;
    name: string;
    price: number;
    available_qty: number;
}

interface ServiceOption {
    id: number;
    name: string;
    price: number;
}

interface Service {
    id: number;
    name: string;
    options: ServiceOption[];
}

interface Props {
    customers: Customer[];
    stocks: StockProduct[];
    services: Service[];
    default_invoice_date: string;
}

interface InvoiceItem {
    type: 'service' | 'product' | 'charge';
    description: string;
    quantity: number;
    unit_price: number;
    discount_type: 'fixed' | 'percentage';
    discount_amount: number;
    stock_id?: number | null;
    vehicle_service_option_id?: number | null;
}

interface FormData {
    [key: string]: any;
    customer_id: string;
    invoice_date: string;
    due_date: string;
    payment_method: string;
    advance_payment: number;
    remarks: string;
    items: InvoiceItem[];
}

export default function DirectCreate({ customers, stocks, services, default_invoice_date }: Props) {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        customer_id: '',
        invoice_date: default_invoice_date,
        due_date: '',
        payment_method: 'cash',
        advance_payment: 0,
        remarks: '',
        items: [] as InvoiceItem[],
    });

    const [customerSearch, setCustomerSearch] = useState('');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    // Local copy of customers for dynamic searching/adding
    const [allCustomers, setAllCustomers] = useState(customers);

    const filteredCustomers = useMemo(() => {
        if (!customerSearch) return allCustomers.slice(0, 10);
        return allCustomers.filter(c =>
            c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
            (c.mobile && c.mobile.includes(customerSearch))
        ).slice(0, 50);
    }, [allCustomers, customerSearch]);

    const addItem = (type: 'service' | 'product' | 'charge') => {
        const newItem: InvoiceItem = {
            type,
            description: '',
            quantity: 1,
            unit_price: 0,
            discount_type: 'fixed',
            discount_amount: 0,
            stock_id: null,
            vehicle_service_option_id: null,
        };
        setData('items', [...data.items, newItem]);
    };

    const removeItem = (index: number) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
        const newItems = [...data.items];

        if (field === 'stock_id' && value) {
            const stock = stocks.find(s => s.id === Number(value));
            if (stock) {
                newItems[index] = {
                    ...newItems[index],
                    stock_id: stock.id,
                    description: stock.name,
                    unit_price: stock.price,
                };
            }
        } else if (field === 'vehicle_service_option_id' && value) {
            // Find option in all services
            let foundOption: ServiceOption | undefined;
            let serviceName = '';
            services.forEach(s => {
                const opt = s.options.find(o => o.id === Number(value));
                if (opt) {
                    foundOption = opt;
                    serviceName = s.name;
                }
            });

            if (foundOption) {
                newItems[index] = {
                    ...newItems[index],
                    vehicle_service_option_id: foundOption.id,
                    description: serviceName + ' - ' + foundOption.name,
                    unit_price: foundOption.price,
                };
            }
        } else {
            newItems[index] = { ...newItems[index], [field]: value };
        }

        setData('items', newItems);
    };

    const totals = useMemo(() => {
        const subtotal = data.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0);

        const totalDiscount = data.items.reduce((sum: number, item: any) => {
            const itemSubtotal = item.quantity * item.unit_price;
            let discount = 0;
            if (item.discount_type === 'percentage') {
                discount = (itemSubtotal * item.discount_amount) / 100;
            } else {
                discount = item.discount_amount;
            }
            return sum + discount;
        }, 0);

        const total = subtotal - totalDiscount;
        const balance = total - data.advance_payment;

        return { subtotal, totalDiscount, total, balance };
    }, [data.items, data.advance_payment]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.customer_id) {
            toast.error('Please select a customer');
            return;
        }
        if (data.items.length === 0) {
            toast.error('Please add at least one item');
            return;
        }
        post(route('dashboard.invoice.direct-store'), {
            onSuccess: () => {
                setIsPaymentModalOpen(false);
                toast.success('Invoice created successfully');
            },
            onError: (err) => {
                toast.error('Failed to create invoice');
                console.error(err);
            }
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Invoices', href: route('dashboard.invoice.index') },
        { title: 'Create Direct Invoice', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Direct Invoice" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
                <form className="flex flex-col gap-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link href={route('dashboard.invoice.index')}>
                                <Button variant="ghost" size="icon" type="button">
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight">Direct Invoice</h1>
                                <p className="text-muted-foreground text-sm">Create an invoice quickly for counter sales.</p>
                            </div>
                        </div>
                    </div>

                    {/* Customer Selection Card - Full Width on Top */}
                    <Card className="border-gray-200 shadow-sm overflow-hidden">
                        <CardHeader className="bg-gray-50/50 border-b pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Search className="h-4 w-4 text-primary" />
                                Customer Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-3 col-span-1">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium">Select Customer <span className="text-red-500">*</span></Label>
                                        <CustomerCreateDialog
                                            onSuccess={(newCustomer) => {
                                                // Create a stable reference for the new customer
                                                const customerObj = {
                                                    id: Number(newCustomer.id),
                                                    name: newCustomer.name,
                                                    mobile: newCustomer.mobile || null
                                                };
                                                window.location.reload();
                                                // Update customers list and selection
                                                setAllCustomers(prev => [customerObj, ...prev]);
                                                setCustomerSearch(customerObj.name.toString()); // Reset search to show the new customer in the default list
                                                setData('customer_id', customerObj.id.toString());

                                                toast.success(`Customer "${customerObj.name}" added and selected.`);
                                            }}
                                            triggerButtonText="Quick Add"
                                            triggerButtonSize="sm"
                                            triggerButtonVariant="outline"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search customer..."
                                                value={customerSearch}
                                                onChange={e => setCustomerSearch(e.target.value)}
                                                className="pl-9 h-10"
                                            />
                                        </div>
                                        <Select value={data.customer_id} onValueChange={val => setData('customer_id', val)}>
                                            <SelectTrigger className={`h-10 ${errors.customer_id ? 'border-red-500' : 'border-gray-200'}`}>
                                                <SelectValue placeholder="Choose a customer" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredCustomers.map(customer => (
                                                    <SelectItem key={customer.id} value={customer.id.toString()}>
                                                        {customer.name} {customer.mobile ? `(${customer.mobile})` : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {errors.customer_id && <p className="text-xs text-red-500 font-medium">{errors.customer_id}</p>}
                                </div>

                                <div className="space-y-3 col-span-1">
                                    <Label className="text-sm font-medium">Invoice Date</Label>
                                    <Input
                                        type="date"
                                        value={data.invoice_date}
                                        onChange={e => setData('invoice_date', e.target.value)}
                                        className="h-10"
                                    />
                                    {errors.invoice_date && <p className="text-xs text-red-500">{errors.invoice_date}</p>}
                                </div>

                                <div className="space-y-3 col-span-1">
                                    <Label className="text-sm font-medium">Due Date (Optional)</Label>
                                    <Input
                                        type="date"
                                        value={data.due_date}
                                        onChange={e => setData('due_date', e.target.value)}
                                        className="h-10"
                                        min={data.invoice_date}
                                    />
                                    {errors.due_date && <p className="text-xs text-red-500">{errors.due_date}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Items Section - Full Width Below */}
                    <Card className="border-gray-200 shadow-sm overflow-hidden flex-1">
                        <CardHeader className="flex flex-row items-center justify-between bg-gray-50/50 border-b py-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Package className="h-4 w-4 text-orange-600" /> Line Items
                            </CardTitle>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => addItem('service')} className="h-8 bg-white border-gray-300 shadow-sm gap-1 transition-all">
                                    <Wrench className="h-3 w-3" /> Service
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => addItem('product')} className="h-8 bg-white border-gray-300 shadow-sm gap-1 transition-all">
                                    <Package className="h-3 w-3" /> Product
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => addItem('charge')} className="h-8 bg-white border-gray-300 shadow-sm gap-1 transition-all">
                                    <DollarSign className="h-3 w-3" /> Custom Charge
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {data.items.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50/30 hover:bg-gray-50/30">
                                                <TableHead className="w-[300px] text-xs font-semibold text-gray-500 uppercase">Item Selection & Description</TableHead>
                                                <TableHead className="w-[100px] text-xs font-semibold text-gray-500 uppercase">Quantity</TableHead>
                                                <TableHead className="w-[140px] text-xs font-semibold text-gray-500 uppercase">Unit Price</TableHead>
                                                <TableHead className="w-[200px] text-xs font-semibold text-gray-500 uppercase">Discount Settings</TableHead>
                                                <TableHead className="w-[140px] text-right text-xs font-semibold text-gray-500 uppercase">Line Total</TableHead>
                                                <TableHead className="w-10"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.items.map((item, index) => (
                                                <TableRow key={index} className="group transition-colors border-b last:border-0">
                                                    {/* Combined Item Selection and Description */}
                                                    <TableCell className="align-top py-4">
                                                        <div className="flex flex-col gap-2">
                                                            {item.type === 'product' ? (
                                                                <Select
                                                                    value={item.stock_id?.toString() || ''}
                                                                    onValueChange={val => updateItem(index, 'stock_id', val)}
                                                                >
                                                                    <SelectTrigger className="h-9 bg-white text-xs">
                                                                        <SelectValue placeholder="Select Product" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {stocks.map(s => (
                                                                            <SelectItem key={s.id} value={s.id.toString()}>
                                                                                {s.name} (Stock: {s.available_qty})
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            ) : item.type === 'service' ? (
                                                                <Select
                                                                    value={item.vehicle_service_option_id?.toString() || ''}
                                                                    onValueChange={val => updateItem(index, 'vehicle_service_option_id', val)}
                                                                >
                                                                    <SelectTrigger className="h-9 bg-white text-xs">
                                                                        <SelectValue placeholder="Select Service" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {services.map(s => (
                                                                            <div key={s.id}>
                                                                                <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase bg-gray-50/80">{s.name}</div>
                                                                                {s.options.map(o => (
                                                                                    <SelectItem key={o.id} value={o.id.toString()} className="text-xs">{o.name}</SelectItem>
                                                                                ))}
                                                                            </div>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            ) : (
                                                                <div className="h-9 flex items-center px-3 border border-dashed rounded-md text-[10px] font-bold text-muted-foreground uppercase bg-gray-50/50">Charge(s)</div>
                                                            )}
                                                            <Input
                                                                value={item.description}
                                                                onChange={e => updateItem(index, 'description', e.target.value)}
                                                                placeholder="Enter notes/description..."
                                                                className="h-9 bg-white text-xs"
                                                            />
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="align-top py-4">
                                                        <Input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={e => updateItem(index, 'quantity', Number(e.target.value))}
                                                            className="h-9 bg-white text-xs text-center"
                                                            min="1"
                                                        />
                                                    </TableCell>

                                                    <TableCell className="align-top py-4">
                                                        <div className="flex flex-col gap-1">
                                                            <Input
                                                                type="number"
                                                                value={item.unit_price}
                                                                onChange={e => updateItem(index, 'unit_price', Number(e.target.value))}
                                                                className="h-9 bg-white text-xs"
                                                                step="0.01"
                                                            />
                                                            <span className="text-[10px] text-muted-foreground ml-1">Per Unit</span>
                                                        </div>
                                                    </TableCell>

                                                    {/* Combined Discount Type and Amount */}
                                                    <TableCell className="align-top py-4">
                                                        <div className="flex flex-col gap-2">
                                                            <Select
                                                                value={item.discount_type}
                                                                onValueChange={val => updateItem(index, 'discount_type', val)}
                                                            >
                                                                <SelectTrigger className="h-9 bg-white text-xs">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="fixed" className="text-xs">LKR (Fixed)</SelectItem>
                                                                    <SelectItem value="percentage" className="text-xs">% (Percentage)</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <Input
                                                                type="number"
                                                                value={item.discount_amount}
                                                                onChange={e => updateItem(index, 'discount_amount', Number(e.target.value))}
                                                                className="h-9 bg-white text-xs"
                                                                placeholder="Amount"
                                                                min="0"
                                                            />
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="align-top py-4 text-right">
                                                        <div className="pt-2 font-semibold text-gray-900 text-sm">
                                                            {(() => {
                                                                const sub = item.quantity * item.unit_price;
                                                                let disc = 0;
                                                                if (item.discount_type === 'percentage') {
                                                                    disc = (sub * item.discount_amount) / 100;
                                                                } else {
                                                                    disc = item.discount_amount;
                                                                }
                                                                return (sub - disc).toLocaleString('en-LK', { minimumFractionDigits: 2 });
                                                            })()}
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="align-top py-4">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                                                            onClick={() => removeItem(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="py-24 flex flex-col items-center justify-center text-muted-foreground bg-gray-50/10 rounded-b-xl border-t border-dashed">
                                    <div className="bg-white p-4 rounded-full shadow-sm mb-4 border border-gray-100">
                                        <Calculator className="h-8 w-8 text-gray-300" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500">No items added to invoice</p>
                                    <p className="text-xs text-muted-foreground mt-1">Select a type above to start adding products or services.</p>
                                </div>
                            )}

                            {data.items.length > 0 && (
                                <div className="p-8 bg-gray-50/30 border-t flex flex-col items-end gap-3">
                                    <div className="space-y-2 w-full max-w-[280px]">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Subtotal</span>
                                            <span className="font-medium text-gray-700">LKR {totals.subtotal.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-red-500">
                                            <span>Total Discounts</span>
                                            <span className="font-medium">- LKR {totals.totalDiscount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                            <span className="text-base font-semibold text-gray-900">Grand Total</span>
                                            <div className="text-2xl font-bold text-gray-900">
                                                <span className="text-xs font-medium mr-1 text-gray-500">LKR</span>
                                                {totals.total.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            if (!data.customer_id) {
                                                toast.error('Please select a customer');
                                                return;
                                            }
                                            if (data.items.length === 0) {
                                                toast.error('Please add at least one item');
                                                return;
                                            }
                                            setIsPaymentModalOpen(true);
                                        }}
                                        className=""
                                    >
                                        Proceed to Payment <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </form>

                {/* Simplified Payment Modal */}
                <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                    <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-xl rounded-xl bg-white">
                        <DialogHeader className="p-6 border-b bg-white">
                            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                                <Calculator className="h-5 w-5 text-gray-700" />
                                Finalize Payment
                            </DialogTitle>
                        </DialogHeader>

                        <div className="p-6 space-y-4">
                            {/* Summary Box */}
                            <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <div className="flex justify-between text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <span>Nett Total</span>
                                    <span>LKR {totals.total.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                    <span className="text-sm font-semibold text-gray-700 uppercase">Amount Due</span>
                                    <span className="text-xl font-bold text-gray-900">
                                        <span className="text-xs font-medium mr-1 text-gray-500">LKR</span>
                                        {totals.total.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs font-medium text-gray-500">Payment Method</Label>
                                    <Select
                                        value={data.payment_method}
                                        onValueChange={val => setData('payment_method', val)}
                                    >
                                        <SelectTrigger className="h-9 border-gray-200 text-sm">
                                            <SelectValue placeholder="Select Method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">Cash Settlement</SelectItem>
                                            <SelectItem value="card">Card Payment</SelectItem>
                                            <SelectItem value="online">Online Transfer</SelectItem>
                                            <SelectItem value="cheque">Cheque</SelectItem>
                                            <SelectItem value="credit" className="text-red-600 font-medium">On Account / Credit</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-medium text-gray-500">Amount Received (LKR)</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            className="pl-12 h-10 text-base font-semibold border-gray-200"
                                            value={data.advance_payment}
                                            onChange={e => setData('advance_payment', Number(e.target.value))}
                                            placeholder="0.00"

                                        />
                                    </div>
                                    <div className="flex justify-between items-center px-1 mt-1">
                                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Balance Due</span>
                                        <span className={`text-sm font-bold ${totals.balance > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                                            LKR {totals.balance.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-medium text-gray-500">Internal Remarks</Label>
                                    <Textarea
                                        placeholder="Optional notes..."
                                        value={data.remarks}
                                        onChange={e => setData('remarks', e.target.value)}
                                        className="h-16 border-gray-200 text-sm py-2"
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="bg-gray-50/50 p-6 border-t gap-3 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsPaymentModalOpen(false)}
                                className=""
                            >
                                Back
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={processing}
                                className=""
                            >
                                {processing ? 'Creating...' : 'Finalize Invoice'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
