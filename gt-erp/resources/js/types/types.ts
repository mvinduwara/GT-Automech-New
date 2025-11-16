export interface User {
    id: number;
    name: string;
    email: string;
    mobile: string | null;
    role: 'cashier' | 'admin' | 'service-manager';
    status: 'active' | 'deactive' | 'pending';
}

export interface Department {
    id: number;
    name: string;
}

export interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    mobile: string;
    hire_date: Date;
    job_title: string;
    department_id: Department;
    department?: Department;
    status: 'active' | 'deactive' | 'pending' | 'terminated';
}

export interface pettyCash {
    id: number;
    voucher_number: number;
    date: Date;
    name: string;
    requested_by_user_id: number;
    approved_by_user_id: number;
    description: string;
    requested_by?: User;
    approved_by?: User;
    total_amount: number;
    status: string;
    checked: number;
    items?: PettyCashItem[];
}

export interface PettyCashItem {
    id: number;
    petty_cash_voucher_id: number;
    item_description: string;
    quantity: number;
    unit_price: number;
    amount: number;
    checked: boolean;
}


export type Product = {
    id: number;
    name: string;
    part_number: string;
    description: string;
    category: Category;
    brand: Brand | null;
    unit_of_measure: UnitOfMeasure;
    status: 'active' | 'deactive';
    reorder_level: number;
};

export type Category = {
    id: number;
    name: string;
    description?: string;
    status: 'active' | 'deactive';
    created_at?: Date,
};

export type Brand = {
    id: number;
    name: string;
    description?: string;
    status: 'active' | 'deactive';
    created_at?: Date,
};

export type UnitOfMeasure = {
    id: number;
    name: string;
    abbreviation: string;
    status: 'active' | 'deactive';
};


export interface Stock {
    id: number;
    product_id: number;
    alternative_product_id: number | null;
    quantity: number;
    buying_price: number;
    selling_price: number;
    status: 'active' | 'deactive' | 'out of stock' | 'rejected';
    product: Product;
    alternative_product: Product | null;
}

// Add this to your existing pettyCash interface
export interface pettyCash {
    voucher_number: string;
    date: string;
    total_amount: number;
    status: string;
    requested_by?: { name: string };
    approved_by?: { name: string };
    items?: {
        id: number;
        item_description: string;
        quantity: number;
        unit_price: number;
        amount: number;
        checked: boolean;
    }[];
}

export interface Customer {
    id: number;
    title?: string;
    name: string;
    mobile: string;
    email?: string;
    address?: string;
    created_at: string;
}

export interface VehicleBrand {
    id: number;
    name: string;
};

export interface VehicleModel {
    id: number;
    name: string;
    vehicle_brand_id: number;
    brand: VehicleBrand;
};

export interface Vehicle {
    id: number;
    vehicle_no: string;
    vehicle_brand_id: number;
    vehicle_model_id: number;
    make_year: number;
    brand: VehicleBrand;
    model: VehicleModel;
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

export interface InvoiceItem {
    id: number;
    invoice_id: number;
    item_type: 'service' | 'product' | 'charge';
    description: string;
    quantity: number;
    unit_price: string; // Is a decimal, so likely a string
    line_total: string; // Is a decimal, so likely a string

    // Foreign keys
    job_card_vehicle_service_id: number | null;
    job_card_product_id: number | null;
    job_card_charge_id: number | null;
}

// Based on CustomerReview model
export interface CustomerReview {
    id: number;
    invoice_id: number;
    job_card_id: number;
    rating: number; // 1-5
    suggestions: string | null;
    created_at: string;
    updated_at: string;
}
// Main Invoice type
// Based on Invoice.php and its migrations
export interface Invoice {
    id: number;
    review_token: string | null; // For the review link
    invoice_no: string;
    job_card_id: number;
    customer_id: number;
    user_id: number;

    // Financials are strings due to 'decimal:2' cast
    services_total: string;
    products_total: string;
    charges_total: string;
    subtotal: string;
    advance_payment: string;
    total: string;

    status: 'draft' | 'unpaid' | 'partial' | 'paid' | 'cancelled';
    invoice_date: string; // Cast to date, serializes to string
    due_date: string | null; // Cast to date, serializes to string
    remarks: string | null;
    terms_conditions: string | null;
    created_at: string;
    updated_at: string;

    // Appended attributes
    remaining: number; // Accessor returns a float

    // Optional loaded relationships
    customer?: Customer;
    job_card?: JobCard;
    user?: User;
    items?: InvoiceItem[];
    review?: CustomerReview | null;
}