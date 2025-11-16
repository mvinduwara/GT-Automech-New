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
import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { Trash2, Plus } from "lucide-react";

type ExistingCharge = {
    id: number;
    name: string;
    charge: number;
    discount_type: 'percentage' | 'amount' | null;
    discount_value: number;
    total: number;
};

type ChargeFormData = {
    id?: number;
    name: string;
    charge: number;
    discount_type: 'percentage' | 'amount' | null;
    discount_value: number;
};

type JobCardChargesFormProps = {
    jobCardId: number;
    existingCharges: ExistingCharge[];
};

function JobCardChargesForm({ jobCardId, existingCharges }: JobCardChargesFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [charges, setCharges] = useState<ChargeFormData[]>([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        if (isOpen) {
            loadExistingCharges();
        }
    }, [isOpen]);

    const loadExistingCharges = () => {
        if (existingCharges && existingCharges.length > 0) {
            const mappedCharges = existingCharges.map(charge => ({
                id: charge.id,
                name: charge.name,
                charge: charge.charge,
                discount_type: charge.discount_type,
                discount_value: charge.discount_value,
            }));
            setCharges(mappedCharges);
        } else {
            setCharges([getEmptyCharge()]);
        }
    };

    const getEmptyCharge = (): ChargeFormData => ({
        name: "",
        charge: 0,
        discount_type: null,
        discount_value: 0,
    });

    const addCharge = () => {
        setCharges([...charges, getEmptyCharge()]);
    };

    const removeCharge = (index: number) => {
        const charge = charges[index];
        
        // If charge has an ID, delete it from backend
        if (charge.id) {
            if (confirm("Are you sure you want to delete this charge?")) {
                router.delete(
                    route('dashboard.job-card-charges.destroy', charge.id),
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            const newCharges = charges.filter((_, i) => i !== index);
                            setCharges(newCharges.length > 0 ? newCharges : [getEmptyCharge()]);
                        },
                        onError: (errors) => {
                            console.error('Failed to delete charge:', errors);
                            alert('Failed to delete charge. Please try again.');
                        }
                    }
                );
            }
        } else {
            // Just remove from local state if not saved yet
            const newCharges = charges.filter((_, i) => i !== index);
            setCharges(newCharges.length > 0 ? newCharges : [getEmptyCharge()]);
        }
    };

    const updateCharge = (index: number, field: keyof ChargeFormData, value: any) => {
        const newCharges = [...charges];
        newCharges[index] = { ...newCharges[index], [field]: value };
        setCharges(newCharges);
    };

    const calculateChargeTotal = (charge: ChargeFormData): number => {
        const chargeAmount = charge.charge || 0;

        if (!charge.discount_type || charge.discount_value === 0) {
            return chargeAmount;
        }

        if (charge.discount_type === 'percentage') {
            const discountAmount = (chargeAmount * charge.discount_value) / 100;
            return Math.round((chargeAmount - discountAmount) * 100) / 100;
        }

        return Math.max(0, chargeAmount - charge.discount_value);
    };

    const validateCharges = (): boolean => {
        const validCharges = charges.filter(c => c.name.trim() && c.charge > 0);

        if (validCharges.length === 0) {
            alert('Please add at least one valid charge');
            return false;
        }

        for (const charge of validCharges) {
            if (!charge.name.trim()) {
                alert('Please enter a name for all charges');
                return false;
            }

            if (charge.charge <= 0) {
                alert('Charge amount must be greater than 0');
                return false;
            }

            if (charge.discount_type === 'percentage' && charge.discount_value > 100) {
                alert('Percentage discount cannot exceed 100%');
                return false;
            }

            if (charge.discount_type === 'amount' && charge.discount_value > charge.charge) {
                alert('Discount amount cannot exceed charge amount');
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateCharges()) {
            return;
        }

        setLoading(true);
        setErrors({});

        const validCharges = charges.filter(c => c.name.trim() && c.charge > 0);
        let successCount = 0;
        let errorCount = 0;

        // Process each charge
        for (const charge of validCharges) {
            try {
                if (charge.id) {
                    // Update existing charge
                    await new Promise((resolve, reject) => {
                        router.put(
                            route('dashboard.job-card-charges.update', charge.id),
                            {
                                name: charge.name,
                                charge: charge.charge,
                                discount_type: charge.discount_type,
                                discount_value: charge.discount_value,
                            },
                            {
                                preserveScroll: true,
                                onSuccess: () => {
                                    successCount++;
                                    resolve(true);
                                },
                                onError: (errors) => {
                                    errorCount++;
                                    console.error('Failed to update charge:', errors);
                                    reject(errors);
                                }
                            }
                        );
                    });
                } else {
                    // Create new charge
                    await new Promise((resolve, reject) => {
                        router.post(
                            route('dashboard.job-card-charges.store', jobCardId),
                            {
                                name: charge.name,
                                charge: charge.charge,
                                discount_type: charge.discount_type,
                                discount_value: charge.discount_value,
                            },
                            {
                                preserveScroll: true,
                                onSuccess: () => {
                                    successCount++;
                                    resolve(true);
                                },
                                onError: (errors) => {
                                    errorCount++;
                                    console.error('Failed to create charge:', errors);
                                    reject(errors);
                                }
                            }
                        );
                    });
                }
            } catch (error) {
                console.error('Error processing charge:', error);
            }
        }

        setLoading(false);

        if (errorCount === 0) {
            setIsOpen(false);
            setCharges([getEmptyCharge()]);
        } else {
            alert(`Processed ${successCount} charges successfully. ${errorCount} failed.`);
        }
    };

    const handleCancel = () => {
        setCharges([getEmptyCharge()]);
        setErrors({});
        setIsOpen(false);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            loadExistingCharges();
        } else {
            setErrors({});
        }
    };

    const getTotalAmount = (): number => {
        return charges
            .filter(c => c.name.trim() && c.charge > 0)
            .reduce((sum, charge) => sum + calculateChargeTotal(charge), 0);
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>
                <Button variant="outline">
                    Manage Charges
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Job Card Charges</AlertDialogTitle>
                        <AlertDialogDescription>
                            Add or modify charges for Job Card #{jobCardId}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="py-4 space-y-4">
                        {charges.map((charge, index) => (
                            <div key={index} className="border rounded-lg p-4 space-y-3">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-medium">
                                        Charge {index + 1}
                                        {charge.id && (
                                            <span className="ml-2 text-xs text-muted-foreground">
                                                (ID: {charge.id})
                                            </span>
                                        )}
                                    </h4>
                                    {charges.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => removeCharge(index)}
                                            disabled={loading}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Charge Name */}
                                    <div className="col-span-2 space-y-2">
                                        <Label>Charge Name</Label>
                                        <Input
                                            type="text"
                                            value={charge.name}
                                            onChange={(e) =>
                                                updateCharge(index, 'name', e.target.value)
                                            }
                                            placeholder="Enter charge name (e.g., Labor, Service Fee)"
                                        />
                                    </div>

                                    {/* Charge Amount */}
                                    <div className="space-y-2">
                                        <Label>Charge Amount (Rs.)</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={charge.charge}
                                            onChange={(e) =>
                                                updateCharge(index, 'charge', parseInt(e.target.value) || 0)
                                            }
                                            placeholder="0"
                                        />
                                    </div>

                                    {/* Discount Type */}
                                    <div className="space-y-2">
                                        <Label>Discount Type</Label>
                                        <Select
                                            value={charge.discount_type || 'none'}
                                            onValueChange={(value) =>
                                                updateCharge(
                                                    index,
                                                    'discount_type',
                                                    value === 'none' ? null : value
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="No discount" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">No Discount</SelectItem>
                                                <SelectItem value="percentage">Percentage (%)</SelectItem>
                                                <SelectItem value="amount">Amount (Rs.)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Discount Value */}
                                    <div className="space-y-2">
                                        <Label>
                                            Discount Value
                                            {charge.discount_type === 'percentage' && ' (%)'}
                                            {charge.discount_type === 'amount' && ' (Rs.)'}
                                        </Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max={charge.discount_type === 'percentage' ? '100' : undefined}
                                            value={charge.discount_value}
                                            onChange={(e) =>
                                                updateCharge(index, 'discount_value', parseFloat(e.target.value) || 0)
                                            }
                                            disabled={!charge.discount_type}
                                            placeholder="0.00"
                                        />
                                    </div>

                                    {/* Total Display */}
                                    <div className="col-span-2 space-y-2">
                                        <div className="flex justify-between items-center text-sm pt-2 border-t">
                                            <span className="text-gray-600">
                                                Subtotal: Rs. {charge.charge.toLocaleString()}
                                            </span>
                                            <span className="font-semibold">
                                                Total: Rs. {calculateChargeTotal(charge).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <Button
                            type="button"
                            variant="outline"
                            onClick={addCharge}
                            className="w-full"
                            disabled={loading}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Another Charge
                        </Button>

                        {/* Grand Total */}
                        {charges.some(c => c.name.trim() && c.charge > 0) && (
                            <div className="flex justify-between items-center pt-4 border-t-2">
                                <span className="text-lg font-semibold">Grand Total:</span>
                                <span className="text-lg font-bold">
                                    Rs. {getTotalAmount().toLocaleString()}
                                </span>
                            </div>
                        )}
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
                            {loading ? 'Saving...' : 'Save Charges'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default JobCardChargesForm;