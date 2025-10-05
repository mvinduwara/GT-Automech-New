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
import { Shield, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type CreateInsuranceFormProps = {
    jobCardId: number;
    jobCardNo: string;
    grandTotal: number;
    hasInsurance?: boolean;
    insuranceId?: number;
};

function CreateInsuranceForm({
    jobCardId,
    jobCardNo,
    grandTotal,
    hasInsurance = false,
    insuranceId
}: CreateInsuranceFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        claim_date: new Date().toISOString().split('T')[0],
        insurance_company: '',
        policy_number: '',
        claim_number: '',
        accident_date: '',
        accident_location: '',
        accident_description: '',
        damage_assessment: '',
        excess_amount: '0',
        remarks: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.insurance_company) {
            alert('Insurance company name is required');
            return;
        }

        if (!formData.policy_number) {
            alert('Policy number is required');
            return;
        }

        const excessAmount = parseFloat(formData.excess_amount) || 0;
        if (excessAmount < 0) {
            alert('Excess amount cannot be negative');
            return;
        }

        setLoading(true);

        router.post(
            route('dashboard.insurance.store', jobCardId),
            {
                claim_date: formData.claim_date,
                insurance_company: formData.insurance_company,
                policy_number: formData.policy_number,
                claim_number: formData.claim_number || null,
                accident_date: formData.accident_date || null,
                accident_location: formData.accident_location || null,
                accident_description: formData.accident_description || null,
                damage_assessment: formData.damage_assessment || null,
                excess_amount: excessAmount,
                remarks: formData.remarks || null,
            },
            {
                onSuccess: () => {
                    setIsOpen(false);
                    resetForm();
                },
                onError: (errors) => {
                    console.error('Failed to create insurance report:', errors);
                    alert('Failed to create insurance report. Please check the form and try again.');
                },
                onFinish: () => {
                    setLoading(false);
                }
            }
        );
    };

    const resetForm = () => {
        setFormData({
            claim_date: new Date().toISOString().split('T')[0],
            insurance_company: '',
            policy_number: '',
            claim_number: '',
            accident_date: '',
            accident_location: '',
            accident_description: '',
            damage_assessment: '',
            excess_amount: '0',
            remarks: '',
        });
    };

    const handleCancel = () => {
        resetForm();
        setIsOpen(false);
    };

    const handleViewInsurance = () => {
        if (insuranceId) {
            router.visit(route('dashboard.insurance.show', insuranceId));
        }
    };

    if (hasInsurance) {
        return (
            <Button
                variant="default"
                onClick={handleViewInsurance}
                className="bg-orange-600 hover:bg-orange-700"
            >
                <Shield className="h-4 w-4 mr-2" />
                View Insurance Report
            </Button>
        );
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="default" className="bg-orange-600 hover:bg-orange-700">
                    <Shield className="h-4 w-4 mr-2" />
                    Create Insurance Report
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Create Insurance Report</AlertDialogTitle>
                        <AlertDialogDescription>
                            Generate insurance claim report for Job Card {jobCardNo}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="py-4 space-y-4">
                        {/* Summary Card */}
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="font-medium">Estimated Cost:</span>
                                        <span className="font-bold">Rs. {grandTotal.toLocaleString()}</span>
                                    </div>
                                    {parseFloat(formData.excess_amount) > 0 && (
                                        <div className="flex justify-between text-gray-600">
                                            <span>Excess Amount:</span>
                                            <span>Rs. {parseFloat(formData.excess_amount).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </AlertDescription>
                        </Alert>

                        {/* Insurance Company Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="insurance_company">
                                    Insurance Company <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="insurance_company"
                                    type="text"
                                    value={formData.insurance_company}
                                    onChange={(e) => setFormData({ ...formData, insurance_company: e.target.value })}
                                    placeholder="e.g., AIA Insurance"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="policy_number">
                                    Policy Number <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="policy_number"
                                    type="text"
                                    value={formData.policy_number}
                                    onChange={(e) => setFormData({ ...formData, policy_number: e.target.value })}
                                    placeholder="e.g., POL-2024-12345"
                                    required
                                />
                            </div>
                        </div>

                        {/* Claim Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="claim_date">
                                    Claim Date <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="claim_date"
                                    type="date"
                                    value={formData.claim_date}
                                    onChange={(e) => setFormData({ ...formData, claim_date: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="claim_number">Claim Number</Label>
                                <Input
                                    id="claim_number"
                                    type="text"
                                    value={formData.claim_number}
                                    onChange={(e) => setFormData({ ...formData, claim_number: e.target.value })}
                                    placeholder="e.g., CLM-2024-67890"
                                />
                            </div>
                        </div>

                        {/* Accident Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="accident_date">Accident Date</Label>
                                <Input
                                    id="accident_date"
                                    type="date"
                                    value={formData.accident_date}
                                    onChange={(e) => setFormData({ ...formData, accident_date: e.target.value })}
                                    max={formData.claim_date}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="accident_location">Accident Location</Label>
                                <Input
                                    id="accident_location"
                                    type="text"
                                    value={formData.accident_location}
                                    onChange={(e) => setFormData({ ...formData, accident_location: e.target.value })}
                                    placeholder="e.g., Galle Road, Colombo"
                                />
                            </div>
                        </div>

                        {/* Accident Description */}
                        <div className="space-y-2">
                            <Label htmlFor="accident_description">Accident Description</Label>
                            <Textarea
                                id="accident_description"
                                value={formData.accident_description}
                                onChange={(e) => setFormData({ ...formData, accident_description: e.target.value })}
                                placeholder="Describe how the accident occurred..."
                                rows={3}
                            />
                        </div>

                        {/* Damage Assessment */}
                        <div className="space-y-2">
                            <Label htmlFor="damage_assessment">Damage Assessment</Label>
                            <Textarea
                                id="damage_assessment"
                                value={formData.damage_assessment}
                                onChange={(e) => setFormData({ ...formData, damage_assessment: e.target.value })}
                                placeholder="Detail the damages observed on the vehicle..."
                                rows={3}
                            />
                        </div>

                        {/* Excess Amount */}
                        <div className="space-y-2">
                            <Label htmlFor="excess_amount">Excess Amount (Rs.)</Label>
                            <Input
                                id="excess_amount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.excess_amount}
                                onChange={(e) => setFormData({ ...formData, excess_amount: e.target.value })}
                                placeholder="0.00"
                            />
                            <p className="text-xs text-gray-500">
                                Amount to be paid by the customer as excess
                            </p>
                        </div>

                        {/* Remarks */}
                        <div className="space-y-2">
                            <Label htmlFor="remarks">Additional Remarks</Label>
                            <Textarea
                                id="remarks"
                                value={formData.remarks}
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                placeholder="Any additional notes or observations..."
                                rows={2}
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
                            {loading ? 'Creating...' : 'Create Insurance Report'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default CreateInsuranceForm;