import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Head, router } from "@inertiajs/react";
import { format } from "date-fns";
import { Printer, ArrowLeft, CreditCard, Globe, ScrollText, Banknote } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import PaymentUpdateForm from "./PaymentUpdateForm";
import InvoiceStatusForm from "./InvoiceStatusForm";

type InvoiceStatus = "draft" | "unpaid" | "partial" | "paid" | "cancelled";
type PaymentMethod = 'cash' | 'card' | 'online' | 'cheque' | 'credit';

interface Customer {
    id: number;
    title: string;
    name: string;
    mobile: string;
    address: string;
}

interface VehicleBrand {
    id: number;
    name: string;
}

interface VehicleModel {
    id: number;
    name: string;
}

interface Vehicle {
    id: number;
    vehicle_no: string;
    brand: VehicleBrand;
    model: VehicleModel;
    make_year: string;
}

interface JobCard {
    id: number;
    job_card_no: string;
    vehicle: Vehicle;
    mileage?: number;
    remarks?: string | null;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface JobCardDiscountInfo {
    discount_type: 'percentage' | 'amount' | null;
    discount_value: number | null;
    subtotal?: number; // For products/services
    charge?: number; // For charges
    unit_price?: number; // For products
}

interface InvoiceItem {
    id: number;
    item_type: "service" | "product" | "charge";
    description: string;
    quantity: number;
    unit_price: number;
    line_total: number;
    discount_type?: 'fixed' | 'percentage' | null;
    discount_amount?: number | null;
    discount_total?: number | null;
    job_card_product?: JobCardDiscountInfo;
    job_card_vehicle_service?: JobCardDiscountInfo;
    job_card_charge?: JobCardDiscountInfo;
}

interface InvoicePayment {
    id: number;
    amount: number;
    payment_method: PaymentMethod;
    created_at: string;
}

interface Invoice {
    id: number;
    invoice_no: string;
    invoice_date: string;
    due_date: string | null;
    services_total: number;
    products_total: number;
    charges_total: number;
    subtotal: number;
    advance_payment: number;
    total: number;
    status: InvoiceStatus;
    payment_method: PaymentMethod;
    remarks: string | null;
    terms_conditions: string | null;
    overall_discount: number;
    overall_discount_type: 'fixed' | 'percentage';
    rounding_adjustment: number;
    customer: Customer;
    job_card: JobCard;
    user: User;
    items: InvoiceItem[];
    payments: InvoicePayment[];
    remaining: number;
}

interface Props {
    invoice: Invoice;
}

export default function Show({ invoice }: Props) {
    const getStatusColor = (status: InvoiceStatus) => {
        switch (status) {
            case "paid":
                return "bg-green-500";
            case "partial":
                return "bg-blue-500";
            case "unpaid":
                return "bg-yellow-500";
            case "cancelled":
                return "bg-red-500";
            case "draft":
                return "bg-gray-500";
            default:
                return "bg-gray-500";
        }
    };

    const handleCancelInvoice = () => {
        if (!confirm('Are you sure you want to cancel this invoice? This action cannot be undone.')) {
            return;
        }

        router.patch(
            route('dashboard.invoice.cancel', invoice.id),
            {},
            {
                onSuccess: () => {
                    alert('Invoice cancelled successfully');
                },
                onError: () => {
                    alert('Failed to cancel invoice');
                }
            }
        );
    };

    const getItemTypeColor = (type: string) => {
        switch (type) {
            case "service":
                return "bg-purple-100 text-purple-800";
            case "product":
                return "bg-blue-100 text-blue-800";
            case "charge":
                return "bg-orange-100 text-orange-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleBack = () => {
        // const url = route('dashboard.job-card.form', invoice.job_card.id);
        // window.open(url, '_blank');
        window.close();
    };

    const formatPaymentMethod = (method: PaymentMethod) => {
        const labels: Record<PaymentMethod, string> = {
            cash: 'Cash',
            card: 'Card',
            online: 'Online Transfer',
            cheque: 'Cheque',
            credit: 'Credit'
        };
        return labels[method] || method;
    };

    const getPaymentIcon = (method: PaymentMethod) => {
        switch (method) {
            case 'card': return <CreditCard className="h-3 w-3 mr-1" />;
            case 'online': return <Globe className="h-3 w-3 mr-1" />;
            case 'cheque': return <ScrollText className="h-3 w-3 mr-1" />;
            default: return <Banknote className="h-3 w-3 mr-1" />;
        }
    };

    const getOriginalPrice = (item: InvoiceItem) => {
        // For direct invoice items, unit_price is already the original price
        if (!invoice.job_card?.id) {
            return item.unit_price;
        }

        if (item.item_type === 'product') {
            const info = item.job_card_product;
            return item.unit_price;
        } else if (item.item_type === 'service') {
            const info = item.job_card_vehicle_service;
            return info?.subtotal || item.unit_price;
        } else if (item.item_type === 'charge') {
            const info = item.job_card_charge;
            return info?.charge || item.unit_price;
        }
        return item.unit_price;
    };

    const getDiscountDisplay = (item: InvoiceItem) => {
        let info: JobCardDiscountInfo | undefined;
        if (item.item_type === 'product') info = item.job_card_product;
        else if (item.item_type === 'service') info = item.job_card_vehicle_service;
        else if (item.item_type === 'charge') info = item.job_card_charge;

        if (info && info.discount_value) {
            if (info.discount_type === 'percentage') {
                return `${Number(info.discount_value)}%`;
            }
            return `Rs. ${Number(info.discount_value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
        }

        if (item.discount_amount && Number(item.discount_amount) > 0) {
            if (item.discount_type === 'percentage') {
                return `${Number(item.discount_amount)}%`;
            }
            return `Rs. ${Number(item.discount_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
        }

        return '-';
    };

    const calculateTotalDiscount = () => {
        return invoice.items.reduce((acc, item) => {
            // For direct invoice items, use the stored discount_total
            if (!invoice.job_card?.id && item.discount_total) {
                return acc + Number(item.discount_total);
            }

            let info: JobCardDiscountInfo | undefined;
            let originalTotal = 0;

            if (item.item_type === 'product') {
                info = item.job_card_product;
                // For products, subtotal is qty * unit_price
                originalTotal = info?.subtotal ?? (item.unit_price * item.quantity);
                // wait, item.unit_price for product is original price in invoice controller?
                // Check controller: 'unit_price' => $product->unit_price
                // 'line_total' => $product->total
                // So item.unit_price * item.quantity is the original amount.
                originalTotal = item.unit_price * item.quantity;
            } else if (item.item_type === 'service') {
                info = item.job_card_vehicle_service;
                // For services, item.unit_price is the FINAL total.
                // We need original from info.subtotal (or charge?)
                // Assuming subtotal exists for service
                originalTotal = info?.subtotal ?? item.line_total;
            } else if (item.item_type === 'charge') {
                info = item.job_card_charge;
                // For charges, item.unit_price is FINAL total.
                originalTotal = info?.charge ?? item.line_total;
            }

            const finalTotal = item.line_total;
            return acc + Math.max(0, originalTotal - finalTotal);
        }, 0);
    };

    const totalDiscount = calculateTotalDiscount();
    const grossTotal = Number(invoice.subtotal) + totalDiscount;

    const serviceItems = invoice.items.filter(item => item.item_type === 'service');
    const productItems = invoice.items.filter(item => item.item_type === 'product');
    const chargeItems = invoice.items.filter(item => item.item_type === 'charge');

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title={`Invoice - ${invoice.invoice_no}`} />

            {/* Action Bar - Hidden on Print */}
            <div className="bg-white border-b print:hidden sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" onClick={handleBack}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <div className="flex gap-2">
                            <InvoiceStatusForm
                                invoiceId={invoice.id}
                                currentStatus={invoice.status}
                                invoiceNo={invoice.invoice_no}
                                disabled={invoice.status === 'cancelled'}
                            />
                            <PaymentUpdateForm
                                invoiceId={invoice.id}
                                currentAdvancePayment={invoice.advance_payment}
                                totalAmount={invoice.total}
                                remaining={invoice.remaining}
                                status={invoice.status}
                            />
                            {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
                                <Button
                                    variant="destructive"
                                    onClick={handleCancelInvoice}
                                >
                                    Cancel Invoice
                                </Button>
                            )}
                            <Button variant="outline" onClick={handlePrint}>
                                <Printer className="h-4 w-4 mr-2" />
                                Print Invoice
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Screen View - Professional Card Layout */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:hidden">
                <Card>
                    <CardContent className="p-8">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h1 className="text-4xl font-bold text-gray-900 mb-2">INVOICE</h1>
                                    <p className="text-lg text-gray-600">{invoice.invoice_no}</p>
                                </div>
                                <div className="text-right">
                                    <Badge className={`${getStatusColor(invoice.status)} mb-2`}>
                                        {invoice.status.toUpperCase()}
                                    </Badge>
                                    <p className="text-sm text-gray-600">
                                        Date: {format(new Date(invoice.invoice_date), "PPP")}
                                    </p>
                                    {invoice.due_date && (
                                        <p className="text-sm text-gray-600">
                                            Due: {format(new Date(invoice.due_date), "PPP")}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <Separator className="my-6" />

                            {/* Company & Customer Info */}
                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">From:</h3>
                                    <div className="text-sm text-gray-600">
                                        <p className="font-medium text-gray-900">GT Automech</p>
                                        <p>186/2, Raigama Junction, Kothalawala, Bandaragama</p>
                                        <p>Tel: +94 77 409 8580</p>
                                        <p>Email: info@gtdrive.lk</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
                                    <div className="text-sm text-gray-600">
                                        <p className="font-medium text-gray-900">
                                            {invoice.customer.title} {invoice.customer.name}
                                        </p>
                                        <p>{invoice.customer.address}</p>
                                        <p>Mobile: {invoice.customer.mobile}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Job Card & Vehicle Info */}
                            {invoice.job_card?.id ? (
                                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">Job Card:</span>
                                            <span className="ml-2 font-medium">{invoice.job_card.job_card_no}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Vehicle:</span>
                                            <span className="ml-2 font-medium">{invoice.job_card.vehicle?.vehicle_no || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Make/Model:</span>
                                            <span className="ml-2 font-medium">
                                                {invoice.job_card.vehicle?.brand?.name} {invoice.job_card.vehicle?.model?.name}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Year:</span>
                                            <span className="ml-2 font-medium">{invoice.job_card.vehicle?.make_year || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Odometer:</span>
                                            <span className="ml-2 font-medium">{invoice.job_card.mileage ? `${Number(invoice.job_card.mileage).toLocaleString()} km` : 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-indigo-50/50 p-4 rounded-lg mb-6 border border-indigo-100/50">
                                    <p className="text-sm font-medium text-indigo-900">Direct Invoice</p>
                                    <p className="text-xs text-indigo-700 mt-1">This invoice was created directly without a job card.</p>
                                </div>
                            )}
                        </div>

                        {/* Services */}
                        {serviceItems.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-3">Services</h3>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Discount</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {serviceItems.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="px-4 py-3 text-sm text-gray-900">
                                                        <div className="flex items-center gap-2">
                                                            <Badge className={getItemTypeColor(item.item_type) + " text-xs"}>Service</Badge>
                                                            {item.description}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-center">{item.quantity}</td>
                                                    <td className="px-4 py-3 text-sm text-right">
                                                        {/* For Service, item.unit_price is Total. We want original price here. */}
                                                        Rs. {Number(item.job_card_vehicle_service?.subtotal || item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-right text-red-600">{getDiscountDisplay(item)}</td>
                                                    <td className="px-4 py-3 text-sm font-medium text-right">Rs. {Number(item.line_total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Products */}
                        {productItems.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-3">Products</h3>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Discount</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {productItems.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="px-4 py-3 text-sm text-gray-900">
                                                        <div className="flex items-center gap-2">
                                                            <Badge className={getItemTypeColor(item.item_type) + " text-xs"}>Product</Badge>
                                                            {item.description}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-center">{item.quantity}</td>
                                                    <td className="px-4 py-3 text-sm text-right">Rs. {Number(item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    <td className="px-4 py-3 text-sm text-right text-red-600">{getDiscountDisplay(item)}</td>
                                                    <td className="px-4 py-3 text-sm font-medium text-right">Rs. {Number(item.line_total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Charges */}
                        {chargeItems.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-3">Additional Charges</h3>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Discount</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {chargeItems.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="px-4 py-3 text-sm text-gray-900">
                                                        <div className="flex items-center gap-2">
                                                            <Badge className={getItemTypeColor(item.item_type) + " text-xs"}>Charge</Badge>
                                                            {item.description}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-center">{item.quantity}</td>
                                                    <td className="px-4 py-3 text-sm text-right">
                                                        {/* Charge unit_price is Total. Use original charge if available */}
                                                        Rs. {Number(item.job_card_charge?.charge || item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-right text-red-600">{getDiscountDisplay(item)}</td>
                                                    <td className="px-4 py-3 text-sm font-medium text-right">Rs. {Number(item.line_total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Totals */}
                        <div className="mt-8 flex justify-end">
                            <div className="w-80">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-600">Services Total:</span>
                                        <span className="font-medium">Rs. {Number(invoice.services_total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-600">Products Total:</span>
                                        <span className="font-medium">Rs. {Number(invoice.products_total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-600">Charges Total:</span>
                                        <span className="font-medium">Rs. {Number(invoice.charges_total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-600">Payment Method:</span>
                                        <Badge variant="outline" className="capitalize font-medium flex items-center">
                                            {getPaymentIcon(invoice.payment_method)}
                                            {formatPaymentMethod(invoice.payment_method)}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="font-medium">Rs. {Number(invoice.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    {invoice.overall_discount > 0 && (
                                        <div className="flex justify-between py-2 text-red-600">
                                            <span>Overall Discount ({invoice.overall_discount_type === 'percentage' ? `${invoice.overall_discount}%` : 'Fixed'}):</span>
                                            <span className="font-medium">
                                                - Rs. {(invoice.overall_discount_type === 'percentage' 
                                                    ? (Number(invoice.subtotal) * Number(invoice.overall_discount) / 100) 
                                                    : Number(invoice.overall_discount)
                                                ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    )}
                                    {Math.abs(invoice.rounding_adjustment) > 0 && (
                                        <div className="flex justify-between py-2 text-gray-600">
                                            <span>Rounding Adjustment:</span>
                                            <span className="font-medium">
                                                {invoice.rounding_adjustment > 0 ? '+' : ''} Rs. {Number(invoice.rounding_adjustment).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    )}
                                    <Separator />
                                    <div className="flex justify-between py-2 font-bold text-gray-900">
                                        <span>Total Amount:</span>
                                        <span>Rs. {Number(invoice.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    {totalDiscount > 0 && (
                                        <div className="flex justify-between py-2 text-red-600">
                                            <span>Total Discount:</span>
                                            <span className="font-medium">- Rs. {Number(totalDiscount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                    )}
                                    {invoice.payments && invoice.payments.length > 0 ? (
                                        invoice.payments.map((payment, index) => (
                                            <div key={payment.id} className="flex justify-between py-2 text-green-600">
                                                <span>Payment {index + 1} ({formatPaymentMethod(payment.payment_method)}):</span>
                                                <span className="font-medium">- Rs. {Number(payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        ))
                                    ) : (
                                        invoice.advance_payment > 0 && (
                                            <div className="flex justify-between py-2 text-green-600">
                                                <span>Advance Payment:</span>
                                                <span className="font-medium">- Rs. {Number(invoice.advance_payment).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        )
                                    )}
                                    <Separator />
                                    <div className="flex justify-between py-3 bg-indigo-50 px-4 rounded-lg">
                                        <span className="text-lg font-bold text-gray-900">Amount Due:</span>
                                        <span className="text-lg font-bold text-indigo-600">Rs. {Number(invoice.remaining).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Remarks */}
                        {invoice.job_card.remarks && (
                            <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-2">Remarks:</h3>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{invoice.job_card.remarks}</p>
                            </div>
                        )}

                        {/* Terms & Conditions */}
                        {invoice.terms_conditions && (
                            <div className="mt-8 pt-6 border-t">
                                <h3 className="font-semibold text-gray-900 mb-2">Terms & Conditions:</h3>
                                <p className="text-xs text-gray-600 whitespace-pre-wrap">{invoice.terms_conditions}</p>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="mt-12 pt-6 border-t text-center text-xs text-gray-500">
                            <p>Thank you for your business!</p>
                            <p className="mt-2">Generated by {invoice.user.name} on {format(new Date(), "PPP")}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Print View - Professional A4 Layout */}
            <div className="hidden print:block print-invoice">
                {/* Header */}
                <div className="invoice-header">
                    <div className="brand-section">
                        <div className="brand-info">
                            <h1 className="company-name">GT Automech</h1>
                            <p className="company-tagline">Professional Car Service & Repairs</p>
                            <p className="company-contact">www.gtdrive.lk • +94 77 409 8580 • +94 74 212 0450</p>
                        </div>
                    </div>
                    <div className="invoice-meta">
                        <h2 className="invoice-title">INVOICE</h2>
                        <div className="invoice-number">{invoice.invoice_no}</div>
                        <div className="invoice-dates">
                            <div>Issued: {format(new Date(invoice.invoice_date), "dd MMM yyyy")}</div>
                            {invoice.due_date && <div>Due: {format(new Date(invoice.due_date), "dd MMM yyyy")}</div>}
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="three-col-grid">
                    {/* Bill To Section */}
                    <div>
                        <h3 className="section-title">Bill To</h3>
                        <div className="info-grid">
                            <span className="label">Name</span>
                            <span className="value">{invoice.customer.title} {invoice.customer.name}</span>
                            <span className="label">Phone</span>
                            <span className="value">{invoice.customer.mobile}</span>
                            <span className="label">Address</span>
                            <span className="value">{invoice.customer.address}</span>
                        </div>
                    </div>

                    {/* Vehicle Section */}
                    {invoice.job_card?.id ? (
                        <>
                            <div>
                                <h3 className="section-title">Vehicle</h3>
                                <div className="info-grid">
                                    <span className="label">Make/Model</span>
                                    <span className="value">{invoice.job_card.vehicle?.brand?.name} {invoice.job_card.vehicle?.model?.name}</span>
                                    <span className="label">Year</span>
                                    <span className="value">{invoice.job_card.vehicle?.make_year || 'N/A'}</span>
                                    <span className="label">Reg No.</span>
                                    <span className="value">{invoice.job_card.vehicle?.vehicle_no || 'N/A'}</span>
                                    <span className="label">Odometer</span>
                                    <span className="value">{invoice.job_card.mileage ? `${Number(invoice.job_card.mileage).toLocaleString()} km` : 'N/A'}</span>
                                </div>
                            </div>

                            {/* Job Section */}
                            <div>
                                <h3 className="section-title">Job</h3>
                                <div className="info-grid">
                                    <span className="label">Job #</span>
                                    <span className="value">{invoice.job_card.job_card_no}</span>
                                    <span className="label">Service Advisor</span>
                                    <span className="value">{invoice.user.name}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div>
                            <h3 className="section-title">Invoice Details</h3>
                            <div className="info-grid">
                                <span className="label">Type</span>
                                <span className="value">Direct Invoice</span>
                                <span className="label">Cashier</span>
                                <span className="value">{invoice.user.name}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Remarks - Full Width */}
                {invoice.job_card.remarks && (
                    <div className="info-section mt-4 mb-4">
                        <h3 className="section-title">Remarks / Notes</h3>
                        <p>{invoice.job_card.remarks}</p>
                    </div>
                )}

                {/* Items Table */}
                <table className="items-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            {/* <th>Type</th> */}
                            <th className="text-right">Unit Cost</th>
                            <th className="text-right">Qty</th>
                            <th className="text-right">Disc.</th>
                            <th className="text-right">Line Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item) => (
                            <tr key={item.id}>
                                <td>{item.description}</td>
                                {/* <td className="capitalize">{item.item_type}</td> */}
                                <td className="text-right">{Number(getOriginalPrice(item)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="text-right">{item.quantity}</td>
                                <td className="text-right">{getDiscountDisplay(item)}</td>
                                <td className="text-right">{Number(item.line_total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="totals-section">
                    <div className="totals-row">
                        <span>Payment Method</span>
                        <span className="capitalize">{formatPaymentMethod(invoice.payment_method)}</span>
                    </div>
                    <div className="totals-row">
                        <span>Subtotal</span>
                        <span>{Number(invoice.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    {invoice.overall_discount > 0 && (
                        <div className="totals-row text-red-600">
                            <span>Overall Discount ({invoice.overall_discount_type === 'percentage' ? `${invoice.overall_discount}%` : 'Fixed'})</span>
                            <span>- {(invoice.overall_discount_type === 'percentage' 
                                ? (Number(invoice.subtotal) * Number(invoice.overall_discount) / 100) 
                                : Number(invoice.overall_discount)
                            ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    )}
                    {Math.abs(invoice.rounding_adjustment) > 0 && (
                        <div className="totals-row">
                            <span>Rounding Adjustment</span>
                            <span>{invoice.rounding_adjustment > 0 ? '+' : ''} {Number(invoice.rounding_adjustment).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    )}
                    {totalDiscount > 0 && (
                        <div className="totals-row">
                            <span>Total Discount (You Saved)</span>
                            <span>- {Number(totalDiscount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    )}
                    {invoice.payments && invoice.payments.length > 0 ? (
                        invoice.payments.map((payment, index) => (
                            <div key={payment.id} className="totals-row">
                                <span>Payment {index + 1} ({formatPaymentMethod(payment.payment_method)})</span>
                                <span>- {Number(payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        ))
                    ) : (
                        invoice.advance_payment > 0 && (
                            <div className="totals-row">
                                <span>Advance Payment</span>
                                <span>- {Number(invoice.advance_payment).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        )
                    )}
                    <div className="totals-row grand-total">
                        <span>Amount Due</span>
                        <span>Rs. {Number(invoice.remaining).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>

                {/* Signatures */}
                <div className="signatures-section">
                    <div className="signature-box">
                        <div className="signature-line"></div>
                        <p>Customer Signature</p>
                    </div>
                    <div className="signature-box">
                        <div className="signature-line"></div>
                        <p>Cashier Signature</p>
                    </div>
                    <div className="signature-box">
                        <div className="signature-line"></div>
                        <p>Technician / Officer</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="invoice-footer">
                    Thank you for choosing <strong>GT Automech</strong>.
                    {invoice.terms_conditions && ` ${invoice.terms_conditions}`}
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                        background: white;
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }

                    .print-invoice {
                        width: 210mm;
                        margin: 0;
                        padding: 15mm;
                        box-sizing: border-box;
                        font-family: Arial, sans-serif;
                        font-size: 11px;
                        color: #000;
                    }

                    .invoice-header {
                        display: flex;
                        justify-content: space-between;
                        border-bottom: 2px solid #000;
                        padding-bottom: 10px;
                        margin-bottom: 15px;
                    }

                    .brand-section {
                        display: flex;
                        gap: 12px;
                        align-items: center;
                    }

                    .company-name {
                        margin: 0;
                        font-size: 18px;
                        font-weight: bold;
                    }

                    .company-tagline,
                    .company-contact {
                        margin: 2px 0;
                        font-size: 10px;
                    }

                    .invoice-meta {
                        text-align: right;
                    }

                    .invoice-title {
                        margin: 0;
                        font-size: 20px;
                        font-weight: bold;
                    }

                    .invoice-number {
                        font-weight: bold;
                        margin: 4px 0;
                    }

                    .invoice-dates {
                        font-size: 10px;
                    }

                    .three-col-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr 1fr;
                        gap: 15px;
                        margin-bottom: 15px;
                    }

                    .info-section {
                        margin-bottom: 15px;
                    }

                    .section-title {
                        margin: 0 0 4px 0;
                        font-size: 12px;
                        font-weight: bold;
                        border-bottom: 1px solid #000;
                        padding-bottom: 2px;
                    }

                    .info-grid {
                        display: grid;
                        grid-template-columns: 70px 1fr;
                        row-gap: 2px;
                        font-size: 11px;
                    }

                    .signatures-section {
                        display: grid;
                        grid-template-columns: 1fr 1fr 1fr;
                        gap: 30px;
                        margin-top: 60px;
                        margin-bottom: 20px;
                    }

                    .signature-box {
                        text-align: center;
                    }

                    .signature-line {
                        border-top: 1px solid #000;
                        margin-bottom: 5px;
                    }

                    .signature-box p {
                        margin: 0;
                        font-size: 10px;
                        font-weight: bold;
                        text-transform: uppercase;
                    }

                    .label {
                        font-weight: 500;
                        color: #444;
                    }

                    .items-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 15px;
                    }

                    .items-table thead th {
                        border-bottom: 2px solid #000;
                        text-align: left;
                        padding: 4px;
                        font-size: 10px;
                        text-transform: uppercase;
                        font-weight: 600;
                    }

                    .items-table tbody td {
                        padding: 4px;
                        border-bottom: 1px solid #ccc;
                        font-size: 11px;
                    }

                    .items-table .text-right {
                        text-align: right;
                    }

                    .items-table .capitalize {
                        text-transform: capitalize;
                    }

                    .totals-section {
                        max-width: 250px;
                        margin-left: auto;
                        margin-top: 15px;
                    }

                    .totals-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 2px 0;
                    }

                    .grand-total {
                        font-weight: bold;
                        font-size: 12px;
                        border-top: 2px solid #000;
                        margin-top: 4px;
                        padding-top: 4px;
                    }

                    .invoice-footer {
                        border-top: 1px solid #000;
                        padding-top: 8px;
                        font-size: 10px;
                        margin-top: 30px;
                        text-align: center;
                    }

                    @page {
                        margin: 0;
                        size: A4;
                    }
                }
            `}</style>
        </div>
    );
}