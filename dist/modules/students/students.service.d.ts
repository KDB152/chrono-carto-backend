import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
export declare class StudentsService {
    private studentsRepository;
    findByUserId(userId: number): Promise<Student | null>;
    constructor(studentsRepository: Repository<Student>);
    createStudent(userId: number, phone?: string): Promise<Student>;
    findAll({ page, limit }: {
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
    findOne(id: number): Promise<Student>;
    create(dto: CreateStudentDto): Promise<Student>;
    update(id: number, dto: UpdateStudentDto): Promise<Student>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
