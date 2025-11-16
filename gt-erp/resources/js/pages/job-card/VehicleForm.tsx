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
import { Vehicle } from "@/types/types";
import { useForm } from "@inertiajs/react";
import { Plus, Search } from "lucide-react";
import { useCallback, useState } from "react";
import { searchVehicles } from "./actions";

interface VehicleBrand {
    id: number;
    name: string;
}

interface VehicleModel {
    id: number;
    name: string;
}

interface VehicleData extends Vehicle {
    brand?: VehicleBrand;
    model?: VehicleModel;
}

type VehicleFormProps = {
    id: number;
    vehicle: VehicleData;
};

function VehicleForm({ id, vehicle }: VehicleFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [vehicleSearch, setVehicleSearch] = useState("");
    const [vehicleResults, setVehicleResults] = useState<Vehicle[]>([]);
    const [showVehicleOptions, setShowVehicleOptions] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

    const { data, setData, put, processing, errors, reset } = useForm({
        vehicle_id: vehicle.id,
    });

    const handleVehicleSearch = useCallback(async (value: string) => {
        setVehicleSearch(value);

        if (value.length >= 2) {
            const results = await searchVehicles(value);
            setVehicleResults(results?.data || []);
            setShowVehicleOptions(true);
        } else {
            setShowVehicleOptions(false);
            setVehicleResults([]);
        }
    }, []);

    const selectVehicle = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setData("vehicle_id", vehicle.id);
        setVehicleSearch(
            `${vehicle.vehicle_no} - ${vehicle.brand?.name} ${vehicle.model?.name}`
        );
        setShowVehicleOptions(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedVehicle) {
            return;
        }

        put(route("dashboard.job-card.vehicle", id), {
            onSuccess: () => {
                setIsOpen(false);
                setVehicleSearch("");
                setSelectedVehicle(null);
                setVehicleResults([]);
            },
            onError: (errors) => {
                console.error("Failed to reassign vehicle:", errors);
            },
        });
    };

    const handleCancel = () => {
        setData("vehicle_id", vehicle.id);
        setVehicleSearch("");
        setSelectedVehicle(null);
        setVehicleResults([]);
        setShowVehicleOptions(false);
        setIsOpen(false);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            setData("vehicle_id", vehicle.id);
            setVehicleSearch("");
            setSelectedVehicle(null);
            setVehicleResults([]);
            setShowVehicleOptions(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>
                <Button variant="outline">Vehicle</Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-lg">
                <form onSubmit={handleSubmit}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reassign Vehicle</AlertDialogTitle>
                        <AlertDialogDescription>
                            Search and select a different vehicle for this job card
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="py-4 space-y-4">
                        {/* Current Vehicle Display */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-blue-900 mb-2">
                                Current Vehicle:
                            </p>
                            <div className="space-y-1">
                                <p className="font-semibold text-blue-900 text-lg">
                                    {vehicle.vehicle_no}
                                </p>
                                <p className="text-sm text-blue-700">
                                    {vehicle.brand?.name} {vehicle.model?.name}
                                </p>
                                <p className="text-sm text-blue-600">
                                    Year: {vehicle.make_year}
                                </p>
                            </div>
                        </div>

                        {/* Vehicle Search */}
                        <div className="space-y-2">
                            <Label htmlFor="vehicle_search">
                                Search Vehicle by Number
                            </Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        id="vehicle_search"
                                        type="text"
                                        value={vehicleSearch}
                                        onChange={(e) =>
                                            handleVehicleSearch(
                                                e.target.value.toUpperCase()
                                            )
                                        }
                                        placeholder="Type vehicle number..."
                                        className="pl-10 uppercase"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() =>
                                        window.open("/dashboard/vehicle/create", "_blank")
                                    }
                                    title="Add New Vehicle"
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Search Results Dropdown */}
                            {showVehicleOptions && vehicleResults.length > 0 && (
                                <div className="border border-gray-200 rounded-lg mt-2 max-h-60 overflow-y-auto bg-white shadow-lg">
                                    {vehicleResults.map((veh) => (
                                        <button
                                            key={veh.id}
                                            type="button"
                                            onClick={() => selectVehicle(veh)}
                                            className={`w-full px-4 py-3 text-left hover:bg-blue-50 border-b last:border-b-0 transition-colors ${
                                                selectedVehicle?.id === veh.id
                                                    ? "bg-blue-100"
                                                    : ""
                                            }`}
                                        >
                                            <div className="font-medium text-gray-900">
                                                {veh.vehicle_no}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {veh.brand?.name} {veh.model?.name}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Year: {veh.make_year}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {showVehicleOptions && vehicleResults.length === 0 && (
                                <div className="text-sm text-gray-500 text-center py-3 border border-gray-200 rounded-lg bg-gray-50">
                                    No vehicles found. Try a different search term.
                                </div>
                            )}
                        </div>

                        {/* Selected Vehicle Preview */}
                        {selectedVehicle && selectedVehicle.id !== vehicle.id && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm font-medium text-green-900 mb-2">
                                    New Vehicle:
                                </p>
                                <div className="space-y-1">
                                    <p className="font-semibold text-green-900 text-lg">
                                        {selectedVehicle.vehicle_no}
                                    </p>
                                    <p className="text-sm text-green-700">
                                        {selectedVehicle.brand?.name}{" "}
                                        {selectedVehicle.model?.name}
                                    </p>
                                    <p className="text-sm text-green-600">
                                        Year: {selectedVehicle.make_year}
                                    </p>
                                </div>
                            </div>
                        )}

                        {errors.vehicle_id && (
                            <p className="text-sm text-red-500">{errors.vehicle_id}</p>
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
                            disabled={
                                processing ||
                                !selectedVehicle ||
                                selectedVehicle.id === vehicle.id
                            }
                        >
                            {processing ? "Updating..." : "Reassign Vehicle"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default VehicleForm;