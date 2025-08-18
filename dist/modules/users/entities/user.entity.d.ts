export declare enum UserRole {
    STUDENT = "student",
    PARENT = "parent",
    TEACHER = "teacher",
    ADMIN = "admin"
}
export declare class User {
    id: number;
    email: string;
    password_hash: string;
    first_name?: string;
    last_name?: string;
    role: UserRole;
    is_active: boolean;
    email_verified: boolean;
    verification_token?: string;
    verification_token_expiry?: Date;
    verification_code?: string;
    verification_code_expiry?: Date;
    email_verified_at?: Date;
    password_reset_token?: string;
    password_reset_token_expiry?: Date;
    password_reset_code?: string;
    password_reset_code_expiry?: Date;
    reset_token?: string;
    reset_token_expires?: Date;
    last_login?: Date;
    created_at: Date;
    updated_at: Date;
    student: any;
}
