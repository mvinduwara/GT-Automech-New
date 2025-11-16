import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { CheckIcon } from 'lucide-react';
import { useState } from 'react';
import { Combobox } from '@headlessui/react';

interface Props {
    purchaseOrder: any;
}

export default function Create({ purchaseOrder }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        grn_no: '',
        supplier_id: '',
        purchase_order_id: purchaseOrder.id,
        date: new Date().toISOString().substr(0, 10),
        remarks: '',
        items: purchaseOrder.purchase_order_items.map((i: any) => ({
            purchase_order_item_id: i.id,
            quantity: i.quantity,
            unit_price: 0,
            remarks: '',
        })),
    });

    const [supplierQuery, setSupplierQuery] = useState('');
    const [supplierResults, setSupplierResults] = useState<any[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

    const searchSupplier = async (q: string) => {
        if (q.length < 2) return setSupplierResults([]);
        const res = await fetch(`/dashboard/grn/suppliers/search?q=${encodeURIComponent(q)}`);
        console.log("res", res)
        const data = await res.json();
        setSupplierResults(data);
    };


    console.log("purchaseOrder", purchaseOrder)
    console.log("purchaseOrder.supplier_id", purchaseOrder.supplier_id)

    const { flash } = usePage().props as any;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('dashboard.grn.store'), {
            onError: (errs) => {
                Object.values(errs).forEach((msg) => toast.error(String(msg)));
            },
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'GRN', href: '/dashboard/grn' }, { title: 'Create' }]}>
            <Head title="Create GRN" />
            <form onSubmit={submit} className="space-y-6 p-6">
                <h1 className="text-2xl font-bold">Create GRN</h1>

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

                <div className="space-y-4">
                    <h2 className="font-semibold">Items</h2>
                    {data.items.map((item: any, idx: number) => {
                        const lineTotal = item.quantity * item.unit_price;
                        return (
                            <div key={idx} className="border p-4 rounded space-y-2">
                                <p className="font-semibold">
                                    {purchaseOrder.purchase_order_items[idx].stock.product.name + " (" + purchaseOrder.purchase_order_items[idx].stock.product.part_number + ")"}
                                </p>
                                <div className="grid grid-cols-3 gap-2">
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
                                        /></div>
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
                    Save GRN
                </Button>
            </form>
        </AppLayout>
    );
}