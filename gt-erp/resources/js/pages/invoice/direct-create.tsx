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
import { ArrowLeft, Plus, Save, Trash2, UserPlus, Calculator, ChevronRight, Package, Wrench, DollarSign, Search, Check, ChevronsUpDown } from 'lucide-react';
import { useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import CustomerCreateDialog from '../customer/CustomerCreateDialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';

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
    overall_discount: number;
    overall_discount_type: 'fixed' | 'percentage';
    rounding_adjustment: number;
    items: InvoiceItem[];
}

// --- Local Combobox Components (Moved outside to prevent re-mounting) ---

const ProductCombobox = ({ index, selectedId, stocks, updateItem }: { index: number, selectedId?: number | null, stocks: StockProduct[], updateItem: any }) => {
    const [open, setOpen] = useState(false);
    const selectedProduct = stocks.find((s) => s.id === selectedId);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="h-9 justify-between bg-white text-xs font-normal w-full">
                    <span className="truncate">{selectedProduct ? selectedProduct.name : "Select Product"}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search product..." />
                    <CommandList>
                        <CommandEmpty>No product found.</CommandEmpty>
                        <CommandGroup>
                            {stocks.map((s) => (
                                <CommandItem key={s.id} value={s.name} onSelect={() => { updateItem(index, 'stock_id', s.id); setOpen(false); }}>
                                    <Check className={cn("mr-2 h-4 w-4", selectedId === s.id ? "opacity-100" : "opacity-0")} />
                                    <div className="flex flex-col">
                                        <span>{s.name}</span>
                                        <span className="text-[10px] text-muted-foreground">Qty: {s.available_qty} | Price: LKR {s.price}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

const ServiceCombobox = ({ index, selectedId, services, updateItem }: { index: number, selectedId?: number | null, services: Service[], updateItem: any }) => {
    const [open, setOpen] = useState(false);
    const getSelectedLabel = () => {
        if (!selectedId) return "Select Service";
        let label = "Select Service";
        services.forEach(s => {
            const opt = s.options.find(o => o.id === selectedId);
            if (opt) label = `${s.name} - ${opt.name}`;
        });
        return label;
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="h-9 justify-between bg-white text-xs font-normal w-full">
                    <span className="truncate">{getSelectedLabel()}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search service..." />
                    <CommandList>
                        <CommandEmpty>No service found.</CommandEmpty>
                        {services.map((s) => (
                            <CommandGroup key={s.id} heading={s.name}>
                                {s.options.map((o) => (
                                    <CommandItem key={o.id} value={`${s.name} ${o.name}`} onSelect={() => { updateItem(index, 'vehicle_service_option_id', o.id); setOpen(false); }}>
                                        <Check className={cn("mr-2 h-4 w-4", selectedId === o.id ? "opacity-100" : "opacity-0")} />
                                        <div className="flex flex-col">
                                            <span>{o.name}</span>
                                            <span className="text-[10px] text-muted-foreground">Price: LKR {o.price}</span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        ))}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

const CustomerCombobox = ({ customerId, customers, onSelect, errors, customerSearch, setCustomerSearch }: { customerId: string, customers: Customer[], onSelect: (id: string) => void, errors: any, customerSearch: string, setCustomerSearch: (v: string) => void }) => {
    const [open, setOpen] = useState(false);
    const selectedCustomer = customers.find((c) => c.id.toString() === customerId);

    const filtered = useMemo(() => {
        if (!customerSearch) return customers.slice(0, 10);
        return customers.filter(c =>
            c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
            (c.mobile && c.mobile.includes(customerSearch))
        ).slice(0, 50);
    }, [customers, customerSearch]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className={cn("h-10 justify-between bg-white text-sm font-normal w-full", errors.customer_id ? "border-red-500" : "border-gray-200")}>
                    <span className="truncate">{selectedCustomer ? `${selectedCustomer.name} ${selectedCustomer.mobile ? `(${selectedCustomer.mobile})` : ''}` : "Choose a customer..."}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput placeholder="Search customer by name or mobile..." value={customerSearch} onValueChange={setCustomerSearch} />
                    <CommandList>
                        <CommandEmpty>No customer found.</CommandEmpty>
                        <CommandGroup>
                            {filtered.map((customer) => (
                                <CommandItem key={customer.id} value={`${customer.name} ${customer.mobile || ''}`} onSelect={() => { onSelect(customer.id.toString()); setOpen(false); }}>
                                    <Check className={cn("mr-2 h-4 w-4", customerId === customer.id.toString() ? "opacity-100" : "opacity-0")} />
                                    <div className="flex flex-col">
                                        <span>{customer.name}</span>
                                        {customer.mobile && <span className="text-[10px] text-muted-foreground">{customer.mobile}</span>}
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default function DirectCreate({ customers, stocks, services, default_invoice_date }: Props) {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        customer_id: '',
        invoice_date: default_invoice_date,
        due_date: '',
        payment_method: 'cash',
        advance_payment: 0,
        remarks: '',
        overall_discount: 0,
        overall_discount_type: 'fixed',
        rounding_adjustment: 0,
        items: [] as InvoiceItem[],
    });

    const [customerSearch, setCustomerSearch] = useState('');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [allCustomers, setAllCustomers] = useState(customers);

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

    const updateItem = useCallback((index: number, field: keyof InvoiceItem, value: any) => {
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
            let foundOption: ServiceOption | undefined;
            let serviceName = '';
            services.forEach(s => {
                const opt = s.options.find(o => o.id === Number(value));
                if (opt) { foundOption = opt; serviceName = s.name; }
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
    }, [data.items, stocks, services]);

    const totals = useMemo(() => {
        const itemSubtotal = data.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0);
        const itemDiscounts = data.items.reduce((sum: number, item: any) => {
            const rowSubtotal = item.quantity * item.unit_price;
            let discount = 0;
            if (item.discount_type === 'percentage') { discount = (rowSubtotal * item.discount_amount) / 100; } else { discount = item.discount_amount; }
            return sum + discount;
        }, 0);
        const netItemsTotal = itemSubtotal - itemDiscounts;
        let overallDiscountAmount = 0;
        if (data.overall_discount_type === 'percentage') { overallDiscountAmount = (netItemsTotal * data.overall_discount) / 100; } else { overallDiscountAmount = data.overall_discount; }
        const grandTotalPreRounding = netItemsTotal - overallDiscountAmount;
        const grandTotal = grandTotalPreRounding + data.rounding_adjustment;
        const balance = grandTotal - data.advance_payment;

        return { itemSubtotal, itemDiscounts, netItemsTotal, overallDiscountAmount, grandTotalPreRounding, grandTotal, balance };
    }, [data.items, data.advance_payment, data.overall_discount, data.overall_discount_type, data.rounding_adjustment]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.customer_id) { toast.error('Please select a customer'); return; }
        if (data.items.length === 0) { toast.error('Please add at least one item'); return; }
        post(route('dashboard.invoice.direct-store'), {
            onSuccess: (page: any) => {
                setIsPaymentModalOpen(false);
                const invId = page.props.flash?.invoice_id;

                toast.success('Invoice created successfully', {
                    action: invId ? {
                        label: 'View / Print',
                        onClick: () => window.open(route('dashboard.invoice.show', invId), '_blank')
                    } : undefined
                });

                if (invId) {
                    window.open(route('dashboard.invoice.show', invId), '_blank');
                }
            },
            onError: (err) => { toast.error('Failed to create invoice'); console.error(err); }
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
                                <Button variant="ghost" size="icon" type="button"><ArrowLeft className="h-5 w-5" /></Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight">Direct Invoice</h1>
                                <p className="text-muted-foreground text-sm">Create an invoice quickly for counter sales.</p>
                            </div>
                        </div>
                    </div>

                    <Card className="border-gray-200 shadow-sm overflow-hidden">
                        <CardHeader className="bg-gray-50/50 border-b pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Search className="h-4 w-4 text-primary" />Customer Information</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-3 col-span-1">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium">Select Customer <span className="text-red-500">*</span></Label>
                                        <CustomerCreateDialog
                                            onSuccess={(newCustomer) => {
                                                const customerObj = { id: Number(newCustomer.id), name: newCustomer.name, mobile: newCustomer.mobile || null };
                                                setAllCustomers(prev => [customerObj, ...prev]);
                                                setData('customer_id', customerObj.id.toString());
                                            }}
                                            triggerButtonText="Quick Add" triggerButtonSize="sm" triggerButtonVariant="outline"
                                        />
                                    </div>
                                    <CustomerCombobox
                                        customerId={data.customer_id}
                                        customers={allCustomers}
                                        onSelect={(id) => setData('customer_id', id)}
                                        errors={errors}
                                        customerSearch={customerSearch}
                                        setCustomerSearch={setCustomerSearch}
                                    />
                                    {errors.customer_id && <p className="text-xs text-red-500 font-medium">{errors.customer_id}</p>}
                                </div>
                                <div className="space-y-3 col-span-1">
                                    <Label className="text-sm font-medium">Invoice Date</Label>
                                    <Input type="date" value={data.invoice_date} onChange={e => setData('invoice_date', e.target.value)} className="h-10" />
                                </div>
                                <div className="space-y-3 col-span-1">
                                    <Label className="text-sm font-medium">Due Date (Optional)</Label>
                                    <Input type="date" value={data.due_date} onChange={e => setData('due_date', e.target.value)} className="h-10" min={data.invoice_date} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-200 shadow-sm overflow-hidden flex-1">
                        <CardHeader className="flex flex-row items-center justify-between bg-gray-50/50 border-b py-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Package className="h-4 w-4 text-orange-600" /> Line Items</CardTitle>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => addItem('service')} className="h-8 bg-white border-gray-300 shadow-sm gap-1 uppercase text-[10px] font-bold tracking-tight px-3">
                                    <Wrench className="h-3 w-3" /> Service
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => addItem('product')} className="h-8 bg-white border-gray-300 shadow-sm gap-1 uppercase text-[10px] font-bold tracking-tight px-3">
                                    <Package className="h-3 w-3" /> Product
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => addItem('charge')} className="h-8 bg-white border-gray-300 shadow-sm gap-1 uppercase text-[10px] font-bold tracking-tight px-3">
                                    <DollarSign className="h-3 w-3" /> Custom Charge
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {data.items.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/30">
                                            <TableHead className="w-[300px] text-[10px] font-bold text-gray-400 uppercase tracking-widest">Item Selection & Description</TableHead>
                                            <TableHead className="w-[100px] text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Quantity</TableHead>
                                            <TableHead className="w-[140px] text-[10px] font-bold text-gray-400 uppercase tracking-widest">Unit Price</TableHead>
                                            <TableHead className="w-[200px] text-[10px] font-bold text-gray-400 uppercase tracking-widest">Discount</TableHead>
                                            <TableHead className="w-[140px] text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Line Total</TableHead>
                                            <TableHead className="w-10"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.items.map((item, index) => (
                                            <TableRow key={index} className="group border-b last:border-0 hover:bg-gray-50/20">
                                                <TableCell className="align-top py-4">
                                                    <div className="flex flex-col gap-2">
                                                        {item.type === 'product' ? (
                                                            <ProductCombobox index={index} selectedId={item.stock_id} stocks={stocks} updateItem={updateItem} />
                                                        ) : item.type === 'service' ? (
                                                            <ServiceCombobox index={index} selectedId={item.vehicle_service_option_id} services={services} updateItem={updateItem} />
                                                        ) : (
                                                            <div className="h-9 flex items-center px-3 border border-dashed rounded-md text-[10px] font-bold text-muted-foreground uppercase bg-gray-50/50">Custom Charge</div>
                                                        )}
                                                        <Input value={item.description} onChange={e => updateItem(index, 'description', e.target.value)} placeholder="Notes..." className="h-9 text-xs" />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="align-top py-4">
                                                    <Input type="number" value={item.quantity} onChange={e => updateItem(index, 'quantity', Number(e.target.value))} className="h-9 text-xs text-center" min="1" />
                                                </TableCell>
                                                <TableCell className="align-top py-4">
                                                    <Input type="number" value={item.unit_price} onChange={e => updateItem(index, 'unit_price', Number(e.target.value))} className="h-9 text-xs" step="0.01" />
                                                </TableCell>
                                                <TableCell className="align-top py-4">
                                                    <div className="flex flex-col gap-2">
                                                        <Select value={item.discount_type} onValueChange={val => updateItem(index, 'discount_type', val)}>
                                                            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="fixed">Fixed</SelectItem>
                                                                <SelectItem value="percentage">Percent</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <Input type="number" value={item.discount_amount} onChange={e => updateItem(index, 'discount_amount', Number(e.target.value))} className="h-9 text-xs" min="0" />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="align-top py-4 text-right">
                                                    <div className="pt-2 font-bold text-gray-900 text-xs">
                                                        {(() => {
                                                            const sub = item.quantity * item.unit_price;
                                                            const disc = item.discount_type === 'percentage' ? (sub * item.discount_amount) / 100 : item.discount_amount;
                                                            return (sub - disc).toLocaleString('en-LK', { minimumFractionDigits: 2 });
                                                        })()}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="align-top py-4">
                                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={() => removeItem(index)}><Trash2 className="h-4 w-4" /></Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="py-24 flex flex-col items-center justify-center text-muted-foreground">
                                    <Calculator className="h-12 w-12 text-gray-200 mb-4" />
                                    <p className="text-sm">No items added</p>
                                </div>
                            )}

                            {data.items.length > 0 && (
                                <div className="p-8 bg-gray-50/30 border-t flex flex-col items-end gap-3">
                                    <div className="space-y-1 w-full max-w-[280px]">
                                        <div className="flex justify-between text-xs"><span className="text-gray-500">Items Gross</span><span className="font-medium">LKR {totals.itemSubtotal.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span></div>
                                        {totals.itemDiscounts > 0 && <div className="flex justify-between text-xs text-red-500"><span>Item Discounts</span><span className="font-medium">- LKR {totals.itemDiscounts.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span></div>}
                                        {totals.overallDiscountAmount > 0 && <div className="flex justify-between text-xs text-red-600 font-medium"><span>Global Discount</span><span className="font-medium">- LKR {totals.overallDiscountAmount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span></div>}
                                        {Math.abs(data.rounding_adjustment) > 0 && <div className="flex justify-between text-xs text-gray-600 font-medium"><span>Rounding</span><span className="font-medium">{data.rounding_adjustment > 0 ? '+' : ''} LKR {data.rounding_adjustment.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span></div>}
                                        <div className="flex justify-between items-center pt-3 mt-1 border-t border-gray-200"><span className="text-sm font-bold text-gray-900">Total Payable</span><span className="text-xl font-black text-gray-900 tracking-tight">LKR {totals.grandTotal.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span></div>
                                    </div>
                                    <Button type="button" size="lg" onClick={() => setIsPaymentModalOpen(true)} className="mt-4 px-8 py-6 rounded-xl font-bold uppercase tracking-wide text-xs">Check Out <ChevronRight className="ml-2 h-4 w-4" /></Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </form>

                <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                    <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white">
                        <DialogHeader className="p-6 border-b bg-gray-50/50">
                            <DialogTitle className="text-lg font-bold flex items-center gap-2"><Calculator className="h-5 w-5 text-primary" />Payment Processing</DialogTitle>
                        </DialogHeader>
                        <div className="p-6 space-y-4">
                            <div className="bg-gray-900 text-white p-5 rounded-2xl shadow-inner relative overflow-hidden">
                                <div className="relative z-10 flex flex-col gap-0.5">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Payable Total</span>
                                    <span className="text-3xl font-black tracking-tighter">LKR {totals.grandTotal.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                                    <div className="mt-2 flex gap-4 pt-2 border-t border-white/10 opacity-60 text-[9px] font-bold uppercase">
                                        <span>Nett: {totals.grandTotalPreRounding.toLocaleString()}</span>
                                        <span>Adj: {data.rounding_adjustment.toLocaleString()}</span>
                                    </div>
                                </div>
                                <DollarSign className="absolute -right-4 -bottom-4 h-24 w-24 text-white/5 rotate-12" />
                            </div>

                            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                <div className="space-y-1.5 flex flex-col">
                                    <div className="flex justify-between items-end mb-1">
                                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">Rounding</Label>
                                        <div className="flex gap-1">
                                            <Button type="button" variant="outline" size="sm" className="h-4 text-[8px] px-1 font-bold rounded" onClick={() => setData('rounding_adjustment', Number((Math.round(totals.grandTotalPreRounding) - totals.grandTotalPreRounding).toFixed(2)))}>Auto</Button>
                                            <Button type="button" variant="outline" size="sm" className="h-4 text-[8px] px-1 font-bold rounded" onClick={() => setData('rounding_adjustment', 0)}>Fix</Button>
                                        </div>
                                    </div>
                                    <Input type="number" step="0.01" className="h-9 text-xs font-bold" value={data.rounding_adjustment} onChange={e => setData('rounding_adjustment', Number(e.target.value))} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Discount</Label>
                                    <div className="flex gap-1 items-center">
                                        <Select value={data.overall_discount_type} onValueChange={val => setData('overall_discount_type', val as 'fixed' | 'percentage')}>
                                            <SelectTrigger className="h-9 w-16 text-[9px]"><SelectValue /></SelectTrigger>
                                            <SelectContent><SelectItem value="fixed">Amt</SelectItem><SelectItem value="percentage">%</SelectItem></SelectContent>
                                        </Select>
                                        <Input type="number" className="h-9 text-xs font-bold" value={data.overall_discount} onChange={e => setData('overall_discount', Number(e.target.value))} />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Method</Label>
                                    <Select value={data.payment_method} onValueChange={val => setData('payment_method', val)}>
                                        <SelectTrigger className="h-10 font-bold text-xs"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">Cash Settlement</SelectItem>
                                            <SelectItem value="card">Card Terminal</SelectItem>
                                            <SelectItem value="online">Bank Transfer</SelectItem>
                                            <SelectItem value="cheque">Cheque</SelectItem>
                                            <SelectItem value="credit">On Account</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-primary">Settled Amount</Label>
                                    <Input type="number" className="h-10 text-base font-black bg-primary/5 border-primary/20" value={data.advance_payment} onChange={e => setData('advance_payment', Number(e.target.value))} />
                                </div>

                                <div className="col-span-2 space-y-1.5 pt-1">
                                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Remarks</Label>
                                    <Textarea value={data.remarks} onChange={e => setData('remarks', e.target.value)} className="h-12 text-xs resize-none py-2" placeholder="Internal notes..." />
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="bg-gray-50 border-t p-5 gap-3">
                            <Button type="button" variant="ghost" onClick={() => setIsPaymentModalOpen(false)} className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 h-9">Cancel</Button>
                            <Button onClick={handleSubmit} disabled={processing} className="px-6 font-bold uppercase tracking-widest text-[10px] rounded-xl h-10">{processing ? 'Processing...' : 'Complete & Print Invoice'}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
