import { Customer, Vehicle } from "@/types/types";
import axios from "axios";

export const searchCustomers = async (mobile: string): Promise<Customer[]> => {
    if (!mobile.trim()) {
        return [];
    }

    try {
        const response = await axios.get("/api/customers/search", {
            params: { mobile },
        });
        console.log("response data searching customers:", response.data);

        return response.data || [];
    } catch (error) {
        console.error("Error searching customers:", error);
        return [];
    }
};

export const searchVehicles = async (vehicleNumber: string): Promise<Vehicle[]> => {
    if (!vehicleNumber.trim()) {
        return [];
    }

    try {
        const response = await axios.get("/api/vehicles/search", {
            params: { vehicleNumber },
        });
        console.log("response data searching vehicles:", response.data);

        return response.data || [];
    } catch (error) {
        console.error("Error searching vehicles:", error);
        return [];
    }
};
