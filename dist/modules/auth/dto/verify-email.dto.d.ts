export declare class SendVerificationCodeDto {
    email: string;
}
export declare class VerifyCodeDto {
    email: string;
    code: string;
}
export declare class VerifyTokenDto {
    token: string;
}
export declare class SendPasswordResetDto {
    email: string;
}
export declare class VerifyPasswordResetCodeDto {
    email: string;
    code: string;
}
export declare class ResetPasswordDto {
    token: string;
    newPassword: string;
}
