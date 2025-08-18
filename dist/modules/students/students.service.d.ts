import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
export declare class StudentsService {
    private studentsRepository;
    constructor(studentsRepository: Repository<Student>);
    createStudent(userId: number, phone?: string): Promise<Student>;
}
