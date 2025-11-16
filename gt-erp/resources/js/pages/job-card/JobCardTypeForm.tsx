// JobCardTypeForm.tsx
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
    Wrench,
    FileText,
    Shield,
    Settings,
    AlertTriangle
} from "lucide-react";

type JobCardType = 'general' | 'service' | 'insurance';

type JobCardTypeFormProps = {
    id: number;
    currentType: JobCardType;
    jobCardNo?: string;
    disabled?: boolean;
    hasInvoice?: boolean;
    hasInsurance?: boolean;
};

function JobCardTypeForm({
    id,
    currentType,
    jobCardNo,
    disabled = false,
    hasInvoice = false,
    hasInsurance = false
}: JobCardTypeFormProps) {
    const [isOpen, setIsOpen] = useState(false);

    const { data, setData, put, processing, errors, reset } = useForm({
        type: currentType,
    });

    const typeOptions = [
        {
            value: 'general' as JobCardType,
            label: 'General',
            icon: Wrench,
            color: 'bg-blue-100 text-blue-800 border-blue-200',
            description: 'General maintenance and repairs'
        },
        {
            value: 'service' as JobCardType,
            label: 'Service',
            icon: FileText,
            color: 'bg-purple-100 text-purple-800 border-purple-200',
            description: 'Regular service job with invoice'
        },
        {
            value: 'insurance' as JobCardType,
            label: 'Insurance',
            icon: Shield,
            color: 'bg-orange-100 text-orange-800 border-orange-200',
            description: 'Insurance claim job'
        }
    ];

    const getCurrentTypeConfig = () => {
        return typeOptions.find(option => option.value === currentType) || typeOptions[0];
    };

    const getSelectedTypeConfig = () => {
        return typeOptions.find(option => option.value === data.type) || typeOptions[0];
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Warning if changing from insurance to service/general when insurance exists
        if (currentType === 'insurance' && data.type !== 'insurance' && hasInsurance) {
            if (!confirm('This job card has an insurance record. Changing the type may cause issues. Continue?')) {
                return;
            }
        }

        // Warning if changing from service to insurance when invoice exists
        if (currentType !== 'insurance' && data.type === 'insurance' && hasInvoice) {
            if (!confirm('This job card has an invoice. Consider the implications of changing to insurance type. Continue?')) {
                return;
            }
        }

        put(route('dashboard.job-card.type', id), {
            onSuccess: () => {
                setIsOpen(false);
                reset();
            },
            onError: (errors) => {
                console.error('Failed to update type:', errors);
            }
        });
    };

    const handleCancel = () => {
        setData('type', currentType);
        setIsOpen(false);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            setData('type', currentType);
        }
    };

    const isTypeChanged = data.type !== currentType;
    const selectedConfig = getSelectedTypeConfig();
    const currentConfig = getCurrentTypeConfig();
    const CurrentIcon = currentConfig.icon;

    // Check if type change would be problematic
    const getTypeChangeWarning = () => {
        if (currentType === 'insurance' && data.type !== 'insurance' && hasInsurance) {
            return 'Warning: This job card has insurance records. Changing type may affect document management.';
        }
        if (currentType !== 'insurance' && data.type === 'insurance' && hasInvoice) {
            return 'Note: This job card has an invoice. Insurance claims typically use insurance documents instead.';
        }
        return null;
    };

    const warning = isTypeChanged ? getTypeChangeWarning() : null;

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
                    Update Type
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md">
                <form onSubmit={handleSubmit}>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Update Job Card Type
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {jobCardNo ? `Job Card No. ${jobCardNo}` : `Job Card ID: ${id}`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="py-4 space-y-4">
                        {/* Current Type */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Current Type</Label>
                            <div className="flex items-center gap-2">
                                <Badge className={currentConfig.color}>
                                    <CurrentIcon className="h-3 w-3 mr-1" />
                                    {currentConfig.label}
                                </Badge>
                            </div>
                        </div>

                        {/* New Type Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="type">New Type</Label>
                            <Select
                                value={data.type}
                                onValueChange={(value: JobCardType) => setData('type', value)}
                            >
                                <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select new type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {typeOptions.map((option) => {
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
                            {errors.type && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    {errors.type}
                                </p>
                            )}
                        </div>

                        {/* Type Change Preview */}
                        {isTypeChanged && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-600">Type will change to:</span>
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

                        {/* Warning Message */}
                        {warning && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-yellow-800">
                                        {warning}
                                    </p>
                                </div>
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
                            disabled={processing || !isTypeChanged}
                            className="bg-primary hover:bg-primary/90"
                        >
                            {processing ? 'Updating...' : 'Update Type'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default JobCardTypeForm;