import { UsersService } from '../users/users.service';
import { StudentsService } from '../students/students.service';
import { ParentsService } from '../parents/parents.service';
export declare class AdminService {
    private readonly usersService;
    private readonly studentsService;
    private readonly parentsService;
    constructor(usersService: UsersService, studentsService: StudentsService, parentsService: ParentsService);
    listStudents({ page, limit }: {
        page?: number;
        limit?: number;
    }): Promise<{
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
    listParents({ page, limit }: {
        page?: number;
        limit?: number;
    }): Promise<{
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
    createMissingProfiles(): Promise<void>;
    createStudentWithUser(payload: any): Promise<{
        user: import("../users/entities/user.entity").User;
        student: import("../students/entities/student.entity").Student;
    }>;
    updateStudentWithUser(studentId: number, payload: any): Promise<import("../students/entities/student.entity").Student>;
    deleteStudent(studentId: number): Promise<{
        success: boolean;
    }>;
    createParentWithUser(payload: any): Promise<{
        user: import("../users/entities/user.entity").User;
        parent: import("../parents/entities/parent.entity").Parent;
    }>;
    updateParentWithUser(parentId: number, payload: any): Promise<import("../parents/entities/parent.entity").Parent>;
    deleteParent(parentId: number): Promise<{
        success: boolean;
    }>;
    setUserApproval(studentOrParentId: number, approve: boolean): Promise<import("../users/entities/user.entity").User>;
    cleanTestUsers(): Promise<{
        deletedCount: number;
    }>;
}
