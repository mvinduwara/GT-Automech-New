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
    Clock, 
    CheckCircle, 
    XCircle, 
    Settings,
    AlertTriangle 
} from "lucide-react";

type JobCardStatus = 'pending' | 'complete' | 'cancelled';

type JobCardStatusFormProps = {
    id: number;
    currentStatus: JobCardStatus;
    jobCardNo?: string;
    disabled?: boolean;
};

function JobCardStatusForm({ 
    id, 
    currentStatus, 
    jobCardNo, 
    disabled = false 
}: JobCardStatusFormProps) {
    const [isOpen, setIsOpen] = useState(false);

    const { data, setData, put, processing, errors, reset } = useForm({
        status: currentStatus,
    });

    const statusOptions = [
        {
            value: 'pending' as JobCardStatus,
            label: 'Pending',
            icon: Clock,
            color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            description: 'Job card is waiting to be processed'
        },
        {
            value: 'complete' as JobCardStatus,
            label: 'Complete',
            icon: CheckCircle,
            color: 'bg-green-100 text-green-800 border-green-200',
            description: 'Job card work has been completed'
        },
        {
            value: 'cancelled' as JobCardStatus,
            label: 'Cancelled',
            icon: XCircle,
            color: 'bg-red-100 text-red-800 border-red-200',
            description: 'Job card has been cancelled'
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
        
        put(route('dashboard.job-card.status', id), {
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
        // Reset form data to original status when canceling
        setData('status', currentStatus);
        setIsOpen(false);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            // Reset form data when opening dialog
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
                            Update Job Card Status
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {jobCardNo ? `Job Card No. ${jobCardNo}` : `Job Card ID: ${id}`}
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
                                onValueChange={(value: JobCardStatus) => setData('status', value)}
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

export default JobCardStatusForm;