import { UserRole } from '../../users/entities/user.entity';
export declare class RegisterDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    userType: UserRole;
}
