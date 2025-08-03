export interface Customer {
    id: number;
    name: string;
    mobile: string;
    email?: string;
    address?: string;
    created_at: string;
}

export interface Vehicle {
    id: number;
    customer_id: number;
    vehicle_number: string;
    make: string;
    model: string;
    year: number;
    engine_capacity?: string;
    created_at: string;
}

export interface OilBrand {
    id: number;
    name: string;
    logo?: string;
    created_at: string;
}

export interface Oil {
    id: number;
    brand_id: number;
    name: string;
    type: string; // e.g., "0w20 4L", "5w30 4L"
    price: number;
    created_at: string;
}

export interface OilFilter {
    id: number;
    name: string;
    price: number;
    vehicle_compatibility?: string;
    created_at: string;
}

export interface DrainPlugSeal {
    id: number;
    name: string;
    price: number;
    vehicle_compatibility?: string;
    created_at: string;
}

export interface Service {
    id: number;
    name: string;
    base_price: number;
    options: ServiceOption[];
}

export interface ServiceOption {
    id: number;
    service_id: number;
    name: string;
    price: number;
}

export interface JobCard {
    id: number;
    customer_id: number;
    vehicle_id: number;
    oil_id: number;
    oil_filter_id: number;
    drain_plug_seal_id: number;
    services: JobCardService[];
    total_amount: number;
    status: 'open' | 'in_progress' | 'completed';
    created_at: string;
}

export interface JobCardService {
    id: number;
    job_card_id: number;
    service_id: number;
    option_id?: number;
    price: number;
    ignored: boolean;
}

// Sample Data
export const customers: Customer[] = [
    {
        id: 1,
        name: "Kasun Perera",
        mobile: "0771234567",
        email: "kasun@email.com",
        address: "No. 123, Galle Road, Colombo 03",
        created_at: "2024-01-15"
    },
    {
        id: 2,
        name: "Nimal Silva",
        mobile: "0712345678",
        email: "nimal@email.com",
        address: "No. 456, Kandy Road, Malabe",
        created_at: "2024-02-10"
    },
    {
        id: 3,
        name: "Chamara Fernando",
        mobile: "0723456789",
        email: "chamara@email.com",
        address: "No. 789, High Level Road, Nugegoda",
        created_at: "2024-02-20"
    },
    {
        id: 4,
        name: "Ruwan Jayasinghe",
        mobile: "0734567890",
        email: "ruwan@email.com",
        address: "No. 321, Baseline Road, Colombo 09",
        created_at: "2024-03-05"
    }
];

export const vehicles: Vehicle[] = [
    {
        id: 1,
        customer_id: 1,
        vehicle_number: "CAB-1234",
        make: "Toyota",
        model: "Axio",
        year: 2018,
        engine_capacity: "1.5L",
        created_at: "2024-01-15"
    },
    {
        id: 2,
        customer_id: 2,
        vehicle_number: "CAA-9876",
        make: "Honda",
        model: "Vezel",
        year: 2020,
        engine_capacity: "1.5L Hybrid",
        created_at: "2024-02-10"
    },
    {
        id: 3,
        customer_id: 3,
        vehicle_number: "CBB-5555",
        make: "Nissan",
        model: "March",
        year: 2019,
        engine_capacity: "1.2L",
        created_at: "2024-02-20"
    },
    {
        id: 4,
        customer_id: 1,
        vehicle_number: "CAC-7777",
        make: "Toyota",
        model: "Prius",
        year: 2021,
        engine_capacity: "1.8L Hybrid",
        created_at: "2024-03-01"
    }
];

export const oilBrands: OilBrand[] = [
    {
        id: 1,
        name: "Toyota Genuine Oil",
        created_at: "2024-01-01"
    },
    {
        id: 2,
        name: "Mobil Genuine Oil",
        created_at: "2024-01-01"
    },
    {
        id: 3,
        name: "Castrol Genuine Oil",
        created_at: "2024-01-01"
    },
    {
        id: 4,
        name: "Pertamina Genuine Oil",
        created_at: "2024-01-01"
    },
    {
        id: 5,
        name: "ENI Genuine Oil",
        created_at: "2024-01-01"
    },
    {
        id: 6,
        name: "Valvoline Genuine Oil",
        created_at: "2024-01-01"
    }
];

