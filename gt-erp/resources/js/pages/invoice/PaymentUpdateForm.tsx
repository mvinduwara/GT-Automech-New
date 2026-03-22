// invoice/PaymentUpdateForm.tsx
import { useState } from "react";
import { router } from "@inertiajs/react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DollarSign, AlertCircle } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface PaymentUpdateFormProps {
    invoiceId: number;
    currentAdvancePayment: number;
    totalAmount: number;
    remaining: number;
    status: string;
}

export default function PaymentUpdateForm({
    invoiceId,
    currentAdvancePayment,
    totalAmount,
    remaining,
    status
}: PaymentUpdateFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cash");
    console.log("remaining", remaining)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const amount = parseFloat(paymentAmount);

        if (!amount || amount <= 0) {
            alert("Please enter a valid payment amount");
            return;
        }

        // This client-side check remains useful for immediate user feedback
        if (amount > remaining) {
            alert(`Payment exceeds remaining amount. Maximum: Rs. ${remaining}`);
            return;
        }

        setLoading(true);

        // 🔻 SEND 'payment_amount' INSTEAD OF 'advance_payment' - THIS IS THE FIX 🔻
        router.patch(
            route('dashboard.invoice.payment', invoiceId),
            { 
                payment_amount: amount,
                payment_method: paymentMethod
            }, // Send only the new payment amount
            {
                onSuccess: () => {
                    setIsOpen(false);
                    setPaymentAmount("");
                },
                onError: (errors) => {
                    console.error('Failed to update payment:', errors);
                    alert('Failed to update payment. Please try again.');
                },
                onFinish: () => {
                    setLoading(false);
                }
            }
        );
    };



    // Don't show for paid or cancelled invoices
    if (status === 'paid' || status === 'cancelled') {
        return null;
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Record Payment
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <form onSubmit={handleSubmit}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Record Payment</AlertDialogTitle>
                        <AlertDialogDescription>
                            Add a new payment to this invoice
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="py-4 space-y-4">
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span>Total Amount:</span>
                                        <span className="font-medium">Rs. {Number(totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Already Paid:</span>
                                        <span className="font-medium">Rs. {Number(currentAdvancePayment).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between border-t pt-1">
                                        <span className="font-semibold">Remaining:</span>
                                        <span className="font-bold text-red-600">Rs. {Number(remaining).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                            <Label htmlFor="payment_amount">
                                Payment Amount (Rs.) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="payment_amount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                max={remaining}
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                placeholder="Enter amount received"
                                required
                            />
                            <p className="text-xs text-gray-500">
                                Maximum: Rs. {Number(remaining).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="payment_method">Payment Method</Label>
                            <Select
                                value={paymentMethod}
                                onValueChange={(value) => setPaymentMethod(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="card">Card</SelectItem>
                                    <SelectItem value="online">Online/Bank Transfer</SelectItem>
                                    <SelectItem value="cheque">Cheque</SelectItem>
                                    <SelectItem value="credit">Credit</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel type="button" disabled={loading}>
                            Cancel
                        </AlertDialogCancel>
                        <Button variant={"default"} type="submit" disabled={loading}>
                            {loading ? 'Processing...' : 'Record Payment'}
                        </Button>
                        {/* <AlertDialogAction type="submit" disabled={loading}>
                            {loading ? 'Processing...' : 'Record Payment'}
                        </AlertDialogAction> */}
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}