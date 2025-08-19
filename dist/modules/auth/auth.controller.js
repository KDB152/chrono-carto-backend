"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const email_verification_service_1 = require("./email-verification.service");
const register_dto_1 = require("./dto/register.dto");
const login_dto_1 = require("./dto/login.dto");
const forgot_password_dto_1 = require("./dto/forgot-password.dto");
const verify_email_dto_1 = require("./dto/verify-email.dto");
let AuthController = AuthController_1 = class AuthController {
    constructor(authService, emailVerificationService) {
        this.authService = authService;
        this.emailVerificationService = emailVerificationService;
        this.logger = new common_1.Logger(AuthController_1.name);
    }
    async register(registerDto) {
        this.logger.log(`Tentative d'inscription pour: ${registerDto.email}`);
        try {
            const result = await this.authService.register(registerDto);
            this.logger.log(`Inscription réussie pour: ${registerDto.email}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Erreur lors de l'inscription pour ${registerDto.email}:`, error.message);
            throw error;
        }
    }
    async login(loginDto) {
        this.logger.log(`Tentative de login pour: ${loginDto.email}`);
        try {
            const result = await this.authService.login(loginDto);
            this.logger.log(`Login réussi pour: ${loginDto.email}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Erreur login pour ${loginDto.email}:`, error.message);
            throw error;
        }
    }
    async forgotPassword(forgotPasswordDto) {
        try {
            const { email } = forgotPasswordDto;
            const user = await this.authService.findUserByEmail(email);
            if (!user) {
                throw new common_1.HttpException({
                    message: "Cette adresse email n'est pas inscrite dans notre système",
                    error: "User not found"
                }, common_1.HttpStatus.NOT_FOUND);
            }
            await this.authService.sendResetPasswordEmail(email);
            return {
                success: true,
                message: "Un lien de réinitialisation a été envoyé à votre adresse email"
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            console.error('Erreur forgot-password:', error);
            throw new common_1.HttpException({
                message: "Erreur serveur lors de la demande de réinitialisation",
                error: "Internal server error"
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async sendVerificationCode(dto) {
        this.logger.log(`Demande de code de vérification pour: ${dto.email}`);
        try {
            const result = await this.emailVerificationService.sendVerificationCode(dto.email);
            this.logger.log(`Code de vérification envoyé avec succès pour: ${dto.email}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Erreur envoi code pour ${dto.email}:`, error.message);
            throw error;
        }
    }
    async verifyCode(dto) {
        this.logger.log(`Vérification de code pour: ${dto.email}, code: ${dto.code}`);
        try {
            const result = await this.emailVerificationService.verifyCode(dto.email, dto.code);
            this.logger.log(`Code vérifié avec succès pour: ${dto.email}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Erreur vérification code pour ${dto.email}:`, error.message);
            throw error;
        }
    }
    async sendVerificationLink(dto) {
        this.logger.log(`Demande de lien de vérification pour: ${dto.email}`);
        try {
            const result = await this.emailVerificationService.sendVerificationLink(dto.email);
            this.logger.log(`Lien de vérification envoyé avec succès pour: ${dto.email}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Erreur envoi lien pour ${dto.email}:`, error.message);
            throw error;
        }
    }
    async verifyToken(dto) {
        this.logger.log(`Vérification de token: ${dto.token.substring(0, 8)}...`);
        try {
            const result = await this.emailVerificationService.verifyToken(dto.token);
            this.logger.log(`Token vérifié avec succès`);
            return result;
        }
        catch (error) {
            this.logger.error(`Erreur vérification token:`, error.message);
            throw error;
        }
    }
    async sendPasswordResetCode(dto) {
        this.logger.log(`Demande de code de réinitialisation pour: ${dto.email}`);
        try {
            const result = await this.emailVerificationService.sendPasswordResetCode(dto.email);
            this.logger.log(`Code de réinitialisation traité pour: ${dto.email}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Erreur envoi code reset pour ${dto.email}:`, error.message);
            throw error;
        }
    }
    async verifyPasswordResetCode(dto) {
        this.logger.log(`Vérification code reset pour: ${dto.email}, code: ${dto.code}`);
        try {
            const result = await this.emailVerificationService.verifyPasswordResetCode(dto.email, dto.code);
            this.logger.log(`Code reset vérifié avec succès pour: ${dto.email}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Erreur vérification code reset pour ${dto.email}:`, error.message);
            throw error;
        }
    }
    async sendPasswordResetLink(dto) {
        this.logger.log(`Demande de lien de réinitialisation pour: ${dto.email}`);
        try {
            const result = await this.emailVerificationService.sendPasswordResetLink(dto.email);
            this.logger.log(`Lien de réinitialisation traité pour: ${dto.email}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Erreur envoi lien reset pour ${dto.email}:`, error.message);
            throw error;
        }
    }
    async resetPassword(dto) {
        this.logger.log(`Réinitialisation mot de passe avec token: ${dto.token.substring(0, 8)}...`);
        try {
            const result = await this.authService.resetPassword(dto.token, dto.newPassword);
            this.logger.log(`Mot de passe réinitialisé avec succès`);
            return result;
        }
        catch (error) {
            this.logger.error(`Erreur réinitialisation mot de passe:`, error.message);
            throw error;
        }
    }
    async testEmailConfig() {
        this.logger.log('Test de configuration email demandé');
        try {
            const testResult = await this.emailVerificationService['transporter'].verify();
            this.logger.log('Configuration email testée avec succès');
            return {
                success: true,
                message: 'Configuration email valide',
                config: {
                    user: process.env.EMAIL_USER,
                    frontendUrl: process.env.FRONTEND_URL
                }
            };
        }
        catch (error) {
            this.logger.error('Erreur test configuration email:', error.message);
            return {
                success: false,
                error: error.message,
                config: {
                    user: process.env.EMAIL_USER,
                    frontendUrl: process.env.FRONTEND_URL,
                    hasPassword: !!process.env.EMAIL_PASSWORD
                }
            };
        }
    }
    async sendTestEmail(dto) {
        this.logger.log(`Envoi d'email de test vers: ${dto.email}`);
        try {
            const transporter = this.emailVerificationService['transporter'];
            const mailOptions = {
                from: `"Chrono Carto Test" <${process.env.EMAIL_USER}>`,
                to: dto.email,
                subject: 'Test de configuration email - Chrono Carto',
                html: `
          <h2>Test de configuration email</h2>
          <p>Si vous recevez cet email, la configuration fonctionne correctement.</p>
          <p><strong>Configuration actuelle :</strong></p>
          <ul>
            <li>Email expéditeur: ${process.env.EMAIL_USER}</li>
            <li>URL Frontend: ${process.env.FRONTEND_URL}</li>
            <li>Timestamp: ${new Date().toISOString()}</li>
          </ul>
        `,
            };
            await transporter.sendMail(mailOptions);
            this.logger.log(`Email de test envoyé avec succès vers: ${dto.email}`);
            return {
                success: true,
                message: 'Email de test envoyé avec succès',
                details: {
                    to: dto.email,
                    from: process.env.EMAIL_USER,
                    timestamp: new Date().toISOString()
                }
            };
        }
        catch (error) {
            this.logger.error(`Erreur envoi email de test vers ${dto.email}:`, error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async verifyTokenGet(token, res) {
        this.logger.log(`Vérification GET token: ${token?.substring(0, 8)}...`);
        if (!token) {
            this.logger.warn('Aucun token fourni dans la requête');
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_token`);
        }
        try {
            const result = await this.emailVerificationService.verifyToken(token);
            this.logger.log(`Token vérifié avec succès pour email: ${result.email}`);
            return res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);
        }
        catch (error) {
            this.logger.error(`Erreur vérification token GET: ${error.message}`, error.stack);
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=verification_failed&message=${encodeURIComponent(error.message)}`);
        }
    }
    async checkEnvironment() {
        this.logger.log('Vérification des variables d\'environnement');
        const envCheck = {
            EMAIL_USER: !!process.env.EMAIL_USER,
            EMAIL_PASSWORD: !!process.env.EMAIL_PASSWORD,
            FRONTEND_URL: !!process.env.FRONTEND_URL,
            DB_HOST: !!process.env.DB_HOST,
            values: {
                EMAIL_USER: process.env.EMAIL_USER,
                FRONTEND_URL: process.env.FRONTEND_URL,
                NODE_ENV: process.env.NODE_ENV
            }
        };
        this.logger.log('Variables d\'environnement vérifiées:', envCheck);
        return envCheck;
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('send-verification-code'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_email_dto_1.SendVerificationCodeDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendVerificationCode", null);
__decorate([
    (0, common_1.Post)('verify-code'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_email_dto_1.VerifyCodeDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyCode", null);
__decorate([
    (0, common_1.Post)('send-verification-link'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_email_dto_1.SendVerificationCodeDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendVerificationLink", null);
__decorate([
    (0, common_1.Post)('verify-token'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_email_dto_1.VerifyTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyToken", null);
__decorate([
    (0, common_1.Post)('send-password-reset-code'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_email_dto_1.SendPasswordResetDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendPasswordResetCode", null);
__decorate([
    (0, common_1.Post)('verify-password-reset-code'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_email_dto_1.VerifyPasswordResetCodeDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyPasswordResetCode", null);
__decorate([
    (0, common_1.Post)('send-password-reset-link'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_email_dto_1.SendPasswordResetDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendPasswordResetLink", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_email_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Get)('debug/test-email-config'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "testEmailConfig", null);
__decorate([
    (0, common_1.Post)('debug/send-test-email'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendTestEmail", null);
__decorate([
    (0, common_1.Get)('verify-token'),
    __param(0, (0, common_1.Query)('token')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyTokenGet", null);
__decorate([
    (0, common_1.Get)('debug/env-check'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "checkEnvironment", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        email_verification_service_1.EmailVerificationService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map