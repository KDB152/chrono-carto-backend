import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
export declare class StudentsController {
    private readonly studentsService;
    constructor(studentsService: StudentsService);
    findAll(page?: string, limit?: string): Promise<{
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
    findOne(id: string): Promise<import("./entities/student.entity").Student>;
    findByUser(userId: string): Promise<import("./entities/student.entity").Student>;
    create(dto: CreateStudentDto): Promise<import("./entities/student.entity").Student>;
    update(id: string, dto: UpdateStudentDto): Promise<import("./entities/student.entity").Student>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
