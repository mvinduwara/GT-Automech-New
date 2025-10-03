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
import { useForm } from "@inertiajs/react";
import { Search } from "lucide-react";

type Employee = {
    id: number;
    first_name: string;
    last_name: string;
    mobile: string;
    job_title: string;
    department?: {
        name: string;
    };
};

type ServiceJobCard = {
    id: number;
    job_card_id: number;
    ac?: number;
    electronic?: number;
    mechanical?: number;
    ac_technician?: Employee;
    electronic_technician?: Employee;
    mechanical_technician?: Employee;
};

type EmployeeAssignmentFormProps = {
    serviceJobCard: ServiceJobCard;
};

function EmployeeAssignmentForm({ serviceJobCard }: EmployeeAssignmentFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    
    // Separate search states for each technician type
    const [acSearchMobile, setAcSearchMobile] = useState("");
    const [electronicSearchMobile, setElectronicSearchMobile] = useState("");
    const [mechanicalSearchMobile, setMechanicalSearchMobile] = useState("");
    
    // Separate search results for each technician type
    const [acSearchResults, setAcSearchResults] = useState<Employee[]>([]);
    const [electronicSearchResults, setElectronicSearchResults] = useState<Employee[]>([]);
    const [mechanicalSearchResults, setMechanicalSearchResults] = useState<Employee[]>([]);
    
    // Separate loading states for each search
    const [acSearching, setAcSearching] = useState(false);
    const [electronicSearching, setElectronicSearching] = useState(false);
    const [mechanicalSearching, setMechanicalSearching] = useState(false);

    const { data, setData, put, processing, errors, reset } = useForm({
        ac: serviceJobCard.ac || '',
        electronic: serviceJobCard.electronic || '',
        mechanical: serviceJobCard.mechanical || '',
    });

    // Generic search function
    const searchEmployees = async (mobile: string, setResults: (results: Employee[]) => void, setLoading: (loading: boolean) => void) => {
        if (!mobile.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/employees/search?mobile=${encodeURIComponent(mobile)}`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const employees = await response.json();
            setResults(employees);
        } catch (error) {
            console.error('Failed to search employees:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    // Search effects for each technician type
    useEffect(() => {
        const timer = setTimeout(() => {
            searchEmployees(acSearchMobile, setAcSearchResults, setAcSearching);
        }, 300);
        return () => clearTimeout(timer);
    }, [acSearchMobile]);

    useEffect(() => {
        const timer = setTimeout(() => {
            searchEmployees(electronicSearchMobile, setElectronicSearchResults, setElectronicSearching);
        }, 300);
        return () => clearTimeout(timer);
    }, [electronicSearchMobile]);

    useEffect(() => {
        const timer = setTimeout(() => {
            searchEmployees(mechanicalSearchMobile, setMechanicalSearchResults, setMechanicalSearching);
        }, 300);
        return () => clearTimeout(timer);
    }, [mechanicalSearchMobile]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(route('dashboard.service-job-card.assign-employees', serviceJobCard.id), {
            onSuccess: () => {
                setIsOpen(false);
                clearAllSearches();
            },
            onError: (errors) => {
                console.error('Failed to assign employees:', errors);
            }
        });
    };

    const clearAllSearches = () => {
        setAcSearchMobile("");
        setElectronicSearchMobile("");
        setMechanicalSearchMobile("");
        setAcSearchResults([]);
        setElectronicSearchResults([]);
        setMechanicalSearchResults([]);
    };

    const handleCancel = () => {
        // Reset form data to original values
        setData({
            ac: serviceJobCard.ac || '',
            electronic: serviceJobCard.electronic || '',
            mechanical: serviceJobCard.mechanical || '',
        });
        clearAllSearches();
        setIsOpen(false);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            // Reset form data when opening dialog
            setData({
                ac: serviceJobCard.ac || '',
                electronic: serviceJobCard.electronic || '',
                mechanical: serviceJobCard.mechanical || '',
            });
        } else {
            clearAllSearches();
        }
    };

    const getEmployeeDisplayName = (employee: Employee) => {
        return `${employee.first_name} ${employee.last_name} (${employee.mobile})`;
    };

    const getCurrentAssignedEmployee = (type: 'ac' | 'electronic' | 'mechanical') => {
        const technicianKey = `${type}_technician` as keyof ServiceJobCard;
        const technician = serviceJobCard[technicianKey] as Employee | undefined;
        return technician ? getEmployeeDisplayName(technician) : "Not assigned";
    };

    const renderTechnicianSection = (
        type: 'ac' | 'electronic' | 'mechanical',
        displayName: string,
        searchMobile: string,
        setSearchMobile: (value: string) => void,
        searchResults: Employee[],
        isSearching: boolean
    ) => (
        <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-medium text-lg">{displayName}</h3>
            
            {/* Current Assignment */}
            <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">Current: {getCurrentAssignedEmployee(type)}</p>
            </div>

            {/* Search Field */}
            <div className="space-y-2">
                <Label htmlFor={`search-${type}`}>Search by Mobile</Label>
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        id={`search-${type}`}
                        type="text"
                        value={searchMobile}
                        onChange={(e) => setSearchMobile(e.target.value)}
                        placeholder="Enter mobile number..."
                        className="pl-10"
                    />
                </div>
                {isSearching && (
                    <p className="text-sm text-gray-500">Searching...</p>
                )}
            </div>

            {/* Select Dropdown */}
            <div className="space-y-2">
                <Label htmlFor={type}>Select {displayName}</Label>
                <Select
                    value={data[type].toString()}
                    onValueChange={(value) => setData(type, value === '' ? '' : parseInt(value))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={`Select ${displayName.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1">No assignment</SelectItem>
                        {searchResults.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id.toString()}>
                                {getEmployeeDisplayName(employee)}
                                <span className="text-gray-500 ml-2">
                                    - {employee.job_title}
                                    {employee.department && ` (${employee.department.name})`}
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors[type] && (
                    <p className="text-sm text-red-500">{errors[type]}</p>
                )}
            </div>

            {searchResults.length === 0 && searchMobile && !isSearching && (
                <p className="text-sm text-gray-500 text-center py-2">
                    No employees found with mobile "{searchMobile}"
                </p>
            )}
        </div>
    );

    return (
        <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>
                <Button variant="outline">
                    Assign Technicians
                    {(serviceJobCard.ac || serviceJobCard.electronic || serviceJobCard.mechanical) && (
                        <span className="ml-1 h-2 w-2 bg-green-500 rounded-full"></span>
                    )}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Assign Technicians</AlertDialogTitle>
                        <AlertDialogDescription>
                            Job Card No. {serviceJobCard.job_card_id}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="py-4 space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            {/* AC Technician */}
                            {renderTechnicianSection(
                                'ac',
                                'AC Technician',
                                acSearchMobile,
                                setAcSearchMobile,
                                acSearchResults,
                                acSearching
                            )}

                            {/* Electronic Technician */}
                            {renderTechnicianSection(
                                'electronic',
                                'Electronic Technician',
                                electronicSearchMobile,
                                setElectronicSearchMobile,
                                electronicSearchResults,
                                electronicSearching
                            )}

                            {/* Mechanical Technician */}
                            {renderTechnicianSection(
                                'mechanical',
                                'Mechanical Technician',
                                mechanicalSearchMobile,
                                setMechanicalSearchMobile,
                                mechanicalSearchResults,
                                mechanicalSearching
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
                            {processing ? 'Updating...' : 'Assign Technicians'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default EmployeeAssignmentForm;