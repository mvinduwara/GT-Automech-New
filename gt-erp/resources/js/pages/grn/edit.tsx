import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useState } from 'react';
import { Combobox } from '@headlessui/react';
import { CheckIcon } from 'lucide-react';

interface Props {
    grn: any;
}

export default function Edit({ grn }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        grn_no: grn.grn_no,
        supplier_id: grn.supplier_id,
        supplier: grn.supplier,
        purchase_order_id: grn.purchase_order_id,
        date: grn.date,
        remarks: grn.remarks,
        status: grn.status,
        items: grn.grn_items.map((item: any) => ({
            ...item,
            // Try to find the associated stock to get the current selling price
            // The item has 'stock_id' if it was already created.
            // But we don't have the full stock object joined in 'grn_items' directly in the 'create' view,
            // but here in 'edit' the Controller loads: 'grnItems' (no relations?), 'purchaseOrder.purchaseOrderItems.stock.product'.
            // Wait, the controller does: Grn::with(['grnItems', ...]).
            // We need to ensure we can get the selling price.
            // Ideally, we should preload stock with grnItems.
            // For now, let's assume if it's not present, default to 0. 
            // NOTE: The controller logic needs 'grnItems.stock' to display current selling price.
            selling_price: item.stock?.selling_price ? parseFloat(item.stock.selling_price) : 0,
        })),
    });

    console.log("grn", grn)
    console.log("supplier", grn.supplier)

    const [supplierQuery, setSupplierQuery] = useState('');
    const [supplierResults, setSupplierResults] = useState<any[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState<any>(data.supplier);

    const { flash } = usePage().props as any;
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const searchSupplier = async (q: string) => {
        if (q.length < 2) return setSupplierResults([]);
        const res = await fetch(`/dashboard/grn/suppliers/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setSupplierResults(data);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('dashboard.grn.update', grn.id), {
            onError: (errs) => Object.values(errs).forEach((msg) => toast.error(String(msg))),
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'GRN', href: '/dashboard/grn' }, { title: 'Edit', href: '#' }]}>
            <Head title="Edit GRN" />
            <form onSubmit={submit} className="space-y-6 p-6">
                <h1 className="text-2xl font-bold">Edit GRN</h1>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>GRN No</Label>
                        <Input value={data.grn_no} onChange={(e) => setData('grn_no', e.target.value)} />
                        {errors.grn_no && <p className="text-red-500 text-sm">{errors.grn_no}</p>}
                    </div>
                    <div>
                        <Label>Date</Label>
                        <Input type="date" value={data.date} onChange={(e) => setData('date', e.target.value)} />
                    </div>
                </div>

                <div className="col-span-2">
                    <Label>Supplier *</Label>
                    <Combobox
                        value={selectedSupplier}
                        onChange={(val) => {
                            setSelectedSupplier(val);
                            setData('supplier_id', val?.id ?? '');
                        }}
                    >
                        <div className="relative">
                            <Combobox.Input
                                className="w-full border rounded p-2"
                                displayValue={(s: any) => s?.name ?? ''}
                                onChange={(e) => {
                                    setSupplierQuery(e.target.value);
                                    searchSupplier(e.target.value);
                                }}
                            />
                            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded bg-white shadow-lg">
                                {supplierResults.map((s) => (
                                    <Combobox.Option
                                        key={s.id}
                                        value={s}
                                        className={({ active }) =>
                                            `cursor-pointer px-3 py-2 ${active ? 'bg-blue-500 text-white' : ''}`
                                        }
                                    >
                                        <div className="flex items-center gap-2">
                                            <CheckIcon className="h-4 w-4 opacity-60" />
                                            <span>
                                                {s.name} — {s.mobile} — {s.email}
                                            </span>
                                        </div>
                                    </Combobox.Option>
                                ))}
                            </Combobox.Options>
                        </div>
                    </Combobox>
                    {errors.supplier_id && <p className="text-red-500 text-sm">{errors.supplier_id}</p>}
                </div>

                <div>
                    <Label>Remarks</Label>
                    <Input value={data.remarks} onChange={(e) => setData('remarks', e.target.value)} />
                </div>

                <div>
                    <Label>Status</Label>
                    <select
                        value={data.status}
                        onChange={(e) => setData('status', e.target.value)}
                        className="w-full border rounded p-2"
                    >
                        <option value="pending">Pending</option>
                        <option value="complete">Complete</option>
                    </select>
                </div>

                <div className="space-y-4">
                    <h2 className="font-semibold">Items</h2>
                    {data.items.map((item: any, idx: number) => {
                        const lineTotal = item.quantity * item.unit_price;
                        const poItem = grn.purchase_order.purchase_order_items.find(
                            (i: any) => i.id === item.purchase_order_item_id
                        );
                        const product = poItem?.product || poItem?.stock?.product;

                        // Load initial selling price if not set, from stock if possible, otherwise keep as is
                        // We rely on backend to have passed stock info. In 'edit', we load 'grnItems'.
                        // However, grnItems store 'purchase_order_item_id' and 'stock_id'. 
                        // The controller 'create' logic updates stock selling price from 'selling_price' input.
                        // But current GRN Item model logic in controller doesn't seem to store 'selling_price' in GRN_ITEM table, only in STOCK table.
                        // So we need to show the STOCK's selling price or allow editing it.
                        // The Controller update logic uses $item['selling_price'] to update stock.
                        // So we must provide it.

                        return (
                            <div key={idx} className="border p-4 rounded space-y-2">
                                <p className="font-semibold">{product?.name + " (" + product?.part_number + ")"}</p>
                                <div className="grid grid-cols-4 gap-2">
                                    <div>
                                        <label className='text-xs' htmlFor="">Quantity</label>
                                        <Input
                                            type="number"
                                            placeholder="Quantity"
                                            value={item.quantity}
                                            onChange={(e) => {
                                                const v = [...data.items];
                                                v[idx].quantity = parseFloat(e.target.value) || 0;
                                                setData('items', v);
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className='text-xs' htmlFor="">Unit Price (LKR)</label>
                                        <Input
                                            type="number"
                                            placeholder="Unit Price (LKR)"
                                            value={item.unit_price}
                                            onChange={(e) => {
                                                const v = [...data.items];
                                                v[idx].unit_price = parseFloat(e.target.value) || 0;
                                                setData('items', v);
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className='text-xs' htmlFor="">Selling Price (LKR)</label>
                                        <Input
                                            type="number"
                                            placeholder="Selling Price"
                                            value={item.selling_price ?? 0}
                                            onChange={(e) => {
                                                const v = [...data.items];
                                                v[idx].selling_price = parseFloat(e.target.value) || 0;
                                                setData('items', v);
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className='text-xs' htmlFor="">Total</label>
                                        <Input
                                            readOnly
                                            value={`LKR ${lineTotal.toFixed(2)}`}
                                            className="bg-gray-100"
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <Button disabled={processing} type="submit">
                    Update GRN
                </Button>
            </form>
        </AppLayout>
    );
}