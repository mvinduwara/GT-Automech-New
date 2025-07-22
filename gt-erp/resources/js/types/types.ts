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
    status: 'active' | 'deactive' | 'pending' | 'terminated';
}


export type Product = {
    id: number;
    name: string;
    part_number: string;
    description: string;
    category: Category;
    brand: Brand;
    unit_of_measure: { name: string };
    status: 'active'|'deactive';
};

export type Category = {
    id: number;
    name: string;
    description?: string;
    status: 'active'|'deactive';
};

export type Brand = {
    id: number;
    name: string;
    description?: string;
    status: 'active'|'deactive';
};

export type UnitOfMeasure = {
    id: number;
    name: string;
    abbreviation: string;
     status: 'active'|'deactive';
};
