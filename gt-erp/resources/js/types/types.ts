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