export const oils: Oil[] = [
    // Toyota Genuine Oil
    {
        id: 1,
        brand_id: 1,
        name: "0w20 4L",
        type: "0w20 4L",
        price: 15300,
        created_at: "2024-01-01"
    },
    {
        id: 2,
        brand_id: 1,
        name: "5w30 4L",
        type: "5w30 4L",
        price: 14560,
        created_at: "2024-01-01"
    },
    {
        id: 3,
        brand_id: 1,
        name: "10w30 / 15w40 4L",
        type: "10w30 / 15w40 4L",
        price: 12750,
        created_at: "2024-01-01"
    },
    // Mobil Genuine Oil
    {
        id: 4,
        brand_id: 2,
        name: "5w30 4L",
        type: "5w30 4L",
        price: 13400,
        created_at: "2024-01-01"
    },
    {
        id: 5,
        brand_id: 2,
        name: "10w30 4L",
        type: "10w30 4L",
        price: 13300,
        created_at: "2024-01-01"
    },
    {
        id: 6,
        brand_id: 2,
        name: "15w40 4L",
        type: "15w40 4L",
        price: 13050,
        created_at: "2024-01-01"
    },
    // Castrol Genuine Oil
    {
        id: 7,
        brand_id: 3,
        name: "0w20 3L",
        type: "0w20 3L",
        price: 12150,
        created_at: "2024-01-01"
    },
    {
        id: 8,
        brand_id: 3,
        name: "10w30 3L",
        type: "10w30 3L",
        price: 9850,
        created_at: "2024-01-01"
    },
    // Pertamina Genuine Oil
    {
        id: 9,
        brand_id: 4,
        name: "10w30 3L",
        type: "10w30 3L",
        price: 10000,
        created_at: "2024-01-01"
    },
    // ENI Genuine Oil
    {
        id: 10,
        brand_id: 5,
        name: "15w40 4L",
        type: "15w40 4L",
        price: 11700,
        created_at: "2024-01-01"
    },
    // Valvoline Genuine Oil
    {
        id: 11,
        brand_id: 6,
        name: "15w40 6L",
        type: "15w40 6L",
        price: 12150,
        created_at: "2024-01-01"
    }
];

export const oilFilters: OilFilter[] = [
    {
        id: 1,
        name: "Toyota Oil Filter - Standard",
        price: 1200,
        vehicle_compatibility: "Toyota vehicles",
        created_at: "2024-01-01"
    },
    {
        id: 2,
        name: "Honda Oil Filter - Standard",
        price: 1100,
        vehicle_compatibility: "Honda vehicles",
        created_at: "2024-01-01"
    },
    {
        id: 3,
        name: "Nissan Oil Filter - Standard",
        price: 1050,
        vehicle_compatibility: "Nissan vehicles",
        created_at: "2024-01-01"
    },
    {
        id: 4,
        name: "Universal Oil Filter - Premium",
        price: 1500,
        vehicle_compatibility: "Most vehicles",
        created_at: "2024-01-01"
    },
    {
        id: 5,
        name: "Universal Oil Filter - Economy",
        price: 800,
        vehicle_compatibility: "Most vehicles",
        created_at: "2024-01-01"
    }
];

export const drainPlugSeals: DrainPlugSeal[] = [
    {
        id: 1,
        name: "Standard Drain Plug Seal",
        price: 150,
        vehicle_compatibility: "Most vehicles",
        created_at: "2024-01-01"
    },
    {
        id: 2,
        name: "Premium Copper Seal",
        price: 250,
        vehicle_compatibility: "Premium vehicles",
        created_at: "2024-01-01"
    },
    {
        id: 3,
        name: "Aluminum Seal",
        price: 200,
        vehicle_compatibility: "Most vehicles",
        created_at: "2024-01-01"
    }
];

