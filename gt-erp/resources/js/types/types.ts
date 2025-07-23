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
    status: 'active'|'deactive'|'out of stock'|'rejected';
    product: Product;
    alternative_product: Product | null;
}