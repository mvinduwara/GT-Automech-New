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
    brand: Brand;
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