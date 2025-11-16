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
    FileText, 
    DollarSign, 
    CheckCircle, 
    XCircle, 
    Settings,
    AlertTriangle,
    Clock
} from "lucide-react";

type InvoiceStatus = 'draft' | 'unpaid' | 'partial' | 'paid' | 'cancelled';

type InvoiceStatusFormProps = {
    invoiceId: number;
    currentStatus: InvoiceStatus;
    invoiceNo?: string;
    disabled?: boolean;
};

function InvoiceStatusForm({ 
    invoiceId, 
    currentStatus, 
    invoiceNo, 
    disabled = false 
}: InvoiceStatusFormProps) {
    const [isOpen, setIsOpen] = useState(false);

    const { data, setData, put, processing, errors, reset } = useForm({
        status: currentStatus,
    });

    const statusOptions = [
        {
            value: 'draft' as InvoiceStatus,
            label: 'Draft',
            icon: FileText,
            color: 'bg-gray-100 text-gray-800 border-gray-200',
            description: 'Invoice is in draft mode'
        },
        {
            value: 'unpaid' as InvoiceStatus,
            label: 'Unpaid',
            icon: Clock,
            color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            description: 'Invoice has not been paid'
        },
        {
            value: 'partial' as InvoiceStatus,
            label: 'Partial',
            icon: DollarSign,
            color: 'bg-blue-100 text-blue-800 border-blue-200',
            description: 'Invoice is partially paid'
        },
        {
            value: 'paid' as InvoiceStatus,
            label: 'Paid',
            icon: CheckCircle,
            color: 'bg-green-100 text-green-800 border-green-200',
            description: 'Invoice has been fully paid'
        },
        {
            value: 'cancelled' as InvoiceStatus,
            label: 'Cancelled',
            icon: XCircle,
            color: 'bg-red-100 text-red-800 border-red-200',
            description: 'Invoice has been cancelled'
        }
    ];

    const getCurrentStatusConfig = () => {
        return statusOptions.find(option => option.value === currentStatus) || statusOptions[0];
    };

    const getSelectedStatusConfig = () => {
        return statusOptions.find(option => option.value === data.status) || statusOptions[0];
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        put(route('dashboard.invoice.update-status', invoiceId), {
            onSuccess: () => {
                setIsOpen(false);
                reset();
            },
            onError: (errors) => {
                console.error('Failed to update status:', errors);
            }
        });
    };

    const handleCancel = () => {
        setData('status', currentStatus);
        setIsOpen(false);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            setData('status', currentStatus);
        }
    };

    const isStatusChanged = data.status !== currentStatus;
    const selectedConfig = getSelectedStatusConfig();
    const currentConfig = getCurrentStatusConfig();
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
                    <Settings className="h-4 w-4" />
                    Update Status
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md">
                <form onSubmit={handleSubmit}>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Update Invoice Status
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {invoiceNo ? `Invoice No. ${invoiceNo}` : `Invoice ID: ${invoiceId}`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="py-4 space-y-4">
                        {/* Current Status */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Current Status</Label>
                            <div className="flex items-center gap-2">
                                <Badge className={currentConfig.color}>
                                    <CurrentIcon className="h-3 w-3 mr-1" />
                                    {currentConfig.label}
                                </Badge>
                            </div>
                        </div>

                        {/* New Status Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="status">New Status</Label>
                            <Select 
                                value={data.status} 
                                onValueChange={(value: InvoiceStatus) => setData('status', value)}
                            >
                                <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select new status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusOptions.map((option) => {
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
                            {errors.status && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    {errors.status}
                                </p>
                            )}
                        </div>

                        {/* Status Change Preview */}
                        {isStatusChanged && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-600">Status will change to:</span>
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

                        {/* Warning for certain status changes */}
                        {isStatusChanged && data.status === 'cancelled' && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center gap-2 text-sm text-red-800">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="font-medium">Warning</span>
                                </div>
                                <p className="text-xs text-red-700 mt-1">
                                    Cancelling this invoice cannot be undone. Please confirm this action.
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
                            disabled={processing || !isStatusChanged}
                            className="bg-primary hover:bg-primary/90"
                        >
                            {processing ? 'Updating...' : 'Update Status'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default InvoiceStatusForm;