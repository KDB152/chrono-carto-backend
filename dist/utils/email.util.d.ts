export declare function sendVerificationEmail(to: string, token: string): Promise<import("nodemailer/lib/smtp-transport").SentMessageInfo>;
export declare function sendPasswordResetEmail(to: string, token: string): Promise<import("nodemailer/lib/smtp-transport").SentMessageInfo>;