export const services: Service[] = [
    {
        id: 1,
        name: "Body Wash",
        base_price: 500,
        options: [
            { id: 1, service_id: 1, name: "Basic Wash", price: 500 },
            { id: 2, service_id: 1, name: "Premium Wash", price: 800 },
            { id: 3, service_id: 1, name: "Deluxe Wash", price: 1200 }
        ]
    },
    {
        id: 2,
        name: "Under Wash",
        base_price: 300,
        options: [
            { id: 4, service_id: 2, name: "Standard Under Wash", price: 300 },
            { id: 5, service_id: 2, name: "High Pressure Under Wash", price: 500 }
        ]
    },
    {
        id: 3,
        name: "QD (Quick Detailing)",
        base_price: 1000,
        options: [
            { id: 6, service_id: 3, name: "Interior QD", price: 1000 },
            { id: 7, service_id: 3, name: "Exterior QD", price: 1200 },
            { id: 8, service_id: 3, name: "Full QD", price: 2000 }
        ]
    },
    {
        id: 4,
        name: "Change Oil and Filter",
        base_price: 2000,
        options: [
            { id: 9, service_id: 4, name: "Standard Service", price: 2000 },
            { id: 10, service_id: 4, name: "Premium Service", price: 2500 }
        ]
    },
    {
        id: 5,
        name: "Under Wax",
        base_price: 1500,
        options: [
            { id: 11, service_id: 5, name: "Standard Under Wax", price: 1500 },
            { id: 12, service_id: 5, name: "Premium Under Wax", price: 2200 }
        ]
    },
    {
        id: 6,
        name: "Body Gas",
        base_price: 800,
        options: [
            { id: 13, service_id: 6, name: "Standard Body Gas", price: 800 },
            { id: 14, service_id: 6, name: "Premium Body Gas", price: 1200 }
        ]
    },
    {
        id: 7,
        name: "Cleaning Engine",
        base_price: 2500,
        options: [
            { id: 15, service_id: 7, name: "Basic Engine Clean", price: 2500 },
            { id: 16, service_id: 7, name: "Deep Engine Clean", price: 4000 }
        ]
    },
    {
        id: 8,
        name: "Cleaning Brake",
        base_price: 1800,
        options: [
            { id: 17, service_id: 8, name: "Brake System Clean", price: 1800 },
            { id: 18, service_id: 8, name: "Complete Brake Service", price: 3500 }
        ]
    },
    {
        id: 9,
        name: "Mechanic Inspection",
        base_price: 1000,
        options: [
            { id: 19, service_id: 9, name: "Basic Inspection", price: 1000 },
            { id: 20, service_id: 9, name: "Comprehensive Inspection", price: 2000 },
            { id: 21, service_id: 9, name: "Pre-purchase Inspection", price: 3000 }
        ]
    },
    {
        id: 10,
        name: "Scanning",
        base_price: 1500,
        options: [
            { id: 22, service_id: 10, name: "Basic OBD Scan", price: 1500 },
            { id: 23, service_id: 10, name: "Advanced Diagnostic", price: 3000 },
            { id: 24, service_id: 10, name: "Complete System Scan", price: 4500 }
        ]
    }
];

// Helper functions
export const searchCustomers = (mobile: string): Customer[] => {
    return customers.filter(customer =>
        customer.mobile.includes(mobile) || customer.name.toLowerCase().includes(mobile.toLowerCase())
    );
};

export const searchVehicles = (vehicleNumber: string): Vehicle[] => {
    return vehicles.filter(vehicle =>
        vehicle.vehicle_number.toLowerCase().includes(vehicleNumber.toLowerCase())
    );
};

export const getOilsByBrand = (brandId: number): Oil[] => {
    return oils.filter(oil => oil.brand_id === brandId);
};

export const getCustomerById = (id: number): Customer | undefined => {
    return customers.find(customer => customer.id === id);
};

export const getVehicleById = (id: number): Vehicle | undefined => {
    return vehicles.find(vehicle => vehicle.id === id);
};

export const getOilBrandById = (id: number): OilBrand | undefined => {
    return oilBrands.find(brand => brand.id === id);
};

export const getOilById = (id: number): Oil | undefined => {
    return oils.find(oil => oil.id === id);
};

export const getOilFilterById = (id: number): OilFilter | undefined => {
    return oilFilters.find(filter => filter.id === id);
};

export const getDrainPlugSealById = (id: number): DrainPlugSeal | undefined => {
    return drainPlugSeals.find(seal => seal.id === id);
};

export const getServiceById = (id: number): Service | undefined => {
    return services.find(service => service.id === id);
};

export const formatCurrency = (amount: number): string => {
    return `Rs.${amount.toLocaleString()}/=`;
};