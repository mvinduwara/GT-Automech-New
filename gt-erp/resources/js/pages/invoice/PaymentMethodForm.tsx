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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useForm } from "@inertiajs/react";
import { 
    CreditCard, 
    Banknote, 
    Globe, 
    ScrollText, 
    Settings,
    AlertTriangle,
    Wallet,
    TriangleAlert
} from "lucide-react";

type PaymentMethod = 'cash' | 'card' | 'online' | 'cheque'|'credit';

type PaymentMethodFormProps = {
    invoiceId: number;
    currentPaymentMethod: PaymentMethod;
    invoiceNo?: string;
    disabled?: boolean;
};

function PaymentMethodForm({ 
    invoiceId, 
    currentPaymentMethod, 
    invoiceNo, 
    disabled = false 
}: PaymentMethodFormProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Initialize form with payment_method instead of status
    const { data, setData, put, processing, errors, reset } = useForm({
        payment_method: currentPaymentMethod,
    });

    const paymentOptions = [
        {
            value: 'cash' as PaymentMethod,
            label: 'Cash',
            icon: Banknote,
            color: 'bg-green-100 text-green-800 border-green-200',
            description: 'Payment received in cash'
        },
        {
            value: 'card' as PaymentMethod,
            label: 'Card',
            icon: CreditCard,
            color: 'bg-purple-100 text-purple-800 border-purple-200',
            description: 'Credit or Debit card payment'
        },
        {
            value: 'online' as PaymentMethod,
            label: 'Online Transfer',
            icon: Globe,
            color: 'bg-blue-100 text-blue-800 border-blue-200',
            description: 'Bank transfer or online gateway'
        },
        {
            value: 'cheque' as PaymentMethod,
            label: 'Cheque',
            icon: ScrollText,
            color: 'bg-orange-100 text-orange-800 border-orange-200',
            description: 'Bank cheque payment'
        },
        {
            value: 'credit' as PaymentMethod,
            label: 'Credit',
            icon: TriangleAlert,
            color: 'bg-red-100 text-red-800 border-red-200',
            description: 'Credit payment to be settled later'
        }
    ];

    const getCurrentConfig = () => {
        return paymentOptions.find(option => option.value === currentPaymentMethod) || paymentOptions[0];
    };

    const getSelectedConfig = () => {
        return paymentOptions.find(option => option.value === data.payment_method) || paymentOptions[0];
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Assuming standard Laravel Resource naming convention
        put(route('dashboard.invoice.payment-method', invoiceId), {
            onSuccess: () => {
                setIsOpen(false);
                reset();
            },
            onError: (errors) => {
                console.error('Failed to update payment method:', errors);
            }
        });
    };

    const handleCancel = () => {
        setData('payment_method', currentPaymentMethod);
        setIsOpen(false);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            // Reset to current prop value when re-opening
            setData('payment_method', currentPaymentMethod);
        }
    };

    const isChanged = data.payment_method !== currentPaymentMethod;
    const selectedConfig = getSelectedConfig();
    const currentConfig = getCurrentConfig();
    const CurrentIcon = currentConfig.icon;

    return (
        <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>
                <Button 
                    variant="outline" 
                    size="sm"
                    disabled={disabled}
                    className="flex items-center gap-2"
                >
                    <Wallet className="h-4 w-4" />
                    Edit Method
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md">
                <form onSubmit={handleSubmit}>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Wallet className="h-5 w-5" />
                            Update Payment Method
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Change the payment method for {invoiceNo ? `Invoice No. ${invoiceNo}` : `Invoice ID: ${invoiceId}`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="py-4 space-y-4">
                        {/* Current Selection */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Current Method</Label>
                            <div className="flex items-center gap-2">
                                <Badge className={currentConfig.color}>
                                    <CurrentIcon className="h-3 w-3 mr-1" />
                                    {currentConfig.label}
                                </Badge>
                            </div>
                        </div>

                        {/* New Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="payment_method">New Payment Method</Label>
                            <Select 
                                value={data.payment_method} 
                                onValueChange={(value: PaymentMethod) => setData('payment_method', value)}
                            >
                                <SelectTrigger className={errors.payment_method ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select payment method" />
                                </SelectTrigger>
                                <SelectContent>
                                    {paymentOptions.map((option) => {
                                        const IconComponent = option.icon;
                                        return (
                                            <SelectItem 
                                                key={option.value} 
                                                value={option.value}
                                                className="cursor-pointer"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <IconComponent className="h-4 w-4" />
                                                    <div>
                                                        <div className="font-medium">{option.label}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {option.description}
                                                        </div>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                            {errors.payment_method && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    {errors.payment_method}
                                </p>
                            )}
                        </div>

                        {/* Change Preview */}
                        {isChanged && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-600">Method will change to:</span>
                                    <Badge className={selectedConfig.color}>
                                        <selectedConfig.icon className="h-3 w-3 mr-1" />
                                        {selectedConfig.label}
                                    </Badge>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                    {selectedConfig.description}
                                </p>
                            </div>
                        )}
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            type="button"
                            onClick={handleCancel}
                            disabled={processing}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            type="submit"
                            disabled={processing || !isChanged}
                            className="bg-primary hover:bg-primary/90"
                        >
                            {processing ? 'Updating...' : 'Update Method'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default PaymentMethodForm;