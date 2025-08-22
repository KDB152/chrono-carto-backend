import { UserRole } from '../../users/entities/user.entity';
export declare class RegisterDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    userType: UserRole | 'student' | 'parent';
    studentBirthDate?: string;
    studentClass?: string;
    childFirstName?: string;
    childLastName?: string;
    childBirthDate?: string;
    childClass?: string;
    parentFirstName?: string;
    parentLastName?: string;
    parentEmail?: string;
    parentPhone?: string;
}
