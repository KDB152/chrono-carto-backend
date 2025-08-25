import { Repository } from 'typeorm';
import { ParentStudent } from './entities/parent-student.entity';
export declare class RelationsService {
    private parentStudentRepository;
    constructor(parentStudentRepository: Repository<ParentStudent>);
    createParentStudentRelation(parentId: number, studentId: number): Promise<ParentStudent>;
    getStudentsByParentId(parentId: number): Promise<ParentStudent[]>;
    getParentsByStudentId(studentId: number): Promise<ParentStudent[]>;
    deleteParentStudentRelation(parentId: number, studentId: number): Promise<void>;
}
