import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { StudentsService } from '../students/students.service';
import { ParentsService } from '../parents/parents.service';
import { User, UserRole } from '../users/entities/user.entity';
import { EmailVerificationService } from './email-verification.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private usersService;
    private studentsService;
    private parentsService;
    private emailVerificationService;
    private userRepository;
    private jwtService;
    constructor(usersService: UsersService, studentsService: StudentsService, parentsService: ParentsService, emailVerificationService: EmailVerificationService, userRepository: Repository<User>, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        userId: number;
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: number;
            email: string;
            role: UserRole;
            firstName: string;
            lastName: string;
            profileData?: any;
        };
    }>;
    private getStudentCourses;
    private getStudentGrades;
    private getStudentAttendance;
    private getParentChildren;
    private getParentNotifications;
    private getAdminStats;
    private getTeacherSubjects;
    private getTeacherClasses;
    private getNewUsersThisWeek;
    private getActiveUsersCount;
    findUserByEmail(email: string): Promise<User | null>;
    sendResetPasswordEmail(email: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    verifyEmailToken(token: string): Promise<boolean>;
}
