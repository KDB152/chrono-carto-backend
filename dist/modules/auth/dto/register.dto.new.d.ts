import { UserRole } from '../../users/entities/user.entity';
import { ClassLevel } from '../../students/entities/student.entity';
export declare class RegisterDto {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    phone?: string;
    userType: UserRole | 'student' | 'parent';
    studentBirthDate?: string;
    studentClass?: ClassLevel;
    childFirstName?: string;
    childLastName?: string;
    childBirthDate?: string;
    childClass?: ClassLevel;
    parentFirstName?: string;
    parentLastName?: string;
    parentEmail?: string;
    parentPhone?: string;
    parentPassword?: string;
    childPassword?: string;
    childEmail?: string;
    childPhone?: string;
}
