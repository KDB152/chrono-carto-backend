import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
export declare class StudentsService {
    private studentsRepository;
    findByUserId(userId: number): Promise<Student | null>;
    constructor(studentsRepository: Repository<Student>);
    createStudent(userId: number, phone?: string): Promise<Student>;
}
