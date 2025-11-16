import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { router } from "@inertiajs/react";
import { FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type CreateInvoiceFormProps = {
    jobCardId: number;
    jobCardNo: string;
    grandTotal: number;
    hasInvoice?: boolean;
    invoiceId?: number;
};

function CreateInvoiceForm({
    jobCardId,
    jobCardNo,
    grandTotal,
    hasInvoice = false,
    invoiceId
}: CreateInvoiceFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: '',
        advance_payment: '0',
        remarks: '',
        terms_conditions: 'Payment is due within 30 days.\nLate payments may incur additional charges.\nAll prices are in LKR.',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.invoice_date) {
            alert('Invoice date is required');
            return;
        }

        const advancePayment = parseFloat(formData.advance_payment) || 0;
        if (advancePayment > grandTotal) {
            alert('Advance payment cannot exceed the total amount');
            return;
        }

        if (advancePayment < 0) {
            alert('Advance payment cannot be negative');
            return;
        }

        setLoading(true);

        router.post(
            route('dashboard.invoice.store', jobCardId),
            {
                invoice_date: formData.invoice_date,
                due_date: formData.due_date || null,
                advance_payment: advancePayment,
                remarks: formData.remarks || null,
                terms_conditions: formData.terms_conditions || null,
            },
            {
                onSuccess: () => {
                    setIsOpen(false);
                    resetForm();
                },
                onError: (errors) => {
                    console.error('Failed to create invoice:', errors);
                    alert('Failed to create invoice. Please check the form and try again.');
                },
                onFinish: () => {
                    setLoading(false);
                }
            }
        );
    };

    const resetForm = () => {
        setFormData({
            invoice_date: new Date().toISOString().split('T')[0],
            due_date: '',
            advance_payment: '0',
            remarks: '',
            terms_conditions: 'Payment is due within 30 days.\nLate payments may incur additional charges.\nAll prices are in LKR.',
        });
    };

    const handleCancel = () => {
        resetForm();
        setIsOpen(false);
    };

    const handleViewInvoice = () => {
        if (invoiceId) {
            router.visit(route('dashboard.invoice.show', invoiceId));
        }
    };

    const calculateRemaining = () => {
        const advance = parseFloat(formData.advance_payment) || 0;
        return Math.max(0, grandTotal - advance);
    };

    if (hasInvoice) {
        return (
            <Button
                variant="default"
                onClick={handleViewInvoice}
                className="bg-green-600 hover:bg-green-700"
            >
                <FileText className="h-4 w-4 mr-2" />
                View Invoice
            </Button>
        );
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="default">
                    <FileText className="h-4 w-4 mr-2" />
                    Create Invoice
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Create Invoice</AlertDialogTitle>
                        <AlertDialogDescription>
                            Generate an invoice for Job Card {jobCardNo}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="py-4 space-y-4">
                        {/* Summary Card */}
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="font-medium">Total Amount:</span>
                                        <span className="font-bold">Rs. {grandTotal.toLocaleString()}</span>
                                    </div>
                                    {parseFloat(formData.advance_payment) > 0 && (
                                        <>
                                            <div className="flex justify-between text-gray-600">
                                                <span>Advance Payment:</span>
                                                <span>Rs. {parseFloat(formData.advance_payment).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between border-t pt-1">
                                                <span className="font-medium">Remaining:</span>
                                                <span className="font-bold text-indigo-600">
                                                    Rs. {calculateRemaining().toLocaleString()}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </AlertDescription>
                        </Alert>

                        {/* Invoice Date */}
                        <div className="space-y-2">
                            <Label htmlFor="invoice_date">
                                Invoice Date <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="invoice_date"
                                type="date"
                                value={formData.invoice_date}
                                onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                                required
                            />
                        </div>

                        {/* Due Date */}
                        <div className="space-y-2">
                            <Label htmlFor="due_date">Due Date (Optional)</Label>
                            <Input
                                id="due_date"
                                type="date"
                                value={formData.due_date}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                min={formData.invoice_date}
                            />
                        </div>

                        {/* Advance Payment */}
                        <div className="space-y-2">
                            <Label htmlFor="advance_payment">
                                Advance Payment (Rs.)
                            </Label>
                            <Input
                                id="advance_payment"
                                type="number"
                                step="0.01"
                                min="0"
                                max={grandTotal}
                                value={formData.advance_payment}
                                onChange={(e) => setFormData({ ...formData, advance_payment: e.target.value })}
                                placeholder="0.00"
                            />
                            <p className="text-xs text-gray-500">
                                Maximum: Rs. {grandTotal.toLocaleString()}
                            </p>
                        </div>

                        {/* Remarks */}
                        <div className="space-y-2">
                            <Label htmlFor="remarks">Remarks (Optional)</Label>
                            <Textarea
                                id="remarks"
                                value={formData.remarks}
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                placeholder="Add any additional notes or comments..."
                                rows={3}
                            />
                        </div>

                        {/* Terms & Conditions */}
                        <div className="space-y-2">
                            <Label htmlFor="terms_conditions">Terms & Conditions</Label>
                            <Textarea
                                id="terms_conditions"
                                value={formData.terms_conditions}
                                onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
                                placeholder="Enter payment terms and conditions..."
                                rows={4}
                            />
                        </div>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            type="button"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Invoice'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default CreateInvoiceForm;