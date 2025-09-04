import { Response } from 'express';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { EmailVerificationService } from './email-verification.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SendVerificationCodeDto, VerifyCodeDto, VerifyTokenDto, SendPasswordResetDto, VerifyPasswordResetCodeDto, ResetPasswordDto } from './dto/verify-email.dto';
import { User } from '../users/entities/user.entity';
export declare class AuthController {
    private authService;
    private emailVerificationService;
    private userRepository;
    private readonly logger;
    constructor(authService: AuthService, emailVerificationService: EmailVerificationService, userRepository: Repository<User>);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        userId: number;
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: number;
            email: string;
            role: import("../users/entities/user.entity").UserRole;
            firstName: string;
            lastName: string;
        };
    }>;
    resendVerification(body: {
        email: string;
    }): Promise<{
        message: string;
    }>;
    checkVerification(body: {
        email: string;
    }): Promise<{
        verified: boolean;
        approved: boolean;
        message: string;
    }>;
    forgotPassword(dto: SendPasswordResetDto): Promise<{
        success: boolean;
        message: string;
    }>;
    sendVerificationCode(dto: SendVerificationCodeDto): Promise<{
        message: string;
    }>;
    verifyCode(dto: VerifyCodeDto): Promise<{
        message: string;
        email: string;
    }>;
    sendVerificationLink(dto: SendVerificationCodeDto): Promise<{
        message: string;
    }>;
    verifyToken(dto: VerifyTokenDto): Promise<{
        message: string;
        email: string;
    }>;
    sendPasswordResetCode(dto: SendPasswordResetDto): Promise<{
        message: string;
    }>;
    verifyPasswordResetCode(dto: VerifyPasswordResetCodeDto): Promise<{
        message: string;
        resetToken: string;
    }>;
    sendPasswordResetLink(dto: SendPasswordResetDto): Promise<{
        success: boolean;
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    changePassword(req: any, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    testEmailConfig(): Promise<{
        success: boolean;
        message: string;
        config: {
            user: string;
            frontendUrl: string;
            hasPassword?: undefined;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        config: {
            user: string;
            frontendUrl: string;
            hasPassword: boolean;
        };
        message?: undefined;
    }>;
    sendTestEmail(dto: {
        email: string;
    }): Promise<{
        success: boolean;
        message: string;
        details: {
            to: string;
            from: string;
            timestamp: string;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
        details?: undefined;
    }>;
    verifyTokenGet(token: string, res: Response): Promise<void>;
    checkEnvironment(): Promise<{
        EMAIL_USER: boolean;
        EMAIL_PASSWORD: boolean;
        FRONTEND_URL: boolean;
        DB_HOST: boolean;
        values: {
            EMAIL_USER: string;
            FRONTEND_URL: string;
            NODE_ENV: string;
        };
    }>;
}
