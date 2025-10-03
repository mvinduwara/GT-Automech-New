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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useForm } from "@inertiajs/react";

type RemarkFormProps = {
    id: number;
    remarks: string;
    routeName?: string; // Optional route name for flexibility
};

function RemarkForm({ id, remarks }: RemarkFormProps) {
    const [isOpen, setIsOpen] = useState(false);

    const { data, setData, put, processing, errors, reset } = useForm({
        remarks: remarks || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(route('dashboard.job-card.remarks', id), {
            onSuccess: () => {
                setIsOpen(false);
                reset();
            },
            onError: (errors) => {
                console.error('Failed to update remarks:', errors);
            }
        });
    };

    const handleCancel = () => {
        // Reset form data to original remarks when canceling
        setData('remarks', remarks || '');
        setIsOpen(false);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            // Reset form data when opening dialog
            setData('remarks', remarks || '');
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>
                <Button variant="outline">
                    Remarks
                    {remarks && (
                        <span className="ml-1 h-2 w-2 bg-blue-500 rounded-full"></span>
                    )}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md">
                <form onSubmit={handleSubmit}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Job Card Remarks</AlertDialogTitle>
                        <AlertDialogDescription>
                            Job Card No. {id}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="py-4">
                        <div className="space-y-2">
                            <Label htmlFor="remarks">Remarks</Label>
                            <Textarea
                                id="remarks"
                                value={data.remarks}
                                onChange={(e) => setData('remarks', e.target.value)}
                                placeholder="Enter job card remarks..."
                                className={`min-h-[100px] resize-none ${errors.remarks ? 'border-red-500' : ''}`}
                                rows={4}
                            />
                            {errors.remarks && (
                                <p className="text-sm text-red-500">{errors.remarks}</p>
                            )}
                        </div>
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
                            disabled={processing}
                        >
                            {processing ? 'Updating...' : 'Update Remarks'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default RemarkForm;