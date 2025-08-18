import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
export declare class EmailVerificationService {
    private userRepository;
    private readonly logger;
    private transporter;
    constructor(userRepository: Repository<User>);
    private verifyEmailConfig;
    sendVerificationCode(email: string): Promise<{
        message: string;
    }>;
    verifyCode(email: string, code: string): Promise<{
        message: string;
        email: string;
    }>;
    sendVerificationLink(email: string): Promise<{
        message: string;
    }>;
    verifyToken(token: string): Promise<{
        message: string;
        email: string;
    }>;
    sendPasswordResetCode(email: string): Promise<{
        message: string;
    }>;
    verifyPasswordResetCode(email: string, code: string): Promise<{
        message: string;
        resetToken: string;
    }>;
    sendPasswordResetLink(email: string): Promise<{
        message: string;
    }>;
    private sendVerificationCodeEmail;
    private sendPasswordResetCodeEmail;
}
