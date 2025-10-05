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
import { useState } from "react";
import { useForm } from "@inertiajs/react";

type MileageFormProps = {
    id: number;
    mileage: number;
};

function MileageForm({ id, mileage }: MileageFormProps) {
    const [isOpen, setIsOpen] = useState(false);

    const { data, setData, put, processing, errors, reset } = useForm({
        mileage: mileage || 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(route("dashboard.job-card.mileage", id), {
            onSuccess: () => {
                setIsOpen(false);
            },
            onError: (errors) => {
                console.error("Failed to update mileage:", errors);
            },
        });
    };

    const handleCancel = () => {
        setData("mileage", mileage || 0);
        setIsOpen(false);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            setData("mileage", mileage || 0);
        }
    };

    const handleMileageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow only numbers
        if (value === "" || /^\d+$/.test(value)) {
            setData("mileage", value === "" ? 0 : parseInt(value));
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>
                <Button variant="outline">Mileage</Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md">
                <form onSubmit={handleSubmit}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Update Vehicle Mileage</AlertDialogTitle>
                        <AlertDialogDescription>
                            Update the current mileage reading for this job card
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="py-4 space-y-4">
                        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-blue-700 font-medium">
                                    Current Mileage:
                                </span>
                                <span className="text-2xl font-bold text-blue-900">
                                    {mileage.toLocaleString()} km
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="mileage">New Mileage (km) *</Label>
                            <div className="relative">
                                <Input
                                    id="mileage"
                                    type="text"
                                    value={data.mileage || ""}
                                    onChange={handleMileageChange}
                                    placeholder="Enter mileage"
                                    className={`pr-12 ${errors.mileage ? "border-red-500" : ""
                                        }`}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                                    km
                                </span>
                            </div>
                            {errors.mileage && (
                                <p className="text-sm text-red-500">{errors.mileage}</p>
                            )}
                            {data.mileage > 0 && (
                                <p className="text-xs text-gray-600">
                                    {data.mileage.toLocaleString()} kilometers
                                </p>
                            )}
                        </div>

                        {data.mileage < mileage && data.mileage > 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                                <p className="text-sm text-yellow-800">
                                    ⚠️ Warning: New mileage is less than the current
                                    mileage. Please verify the reading.
                                </p>
                            </div>
                        )}

                        {data.mileage > mileage + 10000 && (
                            <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                                <p className="text-sm text-orange-800">
                                    ⚠️ Notice: Mileage increase is more than 10,000 km.
                                    Please verify the reading.
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
                        <AlertDialogAction type="submit" disabled={processing}>
                            {processing ? "Updating..." : "Update Mileage"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default MileageForm;