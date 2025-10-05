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
import { useState } from "react";
import { router } from "@inertiajs/react";
import { Trash2 } from "lucide-react";

type JobCardChargesFormProps = {
    jobCardId: number;
};

function JobCardChargesForm({ jobCardId }: JobCardChargesFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentChargeId, setCurrentChargeId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [justCreated, setJustCreated] = useState(false);
    const [errors, setErrors] = useState<any>({});

    const [formData, setFormData] = useState({
        name: "",
        charge: 0,
        discount_type: null as "percentage" | "amount" | null,
        discount_value: 0,
    });

    // Calculate display total
    const calculatedTotal = () => {
        const charge = formData.charge || 0;
        const discountValue = formData.discount_value || 0;

        if (formData.discount_type === "percentage") {
            const discountAmount = (charge * discountValue) / 100;
            return charge - discountAmount;
        } else if (formData.discount_type === "amount") {
            return Math.max(0, charge - discountValue);
        }
        return charge;
    };

    // --- Handle Dialog Open/Close ---
    const handleOpenChange = (open: boolean) => {
        console.log("handleOpenChange called with:", open, "isCreating:", isCreating);

        // Ignore close right after creation
        if (!open && justCreated) {
            console.log("Ignoring close event after creation");
            setJustCreated(false);
            return;
        }

        if (open && !isCreating) {
            createCharge();
        } else if (!open && !isCreating) {
            // Close dialog normally
            resetForm();
        }
    };

    // --- Create a new charge when dialog opens ---
    const createCharge = () => {
        setErrors({});
        setIsProcessing(true);
        setIsCreating(true);

        fetch(route("dashboard.job-card-charges.store", jobCardId), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN":
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute("content") || "",
                Accept: "application/json",
            },
            body: JSON.stringify({
                name: "New Charge",
                charge: 0,
                discount_type: null,
                discount_value: 0,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("Create response:", data);

                if (data.success && data.charge) {
                    const charge = data.charge;
                    setCurrentChargeId(charge.id);
                    setFormData({
                        name: charge.name || "New Charge",
                        charge: charge.charge || 0,
                        discount_type: charge.discount_type || null,
                        discount_value: charge.discount_value || 0,
                    });
                    setIsOpen(true);
                    setJustCreated(true);
                    console.log("Charge created successfully. ID:", charge.id);
                } else {
                    console.error("Failed to create charge:", data);
                    alert("Failed to create charge. Please try again.");
                }
            })
            .catch((error) => {
                console.error("Error creating charge:", error);
                alert("Failed to create charge. Please try again.");
            })
            .finally(() => {
                setIsProcessing(false);
                setIsCreating(false);
            });
    };

    // --- Reset Form State ---
    const resetForm = () => {
        setIsOpen(false);
        setCurrentChargeId(null);
        setFormData({
            name: "",
            charge: 0,
            discount_type: null,
            discount_value: 0,
        });
        setErrors({});
    };

    // --- Update Charge ---
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        console.log("handleSubmit called");
        console.log("currentChargeId:", currentChargeId);
        console.log("formData:", formData);

        if (!currentChargeId) {
            alert("No charge ID found. Please try again.");
            return;
        }

        setIsProcessing(true);
        setErrors({});

        router.put(
            route("dashboard.job-card-charges.update", currentChargeId),
            {
                name: formData.name,
                charge: formData.charge,
                discount_type: formData.discount_type,
                discount_value: formData.discount_value,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    console.log("Update successful");
                    resetForm();
                    setIsProcessing(false);
                },
                onError: (errors) => {
                    console.error("Failed to update charge:", errors);
                    setErrors(errors);
                    setIsProcessing(false);
                },
            }
        );
    };

    // --- Delete Charge ---
    const handleDelete = () => {
        if (!currentChargeId) return;

        if (confirm("Are you sure you want to delete this charge?")) {
            setIsDeleting(true);

            router.delete(route("dashboard.job-card-charges.destroy", currentChargeId), {
                preserveScroll: true,
                onSuccess: () => {
                    resetForm();
                    setIsDeleting(false);
                },
                onError: (errors) => {
                    console.error("Failed to delete charge:", errors);
                    setErrors(errors);
                    setIsDeleting(false);
                },
            });
        }
    };

    // --- Cancel Dialog ---
    const handleCancel = () => {
        if (currentChargeId) {
            router.delete(route("dashboard.job-card-charges.destroy", currentChargeId), {
                preserveScroll: true,
                onFinish: () => resetForm(),
            });
        } else {
            resetForm();
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={isProcessing || isCreating}>
                    {isProcessing || isCreating ? "Creating..." : "Add Charge"}
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="max-w-lg">
                <form onSubmit={handleSubmit}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Job Card Charge</AlertDialogTitle>
                        <AlertDialogDescription>
                            Job Card No. {jobCardId}
                            {currentChargeId && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                    (Charge ID: {currentChargeId})
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="py-4 space-y-4">
                        {/* Name Field */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Charge Name</Label>
                            <Input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                placeholder="Enter charge name..."
                                className={errors.name ? "border-red-500" : ""}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name}</p>
                            )}
                        </div>

                        {/* Charge Amount */}
                        <div className="space-y-2">
                            <Label htmlFor="charge">Charge Amount</Label>
                            <Input
                                id="charge"
                                type="number"
                                min="0"
                                value={formData.charge}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        charge: parseInt(e.target.value) || 0,
                                    })
                                }
                                placeholder="0"
                                className={errors.charge ? "border-red-500" : ""}
                            />
                            {errors.charge && (
                                <p className="text-sm text-red-500">{errors.charge}</p>
                            )}
                        </div>

                        {/* Discount Type */}
                        <div className="space-y-2">
                            <Label htmlFor="discount_type">Discount Type</Label>
                            <Select
                                value={formData.discount_type || "none"}
                                onValueChange={(value) => {
                                    const newDiscountType =
                                        value === "none"
                                            ? null
                                            : (value as "percentage" | "amount");
                                    setFormData({
                                        ...formData,
                                        discount_type: newDiscountType,
                                        discount_value:
                                            newDiscountType === null
                                                ? 0
                                                : formData.discount_value,
                                    });
                                }}
                            >
                                <SelectTrigger
                                    className={
                                        errors.discount_type ? "border-red-500" : ""
                                    }
                                >
                                    <SelectValue placeholder="Select discount type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Discount</SelectItem>
                                    <SelectItem value="percentage">
                                        Percentage (%)
                                    </SelectItem>
                                    <SelectItem value="amount">Amount</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.discount_type && (
                                <p className="text-sm text-red-500">
                                    {errors.discount_type}
                                </p>
                            )}
                        </div>

                        {/* Discount Value */}
                        {formData.discount_type && (
                            <div className="space-y-2">
                                <Label htmlFor="discount_value">
                                    Discount Value{" "}
                                    {formData.discount_type === "percentage"
                                        ? "(%)"
                                        : "(Amount)"}
                                </Label>
                                <Input
                                    id="discount_value"
                                    type="number"
                                    min="0"
                                    max={
                                        formData.discount_type === "percentage"
                                            ? "100"
                                            : undefined
                                    }
                                    step="0.01"
                                    value={formData.discount_value}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            discount_value:
                                                parseFloat(e.target.value) || 0,
                                        })
                                    }
                                    placeholder="0"
                                    className={
                                        errors.discount_value ? "border-red-500" : ""
                                    }
                                />
                                {errors.discount_value && (
                                    <p className="text-sm text-red-500">
                                        {errors.discount_value}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Total Display */}
                        <div className="pt-2 border-t">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold">Total:</span>
                                <span className="text-lg font-bold">
                                    {calculatedTotal().toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <AlertDialogFooter className="gap-2">
                        {currentChargeId && (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={isDeleting || isProcessing}
                                className="mr-auto"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {isDeleting ? "Deleting..." : "Delete"}
                            </Button>
                        )}
                        <AlertDialogCancel
                            type="button"
                            onClick={handleCancel}
                            disabled={isProcessing || isDeleting}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            type="submit"
                            disabled={isProcessing || isDeleting}
                        >
                            {isProcessing ? "Saving..." : "Save Charge"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default JobCardChargesForm;
