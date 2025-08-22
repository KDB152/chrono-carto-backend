import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    listStudents(page?: string, limit?: string): Promise<{
        items: {
            id: number;
            firstName: string;
            lastName: string;
            email: string;
            phoneNumber: string;
            classLevel: string;
            birthDate: string;
            progressPercentage: number;
            averageScore: number;
            role: string;
            isActive: boolean;
            isApproved: boolean;
            createdAt: string;
            notes: string;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    createStudent(body: any): Promise<{
        user: import("../users/users.module").User;
        student: import("../students/entities/student.entity").Student;
    }>;
    updateStudent(id: string, body: any): Promise<import("../students/entities/student.entity").Student>;
    deleteStudent(id: string): Promise<{
        success: boolean;
    }>;
    listParents(page?: string, limit?: string): Promise<{
        items: {
            id: number;
            firstName: string;
            lastName: string;
            email: string;
            phoneNumber: string;
            address: string;
            occupation: string;
            role: string;
            isActive: boolean;
            isApproved: boolean;
            createdAt: string;
            notes: string;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    createParent(body: any): Promise<{
        user: import("../users/users.module").User;
        parent: import("../parents/entities/parent.entity").Parent;
    }>;
    updateParent(id: string, body: any): Promise<import("../parents/entities/parent.entity").Parent>;
    deleteParent(id: string): Promise<{
        success: boolean;
    }>;
    approveUser(id: string, body: {
        approve: boolean;
    }): Promise<import("../users/users.module").User>;
    cleanTestUsers(): Promise<{
        deletedCount: number;
    }>;
}
