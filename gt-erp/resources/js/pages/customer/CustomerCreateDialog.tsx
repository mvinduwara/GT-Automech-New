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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useForm } from "@inertiajs/react";
import { Plus, User, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface CustomerCreateDialogProps {
    onSuccess?: (customer: any) => void;
    triggerButtonText?: string;
    triggerButtonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    triggerButtonSize?: "default" | "sm" | "lg" | "icon";
    disabled?: boolean;
}

const titleOptions = [
    { value: "Mr", label: "Mr" },
    { value: "Mrs", label: "Mrs" },
    { value: "Ms", label: "Ms" },
    { value: "Ven", label: "Ven" },
    { value: "Dr", label: "Dr" },
    { value: "Prof", label: "Prof" },
];

function CustomerCreateDialog({
    onSuccess,
    triggerButtonText = "Add Customer",
    triggerButtonVariant = "default",
    triggerButtonSize = "default",
    disabled = false
}: CustomerCreateDialogProps) {
    const [isOpen, setIsOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        title: '',
        name: '',
        mobile: '',
        address: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('dashboard.customer.store'), {
            onSuccess: (page) => {
                setIsOpen(false);
                reset();
                clearErrors();
                toast.success('Customer created successfully!');

                // Call the onSuccess callback if provided
                if (onSuccess && page.props.customer) {
                    onSuccess(page.props.customer);
                }
            },
            onError: (errors) => {
                toast.error('Failed to create customer. Please check the form for errors.');
                console.error('Customer creation errors:', errors);
            }
        });
    };

    const handleCancel = () => {
        reset();
        clearErrors();
        setIsOpen(false);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            reset();
            clearErrors();
        }
    };

    const isFormValid = data.title && data.name && data.mobile && data.address;

    return (
        <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>
                <Button
                    variant={triggerButtonVariant}
                    size={triggerButtonSize}
                    disabled={disabled}
                    className="flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    {triggerButtonText}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Create New Customer
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Add a new customer to your system. All fields are required.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="py-4 space-y-4">
                        {/* Title Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Select
                                value={data.title}
                                onValueChange={(value) => setData('title', value)}
                            >
                                <SelectTrigger className={errors.title ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select a title" />
                                </SelectTrigger>
                                <SelectContent>
                                    {titleOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.title && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        {/* Name Input */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Enter customer name"
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Mobile Input */}
                        <div className="space-y-2">
                            <Label htmlFor="mobile">Mobile Number *</Label>
                            <Input
                                id="mobile"
                                type="tel"
                                value={data.mobile}
                                onChange={(e) => setData('mobile', e.target.value)}
                                placeholder="Enter mobile number"
                                className={errors.mobile ? 'border-red-500' : ''}
                            />
                            {errors.mobile && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    {errors.mobile}
                                </p>
                            )}
                        </div>

                        {/* Address Textarea */}
                        <div className="space-y-2">
                            <Label htmlFor="address">Address *</Label>
                            <Textarea
                                id="address"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                placeholder="Enter customer address"
                                className={`min-h-[80px] resize-none ${errors.address ? 'border-red-500' : ''}`}
                                rows={3}
                            />
                            {errors.address && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    {errors.address}
                                </p>
                            )}
                        </div>

                        {/* Form Status */}
                        {!isFormValid && (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-sm text-amber-700 flex items-center gap-1">
                                    <AlertTriangle className="h-4 w-4" />
                                    Please fill in all required fields
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
                            disabled={processing || !isFormValid}
                            className="bg-primary hover:bg-primary/90"
                        >
                            {processing ? 'Creating...' : 'Create Customer'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default CustomerCreateDialog;