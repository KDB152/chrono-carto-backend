import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
export declare class EmailVerificationService implements OnModuleInit {
    private userRepository;
    private readonly logger;
    private transporter;
    private isConfigured;
    jwtService: any;
    usersService: any;
    constructor(userRepository: Repository<User>);
    onModuleInit(): Promise<void>;
    private initializeTransporter;
    private checkEmailConfiguration;
    sendVerificationCode(email: string): Promise<{
        message: string;
    }>;
    verifyCode(email: string, code: string): Promise<{
        message: string;
    }>;
    sendVerificationLink(email: string): Promise<{
        message: string;
    }>;
    verifyToken(token: string): Promise<{
        email: string;
    }>;
    sendPasswordResetCode(email: string): Promise<{
        message: string;
    }>;
    verifyPasswordResetCode(email: string, code: string): Promise<{
        message: string;
        token: string;
    }>;
    sendPasswordResetLink(email: string): Promise<{
        message: string;
    }>;
    private sendEmail;
    private getVerificationCodeEmailTemplate;
    private getVerificationLinkEmailTemplate;
    private getPasswordResetCodeEmailTemplate;
    private getPasswordResetLinkEmailTemplate;
    getEmailConfiguration(): Promise<{
        isConfigured: boolean;
        emailUser: string;
        frontendUrl: string;
        hasPassword: boolean;
    }>;
    testEmailConnection(): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
    }>;
}
