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
import { Customer } from "@/types/types";
import { useForm } from "@inertiajs/react";
import { Search } from "lucide-react";
import { useCallback, useState } from "react";
import { searchCustomers } from "./actions";

interface CustomerFormProps {
    id: number;
    customer: Customer;
}

function CustomerForm({ id, customer }: CustomerFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [customerResults, setCustomerResults] = useState<Customer[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const { data, setData, put, processing } = useForm({
        customer_id: customer.id,
    });

    const handleSearch = useCallback(async (value: string) => {
        setSearchQuery(value);

        if (value.length >= 3) {
            const results = await searchCustomers(value);
            setCustomerResults(results?.data || []);
            setShowResults(true);
        } else {
            setShowResults(false);
            setCustomerResults([]);
        }
    }, []);

    const handleSelectCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setData("customer_id", customer.id);
        setSearchQuery(`${customer.name} - ${customer.mobile}`);
        setShowResults(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedCustomer) {
            return;
        }

        put(route("dashboard.job-card.customer", id), {
            onSuccess: () => {
                setIsOpen(false);
                setSearchQuery("");
                setSelectedCustomer(null);
                setCustomerResults([]);
            },
            onError: (errors) => {
                console.error("Failed to update customer:", errors);
            },
        });
    };

    const handleCancel = () => {
        setData("customer_id", customer.id);
        setSearchQuery("");
        setSelectedCustomer(null);
        setCustomerResults([]);
        setShowResults(false);
        setIsOpen(false);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            handleCancel();
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>
                <Button variant="outline">Customer</Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-2xl">
                <form onSubmit={handleSubmit}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Change Customer</AlertDialogTitle>
                        <AlertDialogDescription>
                            Search and select a different customer for this job card
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="py-4 space-y-4">
                        {/* Current Customer Info */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm font-semibold text-blue-900 mb-2">
                                Current Customer:
                            </p>
                            <div className="space-y-1">
                                <p className="text-lg font-semibold text-blue-900">
                                    {customer.title} {customer.name}
                                </p>
                                <p className="text-sm text-blue-700">{customer.mobile}</p>
                                <p className="text-sm text-blue-700">{customer.address}</p>
                            </div>
                        </div>

                        {/* Search Input */}
                        <div className="space-y-2">
                            <Label htmlFor="search">
                                Search Customer (by mobile or name)
                            </Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    id="search"
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Enter mobile number or name..."
                                    className="pl-10"
                                />
                            </div>
                            <p className="text-xs text-gray-500">
                                Type at least 3 characters to search
                            </p>
                        </div>

                        {/* Search Results */}
                        {showResults && customerResults.length > 0 && (
                            <div className="flex flex-col gap-2 border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                                {customerResults.map((cust) => (
                                    <button
                                        key={cust.id}
                                        type="button"
                                        onClick={() => handleSelectCustomer(cust)}
                                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0 transition-colors ${
                                            selectedCustomer?.id === cust.id
                                                ? "bg-blue-50 border-l-4 border-l-blue-500"
                                                : ""
                                        }`}
                                    >
                                        <div className="font-semibold text-gray-900">
                                            {cust.title} {cust.name}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {cust.mobile}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {cust.address}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {showResults && customerResults.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <p>No customers found</p>
                                <p className="text-sm mt-1">
                                    Try a different search term
                                </p>
                            </div>
                        )}

                        {/* Selected Customer Preview */}
                        {selectedCustomer && selectedCustomer.id !== customer.id && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm font-semibold text-green-900 mb-2">
                                    New Customer Selected:
                                </p>
                                <div className="space-y-1">
                                    <p className="text-lg font-semibold text-green-900">
                                        {selectedCustomer.title} {selectedCustomer.name}
                                    </p>
                                    <p className="text-sm text-green-700">
                                        {selectedCustomer.mobile}
                                    </p>
                                    <p className="text-sm text-green-700">
                                        {selectedCustomer.address}
                                    </p>
                                </div>
                            </div>
                        )}

                        {selectedCustomer?.id === customer.id && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <p className="text-sm text-yellow-800">
                                    ⚠️ This is the same customer. Please select a
                                    different customer to change.
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
                        <Button
                            type="submit"
                            disabled={
                                processing ||
                                !selectedCustomer ||
                                selectedCustomer?.id === customer.id
                            }
                        >
                            {processing ? "Updating..." : "Change Customer"}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default CustomerForm;