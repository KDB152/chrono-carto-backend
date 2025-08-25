import { Parent } from '../../parents/entities/parent.entity';
import { Student } from '../../students/entities/student.entity';
export declare class ParentStudent {
    id: number;
    parent_id: number;
    student_id: number;
    parent: Parent;
    student: Student;
    created_at: Date;
}
